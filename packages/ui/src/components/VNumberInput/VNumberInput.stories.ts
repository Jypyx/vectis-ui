import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VNumberInput from './VNumberInput.vue'
import type { NumberInputControls } from './VNumberInput.vue'

const t = storyText({
  en: {
    quantity: 'Quantity',
    quantityHint: 'Between 1 and 10.',
    split: 'Split',
    stacked: 'Stacked',
    none: 'None',
    price: 'Price',
    discount: 'Discount',
    distance: 'Distance',
    weight: 'Weight',
    weightHint: 'In steps of half a kilo.',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    disabled: 'Disabled',
    readonly: 'Read-only',
    seats: 'Seats',
    seatsError: 'Only 4 seats are left.',
    clearable: 'Clearable',
    clearableLoading: 'Clearable, loading',
    splitClearable: 'Split, clearable',
    splitLoading: 'Split, loading',
  },
  fr: {
    quantity: 'Quantité',
    quantityHint: 'Entre 1 et 10.',
    split: 'Séparés',
    stacked: 'Empilés',
    none: 'Aucun',
    price: 'Prix',
    discount: 'Remise',
    distance: 'Distance',
    weight: 'Poids',
    weightHint: 'Par pas d’un demi-kilo.',
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
    disabled: 'Désactivé',
    readonly: 'Lecture seule',
    seats: 'Places',
    seatsError: 'Il ne reste que 4 places.',
    clearable: 'Effaçable',
    clearableLoading: 'Effaçable, en chargement',
    splitClearable: 'Séparés, effaçable',
    splitLoading: 'Séparés, en chargement',
  },
})

const CONTROLS: NumberInputControls[] = ['split', 'stacked', 'none']

const meta = {
  title: 'Components/NumberInput',
  component: VNumberInput,
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    controls: { control: 'inline-radio', options: CONTROLS },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    compact: { control: 'boolean' },
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    clearable: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    min: 1,
    max: 10,
    step: 1,
    controls: 'split',
    size: 'md',
    compact: false,
    disabled: false,
    readonly: false,
    clearable: false,
    loading: false,
  },
  render: (args) => ({
    components: { VNumberInput },
    setup() {
      const value = ref<number | null>(2)
      return { args, t, value }
    },
    template: `
      <div style="max-width: 240px">
        <VNumberInput v-bind="args" v-model="value" :label="args.label ?? t.quantity" :hint="args.hint ?? t.quantityHint" />
      </div>
    `,
  }),
} satisfies Meta<typeof VNumberInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('spinbutton', { name: 'Quantity' }) as HTMLInputElement
    const plus = canvas.getByRole('button', { name: 'Increase' })

    await userEvent.click(field)
    await userEvent.keyboard('{ArrowUp}')
    await waitFor(() => expect(field).toHaveAttribute('aria-valuenow', '3'))

    // A press on a button moves the value and leaves the focus in the field.
    await userEvent.click(plus)
    await waitFor(() => expect(field).toHaveAttribute('aria-valuenow', '4'))
    expect(document.activeElement).toBe(field)

    // Typed past the maximum, the value is brought back to it when committed.
    await userEvent.clear(field)
    await userEvent.type(field, '25')
    await userEvent.tab()
    await waitFor(() => expect(field).toHaveAttribute('aria-valuenow', '10'))
    expect(plus).toBeDisabled()

    await userEvent.click(field)
    await userEvent.keyboard('{Home}')
    await waitFor(() => expect(field).toHaveAttribute('aria-valuenow', '1'))
  },
}

/** `controls` puts the buttons on either side, stacks them at the end, or removes them. */
export const Controls: Story = {
  render: () => ({
    components: { VNumberInput },
    setup() {
      const values = ref<Record<string, number | null>>({ split: 1, stacked: 1, none: 1 })
      return { t, values, controls: CONTROLS }
    },
    template: `
      <div style="display: grid; gap: 16px; max-width: 240px">
        <VNumberInput
          v-for="c in controls"
          :key="c"
          v-model="values[c]"
          :controls="c"
          :label="t[c]"
          :min="0"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const stacked = canvas.getByRole('spinbutton', { name: 'Stacked' })
    const [, up] = canvas.getAllByRole('button', { name: 'Increase' })
    await userEvent.click(up!)
    await waitFor(() => expect(stacked).toHaveAttribute('aria-valuenow', '2'))
    const none = canvas.getByRole('spinbutton', { name: 'None' })
    await userEvent.click(none)
    await userEvent.keyboard('{PageUp}')
    await waitFor(() => expect(none).toHaveAttribute('aria-valuenow', '11'))
  },
}

/**
 * `formatOptions` takes the options of `Intl.NumberFormat`: a currency, a percentage, a unit.
 * The value is formatted while the field is not being edited, and bare while it is.
 */
export const Formatting: Story = {
  render: () => ({
    components: { VNumberInput },
    setup() {
      const price = ref<number | null>(1249.9)
      const discount = ref<number | null>(0.15)
      const distance = ref<number | null>(42.195)
      return { t, price, discount, distance }
    },
    template: `
      <div style="display: grid; gap: 16px; max-width: 240px">
        <VNumberInput
          v-model="price"
          :label="t.price"
          :step="10"
          :min="0"
          :format-options="{ style: 'currency', currency: 'EUR' }"
        />
        <VNumberInput
          v-model="discount"
          :label="t.discount"
          :step="0.05"
          :min="0"
          :max="1"
          controls="stacked"
          :format-options="{ style: 'percent' }"
        />
        <VNumberInput
          v-model="distance"
          :label="t.distance"
          controls="none"
          :format-options="{ style: 'unit', unit: 'kilometer', maximumFractionDigits: 3 }"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const price = canvas.getByRole('spinbutton', { name: 'Price' }) as HTMLInputElement
    expect(price.value).toBe('€1,249.90')
    await userEvent.click(price)
    expect(price.value).toBe('1249.9')
    await userEvent.clear(price)
    await userEvent.type(price, '$2,000.5')
    await userEvent.tab()
    await waitFor(() => expect(price.value).toBe('€2,000.50'))

    const discount = canvas.getByRole('spinbutton', { name: 'Discount' }) as HTMLInputElement
    expect(discount).toHaveAttribute('aria-valuetext', '15%')
    await userEvent.click(discount)
    await userEvent.keyboard('{ArrowUp}')
    await userEvent.tab()
    await waitFor(() => expect(discount.value).toBe('20%'))
  },
}

/** A fractional `step` moves the value without floating-point drift. */
export const Step: Story = {
  render: () => ({
    components: { VNumberInput },
    setup() {
      const weight = ref<number | null>(0.5)
      return { t, weight }
    },
    template: `
      <div style="max-width: 240px">
        <VNumberInput
          v-model="weight"
          :label="t.weight"
          :hint="t.weightHint"
          :step="0.5"
          :min="0"
          :max="20"
          :format-options="{ style: 'unit', unit: 'kilogram' }"
        />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { VNumberInput },
    setup() {
      const value = ref<number | null>(3)
      return { t, value }
    },
    template: `
      <div style="display: grid; gap: 16px; max-width: 240px">
        <VNumberInput v-model="value" size="sm" :label="t.small" />
        <VNumberInput v-model="value" size="md" controls="stacked" :label="t.medium" />
        <VNumberInput v-model="value" size="lg" :label="t.large" />
      </div>
    `,
  }),
}

/** Disabled and read-only fields refuse the keys and the buttons alike. */
export const States: Story = {
  render: () => ({
    components: { VNumberInput },
    setup() {
      const value = ref<number | null>(3)
      return { t, value }
    },
    template: `
      <div style="display: grid; gap: 16px; max-width: 240px">
        <VNumberInput v-model="value" disabled :label="t.disabled" />
        <VNumberInput v-model="value" readonly controls="stacked" :label="t.readonly" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const readonly = canvas.getByRole('spinbutton', { name: 'Read-only' })
    await userEvent.click(readonly)
    await userEvent.keyboard('{ArrowUp}')
    expect(readonly).toHaveAttribute('aria-valuenow', '3')
  },
}

/**
 * Stacked buttons reach the end edge when they come last. Followed by the clear cross or the
 * spinner, they stay in the flow, between two dividers; in split, a rule follows the plus.
 */
export const StackedWithActions: Story = {
  render: () => ({
    components: { VNumberInput },
    setup() {
      const first = ref<number | null>(8)
      const second = ref<number | null>(8)
      const third = ref<number | null>(8)
      const fourth = ref<number | null>(8)
      return { t, first, second, third, fourth }
    },
    template: `
      <div style="display: grid; gap: 16px; max-width: 240px">
        <VNumberInput v-model="first" controls="stacked" clearable :label="t.clearable" />
        <VNumberInput v-model="second" controls="stacked" clearable loading :label="t.clearableLoading" />
        <VNumberInput v-model="third" clearable :label="t.splitClearable" />
        <VNumberInput v-model="fourth" loading :label="t.splitLoading" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const fields = canvasElement.querySelectorAll<HTMLElement>('.v-input-field')
    for (const field of [fields[0]!, fields[1]!]) {
      const stack = field.querySelector('.v-number-input-stack')!.getBoundingClientRect()
      const clear = field.querySelector('.v-input-clear')!.getBoundingClientRect()
      expect(stack.right).toBeLessThanOrEqual(clear.left)
    }
    const spinner = fields[1]!.querySelector('.v-spinner')!.getBoundingClientRect()
    const lastClear = fields[1]!.querySelector('.v-input-clear')!.getBoundingClientRect()
    expect(lastClear.right).toBeLessThanOrEqual(spinner.left)

    // In split, a rule follows the plus once the cross or the spinner comes after it.
    for (const field of [fields[2]!, fields[3]!]) {
      const plus = field.querySelector('[aria-label="Increase"]')!
      expect(plus.nextElementSibling).toHaveClass('v-number-input-divider')
    }
  },
}

export const WithError: Story = {
  render: () => ({
    components: { VNumberInput },
    setup() {
      const value = ref<number | null>(6)
      return { t, value }
    },
    template: `
      <div style="max-width: 240px">
        <VNumberInput v-model="value" :label="t.seats" :min="1" :error="t.seatsError" />
      </div>
    `,
  }),
}
