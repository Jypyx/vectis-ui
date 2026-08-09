import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

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
const SLIDE_STYLE = `
  display: grid;
  place-items: center;
  block-size: 12rem;
  color: var(--vectis-color-text-on-accent);
  font: var(--vectis-text-heading-3-weight) var(--vectis-text-heading-3-size) / 1.2 var(--vectis-text-family);
  border-radius: var(--vectis-radius-surface);
`

const meta = {
  title: 'Components/Carousel',
  component: VCarousel,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    effect: { control: 'inline-radio', options: ['slide', 'fade', 'scale', 'cover'] },
    controls: { control: 'inline-radio', options: [false, 'inside', 'outside'] },
    indicators: { control: 'inline-radio', options: [false, 'inside', 'outside'] },
  },
  args: {
    itemsPerView: 1,
    orientation: 'horizontal',
    effect: 'slide',
    controls: 'inside',
    indicators: 'outside',
    autoplay: 0,
  },
  // A live v-model: without a local ref, clicking an indicator would change nothing.
  render: (args) => ({
    components: { VCarousel, VCarouselItem },
    setup: () => ({ args, index: ref(0), hues: HUES, slideStyle: SLIDE_STYLE, t }),
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

/** Vertical needs a `height`: a percentage flex-basis has no definite block reference. */
export const Vertical: Story = {
  args: { orientation: 'vertical', height: '18rem', indicators: 'outside', controls: 'outside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement

    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
    await waitFor(async () => {
      await expect(port.scrollTop).toBeGreaterThan(0)
      await expect(port.scrollLeft).toBe(0)
    })
  },
}

/** Controls and indicators, over the slides or after them. */
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
        <div v-for="place in places" :key="place">
          <VTypography variant="overline">{{ place }}</VTypography>
          <VCarousel :controls="place" :indicators="place" :label="'Placement ' + place">
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
 * WCAG 2.2.2: the pause control is rendered whatever `controls` says, autoplay pauses on
 * hover and on focus-within, and `prefers-reduced-motion` stops it outright.
 */
export const Autoplay: Story = {
  args: { autoplay: 900, indicators: 'inside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const pause = canvas.getByRole('button', { name: 'Stop automatic slide show' })

    await waitFor(
      async () => {
        await expect(canvas.getByRole('button', { name: '2 of 6' })).toHaveAttribute(
          'aria-current',
          'true',
        )
      },
      { timeout: 4000 },
    )

    await userEvent.click(pause)
    await expect(
      canvas.getByRole('button', { name: 'Start automatic slide show' }),
    ).toBeInTheDocument()
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
