import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { computed } from 'vue'

import { storyText } from '../../stories/storyText'
import VMeterGroup, { type MeterGroupItem } from './VMeterGroup.vue'

const t = storyText({
  en: {
    storage: 'Storage',
    documents: 'Documents',
    photos: 'Photos',
    apps: 'Apps',
    system: 'System',
    budget: 'Budget',
    rent: 'Rent',
    food: 'Food',
    transport: 'Transport',
    leisure: 'Leisure',
    overflow: 'Over the quota',
    used: (used: string, total: string) => `${used} of ${total}`,
    free: 'free',
    rightToLeft: 'Right to left',
  },
  fr: {
    storage: 'Stockage',
    documents: 'Documents',
    photos: 'Photos',
    apps: 'Applications',
    system: 'Système',
    budget: 'Budget',
    rent: 'Loyer',
    food: 'Alimentation',
    transport: 'Transport',
    leisure: 'Loisirs',
    overflow: 'Au-delà du quota',
    used: (used: string, total: string) => `${used} sur ${total}`,
    free: 'libre',
    rightToLeft: 'De droite à gauche',
  },
})

const storage = computed<MeterGroupItem[]>(() => [
  { label: t.value.documents, value: 32 },
  { label: t.value.photos, value: 24 },
  { label: t.value.apps, value: 18 },
  { label: t.value.system, value: 12, tone: 'neutral' },
])

const GB: Intl.NumberFormatOptions = { style: 'unit', unit: 'gigabyte' }

const meta = {
  title: 'Components/MeterGroup',
  component: VMeterGroup,
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  args: {
    max: 128,
    showValue: true,
    hideLabel: false,
    hideLegend: false,
    size: 'md',
    orientation: 'horizontal',
  },
  render: (args) => ({
    components: { VMeterGroup },
    setup: () => ({ args, t, storage }),
    template:
      '<div style="width: 360px"><VMeterGroup v-bind="args" :items="storage" :label="t.storage" /></div>',
  }),
} satisfies Meta<typeof VMeterGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('group', { name: 'Storage' })
    await expect(within(group).getAllByRole('listitem')).toHaveLength(4)
    await expect(within(group).getByText('67%')).toBeVisible()
    // Real geometry, which jsdom cannot check: the parts keep the ratio of their amounts.
    const [documents, photos] = [...group.querySelectorAll('.v-meter-group-part')]
    await waitFor(() =>
      expect(
        documents!.getBoundingClientRect().width / photos!.getBoundingClientRect().width,
      ).toBeCloseTo(32 / 24, 1),
    )
  },
}

/**
 * A part without `tone` or `color` turns the accent's hue by the golden angle for its position, so
 * neighbours stay apart; the first is the accent itself. `tone` and `color` fix a part's colour.
 */
export const Colours: Story = {
  render: () => ({
    components: { VMeterGroup },
    setup: () => ({
      t,
      items: computed<MeterGroupItem[]>(() => [
        { label: t.value.rent, value: 40 },
        { label: t.value.food, value: 20 },
        { label: t.value.transport, value: 10 },
        { label: t.value.leisure, value: 8, color: '#db2777' },
      ]),
    }),
    template: `
      <div style="width: 360px">
        <VMeterGroup :items="items" :label="t.budget" show-value />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const parts = [...canvasElement.querySelectorAll('.v-meter-group-part')]
    const colours = parts.map((part) => getComputedStyle(part).backgroundColor)
    await expect(new Set(colours).size).toBe(4)
  },
}

/** `formatOptions` formats the sum and every amount; `valueText` replaces the sum. */
export const Formatted: Story = {
  render: () => ({
    components: { VMeterGroup },
    setup: () => ({ t, storage, GB }),
    template: `
      <div style="width: 360px">
        <VMeterGroup
          :items="storage"
          :max="128"
          :label="t.storage"
          :format-options="GB"
          :value-text="t.used('86 GB', '128 GB')"
          show-value
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('86 GB of 128 GB')).toBeVisible()
    await expect(canvas.getByText('32 GB')).toBeVisible()
  },
}

/** When the amounts add up to more than `max`, the parts share the whole bar in proportion. */
export const Overflow: Story = {
  render: () => ({
    components: { VMeterGroup },
    setup: () => ({ t, storage }),
    template: `
      <div style="width: 360px">
        <VMeterGroup :items="storage" :max="64" :label="t.overflow" show-value />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Over the quota' })
    await expect(group.querySelector('.v-meter-group-rest')).toBeNull()
    await expect(within(group).getByText('100%')).toBeVisible()
  },
}

/** The slots replace the sum and each row's swatch, label and amount. */
export const Slots: Story = {
  render: () => ({
    components: { VMeterGroup },
    setup: () => ({ t, storage }),
    template: `
      <div style="width: 360px">
        <VMeterGroup :items="storage" :max="128" :label="t.storage" show-value>
          <template #value="{ value, max }">{{ max - value }} GB {{ t.free }}</template>
          <template #item-label="{ item, index }">{{ index + 1 }}. {{ item.label }}</template>
          <template #item-value="{ item }">{{ item.value }} GB</template>
        </VMeterGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('42 GB free')).toBeVisible()
    await expect(canvas.getByText('1. Documents')).toBeVisible()
  },
}

/** Five thicknesses shared with VMeter and VProgressLinear. */
export const Sizes: Story = {
  render: () => ({
    components: { VMeterGroup },
    setup: () => ({ storage, sizes: ['xs', 'sm', 'md', 'lg', 'xl'] as const }),
    template: `
      <div style="display: grid; gap: 20px; width: 360px">
        <VMeterGroup v-for="size in sizes" :key="size" :size="size" :label="size" :items="storage" :max="128" hide-legend />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const height = (name: string) =>
      within(canvasElement)
        .getByRole('group', { name })
        .querySelector('.v-meter-group-track')!
        .getBoundingClientRect().height
    await expect(height('xs')).toBe(2)
    await expect(height('md')).toBe(8)
    await expect(height('xl')).toBe(20)
  },
}

/**
 * Upright, the bar fills from the bottom up and the legend stands beside it. A height on the
 * component sets the bar's length.
 */
export const Vertical: Story = {
  render: () => ({
    components: { VMeterGroup },
    setup: () => ({ t, storage }),
    template: `
      <div style="display: flex; gap: 48px">
        <VMeterGroup orientation="vertical" :items="storage" :max="128" :label="t.storage" show-value size="lg" />
        <div dir="rtl">
          <VMeterGroup orientation="vertical" :items="storage" :max="128" :label="t.rightToLeft" size="lg" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const name of ['Storage', 'Right to left']) {
      const group = canvas.getByRole('group', { name })
      const track = group.querySelector('.v-meter-group-track')!.getBoundingClientRect()
      const first = group.querySelector('.v-meter-group-part')!.getBoundingClientRect()
      await expect(Math.abs(first.bottom - track.bottom)).toBeLessThan(1)
      // The legend stands beside the bar rather than below it.
      const legend = group.querySelector('.v-meter-group-legend')!.getBoundingClientRect()
      await expect(legend.top).toBeLessThan(track.bottom)
    }
  },
}

/** In a right-to-left page the bar fills from the right. */
export const RightToLeft: Story = {
  render: () => ({
    components: { VMeterGroup },
    setup: () => ({ t, storage }),
    template: `
      <div dir="rtl" style="width: 360px">
        <VMeterGroup :items="storage" :max="128" :label="t.storage" show-value />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Storage' })
    const track = group.querySelector('.v-meter-group-track')!.getBoundingClientRect()
    const first = group.querySelector('.v-meter-group-part')!.getBoundingClientRect()
    await expect(first.right).toBeCloseTo(track.right, 0)
  },
}
