import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import photoAurora from '../../stories/photos/aurora.svg'
import photoCity from '../../stories/photos/city.svg'
import photoCoast from '../../stories/photos/coast.svg'
import photoDunes from '../../stories/photos/dunes.svg'
import photoForest from '../../stories/photos/forest.svg'
import photoSunset from '../../stories/photos/sunset.svg'
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
    imagesHint: 'A flat colour hides what the effects do to a picture that carries detail.',
    photoAlts: [
      'The sun setting behind a mountain range, reflected in a lake.',
      'Rows of pine trees fading into fog.',
      'Waves rolling onto a sandy beach under a clear sky.',
      'Desert dunes at dusk.',
      'A lit city skyline at night, seen across a river.',
      'Northern lights over a mountain lake.',
    ],
  },
  fr: {
    slide: 'Diapositive',
    product: 'Produit',
    intro: 'Faites glisser, défilez, utilisez les flèches ou donnez le focus à la piste.',
    effectsHint: 'Les effets suivent le défilement, donc aussi le glisser.',
    peekHint: 'Un produit et un morceau du suivant — le gabarit liste de produits.',
    fluidHint: 'Réduisez la fenêtre : les slides cessent de rétrécir et la piste défile plus loin.',
    currentSlide: 'Diapositive courante',
    imagesHint:
      'Un aplat de couleur masque ce que les effets font à une image qui porte du détail.',
    photoAlts: [
      'Le soleil se couchant derrière une chaîne de montagnes, reflété dans un lac.',
      'Des rangées de sapins qui se perdent dans la brume.',
      'Des vagues déroulant sur une plage de sable sous un ciel dégagé.',
      'Des dunes de sable au crépuscule.',
      'Les tours éclairées d’une ville la nuit, vues depuis la rive opposée.',
      'Une aurore boréale au-dessus d’un lac de montagne.',
    ],
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
 * The two orientations size a slide from opposite ends, so the demo content cannot use one
 * style for both. HORIZONTAL takes its block size from the slides, so the content has to carry
 * one.
 */
const SLIDE_STYLE = `${SLIDE_BASE} block-size: 12rem;`
const VERTICAL_SLIDE_STYLE = `${SLIDE_BASE} block-size: 100%;`

/*
 * Six drawn scenes rather than photographs from a CDN: a story must render offline,
 * and Chromatic diffs and the axe runs both need the same pixels on every pass.
 */
const PHOTOS = [photoSunset, photoForest, photoCoast, photoDunes, photoCity, photoAurora]

/**
 * A slide is far wider than it is tall, so the pictures are drawn panoramic and
 * `object-fit` crops them rather than stretching them as the width changes.
 */
const PHOTO_STYLE = `
  display: block;
  inline-size: 100%;
  block-size: 14rem;
  object-fit: cover;
  border-radius: var(--vectis-radius-surface);
`

const meta = {
  title: 'Components/Carousel',
  component: VCarousel,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    effect: { control: 'inline-radio', options: ['slide', 'fade', 'scale'] },
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
 * `itemsPerView` is a MAXIMUM and `itemMinSize` a floor: the browser fits as many as it can and
 * scrolls further when it cannot.
 */
export const ItemsPerView: Story = {
  args: { itemsPerView: 3, itemMinSize: '14rem', indicators: 'outside' },
  play: async ({ canvasElement }) => {
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const slide = canvasElement.querySelector('[data-carousel-index="0"]') as HTMLElement
    const gap = Number.parseFloat(getComputedStyle(port).columnGap)

    /*
     * The basis really resolves, and the slides really cannot shrink. Written as the `flex`
     * shorthand these came as a package: one bad custom property anywhere in the formula makes
     * the whole shorthand invalid at computed-value time, and `flex` then falls back to its
     * initial `0 1 auto`; shrink 1, basis auto, and the snap grid is gone.
     */
    const flex = getComputedStyle(slide)
    await expect(flex.flexBasis).toContain('max(')
    await expect(flex.flexShrink).toBe('0')

    const expected = (port.clientWidth - 2 * gap) / 3
    await expect(Math.abs(slide.getBoundingClientRect().width - expected)).toBeLessThan(1)
    await expect(port.scrollWidth).toBeGreaterThan(port.clientWidth)
  },
}

/** A slice of the next slide stays visible; the product-list template. */
export const Peek: Story = {
  args: { itemsPerView: 2, peek: '4rem', indicators: 'outside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const slide = canvasElement.querySelector('[data-carousel-index="0"]') as HTMLElement
    const gap = Number.parseFloat(getComputedStyle(port).columnGap)

    const expected = (port.clientWidth - gap - 64) / 2
    await expect(Math.abs(slide.getBoundingClientRect().width - expected)).toBeLessThan(1)

    /*
     * What answers for it is the END of the track, a page of its own; without it the last slide
     * is never fully revealed and no control can ask for it. Six slides two at a time therefore
     * give FIVE positions; the last is named after the slide that leads there, and there is
     * deliberately no "6 of 6", since slide 6 can never lead.
     */
    const dots = canvasElement.querySelectorAll<HTMLButtonElement>('.v-carousel-indicator')
    await expect(dots).toHaveLength(5)
    await userEvent.click(dots[dots.length - 1] as HTMLElement)
    const last = canvasElement.querySelector('[data-carousel-index="5"]') as HTMLElement
    await waitFor(
      async () => {
        await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeDisabled()
        // Flush against the end of the track, and the sixth slide entirely inside the port
        await expect(port.scrollWidth - port.clientWidth - port.scrollLeft).toBeLessThan(2)
        await expect(last.getBoundingClientRect().right).toBeLessThan(
          port.getBoundingClientRect().right + 1,
        )
      },
      { timeout: 3000 },
    )

    await userEvent.click(dots[1] as HTMLElement)
    await waitFor(
      async () => {
        await expect(dots[1] as HTMLElement).toHaveAttribute('aria-current', 'true')
      },
      { timeout: 3000 },
    )
    await new Promise((resolve) => setTimeout(resolve, 600))
    await expect(dots[1] as HTMLElement).toHaveAttribute('aria-current', 'true')
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
    await expect(slide.getBoundingClientRect().width).toBeGreaterThan(200)
  },
}

/**
 * The three effects side by side. They are scroll-driven, so they play under the finger;
 * where scroll-driven animations are missing they fall back to a plain `slide`.
 */
export const Effects: Story = {
  render: () => ({
    components: { VCarousel, VCarouselItem, VTypography },
    setup: () => ({
      effects: ['slide', 'fade', 'scale'] as const,
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
 * The same three effects over pictures, which is where `fade` and `scale` become
 * legible: they work on the whole slide, so a flat colour shows nothing of what they
 * do to its content.
 */
export const WithImages: Story = {
  render: () => ({
    components: { VCarousel, VCarouselItem, VTypography },
    setup: () => ({
      effects: ['slide', 'fade', 'scale'] as const,
      photos: PHOTOS,
      photoStyle: PHOTO_STYLE,
      t,
    }),
    template: `
      <div style="display: grid; gap: var(--vectis-space-6)">
        <VTypography variant="body-sm" tone="muted">{{ t.imagesHint }}</VTypography>
        <div v-for="effect in effects" :key="effect">
          <VTypography variant="overline">{{ effect }}</VTypography>
          <VCarousel :effect="effect" :label="'Photos ' + effect">
            <VCarouselItem v-for="(photo, i) in photos" :key="photo">
              <img :src="photo" :alt="t.photoAlts[i]" :style="photoStyle" />
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

    await expect(bar.right).toBeLessThanOrEqual(port.right)
    await expect(bar.left).toBeGreaterThan(port.left + port.width / 2)
    await expect(Math.abs(bar.top + bar.height / 2 - (port.top + port.height / 2))).toBeLessThan(2)

    await expect(getComputedStyle(barEl).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    const dot = canvasElement.querySelector('.v-carousel-dot') as HTMLElement
    await expect(getComputedStyle(dot).boxShadow).not.toBe('none')
  },
}

/** The full matrix. */
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

/** Right-to-left. */
export const Rtl: Story = {
  globals: { direction: 'rtl' },
  args: { controls: 'inside', indicators: 'outside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const prev = canvas.getByRole('button', { name: 'Previous slide' })
    const next = canvas.getByRole('button', { name: 'Next slide' })

    await expect(prev.getBoundingClientRect().left).toBeGreaterThan(
      next.getBoundingClientRect().left,
    )

    const icon = prev.querySelector('.v-icon') as HTMLElement
    await expect(getComputedStyle(icon).scale).toBe('-1 1')

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
 * The pair is centred on the SLIDES, never on the slides plus the indicators; which putting the
 * indicator bar outside the positioning context buys.
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

    await expect(bar.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      port.getBoundingClientRect().bottom,
    )

    const prev = canvas.getByRole('button', { name: 'Previous slide' })
    await expect(Math.abs(middle(prev) - middle(port))).toBeLessThan(2)
    /*
     * …and not on the root, which also spans the indicator bar. This is the whole test: the
     * first assertion alone holds even when the pair sits ~18px low, which putting the bar
     * inside the stage would do.
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

    // Beside the slides, never below them
    await expect(prev.right).toBeLessThanOrEqual(port.left)
    await expect(next.left).toBeGreaterThanOrEqual(port.right)
    await expect(Math.abs(prev.top + prev.height / 2 - (port.top + port.height / 2))).toBeLessThan(
      2,
    )

    await expect(prev.left).toBeGreaterThanOrEqual(root.left - 1)
    await expect(next.right).toBeLessThanOrEqual(root.right + 1)
  },
}

/** `controlsVisibility="hover"` fades the pair in on hover or on focus anywhere in the carousel. */
export const ControlsOnHover: Story = {
  args: { controls: 'inside', controlsVisibility: 'hover' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvasElement.querySelector('.v-carousel-controls') as HTMLElement
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const next = canvas.getByRole('button', { name: 'Next slide' })

    // Hidden, yet a real button: getByRole queries the accessibility tree, which opacity does
    // not touch, and the tab order is untouched too
    await expect(getComputedStyle(bar).opacity).toBe('0')
    await expect(next).not.toBeDisabled()
    await expect(next.tabIndex).toBe(0)

    /*
     * Focus on the TRACK is enough, since the trigger is `:has(:focus-visible)` on the root.
     * `userEvent.hover()` deliberately not used: it dispatches synthetic pointer events, where
     * CSS `:hover` is set by the browser's real input pipeline; the assertion would be
     * permanently red.
     */
    port.focus()
    await waitFor(async () => {
      await expect(getComputedStyle(bar).opacity).toBe('1')
    })

    // …and it RELEASES. Reading any focus rather than `:focus-visible` would pin the pair
    // up, a click leaving focus on the control until the reader clicked outside entirely.
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
     * Ends REVEALED on purpose: axe short-circuits `color-contrast` to a pass at an opacity of
     * exactly 0, but JUDGES any value in between; leaving the bar mid-transition would make the
     * dark run flaky.
     */
    await expect(getComputedStyle(bar).opacity).toBe('1')
  },
}

/** The viewport is a focusable scroll container, and the arrows move exactly one slide. */
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
 * With several slides per view, `scroll-snap-align: start` leaves only `count - perView + 1`
 * positions the scroller can rest on: 6 slides three at a time give four, not six.
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
          await expect(Math.abs(port.scrollLeft - clicks * step)).toBeLessThan(2)
        },
        { timeout: 3000 },
      )
    }

    await expect(next).toBeDisabled()

    /*
     * No ping-pong: a false `atEnd` would let the model request a position the scroller cannot
     * hold, bounce back, and re-arm autoplay on every bounce. Two samples taken after the last
     * smooth scroll has landed; one taken immediately would still catch it settling, which is
     * movement but not a fight.
     */
    await new Promise((resolve) => setTimeout(resolve, 500))
    const settled = port.scrollLeft
    await new Promise((resolve) => setTimeout(resolve, 500))
    await expect(port.scrollLeft).toBe(settled)
    await expect(canvas.getByRole('button', { name: '4 of 6' })).toHaveAttribute(
      'aria-current',
      'true',
    )

    await userEvent.click(canvas.getByRole('button', { name: '1 of 6' }))
    await waitFor(async () => await expect(port.scrollLeft).toBeLessThan(2))
    await userEvent.click(canvas.getByRole('button', { name: '4 of 6' }))
    await new Promise((resolve) => setTimeout(resolve, 600))
    await expect(canvasElement.querySelectorAll('.v-carousel-indicator')).toHaveLength(4)
  },
}

/**
 * A dot five pages away cuts the travel rather than sending the four slides in between across
 * the view. The effect plays once instead, on arrival, in whichever form the carousel is set
 * to; the dissolve here.
 */
export const Jump: Story = {
  args: { effect: 'fade', indicators: 'outside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvasElement.querySelector('.v-carousel') as HTMLElement
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const effect = canvasElement.querySelector('.v-carousel-effect') as HTMLElement
    const left = (index: number) =>
      (
        canvasElement.querySelector(`[data-carousel-index="${index}"]`) as HTMLElement
      ).getBoundingClientRect().left
    const step = left(1) - left(0)
    const twoFrames = () =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

    await expect(root).not.toHaveAttribute('data-jump')

    await userEvent.click(canvas.getByRole('button', { name: '6 of 6' }))
    await twoFrames()
    /*
     * Two frames against five slides of track: a smooth scroll is nowhere near done by
     * then, so this is the assertion that goes red the moment `instant` is dropped.
     */
    await expect(Math.abs(port.scrollLeft - 5 * step)).toBeLessThan(2)

    /*
     * The two animations in ONE list, which is the wiring jsdom cannot see: the
     * scroll-keyed effect first and the one-shot second, so the jump wins while it runs
     * and hands back to the effect on the value it holds at rest.
     */
    const phase = root.getAttribute('data-jump')
    await expect(phase).toBeTruthy()
    await expect(getComputedStyle(effect).animationName).toBe(
      `v-carousel-fade, v-carousel-jump-${phase}`,
    )

    // A step keeps its travel, so it arms no one-shot: the phase never flips. (The one
    // that played is taken off when it ends, so the attribute may be gone by now.)
    await userEvent.click(canvas.getByRole('button', { name: '5 of 6' }))
    await waitFor(async () => {
      await expect(Math.abs(port.scrollLeft - 4 * step)).toBeLessThan(2)
    })
    await expect(root.getAttribute('data-jump')).not.toBe(phase === 'a' ? 'b' : 'a')
    await waitFor(async () => {
      await expect(root).not.toHaveAttribute('data-jump')
    })
  },
}

/** This story is that claim's acceptance test. */
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

    await waitFor(async () => {
      await expect(dots()).toBe(3)
    })

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
 * `loop` takes the ends off: past the last position the carousel returns to the first, and
 * before the first it goes to the last.
 */
export const Loop: Story = {
  args: { loop: true, indicators: 'outside' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const port = canvasElement.querySelector('.v-carousel-viewport') as HTMLElement
    const previous = canvas.getByRole('button', { name: 'Previous slide' })

    // The visible signature of the prop: on slide 1 this button is normally disabled.
    await expect(previous).toBeEnabled()

    /*
     * BACKWARDS off the first slide, which is both the longer travel and the arithmetic
     * that fails first: `-1 % 6` is `-1` in JS, so a single modulo would ask for a slide
     * that does not exist and the carousel would stop dead with nothing in the console.
     */
    await userEvent.click(previous)
    /*
     * The wrap is a jump, so the scroller is at the end of the track within a frame and
     * the dot turns over with it. The window stays generous all the same: what it covers
     * is the model → DOM → read-back round trip, not a travel.
     */
    await waitFor(
      async () => {
        await expect(canvas.getByRole('button', { name: '6 of 6' })).toHaveAttribute(
          'aria-current',
          'true',
        )
        await expect(port.scrollWidth - port.clientWidth - port.scrollLeft).toBeLessThan(2)
      },
      { timeout: 5000 },
    )

    /*
     * The wrap crosses the whole track, so the observer is handed the most readings of any move
     * the component makes, and a stale one landing behind it would show here; the `Peek`
     * story's second sample, and meaningful only once the move above has settled.
     */
    await new Promise((resolve) => setTimeout(resolve, 600))
    await expect(canvas.getByRole('button', { name: '6 of 6' })).toHaveAttribute(
      'aria-current',
      'true',
    )

    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
    await waitFor(
      async () => {
        await expect(canvas.getByRole('button', { name: '1 of 6' })).toHaveAttribute(
          'aria-current',
          'true',
        )
        await expect(port.scrollLeft).toBeLessThan(2)
      },
      { timeout: 5000 },
    )

    /*
     * Without the correction the first slide rests short of its edge with a strip of the second
     * showing; up to a tenth of a slide, in proportion to the speed the scroller had reached,
     * hence the deliberate wait in the middle of the animation rather than at either end of it.
     */
    await userEvent.click(canvas.getByRole('button', { name: '5 of 6' }))
    await waitFor(async () => await expect(port.scrollLeft).toBeGreaterThan(0), { timeout: 5000 })
    await new Promise((resolve) => setTimeout(resolve, 700))
    const next = canvas.getByRole('button', { name: 'Next slide' })
    await userEvent.click(next)
    await new Promise((resolve) => setTimeout(resolve, 100))
    await userEvent.click(next)
    await new Promise((resolve) => setTimeout(resolve, 900))
    await expect(port.scrollLeft).toBeLessThan(2)
  },
}

/**
 * The component renders no pause button: autoplay pauses on hover and on keyboard focus, stops
 * on the last page unless the carousel loops, and `prefers-reduced-motion` disables it
 * outright.
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
     * The hover and focus pauses are not asserted here. This runner's iframe does not hold
     * document focus, so a programmatic `focus()` is followed by a real `focusout` and the
     * rotation resumes; the pauses are locked in jsdom instead, where both flags are driven
     * deterministically.
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
    // A lone slide is both ends at once: both controls disabled, one indicator
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeDisabled()
  },
}

/** A carousel inside another's slide. */
export const Nested: Story = {
  render: () => ({
    components: { VCarousel, VCarouselItem },
    setup: () => ({ slideStyle: SLIDE_STYLE, t }),
    template: `
      <VCarousel effect="fade" label="Outer">
        <VCarouselItem>
          <VCarousel label="Inner">
            <VCarouselItem v-for="hue in [160, 200]" :key="hue">
              <div :style="slideStyle + 'background: oklch(0.45 0.15 ' + hue + ');'">{{ t.slide }}</div>
            </VCarouselItem>
          </VCarousel>
        </VCarouselItem>
        <VCarouselItem v-for="hue in [280, 340]" :key="hue">
          <div :style="slideStyle + 'background: oklch(0.45 0.15 ' + hue + ');'">{{ t.slide }}</div>
        </VCarouselItem>
      </VCarousel>
    `,
  }),
  play: async ({ canvasElement }) => {
    const outer = canvasElement.querySelector('.v-carousel') as HTMLElement
    const inner = outer.querySelector('.v-carousel') as HTMLElement
    const port = outer.querySelector(
      ':scope > .v-carousel-stage > .v-carousel-viewport',
    ) as HTMLElement
    const controls = within(
      outer.querySelector(':scope > .v-carousel-stage > .v-carousel-controls') as HTMLElement,
    )
    const bar = within(outer.querySelector(':scope > .v-carousel-indicators') as HTMLElement)

    // The inner carousel does not inherit the outer `fade`.
    const innerEffect = inner.querySelector('.v-carousel-effect') as HTMLElement
    await expect(getComputedStyle(innerEffect).animationName.split(',')[0]?.trim()).toBe('none')

    const next = controls.getByRole('button', { name: 'Next slide' })
    next.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(
      async () => {
        await expect(bar.getByRole('button', { name: '2 of 3' })).toHaveAttribute(
          'aria-current',
          'true',
        )
        const slide = port.querySelector(':scope > [data-carousel-index="1"]') as HTMLElement
        await expect(
          Math.abs(slide.getBoundingClientRect().left - port.getBoundingClientRect().left),
        ).toBeLessThan(2)
      },
      { timeout: 3000 },
    )

    await userEvent.keyboard('{Enter}')
    await waitFor(
      async () => {
        await expect(next).toBeDisabled()
        await expect(controls.getByRole('button', { name: 'Previous slide' })).toHaveFocus()
      },
      { timeout: 3000 },
    )
  },
}
