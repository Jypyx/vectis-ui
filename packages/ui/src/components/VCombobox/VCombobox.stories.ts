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

// Groups and separators: an entry of `options` may be a named group
// (`{ label, options }`), a separator (`{ separator: true }`) or a bare option — the
// three mix freely.
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
  // outside any group: still a valid entry among the others
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
    servedCountries: 'Served countries',
    otherCountries: 'Other countries',
    clearingOn: 'Clearing enabled (clearable)',
    clearingOff: 'Clearing disabled (the default)',
    noCountryFound: 'No country found',
    neighbour: 'Neighbouring element (to move the focus away)',
    reference: 'Reference',
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
  },
  fr: {
    chooseCountry: 'Choisir un pays…',
    country: 'Pays',
    servedCountries: 'Pays desservis',
    otherCountries: 'Autres pays',
    clearingOn: 'Effacement activé (clearable)',
    clearingOff: 'Effacement désactivé (défaut)',
    noCountryFound: 'Aucun pays trouvé',
    neighbour: 'Élément voisin (pour retirer le focus)',
    reference: 'Référence',
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
  },
})

// A simulated "API" for the asynchronous stories: network latency, filtering and
// pagination on the source side (the component redoes none of it).
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
    // a boolean | predicate union: no control is possible
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

    // accent-insensitive search, keyboard navigation, selection
    await userEvent.click(input)
    await userEvent.keyboard('reun')
    await waitFor(() => expect(canvas.getByRole('option', { name: /Réunion/ })).toBeVisible())
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('re'))
    await expect(input).toHaveValue('Réunion')
  },
}

/**
 * An entry of `options` may be a **named group** (`{ label, options }`, rendered as
 * `role="group"`) or a **separator** (`{ separator: true }`), mixed with bare
 * options. Groups are only rendering: the keyboard navigation crosses the list flat
 * without ever stopping on a label. On filtering, a group no option of which matches
 * disappears (label included) and the separators left orphaned are not rendered.
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
    // waitFor: the panel opens on an opacity transition
    await waitFor(() => expect(canvas.getByRole('group', { name: 'Europe' })).toBeVisible())

    // the section header holds the height of an option: the list's vertical rhythm
    // does not break (heights are not measurable in jsdom). Tolerance: the panel
    // carries a `transform` transition, and the rects measured at the end of the
    // animation differ by a hundred-thousandth of a pixel.
    const group = canvas.getByRole('group', { name: 'Europe' })
    const heightOf = (selector: string) =>
      (group.querySelector(selector) as HTMLElement).getBoundingClientRect().height
    await expect(heightOf('.v-combobox-group-label')).toBeCloseTo(heightOf('.v-combobox-option'), 1)

    // The panel overflows: the active option must be brought into view through the
    // group wrapper (the scroll container stays the panel). Not measurable in jsdom —
    // which is the whole point of this play function.
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

    // filtering: "Europe" empties out, its label disappears with it, and no rule is
    // left at the head or at the tail of the panel
    await userEvent.keyboard('mor')
    await waitFor(() => expect(canvas.queryByRole('group', { name: 'Africa' })).toBeVisible())
    expect(canvas.queryByRole('group', { name: 'Europe' })).toBeNull()
    expect(listbox.querySelectorAll('.v-combobox-separator').length).toBe(0)

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

    // multiple selection: the panel stays open, tags appear
    await userEvent.click(input)
    await userEvent.keyboard('bel')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('fr,be'))

    // Backspace on an empty field removes the last tag
    await userEvent.keyboard('{Backspace}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^fr$/))

    await userEvent.click(canvas.getByRole('button', { name: 'Remove France' }))
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^$/))

    // the cross (clearable) shows as soon as there is a selection, and empties it all
    await userEvent.keyboard('bel')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('be'))
    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }))
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent(/^$/))
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
    // Scoped to the panel: the same words also fill the live region that announces the
    // state, since a role="listbox" may own nothing but options.
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
 * Sizes `sm` (32px), `md` (40px, the default) and `lg` (48px), combinable with
 * `compact` (-4px). In multiple mode, the Chips stay one step below the field: `xs`
 * (24px) up to `md`, `sm` (32px) at `lg` — the catch-up below the lowest step of each
 * pair goes through `compact` (20px at `sm`, 28px at `lg compact`). The options panel
 * follows the field's size.
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

    // on focus, the search field is expanded (a non-zero width)
    await userEvent.click(input)
    await waitFor(() => expect(input.offsetWidth).toBeGreaterThan(0))

    // out of focus, the field is folded away (zero width), only the Chips remain
    await userEvent.click(canvas.getByRole('button', { name: /Neighbouring/ }))
    await waitFor(() => expect(input.offsetWidth).toBe(0))
    await expect(canvas.getByRole('button', { name: 'Remove France' })).toBeVisible()
  },
}

/**
 * Server-side search: `filter: false` (the source has already filtered), a debounced
 * `@search` to launch the request, and `loading` during the wait. The component does
 * not cancel requests: it is up to the consumer to ignore stale responses (the call
 * token below).
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
        // a stale response (a more recent keystroke has gone out): ignore it
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

    // opening: the first load is immediate (no debounce)
    await userEvent.click(input)
    await waitFor(() => expect(canvas.getByRole('option', { name: /Reference 001/ })).toBeVisible())

    // a burst of keystrokes: the debounce lets a single request through
    await userEvent.keyboard('042')
    await waitFor(() => expect(canvas.getByRole('option', { name: /Reference 042/ })).toBeVisible())
    await expect(Number(canvas.getByTestId('requests').textContent)).toBeLessThanOrEqual(2)

    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByTestId('mirror')).toHaveTextContent('ref-42'))
  },
}

/**
 * Pagination: `hasMore` renders a sentinel at the foot of the panel, whose entry into
 * view emits `load-more`. The next-page spinner appears in the same place, without
 * replacing the options already loaded.
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

    // scrolling to the bottom of the panel loads the next page
    const listbox = canvas.getByRole('listbox')
    listbox.scrollTop = listbox.scrollHeight
    await waitFor(() => expect(canvas.getByTestId('count')).toHaveTextContent('40 / 120'))
  },
}

/**
 * An option's `icon` field displays an icon before its label, in the slot the row
 * provides (so aligned and spaced like the rest, unlike an icon placed in the
 * `#option` slot, which would land inside the label). It accepts a Material Symbols
 * name **or** an image/SVG URL — here both in the same list.
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
    // the icon is the FIRST child of the row: it precedes the label, the selection
    // tick coming after
    await expect(options[0]!.firstElementChild).not.toHaveClass('v-combobox-option-label')
    // an option with no `icon` starts directly with its label
    await expect(options[4]!.firstElementChild).toHaveClass('v-combobox-option-label')
  },
}

/**
 * The `#chip` slot replaces the VChip of a selected value (multiple mode). It
 * receives `option` — hence its `icon` — as well as `remove` so it stays removable,
 * and `size`/`compact` to keep the template computed by the field.
 */
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
 * The `#option` slot replaces the label with content of your choosing (here the
 * capital on a second line). It receives the option and its state (`active`,
 * `selected`, `index`). For a simple icon, prefer the option's `icon` field: this
 * slot's content is rendered inside the label.
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
    // the second stays closed and independent
    await expect(second!).toHaveAttribute('aria-expanded', 'false')
  },
}
