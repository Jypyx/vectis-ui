import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VToggle from './VToggle.vue'
import VToggleItem from './VToggleItem.vue'

const t = storyText({
  en: {
    alignment: 'Alignment',
    left: 'Left',
    centre: 'Centre',
    right: 'Right',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    favourites: 'Favourites',
    following: 'Following',
    saved: 'Saved',
    alignmentCompact: 'Alignment (compact)',
    groupDisabled: 'Group disabled',
    itemDisabled: 'Item disabled',
    periods: 'Periods',
    day: 'Day',
    veryLong: 'A particularly long period of time',
    customWeek: 'Custom rolling week',
  },
  fr: {
    alignment: 'Alignement',
    left: 'Gauche',
    centre: 'Centre',
    right: 'Droite',
    bold: 'Gras',
    italic: 'Italique',
    underline: 'Souligné',
    favourites: 'Favoris',
    following: 'Suivis',
    saved: 'Enregistrés',
    alignmentCompact: 'Alignement (compact)',
    groupDisabled: 'Groupe désactivé',
    itemDisabled: 'Item désactivé',
    periods: 'Périodes',
    day: 'Jour',
    veryLong: 'Une période de temps particulièrement longue',
    customWeek: 'Semaine glissante personnalisée',
  },
})

const meta = {
  title: 'Components/Toggle',
  component: VToggle,
  argTypes: {
    variant: { control: 'inline-radio', options: ['ghost', 'outline'] },
    tone: {
      control: 'inline-radio',
      options: ['accent', 'neutral', 'danger', 'success', 'warning'],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  args: {
    multiple: false,
    mandatory: false,
    attached: true,
    orientation: 'horizontal',
    variant: 'ghost',
    tone: 'accent',
    size: 'md',
    compact: false,
    disabled: false,
    selectedIconFilled: false,
    label: 'Alignment',
  },
  // A live v-model: without a local ref, clicking an item would change nothing.
  render: (args) => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ args, alignment: ref('left'), t }),
    template: `
      <VToggle v-bind="args" v-model="alignment">
        <VToggleItem value="left" :label="t.left" />
        <VToggleItem value="centre" :label="t.centre" />
        <VToggleItem value="right" :label="t.right" />
      </VToggle>
    `,
  }),
} satisfies Meta<typeof VToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Left' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await userEvent.click(canvas.getByRole('button', { name: 'Centre' }))
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Centre' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(canvas.getByRole('button', { name: 'Left' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })

    // clicking again: without `mandatory`, the item deselects
    await userEvent.click(canvas.getByRole('button', { name: 'Centre' }))
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Centre' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })
  },
}

export const Detached: Story = {
  args: { attached: false },
}

export const Variants: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({
      variants: ['ghost', 'outline'],
      attachments: [true, false],
      selection: ref('centre'),
      t,
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <template v-for="v in variants" :key="v">
          <VToggle
            v-for="a in attachments"
            :key="v + a"
            :variant="v"
            :attached="a"
            :label="t.alignment"
            v-model="selection"
          >
            <VToggleItem value="left" :label="t.left" />
            <VToggleItem value="centre" :label="t.centre" />
            <VToggleItem value="right" :label="t.right" />
          </VToggle>
        </template>
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({
      tones: ['accent', 'neutral', 'success', 'warning', 'danger'],
      selection: ref('centre'),
      t,
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VToggle v-for="tone in tones" :key="tone" :tone="tone" variant="outline" :label="t.alignment" v-model="selection">
          <VToggleItem value="left" :label="t.left" />
          <VToggleItem value="centre" :label="t.centre" />
          <VToggleItem value="right" :label="t.right" />
        </VToggle>
      </div>
    `,
  }),
}

export const Multiple: Story = {
  render: (args) => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ args, format: ref(['bold']), t }),
    template: `
      <VToggle v-bind="args" v-model="format">
        <VToggleItem value="bold" icon="format_bold" :aria-label="t.bold" />
        <VToggleItem value="italic" icon="format_italic" :aria-label="t.italic" />
        <VToggleItem value="underline" icon="format_underlined" :aria-label="t.underline" />
      </VToggle>
    `,
  }),
  args: { multiple: true, label: 'Format' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Italic' }))
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(canvas.getByRole('button', { name: 'Italic' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })
  },
}

export const Mandatory: Story = {
  args: { mandatory: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // clicking the only selection again does not remove it
    await userEvent.click(canvas.getByRole('button', { name: 'Left' }))
    await expect(canvas.getByRole('button', { name: 'Left' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  },
}

export const FilledIcons: Story = {
  render: (args) => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ args, shown: ref(['favourites']), t }),
    template: `
      <VToggle v-bind="args" v-model="shown">
        <VToggleItem value="favourites" icon="favorite" :label="t.favourites" />
        <VToggleItem value="following" icon="star" :label="t.following" />
        <VToggleItem value="saved" icon="bookmark" :label="t.saved" />
      </VToggle>
    `,
  }),
  args: { multiple: true, selectedIconFilled: true, label: 'Collections' },
}

export const SizesAndCompact: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      selection: ref('centre'),
      t,
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VToggle v-for="s in sizes" :key="s" :size="s" :label="t.alignment" v-model="selection">
          <VToggleItem value="left" :label="t.left" />
          <VToggleItem value="centre" :label="t.centre" />
          <VToggleItem value="right" :label="t.right" />
        </VToggle>
        <VToggle size="md" compact :label="t.alignmentCompact" v-model="selection">
          <VToggleItem value="left" :label="t.left" />
          <VToggleItem value="centre" :label="t.centre" />
          <VToggleItem value="right" :label="t.right" />
        </VToggle>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ group: ref('left'), item: ref('left'), t }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VToggle disabled :label="t.groupDisabled" v-model="group">
          <VToggleItem value="left" :label="t.left" />
          <VToggleItem value="centre" :label="t.centre" />
          <VToggleItem value="right" :label="t.right" />
        </VToggle>
        <VToggle :label="t.itemDisabled" v-model="item">
          <VToggleItem value="left" :label="t.left" />
          <VToggleItem value="centre" :label="t.centre" disabled />
          <VToggleItem value="right" :label="t.right" />
        </VToggle>
      </div>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ selection: ref('centre'), t }),
    template: `
      <div style="display: flex; gap: 32px; align-items: start">
        <VToggle orientation="vertical" :label="t.alignment" v-model="selection">
          <VToggleItem value="left" :label="t.left" />
          <VToggleItem value="centre" :label="t.centre" />
          <VToggleItem value="right" :label="t.right" />
        </VToggle>
        <VToggle orientation="vertical" :attached="false" variant="outline" :label="t.alignment" v-model="selection">
          <VToggleItem value="left" :label="t.left" />
          <VToggleItem value="centre" :label="t.centre" />
          <VToggleItem value="right" :label="t.right" />
        </VToggle>
      </div>
    `,
  }),
}

export const EdgeCases: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ selection: ref('long'), t }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start; max-width: 480px">
        <VToggle :label="t.periods" v-model="selection">
          <VToggleItem value="short" :label="t.day" />
          <VToggleItem value="long" :label="t.veryLong" />
          <VToggleItem value="other" :label="t.customWeek" />
        </VToggle>
      </div>
    `,
  }),
}

export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    canvas.getByRole('button', { name: 'Left' }).focus()

    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('button', { name: 'Centre' })).toHaveFocus()
    // focus does not select
    await expect(canvas.getByRole('button', { name: 'Centre' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    await userEvent.keyboard('{End}')
    await expect(canvas.getByRole('button', { name: 'Right' })).toHaveFocus()
  },
}
