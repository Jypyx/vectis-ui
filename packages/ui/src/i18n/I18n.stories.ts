import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, type Component } from 'vue'

import VBreadcrumb from '../components/VBreadcrumb/VBreadcrumb.vue'
import VChip from '../components/VChip/VChip.vue'
import VCombobox from '../components/VCombobox/VCombobox.vue'
import VDataTableSfc from '../components/VDataTable/VDataTable.vue'
import VDatePicker from '../components/VDatePicker/VDatePicker.vue'
import VInput from '../components/VInput/VInput.vue'
import VPagination from '../components/VPagination/VPagination.vue'
import VProgressLinear from '../components/VProgressLinear/VProgressLinear.vue'
import VSpinner from '../components/VSpinner/VSpinner.vue'
import VTimePicker from '../components/VTimePicker/VTimePicker.vue'
import { storyText } from '../stories/storyText'

import { registerMessages } from './state'

// Generic SFC: the `Component` typing does not apply to it, so a cast is
// mandatory in the stories and the tests (repo convention).
const VDataTable = VDataTableSfc as unknown as Component

const meta = {
  title: 'Foundations/Internationalization',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const COMPONENTS = {
  VBreadcrumb,
  VChip,
  VCombobox,
  VDataTable,
  VDatePicker,
  VInput,
  VPagination,
  VProgressLinear,
  VSpinner,
  VTimePicker,
}

const t = storyText({
  en: {
    name: 'Name',
    total: 'Total',
    field: 'Field',
    someText: 'Some text',
    loadingField: 'Loading',
    date: 'Date',
    time: 'Time',
    search: 'Search',
    filter: 'Filter…',
    tag: 'Tag',
    home: 'Home',
    components: 'Components',
  },
  fr: {
    name: 'Nom',
    total: 'Total',
    field: 'Champ',
    someText: 'Du texte',
    loadingField: 'En chargement',
    date: 'Date',
    time: 'Heure',
    search: 'Recherche',
    filter: 'Filtrer…',
    tag: 'Étiquette',
    home: 'Accueil',
    components: 'Composants',
  },
})

/* No row at all: the EMPTY state is what carries dictionary text, and the
   selection footer stays rendered — two visible strings at once. */
const ROWS: { name: string; total: number }[] = []

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
]

const SHOWCASE = `
  <div style="display: grid; gap: var(--vectis-space-6); max-width: 44rem;">
    <VBreadcrumb :items="trail" current-path="/components" />

    <div style="display: flex; gap: var(--vectis-space-3); align-items: end; flex-wrap: wrap;">
      <VInput :label="t.field" clearable :model-value="t.someText" style="flex: 1; min-inline-size: 12rem;" />
      <VInput :label="t.loadingField" loading style="flex: 1; min-inline-size: 12rem;" />
    </div>

    <div style="display: flex; gap: var(--vectis-space-3); flex-wrap: wrap;">
      <VDatePicker :label="t.date" show-calendar />
      <VTimePicker :label="t.time" show-dial />
    </div>

    <VCombobox :label="t.search" :options="options" :placeholder="t.filter" />

    <div style="display: flex; gap: var(--vectis-space-2); align-items: center;">
      <VChip dismissible>{{ t.tag }}</VChip>
      <VSpinner />
    </div>

    <VProgressLinear :value="42" show-value :thickness="20" />

    <VDataTable
      :columns="columns"
      :rows="rows"
      row-key="name"
      searchable
      selectable
      variant="outlined"
      :per-page="5"
      :per-page-options="[5, 10]"
      show-range
    />

    <VPagination :length="8" :model-value="3" />
  </div>
`

/* `columns` and `trail` must be computed, not plain arrays built from `t.value`:
   reading `.value` in the setup body would freeze the labels in the language of
   the first render while everything else switched. */
const columns = computed(() => [
  { key: 'name', label: t.value.name, sortable: true, searchable: true },
  { key: 'total', label: t.value.total, sortable: true, align: 'end' as const },
])

const trail = computed(() => [
  { label: t.value.home, href: '/' },
  { label: t.value.components, href: '/components' },
])

function showcase(): Story['render'] {
  return () => ({
    components: COMPONENTS,
    setup: () => ({ t, rows: ROWS, options: OPTIONS, columns, trail }),
    template: SHOWCASE,
  })
}

/**
 * Default configuration: English is the base, no call is needed.
 *
 * Every story here drives the locale through story-level `globals`, which the
 * `preview.ts` decorator turns into a `setLocale`. Doing it in a `beforeEach`
 * would not work: the decorator body runs after it and would win.
 */
export const English: Story = {
  globals: { locale: 'en-US' },
  render: showcase(),
}

/** `registerMessages('fr', fr)` + `setLocale('fr-FR')`, both done by the toolbar. */
export const French: Story = {
  globals: { locale: 'fr-FR' },
  render: showcase(),
}

/**
 * PARTIAL override: a few keys only, the rest keeps the English base — this is
 * also how you add a language the DS does not ship.
 *
 * The teardown is not decorative: the registry lives at module level and SURVIVES
 * Storybook navigation (the same trap as `dismissToast()` in the VToast stories).
 * Without it, every story visited afterwards would keep these strings.
 */
export const PartialOverride: Story = {
  globals: { locale: 'en-US' },
  beforeEach: () => {
    registerMessages('en', {
      dataTable: { empty: 'Nothing to show right now' },
      combobox: { empty: 'No match' },
      common: { dismiss: 'Take off' },
    })
    return () => registerMessages('en', undefined)
  },
  render: showcase(),
}

/**
 * `setLocale('de-DE')` with no German dictionary: the WORDS stay English, but the
 * FORMATS (months, first day of week, hour cycle) already follow the tag — they
 * come from `Intl`, not from the dictionary. A coherent degraded state, not a bug.
 */
export const LanguageWithoutDictionary: Story = {
  globals: { locale: 'de-DE' },
  render: showcase(),
}
