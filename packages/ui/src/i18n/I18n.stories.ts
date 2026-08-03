import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { Component } from 'vue'

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

import { en } from './en'
import { DEFAULT_LOCALE, registerMessages, setLocale } from './state'

// SFC générique : le typage `Component` ne s'y applique pas, cast obligatoire
// dans les stories et les tests (convention du repo).
const VDataTable = VDataTableSfc as unknown as Component

const meta = {
  title: 'Fondations/Internationalisation',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const COMPOSANTS = {
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

const COLONNES = [
  { key: 'nom', label: 'Nom', sortable: true, searchable: true },
  { key: 'total', label: 'Total', sortable: true, align: 'end' as const },
]

/* Aucune ligne : c'est l'état VIDE qui porte du texte du dictionnaire, et le
   footer de sélection reste rendu — deux chaînes visibles d'un coup. */
const LIGNES: { nom: string; total: number }[] = []

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
]

const FIL = [
  { label: 'Accueil', href: '/' },
  { label: 'Composants', href: '/composants' },
]

const VITRINE = `
  <div style="display: grid; gap: var(--vectis-space-6); max-width: 44rem;">
    <VBreadcrumb :items="fil" current-path="/composants" />

    <div style="display: flex; gap: var(--vectis-space-3); align-items: end; flex-wrap: wrap;">
      <VInput label="Champ" clearable model-value="Du texte" style="flex: 1; min-inline-size: 12rem;" />
      <VInput label="En chargement" loading style="flex: 1; min-inline-size: 12rem;" />
    </div>

    <div style="display: flex; gap: var(--vectis-space-3); flex-wrap: wrap;">
      <VDatePicker label="Date" show-calendar />
      <VTimePicker label="Heure" show-dial />
    </div>

    <VCombobox label="Recherche" :options="options" placeholder="Filtrer…" />

    <div style="display: flex; gap: var(--vectis-space-2); align-items: center;">
      <VChip dismissible>Étiquette</VChip>
      <VSpinner />
    </div>

    <VProgressLinear :value="42" show-value :thickness="20" />

    <VDataTable
      :columns="colonnes"
      :rows="lignes"
      row-key="nom"
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

function vitrine(): Story['render'] {
  return () => ({
    components: COMPOSANTS,
    setup: () => ({ colonnes: COLONNES, lignes: LIGNES, options: OPTIONS, fil: FIL }),
    template: VITRINE,
  })
}

/**
 * Configuration par défaut : le français est le socle, aucun appel n'est
 * nécessaire.
 */
export const Francais: Story = {
  name: 'Français (défaut)',
  render: vitrine(),
}

/**
 * `registerMessages('en', en)` + `setLocale('en-GB')`.
 *
 * Le teardown n'est pas décoratif : l'état vit au niveau module et SURVIT à la
 * navigation Storybook (même piège que le `dismissToast()` des stories de
 * VToast). Sans lui, toutes les stories visitées ensuite s'afficheraient en
 * anglais, et les play functions qui assertent du français rougiraient.
 */
export const Anglais: Story = {
  name: 'Anglais',
  beforeEach: () => {
    registerMessages('en', en)
    setLocale('en-GB')
    return () => {
      setLocale(DEFAULT_LOCALE)
      registerMessages('en', undefined)
    }
  },
  render: vitrine(),
}

/**
 * Surcharge PARTIELLE : quelques clés seulement, le reste garde le socle
 * français — c'est aussi la façon d'ajouter une langue non fournie.
 */
export const SurchargePartielle: Story = {
  name: 'Surcharge partielle',
  beforeEach: () => {
    registerMessages('fr', {
      dataTable: { empty: 'Rien à afficher pour le moment' },
      combobox: { empty: 'Aucune correspondance' },
      common: { dismiss: 'Enlever' },
    })
    return () => registerMessages('fr', undefined)
  },
  render: vitrine(),
}

/**
 * `setLocale('de-DE')` sans dictionnaire allemand : les MOTS restent français,
 * mais les FORMATS (mois, premier jour de semaine, cycle horaire) suivent déjà
 * la balise — ils viennent d'`Intl`, pas du dictionnaire. État dégradé
 * cohérent, pas un bug.
 */
export const LangueSansDictionnaire: Story = {
  name: 'Langue sans dictionnaire',
  beforeEach: () => {
    setLocale('de-DE')
    return () => setLocale(DEFAULT_LOCALE)
  },
  render: vitrine(),
}
