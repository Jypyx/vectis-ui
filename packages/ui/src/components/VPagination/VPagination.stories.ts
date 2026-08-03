import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VPagination from './VPagination.vue'

const t = storyText({
  en: { back: 'Back', forward: 'Forward' },
  fr: { back: 'Reculer', forward: 'Avancer' },
})

const meta = {
  title: 'Components/Pagination',
  component: VPagination,
  argTypes: {
    variant: { control: 'inline-radio', options: ['ghost', 'outline'] },
    tone: {
      control: 'inline-radio',
      options: ['accent', 'neutral', 'danger', 'success', 'warning'],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    controlsDisplay: { control: 'inline-radio', options: ['icon', 'text', 'both'] },
  },
  args: {
    length: 20,
    totalVisible: 7,
    attached: false,
    variant: 'ghost',
    tone: 'accent',
    size: 'md',
    compact: false,
    align: 'start',
    showControls: true,
    controlsDisplay: 'icon',
    disabled: false,
    responsive: true,
  },
  // A live v-model: without a local ref, clicking a page would change nothing.
  render: (args) => ({
    components: { VPagination },
    setup: () => ({ args, page: ref(10) }),
    template: `<VPagination v-bind="args" v-model="page" />`,
  }),
} satisfies Meta<typeof VPagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Page 10' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Page 11' })).toHaveAttribute(
        'aria-current',
        'page',
      )
    })
  },
}

export const Attached: Story = {
  args: { attached: true, variant: 'outline' },
}

export const Variants: Story = {
  render: () => ({
    components: { VPagination },
    setup: () => ({ ghost: ref(6), outline: ref(6) }),
    // The active page is always `solid`: only the inactive pages follow the variant.
    template: `
      <div style="display: grid; gap: 16px">
        <VPagination :length="12" variant="ghost" v-model="ghost" />
        <VPagination :length="12" variant="outline" v-model="outline" />
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { VPagination },
    setup: () => ({ tones: ['accent', 'neutral', 'success', 'warning', 'danger'], page: ref(3) }),
    template: `
      <div style="display: grid; gap: 16px">
        <VPagination v-for="t in tones" :key="t" :length="8" :tone="t" v-model="page" />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { VPagination },
    setup: () => ({ sizes: ['xs', 'sm', 'md', 'lg', 'xl'], page: ref(3) }),
    template: `
      <div style="display: grid; gap: 16px">
        <VPagination v-for="s in sizes" :key="s" :length="8" :size="s" v-model="page" />
      </div>
    `,
  }),
}

export const Compact: Story = {
  render: () => ({
    components: { VPagination },
    setup: () => ({ normal: ref(3), compact: ref(3) }),
    template: `
      <div style="display: grid; gap: 16px">
        <VPagination :length="8" v-model="normal" />
        <VPagination :length="8" compact v-model="compact" />
      </div>
    `,
  }),
}

export const Controls: Story = {
  render: () => ({
    components: { VPagination },
    setup: () => ({ a: ref(4), b: ref(4), c: ref(4), d: ref(4), e: ref(4), t }),
    // Custom icons: a Material Symbols name OR an image URL.
    template: `
      <div style="display: grid; gap: 16px">
        <VPagination :length="10" controls-display="icon" v-model="a" />
        <VPagination :length="10" controls-display="text" v-model="b" />
        <VPagination :length="10" controls-display="both" v-model="c" />
        <VPagination
          :length="10"
          controls-display="both"
          prev-icon="first_page"
          next-icon="last_page"
          :prev-label="t.back"
          :next-label="t.forward"
          v-model="d"
        />
        <VPagination :length="10" :show-controls="false" v-model="e" />
      </div>
    `,
  }),
}

export const DisabledPages: Story = {
  render: () => ({
    components: { VPagination },
    setup: () => ({ list: ref(5), predicate: ref(5) }),
    // The controls step over the disabled pages to the nearest activatable one.
    template: `
      <div style="display: grid; gap: 16px">
        <VPagination :length="12" :disabled-pages="[4, 6]" v-model="list" />
        <VPagination :length="12" :disabled-pages="(p) => p % 2 === 0" v-model="predicate" />
      </div>
    `,
  }),
}

export const Responsive: Story = {
  render: () => ({
    components: { VPagination },
    setup: () => ({ page: ref(10) }),
    // The nav is its own query container: the truncation follows the width of the
    // frame, not the viewport's. The panel is resizable by its handle (bottom
    // right corner, CSS resize — hence the overflow: hidden): the neighbours fall
    // away in steps as it narrows, while the first, the last and the current page
    // always remain.
    template: `
      <div
        style="
          width: 640px;
          max-width: 100%;
          resize: horizontal;
          overflow: hidden;
          border: 1px dashed var(--vectis-color-border);
          padding: 8px;
        "
      >
        <VPagination :length="40" :total-visible="9" v-model="page" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // At the initial width (~39rem) the full window fits: the next steps
    // (1 … 9 10 11 … 40, then 1 … 10 … 40) are observed with the handle.
    const nav = canvasElement.querySelector('.v-pagination')
    const visiblePages = [...nav!.querySelectorAll<HTMLElement>('.v-pagination-page')]
      .filter((el) => getComputedStyle(el).display !== 'none')
      .map((el) => el.textContent?.trim())

    await expect(visiblePages).toEqual(['1', '8', '9', '10', '11', '12', '40'])
  },
}

export const Alignment: Story = {
  render: () => ({
    components: { VPagination },
    setup: () => ({ aligns: ['start', 'center', 'end'], page: ref(3) }),
    // The nav is block-level and takes the full available width, so the alignment
    // goes through the `align` prop.
    template: `
      <div style="display: grid; gap: 16px; border: 1px dashed var(--vectis-color-border); padding: 8px">
        <VPagination v-for="a in aligns" :key="a" :length="8" :align="a" v-model="page" />
      </div>
    `,
  }),
}

export const ManyPages: Story = {
  args: { length: 120, totalVisible: 9 },
  render: (args) => ({
    components: { VPagination },
    setup: () => ({ args, page: ref(60) }),
    template: `<VPagination v-bind="args" v-model="page" />`,
  }),
}

export const EdgeCases: Story = {
  render: () => ({
    components: { VPagination },
    setup: () => ({ one: ref(1), two: ref(1), long: ref(9999) }),
    template: `
      <div style="display: grid; gap: 16px">
        <VPagination :length="1" v-model="one" />
        <VPagination :length="2" v-model="two" />
        <!-- 4-digit numbers: the pills widen beyond the square. Without
             totalVisible, all 12,000 pages would be rendered. -->
        <VPagination :length="12000" :total-visible="7" v-model="long" />
        <!-- Responsive truncation off: the row overflows rather than shrinking. -->
        <VPagination :length="12000" :total-visible="7" :responsive="false" v-model="long" />
      </div>
    `,
  }),
}
