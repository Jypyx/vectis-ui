import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, type Component } from 'vue'

import VBreadcrumb from '../components/VBreadcrumb/VBreadcrumb.vue'
import { builtinIcons as icons } from '../components/VIcon/icons'
import VButton from '../components/VButton/VButton.vue'
import VChip from '../components/VChip/VChip.vue'
import VCombobox from '../components/VCombobox/VCombobox.vue'
import VDataTableSfc from '../components/VDataTable/VDataTable.vue'
import VDateInput from '../components/VDateInput/VDateInput.vue'
import VInput from '../components/VInput/VInput.vue'
import VMenu from '../components/VMenu/VMenu.vue'
import VMenuItem from '../components/VMenu/VMenuItem.vue'
import VPagination from '../components/VPagination/VPagination.vue'
import VProgressLinear from '../components/VProgressLinear/VProgressLinear.vue'
import VSpinner from '../components/VSpinner/VSpinner.vue'
import VTimeInput from '../components/VTimeInput/VTimeInput.vue'
import flagDE from '../stories/flags/de.svg'
import flagFR from '../stories/flags/fr.svg'
import flagUS from '../stories/flags/us.svg'
import { storyText } from '../stories/storyText'

import { registerMessages, setLocale, useLocale } from './state'

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
  VButton,
  VChip,
  VCombobox,
  VDataTable,
  VDateInput,
  VInput,
  VMenu,
  VMenuItem,
  VPagination,
  VProgressLinear,
  VSpinner,
  VTimeInput,
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
      <VDateInput :label="t.date" show-picker />
      <VTimeInput :label="t.time" show-picker />
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

/*
 * Load flags as separate images so SVG marker IDs cannot collide between a trigger and its list
 * copy.
 */
const LANGUAGES = [
  { tag: 'en-US', flag: { src: flagUS }, label: 'English' },
  { tag: 'fr-FR', flag: { src: flagFR }, label: 'Français' },
  { tag: 'de-DE', flag: { src: flagDE }, label: 'Deutsch' },
]

const SWITCHER = `
  <div style="margin-block-end: var(--vectis-space-6);">
    <VMenu size="md" match-trigger>
      <template #trigger="{ triggerProps }">
        <VButton
          v-bind="triggerProps"
          variant="outline"
          tone="neutral"
          :icon-start="current.flag"
          :icon-end="icons.expand_more"
        >
          {{ current.label }}
        </VButton>
      </template>
      <VMenuItem
        v-for="language in languages"
        :key="language.tag"
        :label="language.label"
        :icon-start="language.flag"
        :selected="language.tag === locale"
        @select="setLocale(language.tag)"
      />
    </VMenu>
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

/*
 * A CONSUMER does the opposite; they keep their own ref as the source of truth, `useLocale`
 * being internal: the DS is a sink for the locale, never a source.
 */
const locale = useLocale()
const current = computed(() => LANGUAGES.find((l) => l.tag === locale.value) ?? LANGUAGES[0])

function showcase(prefix = ''): Story['render'] {
  return () => ({
    components: COMPONENTS,
    setup: () => ({
      t,
      icons,
      rows: ROWS,
      options: OPTIONS,
      columns,
      trail,
      languages: LANGUAGES,
      locale,
      current,
      setLocale,
    }),
    template: `${prefix}${SHOWCASE}`,
  })
}

/** Default configuration: English is the base, no call is needed. */
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
 * PARTIAL override: a few keys only, the rest keeps the English base; this is also how you add
 * a language the DS does not ship.
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
 * `setLocale('de-DE')` with no German dictionary: the words stay English, but the FORMATS
 * (months, first day of week, hour cycle) already follow the tag; they come from `Intl`, not
 * from the dictionary.
 */
export const LanguageWithoutDictionary: Story = {
  globals: { locale: 'de-DE' },
  render: showcase(),
}

/** A language selector inside the page. */
export const LanguageSwitcher: Story = {
  globals: { locale: 'en-US' },
  render: showcase(SWITCHER),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement
    await expect(canvas.getByText('No data')).toBeVisible()

    /*
     * The trigger is named after the CURRENT language, so it changes as we go; and the flags
     * never enter the query, being aria-hidden.
     */
    const trigger = canvas.getByRole('button', { name: 'English' })
    await expect(trigger.querySelector('.v-icon-img')).not.toBeNull()

    await userEvent.click(trigger)
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Français' }))
    await waitFor(async () => {
      await expect(canvas.getByText('Aucune donnée')).toBeVisible()
    })

    /*
     * Back to English, and it is load-bearing: the locale is module-level state shared by all
     * five canvases of the docs page; a run left in French would flip the siblings.
     */
    await userEvent.click(canvas.getByRole('button', { name: 'Français' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    await userEvent.click(canvas.getByRole('menuitem', { name: 'English' }))
    await waitFor(async () => {
      await expect(canvas.getByText('No data')).toBeVisible()
    })
  },
}
