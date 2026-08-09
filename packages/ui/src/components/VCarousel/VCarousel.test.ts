import { fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

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
    /** Raw attributes set on <VCarousel>. */
    attrs?: string
    /** Body of the default slot; three slides by default. */
    slides?: string
    initial?: number
  } = {},
) {
  const model = ref<number>(options.initial ?? 0)
  const slides =
    options.slides ?? [0, 1, 2].map((i) => `<VCarouselItem>Slide ${i}</VCarouselItem>`).join('\n')

  const Harness = defineComponent({
    components: { VCarousel, VCarouselItem },
    setup: () => ({ model }),
    template: `
      <VCarousel v-model="model" ${options.attrs ?? ''}>
        ${slides}
      </VCarousel>
    `,
  })
  return { model, ...render(Harness) }
}

const slidesOf = (container: Element) => [
  ...container.querySelectorAll<HTMLElement>('[data-carousel-index]'),
]
const indicatorsOf = (container: Element) => [
  ...container.querySelectorAll<HTMLButtonElement>('.v-carousel-indicator'),
]

afterEach(() => {
  setLocale('en-US')
  vi.useRealTimers()
})

describe('VCarousel', () => {
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

  describe('ends without an observer', () => {
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

  describe('autoplay', () => {
    it('advances on the interval and stops at the last slide (no loop)', async () => {
      vi.useFakeTimers()
      const { model } = mount({ attrs: ':autoplay="1000"' })

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

    it('renders no control and arms nothing at 0 (the synchronous-useTimer guard)', () => {
      vi.useFakeTimers()
      const { container, model } = mount({ attrs: ':autoplay="0"' })
      expect(container.querySelector('.v-carousel-autoplay')).toBeNull()
      vi.advanceTimersByTime(10_000)
      expect(model.value).toBe(0)
    })

    it('the pause control freezes it and its LABEL carries the state', async () => {
      vi.useFakeTimers()
      const { container, model } = mount({ attrs: ':autoplay="1000"' })
      const toggle = container.querySelector('.v-carousel-autoplay') as HTMLButtonElement
      expect(toggle.getAttribute('aria-label')).toBe('Stop automatic slide show')
      expect(toggle.hasAttribute('aria-pressed')).toBe(false)

      await fireEvent.click(toggle)
      expect(toggle.getAttribute('aria-label')).toBe('Start automatic slide show')

      vi.advanceTimersByTime(5000)
      await nextTick()
      expect(model.value).toBe(0)
    })

    it('pauses on hover and on focus-within', async () => {
      vi.useFakeTimers()
      const { container, model } = mount({ attrs: ':autoplay="1000"' })
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

    it('the live region stays silent while it rotates', () => {
      vi.useFakeTimers()
      const { container } = mount({ attrs: ':autoplay="1000"' })
      expect(container.querySelector('[role="status"]')?.textContent).toBe('')
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
      const { container } = mount({ attrs: 'orientation="vertical" effect="cover" height="20rem"' })
      const root = container.querySelector('.v-carousel')
      expect(root?.getAttribute('data-orientation')).toBe('vertical')
      expect(root?.getAttribute('data-effect')).toBe('cover')
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
})
