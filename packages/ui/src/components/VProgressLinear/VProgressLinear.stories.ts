import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VProgressLinear from './VProgressLinear.vue'

const t = storyText({
  en: {
    progress: 'Progress',
    accent: 'Accent',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    neutral: 'Neutral',
    purple: 'Purple',
    defaultThickness: '4px (the default)',
    start: 'Start',
    centre: 'Centre',
    end: 'End',
    almostDone: 'Almost done',
    filesSent: 'Files uploaded',
    files: 'files',
    spaceUsed: 'Space used',
    ofGb: (percent: number) => `${percent}% of 500 GB`,
    roundedDefault: 'Rounded (the default)',
    square: 'Square',
    thickSquare: 'Thick square',
    loading: 'Loading',
    syncing: 'Syncing',
    analysis: 'Analysis',
    default: 'Default',
    thickSquareBar: 'Thick square bar',
    withText: 'With text',
    indeterminate: 'Indeterminate',
    upload: 'Upload',
    zero: 'Zero',
    complete: 'Complete',
    outOfBounds: 'Out of bounds',
    defaultThicknessBar: 'Bar at the default thickness',
    veryLongText: 'Very long text',
    compressing: 'Compressing the project resources…',
  },
  fr: {
    progress: 'Progression',
    accent: 'Accent',
    success: 'Succès',
    warning: 'Avertissement',
    error: 'Erreur',
    neutral: 'Neutre',
    purple: 'Violet',
    defaultThickness: '4px (défaut)',
    start: 'Début',
    centre: 'Centre',
    end: 'Fin',
    almostDone: 'Presque fini',
    filesSent: 'Fichiers envoyés',
    files: 'fichiers',
    spaceUsed: 'Espace utilisé',
    ofGb: (percent: number) => `${percent} % de 500 Go`,
    roundedDefault: 'Arrondi (défaut)',
    square: 'Carré',
    thickSquare: 'Carré épais',
    loading: 'Chargement',
    syncing: 'Synchronisation',
    analysis: 'Analyse',
    default: 'Défaut',
    thickSquareBar: 'Barre épaisse carrée',
    withText: 'Avec texte',
    indeterminate: 'Indéterminé',
    upload: 'Envoi',
    zero: 'Zéro',
    complete: 'Complet',
    outOfBounds: 'Hors bornes',
    defaultThicknessBar: "Barre à l'épaisseur par défaut",
    veryLongText: 'Texte très long',
    compressing: 'Compression des ressources du projet en cours…',
  },
})

const meta = {
  title: 'Components/ProgressLinear',
  component: VProgressLinear,
  argTypes: {
    tone: { control: 'select', options: ['accent', 'success', 'warning', 'danger', 'neutral'] },
    shape: { control: 'select', options: ['rounded', 'square'] },
    valuePosition: { control: 'select', options: ['start', 'center', 'end'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
  args: {
    value: 40,
    max: 100,
    indeterminate: false,
    tone: 'accent',
    shape: 'rounded',
    valuePosition: 'center',
  },
  render: (args) => ({
    components: { VProgressLinear },
    setup: () => ({ args, t }),
    template:
      '<div style="width: 320px"><VProgressLinear v-bind="args" :aria-label="t.progress" /></div>',
  }),
} satisfies Meta<typeof VProgressLinear>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole('progressbar', { name: 'Progress' })
    await expect(bar).toHaveAttribute('aria-valuenow', '40')
    // real geometry: the fill is 40% of the track — the root IS the track
    // (unverifiable in jsdom)
    const fill = bar.querySelector('.v-progress-linear-fill')!
    await waitFor(() =>
      expect(fill.getBoundingClientRect().width).toBeCloseTo(
        bar.getBoundingClientRect().width * 0.4,
        0,
      ),
    )
  },
}

export const Tones: Story = {
  render: () => ({
    components: { VProgressLinear },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VProgressLinear tone="accent" :value="40" :aria-label="t.accent" />
        <VProgressLinear tone="success" :value="100" :aria-label="t.success" />
        <VProgressLinear tone="warning" :value="70" :aria-label="t.warning" />
        <VProgressLinear tone="danger" :value="25" :aria-label="t.error" />
        <VProgressLinear tone="neutral" :value="55" :aria-label="t.neutral" />
      </div>
    `,
  }),
}

/**
 * `color` replaces the tone: the fill takes the raw colour, and the track is derived
 * from it by `color-mix` towards the surface — hence adapted automatically to the
 * light theme as well as the dark one.
 */
export const CustomColor: Story = {
  render: () => ({
    components: { VProgressLinear },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VProgressLinear color="#7c3aed" :value="45" :aria-label="t.purple" />
        <VProgressLinear color="teal" :value="65" show-value aria-label="Teal" />
        <VProgressLinear color="oklch(72% 0.18 45)" :value="85" show-value aria-label="Orange" />
      </div>
    `,
  }),
}

export const Thickness: Story = {
  render: () => ({
    components: { VProgressLinear },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VProgressLinear :value="40" :aria-label="t.defaultThickness" />
        <VProgressLinear :thickness="8" :value="55" aria-label="8px" />
        <VProgressLinear :thickness="16" :value="70" aria-label="16px" />
        <!-- always pixels: a numeric string is equivalent to the number -->
        <VProgressLinear thickness="24" :value="85" aria-label="24px" />
      </div>
    `,
  }),
}

/**
 * The text is rendered as two complementary copies: one on the track, the other on the
 * filled portion and contrasted on the fill, each cut to its own side of the fill's
 * edge. It therefore stays readable at 5% as well as at 95%. The default thickness (4px)
 * cannot host it: displaying text implies a `thickness`.
 */
export const Value: Story = {
  render: () => ({
    components: { VProgressLinear },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VProgressLinear :thickness="20" show-value value-position="start" :value="35" :aria-label="t.start" />
        <VProgressLinear :thickness="20" show-value value-position="center" :value="35" :aria-label="t.centre" />
        <VProgressLinear :thickness="20" show-value value-position="end" :value="35" :aria-label="t.end" />
        <VProgressLinear :thickness="20" show-value value-position="center" :value="92" :aria-label="t.almostDone" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole('progressbar', { name: 'Centre' })
    const [base, onFill] = [...bar.querySelectorAll('.v-progress-linear-text')]
    // the contrasted copy is coloured by contrast: a colour distinct from the base's
    await expect(getComputedStyle(base!).color).not.toBe(getComputedStyle(onFill!).color)
    /*
     * Both copies are cut, on opposite sides of the fill's edge. The base copy's clip is
     * what stops the two colours from being painted over each other — without it the
     * glyphs on the filled portion carry a halo, and nothing else here goes red.
     */
    const baseClip = getComputedStyle(base!).clipPath
    const onFillClip = getComputedStyle(onFill!).clipPath
    await expect(baseClip).not.toBe('none')
    await expect(onFillClip).not.toBe('none')
    await expect(baseClip).not.toBe(onFillClip)
  },
}

/** The default slot receives `{ value, max, percent }` and replaces the percentage. */
export const CustomContent: Story = {
  render: () => ({
    components: { VProgressLinear },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VProgressLinear :value="3" :max="8" :thickness="24" :aria-label="t.filesSent">
          <template #default="{ value, max }">{{ value }}/{{ max }} {{ t.files }}</template>
        </VProgressLinear>
        <VProgressLinear :value="72" :thickness="24" value-position="end" :aria-label="t.spaceUsed">
          <template #default="{ percent }">{{ t.ofGb(Math.round(percent)) }}</template>
        </VProgressLinear>
      </div>
    `,
  }),
}

export const Square: Story = {
  render: () => ({
    components: { VProgressLinear },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VProgressLinear shape="rounded" :value="60" :aria-label="t.roundedDefault" />
        <VProgressLinear shape="square" :value="60" :aria-label="t.square" />
        <VProgressLinear shape="square" :value="60" :thickness="20" show-value :aria-label="t.thickSquare" />
      </div>
    `,
  }),
}

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: () => ({
    components: { VProgressLinear },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VProgressLinear indeterminate :aria-label="t.loading" />
        <VProgressLinear indeterminate tone="success" :thickness="8" :aria-label="t.syncing" />
        <VProgressLinear indeterminate color="teal" :thickness="12" shape="square" :aria-label="t.analysis" />
      </div>
    `,
  }),
}

/**
 * `orientation="vertical"`: 0 at the bottom, max at the top, through a plain
 * `writing-mode` on the root — the fill, the text and the indeterminate animation all
 * switch axis with no duplicated rule. The length is set in CSS (`height`), like the
 * width in horizontal.
 */
export const Vertical: Story = {
  render: () => ({
    components: { VProgressLinear },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: 32px; align-items: flex-end">
        <VProgressLinear orientation="vertical" :value="40" :aria-label="t.default" />
        <VProgressLinear orientation="vertical" :value="75" style="height: 240px" tone="success" aria-label="240px" />
        <VProgressLinear orientation="vertical" :value="30" :thickness="20" shape="square" tone="warning" :aria-label="t.thickSquareBar" />
        <VProgressLinear orientation="vertical" :value="60" :thickness="32" style="height: 200px" show-value :aria-label="t.withText" />
        <VProgressLinear orientation="vertical" indeterminate :thickness="12" :aria-label="t.indeterminate" />
      </div>
    `,
  }),
}

/** The progress animation plays on every change of value. */
export const Progression: Story = {
  render: () => ({
    components: { VProgressLinear },
    setup: () => {
      const value = ref(20)
      const bump = (d: number) => {
        value.value = Math.min(100, Math.max(0, value.value + d))
      }
      return { value, bump, t }
    },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VProgressLinear :value="value" :thickness="20" show-value :aria-label="t.upload" />
        <div style="display: flex; gap: 8px">
          <button type="button" @click="bump(-10)">−10</button>
          <button type="button" @click="bump(10)">+10</button>
          <button type="button" @click="value = 80">80%</button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole('progressbar', { name: 'Upload' })
    await userEvent.click(canvas.getByRole('button', { name: '80%' }))
    await waitFor(() => expect(bar).toHaveAttribute('aria-valuenow', '80'))
    // the transition converges on the target width
    const fill = bar.querySelector('.v-progress-linear-fill')!
    await waitFor(() =>
      expect(fill.getBoundingClientRect().width).toBeCloseTo(
        bar.getBoundingClientRect().width * 0.8,
        0,
      ),
    )
  },
}

/** A free `max`: the ARIA bounds stay faithful ("3 of 8"). */
export const CustomMax: Story = {
  args: { value: 3, max: 8, showValue: true, thickness: 20 },
}

export const EdgeCases: Story = {
  render: () => ({
    components: { VProgressLinear },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VProgressLinear :value="0" :thickness="20" show-value :aria-label="t.zero" />
        <VProgressLinear :value="100" :thickness="20" show-value :aria-label="t.complete" />
        <!-- past the max: clamped -->
        <VProgressLinear :value="250" :max="100" :thickness="20" show-value :aria-label="t.outOfBounds" />
        <!-- text taller than the bar: it overflows visibly, uncropped -->
        <VProgressLinear :value="45" show-value :aria-label="t.defaultThicknessBar" />
        <VProgressLinear :value="45" :thickness="24" :aria-label="t.veryLongText">
          <template #default>{{ t.compressing }}</template>
        </VProgressLinear>
      </div>
    `,
  }),
}
