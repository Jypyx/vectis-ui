import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VCombobox from '../VCombobox/VCombobox.vue'
import VDateInput from '../VDateInput/VDateInput.vue'
import VIconButton from '../VIconButton/VIconButton.vue'
import { search as searchIcon } from '../VIcon/icons/search'
import VTimeInput from '../VTimeInput/VTimeInput.vue'
import VInput from './VInput.vue'
import VInputGroup from './VInputGroup.vue'

const t = storyText({
  en: {
    phone: 'Phone number',
    phoneHint: 'Pick the country code, then type the rest',
    countryCode: 'Country code',
    number: 'Number',
    search: 'Search',
    searchPlaceholder: 'Search the archive',
    amount: 'Amount',
    currency: 'Currency',
    sizes: 'One row per height',
    invalid: 'The row in error',
    email: 'Email',
    disabled: 'The whole row switched off',
    schedule: 'Scheduled for',
    date: 'Date',
    time: 'Time',
    longLabel: 'A label long enough to wrap above a narrow row of two joined fields',
    veryLongOption: 'An option whose label is far wider than the field holding it',
  },
  fr: {
    phone: 'Numéro de téléphone',
    phoneHint: 'Choisissez l’indicatif, puis saisissez la suite',
    countryCode: 'Indicatif pays',
    number: 'Numéro',
    search: 'Rechercher',
    searchPlaceholder: 'Rechercher dans les archives',
    amount: 'Montant',
    currency: 'Devise',
    sizes: 'Une rangée par hauteur',
    invalid: 'La rangée en erreur',
    email: 'Adresse e-mail',
    disabled: 'La rangée entière éteinte',
    schedule: 'Prévu pour',
    date: 'Date',
    time: 'Heure',
    longLabel:
      'Un libellé assez long pour passer à la ligne au-dessus d’une rangée étroite de deux champs joints',
    veryLongOption: 'Une option dont le libellé dépasse largement le champ qui la porte',
  },
})

/** Demo data, deliberately left as data: a dialling code is not prose. */
const CODES = [
  { value: '+33', label: '+33 France' },
  { value: '+32', label: '+32 Belgium' },
  { value: '+41', label: '+41 Switzerland' },
  { value: '+1', label: '+1 United States' },
]

const CURRENCIES = [
  { value: 'eur', label: 'EUR' },
  { value: 'usd', label: 'USD' },
  { value: 'gbp', label: 'GBP' },
]

/**
 * The bordered boxes of a row, in render order: the elements the sheet paints. Typed as a
 * non-empty tuple, so a play function that lost a segment fails on the assertion rather than
 * on an undefined check.
 */
const boxes = (canvas: HTMLElement) =>
  [...canvas.querySelectorAll<HTMLElement>('.v-input-field, .v-input-group-row > .v-button')] as [
    HTMLElement,
    HTMLElement,
    ...HTMLElement[],
  ]

const meta = {
  title: 'Components/InputGroup',
  component: VInputGroup,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof VInputGroup>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The country code beside the number: two fields, one border between them. The combobox is
 * held to a fixed width with an inline `flex`, which is how proportions are set.
 */
export const Playground: Story = {
  args: { size: 'md' },
  render: (args) => ({
    components: { VInputGroup, VInput, VCombobox },
    setup() {
      const code = ref('+33')
      const number = ref('')
      return { args, t, code, number, CODES }
    },
    template: `
      <div style="inline-size: 24rem">
        <VInputGroup v-bind="args" :label="t.phone" :hint="t.phoneHint">
          <VCombobox
            v-model="code"
            :options="CODES"
            :aria-label="t.countryCode"
            style="flex: 0 0 9rem"
          />
          <VInput v-model="number" type="tel" :aria-label="t.number" />
        </VInputGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [code, number] = boxes(canvasElement)

    // The pull: each segment rides one pixel onto the one before it, so their two 1px
    // borders collapse into a single line. Red without `margin-inline-start: -1px`.
    const gap = number.getBoundingClientRect().left - code.getBoundingClientRect().right
    expect(gap).toBeCloseTo(-1, 0)

    // Only the two outer corners survive.
    expect(getComputedStyle(code).borderTopRightRadius).toBe('0px')
    expect(getComputedStyle(code).borderTopLeftRadius).not.toBe('0px')
    expect(getComputedStyle(number).borderTopLeftRadius).toBe('0px')
    expect(getComputedStyle(number).borderTopRightRadius).not.toBe('0px')

    // The label names the row once, and the segments are named individually.
    const group = canvasElement.querySelector('.v-input-group') as HTMLElement
    expect(group.getAttribute('role')).toBe('group')
    expect(within(canvasElement).getByRole('group', { name: 'Phone number' })).toBe(group)
  },
}

/**
 * A field and the button that acts on it. The button's own background covers the shared
 * edge, which is exactly what an attached search button should look like.
 */
export const SearchField: Story = {
  render: () => ({
    components: { VInputGroup, VInput, VIconButton },
    setup: () => ({ t, searchIcon }),
    template: `
      <div style="inline-size: 22rem">
        <VInputGroup :label="t.search">
          <VInput type="search" :placeholder="t.searchPlaceholder" :aria-label="t.search" />
          <VIconButton :icon="searchIcon" variant="solid" tone="accent" :label="t.search" />
        </VInputGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [field, button] = boxes(canvasElement)

    // The two boxes are the same height, which is what makes the row read as one object.
    expect(button.getBoundingClientRect().height).toBeCloseTo(
      field.getBoundingClientRect().height,
      0,
    )
    expect(button.getBoundingClientRect().left - field.getBoundingClientRect().right).toBeCloseTo(
      -1,
      0,
    )
    // The button keeps its square silhouette rather than being stretched by the row.
    expect(button.getBoundingClientRect().width).toBeCloseTo(
      button.getBoundingClientRect().height,
      0,
    )
  },
}

/**
 * The focus ring is a shadow drawn OUTSIDE the border box, so the focused segment has to
 * rise above the neighbour the pull brought over it.
 */
export const FocusRing: Story = {
  render: () => ({
    components: { VInputGroup, VInput, VButton },
    setup: () => ({ t }),
    template: `
      <div style="inline-size: 24rem">
        <VInputGroup :label="t.amount">
          <VInput :aria-label="t.amount" />
          <VInput :aria-label="t.currency" />
          <VButton variant="outline" tone="neutral">EUR</VButton>
        </VInputGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [first, second] = boxes(canvasElement)
    expect(getComputedStyle(first).zIndex).toBe('auto')

    // Red without the z-index rule: the neighbour, painted after, would slice the ring in
    // half along the shared edge.
    await userEvent.click(first.querySelector('input') as HTMLInputElement)
    await waitFor(() => expect(getComputedStyle(first).zIndex).toBe('2'))
    expect(getComputedStyle(second).zIndex).toBe('auto')

    await userEvent.click(second.querySelector('input') as HTMLInputElement)
    await waitFor(() => expect(getComputedStyle(second).zIndex).toBe('2'))
    expect(getComputedStyle(first).zIndex).toBe('auto')
  },
}

/**
 * A field in error keeps its red edge against its neighbour, and a focused field still comes
 * out on top of it.
 */
export const Invalid: Story = {
  render: () => ({
    components: { VInputGroup, VInput },
    setup: () => ({ t }),
    template: `
      <div style="inline-size: 24rem">
        <VInputGroup :label="t.invalid">
          <VInput invalid :aria-label="t.email" model-value="not-an-address" />
          <VInput :aria-label="t.number" />
        </VInputGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [bad, good] = boxes(canvasElement)
    expect(getComputedStyle(bad).zIndex).toBe('1')

    // Focus outranks the error, so the accent ring is never cut by the red edge beside it.
    await userEvent.click(good.querySelector('input') as HTMLInputElement)
    await waitFor(() => expect(getComputedStyle(good).zIndex).toBe('2'))
  },
}

/** The three heights, each one applied to the whole row at once. */
export const Sizes: Story = {
  render: () => ({
    components: { VInputGroup, VInput, VCombobox },
    setup: () => ({ t, CURRENCIES }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--vectis-space-4); inline-size: 24rem">
        <VInputGroup v-for="size in ['sm', 'md', 'lg']" :key="size" :size="size" :label="size">
          <VCombobox :options="CURRENCIES" model-value="eur" :aria-label="t.currency" style="flex: 0 0 7rem" />
          <VInput :aria-label="t.amount" />
        </VInputGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Within a row every box is the same height: the group's size beats whatever a segment
    // would have chosen for itself.
    for (const row of canvasElement.querySelectorAll<HTMLElement>('.v-input-group-row')) {
      const heights = [...row.querySelectorAll<HTMLElement>('.v-input-field')].map(
        (box) => box.getBoundingClientRect().height,
      )
      expect(heights[0]!).toBeCloseTo(heights[1]!, 0)
    }
  },
}

/**
 * The combobox panel is measured against the segment rather than the row, so a narrow code
 * field opens a narrow list. Ends with the panel OPEN, which is the only pass where axe sees
 * a listbox inside a group.
 */
export const WithCombobox: Story = {
  render: () => ({
    components: { VInputGroup, VInput, VCombobox },
    setup: () => ({ t, CODES }),
    template: `
      <div style="inline-size: 24rem">
        <VInputGroup :label="t.phone">
          <VCombobox :options="CODES" :aria-label="t.countryCode" style="flex: 0 0 9rem" />
          <VInput type="tel" :aria-label="t.number" />
        </VInputGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Country code' }))

    const panel = await waitFor(() => canvas.getByRole('listbox'))
    const control = canvasElement.querySelector('.v-combobox-control') as HTMLElement

    // The assertion itself has to be inside the waitFor: a panel enters on a
    // `transform: scale(0.97)`, and `getBoundingClientRect` reports the TRANSFORMED box, so
    // measuring on the first frame reads the panel three per cent short of its own width.
    await waitFor(() =>
      expect(panel.getBoundingClientRect().width).toBeGreaterThanOrEqual(
        control.getBoundingClientRect().width - 1,
      ),
    )
    // Left open on purpose: axe only audits what the play function leaves on screen.
  },
}

/**
 * A date and a time in one row. The time field carries its own AM/PM control inside the
 * field, so a 12 hour segment is a single box like any other and joins the row with no
 * treatment of its own.
 */
export const DateAndTime: Story = {
  render: () => ({
    components: { VInputGroup, VDateInput, VTimeInput },
    setup: () => ({ t }),
    template: `
      <div style="inline-size: 28rem">
        <VInputGroup :label="t.schedule">
          <VDateInput show-picker :aria-label="t.date" />
          <VTimeInput format="12h" :aria-label="t.time" />
        </VInputGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const dateField = canvasElement.querySelector('.v-date-input .v-input-field') as HTMLElement
    const timeField = canvasElement.querySelector('.v-time-input .v-input-field') as HTMLElement
    const meridiem = canvasElement.querySelector('.v-time-input-meridiem') as HTMLElement

    // The AM/PM button is inside the time field's own box, so the row joins two segments
    // and not three: nothing of the time field sits outside its border.
    expect(timeField.contains(meridiem)).toBe(true)
    // The borders are merged, which is the row's whole point.
    expect(
      timeField.getBoundingClientRect().left - dateField.getBoundingClientRect().right,
    ).toBeCloseTo(-1, 0)
  },
}

/** The row switched off as a whole, which no segment can opt out of. */
export const Disabled: Story = {
  render: () => ({
    components: { VInputGroup, VInput, VButton },
    setup: () => ({ t }),
    template: `
      <div style="inline-size: 24rem">
        <VInputGroup disabled :label="t.disabled" :hint="t.phoneHint">
          <VInput :aria-label="t.number" model-value="0600000000" />
          <VButton variant="solid" tone="accent">{{ t.search }}</VButton>
        </VInputGroup>
      </div>
    `,
  }),
}

/** Right to left: the row rounds its other end, and the pull follows the reading direction. */
export const RightToLeft: Story = {
  render: () => ({
    components: { VInputGroup, VInput, VCombobox },
    setup: () => ({ t, CODES }),
    template: `
      <div dir="rtl" style="inline-size: 24rem">
        <VInputGroup :label="t.phone">
          <VCombobox :options="CODES" :aria-label="t.countryCode" style="flex: 0 0 9rem" />
          <VInput type="tel" :aria-label="t.number" />
        </VInputGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [first, second] = boxes(canvasElement)
    // Mirrored: the second segment now sits to the LEFT of the first.
    expect(first.getBoundingClientRect().left - second.getBoundingClientRect().right).toBeCloseTo(
      -1,
      0,
    )
    // The logical corner properties follow, with no rule of their own.
    expect(getComputedStyle(first).borderTopLeftRadius).toBe('0px')
    expect(getComputedStyle(first).borderTopRightRadius).not.toBe('0px')
  },
}

/**
 * The edges: a label long enough to wrap above a narrow row, an option wider than the field
 * holding it, and a lone segment, which keeps all four of its corners.
 */
export const EdgeCases: Story = {
  render: () => ({
    components: { VInputGroup, VInput, VCombobox },
    setup: () => ({ t, CODES }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--vectis-space-6); inline-size: 18rem">
        <VInputGroup :label="t.longLabel">
          <VCombobox :options="CODES" :aria-label="t.countryCode" style="flex: 0 0 7rem" />
          <VInput type="tel" :aria-label="t.number" />
        </VInputGroup>

        <VInputGroup :label="t.currency">
          <VCombobox
            :options="[{ value: 'a', label: t.veryLongOption }]"
            model-value="a"
            :aria-label="t.currency"
          />
        </VInputGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // A lone segment is both the first and the last, so it keeps every corner.
    const alone = canvasElement.querySelectorAll<HTMLElement>('.v-input-field')[2]!
    expect(getComputedStyle(alone).borderTopLeftRadius).not.toBe('0px')
    expect(getComputedStyle(alone).borderTopRightRadius).not.toBe('0px')
  },
}
