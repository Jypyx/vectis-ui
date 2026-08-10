import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VTypography from '../VTypography/VTypography.vue'
import VProgressCircular from './VProgressCircular.vue'

const t = storyText({
  en: {
    progress: 'Progress',
    accent: 'Accent',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    neutral: 'Neutral',
    purple: 'Purple',
    defaultDiameter: '48px (the default)',
    stringDiameter: '96px (string)',
    defaultThickness: '4px (the default)',
    steps: 'Steps',
    outOf: (max: number) => `of ${max}`,
    done: 'Done',
    compression: 'Compression',
    roundedEnds: 'Rounded ends (the default)',
    bluntEnds: 'Blunt ends',
    loading: 'Loading',
    syncing: 'Syncing',
    analysis: 'Analysis',
    zero: 'Zero',
    complete: 'Complete',
    excessiveThickness: 'Excessive thickness',
    labelTooLong: 'Label too long',
    compressing: 'Compression under way',
  },
  fr: {
    progress: 'Progression',
    accent: 'Accent',
    success: 'Succès',
    warning: 'Avertissement',
    error: 'Erreur',
    neutral: 'Neutre',
    purple: 'Violet',
    defaultDiameter: '48px (défaut)',
    stringDiameter: '96px (string)',
    defaultThickness: '4px (défaut)',
    steps: 'Étapes',
    outOf: (max: number) => `sur ${max}`,
    done: 'Terminé',
    compression: 'Compression',
    roundedEnds: 'Bouts arrondis (défaut)',
    bluntEnds: 'Bouts francs',
    loading: 'Chargement',
    syncing: 'Synchronisation',
    analysis: 'Analyse',
    zero: 'Zéro',
    complete: 'Complet',
    excessiveThickness: 'Épaisseur excessive',
    labelTooLong: 'Label trop long',
    compressing: 'Compression en cours',
  },
})

const meta = {
  title: 'Components/ProgressCircular',
  component: VProgressCircular,
  argTypes: {
    tone: { control: 'select', options: ['accent', 'success', 'warning', 'danger', 'neutral'] },
    shape: { control: 'select', options: ['rounded', 'square'] },
  },
  args: { value: 65, max: 100, indeterminate: false, tone: 'accent', shape: 'rounded' },
  render: (args) => ({
    components: { VProgressCircular },
    setup: () => ({ args, t }),
    template: '<VProgressCircular v-bind="args" :aria-label="t.progress" />',
  }),
} satisfies Meta<typeof VProgressCircular>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar', { name: 'Progress' })
    await expect(bar).toHaveAttribute('aria-valuenow', '65')
    /*
     * Support canary: the whole geometry of the donut rests on the SVG2 geometry CSS
     * properties (cx/cy/r) on an <svg> with no viewBox. Were they not to apply, nothing
     * would be drawn — it is checked here rather than by eye (impossible in jsdom,
     * which has no SVG layout). Default diameter 48px, thickness 4px → r = 22px.
     */
    const barCircle = bar.querySelector('.v-progress-circular-bar')!
    await waitFor(() => expect(getComputedStyle(barCircle).r).toBe('22px'))
    // Chromium serializes the resolved calc() as "calc(35px)" in getComputedStyle
    // (parseFloat → NaN): the value is read through the typed OM.
    await waitFor(() => {
      const offset = barCircle.computedStyleMap().get('stroke-dashoffset') as CSSUnitValue
      expect(offset.value).toBeCloseTo(35, 0)
    })
  },
}

export const Tones: Story = {
  render: () => ({
    components: { VProgressCircular },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular tone="accent" :value="40" show-value :aria-label="t.accent" />
        <VProgressCircular tone="success" :value="100" show-value :aria-label="t.success" />
        <VProgressCircular tone="warning" :value="70" show-value :aria-label="t.warning" />
        <VProgressCircular tone="danger" :value="25" show-value :aria-label="t.error" />
        <VProgressCircular tone="neutral" :value="55" show-value :aria-label="t.neutral" />
      </div>
    `,
  }),
}

/**
 * `color` replaces the tone: the stroke takes the raw colour, and the track is derived
 * from it by `color-mix` towards the surface — hence adapted to the light theme as
 * well as the dark one.
 */
export const CustomColor: Story = {
  render: () => ({
    components: { VProgressCircular },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular color="#7c3aed" :value="45" show-value :aria-label="t.purple" />
        <VProgressCircular color="teal" :value="65" show-value aria-label="Teal" />
        <VProgressCircular color="oklch(72% 0.18 45)" :value="85" show-value aria-label="Orange" />
      </div>
    `,
  }),
}

export const Size: Story = {
  render: () => ({
    components: { VProgressCircular },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular :size="24" :thickness="3" :value="60" aria-label="24px" />
        <VProgressCircular :size="48" :value="60" :aria-label="t.defaultDiameter" />
        <VProgressCircular :size="80" :value="60" show-value aria-label="80px" />
        <!-- always pixels: a numeric string is equivalent to the number -->
        <VProgressCircular size="96" :value="60" show-value :aria-label="t.stringDiameter" />
      </div>
    `,
  }),
}

/** The thickness is independent of the diameter — the donut can become a disc. */
export const Thickness: Story = {
  render: () => ({
    components: { VProgressCircular },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular :size="72" :thickness="2" :value="60" aria-label="2px" />
        <VProgressCircular :size="72" :thickness="4" :value="60" :aria-label="t.defaultThickness" />
        <VProgressCircular :size="72" :thickness="8" :value="60" aria-label="8px" />
        <VProgressCircular :size="72" :thickness="16" :value="60" aria-label="16px" />
      </div>
    `,
  }),
}

/** The text size follows the diameter, floored at the smallest token. */
export const Value: Story = {
  render: () => ({
    components: { VProgressCircular },
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular :size="48" :value="35" show-value aria-label="48px" />
        <VProgressCircular :size="72" :value="35" show-value aria-label="72px" />
        <VProgressCircular :size="112" :value="35" show-value aria-label="112px" />
      </div>
    `,
  }),
}

/** The default slot receives `{ value, max, percent }`: in the centre, anything goes. */
export const CentreLabel: Story = {
  render: () => ({
    components: { VProgressCircular, VTypography },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 24px; align-items: center">
        <VProgressCircular :size="112" :thickness="10" :value="7" :max="10" :aria-label="t.steps">
          <template #default="{ value, max }">
            <span style="display: grid; gap: 2px; justify-items: center">
              <VTypography variant="heading-2" as="strong">{{ value }}</VTypography>
              <small style="opacity: 0.7">{{ t.outOf(max) }}</small>
            </span>
          </template>
        </VProgressCircular>
        <VProgressCircular :size="96" :value="100" tone="success" :aria-label="t.done">
          <template #default>
            <span class="material-symbols-rounded" aria-hidden="true" style="font-size: 2rem">check</span>
          </template>
        </VProgressCircular>
        <VProgressCircular :size="96" :thickness="8" :value="42" show-value :aria-label="t.compression" />
      </div>
    `,
  }),
}

export const Square: Story = {
  render: () => ({
    components: { VProgressCircular },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular :size="72" :thickness="10" :value="35" shape="rounded" :aria-label="t.roundedEnds" />
        <VProgressCircular :size="72" :thickness="10" :value="35" shape="square" :aria-label="t.bluntEnds" />
      </div>
    `,
  }),
}

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: () => ({
    components: { VProgressCircular },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular indeterminate :aria-label="t.loading" />
        <VProgressCircular indeterminate :size="72" :thickness="8" tone="success" :aria-label="t.syncing" />
        <VProgressCircular indeterminate :size="96" :thickness="4" shape="square" color="teal" :aria-label="t.analysis" />
      </div>
    `,
  }),
}

export const EdgeCases: Story = {
  render: () => ({
    components: { VProgressCircular },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <VProgressCircular :value="0" show-value :aria-label="t.zero" />
        <VProgressCircular :value="100" show-value :aria-label="t.complete" />
        <!-- a thickness ≥ the diameter: a zero radius, degrading cleanly (no SVG error) -->
        <VProgressCircular :size="48" :thickness="64" :value="50" :aria-label="t.excessiveThickness" />
        <!-- a label too long for the donut hole -->
        <VProgressCircular :size="72" :thickness="6" :value="50" :aria-label="t.labelTooLong">
          <template #default>{{ t.compressing }}</template>
        </VProgressCircular>
      </div>
    `,
  }),
}
