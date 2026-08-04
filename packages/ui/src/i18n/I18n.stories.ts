import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, type Component } from 'vue'

import VBreadcrumb from '../components/VBreadcrumb/VBreadcrumb.vue'
import VButton from '../components/VButton/VButton.vue'
import VChip from '../components/VChip/VChip.vue'
import VCombobox from '../components/VCombobox/VCombobox.vue'
import VDataTableSfc from '../components/VDataTable/VDataTable.vue'
import VDatePicker from '../components/VDatePicker/VDatePicker.vue'
import VInput from '../components/VInput/VInput.vue'
import VMenu from '../components/VMenu/VMenu.vue'
import VMenuItem from '../components/VMenu/VMenuItem.vue'
import VPagination from '../components/VPagination/VPagination.vue'
import VProgressLinear from '../components/VProgressLinear/VProgressLinear.vue'
import VSpinner from '../components/VSpinner/VSpinner.vue'
import VTimePicker from '../components/VTimePicker/VTimePicker.vue'
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
  VDatePicker,
  VInput,
  VMenu,
  VMenuItem,
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

/* Language names are ENDONYMS: demo data, like `Alpha`/`Bravo`, not prose — they
   stay out of `storyText` and are what the play function queries, since they read
   the same in every locale. The flags ride as ordinary `iconStart` sources — the
   `{ src }` form, so VIcon sizes them and marks them decorative (no `label`) and
   the endonym alone carries the accessible name. Kept as plain `.svg` files rather
   than inlined: rendered as an `<img>`, each flag is its own document, so the
   `<marker id>` the US stars hang on cannot collide with the copy of itself that
   the trigger renders next to the list. */
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
          icon-end="expand_more"
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

/* The trigger READS the DS locale and the items WRITE it through `setLocale`: the
   selector holds no state of its own, so it stays in sync with the toolbar. A
   CONSUMER does the opposite — they keep their own ref as the source of truth,
   `useLocale` being internal: the DS is a sink for the locale, never a source. */
const locale = useLocale()
const current = computed(() => LANGUAGES.find((l) => l.tag === locale.value) ?? LANGUAGES[0])

function showcase(prefix = ''): Story['render'] {
  return () => ({
    components: COMPONENTS,
    setup: () => ({
      t,
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

/**
 * A language selector inside the page. The dictionary is a `shallowRef`, so a
 * `setLocale` called from a click handler re-renders every ALREADY MOUNTED
 * component — nothing is remounted, nothing reloads.
 *
 * `Deutsch` is offered WITHOUT a dictionary: the formats follow the tag while the
 * words stay English, the degraded state of `LanguageWithoutDictionary`. No
 * `registerMessages` here, hence no registry to tear down — and no interference
 * with that story, which shares this docs page.
 *
 * No teardown either, unlike `PartialOverride`: the `withGlobals` decorator
 * re-applies the toolbar locale on EVERY story render, so the locale self-heals on
 * navigation. The registry, which the decorator never touches, does not.
 */
export const LanguageSwitcher: Story = {
  globals: { locale: 'en-US' },
  render: showcase(SWITCHER),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menu = canvasElement.querySelector('[role="menu"]') as HTMLElement
    await expect(canvas.getByText('No data')).toBeVisible()

    /* The trigger is named after the CURRENT language, so it changes as we go —
       and the flags never enter the query, being aria-hidden. */
    const trigger = canvas.getByRole('button', { name: 'English' })
    /* The flag really resolved through VIcon: an unresolved source renders the
       empty `<slot />`, a silent blank box. `.v-icon-img` is the `{ src }` branch,
       so the query targets the flag and not the `expand_more` chevron. */
    await expect(trigger.querySelector('.v-icon-img')).not.toBeNull()

    await userEvent.click(trigger)
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Français' }))
    await waitFor(async () => {
      await expect(canvas.getByText('Aucune donnée')).toBeVisible()
    })

    /* Back to English, and it is load-bearing: the locale is module-level state
       shared by all five canvases of the docs page — a run left in French would
       flip the siblings. */
    await userEvent.click(canvas.getByRole('button', { name: 'Français' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    await userEvent.click(canvas.getByRole('menuitem', { name: 'English' }))
    await waitFor(async () => {
      await expect(canvas.getByText('No data')).toBeVisible()
    })
  },
}
