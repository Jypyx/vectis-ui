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
  args: { itemsPerView: 2, peek: '4rem', indicators: false },
  play: async ({ canvasElement }) => {
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const slide = canvasElement.querySelector('[data-carousel-index="0"]') as HTMLElement
    const gap = Number.parseFloat(getComputedStyle(port).columnGap)

    // the peek strip carries its own leading gap, which is what keeps the formula branch-free
    const expected = (port.clientWidth - gap - 64) / 2
    await expect(Math.abs(slide.getBoundingClientRect().width - expected)).toBeLessThan(1)
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
 * The viewport is a focusable scroll container: the browser moves it snap-aware on the
 * arrows and Home/End, so the component ships no keyboard handler at all.
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
 * The end is read from the intersection ratios, not from the model: with several slides
 * per view the scroller clamps before the last index is ever reachable, and a
 * model-derived end would oscillate forever.
 */
export const ClampedEnd: Story = {
  args: { itemsPerView: 3, indicators: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement

    port.scrollTo({ left: port.scrollWidth, behavior: 'instant' })
    await waitFor(
      async () => {
        await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeDisabled()
      },
      { timeout: 3000 },
    )

    const settled = port.scrollLeft
    await new Promise((resolve) => setTimeout(resolve, 400))
    // no ping-pong between the requested index and the clamped one
    await expect(port.scrollLeft).toBe(settled)
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
