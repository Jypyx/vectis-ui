import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VChip from '../VChip/VChip.vue'
import VCombobox from './VCombobox.vue'
import type { ComboboxItem, ComboboxOption } from './VCombobox.vue'

// `Réunion` keeps its accent on purpose: it is what the accent-insensitive search is
// demonstrated on in the Default story.
const COUNTRIES = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgium' },
  { value: 'ch', label: 'Switzerland' },
  { value: 'ca', label: 'Canada' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'mc', label: 'Monaco', disabled: true },
  { value: 're', label: 'Réunion' },
  { value: 'ci', label: "Côte d'Ivoire" },
]

const GROUPED_COUNTRIES: ComboboxItem[] = [
  {
    label: 'Europe',
    options: [
      { value: 'fr', label: 'France' },
      { value: 'be', label: 'Belgium' },
      { value: 'ch', label: 'Switzerland' },
      { value: 'lu', label: 'Luxembourg' },
      { value: 'mc', label: 'Monaco', disabled: true },
    ],
  },
  { separator: true },
  {
    label: 'Africa',
    options: [
      { value: 're', label: 'Réunion' },
      { value: 'ci', label: "Côte d'Ivoire" },
      { value: 'ma', label: 'Morocco' },
      { value: 'cm', label: 'Cameroon' },
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
  ch: 'Bern',
  ca: 'Ottawa',
  lu: 'Luxembourg',
  mc: 'Monaco',
  re: 'Saint-Denis',
  ci: 'Yamoussoukro',
}

const t = storyText({
  en: {
    chooseCountry: 'Choose a country…',
    country: 'Country',
    countryHint: 'Type to narrow the list down.',
    servedCountries: 'Served countries',
    otherCountries: 'Other countries',
    clearingOn: 'Clearing enabled (clearable)',
    clearingOff: 'Clearing disabled (the default)',
    noCountryFound: 'No country found',
    neighbour: 'Neighbouring element (to move the focus away)',
    reference: 'Reference',
    product: 'Product',
    chooseProduct: 'Choose a product…',
    searchReference: 'Search for a reference…',
    noReference: 'No reference',
    fileType: 'File type',
    fileTypes: 'File types',
    chooseType: 'Choose a type…',
    addType: 'Add a type…',
    document: 'Document',
    image: 'Image',
    video: 'Video',
    remoteIcon: 'Remote icon (explicit image)',
    archiveNoIcon: 'Archive (no icon)',
    executable: 'Executable',
    countryA: 'Country A',
    countryB: 'Country B',
    remove: (label: string) => `Remove ${label}`,
    billingCountry: 'Billing country',
    frozenHint: 'Set by your subscription.',
    searchCountry: 'Search a country',
    moreCountries: (count: number) => `+${count} more ${count === 1 ? 'country' : 'countries'}`,
  },
  fr: {
    chooseCountry: 'Choisir un pays…',
    country: 'Pays',
    countryHint: 'Tapez pour réduire la liste.',
    servedCountries: 'Pays desservis',
    otherCountries: 'Autres pays',
    clearingOn: 'Effacement activé (clearable)',
    clearingOff: 'Effacement désactivé (défaut)',
    noCountryFound: 'Aucun pays trouvé',
    neighbour: 'Élément voisin (pour retirer le focus)',
    reference: 'Référence',
    product: 'Produit',
    chooseProduct: 'Choisir un produit…',
    searchReference: 'Rechercher une référence…',
    noReference: 'Aucune référence',
    fileType: 'Type de fichier',
    fileTypes: 'Types de fichier',
    chooseType: 'Choisir un type…',
    addType: 'Ajouter un type…',
    document: 'Document',
    image: 'Image',
    video: 'Vidéo',
    remoteIcon: 'Icône distante (image explicite)',
    archiveNoIcon: 'Archive (sans icône)',
    executable: 'Exécutable',
    countryA: 'Pays A',
    countryB: 'Pays B',
    remove: (label: string) => `Retirer ${label}`,
    billingCountry: 'Pays de facturation',
    frozenHint: 'Défini par votre abonnement.',
    searchCountry: 'Rechercher un pays',
    moreCountries: (count: number) => `+${count} ${count === 1 ? 'autre pays' : 'autres pays'}`,
  },
})

const CATALOGUE: ComboboxOption[] = Array.from({ length: 120 }, (_, i) => ({
  value: `ref-${i + 1}`,
  label: `Reference ${String(i + 1).padStart(3, '0')}`,
}))
const PAGE_SIZE = 20
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function search(query: string, page: number) {
  await wait(400)
  const found = CATALOGUE.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
  return {
    items: found.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    total: found.length,
  }
}

const meta = {
  title: 'Components/Combobox',
  component: VCombobox,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    compact: { control: 'boolean' },
    clearable: { control: 'boolean' },
    loading: { control: 'boolean' },
    filter: { control: false },
    hasMore: { control: false },
  },
  args: { options: COUNTRIES },
} satisfies Meta<typeof VCombobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; width: 300px">
        <VCombobox v-bind="args" v-model="value" :placeholder="t.chooseCountry" :aria-label="t.country" />
        <output data-testid="mirror">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    // Accent-insensitive search, keyboard navigation, selection
    await userEvent.click(input)
    await userEvent.keyboard('reun')
    await waitFor(() => expect(canvas.getByRole('option', { name: /Réunion/ })).toBeVisible())
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('re'))
    await expect(input).toHaveValue('Réunion')

    // Pressing it hands no focus to the page: without that, the root's focusout would close the
    // list on the press and the click would reopen it, which jsdom cannot show since a click
    // moves no focus there.
    const chevron = canvasElement.querySelector('.v-combobox-chevron')!
    await userEvent.click(chevron)
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'))
    await userEvent.click(chevron)
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'))
    const listbox = canvas.getByRole('listbox', { hidden: true })
    await waitFor(() => expect(listbox).not.toBeVisible())
    await expect(input).toHaveFocus()
  },
}

/**
 * `label` is rendered above the field and `hint` below it, both tied to it for assistive
 * technology.
 */
export const WithLabelAndHint: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref('') }),
    template: `
      <div style="width: 300px">
        <VCombobox v-bind="args" v-model="value" :label="t.country" :hint="t.countryHint" :placeholder="t.chooseCountry" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox', { name: 'Country' })

    await userEvent.click(input)
    const panel = await waitFor(() => canvas.getByRole('listbox'))

    // The panel hangs off the FIELD's box and not off the component's, which also holds
    // the label and the hint: it opens against the field and covers the hint instead of
    // starting a hint's height lower down. jsdom lays nothing out, so this is the only
    // place it can be asserted; the two bounds hold whatever the gap token is worth.
    const fieldBox = canvasElement.querySelector('.v-input-field')!.getBoundingClientRect()
    const hintBox = canvasElement.querySelector('.v-input-hint')!.getBoundingClientRect()
    const panelTop = panel.getBoundingClientRect().top
    await expect(panelTop).toBeGreaterThanOrEqual(fieldBox.bottom)
    await expect(panelTop).toBeLessThan(hintBox.bottom)
  },
}

/**
 * An entry of `options` may be a **named group** (`{ label, options }`, rendered as
 * `role="group"`) or a **separator** (`{ separator: true }`), mixed with bare options.
 */
export const Groups: Story = {
  args: { options: GROUPED_COUNTRIES },
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref('') }),
    template: `
      <div style="display: grid; gap: 8px; width: 300px">
        <VCombobox v-bind="args" v-model="value" :placeholder="t.chooseCountry" :aria-label="t.country" />
        <output data-testid="mirror">{{ value }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.click(input)
    const listbox = await waitFor(() => canvas.getByRole('listbox'))
    await waitFor(() => expect(canvas.getByRole('group', { name: 'Europe' })).toBeVisible())

    // The section header holds the height of an option: the list's vertical rhythm does not
    // break (heights are not measurable in jsdom).
    const group = canvas.getByRole('group', { name: 'Europe' })
    const heightOf = (selector: string) =>
      (group.querySelector(selector) as HTMLElement).getBoundingClientRect().height
    await expect(heightOf('.v-listbox-group-label')).toBeCloseTo(heightOf('.v-listbox-option'), 1)

    // The panel overflows: the active option must be brought into view through the group
    // wrapper (the scroll container stays the panel). Not measurable in jsdom; which is the
    // whole point of this play function.
    await userEvent.keyboard('{ArrowUp}')
    const last = canvas.getByRole('option', { name: /Other/ })
    await waitFor(() => {
      expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        listbox.getBoundingClientRect().bottom + 1,
      )
      expect(last.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        listbox.getBoundingClientRect().top - 1,
      )
    })

    await userEvent.keyboard('mor')
    await waitFor(() => expect(canvas.queryByRole('group', { name: 'Africa' })).toBeVisible())
    expect(canvas.queryByRole('group', { name: 'Europe' })).toBeNull()
    expect(listbox.querySelectorAll('.v-listbox-separator').length).toBe(0)

    await userEvent.keyboard('{ArrowDown}{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('ma'))
  },
}

export const MultipleSelection: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({
      args,
      t,
      value: ref<string[]>(['fr']),
      other: ref<string[]>(['ch', 'ca']),
    }),
    template: `
      <div style="display: grid; gap: 16px; width: 340px">
        <div style="display: grid; gap: 4px">
          <span style="font: 12px sans-serif; color: var(--vectis-color-text-muted)">{{ t.clearingOn }}</span>
          <VCombobox v-bind="args" multiple clearable v-model="value" :placeholder="t.chooseCountry" :aria-label="t.servedCountries" />
          <output data-testid="mirror">{{ value.join(',') }}</output>
        </div>
        <div style="display: grid; gap: 4px">
          <span style="font: 12px sans-serif; color: var(--vectis-color-text-muted)">{{ t.clearingOff }}</span>
          <VCombobox v-bind="args" multiple v-model="other" :aria-label="t.otherCountries" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getAllByRole('combobox')[0]!

    await userEvent.click(input)
    await userEvent.keyboard('bel')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('fr,be'))

    await userEvent.keyboard('{Backspace}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^fr$/))

    await userEvent.click(canvas.getByRole('button', { name: 'Remove France' }))
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^$/))

    await userEvent.keyboard('bel')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('be'))
    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }))
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^$/))
  },
}

/**
 * `display="text"` spells the chosen values out as one line, joined by commas and cut short
 * with an ellipsis. Under the focus the line gives up to half the field to the search.
 */
export const TextDisplay: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref<string[]>(['fr', 'be', 'ch', 'ca', 'lu']) }),
    template: `
      <div style="display: grid; gap: 8px; width: 300px">
        <button type="button">{{ t.neighbour }}</button>
        <VCombobox v-bind="args" multiple display="text" clearable v-model="value" :label="t.servedCountries" />
        <output data-testid="mirror">{{ value.join(',') }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox') as HTMLInputElement
    const text = canvasElement.querySelector('.v-listbox-text') as HTMLElement
    const field = canvasElement.querySelector('.v-input-field') as HTMLElement

    await expect(text).toHaveTextContent('France, Belgium, Switzerland, Canada, Luxembourg')
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
    await expect(input.offsetWidth).toBe(0)
    const height = field.getBoundingClientRect().height

    await userEvent.click(input)
    await waitFor(() => expect(input.offsetWidth).toBeGreaterThan(0))
    await expect(text.getBoundingClientRect().width).toBeLessThanOrEqual(
      field.getBoundingClientRect().width / 2,
    )
    await expect(field.getBoundingClientRect().height).toBeCloseTo(height, 1)

    await userEvent.keyboard('reun{Enter}')
    await waitFor(() => expect(text).toHaveTextContent(/Luxembourg, Réunion$/))
    await userEvent.keyboard('{Backspace}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^fr,be,ch,ca,lu$/))
  },
}

/**
 * `max` keeps the first values and sums the rest up as "+X" while the field is folded, as
 * chips or as text; focused, every value comes back. `overflowText` rephrases the count.
 */
export const MaxValues: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({
      args,
      t,
      chips: ref<string[]>(['fr', 'be', 'ch', 'ca', 'lu']),
      text: ref<string[]>(['fr', 'be', 'ch', 'ca', 'lu']),
      overflowText: (count: number) => t.value.moreCountries(count),
    }),
    template: `
      <div style="display: grid; gap: 16px; width: 300px">
        <button type="button">{{ t.neighbour }}</button>
        <VCombobox v-bind="args" multiple :max="2" v-model="chips" :label="t.servedCountries" />
        <VCombobox v-bind="args" multiple display="text" :max="3" :overflow-text="overflowText" v-model="text" :label="t.otherCountries" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const [chipsRoot, textRoot] = [...canvasElement.querySelectorAll<HTMLElement>('.v-combobox')]
    const chipsInput = canvas.getByRole('combobox', { name: 'Served countries' })

    const overflowChip = chipsRoot!.querySelector('.v-listbox-overflow-chip') as HTMLElement
    await expect(overflowChip).toHaveTextContent('+3')
    await expect(chipsRoot!.querySelectorAll('.v-chip')).toHaveLength(3)

    await userEvent.click(chipsInput)
    await waitFor(() => expect(chipsRoot!.querySelector('.v-listbox-overflow-chip')).toBeNull())
    await expect(canvas.getAllByRole('button', { name: /^Remove / })).toHaveLength(5)

    await userEvent.click(canvas.getByRole('button', { name: /Neighbouring/ }))
    await waitFor(() =>
      expect(chipsRoot!.querySelector('.v-listbox-overflow-chip')).toHaveTextContent('+3'),
    )

    const line = textRoot!.querySelector('.v-listbox-text') as HTMLElement
    const count = textRoot!.querySelector('.v-listbox-overflow') as HTMLElement
    const chevron = textRoot!.querySelector('.v-combobox-chevron') as HTMLElement
    await expect(line).toHaveTextContent('France, Belgium, Switzerland')
    await expect(count).toHaveTextContent('+2 more countries')
    await expect(count.scrollWidth).toBeLessThanOrEqual(count.clientWidth)
    await expect(count.getBoundingClientRect().right).toBeLessThanOrEqual(
      chevron.getBoundingClientRect().left,
    )
  },
}

export const NoResults: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref('') }),
    template: `
      <div style="width: 300px">
        <VCombobox v-bind="args" v-model="value" :placeholder="t.chooseCountry" :aria-label="t.country" :empty-text="t.noCountryFound" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox'))
    await userEvent.keyboard('zzz')
    const panel = canvasElement.querySelector('.v-combobox-state') as HTMLElement
    await waitFor(() => expect(panel).toHaveTextContent('No country found'))
    await waitFor(() =>
      expect(canvasElement.querySelector('[role="status"]')).toHaveTextContent('No country found'),
    )
  },
}

export const Invalid: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref('') }),
    template: `
      <div style="width: 300px">
        <VCombobox v-bind="args" v-model="value" invalid :placeholder="t.chooseCountry" :aria-label="t.country" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref('fr') }),
    template: `
      <div style="width: 300px">
        <VCombobox v-bind="args" v-model="value" disabled :placeholder="t.chooseCountry" :aria-label="t.country" />
      </div>
    `,
  }),
}

/**
 * `readonly` shows a choice that has been made without letting it be changed: nothing can be
 * typed, the list never opens, the chips lose their crosses and no clear cross is offered.
 */
export const ReadOnly: Story = {
  args: { multiple: true, clearable: true, readonly: true },
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref(['fr', 'be']) }),
    template: `
      <div style="width: 300px">
        <VCombobox v-bind="args" v-model="value" :label="t.billingCountry" :hint="t.frozenHint" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox', { name: 'Billing country' })

    // Focusable and copyable, which is the whole difference with a disabled field.
    await userEvent.click(input)
    await expect(input).toHaveFocus()
    await expect(canvas.queryByRole('listbox')).toBeNull()

    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.queryByRole('listbox')).toBeNull()

    await expect(canvas.queryAllByRole('button')).toHaveLength(0)
  },
}

/**
 * `iconStart` puts an icon inside the field, at the start. It is rendered before whatever fills
 * that zone, so it survives the chips that stand for the chosen values instead of being
 * replaced by them.
 */
export const FieldIcon: Story = {
  args: { multiple: true, iconStart: 'search' },
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref(['fr', 'be']) }),
    template: `
      <div style="width: 320px">
        <VCombobox v-bind="args" v-model="value" :label="t.searchCountry" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const field = canvasElement.querySelector('.v-input-field')!
    await expect(field.firstElementChild).toHaveClass('v-icon')
    await expect(canvasElement.querySelectorAll('.v-chip')).toHaveLength(2)
  },
}

/**
 * `hideExpandIcon` leaves the chevron out, for a field that reads as a search box with
 * suggestions.
 */
export const SearchField: Story = {
  args: { iconStart: 'search', hideExpandIcon: true, clearable: true },
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref('fr') }),
    template: `
      <div style="width: 320px">
        <VCombobox v-bind="args" v-model="value" :label="t.searchCountry" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const field = canvasElement.querySelector('.v-input-field') as HTMLElement
    await expect(field.querySelector('.v-combobox-chevron')).toBeNull()
    const style = getComputedStyle(field)
    const glyph = field.querySelector('.v-input-clear .v-icon')!.getBoundingClientRect()
    const edge =
      field.getBoundingClientRect().right -
      parseFloat(style.borderInlineEndWidth) -
      parseFloat(style.paddingInlineStart)
    await expect(Math.abs(edge - glyph.right)).toBeLessThan(1)
    const input = field.querySelector('input')!.getBoundingClientRect()
    await expect(input.right).toBeLessThanOrEqual(glyph.left)
  },
}

/**
 * Sizes `sm` (32px), `md` (40px, the default) and `lg` (48px), combinable with `compact`
 * (-4px).
 */
export const Sizes: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({
      args,
      t,
      variants: [
        { label: 'sm', props: { size: 'sm' } },
        { label: 'sm compact', props: { size: 'sm', compact: true } },
        { label: 'md', props: { size: 'md' } },
        { label: 'md compact', props: { size: 'md', compact: true } },
        { label: 'lg', props: { size: 'lg' } },
        { label: 'lg compact', props: { size: 'lg', compact: true } },
      ],
      value: ['fr', 'be'],
    }),
    template: `
      <div style="display: grid; gap: 16px; width: 340px">
        <div v-for="v in variants" :key="v.label" style="display: grid; gap: 4px">
          <span style="font: 12px sans-serif; color: var(--vectis-color-text-muted)">{{ v.label }}</span>
          <VCombobox v-bind="{ ...args, ...v.props }" multiple :model-value="value" :aria-label="t.country" />
        </div>
      </div>
    `,
  }),
}

/**
 * Out of focus, in multiple mode, the search input folds away: only the Chips stay,
 * with no empty space. On focus, the search field reappears.
 */
export const FoldedOnBlur: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref<string[]>(['fr', 'be', 'ch']) }),
    template: `
      <div style="display: grid; gap: 8px; width: 340px">
        <button type="button">{{ t.neighbour }}</button>
        <VCombobox v-bind="args" multiple v-model="value" :aria-label="t.servedCountries" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox') as HTMLInputElement

    // On focus, the search field is expanded (a non-zero width)
    await userEvent.click(input)
    await waitFor(() => expect(input.offsetWidth).toBeGreaterThan(0))

    // Out of focus, the field is folded away (zero width), only the Chips remain
    await userEvent.click(canvas.getByRole('button', { name: /Neighbouring/ }))
    await waitFor(() => expect(input.offsetWidth).toBe(0))
    await expect(canvas.getByRole('button', { name: 'Remove France' })).toBeVisible()
  },
}

/**
 * Server-side search: `filter: false` (the source has already filtered), a debounced `@search`
 * to launch the request, and `loading` during the wait.
 */
export const AsynchronousSearch: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => {
      const value = ref('')
      const options = ref<ComboboxOption[]>([])
      const loading = ref(false)
      const requests = ref(0)
      let token = 0

      async function onSearch(query: string) {
        const current = ++token
        requests.value += 1
        loading.value = true
        const { items } = await search(query, 0)
        // A stale response (a more recent keystroke has gone out): ignore it
        if (current !== token) return
        options.value = items
        loading.value = false
      }

      return { args, t, value, options, loading, requests, onSearch }
    },
    template: `
      <div style="display: grid; gap: 8px; width: 340px">
        <VCombobox
          v-bind="args"
          :options="options"
          :filter="false"
          :loading="loading"
          :search-debounce="400"
          v-model="value"
          :aria-label="t.reference"
          :placeholder="t.searchReference"
          :empty-text="t.noReference"
          @search="onSearch"
        />
        <output data-testid="mirror">{{ value }}</output>
        <output data-testid="requests">{{ requests }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.click(input)
    await waitFor(() => expect(canvas.getByRole('option', { name: /Reference 001/ })).toBeVisible())

    await userEvent.keyboard('042')
    await waitFor(() => expect(canvas.getByRole('option', { name: /Reference 042/ })).toBeVisible())
    await expect(Number(canvas.getByTestId('requests').textContent)).toBeLessThanOrEqual(2)

    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('ref-42'))
  },
}

/**
 * Pagination: `hasMore` renders a sentinel at the foot of the panel, whose entry into view
 * emits `load-more`.
 */
export const InfiniteScroll: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => {
      const value = ref('')
      const options = ref<ComboboxOption[]>([])
      const loading = ref(false)
      const total = ref(0)
      const page = ref(0)
      const request = ref('')
      let token = 0

      async function onSearch(query: string) {
        const current = ++token
        request.value = query
        page.value = 0
        loading.value = true
        const result = await search(query, 0)
        if (current !== token) return
        options.value = result.items
        total.value = result.total
        loading.value = false
      }

      async function onLoadMore() {
        loading.value = true
        const result = await search(request.value, page.value + 1)
        page.value += 1
        options.value = [...options.value, ...result.items]
        loading.value = false
      }

      const hasMore = computed(() => options.value.length < total.value)

      return { args, t, value, options, loading, hasMore, total, onSearch, onLoadMore }
    },
    template: `
      <div style="display: grid; gap: 8px; width: 340px">
        <VCombobox
          v-bind="args"
          :options="options"
          :filter="false"
          :loading="loading"
          :has-more="hasMore"
          v-model="value"
          :aria-label="t.reference"
          :placeholder="t.searchReference"
          @search="onSearch"
          @load-more="onLoadMore"
        />
        <output data-testid="count">{{ options.length }} / {{ total }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox'))
    await waitFor(() => expect(canvas.getByTestId('count')).toHaveTextContent('20 / 120'))

    const listbox = canvas.getByRole('listbox')
    listbox.scrollTop = listbox.scrollHeight
    await waitFor(() => expect(canvas.getByTestId('count')).toHaveTextContent('40 / 120'))
  },
}

/**
 * `virtual` renders only the options near the visible part of the panel: ten thousand here. The
 * highlighted option stays rendered wherever the panel is scrolled, and each option says where
 * it stands in the list.
 */
export const Virtual: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => {
      const options = computed<ComboboxOption[]>(() =>
        Array.from({ length: 10000 }, (_, i) => ({
          value: i + 1,
          label: `${t.value.product} ${String(i + 1).padStart(5, '0')}`,
        })),
      )
      return { args, t, options, value: ref<string | number>('') }
    },
    template: `
      <div style="width: 340px">
        <VCombobox
          v-bind="args"
          v-model="value"
          :options="options"
          virtual
          :aria-label="t.product"
          :placeholder="t.chooseProduct"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    const listbox = canvas.getByRole('listbox')
    await waitFor(() => expect(within(listbox).getAllByRole('option').length).toBeLessThan(40))

    // ArrowUp wraps to the last option, ten thousand rows away, and brings it into view.
    await userEvent.keyboard('{ArrowUp}')
    await waitFor(() => {
      const active = document.getElementById(input.getAttribute('aria-activedescendant')!)!
      expect(active).toHaveTextContent('Product 10000')
      expect(active).toHaveAttribute('aria-posinset', '10000')
      const row = active.getBoundingClientRect()
      const box = listbox.getBoundingClientRect()
      expect(row.bottom).toBeLessThanOrEqual(box.bottom)
      expect(row.top).toBeGreaterThanOrEqual(box.top)
    })
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(listbox.scrollTop).toBe(0))

    await userEvent.type(input, '0999')
    await waitFor(() =>
      expect(within(listbox).getAllByRole('option')[0]).toHaveTextContent('Product 00999'),
    )
    await userEvent.keyboard('{Enter}')
    expect(input).toHaveValue('Product 00999')
  },
}

/**
 * An option's `icon` field displays an icon before its label, in the slot the row provides (so
 * aligned and spaced like the rest, unlike an icon placed in the `#option` slot, which would
 * land inside the label).
 */
export const WithIcons: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({
      args,
      t,
      value: ref('img'),
      options: computed<ComboboxItem[]>(() => [
        { value: 'doc', label: t.value.document, icon: 'description' },
        { value: 'img', label: t.value.image, icon: 'image' },
        { value: 'vid', label: t.value.video, icon: 'movie' },
        {
          value: 'svg',
          label: t.value.remoteIcon,
          icon: {
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='9' fill='%236366f1'/%3E%3C/svg%3E",
          },
        },
        { value: 'zip', label: t.value.archiveNoIcon },
        { value: 'exe', label: t.value.executable, icon: 'terminal', disabled: true },
      ]),
    }),
    template: `
      <div style="width: 340px">
        <VCombobox v-bind="args" :options="options" v-model="value" :placeholder="t.chooseType" :aria-label="t.fileType" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox'))
    const options = await canvas.findAllByRole('option')
    await expect(options[0]!.firstElementChild).not.toHaveClass('v-listbox-option-label')
    await expect(options[4]!.firstElementChild).toHaveClass('v-listbox-option-label')
  },
}

/** The `#chip` slot replaces the VChip of a selected value (multiple mode). */
export const CustomChip: Story = {
  args: { multiple: true },
  render: (args) => ({
    components: { VCombobox, VChip },
    setup: () => ({
      args,
      t,
      value: ref(['doc', 'img']),
      options: computed<ComboboxItem[]>(() => [
        { value: 'doc', label: t.value.document, icon: 'description' },
        { value: 'img', label: t.value.image, icon: 'image' },
        { value: 'vid', label: t.value.video, icon: 'movie' },
      ]),
    }),
    template: `
      <div style="width: 380px">
        <VCombobox v-bind="args" :options="options" v-model="value" :placeholder="t.addType" :aria-label="t.fileTypes">
          <template #chip="{ option, label, remove, size, compact }">
            <VChip
              tone="neutral"
              variant="outline"
              :icon-start="option?.icon"
              :size="size"
              :compact="compact"
              dismissible
              :dismiss-label="t.remove(label)"
              @dismiss="remove"
              >{{ label }}</VChip
            >
          </template>
        </VCombobox>
      </div>
    `,
  }),
}

/**
 * The `#option` slot replaces the label with content of your choosing (here the capital on a
 * second line).
 */
export const CustomOption: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, value: ref('fr'), capitals: CAPITALS }),
    template: `
      <div style="width: 340px">
        <VCombobox v-bind="args" v-model="value" :placeholder="t.chooseCountry" :aria-label="t.country">
          <template #option="{ option }">
            <span style="display: grid">
              <span>{{ option.label }}</span>
              <small style="opacity: 0.6">{{ capitals[option.value] }}</small>
            </span>
          </template>
        </VCombobox>
      </div>
    `,
  }),
}

/**
 * Two comboboxes side by side: each panel anchors to ITS control thanks to
 * `anchor-scope` (the anchor name is confined to each instance).
 */
export const TwoComboboxes: Story = {
  render: (args) => ({
    components: { VCombobox },
    setup: () => ({ args, t, a: ref(''), b: ref('') }),
    template: `
      <div style="display: flex; gap: 16px; width: 640px">
        <VCombobox v-bind="args" v-model="a" :placeholder="t.chooseCountry" :aria-label="t.countryA" />
        <VCombobox v-bind="args" v-model="b" :placeholder="t.chooseCountry" :aria-label="t.countryB" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const [first, second] = canvas.getAllByRole('combobox')

    await userEvent.click(first!)
    await waitFor(() => expect(canvas.getByRole('option', { name: 'France' })).toBeVisible())
    await expect(second!).toHaveAttribute('aria-expanded', 'false')
  },
}
