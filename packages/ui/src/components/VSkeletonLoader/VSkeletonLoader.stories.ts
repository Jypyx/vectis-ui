import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VAvatar from '../VAvatar/VAvatar.vue'
import VButton from '../VButton/VButton.vue'
import VChip from '../VChip/VChip.vue'
import VInput from '../VInput/VInput.vue'
import VTypography from '../VTypography/VTypography.vue'
import VSkeletonLoader from './VSkeletonLoader.vue'

const t = storyText({
  en: {
    component: 'Component',
    skeleton: 'Skeleton',
    save: 'Save',
    activeFilter: 'Active filter',
    name: 'Name',
    salesAnalysis: 'Sales analysis',
    salesBody: 'The quarter closes on a 12% rise in revenue.',
    salesBodyLong: 'The quarter closes on a 12% rise in revenue, driven by annual subscriptions.',
    load: 'Load',
    reload: 'Reload',
    loadingResults: 'Loading the results…',
    zeroLines: 'lines = 0 → one line all the same',
    twelveLines: '12 lines in 120px of height (compression)',
    surfaceInParent: 'a surface in a parent with a defined height: it takes it',
    circleInWideParent: 'a circle in a very wide parent: it stays round',
    tightLeading: 'tight line-height: the gutter does not go negative',
    explicitHeight: 'explicit height: it wins over shape and size',
  },
  fr: {
    component: 'Composant',
    skeleton: 'Skeleton',
    save: 'Enregistrer',
    activeFilter: 'Filtre actif',
    name: 'Nom',
    salesAnalysis: 'Analyse des ventes',
    salesBody: "Le trimestre s'achève sur une progression de 12 % du chiffre d'affaires.",
    salesBodyLong:
      "Le trimestre s'achève sur une progression de 12 % du chiffre d'affaires, portée par les abonnements annuels.",
    load: 'Charger',
    reload: 'Recharger',
    loadingResults: 'Chargement des résultats…',
    zeroLines: 'lines = 0 → une ligne quand même',
    twelveLines: '12 lignes dans 120px de haut (compression)',
    surfaceInParent: 'surface dans un parent de hauteur définie : elle la prend',
    circleInWideParent: 'cercle dans un parent très large : il reste rond',
    tightLeading: 'line-height serré : la gouttière ne devient pas négative',
    explicitHeight: 'hauteur explicite : elle prime sur shape et size',
  },
})

const meta = {
  title: 'Components/SkeletonLoader',
  component: VSkeletonLoader,
  argTypes: {
    shape: { control: 'select', options: ['text', 'control', 'pill', 'circle', 'surface'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    animation: { control: 'select', options: ['wave', 'pulse', 'none'] },
    lines: { control: { type: 'number', min: 1, max: 12, step: 1 } },
    color: { control: 'color' },
  },
  args: {
    shape: 'text',
    size: 'md',
    compact: false,
    lines: 3,
    animation: 'wave',
    announce: false,
  },
  render: (args) => ({
    components: { VSkeletonLoader },
    setup: () => ({ args }),
    // a silhouette needs a width to be seen: the component has no intrinsic one,
    // it is up to the container to give it (the VProgressLinear idiom)
    template: '<div style="width: 320px"><VSkeletonLoader v-bind="args" /></div>',
  }),
} satisfies Meta<typeof VSkeletonLoader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const item = canvasElement.querySelector('.v-skeleton-item')!

    // Wiring canary: jsdom sees neither pseudo-elements nor keyframes. Goes red if
    // the animation is renamed, mis-layered, or if the ::after disappears.
    await waitFor(() =>
      expect(getComputedStyle(item, '::after').animationName).toBe('v-skeleton-wave'),
    )

    // Relative colour syntax canary: were `oklch(from …)` unsupported,
    // `--skeleton-highlight` would be invalid at computed-value time, the whole
    // declaration would go with it (it contains a var()) and the gradient would fall
    // back to `none` — an invisible band, with no console error at all.
    await expect(getComputedStyle(item, '::after').backgroundImage).not.toBe('none')

    // The last line of a paragraph is shortened: that detail is what reads as a
    // "block of text" rather than a "table".
    const items = canvasElement.querySelectorAll('.v-skeleton-item')
    const first = items[0]!.getBoundingClientRect().width
    const last = items[items.length - 1]!.getBoundingClientRect().width
    await expect(last).toBeLessThan(first)
  },
}

/**
 * Each shape sets a design system radius and a height rule. `text` follows the
 * inherited typography, `control`/`pill`/`circle` the control scale, and `surface` a
 * dedicated token.
 */
export const Shapes: Story = {
  render: () => ({
    components: { VSkeletonLoader },
    setup: () => ({
      shapes: ['text', 'control', 'pill', 'circle', 'surface'] as const,
    }),
    template: `
      <div style="display: grid; gap: 20px; width: 320px">
        <div v-for="shape in shapes" :key="shape" style="display: grid; gap: 4px">
          <small style="color: var(--vectis-color-text-muted)">{{ shape }}</small>
          <VSkeletonLoader :shape="shape" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // one silhouette per shape, in the order of the `shapes` array
    const items = canvasElement.querySelectorAll('.v-skeleton-item')

    // the circle transfers its width from its height
    const circle = items[3]!.getBoundingClientRect()
    await waitFor(() => expect(circle.width).toBeCloseTo(circle.height, 0))
    // the surface takes the height of its token (96px)
    await expect(items[4]!.getBoundingClientRect().height).toBeCloseTo(96, 0)
    // the line of text is at the font's height, not a control's
    await expect(items[0]!.getBoundingClientRect().height).toBeLessThan(24)
  },
}

/**
 * Both animations lighten the silhouette with the same highlight derived from the
 * background: `wave` sends it across, `pulse` raises and lowers it in place. `none`
 * freezes. The wave reads mostly on large surfaces.
 */
export const Animations: Story = {
  render: () => ({
    components: { VSkeletonLoader },
    setup: () => ({ animations: ['wave', 'pulse', 'none'] as const }),
    template: `
      <div style="display: grid; gap: 20px; width: 360px">
        <div v-for="a in animations" :key="a" style="display: grid; gap: 4px">
          <small style="color: var(--vectis-color-text-muted)">{{ a }}</small>
          <VSkeletonLoader shape="surface" :animation="a" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [wave, pulse, none] = canvasElement.querySelectorAll('.v-skeleton-item')

    // Both animations share the layer and LIGHTEN: a pulse rendered through the
    // silhouette's opacity would fade towards the page background, hence darken in a
    // dark theme. The pulse's layer is a flat fill.
    await waitFor(() =>
      expect(getComputedStyle(pulse!, '::after').animationName).toBe('v-skeleton-pulse'),
    )
    await expect(getComputedStyle(pulse!, '::after').backgroundImage).toBe('none')
    await expect(getComputedStyle(wave!, '::after').backgroundImage).not.toBe('none')
    // `none` sets no layer at all: the rule is qualified by data-animation
    await expect(getComputedStyle(none!, '::after').content).toBe('none')
  },
}

/**
 * `size` and `compact` take the design system's control scale (24/32/40/48/56px): an
 * `md` skeleton is exactly the height of an `md` VButton. No effect on `text` and
 * `surface`, which have a rule of their own.
 */
export const Sizes: Story = {
  render: () => ({
    components: { VSkeletonLoader },
    setup: () => ({ sizes: ['xs', 'sm', 'md', 'lg', 'xl'] as const }),
    template: `
      <div style="display: grid; gap: 20px">
        <div style="display: flex; gap: 12px; align-items: flex-start">
          <VSkeletonLoader v-for="s in sizes" :key="s" shape="circle" :size="s" />
        </div>
        <div style="display: grid; gap: 8px; width: 240px">
          <VSkeletonLoader v-for="s in sizes" :key="s" shape="control" :size="s" />
        </div>
        <div style="display: grid; gap: 8px; width: 240px">
          <!-- compact: -4px of height, as everywhere else in the DS -->
          <VSkeletonLoader shape="control" size="md" />
          <VSkeletonLoader shape="control" size="md" compact />
        </div>
      </div>
    `,
  }),
}

/**
 * In `shape="text"`, the height is `1em` and the gutter the leading: N lines occupy
 * exactly N lines of text, whatever the parent's typography — replacing them with the
 * real content does not shift the layout.
 */
export const Paragraph: Story = {
  render: () => ({
    components: { VSkeletonLoader },
    template: `
      <div style="display: grid; gap: 24px; width: 360px">
        <div style="font-size: var(--vectis-text-body-sm-size); line-height: var(--vectis-text-body-sm-leading)">
          <VSkeletonLoader :lines="5" />
        </div>
        <div style="font-size: var(--vectis-text-heading-2-size); line-height: var(--vectis-text-heading-2-leading)">
          <VSkeletonLoader :lines="2" />
        </div>
      </div>
    `,
  }),
}

/**
 * The component's promise: reproducing the silhouette of any design system
 * component. On the left the real component, on the right its skeleton — same shape,
 * same size, same rhythm.
 */
export const DesignSystemSilhouettes: Story = {
  render: () => ({
    components: { VSkeletonLoader, VAvatar, VButton, VChip, VInput, VTypography },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px 32px; width: 560px; align-items: start">
        <VTypography variant="overline" tone="muted" as="p">{{ t.component }}</VTypography>
        <VTypography variant="overline" tone="muted" as="p">{{ t.skeleton }}</VTypography>

        <VButton size="md">{{ t.save }}</VButton>
        <VSkeletonLoader shape="control" size="md" width="128" />

        <VAvatar size="lg" name="Ada Lovelace" />
        <VSkeletonLoader shape="circle" size="lg" />

        <VChip size="xs">{{ t.activeFilter }}</VChip>
        <VSkeletonLoader shape="pill" size="xs" width="88" />

        <VInput size="md" :label="t.name" model-value="Ada Lovelace" />
        <!-- the label is a line of text, the field a control silhouette -->
        <div style="display: grid; gap: 4px">
          <VSkeletonLoader width="40%" />
          <VSkeletonLoader shape="control" size="md" />
        </div>

        <div style="border: 1px solid var(--vectis-color-border); border-radius: var(--vectis-radius-surface); padding: 16px; display: grid; gap: 12px">
          <VTypography variant="heading-4">{{ t.salesAnalysis }}</VTypography>
          <VTypography variant="body-sm" tone="muted">{{ t.salesBody }}</VTypography>
        </div>
        <div style="border: 1px solid var(--vectis-color-border); border-radius: var(--vectis-radius-surface); padding: 16px; display: grid; gap: 12px">
          <VSkeletonLoader shape="control" size="sm" width="60%" />
          <VSkeletonLoader :lines="3" />
        </div>
      </div>
    `,
  }),
}

/**
 * There is no wrapper mode: the component never measures the content it replaces.
 * The idiom is a `v-if`/`v-else`, with `aria-busy` on the container — it is the
 * container that carries the announcement, not the placeholder.
 */
export const ProgressiveReplacement: Story = {
  render: () => ({
    components: { VSkeletonLoader, VButton, VTypography },
    setup: () => ({ pending: ref(true), t }),
    template: `
      <div style="display: grid; gap: 16px; width: 360px">
        <VButton size="sm" variant="outline" @click="pending = !pending">
          {{ pending ? t.load : t.reload }}
        </VButton>
        <div :aria-busy="pending || undefined" style="display: grid; gap: 8px">
          <template v-if="pending">
            <VSkeletonLoader shape="control" size="sm" width="55%" />
            <VSkeletonLoader :lines="3" />
          </template>
          <template v-else>
            <VTypography variant="heading-4">{{ t.salesAnalysis }}</VTypography>
            <VTypography variant="body-sm" tone="muted">{{ t.salesBodyLong }}</VTypography>
          </template>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvasElement.querySelectorAll('.v-skeleton-item').length).toBeGreaterThan(0)

    await canvas.getByRole('button', { name: 'Load' }).click()
    await waitFor(() => expect(canvasElement.querySelector('.v-skeleton')).toBeNull())
  },
}

/**
 * `color` replaces the background; the wave's highlight is derived from it by an
 * OKLCH lightness delta, so it stays correct on an unusual surface as well as in a
 * dark theme, with no second setting.
 */
export const CustomColor: Story = {
  render: () => ({
    components: { VSkeletonLoader },
    template: `
      <div style="display: grid; gap: 20px; width: 360px">
        <VSkeletonLoader shape="surface" color="oklch(55% 0.14 265)" />
        <div style="background: var(--vectis-color-surface-inverse); border-radius: var(--vectis-radius-surface); padding: 16px; display: grid; gap: 8px">
          <VSkeletonLoader shape="control" size="sm" color="oklch(38% 0.01 260)" width="60%" />
          <VSkeletonLoader :lines="3" color="oklch(38% 0.01 260)" />
        </div>
      </div>
    `,
  }),
}

/**
 * A skeleton is decorative by default: twelve silhouettes must not produce twelve
 * announcements. `announce` (or `label`, which implies it) is set on **one** instance
 * per zone only.
 */
export const Announcement: Story = {
  render: () => ({
    components: { VSkeletonLoader },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <!-- a single, situated announcement; the rest stay silent -->
        <VSkeletonLoader shape="control" size="sm" :label="t.loadingResults" />
        <VSkeletonLoader v-for="n in 11" :key="n" shape="control" size="sm" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('status')).toHaveLength(1)
  },
}

/**
 * Degenerate containers, imposed heights and out-of-bounds values: the silhouette
 * degrades without ever disappearing.
 */
export const EdgeCases: Story = {
  render: () => ({
    components: { VSkeletonLoader },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 24px">
        <div style="display: grid; gap: 4px">
          <small style="color: var(--vectis-color-text-muted)">{{ t.zeroLines }}</small>
          <div style="width: 200px"><VSkeletonLoader :lines="0" /></div>
        </div>

        <div style="display: grid; gap: 4px">
          <small style="color: var(--vectis-color-text-muted)">{{ t.twelveLines }}</small>
          <div style="width: 200px; height: 120px"><VSkeletonLoader :lines="12" /></div>
        </div>

        <div style="display: grid; gap: 4px">
          <small style="color: var(--vectis-color-text-muted)">{{ t.surfaceInParent }}</small>
          <div style="width: 200px; height: 40px"><VSkeletonLoader shape="surface" /></div>
        </div>

        <div style="display: grid; gap: 4px">
          <small style="color: var(--vectis-color-text-muted)">{{ t.circleInWideParent }}</small>
          <div style="width: 480px"><VSkeletonLoader shape="circle" size="xl" /></div>
        </div>

        <div style="display: grid; gap: 4px">
          <small style="color: var(--vectis-color-text-muted)">{{ t.tightLeading }}</small>
          <div style="width: 200px; line-height: 0.5"><VSkeletonLoader :lines="3" /></div>
        </div>

        <div style="display: grid; gap: 4px">
          <small style="color: var(--vectis-color-text-muted)">{{ t.explicitHeight }}</small>
          <div style="width: 200px"><VSkeletonLoader shape="control" size="xs" height="72" /></div>
        </div>
      </div>
    `,
  }),
}
