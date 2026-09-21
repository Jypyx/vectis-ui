import { fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import { fr } from '../../i18n/fr'
import { registerMessages, setLocale } from '../../i18n/state'
import VCarousel from './VCarousel.vue'
import VCarouselItem from './VCarouselItem.vue'

/**
 * Harness: the v-model must be live (without a local ref the indicators would
 * change nothing) and the ref is returned so the emitted value can be asserted.
 *
 * Nothing here can observe layout: jsdom has no IntersectionObserver, no
 * scrolling and no computed styles. The sizing formula, the snapping, the
 * read-back and the effects are covered by the play functions.
 */
function mount(
  options: {
    /** Raw attributes set on <VCarousel>. Do NOT set `autoplay` here — see below. */
    attrs?: string
    /** Body of the default slot; three slides by default. */
    slides?: string
    initial?: number
    /**
     * Bound REACTIVELY, and returned, because the prop is the component's only stop
     * control now that it renders no pause button: a test has to be able to move it.
     */
    autoplay?: number
  } = {},
) {
  const model = ref<number>(options.initial ?? 0)
  const autoplay = ref<number>(options.autoplay ?? 0)
  const slides =
    options.slides ?? [0, 1, 2].map((i) => `<VCarouselItem>Slide ${i}</VCarouselItem>`).join('\n')

  const Harness = defineComponent({
    components: { VCarousel, VCarouselItem },
    setup: () => ({ model, autoplay }),
    template: `
      <VCarousel v-model="model" :autoplay="autoplay" ${options.attrs ?? ''}>
        ${slides}
      </VCarousel>
    `,
  })
  return { model, autoplay, ...render(Harness) }
}

const slidesOf = (container: Element) => [
  ...container.querySelectorAll<HTMLElement>('[data-carousel-index]'),
]
const indicatorsOf = (container: Element) => [
  ...container.querySelectorAll<HTMLButtonElement>('.v-carousel-indicator'),
]

/**
 * jsdom ships no IntersectionObserver, so the read-back is normally out of reach
 * here. This stub hands the callback back — and the ENTRIES it is handed are inert,
 * since the reading is positional: what a test stubs is the layout, through
 * `layout()` below. The callback is only the tick that makes the component take it.
 */
function stubIntersectionObserver() {
  let notify: ((entries: Partial<IntersectionObserverEntry>[]) => void) | undefined
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
        notify = callback
      }
      observe() {}
      disconnect() {}
    },
  )
  return (entries: Partial<IntersectionObserverEntry>[]) => notify?.(entries)
}

/**
 * The layout jsdom does not have. `measure()` reads slide RECTS, the port's own rect and
 * its client size — nothing else, `scrollWidth` deliberately included, since a running
 * animation inflates it — so stubbing those is enough to exercise the page arithmetic
 * outside a browser, which the ratio-based reading it replaces could never be. Slides are
 * laid out at `index * step`, the whole strip shifted back by `offset`: that IS a scroll
 * position.
 *
 * A slide is narrower than `step` by the gap, and the width is DERIVED from `scrollWidth`
 * rather than asked for, so the strip spans exactly the number a browser would report at
 * rest. `scrollWidth` is still stubbed, and a test can then inflate it ALONE — which is what
 * a running animation does to it — and watch the reading stay put.
 *
 * `configurable`, so one test can move the scroller and re-stub.
 */
function layout(
  container: Element,
  sizes: { step: number; offset: number; clientWidth: number; scrollWidth: number },
) {
  const port = container.querySelector('.v-carousel-viewport') as HTMLElement
  port.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect
  Object.defineProperty(port, 'clientWidth', { value: sizes.clientWidth, configurable: true })
  Object.defineProperty(port, 'scrollWidth', { value: sizes.scrollWidth, configurable: true })
  const slides = slidesOf(container)
  const width = sizes.scrollWidth - (slides.length - 1) * sizes.step
  slides.forEach((slide, index) => {
    const left = index * sizes.step - sizes.offset
    slide.getBoundingClientRect = () =>
      ({ left, right: left + width, top: 0, bottom: 0 }) as DOMRect
  })
  return port
}

afterEach(() => {
  setLocale('en-US')
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('VCarousel', () => {
  // The slides are read from the slot inside a computed, and `slots` is not reactive: a
  // parent passing a new slot whose list it captured outside the slot must still recount.
  it('recounts the slides when the parent hands down a new slot', async () => {
    const count = ref(2)
    const Parent = defineComponent(() => () => {
      const captured = count.value
      return h(
        VCarousel,
        { label: 'Gallery' },
        {
          default: () =>
            Array.from({ length: captured }, (_, i) =>
              h(VCarouselItem, { key: i }, () => `Slide ${i}`),
            ),
        },
      )
    })
    const { container } = render(Parent)
    expect(slidesOf(container)).toHaveLength(2)
    count.value = 4
    await nextTick()
    expect(slidesOf(container)).toHaveLength(4)
  })

  describe('slide count', () => {
    it('counts the slot VNodes, Fragments unwrapped and comments dropped', () => {
      const { container } = mount({
        slides: `
          <VCarouselItem v-for="i in 2" :key="i">A{{ i }}</VCarouselItem>
          <VCarouselItem v-if="false">never</VCarouselItem>
          <VCarouselItem>B</VCarouselItem>
        `,
      })
      const slides = slidesOf(container)
      expect(slides).toHaveLength(3)
      expect(slides.map((el) => el.dataset.carouselIndex)).toEqual(['0', '1', '2'])
      expect(slides[2]?.getAttribute('aria-label')).toBe('3 of 3')
      expect(indicatorsOf(container)).toHaveLength(3)
    })

    it('the index travels by prop, so the label is identical on server and client', () => {
      const { container } = mount()
      expect(slidesOf(container).map((el) => el.getAttribute('aria-label'))).toEqual([
        '1 of 3',
        '2 of 3',
        '3 of 3',
      ])
    })
  })

  describe('accessibility', () => {
    it('names the region and describes its role from the dictionary', () => {
      const { container } = mount()
      const root = container.querySelector('.v-carousel')
      expect(root?.getAttribute('role')).toBe('region')
      expect(root?.getAttribute('aria-roledescription')).toBe('carousel')
      expect(root?.getAttribute('aria-label')).toBe('Carousel')
    })

    it('the scroller is a named, TABBABLE group (scrollable-region-focusable)', () => {
      const { container } = mount()
      const port = container.querySelector('.v-carousel-viewport')
      expect(port?.getAttribute('tabindex')).toBe('0')
      expect(port?.getAttribute('role')).toBe('group')
      expect(port?.getAttribute('aria-label')).toBe('Slides')
    })

    it('each slide is a group with a slide roledescription', () => {
      const { container } = mount()
      const first = slidesOf(container)[0]
      expect(first?.getAttribute('role')).toBe('group')
      expect(first?.getAttribute('aria-roledescription')).toBe('slide')
    })

    it('aria-current marks the current indicator alone', async () => {
      const { container, model } = mount()
      expect(indicatorsOf(container).map((el) => el.getAttribute('aria-current'))).toEqual([
        'true',
        null,
        null,
      ])

      model.value = 2
      await nextTick()
      expect(indicatorsOf(container).map((el) => el.getAttribute('aria-current'))).toEqual([
        null,
        null,
        'true',
      ])
    })

    it('the live region announces the position at rest', () => {
      const { container } = mount({ initial: 1 })
      expect(container.querySelector('[role="status"]')?.textContent).toBe('2 of 3')
    })
  })

  describe('controls', () => {
    it('mirrors the arrows for RTL in horizontal only, the block axis never flipping', () => {
      const mirrorOf = (container: Element) =>
        [...container.querySelectorAll('.v-carousel-control .v-icon')].map((icon) =>
          icon.hasAttribute('data-mirror'),
        )
      expect(mirrorOf(mount().container)).toEqual([true, true])
      expect(mirrorOf(mount({ attrs: 'orientation="vertical"' }).container)).toEqual([false, false])
    })
  })

  describe('v-model', () => {
    it('an indicator selects its slide', async () => {
      const { container, model } = mount()
      await fireEvent.click(indicatorsOf(container)[2] as HTMLElement)
      expect(model.value).toBe(2)
    })

    it('the controls step by one and clamp at the ends', async () => {
      const { container, model } = mount({ initial: 1 })
      const [previous, next] = [
        ...container.querySelectorAll<HTMLButtonElement>('.v-carousel-control'),
      ]

      await fireEvent.click(next as HTMLElement)
      expect(model.value).toBe(2)

      await fireEvent.click(previous as HTMLElement)
      expect(model.value).toBe(1)
    })

    it('a model change does not throw where scrollBy does not exist (jsdom)', async () => {
      const { model } = mount()
      model.value = 2
      await nextTick()
      await nextTick()
      expect(model.value).toBe(2)
    })

    it('scrolls to the requested slide through rect deltas', async () => {
      const { container, model } = mount()
      const port = container.querySelector('.v-carousel-viewport') as HTMLElement
      const scrollBy = vi.fn()
      port.scrollBy = scrollBy
      const slide = slidesOf(container)[1] as HTMLElement
      slide.getBoundingClientRect = () => ({ left: 300, top: 0 }) as DOMRect
      port.getBoundingClientRect = () => ({ left: 20, top: 0 }) as DOMRect

      model.value = 1
      await nextTick()
      await nextTick()
      expect(scrollBy).toHaveBeenCalledWith({ left: 280, top: 0 })
    })
  })

  /*
   * A move of MORE than one page scrolls instantly and plays the effect once, instead of
   * sending every slide in between across the port. jsdom animates nothing, so what is
   * locked here is the two halves of the decision: the scroll option, and the pair of
   * attributes the sheet reads the one-shot from. The animation itself is a play function.
   */
  describe('jump', () => {
    const SIX = [0, 1, 2, 3, 4, 5]
      .map((i) => `<VCarouselItem>Slide ${i}</VCarouselItem>`)
      .join('\n')

    /** Six slides 300px apart, the scroller resting on page `page`. */
    const at = (container: Element, page: number) =>
      layout(container, { step: 300, offset: page * 300, clientWidth: 300, scrollWidth: 1800 })

    it('cuts the travel beyond one page and keeps it for a step', async () => {
      const { container, model } = mount({ slides: SIX })
      const scrollBy = vi.fn()
      at(container, 0).scrollBy = scrollBy

      await fireEvent.click(indicatorsOf(container)[5] as HTMLElement)
      await nextTick()
      expect(scrollBy).toHaveBeenCalledWith({ left: 1500, top: 0, behavior: 'instant' })

      scrollBy.mockClear()
      at(container, 5)
      model.value = 4
      await nextTick()
      await nextTick()
      // One page back: the travel IS the transition, so no `behavior` and CSS governs.
      expect(scrollBy).toHaveBeenCalledWith({ left: -300, top: 0 })
    })

    /*
     * The parity is the restart mechanism, not decoration: a CSS animation restarts on a
     * change of `animation-name` and on nothing else, so two jumps in a row must not leave
     * the same value on the attribute — the second would play nothing.
     */
    it('alternates the one-shot phase and signs its direction', async () => {
      const { container } = mount({ slides: SIX })
      at(container, 0).scrollBy = vi.fn()
      const root = container.querySelector('.v-carousel') as HTMLElement
      expect(root.hasAttribute('data-jump')).toBe(false)

      await fireEvent.click(indicatorsOf(container)[5] as HTMLElement)
      await nextTick()
      const first = root.getAttribute('data-jump')
      expect(first).toBeTruthy()
      expect(root.style.getPropertyValue('--carousel-jump-dir')).toBe('1')

      at(container, 5)
      await fireEvent.click(indicatorsOf(container)[0] as HTMLElement)
      await nextTick()
      expect(root.getAttribute('data-jump')).not.toBe(first)
      // Backwards, so a `slide` one-shot enters from the side the track rewinds towards.
      expect(root.style.getPropertyValue('--carousel-jump-dir')).toBe('-1')
    })

    // A wrap is a jump like any other, and the widest move the component ever makes.
    it('cuts a loop wrap, whatever asked for it', async () => {
      const { container } = mount({ slides: SIX, attrs: 'loop', initial: 5 })
      const scrollBy = vi.fn()
      at(container, 5).scrollBy = scrollBy
      const next = container.querySelectorAll<HTMLButtonElement>('.v-carousel-control')[1]

      await fireEvent.click(next as HTMLElement)
      await nextTick()
      expect(scrollBy).toHaveBeenCalledWith({ left: -1500, top: 0, behavior: 'instant' })
    })

    // The step the arrows make outside a wrap is the one move that keeps its travel.
    it('leaves a control step alone', async () => {
      const { container } = mount({ slides: SIX, initial: 2 })
      const scrollBy = vi.fn()
      at(container, 2).scrollBy = scrollBy
      const next = container.querySelectorAll<HTMLButtonElement>('.v-carousel-control')[1]

      await fireEvent.click(next as HTMLElement)
      await nextTick()
      expect(scrollBy).toHaveBeenCalledWith({ left: 300, top: 0 })
    })

    /*
     * `noJump` is a single term in the same condition, so it covers every route at once —
     * and it must take the ONE-SHOT with it, which is what the absent attribute locks: an
     * arrival animation played over a travel still in flight would hold a slide at its own
     * value while the scroller was several pages from where the animation says it is.
     */
    it('`noJump` gives every route its travel back, the wrap included', async () => {
      const { container } = mount({ slides: SIX, attrs: 'no-jump loop', initial: 5 })
      const scrollBy = vi.fn()
      at(container, 5).scrollBy = scrollBy
      const root = container.querySelector('.v-carousel') as HTMLElement

      await fireEvent.click(indicatorsOf(container)[0] as HTMLElement)
      await nextTick()
      expect(scrollBy).toHaveBeenCalledWith({ left: -1500, top: 0 })
      expect(root.hasAttribute('data-jump')).toBe(false)

      // And the wrap, which has the widest delta of all: `previous` on the first page.
      scrollBy.mockClear()
      at(container, 0)
      await fireEvent.click(container.querySelector('.v-carousel-control') as HTMLElement)
      await nextTick()
      expect(scrollBy).toHaveBeenCalledWith({ left: 1500, top: 0 })
      expect(root.hasAttribute('data-jump')).toBe(false)
    })

    /*
     * The touch-drag saccade. The read-back writes the model on every frame of a drag, and
     * without the guard each write comes back as a programmatic scroll FIGHTING the finger:
     * the scroller jumps to the slide just named, the release snaps it again, one gesture
     * plays two animations. The scroller is already there, so model → DOM has nothing to do.
     */
    it('a read-back write does not come back as a programmatic scroll', async () => {
      const notify = stubIntersectionObserver()
      const { container, model } = mount()
      await nextTick()

      /*
       * 260px of a 300px step travelled — MID-DRAG on purpose, which is also what the
       * bug above is about. At a snap position `scrollToIndex`'s own "already there"
       * test would return before the flag was ever consulted, and this would pass
       * green without it.
       */
      const port = layout(container, { step: 300, offset: 260, clientWidth: 300, scrollWidth: 900 })
      const scrollBy = vi.fn()
      port.scrollBy = scrollBy

      notify([{ target: slidesOf(container)[1] as Element, intersectionRatio: 1 }])
      await nextTick()
      await nextTick()

      expect(model.value).toBe(1)
      expect(scrollBy).not.toHaveBeenCalled()
    })
  })

  /*
   * The MEASURED count, which the prop fallback below only stands in for. It is testable
   * here because the reading is POSITIONAL: every number `measure()` takes is stubbable, so
   * geometries a ratio-based reading could only exercise in a browser — a peek, an active
   * floor — are locked in jsdom. The play functions verify a real browser produces them.
   */
  describe('measured pages', () => {
    const six = [0, 1, 2, 3, 4, 5].map((i) => `<VCarouselItem>S${i}</VCarouselItem>`).join('\n')

    /*
     * The reported bug: 6 slides two at a time with a 64px peek. The last START-aligned
     * position is 3, `step - peek` short of the end of the track, so the sixth slide
     * was never fully revealed and no control could ask for it. The end of the track is
     * the fifth page, and the slide LEADING there is the fifth.
     */
    it('mints the end of the track as a page when a peek leaves a leftover', async () => {
      const { container, model } = mount({
        attrs: ':items-per-view="2" :peek="64"',
        slides: six,
      })
      const port = layout(container, {
        step: 294,
        offset: 1112,
        clientWidth: 640,
        scrollWidth: 1752,
      })
      await fireEvent(port, new Event('scrollend'))
      await nextTick()

      expect(indicatorsOf(container).map((el) => el.getAttribute('aria-label'))).toEqual([
        '1 of 6',
        '2 of 6',
        '3 of 6',
        '4 of 6',
        '5 of 6',
      ])
      expect(model.value).toBe(4)
    })

    /*
     * A scroller's scrollable overflow takes in the TRANSFORMED boxes of its descendants,
     * and only towards the END edge, so anything animating a translate inside a slide
     * inflates `scrollWidth` for as long as it runs — the jump one-shot in its `slide` form
     * being the case that reported it. A measurement taken in that window minted a page, and
     * nothing re-measures once an animation is over, so the phantom dot stayed for good. The
     * count comes from the slide rects, which are never transformed.
     */
    it('ignores an inflated scrollWidth, which a running animation produces', async () => {
      const { container } = mount({ attrs: ':items-per-view="3"', slides: six })
      const port = layout(container, { step: 300, offset: 0, clientWidth: 900, scrollWidth: 1800 })
      await fireEvent(port, new Event('scrollend'))
      await nextTick()
      expect(indicatorsOf(container)).toHaveLength(4)

      // A tenth of a slide, which is what the `slide` one-shot translates by.
      Object.defineProperty(port, 'scrollWidth', { value: 1830, configurable: true })
      await fireEvent(port, new Event('scrollend'))
      await nextTick()
      expect(indicatorsOf(container)).toHaveLength(4)
    })

    it('replaces the prop fallback where an active floor makes it over-count', async () => {
      const { container } = mount({
        attrs: ':items-per-view="4" item-min-size="10rem"',
        slides: six,
      })
      // The fallback says 6 - 4 + 1 = 3; only three slides actually fit.
      expect(indicatorsOf(container)).toHaveLength(3)

      const port = layout(container, { step: 172, offset: 0, clientWidth: 384, scrollWidth: 1020 })
      await fireEvent(port, new Event('scrollend'))
      await nextTick()
      expect(indicatorsOf(container)).toHaveLength(5)
    })

    /*
     * `scrollWidth` and `clientWidth` are integers where the flex layout is fractional,
     * so an exactly flush track can measure a pixel long. Minting a page there would
     * hand out a dot that scrolls by nothing — and would make the count depend on the
     * canvas width, which is the `Pages` play function going flaky.
     */
    it('a sub-pixel leftover mints nothing', async () => {
      const { container } = mount({ attrs: ':items-per-view="3"', slides: six })
      const port = layout(container, { step: 300, offset: 0, clientWidth: 900, scrollWidth: 1801 })
      await fireEvent(port, new Event('scrollend'))
      await nextTick()
      expect(indicatorsOf(container)).toHaveLength(4)
    })

    /*
     * The backward case, and the reason `scrollend` measures at all. With a peek the
     * outgoing slide never stops being fully visible, so the observer's last delivery is a
     * MID-FLIGHT one naming the page being left. Lowering the guard without measuring sends
     * that stale reading into the model while `readBack` suppresses the correcting scroll,
     * and the dot sits one page ahead of the content for good.
     */
    it('scrollend re-measures at the arrival position, so a stale reading never lands', async () => {
      const notify = stubIntersectionObserver()
      const { container, model } = mount({
        attrs: ':items-per-view="2" :peek="64"',
        slides: six,
        initial: 4,
      })
      await nextTick()
      const port = layout(container, {
        step: 294,
        offset: 1112,
        clientWidth: 640,
        scrollWidth: 1752,
      })
      port.scrollBy = vi.fn()

      // Asking for page 3 from the end of the track raises the guard…
      model.value = 3
      await nextTick()
      await nextTick()

      // …the observer fires MID-FLIGHT, where the scroller is still nearer page 4…
      layout(container, { step: 294, offset: 1050, clientWidth: 640, scrollWidth: 1752 })
      notify([{ target: slidesOf(container)[4] as Element, intersectionRatio: 1 }])
      await nextTick()
      expect(model.value).toBe(3)

      // …and the ARRIVAL is what `scrollend` reads, not that last delivery.
      layout(container, { step: 294, offset: 882, clientWidth: 640, scrollWidth: 1752 })
      await fireEvent(port, new Event('scrollend'))
      await nextTick()
      expect(model.value).toBe(3)
    })
  })

  /*
   * `pageCount` falls back to a pure function of the props with no layout, so this is
   * the one place the multi-item arithmetic is testable at all. In the browser it is
   * measured off the scroller — see the `Pages` and `Peek` play functions.
   */
  describe('pages', () => {
    const six = [0, 1, 2, 3, 4, 5].map((i) => `<VCarouselItem>S${i}</VCarouselItem>`).join('\n')

    it('renders one indicator per REACHABLE position, not one per slide', () => {
      const { container } = mount({ attrs: ':items-per-view="3"', slides: six })
      // 6 slides three at a time: the scroller can only lead with 1 to 4
      expect(indicatorsOf(container).map((el) => el.getAttribute('aria-label'))).toEqual([
        '1 of 6',
        '2 of 6',
        '3 of 6',
        '4 of 6',
      ])
    })

    it('next and End clamp to the last PAGE, not to the last slide', async () => {
      const { container, model } = mount({
        attrs: ':items-per-view="3"',
        slides: six,
        initial: 3,
      })
      const next = container.querySelectorAll<HTMLButtonElement>('.v-carousel-control')[1]
      expect(next?.disabled).toBe(true)

      const port = container.querySelector('.v-carousel-viewport') as HTMLElement
      await fireEvent.keyDown(port, { key: 'End' })
      expect(model.value).toBe(3)
    })

    it('autoplay stops on the last page', async () => {
      vi.useFakeTimers()
      const { model } = mount({
        attrs: ':items-per-view="3"',
        autoplay: 1000,
        slides: six,
      })
      // One tick per step: the timer is re-armed by a watcher, which
      // `advanceTimersByTime` does not flush on its own.
      for (let step = 0; step < 6; step += 1) {
        vi.advanceTimersByTime(1000)
        await nextTick()
      }
      // 6 slides three at a time: it stops on the last PAGE, not the last slide
      expect(model.value).toBe(3)
    })

    it('itemsPerView beyond the slide count leaves a single page', () => {
      const { container } = mount({ attrs: ':items-per-view="6"' })
      expect(indicatorsOf(container)).toHaveLength(1)
      const controls = [...container.querySelectorAll<HTMLButtonElement>('.v-carousel-control')]
      expect(controls.every((el) => el.disabled)).toBe(true)
    })

    it('an empty carousel renders no indicator', () => {
      const { container } = mount({ slides: '' })
      expect(indicatorsOf(container)).toHaveLength(0)
    })
  })

  describe('ends, derived from the model and the page count', () => {
    it('falls back to the model, so the controls are already right in SSR', async () => {
      const { container, model } = mount()
      const [previous, next] = [
        ...container.querySelectorAll<HTMLButtonElement>('.v-carousel-control'),
      ]
      expect(previous?.disabled).toBe(true)
      expect(next?.disabled).toBe(false)

      model.value = 2
      await nextTick()
      expect(previous?.disabled).toBe(false)
      expect(next?.disabled).toBe(true)
    })
  })

  describe('loop', () => {
    const controlsOf = (container: Element) => [
      ...container.querySelectorAll<HTMLButtonElement>('.v-carousel-control'),
    ]

    it('comes back round in both directions, past either end', async () => {
      const { container, model } = mount({ attrs: 'loop', initial: 2 })
      const [previous, next] = controlsOf(container)

      // 3 slides one at a time: page 2 is the last, and the next one is the first
      await fireEvent.click(next!)
      expect(model.value).toBe(0)

      // and back the other way, which is the case a single `%` would send to -1
      await fireEvent.click(previous!)
      expect(model.value).toBe(2)
    })

    it('leaves neither control disabled, there being no end to reach', async () => {
      const { container, model } = mount({ attrs: 'loop' })
      expect(controlsOf(container).map((el) => el.disabled)).toEqual([false, false])

      model.value = 2
      await nextTick()
      expect(controlsOf(container).map((el) => el.disabled)).toEqual([false, false])
    })

    /*
     * The `pageCount > 1` guard. Enabled buttons that move nothing would be worse than
     * the disabled pair, and the modulo would be dividing by a page count of zero one
     * slide further down.
     */
    it('stays inert, and the controls disabled, below two positions', async () => {
      const { container, model } = mount({ attrs: 'loop :items-per-view="6"' })
      expect(controlsOf(container).every((el) => el.disabled)).toBe(true)

      await fireEvent.click(controlsOf(container)[1]!)
      expect(model.value).toBe(0)
    })

    it('renders no indicator, and never divides by zero, with no slide at all', () => {
      const { container, model } = mount({ attrs: 'loop', slides: '' })
      expect(indicatorsOf(container)).toHaveLength(0)
      expect(model.value).toBe(0)
    })

    // The arrows step, so they wrap; Home and End NAME a position, so they do not.
    it('wraps the arrow keys but leaves Home and End absolute', async () => {
      const { container, model } = mount({ attrs: 'loop', initial: 2 })
      const port = container.querySelector('.v-carousel-viewport') as HTMLElement

      await fireEvent.keyDown(port, { key: 'ArrowRight' })
      expect(model.value).toBe(0)

      await fireEvent.keyDown(port, { key: 'ArrowLeft' })
      expect(model.value).toBe(2)

      await fireEvent.keyDown(port, { key: 'End' })
      expect(model.value).toBe(2)

      await fireEvent.keyDown(port, { key: 'Home' })
      expect(model.value).toBe(0)
      await fireEvent.keyDown(port, { key: 'Home' })
      expect(model.value).toBe(0)
    })

    /*
     * The mirror of `autoplay › advances on the interval and stops at the last slide`,
     * and it needs no code of its own: `rotating` reads `atEnd`, which looping makes
     * permanently false. What this locks is that the timer keeps being RE-ARMED past
     * the end rather than firing once and stopping.
     */
    it('keeps autoplay rotating past the last page', async () => {
      vi.useFakeTimers()
      const { model } = mount({ attrs: 'loop', autoplay: 1000 })

      for (const expected of [1, 2, 0, 1]) {
        vi.advanceTimersByTime(1000)
        await nextTick()
        expect(model.value).toBe(expected)
      }
    })
  })

  describe('autoplay', () => {
    it('advances on the interval and stops at the last slide (no loop)', async () => {
      vi.useFakeTimers()
      const { model } = mount({ autoplay: 1000 })

      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(model.value).toBe(1)

      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(model.value).toBe(2)

      vi.advanceTimersByTime(5000)
      await nextTick()
      expect(model.value).toBe(2)
    })

    it('arms nothing at 0 (the synchronous-useTimer guard)', () => {
      vi.useFakeTimers()
      const { model } = mount({ autoplay: 0 })
      vi.advanceTimersByTime(10_000)
      expect(model.value).toBe(0)
    })

    it('renders no pause control of its own', () => {
      const { container } = mount({ autoplay: 1000 })
      // previous and next, and nothing else
      expect(container.querySelectorAll('.v-carousel-stage button')).toHaveLength(2)
    })

    /*
     * The prop IS the stop control, and it is the only one the component offers now
     * that no button is rendered: a consumer builds their own by binding it, so the
     * reactivity has to be locked here.
     */
    it('binding autoplay back to 0 cancels the timer on the spot', async () => {
      vi.useFakeTimers()
      const { model, autoplay } = mount({ autoplay: 1000 })

      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(model.value).toBe(1)

      autoplay.value = 0
      await nextTick()
      vi.advanceTimersByTime(10_000)
      await nextTick()
      expect(model.value).toBe(1)
    })

    it('pauses on hover, and resumes when the pointer leaves', async () => {
      vi.useFakeTimers()
      const { container, model } = mount({ autoplay: 1000 })
      const root = container.querySelector('.v-carousel') as HTMLElement

      await fireEvent.pointerEnter(root)
      vi.advanceTimersByTime(5000)
      await nextTick()
      expect(model.value).toBe(0)

      await fireEvent.pointerLeave(root)
      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(model.value).toBe(1)
    })

    /*
     * `matches` is stubbed on both sides rather than trusted: whether jsdom's selector
     * engine knows `:focus-visible` is not what these two lock — what they lock is that
     * the component ASKS, and branches on the answer. `focusin` bubbles, so dispatching
     * on the element is what gives the root handler the right `event.target`.
     */
    it('pauses on KEYBOARD focus, and resumes when focus leaves', async () => {
      vi.useFakeTimers()
      const { container, model } = mount({ autoplay: 1000 })
      const root = container.querySelector('.v-carousel') as HTMLElement
      const port = container.querySelector('.v-carousel-viewport') as HTMLElement
      port.matches = () => true

      await fireEvent.focusIn(port)
      vi.advanceTimersByTime(5000)
      await nextTick()
      expect(model.value).toBe(0)

      await fireEvent.focusOut(root)
      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(model.value).toBe(1)
    })

    /*
     * The regression: a POINTER click leaves the focus on the control it hit, so a
     * plain `focusin` flag pinned the pause until the user clicked somewhere outside
     * the carousel entirely — long after the pointer had left.
     */
    it('a pointer click on a control does not pin the pause', async () => {
      vi.useFakeTimers()
      const { container, model } = mount({ autoplay: 1000 })
      const next = container.querySelectorAll<HTMLButtonElement>('.v-carousel-control')[1]!
      next.matches = () => false

      await fireEvent.focusIn(next)
      vi.advanceTimersByTime(1000)
      await nextTick()
      // still rotating: the focus sits on the button, but the user is not on the keyboard
      expect(model.value).toBe(1)
    })

    it('the live region stays silent while it rotates', () => {
      vi.useFakeTimers()
      const { container } = mount({ autoplay: 1000 })
      expect(container.querySelector('[role="status"]')?.getAttribute('aria-live')).toBe('off')
    })
  })

  /*
   * The placement itself is CSS and needs a browser (see the `ControlsCentring` and
   * `ControlsOutside` play functions). What jsdom CAN lock is the nesting the CSS
   * rests on — and that is the cheap layer for it.
   */
  describe('layout structure', () => {
    it('the indicator bar is a SIBLING of the stage, never a child of it', () => {
      const { container } = mount({ attrs: 'indicators="outside"' })
      const root = container.querySelector('.v-carousel')
      const stage = container.querySelector('.v-carousel-stage') as HTMLElement
      const bar = container.querySelector('.v-carousel-indicators') as HTMLElement
      // inside the stage it would join the height the controls are centred on
      expect(stage.contains(bar)).toBe(false)
      expect(bar.parentElement).toBe(root)
    })

    it('the controls stay inside the stage, with the viewport', () => {
      const { container } = mount()
      const stage = container.querySelector('.v-carousel-stage') as HTMLElement
      expect(stage.querySelector('.v-carousel-controls')).not.toBeNull()
      expect(stage.querySelector('.v-carousel-viewport')).not.toBeNull()
    })

    it('mirrors controlsVisibility unconditionally, `always` by default', () => {
      const visibility = (attrs?: string) =>
        mount({ attrs })
          .container.querySelector('.v-carousel')
          ?.getAttribute('data-controls-visibility')
      expect(visibility()).toBe('always')
      expect(visibility('controls-visibility="hover"')).toBe('hover')
    })
  })

  describe('props', () => {
    it('carries the sizing variables inline and omits the ones left undefined', () => {
      const { container } = mount({ attrs: ':items-per-view="3" item-min-size="16rem" :peek="40"' })
      const style = container.querySelector<HTMLElement>('.v-carousel')?.style
      expect(style?.getPropertyValue('--carousel-per-view')).toBe('3')
      // free unit for a string, px for a number — the `cssSize` contract
      expect(style?.getPropertyValue('--carousel-item-min')).toBe('16rem')
      expect(style?.getPropertyValue('--carousel-peek')).toBe('40px')
      expect(style?.getPropertyValue('--carousel-gap')).toBe('')
    })

    it('mirrors orientation and effect on the root', () => {
      const { container } = mount({ attrs: 'orientation="vertical" effect="scale" height="20rem"' })
      const root = container.querySelector('.v-carousel')
      expect(root?.getAttribute('data-orientation')).toBe('vertical')
      expect(root?.getAttribute('data-effect')).toBe('scale')
    })

    it('`false` removes the controls and the indicators, attribute included', () => {
      const { container } = mount({ attrs: ':controls="false" :indicators="false"' })
      const root = container.querySelector('.v-carousel')
      expect(root?.hasAttribute('data-controls')).toBe(false)
      expect(container.querySelector('.v-carousel-indicators')).toBeNull()
      expect(container.querySelector('.v-carousel-control')).toBeNull()
    })

    it('downgrades `fade` to `slide` where it would pile the slides up', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { container } = mount({ attrs: 'effect="fade" :items-per-view="3"' })
      expect(container.querySelector('.v-carousel')?.getAttribute('data-effect')).toBe('slide')
      warn.mockRestore()
    })

    // The sizing formula collapses exactly to the peekless one at zero, so a zero peek
    // must neither cost the effect nor warn.
    // Same count, other keys: Vue mounts new slide elements, and an observer left on the
    // detached ones never fires again.
    it('re-observes the slides when they are replaced by as many new ones', async () => {
      const observed: Element[][] = []
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          elements: Element[] = []
          constructor() {
            observed.push(this.elements)
          }
          observe(el: Element) {
            this.elements.push(el)
          }
          disconnect() {}
        },
      )
      const items = ref(['a', 'b', 'c'])
      const { container } = render(VCarousel, {
        props: { label: 'Replaced' },
        slots: {
          default: () => items.value.map((item) => h(VCarouselItem, { key: item }, () => item)),
        },
      })
      await nextTick()

      items.value = ['d', 'e', 'f']
      await nextTick()
      await nextTick()
      const current = slidesOf(container)
      expect(current.map((slide) => slide.textContent?.trim())).toEqual(['d', 'e', 'f'])
      expect(observed.at(-1)).toEqual(current)
    })

    it('keeps `fade` with a peek of zero, and downgrades it with a real one', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      for (const peek of [':peek="0"', 'peek="0px"']) {
        const { container, unmount } = mount({ attrs: `effect="fade" ${peek}` })
        expect(container.querySelector('.v-carousel')?.getAttribute('data-effect')).toBe('fade')
        unmount()
      }
      expect(warn).not.toHaveBeenCalled()

      const { container } = mount({ attrs: 'effect="fade" :peek="40"' })
      expect(container.querySelector('.v-carousel')?.getAttribute('data-effect')).toBe('slide')
      warn.mockRestore()
    })
  })

  describe('content and fallthrough', () => {
    it('class and attributes land on the root, the consumer aria-label wins', () => {
      const { container } = mount({
        attrs: 'class="custom" data-testid="carrousel" aria-label="Promos"',
      })
      const root = container.querySelector('.v-carousel')
      expect(root?.classList.contains('custom')).toBe(true)
      expect(root?.getAttribute('data-testid')).toBe('carrousel')
      expect(root?.getAttribute('aria-label')).toBe('Promos')
    })

    it('aria-labelledby removes the name rather than doubling it', () => {
      const { container } = mount({ attrs: 'aria-labelledby="heading"' })
      const root = container.querySelector('.v-carousel')
      expect(root?.hasAttribute('aria-label')).toBe(false)
      expect(root?.getAttribute('aria-labelledby')).toBe('heading')
    })

    it('renders the slide content', () => {
      const { container } = mount()
      expect(slidesOf(container)[0]?.textContent).toContain('Slide 0')
    })
  })

  describe('i18n', () => {
    it('follows the locale for the labels and the roledescriptions', async () => {
      registerMessages('fr', fr)
      setLocale('fr-FR')
      const { container } = mount({ initial: 1 })
      await nextTick()

      const root = container.querySelector('.v-carousel')
      expect(root?.getAttribute('aria-label')).toBe('Carrousel')
      expect(root?.getAttribute('aria-roledescription')).toBe('carrousel')
      expect(slidesOf(container)[1]?.getAttribute('aria-label')).toBe('2 sur 3')
      expect(slidesOf(container)[1]?.getAttribute('aria-roledescription')).toBe('diapositive')
      expect(container.querySelector('.v-carousel-control')?.getAttribute('aria-label')).toBe(
        'Diapositive précédente',
      )
    })
  })

  describe('robustness', () => {
    it('leaves the keys of the content of a slide alone', async () => {
      const { container, model } = mount({
        slides:
          '<VCarouselItem><input value="abc" /></VCarouselItem><VCarouselItem>B</VCarouselItem>',
      })
      const input = container.querySelector('input') as HTMLInputElement
      const right = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      })
      input.dispatchEvent(right)
      const end = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
      input.dispatchEvent(end)
      await nextTick()
      expect(right.defaultPrevented).toBe(false)
      expect(end.defaultPrevented).toBe(false)
      expect(model.value).toBe(0)
    })

    it('still takes the arrows on the viewport itself', async () => {
      const { container, model } = mount()
      const port = container.querySelector('.v-carousel-viewport') as HTMLElement
      await fireEvent.keyDown(port, { key: 'ArrowRight' })
      expect(model.value).toBe(1)
    })

    it('reads its own slides only, never those of a nested carousel', async () => {
      const { container, model } = mount({
        slides: `
          <VCarouselItem><VCarousel label="Inner"><VCarouselItem>i0</VCarouselItem><VCarouselItem>i1</VCarouselItem></VCarousel></VCarouselItem>
          <VCarouselItem>B</VCarouselItem>`,
      })
      const port = container.querySelector('.v-carousel-viewport') as HTMLElement
      const scrollBy = vi.fn()
      port.scrollBy = scrollBy
      port.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect
      const inner = container.querySelectorAll(
        '.v-carousel .v-carousel [data-carousel-index="1"]',
      )[0] as HTMLElement
      inner.getBoundingClientRect = () => ({ left: 50, top: 0 }) as DOMRect
      const outer = port.querySelector(':scope > [data-carousel-index="1"]') as HTMLElement
      outer.getBoundingClientRect = () => ({ left: 400, top: 0 }) as DOMRect

      model.value = 1
      await nextTick()
      await nextTick()
      expect(scrollBy).toHaveBeenCalledWith({ left: 400, top: 0 })
    })

    it('clamps a model the parent sets outside the pages', async () => {
      const { model } = mount({ initial: 7 })
      await nextTick()
      expect(model.value).toBe(2)
      model.value = -3
      await nextTick()
      await nextTick()
      expect(model.value).toBe(0)
    })

    it('hands the focus on when a control disables itself under it', async () => {
      const { container } = mount({ initial: 1 })
      const [previous, next] = [
        ...container.querySelectorAll<HTMLButtonElement>('.v-carousel-control'),
      ]
      next?.focus()
      await fireEvent.click(next as HTMLElement)
      await nextTick()
      expect(next?.disabled).toBe(true)
      expect(document.activeElement).toBe(previous)

      await fireEvent.click(previous as HTMLElement)
      await fireEvent.click(previous as HTMLElement)
      await nextTick()
      expect(previous?.disabled).toBe(true)
      expect(document.activeElement).toBe(next)
    })

    it('arms no autoplay timer on the server', async () => {
      const { createSSRApp } = await import('vue')
      const { renderToString } = await import('vue/server-renderer')
      const timeout = vi.spyOn(globalThis, 'setTimeout')
      const app = createSSRApp({
        components: { VCarousel, VCarouselItem },
        template:
          '<VCarousel :autoplay="3000"><VCarouselItem>A</VCarouselItem><VCarouselItem>B</VCarouselItem></VCarousel>',
      })
      await renderToString(app)
      expect(timeout.mock.calls.filter(([, delay]) => delay === 3000)).toHaveLength(0)
      timeout.mockRestore()
    })

    it('reads its slot inside the render only (no Vue warning)', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      render(
        defineComponent(
          () => () =>
            h(VCarousel, { label: 'G' }, { default: () => [h(VCarouselItem, () => 'A')] }),
        ),
      )
      expect(warn.mock.calls.flat().join(' ')).not.toMatch(/outside of the render function/)
      warn.mockRestore()
    })

    it('keeps the live text still on hover and silences it while rotating', async () => {
      vi.useFakeTimers()
      const { container } = mount({ autoplay: 1000 })
      const status = container.querySelector('[role="status"]') as HTMLElement
      await nextTick()
      expect(status.getAttribute('aria-live')).toBe('off')
      const before = status.textContent
      await fireEvent.pointerEnter(container.querySelector('.v-carousel') as HTMLElement)
      expect(status.textContent).toBe(before)
      expect(status.getAttribute('aria-live')).toBe('polite')
    })

    it('gives each dev warning once, however often the props move', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { autoplay } = mount({ attrs: 'loop', autoplay: 5000 })
      autoplay.value = 0
      await nextTick()
      autoplay.value = 5000
      await nextTick()
      expect(warn.mock.calls.filter(([m]) => String(m).includes('WCAG 2.2.2'))).toHaveLength(1)
      warn.mockRestore()
    })

    it('drops the jump one-shot once it has played', async () => {
      const { container } = mount()
      const root = container.querySelector('.v-carousel') as HTMLElement
      layout(container, { step: 300, offset: 0, clientWidth: 300, scrollWidth: 900 }).scrollBy =
        vi.fn()
      await fireEvent.click(indicatorsOf(container)[2] as HTMLElement)
      await nextTick()
      expect(root.dataset.jump).toBeDefined()
      const effect = container.querySelector('.v-carousel-effect') as HTMLElement
      const ended = new Event('animationend', { bubbles: true }) as Event & {
        animationName: string
      }
      Object.defineProperty(ended, 'animationName', { value: 'v-carousel-jump-a' })
      effect.dispatchEvent(ended)
      await nextTick()
      expect(root.dataset.jump).toBeUndefined()
    })
  })
})
