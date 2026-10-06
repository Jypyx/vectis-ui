import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VMeter from './VMeter.vue'

const t = storyText({
  en: {
    storage: 'Storage',
    storageUsed: '7.2 GB of 10 GB',
    battery: 'Battery',
    cpu: 'CPU load',
    humidity: 'Humidity',
    temperature: 'Temperature',
    strength: 'Password strength',
    strengths: ['Weak', 'Fair', 'Good', 'Strong'],
    weaker: 'Weaker',
    stronger: 'Stronger',
    accent: 'Accent',
    neutral: 'Neutral',
    success: 'Success',
    warning: 'Warning',
    danger: 'Danger',
    purple: 'Purple',
    small: 'Small',
    medium: 'Medium (the default)',
    large: 'Large',
    quota: 'Quota',
  },
  fr: {
    storage: 'Stockage',
    storageUsed: '7,2 Go sur 10 Go',
    battery: 'Batterie',
    cpu: 'Charge du processeur',
    humidity: 'Humidité',
    temperature: 'Température',
    strength: 'Robustesse du mot de passe',
    strengths: ['Faible', 'Moyenne', 'Bonne', 'Robuste'],
    weaker: 'Moins robuste',
    stronger: 'Plus robuste',
    accent: 'Accent',
    neutral: 'Neutre',
    success: 'Succès',
    warning: 'Avertissement',
    danger: 'Danger',
    purple: 'Violet',
    small: 'Petite',
    medium: 'Moyenne (défaut)',
    large: 'Grande',
    quota: 'Quota',
  },
})

const meta = {
  title: 'Components/Meter',
  component: VMeter,
  argTypes: {
    tone: {
      control: 'select',
      options: [undefined, 'accent', 'neutral', 'success', 'warning', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    segments: { control: { type: 'number', min: 1, max: 20 } },
  },
  args: {
    value: 64,
    min: 0,
    max: 100,
    hideLabel: false,
    hideValue: false,
    segments: 1,
    size: 'md',
  },
  render: (args) => ({
    components: { VMeter },
    setup: () => ({ args, t }),
    template: '<div style="width: 320px"><VMeter v-bind="args" :label="t.storage" /></div>',
  }),
} satisfies Meta<typeof VMeter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const meter = canvas.getByRole('meter', { name: 'Storage' })
    await expect(meter).toHaveAttribute('aria-valuenow', '64')
    await expect(meter).toHaveAttribute('aria-valuetext', '64%')
    await expect(canvas.getByText('64%')).toBeVisible()
    // Real geometry, which jsdom cannot check: the fill covers 64% of the track.
    const fill = meter.querySelector('.v-meter-fill')!
    await waitFor(() =>
      expect(fill.getBoundingClientRect().width).toBeCloseTo(
        meter.getBoundingClientRect().width * 0.64,
        0,
      ),
    )
  },
}

/**
 * `low`, `high` and `optimum` place the value in a region, as with the native `<meter>`: the
 * region holding the optimum is good, the one next to it average, the far one poor.
 */
export const Regions: Story = {
  render: () => ({
    components: { VMeter },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 20px; width: 320px">
        <VMeter :label="t.humidity" :value="45" :low="30" :high="60" />
        <VMeter :label="t.cpu" :value="55" :low="30" :high="70" :optimum="0" />
        <VMeter :label="t.battery" :value="12" :low="20" :high="50" :optimum="100" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tone = (name: string) =>
      canvas.getByRole('meter', { name }).closest('.v-meter')!.getAttribute('data-tone')
    await expect(tone('Humidity')).toBe('success')
    await expect(tone('CPU load')).toBe('warning')
    await expect(tone('Battery')).toBe('danger')
  },
}

/** `tone` fixes the colour whatever the region; `color` takes one of your own. */
export const Tones: Story = {
  render: () => ({
    components: { VMeter },
    setup: () => ({ t, tones: ['accent', 'neutral', 'success', 'warning', 'danger'] as const }),
    template: `
      <div style="display: grid; gap: 20px; width: 320px">
        <VMeter v-for="tone in tones" :key="tone" :tone="tone" :label="t[tone]" :value="60" />
        <VMeter color="#7c3aed" :label="t.purple" :value="60" />
      </div>
    `,
  }),
}

/**
 * The value is a percentage of the range by default. `formatOptions` formats the value itself
 * for the locale, and `valueText` replaces it with words of your own.
 */
export const ValueText: Story = {
  render: () => ({
    components: { VMeter },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 20px; width: 320px">
        <VMeter :label="t.humidity" :value="45" />
        <VMeter
          :label="t.temperature"
          :value="21.5"
          :min="-10"
          :max="40"
          :format-options="{ style: 'unit', unit: 'celsius' }"
        />
        <VMeter :label="t.storage" :value="7.2" :max="10" :value-text="t.storageUsed" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('meter', { name: 'Temperature' })).toHaveAttribute(
      'aria-valuetext',
      '21.5°C',
    )
    await expect(canvas.getByRole('meter', { name: 'Storage' })).toHaveAttribute(
      'aria-valuetext',
      '7.2 GB of 10 GB',
    )
  },
}

/**
 * `segments` splits the bar into equal parts. The fill runs through them in order, so a value
 * between two steps fills part of a segment.
 */
export const Segments: Story = {
  render: () => ({
    components: { VMeter },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 20px; width: 320px">
        <VMeter
          :label="t.strength"
          :value="3"
          :max="4"
          :low="1.5"
          :high="2.5"
          :optimum="4"
          :segments="4"
          :value-text="t.strengths[2]"
        />
        <VMeter :label="t.battery" :value="70" :low="20" :high="50" :optimum="100" :segments="5" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole('meter', { name: 'Battery' })
    const segments = [...meter.querySelectorAll('.v-meter-segment')]
    await expect(segments).toHaveLength(5)
    // 70% of five segments: three full, the fourth half full, the last empty.
    const fill = (index: number) =>
      segments[index]!.querySelector('.v-meter-fill')!.getBoundingClientRect().width /
      segments[index]!.getBoundingClientRect().width
    await waitFor(() => expect(fill(2)).toBeCloseTo(1, 1))
    await waitFor(() => expect(fill(3)).toBeCloseTo(0.5, 1))
    await expect(fill(4)).toBe(0)
  },
}

/** The fill and its tone follow the value as it changes. */
export const Live: Story = {
  render: () => ({
    components: { VMeter, VButton },
    setup: () => {
      const strength = ref(1)
      const text = computed(() => t.value.strengths[strength.value - 1])
      return { t, strength, text }
    },
    template: `
      <div style="display: grid; gap: 16px; width: 320px">
        <VMeter
          :label="t.strength"
          :value="strength"
          :min="0"
          :max="4"
          :low="1.5"
          :high="2.5"
          :optimum="4"
          :segments="4"
          :value-text="text"
        />
        <div style="display: flex; gap: 8px">
          <VButton variant="outline" size="sm" :disabled="strength <= 1" @click="strength--">
            {{ t.weaker }}
          </VButton>
          <VButton variant="outline" size="sm" :disabled="strength >= 4" @click="strength++">
            {{ t.stronger }}
          </VButton>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const meter = canvas.getByRole('meter', { name: 'Password strength' })
    const root = meter.closest('.v-meter')!
    await expect(root).toHaveAttribute('data-tone', 'danger')
    await userEvent.click(canvas.getByRole('button', { name: 'Stronger' }))
    await waitFor(() => expect(root).toHaveAttribute('data-tone', 'warning'))
    await userEvent.click(canvas.getByRole('button', { name: 'Stronger' }))
    await waitFor(() => expect(meter).toHaveAttribute('aria-valuenow', '3'))
    await expect(meter).toHaveAttribute('aria-valuetext', 'Good')
    await expect(root).toHaveAttribute('data-tone', 'success')
  },
}

/** Three thicknesses, with smaller text at the smallest. */
export const Sizes: Story = {
  render: () => ({
    components: { VMeter },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 20px; width: 320px">
        <VMeter size="sm" :label="t.small" :value="40" />
        <VMeter size="md" :label="t.medium" :value="40" />
        <VMeter size="lg" :label="t.large" :value="40" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const height = (name: RegExp) =>
      canvas.getByRole('meter', { name }).getBoundingClientRect().height
    await expect(height(/^Small/)).toBe(4)
    await expect(height(/^Medium/)).toBe(8)
    await expect(height(/^Large/)).toBe(12)
  },
}

/**
 * `hideLabel` and `hideValue` remove the text above the bar. The label still names it and the
 * value is still read from it.
 */
export const HiddenText: Story = {
  render: () => ({
    components: { VMeter },
    setup: () => ({ t }),
    template: `
      <div style="width: 320px">
        <VMeter :label="t.quota" :value="30" hide-label hide-value />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole('meter', { name: 'Quota' })
    await expect(meter).toHaveAttribute('aria-valuetext', '30%')
    // Nothing above the bar: the root is exactly as tall as the bar.
    await expect(meter.closest('.v-meter')!.getBoundingClientRect().height).toBe(
      meter.getBoundingClientRect().height,
    )
  },
}

/** In a right-to-left page the bar fills from the right, and the value sits on the left. */
export const RightToLeft: Story = {
  render: () => ({
    components: { VMeter },
    setup: () => ({ t }),
    template: `
      <div dir="rtl" style="width: 320px">
        <VMeter :label="t.storage" :value="30" :segments="3" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole('meter', { name: 'Storage' })
    const first = meter.querySelector('.v-meter-segment')!
    const box = meter.getBoundingClientRect()
    await expect(first.getBoundingClientRect().right).toBeCloseTo(box.right, 0)
    const fill = first.querySelector('.v-meter-fill')!
    await waitFor(() =>
      expect(fill.getBoundingClientRect().right).toBeCloseTo(
        first.getBoundingClientRect().right,
        0,
      ),
    )
  },
}
