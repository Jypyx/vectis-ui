import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VTypography from '../VTypography/VTypography.vue'
import VCarousel from './VCarousel.vue'
import VCarouselItem from './VCarouselItem.vue'

const t = storyText({
  en: {
    slide: 'Slide',
    product: 'Product',
    intro: 'Drag, scroll, use the arrows or focus the track and press the arrow keys.',
    effectsHint: 'The effects follow the scroll, so they also follow a drag.',
    peekHint: 'One product and a slice of the next — the shopping-list template.',
    fluidHint: 'Narrow the window: the slides stop shrinking and the track scrolls further.',
    currentSlide: 'Current slide',
  },
  fr: {
    slide: 'Diapositive',
    product: 'Produit',
    intro: 'Faites glisser, défilez, utilisez les flèches ou donnez le focus à la piste.',
    effectsHint: 'Les effets suivent le défilement, donc aussi le glisser.',
    peekHint: 'Un produit et un morceau du suivant — le gabarit liste de produits.',
    fluidHint: 'Réduisez la fenêtre : les slides cessent de rétrécir et la piste défile plus loin.',
    currentSlide: 'Diapositive courante',
  },
})

/** Flat, deterministic colours: a photograph would make the axe contrast pass unstable. */
const HUES = [220, 280, 340, 20, 90, 160]

/** A slide big enough to be seen, painted from a token so both themes stay legible. */
const SLIDE_BASE = `
  display: grid;
  place-items: center;
  color: var(--vectis-color-text-on-accent);
  font: var(--vectis-text-heading-3-weight) var(--vectis-text-heading-3-size) / 1.2 var(--vectis-text-family);
  border-radius: var(--vectis-radius-surface);
`

/*
 * The two orientations size a slide from opposite ends, so the demo content cannot use
 * one style for both. HORIZONTAL takes its block size from the slides, so the content
 * has to carry one. VERTICAL derives the slide's height from `height / itemsPerView`,
 * so a fixed height on the content just leaves slack inside the slide — which is what
 * made the controls and the indicators look off-centre against the coloured block while
 * being perfectly centred on the viewport.
 */
const SLIDE_STYLE = `${SLIDE_BASE} block-size: 12rem;`
const VERTICAL_SLIDE_STYLE = `${SLIDE_BASE} block-size: 100%;`

const meta = {
  title: 'Components/Carousel',
  component: VCarousel,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    effect: { control: 'inline-radio', options: ['slide', 'fade', 'scale', 'cover'] },
    controls: { control: 'inline-radio', options: [false, 'inside', 'outside'] },
    indicators: { control: 'inline-radio', options: [false, 'inside', 'outside'] },
    controlsVisibility: { control: 'inline-radio', options: ['always', 'hover'] },
  },
  args: {
    itemsPerView: 1,
    orientation: 'horizontal',
    effect: 'slide',
    controls: 'inside',
    indicators: 'outside',
    controlsVisibility: 'always',
    autoplay: 0,
  },
  // A live v-model: without a local ref, clicking an indicator would change nothing.
  // `slideStyle` is a COMPUTED, not a value read at setup time: args are reactive, so
  // flipping the orientation from the toolbar has to re-pick the content's height.
  render: (args) => ({
    components: { VCarousel, VCarouselItem },
    setup: () => ({
      args,
      index: ref(0),
      hues: HUES,
      slideStyle: computed(() =>
        args.orientation === 'vertical' ? VERTICAL_SLIDE_STYLE : SLIDE_STYLE,
      ),
      t,
    }),
    template: `
      <VCarousel v-bind="args" v-model="index" label="Gallery">
        <VCarouselItem v-for="(hue, i) in hues" :key="hue">
          <div :style="slideStyle + 'background: oklch(0.45 0.15 ' + hue + ');'">
            {{ t.slide }} {{ i + 1 }}
          </div>
        </VCarouselItem>
      </VCarousel>
    `,
  }),
} satisfies Meta<typeof VCarousel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement

    await expect(canvas.getByRole('button', { name: '1 of 6' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeDisabled()

    // v-model → DOM: the scroller really moves
    await userEvent.click(canvas.getByRole('button', { name: '3 of 6' }))
    await waitFor(
      async () => {
        await expect(port.scrollLeft).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )

    // DOM → v-model: the read-back moves aria-current back. `instant` because what
    // is under test is the observer, not the CSS `scroll-behavior: smooth` that
    // every other route deliberately goes through.
    port.scrollTo({ left: 0, behavior: 'instant' })
    await waitFor(
      async () => {
        await expect(canvas.getByRole('button', { name: '1 of 6' })).toHaveAttribute(
          'aria-current',
          'true',
        )
      },
      { timeout: 3000 },
    )
  },
}

/**
 * `itemsPerView` is a MAXIMUM and `itemMinSize` a floor: the browser fits as many as it
 * can and scrolls further when it cannot. That `max()` in the slide's flex-basis IS the
 * responsiveness — no breakpoint, no container query, no observer.
 */
export const ItemsPerView: Story = {
  args: { itemsPerView: 3, itemMinSize: '14rem', indicators: 'outside' },
  play: async ({ canvasElement }) => {
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const slide = canvasElement.querySelector('[data-carousel-index="0"]') as HTMLElement
    const gap = Number.parseFloat(getComputedStyle(port).columnGap)

    /*
     * The basis really resolves, and the slides really cannot shrink. Written as the
     * `flex` shorthand these came as a package: one bad custom property anywhere in the
     * formula makes the WHOLE shorthand invalid at computed-value time, and `flex` then
     * falls back to its initial `0 1 auto` — shrink 1, basis auto, and the snap grid is
     * gone. As longhands, a bad value can only cost the basis.
     */
    const flex = getComputedStyle(slide)
    await expect(flex.flexBasis).toContain('max(')
    await expect(flex.flexShrink).toBe('0')

    // three slides plus the TWO inner gaps fill the port exactly
    const expected = (port.clientWidth - 2 * gap) / 3
    await expect(Math.abs(slide.getBoundingClientRect().width - expected)).toBeLessThan(1)
    await expect(port.scrollWidth).toBeGreaterThan(port.clientWidth)
  },
}

/** A slice of the next slide stays visible — the product-list template. */
export const Peek: Story = {
  args: { itemsPerView: 2, peek: '4rem', indicators: 'outside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const slide = canvasElement.querySelector('[data-carousel-index="0"]') as HTMLElement
    const gap = Number.parseFloat(getComputedStyle(port).columnGap)

    // the peek strip carries its own leading gap, which is what keeps the formula branch-free
    const expected = (port.clientWidth - gap - 64) / 2
    await expect(Math.abs(slide.getBoundingClientRect().width - expected)).toBeLessThan(1)

    /*
     * A peek makes the real slides-per-view FRACTIONAL, and that costs one leading
     * position: `count - floor(perView) + 1` would offer a dot here that scrolls
     * nowhere. This is the assertion that catches it — the last dot must actually
     * reach the end of the track.
     */
    const dots = canvasElement.querySelectorAll<HTMLButtonElement>('.v-carousel-indicator')
    await userEvent.click(dots[dots.length - 1] as HTMLElement)
    await waitFor(
      async () => {
        await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeDisabled()
        await expect(port.scrollWidth - port.clientWidth - port.scrollLeft).toBeLessThan(
          slide.getBoundingClientRect().width,
        )
      },
      { timeout: 3000 },
    )
  },
}

/** The floor wins in a narrow container: fewer slides fit and the track simply scrolls further. */
export const FluidFloor: Story = {
  args: { itemsPerView: 4, itemMinSize: '16rem', indicators: false },
  render: (args) => ({
    components: { VCarousel, VCarouselItem, VTypography },
    setup: () => ({ args, hues: HUES, slideStyle: SLIDE_STYLE, t }),
    template: `
      <div style="inline-size: 30rem">
        <VTypography variant="body-sm" tone="muted">{{ t.fluidHint }}</VTypography>
        <VCarousel v-bind="args" label="Fluid floor">
          <VCarouselItem v-for="(hue, i) in hues" :key="hue">
            <div :style="slideStyle + 'background: oklch(0.45 0.15 ' + hue + ');'">{{ i + 1 }}</div>
          </VCarouselItem>
        </VCarousel>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const slide = canvasElement.querySelector('[data-carousel-index="0"]') as HTMLElement
    // 30rem / 4 would be 7.5rem: the 16rem floor wins
    await expect(slide.getBoundingClientRect().width).toBeGreaterThan(200)
  },
}

/**
 * The four effects side by side. They are scroll-driven, so they play under the finger;
 * where scroll-driven animations are missing they fall back to a plain `slide`.
 */
export const Effects: Story = {
  render: () => ({
    components: { VCarousel, VCarouselItem, VTypography },
    setup: () => ({
      effects: ['slide', 'fade', 'scale', 'cover'] as const,
      hues: HUES,
      slideStyle: SLIDE_STYLE,
      t,
    }),
    template: `
      <div style="display: grid; gap: var(--vectis-space-6)">
        <VTypography variant="body-sm" tone="muted">{{ t.effectsHint }}</VTypography>
        <div v-for="effect in effects" :key="effect">
          <VTypography variant="overline">{{ effect }}</VTypography>
          <VCarousel :effect="effect" :label="'Effect ' + effect">
            <VCarouselItem v-for="(hue, i) in hues" :key="hue">
              <div :style="slideStyle + 'background: oklch(0.45 0.15 ' + hue + ');'">
                {{ t.slide }} {{ i + 1 }}
              </div>
            </VCarouselItem>
          </VCarousel>
        </div>
      </div>
    `,
  }),
}

/**
 * Vertical needs a `height`: a percentage flex-basis has no definite block reference.
 * The axes follow: `outside` controls go above and below, and the indicators to the
 * inline end.
 */
export const Vertical: Story = {
  args: { orientation: 'vertical', height: '18rem', indicators: 'outside', controls: 'outside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement

    const box = port.getBoundingClientRect()
    const prev = canvas.getByRole('button', { name: 'Previous slide' }).getBoundingClientRect()
    const next = canvas.getByRole('button', { name: 'Next slide' }).getBoundingClientRect()
    const bar = (
      canvasElement.querySelector('.v-carousel-indicators') as HTMLElement
    ).getBoundingClientRect()

    await expect(prev.bottom).toBeLessThanOrEqual(box.top)
    await expect(next.top).toBeGreaterThanOrEqual(box.bottom)
    await expect(bar.left).toBeGreaterThanOrEqual(box.right)

    /*
     * One slide per view, so the slide IS the viewport's height — and the demo content
     * fills it. Content carrying a fixed height instead leaves slack inside the slide,
     * and the controls then read as off-centre against it while being exactly centred
     * on the viewport, which is what they are positioned against.
     */
    const slide = canvasElement.querySelector('[data-carousel-index="0"]') as HTMLElement
    const painted = slide.querySelector('.v-carousel-effect > div') as HTMLElement
    await expect(Math.abs(slide.getBoundingClientRect().height - box.height)).toBeLessThan(1)
    await expect(Math.abs(painted.getBoundingClientRect().height - box.height)).toBeLessThan(1)

    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
    await waitFor(async () => {
      await expect(port.scrollTop).toBeGreaterThan(0)
      await expect(port.scrollLeft).toBe(0)
    })
  },
}

/** Vertical, indicators laid over the slides at the inline end. */
export const VerticalInside: Story = {
  args: { orientation: 'vertical', height: '18rem', indicators: 'inside', controls: 'inside' },
  play: async ({ canvasElement }) => {
    const port = (
      canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    ).getBoundingClientRect()
    const barEl = canvasElement.querySelector('.v-carousel-indicators') as HTMLElement
    const bar = barEl.getBoundingClientRect()

    // over the slides, at the inline end, block-centred
    await expect(bar.right).toBeLessThanOrEqual(port.right)
    await expect(bar.left).toBeGreaterThan(port.left + port.width / 2)
    await expect(Math.abs(bar.top + bar.height / 2 - (port.top + port.height / 2))).toBeLessThan(2)

    /*
     * NO surface of its own. A pill behind the dots covers a slice of the slide the
     * whole time; the legibility lives in the dots, which carry a white fill and a
     * dark hairline so they read on any media.
     */
    await expect(getComputedStyle(barEl).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    const dot = canvasElement.querySelector('.v-carousel-dot') as HTMLElement
    await expect(getComputedStyle(dot).boxShadow).not.toBe('none')
  },
}

/**
 * The full matrix. `inside` lays an affordance over the slides, `outside` puts the
 * controls at the inline edges and the indicators below. Each carousel needs a
 * DISTINCT `label`: a region is a landmark, and two identically named landmarks are an
 * axe violation.
 */
export const Placement: Story = {
  render: () => ({
    components: { VCarousel, VCarouselItem, VTypography },
    setup: () => ({
      places: ['inside', 'outside'] as const,
      hues: HUES,
      slideStyle: SLIDE_STYLE,
      t,
    }),
    template: `
      <div style="display: grid; gap: var(--vectis-space-6)">
        <template v-for="c in places" :key="c">
          <div v-for="i in places" :key="c + i">
            <VTypography variant="overline">controls {{ c }} · indicators {{ i }}</VTypography>
            <VCarousel :controls="c" :indicators="i" :label="'Controls ' + c + ', indicators ' + i">
              <VCarouselItem v-for="(hue, n) in hues" :key="hue">
                <div :style="slideStyle + 'background: oklch(0.45 0.15 ' + hue + ');'">
                  {{ t.slide }} {{ n + 1 }}
                </div>
              </VCarouselItem>
            </VCarousel>
          </div>
        </template>
      </div>
    `,
  }),
}

/**
 * Right-to-left. The layout mirrors itself — logical properties throughout — but a
 * chevron points at a PHYSICAL direction, so the icons are flipped in CSS (the VTabs
 * and VPagination rule). Nothing here is observable in jsdom, which evaluates no
 * styles and lays nothing out.
 */
export const Rtl: Story = {
  globals: { direction: 'rtl' },
  args: { controls: 'inside', indicators: 'outside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const prev = canvas.getByRole('button', { name: 'Previous slide' })
    const next = canvas.getByRole('button', { name: 'Next slide' })

    // `space-between` puts `previous` at the inline START, which is the RIGHT here
    await expect(prev.getBoundingClientRect().left).toBeGreaterThan(
      next.getBoundingClientRect().left,
    )

    // the glyph is mirrored, so `previous` points right and `next` points left
    const icon = prev.querySelector('.v-icon') as HTMLElement
    await expect(getComputedStyle(icon).scale).toBe('-1 1')

    // and the scroll axis really is reversed: in RTL, scrollLeft goes negative
    await userEvent.click(next)
    await waitFor(
      async () => {
        await expect(port.scrollLeft).toBeLessThan(0)
        await expect(canvas.getByRole('button', { name: '2 of 6' })).toHaveAttribute(
          'aria-current',
          'true',
        )
      },
      { timeout: 3000 },
    )
  },
}

/**
 * The pair is centred on the SLIDES, never on the slides plus the indicators — which
 * is what putting the indicator bar outside the positioning context buys.
 */
export const ControlsCentring: Story = {
  args: { controls: 'inside', indicators: 'outside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvasElement.querySelector('.v-carousel') as HTMLElement
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const bar = canvasElement.querySelector('.v-carousel-indicators') as HTMLElement
    const middle = (el: Element) => {
      const rect = el.getBoundingClientRect()
      return rect.top + rect.height / 2
    }

    // the bar really is below the slides, or nothing below discriminates
    await expect(bar.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      port.getBoundingClientRect().bottom,
    )

    const prev = canvas.getByRole('button', { name: 'Previous slide' })
    await expect(Math.abs(middle(prev) - middle(port))).toBeLessThan(2)
    /*
     * …and NOT on the root, which also spans the indicator bar. This is the whole
     * test: the first assertion alone was true of the old markup too, which sat the
     * pair about 18px low.
     */
    await expect(Math.abs(middle(prev) - middle(root))).toBeGreaterThan(8)
  },
}

/** `outside` puts the pair at the inline edges, in room the root reserved as padding. */
export const ControlsOutside: Story = {
  args: { controls: 'outside', indicators: 'outside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = (canvasElement.querySelector('.v-carousel') as HTMLElement).getBoundingClientRect()
    const port = (
      canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    ).getBoundingClientRect()
    const prev = canvas.getByRole('button', { name: 'Previous slide' }).getBoundingClientRect()
    const next = canvas.getByRole('button', { name: 'Next slide' }).getBoundingClientRect()

    // beside the slides, never below them
    await expect(prev.right).toBeLessThanOrEqual(port.left)
    await expect(next.left).toBeGreaterThanOrEqual(port.right)
    await expect(Math.abs(prev.top + prev.height / 2 - (port.top + port.height / 2))).toBeLessThan(
      2,
    )

    // in the RESERVED padding: the footprint is unchanged and nothing overflows
    await expect(prev.left).toBeGreaterThanOrEqual(root.left - 1)
    await expect(next.right).toBeLessThanOrEqual(root.right + 1)
  },
}

/**
 * `controlsVisibility="hover"` fades the pair in on hover or on focus anywhere in the
 * carousel. It is revealed, never removed: the buttons keep their place in the tab
 * order and in the accessibility tree throughout.
 */
export const ControlsOnHover: Story = {
  args: { controls: 'inside', controlsVisibility: 'hover' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvasElement.querySelector('.v-carousel-controls') as HTMLElement
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const next = canvas.getByRole('button', { name: 'Next slide' })

    // hidden, yet a real button: getByRole queries the accessibility tree, which
    // opacity does not touch, and the tab order is untouched too
    await expect(getComputedStyle(bar).opacity).toBe('0')
    await expect(next).not.toBeDisabled()
    await expect(next.tabIndex).toBe(0)

    /*
     * Focus on the TRACK is enough, since the trigger is `:has(:focus-visible)` on the
     * root. `userEvent.hover()` deliberately not used: it dispatches synthetic pointer
     * events, where CSS `:hover` is set by the browser's real input pipeline — the
     * assertion would be permanently red. The focus branch is the a11y-critical one
     * anyway; the pure-hover branch is Chromatic's job.
     */
    port.focus()
    await waitFor(async () => {
      await expect(getComputedStyle(bar).opacity).toBe('1')
    })

    // …and it RELEASES. The reveal used to be pinned by any focus, so clicking a
    // control left the pair up until the user clicked outside the carousel entirely.
    port.blur()
    await waitFor(async () => {
      await expect(getComputedStyle(bar).opacity).toBe('0')
    })

    port.focus()
    await waitFor(async () => {
      await expect(getComputedStyle(bar).opacity).toBe('1')
    })

    await userEvent.click(next)
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: '2 of 6' })).toHaveAttribute(
        'aria-current',
        'true',
      )
    })

    /*
     * Ends REVEALED on purpose: axe short-circuits `color-contrast` to a pass at an
     * opacity of exactly 0, but JUDGES any value in between — leaving the bar
     * mid-transition would make the dark run flaky.
     */
    await expect(getComputedStyle(bar).opacity).toBe('1')
  },
}

/**
 * The viewport is a focusable scroll container, and the arrows move exactly one slide.
 * A focused scroller does move natively — but the browser scrolls a fixed pixel step
 * that mandatory snapping undoes, which is why the component handles the keys itself.
 */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement

    port.focus()
    await expect(port).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    await waitFor(
      async () => {
        await expect(canvas.getByRole('button', { name: '2 of 6' })).toHaveAttribute(
          'aria-current',
          'true',
        )
      },
      { timeout: 3000 },
    )

    // `End` crosses five slides, and `scroll-behavior: smooth` makes that a real
    // animation: the end state is only readable once the scroll has landed.
    await userEvent.keyboard('{End}')
    await waitFor(
      async () => {
        await expect(canvas.getByRole('button', { name: '6 of 6' })).toHaveAttribute(
          'aria-current',
          'true',
        )
        await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeDisabled()
      },
      { timeout: 5000 },
    )
  },
}

/**
 * With several slides per view, `scroll-snap-align: start` leaves only
 * `count - perView + 1` positions the scroller can rest on: 6 slides three at a time
 * give four, not six. The indicators follow that count, and the model can never hold an
 * index the DOM cannot satisfy.
 */
export const Pages: Story = {
  args: { itemsPerView: 3, indicators: 'outside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const left = (index: number) =>
      (
        canvasElement.querySelector(`[data-carousel-index="${index}"]`) as HTMLElement
      ).getBoundingClientRect().left

    // 6 slides three at a time → 4 leading positions, hence 4 dots
    await expect(canvasElement.querySelectorAll('.v-carousel-indicator')).toHaveLength(4)
    const step = left(1) - left(0)

    const next = canvas.getByRole('button', { name: 'Next slide' })
    for (const [clicks, label] of [
      [1, '2 of 6'],
      [2, '3 of 6'],
      [3, '4 of 6'],
    ] as const) {
      await userEvent.click(next)
      await waitFor(
        async () => {
          await expect(canvas.getByRole('button', { name: label })).toHaveAttribute(
            'aria-current',
            'true',
          )
          /*
           * EXACTLY one slide per click. The read-back used to scan a Map in insertion
           * order and pick an arbitrary member of the fully-visible tie — a middle
           * slide — so the following click stepped two at once.
           */
          await expect(Math.abs(port.scrollLeft - clicks * step)).toBeLessThan(2)
        },
        { timeout: 3000 },
      )
    }

    await expect(next).toBeDisabled()

    /*
     * No ping-pong: a false `atEnd` would let the model request a position the scroller
     * cannot hold, bounce back, and re-arm autoplay on every bounce. Two samples taken
     * AFTER the last smooth scroll has landed — one taken immediately would still catch
     * it settling, which is movement but not a fight.
     */
    await new Promise((resolve) => setTimeout(resolve, 500))
    const settled = port.scrollLeft
    await new Promise((resolve) => setTimeout(resolve, 500))
    await expect(port.scrollLeft).toBe(settled)
    await expect(canvas.getByRole('button', { name: '4 of 6' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  },
}

/**
 * The page count is MEASURED, so it has to follow a resize with no ResizeObserver: the
 * intersection observer covers it because a change in the number of fully visible slides
 * necessarily crosses the 1.0 threshold. This story is that claim's acceptance test.
 */
export const ResponsivePages: Story = {
  args: { itemsPerView: 4, itemMinSize: '10rem', indicators: 'outside' },
  render: (args) => ({
    components: { VCarousel, VCarouselItem },
    setup: () => ({ args, hues: HUES, slideStyle: SLIDE_STYLE }),
    template: `
      <div class="resize-host" style="inline-size: 60rem">
        <VCarousel v-bind="args" label="Responsive pages">
          <VCarouselItem v-for="(hue, i) in hues" :key="hue">
            <div :style="slideStyle + 'background: oklch(0.45 0.15 ' + hue + ');'">{{ i + 1 }}</div>
          </VCarouselItem>
        </VCarousel>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('.resize-host') as HTMLElement
    const dots = () => canvasElement.querySelectorAll('.v-carousel-indicator').length

    // 60rem / 4 per view → 3 pages
    await waitFor(async () => {
      await expect(dots()).toBe(3)
    })

    // 24rem: the 10rem floor lets only 2 fit, so a page appears
    host.style.inlineSize = '24rem'
    await waitFor(
      async () => {
        await expect(dots()).toBeGreaterThan(3)
      },
      { timeout: 3000 },
    )
  },
}

/**
 * The component renders no pause button: autoplay pauses on hover and on keyboard focus,
 * stops on the last page, and `prefers-reduced-motion` disables it outright. A stop
 * control of your own is a binding on the prop — `0` cancels the timer on the spot.
 */
export const Autoplay: Story = {
  args: { autoplay: 900, indicators: 'inside' },
  render: (args) => ({
    components: { VCarousel, VCarouselItem },
    setup: () => ({ args, index: ref(0), hues: HUES, slideStyle: SLIDE_STYLE, t }),
    template: `
      <VCarousel v-bind="args" v-model="index" label="Autoplay">
        <VCarouselItem v-for="(hue, i) in hues" :key="hue">
          <div :style="slideStyle + 'background: oklch(0.45 0.15 ' + hue + ');'">
            {{ t.slide }} {{ i + 1 }}
          </div>
        </VCarouselItem>
      </VCarousel>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvasElement.querySelector('.v-carousel') as HTMLElement

    // it advances on its own…
    await waitFor(
      async () => {
        await expect(canvas.getByRole('button', { name: '2 of 6' })).toHaveAttribute(
          'aria-current',
          'true',
        )
      },
      { timeout: 4000 },
    )

    /*
     * …and the only buttons in the stage are previous and next: no pause control is
     * rendered any more.
     *
     * The hover and focus pauses are NOT asserted here. This runner's iframe does not
     * hold document focus, so a programmatic `focus()` is followed by a real
     * `focusout` and the rotation resumes — the pauses are locked in jsdom instead,
     * where both flags are driven deterministically.
     */
    await expect(root.querySelectorAll('.v-carousel-stage button')).toHaveLength(2)
  },
}

/** Every text comes from the dictionary, `aria-roledescription` included. */
export const Localization: Story = {
  globals: { locale: 'fr-FR' },
  args: { indicators: 'outside' },
}

/** A single slide, a very long label, and no control at all. */
export const EdgeCases: Story = {
  render: () => ({
    components: { VCarousel, VCarouselItem, VTypography },
    setup: () => ({ slideStyle: SLIDE_STYLE, t }),
    template: `
      <div style="display: grid; gap: var(--vectis-space-6)">
        <VCarousel label="Single slide">
          <VCarouselItem>
            <div :style="slideStyle + 'background: oklch(0.45 0.15 220);'">{{ t.slide }} 1</div>
          </VCarouselItem>
        </VCarousel>

        <VCarousel :controls="false" :indicators="false" label="No control">
          <VCarouselItem v-for="hue in [220, 340]" :key="hue">
            <div :style="slideStyle + 'background: oklch(0.45 0.15 ' + hue + ');'">
              {{ t.intro }}
            </div>
          </VCarouselItem>
        </VCarousel>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // a lone slide is both ends at once: both controls disabled, one indicator
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeDisabled()
  },
}
