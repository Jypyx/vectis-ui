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
    withoutLine: 'Without a line',
    withLine: 'With a line',
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
    withoutLine: 'Sans trait',
    withLine: 'Avec trait',
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
    selectedVariant: { control: 'inline-radio', options: ['solid', 'soft', 'ghost'] },
    tone: {
      control: 'inline-radio',
      options: ['accent', 'neutral', 'danger'],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  args: {
    multiple: false,
    mandatory: false,
    detached: false,
    seamless: false,
    orientation: 'horizontal',
    variant: 'ghost',
    selectedVariant: 'solid',
    tone: 'accent',
    size: 'md',
    compact: false,
    elevated: false,
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
  args: { detached: true },
}

export const Variants: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({
      variants: ['ghost', 'outline'],
      detachments: [false, true],
      selection: ref('centre'),
      t,
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <template v-for="v in variants" :key="v">
          <VToggle
            v-for="d in detachments"
            :key="v + d"
            :variant="v"
            :detached="d"
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

export const SelectedVariants: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({
      selectedVariants: ['solid', 'soft', 'ghost'],
      variants: ['ghost', 'outline'],
      selection: ref('centre'),
      t,
    }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <template v-for="s in selectedVariants" :key="s">
          <VToggle
            v-for="v in variants"
            :key="s + v"
            :variant="v"
            :selected-variant="s"
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
  /*
   * `soft` and `ghost` leave VButton's border transparent, which would open a gap in an
   * outline row's frame for the width of the selected segment. None of this is visible
   * in jsdom, which computes no styles at all.
   */
  play: async ({ canvasElement }) => {
    const TRANSPARENT = 'rgba(0, 0, 0, 0)'
    const selectedIn = (row: string, selected: string) =>
      canvasElement.querySelector<HTMLElement>(
        `.v-toggle[data-variant="${row}"] > .v-toggle-item[aria-pressed="true"][data-variant="${selected}"]`,
      ) as HTMLElement

    for (const variant of ['soft', 'ghost']) {
      const item = selectedIn('outline', variant)
      const neighbour = item.previousElementSibling as HTMLElement
      const frame = getComputedStyle(item)

      // the frame closes over the selection, in the colour the rest of the row paints
      await expect(frame.borderBlockStartColor).toBe(
        getComputedStyle(neighbour).borderBlockStartColor,
      )
      await expect(frame.borderBlockEndColor).not.toBe(TRANSPARENT)
      // The row is lined here, so the shared edges are painted too and the border runs
      // right round the segment. Seamless is where the two rules arbitrate, and that
      // case is the `Seamless` story's.
      await expect(frame.borderInlineStartColor).not.toBe(TRANSPARENT)
    }

    // a ghost row has no frame, so nothing is restored there
    await expect(getComputedStyle(selectedIn('ghost', 'soft')).borderBlockStartColor).toBe(
      TRANSPARENT,
    )
  },
}

export const Seamless: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({ lined: ref('centre'), plain: ref('centre'), t }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VToggle variant="outline" :label="t.withLine" v-model="lined">
          <VToggleItem value="left" :label="t.left" />
          <VToggleItem value="centre" :label="t.centre" />
          <VToggleItem value="right" :label="t.right" />
        </VToggle>
        <VToggle
          seamless
          variant="outline"
          selected-variant="soft"
          :label="t.withoutLine"
          v-model="plain"
        >
          <VToggleItem value="left" :label="t.left" />
          <VToggleItem value="centre" :label="t.centre" />
          <VToggleItem value="right" :label="t.right" />
        </VToggle>
      </div>
    `,
  }),
  /*
   * What the seamless row itself does — no seam, no shared borders — belongs to
   * VButtonGroup and is asserted in its own `Seamless` story. What is only true HERE is
   * the arbitration between the two sheets, and this is the case that exercises it: the
   * SELECTED segment is `soft`, so VToggle restores its four borders to close the outline
   * frame, and the group then has to take the two shared ones back off. Those rules are
   * doubled to (0,6,0) for exactly this, and at equal specificity the winner would be
   * whichever sheet the bundler put last.
   *
   * The middle item is the selected one, which is why it is the one read.
   */
  play: async ({ canvasElement }) => {
    const TRANSPARENT = 'rgba(0, 0, 0, 0)'
    const itemsOf = (row: HTMLElement) => [...row.querySelectorAll<HTMLElement>('.v-toggle-item')]
    const [, plain] = [...canvasElement.querySelectorAll<HTMLElement>('.v-toggle')]

    const centre = getComputedStyle(itemsOf(plain as HTMLElement)[1] as HTMLElement)
    // The group wins on the edges the segment shares…
    await expect(centre.borderInlineStartColor).toBe(TRANSPARENT)
    await expect(centre.borderInlineEndColor).toBe(TRANSPARENT)
    // …and the frame stands everywhere else, which is what keeps it closed.
    await expect(centre.borderBlockStartColor).not.toBe(TRANSPARENT)
    await expect(centre.borderBlockEndColor).not.toBe(TRANSPARENT)
  },
}

export const Tones: Story = {
  render: () => ({
    components: { VToggle, VToggleItem },
    setup: () => ({
      tones: ['accent', 'neutral', 'danger'],
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
        <VToggle orientation="vertical" detached variant="outline" :label="t.alignment" v-model="selection">
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
