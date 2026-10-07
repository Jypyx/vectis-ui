import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VSelect from './VSelect.vue'
import type { SelectItem } from './VSelect.vue'

// `Réunion` keeps its accent on purpose: typing `r` then `e` reaches it, the type-ahead matching
// regardless of accents.
const COUNTRIES = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgium' },
  { value: 'br', label: 'Brazil' },
  { value: 'ch', label: 'Switzerland' },
  { value: 'ca', label: 'Canada' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'mc', label: 'Monaco', disabled: true },
  { value: 're', label: 'Réunion' },
]

const GROUPED_COUNTRIES: SelectItem[] = [
  {
    label: 'Europe',
    options: [
      { value: 'fr', label: 'France' },
      { value: 'be', label: 'Belgium' },
      { value: 'ch', label: 'Switzerland' },
    ],
  },
  {
    label: 'America',
    options: [
      { value: 'ca', label: 'Canada' },
      { value: 'us', label: 'United States' },
      { value: 'br', label: 'Brazil' },
    ],
  },
  { separator: true },
  { value: 'other', label: 'Other / not listed', icon: 'help' },
]

const CAPITALS: Record<string, string> = {
  fr: 'Paris',
  be: 'Brussels',
  br: 'Brasília',
  ch: 'Bern',
  ca: 'Ottawa',
  lu: 'Luxembourg',
  mc: 'Monaco',
  re: 'Saint-Denis',
}

const t = storyText({
  en: {
    chooseCountry: 'Choose a country…',
    country: 'Country',
    countries: 'Countries',
    countryHint: 'The country shown on your invoices.',
    servedCountries: 'Served countries',
    billingCountry: 'Billing country',
    frozenHint: 'Set by your subscription.',
    required: 'Choose a country to continue.',
    submit: 'Submit',
    reset: 'Reset',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    moreCountries: (count: number) => `+${count} more ${count === 1 ? 'country' : 'countries'}`,
  },
  fr: {
    chooseCountry: 'Choisir un pays…',
    country: 'Pays',
    countries: 'Pays',
    countryHint: 'Le pays indiqué sur vos factures.',
    servedCountries: 'Pays desservis',
    billingCountry: 'Pays de facturation',
    frozenHint: 'Défini par votre abonnement.',
    required: 'Choisissez un pays pour continuer.',
    submit: 'Envoyer',
    reset: 'Réinitialiser',
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
    moreCountries: (count: number) => `+${count} ${count === 1 ? 'autre pays' : 'autres pays'}`,
  },
})

const meta = {
  title: 'Components/Select',
  component: VSelect,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    display: { control: 'inline-radio', options: ['chip', 'text'] },
    compact: { control: 'boolean' },
    clearable: { control: 'boolean' },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
  },
  args: { options: COUNTRIES },
} satisfies Meta<typeof VSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { VSelect },
    setup: () => ({ args, t, value: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; width: 300px">
        <VSelect v-bind="args" v-model="value" :placeholder="t.chooseCountry" :aria-label="t.country" />
        <output data-testid="mirror">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')

    // Type-ahead from the closed button: the letters add up to a prefix.
    trigger.focus()
    await userEvent.keyboard('re')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
    const active = () => canvasElement.querySelector('[role="option"][data-active]')
    await waitFor(() => expect(active()).toHaveTextContent('Réunion'))
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('re'))
    await expect(trigger).toHaveTextContent('Réunion')
    await expect(trigger).toHaveFocus()

    // Pressing the chevron hands no focus to the page, so it closes what it opened.
    const chevron = canvasElement.querySelector('.v-listbox-chevron')!
    await userEvent.click(chevron)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
    await userEvent.click(chevron)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(trigger).toHaveFocus()

    // A pointer choice keeps the focus on the button.
    await userEvent.click(trigger)
    await userEvent.click(await canvas.findByRole('option', { name: 'Canada' }))
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('ca'))
    await expect(trigger).toHaveFocus()
  },
}

/**
 * `label` is rendered above the field and `hint` below it, both tied to the button. Clicking the
 * label opens the list.
 */
export const WithLabelAndHint: Story = {
  render: (args) => ({
    components: { VSelect },
    setup: () => ({ args, t, value: ref('') }),
    template: `
      <div style="width: 300px">
        <VSelect v-bind="args" v-model="value" :label="t.country" :hint="t.countryHint" :placeholder="t.chooseCountry" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox', { name: 'Country' })

    await userEvent.click(trigger)
    const panel = await waitFor(() => canvas.getByRole('listbox'))

    // The panel opens against the field's box, covering the hint rather than starting below it.
    const fieldBox = canvasElement.querySelector('.v-input-field')!.getBoundingClientRect()
    const hintBox = canvasElement.querySelector('.v-field-hint')!.getBoundingClientRect()
    const panelTop = panel.getBoundingClientRect().top
    await expect(panelTop).toBeGreaterThanOrEqual(fieldBox.bottom)
    await expect(panelTop).toBeLessThan(hintBox.bottom)
  },
}

/**
 * An entry of `options` may be a **named group** (`{ label, options }`, rendered as
 * `role="group"`) or a **separator** (`{ separator: true }`), mixed with bare options. The
 * keyboard steps over both.
 */
export const Groups: Story = {
  args: { options: GROUPED_COUNTRIES },
  render: (args) => ({
    components: { VSelect },
    setup: () => ({ args, t, value: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; width: 300px">
        <VSelect v-bind="args" v-model="value" :placeholder="t.chooseCountry" :aria-label="t.country" />
        <output data-testid="mirror">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')

    trigger.focus()
    await userEvent.keyboard('{End}')
    const listbox = await waitFor(() => canvas.getByRole('listbox'))
    await expect(within(listbox).getAllByRole('group')).toHaveLength(2)
    await userEvent.keyboard('{ArrowUp}{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('br'))
  },
}

/**
 * `multiple` makes the value a list. The list stays open while options are toggled, and each
 * value becomes a chip whose cross removes it. While the field is not focused, `max` sums up the
 * values beyond it as "+X", which `overflowText` rephrases.
 */
export const Multiple: Story = {
  args: { multiple: true, max: 2 },
  render: (args) => ({
    components: { VSelect },
    setup: () => ({ args, t, value: ref(['fr', 'be', 'ca']) }),
    template: `
      <div style="display: grid; gap: 8px; width: 320px">
        <VSelect v-bind="args" v-model="value" :label="t.servedCountries" :placeholder="t.chooseCountry" :overflow-text="t.moreCountries" />
        <output data-testid="mirror">{{ value.join(',') }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')
    await expect(canvas.getByText('+1 more country')).toBeVisible()

    await userEvent.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
    // Under the focus every value is shown.
    await waitFor(() => expect(canvas.queryByText('+1 more country')).toBeNull())
    await userEvent.click(canvas.getByRole('option', { name: 'Brazil' }))
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('fr,be,ca,br'))
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await userEvent.keyboard('{Escape}')
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Belgium' }))
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('fr,ca,br'))
    await expect(trigger).toHaveFocus()
  },
}

/** `display="text"` spells the values out on one line, cut short with an ellipsis. */
export const MultipleText: Story = {
  args: { multiple: true, display: 'text' },
  render: (args) => ({
    components: { VSelect },
    setup: () => ({ args, t, value: ref(['fr', 'be', 'ch', 'ca', 'lu']) }),
    template: `
      <div style="width: 300px">
        <VSelect v-bind="args" v-model="value" :label="t.servedCountries" :placeholder="t.chooseCountry" />
      </div>
    `,
  }),
}

/** `clearable` offers a cross that empties the selection and gives the focus back to the field. */
export const Clearable: Story = {
  args: { clearable: true },
  render: (args) => ({
    components: { VSelect },
    setup: () => ({ args, t, value: ref('fr') }),
    template: `
      <div style="width: 300px">
        <VSelect v-bind="args" v-model="value" :label="t.country" :placeholder="t.chooseCountry" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }))
    await waitFor(() => expect(canvas.getByRole('combobox')).toHaveTextContent('Choose a country…'))
    await expect(canvas.getByRole('combobox')).toHaveFocus()
  },
}

/** `loading` puts a spinner in the place of the chevron while the options are being fetched. */
export const Loading: Story = {
  args: { loading: true },
  render: (args) => ({
    components: { VSelect },
    setup: () => ({ args, t, value: ref('') }),
    template: `
      <div style="width: 300px">
        <VSelect v-bind="args" v-model="value" :label="t.country" :placeholder="t.chooseCountry" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading…')
    await expect(canvasElement.querySelector('.v-listbox-chevron')).toBeNull()
  },
}

/** What `#option` receives lets a row show more than its label. */
export const CustomOption: Story = {
  render: (args) => ({
    components: { VSelect },
    setup: () => ({ args, t, capitals: CAPITALS, value: ref('') }),
    template: `
      <div style="width: 300px">
        <VSelect v-bind="args" v-model="value" :label="t.country" :placeholder="t.chooseCountry">
          <template #option="{ option }">
            <span style="display: flex; justify-content: space-between; gap: 8px">
              <span>{{ option.label }}</span>
              <span style="color: var(--vectis-color-text-muted)">{{ capitals[option.value] }}</span>
            </span>
          </template>
        </VSelect>
      </div>
    `,
  }),
}

/** `disabled`, `readonly` and `error`. A read-only field stays focusable but never opens. */
export const States: Story = {
  render: (args) => ({
    components: { VSelect },
    setup: () => ({ args, t }),
    template: `
      <div style="display: grid; gap: 16px; width: 300px">
        <VSelect v-bind="args" model-value="fr" :label="t.country" disabled />
        <VSelect v-bind="args" model-value="be" :label="t.billingCountry" :hint="t.frozenHint" readonly />
        <VSelect v-bind="args" model-value="" :label="t.country" :placeholder="t.chooseCountry" :error="t.required" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const readonly = canvas.getByRole('combobox', { name: 'Billing country' })
    await userEvent.click(readonly)
    await expect(readonly).toHaveFocus()
    await expect(readonly).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.getAllByRole('combobox', { name: 'Country' })[0]).toBeDisabled()
  },
}

/** Three heights, as every field of the design system. */
export const Sizes: Story = {
  render: (args) => ({
    components: { VSelect },
    setup: () => ({ args, t }),
    template: `
      <div style="display: grid; gap: 16px; width: 300px">
        <VSelect v-bind="args" size="sm" model-value="fr" :aria-label="t.small" />
        <VSelect v-bind="args" size="md" model-value="fr" :aria-label="t.medium" />
        <VSelect v-bind="args" size="lg" model-value="fr" :aria-label="t.large" />
      </div>
    `,
  }),
}

/**
 * A hidden native `<select>` carries `name`, `required` and the value into the form: the browser
 * validates it on submission, which marks the field invalid and focuses it, and a reset restores
 * the starting value.
 */
export const InAForm: Story = {
  render: (args) => ({
    components: { VSelect },
    setup: () => {
      const value = ref('')
      const submitted = ref('')
      const onSubmit = (event: SubmitEvent) => {
        submitted.value = new URLSearchParams(
          new FormData(event.target as HTMLFormElement) as unknown as Record<string, string>,
        ).toString()
      }
      return { args, t, value, submitted, onSubmit }
    },
    template: `
      <form style="display: grid; gap: 8px; width: 300px" @submit.prevent="onSubmit">
        <VSelect v-bind="args" v-model="value" name="country" required :label="t.country" :placeholder="t.chooseCountry" />
        <div style="display: flex; gap: 8px">
          <button type="submit">{{ t.submit }}</button>
          <button type="reset">{{ t.reset }}</button>
        </div>
        <output data-testid="submitted">{{ submitted }}</output>
      </form>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox', { name: 'Country' })

    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(trigger).toHaveAttribute('aria-invalid', 'true'))
    await expect(trigger).toHaveFocus()
    await expect(canvas.getByTestId('submitted')).toHaveTextContent('')

    await userEvent.keyboard('{ArrowDown}{Enter}')
    await waitFor(() => expect(trigger).not.toHaveAttribute('aria-invalid'))
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(canvas.getByTestId('submitted')).toHaveTextContent('country=fr'))

    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }))
    await waitFor(() => expect(trigger).toHaveTextContent('Choose a country…'))
  },
}
