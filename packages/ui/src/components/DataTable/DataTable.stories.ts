import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import type { Component } from 'vue'
import { ref } from 'vue'

import Chip from '../Chip/Chip.vue'
import Typography from '../Typography/Typography.vue'
import DataTableSfc from './DataTable.vue'
import type { DataTableParams, DataTableRowId } from './DataTable.vue'

// SFC générique : sa signature de fonction générique n'est pas assignable aux
// types Component de Storybook — on l'efface pour les stories.
const DataTable = DataTableSfc as unknown as Component

const COLUMNS = [
  { key: 'name', label: 'Projet', sortable: true },
  { key: 'owner', label: 'Responsable' },
  { key: 'status', label: 'Statut' },
  { key: 'commits', label: 'Commits', sortable: true, align: 'end' as const },
]

const ROWS = [
  { name: 'Socle', owner: 'Xavier', status: 'actif', commits: 320 },
  { name: 'Atlas', owner: 'Nadia', status: 'actif', commits: 87 },
  { name: 'Brume', owner: 'Louis', status: 'archivé', commits: 1204 },
  { name: 'Granit', owner: 'Emma', status: 'actif', commits: 45 },
]

// Jeu étoffé (22 lignes) pour la recherche, la pagination et le sticky header.
const PROJETS = [
  'Socle',
  'Atlas',
  'Brume',
  'Granit',
  'Éclair',
  'Falaise',
  'Givre',
  'Houle',
  'Islet',
  'Jade',
  'Karst',
  'Lande',
  'Mistral',
  'Nacre',
  'Ombre',
  'Pollen',
  'Quartz',
  'Rivage',
  'Sillage',
  'Tuile',
  'Vigie',
  'Zénith',
]
const RESPONSABLES = ['Xavier', 'Nadia', 'Louis', 'Emma']
const ROWS_MANY = PROJETS.map((name, index) => ({
  name,
  owner: RESPONSABLES[index % RESPONSABLES.length],
  status: index % 3 === 0 ? 'archivé' : 'actif',
  commits: ((index + 3) * 37) % 500,
}))

const meta: Meta = {
  title: 'Composants/DataTable',
  component: DataTable as Meta['component'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['flat', 'outlined'] },
  },
  args: {
    columns: COLUMNS,
    rows: ROWS,
    rowKey: 'name',
    caption: 'Projets de l’organisation',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" style="width: 640px" />',
  }),
}

export const Tri: Story = {
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" style="width: 640px" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const commitsHeader = canvas.getByRole('button', { name: 'Commits' })

    await userEvent.click(commitsHeader)
    await waitFor(() => {
      const cells = canvasElement.querySelectorAll('tbody tr:first-child td')
      expect(cells[0]?.textContent).toContain('Granit')
    })
    await userEvent.click(commitsHeader)
    await waitFor(() => {
      const cells = canvasElement.querySelectorAll('tbody tr:first-child td')
      expect(cells[0]?.textContent).toContain('Brume')
    })
  },
}

/** Header global : titre à gauche (prop `title` ou slot #header), recherche à droite. */
export const Recherche: Story = {
  args: { title: 'Projets', searchable: true },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" style="width: 640px" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('searchbox', { name: 'Rechercher dans le tableau' })

    // filtrage insensible aux accents : « brume » matche, les autres lignes sortent
    await userEvent.type(field, 'brume')
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr').length).toBe(1)
    })
    // la croix d'effacement (Input clearable) restaure la liste
    await userEvent.click(canvas.getByRole('button', { name: 'Effacer' }))
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr').length).toBe(4)
    })
  },
}

/** Footer : lignes par page, « X–Y sur Z » puis Pagination, groupés à droite. */
export const PaginationLocale: Story = {
  args: { rows: ROWS_MANY, showRange: true },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args, perPage: ref(5), page: ref(1) }),
    template: `
      <DataTable v-bind="args" v-model:per-page="perPage" v-model:page="page"
        :per-page-options="[5, 10, 20]" style="width: 760px" />
    `,
  }),
  // Layout non mesurable en jsdom : la nav (responsive off, donc non confinée)
  // a une largeur intrinsèque et le groupe droit est collé au bord du footer.
  play: async ({ canvasElement }) => {
    const footer = canvasElement.querySelector('.ds-table-footer') as HTMLElement
    const nav = footer.querySelector('.ds-pagination') as HTMLElement
    const perPage = footer.querySelector('.ds-table-per-page') as HTMLElement
    await waitFor(() => {
      expect(nav.getBoundingClientRect().width).toBeGreaterThan(0)
      expect(perPage.getBoundingClientRect().right).toBeLessThanOrEqual(
        nav.getBoundingClientRect().left + 1,
      )
      expect(nav.getBoundingClientRect().right).toBeCloseTo(footer.getBoundingClientRect().right, 0)
    })
  },
}

/** Le sélecteur « lignes par page » redécoupe et revient page 1 (popover réel). */
export const LignesParPage: Story = {
  args: { rows: ROWS_MANY, showRange: true },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args, perPage: ref(5), page: ref(2) }),
    template: `
      <DataTable v-bind="args" v-model:per-page="perPage" v-model:page="page"
        :per-page-options="[5, 10, 20]" style="width: 760px" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Lignes par page : 5' }))
    const option = await canvas.findByRole('menuitem', { name: '10' })
    await userEvent.click(option)
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr').length).toBe(10)
      // retour page 1 : la première ligne du jeu réapparaît
      expect(canvasElement.querySelector('tbody tr td:nth-child(1)')?.textContent).toContain(
        'Socle',
      )
    })
  },
}

/** Sélection : colonne de checkboxes, master « tout sélectionner » sur la page visible. */
export const Selection: Story = {
  args: { rows: ROWS_MANY, selectable: true, showRange: true },
  render: (args) => ({
    components: { DataTable, Typography },
    setup: () => ({ args, selected: ref<DataTableRowId[]>([]), perPage: ref(5) }),
    template: `
      <DataTable v-bind="args" v-model:selected="selected" v-model:per-page="perPage"
        :per-page-options="[5, 10]" style="width: 760px" />
      <Typography tone="muted" style="margin-block-start: 8px">
        Sélection : {{ selected.length ? selected.join(', ') : 'aucune' }}
      </Typography>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const master = canvas.getByRole('checkbox', {
      name: 'Tout sélectionner',
    }) as HTMLInputElement

    // master → toutes les cases de la page visible cochées (les inputs masqués
    // sont en pointer-events: none : on clique les <label> englobants)
    await userEvent.click(master.closest('label')!)
    await waitFor(() => {
      const boxes = canvas.getAllByRole('checkbox').filter((box) => box !== master)
      boxes.forEach((box) => expect(box).toBeChecked())
    })
    // le décompte s'affiche à gauche du footer
    await waitFor(() => {
      expect(canvas.getByText('5 éléments sélectionnés')).toBeInTheDocument()
    })

    // décocher une ligne → le master repasse en indéterminé
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Sélectionner la ligne 1' }).closest('label')!,
    )
    await waitFor(() => {
      expect(master.indeterminate).toBe(true)
      expect(canvas.getByText('4 éléments sélectionnés')).toBeInTheDocument()
    })
  },
}

/** Toutes les options ensemble : header, recherche, sélection, zébrage, footer. */
export const TableauComplet: Story = {
  args: {
    rows: ROWS_MANY,
    title: 'Projets de l’organisation',
    caption: undefined,
    searchable: true,
    selectable: true,
    striped: true,
    showRange: true,
  },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({
      args,
      selected: ref<DataTableRowId[]>([]),
      perPage: ref(5),
      page: ref(1),
    }),
    template: `
      <DataTable v-bind="args" v-model:selected="selected" v-model:per-page="perPage"
        v-model:page="page" :per-page-options="[5, 10, 20]" style="width: 760px" />
    `,
  }),
}

export const CellulesPersonnalisees: Story = {
  render: (args) => ({
    components: { DataTable, Chip },
    setup: () => ({ args }),
    template: `
      <DataTable v-bind="args" style="width: 640px">
        <template #cell-status="{ value }">
          <Chip :tone="value === 'actif' ? 'success' : 'neutral'">{{ value }}</Chip>
        </template>
      </DataTable>
    `,
  }),
}

/** Slot `head-<key>` : libellé d'en-tête enrichi (rendu dans le bouton de tri). */
export const EnTetesPersonnalises: Story = {
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: `
      <DataTable v-bind="args" style="width: 640px">
        <template #head-commits="{ column }">
          <span>{{ column.label }} (30 j)</span>
        </template>
      </DataTable>
    `,
  }),
}

/** Densité réduite : paddings de cellules -1 cran, composés en compact. */
/** Habillage du conteneur — même échelle que l'Accordion : `flat` (défaut) et `outlined`. */
export const Variantes: Story = {
  args: { title: 'Projets', searchable: true, caption: undefined },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args, variants: ['flat', 'outlined'] as const }),
    template: `
      <div style="display: grid; gap: 32px; width: 680px">
        <DataTable
          v-for="variant in variants"
          :key="variant"
          v-bind="args"
          :variant="variant"
          :title="'Projets — ' + variant"
        />
      </div>
    `,
  }),
}

export const Compact: Story = {
  args: { rows: ROWS_MANY, title: 'Projets', searchable: true, compact: true, showRange: true },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args, perPage: ref(10) }),
    template: `
      <DataTable v-bind="args" v-model:per-page="perPage" :per-page-options="[10, 20]"
        style="width: 760px" />
    `,
  }),
}

/**
 * En-tête figé : suppose une zone défilante bornée — ici par `height`, qui borne
 * le composant entier (toolbar et pagination comprises). Un parent de hauteur
 * définie suffit aussi, cf. `PleineHauteur`.
 */
export const StickyHeader: Story = {
  args: { rows: ROWS_MANY, stickyHeader: true, height: 320, caption: undefined },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" style="width: 640px" />',
  }),
}

/**
 * Hauteur pilotée par le parent : le tableau occupe 100 % de son conteneur et ne
 * rétrécit PAS sur une page incomplète — la dernière page (2 lignes) fait
 * exactement la même hauteur qu'une page pleine, la pagination reste collée en
 * bas. Aucune prop : `stickyHeader` fonctionne ici sans `height`, le scroller
 * étant borné par le parent.
 */
export const PleineHauteur: Story = {
  args: {
    rows: ROWS_MANY,
    variant: 'outlined',
    title: 'Projets',
    searchable: true,
    stickyHeader: true,
    showRange: true,
    caption: undefined,
  },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args, perPage: ref(10), page: ref(1) }),
    template: `
      <div style="block-size: 460px; inline-size: 760px">
        <DataTable v-bind="args" v-model:per-page="perPage" v-model:page="page"
          :per-page-options="[10, 20]" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const wrapper = canvasElement.querySelector('.ds-table-wrapper') as HTMLElement
    const scroller = canvasElement.querySelector('.ds-table-scroller') as HTMLElement

    // le composant épouse le parent, et le trop-plein défile (au lieu d'être
    // rogné par le `overflow: clip` de la variante outlined)
    expect(Math.round(wrapper.getBoundingClientRect().height)).toBe(460)
    expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight)

    // dernière page : 2 lignes seulement, hauteur du composant inchangée
    await userEvent.click(canvas.getByRole('button', { name: 'Page 3' }))
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr').length).toBe(2)
      expect(Math.round(wrapper.getBoundingClientRect().height)).toBe(460)
    })
  },
}

/** Zébrage : une ligne sur deux sur fond en creux. */
export const Striped: Story = {
  args: { rows: ROWS_MANY.slice(0, 8), striped: true },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" style="width: 640px" />',
  }),
}

/** Mode stack : sous 640px de CONTENEUR, les lignes deviennent des cartes — pur CSS. */
export const ResponsiveStack: Story = {
  args: { responsive: 'stack', selectable: true },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args, selected: ref<DataTableRowId[]>([]) }),
    template: `
      <div style="width: 360px; border: 1px dashed var(--ds-color-border); padding: 8px">
        <DataTable v-bind="args" v-model:selected="selected" />
      </div>
    `,
  }),
}

/**
 * Mode serveur : le composant n'applique NI filtre NI tri NI découpage — chaque
 * changement d'état émet `update:params` et le consommateur répond (ici un
 * pseudo-serveur : latence simulée + filtre/tri/slice sur le jeu complet).
 */
export const ServerSide: Story = {
  args: {
    title: 'Projets (serveur simulé)',
    searchable: true,
    serverSide: true,
    showRange: true,
    caption: undefined,
  },
  render: (args) => ({
    components: { DataTable },
    setup: () => {
      const rows = ref(ROWS_MANY.slice(0, 5))
      const total = ref(ROWS_MANY.length)
      const loading = ref(false)
      const perPage = ref(5)
      const page = ref(1)

      function onParams(params: DataTableParams) {
        loading.value = true
        setTimeout(() => {
          let result = [...ROWS_MANY]
          if (params.search) {
            const needle = params.search.toLowerCase()
            result = result.filter((row) => row.name.toLowerCase().includes(needle))
          }
          if (params.sortKey) {
            const key = params.sortKey as keyof (typeof ROWS_MANY)[number]
            const factor = params.sortDirection === 'desc' ? -1 : 1
            result.sort((a, b) => String(a[key]).localeCompare(String(b[key]), 'fr') * factor)
          }
          total.value = result.length
          const per = params.perPage ?? result.length
          rows.value = result.slice((params.page - 1) * per, params.page * per)
          loading.value = false
        }, 500)
      }

      return { args, rows, total, loading, perPage, page, onParams }
    },
    template: `
      <DataTable v-bind="args" :rows="rows" :total="total" :loading="loading"
        v-model:per-page="perPage" v-model:page="page" :per-page-options="[5, 10]"
        style="width: 760px" @update:params="onParams" />
    `,
  }),
}

export const Chargement: Story = {
  args: { loading: true },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" style="width: 640px" />',
  }),
}

export const Vide: Story = {
  args: { rows: [], emptyText: 'Aucun projet pour le moment' },
  render: (args) => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" style="width: 640px" />',
  }),
}
