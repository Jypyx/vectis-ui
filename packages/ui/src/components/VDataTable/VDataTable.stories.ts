import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import type { Component } from 'vue'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VChip from '../VChip/VChip.vue'
import VTypography from '../VTypography/VTypography.vue'
import VDataTableSfc from './VDataTable.vue'
import type { DataTableParams, DataTableRowId } from './VDataTable.vue'

// A generic SFC: its generic function signature is not assignable to Storybook's
// Component types — it is erased for the stories.
const VDataTable = VDataTableSfc as unknown as Component

const t = storyText({
  en: {
    project: 'Project',
    owner: 'Owner',
    status: 'Status',
    commits: 'Commits',
    active: 'active',
    archived: 'archived',
    projects: 'Projects',
    orgProjects: 'Organization projects',
    selection: 'Selection',
    none: 'none',
    projectsDash: (variant: string) => `Projects — ${variant}`,
    last30Days: '(last 30 days)',
    simulatedServer: 'Projects (simulated server)',
    noProjectYet: 'No project yet',
  },
  fr: {
    project: 'Projet',
    owner: 'Responsable',
    status: 'Statut',
    commits: 'Commits',
    active: 'actif',
    archived: 'archivé',
    projects: 'Projets',
    orgProjects: "Projets de l'organisation",
    selection: 'Sélection',
    none: 'aucune',
    projectsDash: (variant: string) => `Projets — ${variant}`,
    last30Days: '(30 j)',
    simulatedServer: 'Projets (serveur simulé)',
    noProjectYet: 'Aucun projet pour le moment',
  },
})

const columns = computed(() => [
  { key: 'name', label: t.value.project, sortable: true },
  { key: 'owner', label: t.value.owner },
  { key: 'status', label: t.value.status },
  { key: 'commits', label: t.value.commits, sortable: true, align: 'end' as const },
])

const rows = computed(() => [
  { name: 'Vectis', owner: 'Xavier', status: t.value.active, commits: 320 },
  { name: 'Atlas', owner: 'Nadia', status: t.value.active, commits: 87 },
  { name: 'Brume', owner: 'Louis', status: t.value.archived, commits: 1204 },
  { name: 'Granit', owner: 'Emma', status: t.value.active, commits: 45 },
])

// A fuller set (22 rows) for the search, the pagination and the sticky header.
// `Éclair` keeps its accent on purpose: the accent-insensitive search is demonstrated
// on this list.
const PROJECT_NAMES = [
  'Vectis',
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
  'Zenith',
]
const OWNERS = ['Xavier', 'Nadia', 'Louis', 'Emma']
const manyRows = computed(() =>
  PROJECT_NAMES.map((name, index) => ({
    name,
    owner: OWNERS[index % OWNERS.length],
    status: index % 3 === 0 ? t.value.archived : t.value.active,
    commits: ((index + 3) * 37) % 500,
  })),
)

const meta: Meta = {
  title: 'Components/DataTable',
  component: VDataTable as Meta['component'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['flat', 'outlined'] },
  },
  args: { rowKey: 'name' },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns, rows }),
    template:
      '<VDataTable v-bind="args" :columns="columns" :rows="rows" :caption="t.orgProjects" style="width: 640px" />',
  }),
}

export const Sorting: Story = {
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns, rows }),
    template:
      '<VDataTable v-bind="args" :columns="columns" :rows="rows" :caption="t.orgProjects" style="width: 640px" />',
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

/** The global header: the title on the left (the `title` prop or the #header slot), the search on the right. */
export const Search: Story = {
  args: { searchable: true },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns, rows }),
    template:
      '<VDataTable v-bind="args" :columns="columns" :rows="rows" :title="t.projects" style="width: 640px" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('searchbox', { name: 'Search the table' })

    /*
     * The title is a VTypography, so `.v-table-title` and `.v-typography` sit on the
     * same element at equal specificity. The colour goes through the custom property
     * `.v-typography` reads, and NOT through a `color` declaration that would collide
     * with it and be arbitrated by an order nothing controls once each sheet ships
     * separately. A revert to `color:` empties this property — that is what goes red.
     */
    const title = canvasElement.querySelector('.v-table-title') as HTMLElement
    await expect(getComputedStyle(title).getPropertyValue('--typography-color')).not.toBe('')

    // accent-insensitive filtering: "brume" matches, the other rows drop out
    await userEvent.type(field, 'brume')
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr').length).toBe(1)
    })
    // the clear cross (VInput clearable) restores the list
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }))
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr').length).toBe(4)
    })
  },
}

/** The footer: rows per page, "X–Y of Z" then the VPagination, grouped on the right. */
export const LocalPagination: Story = {
  args: { showRange: true },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, columns, rows: manyRows, perPage: ref(5), page: ref(1) }),
    template: `
      <VDataTable v-bind="args" :columns="columns" :rows="rows" v-model:per-page="perPage" v-model:page="page"
        :per-page-options="[5, 10, 20]" style="width: 760px" />
    `,
  }),
  // Layout that is not measurable in jsdom: the nav (responsive off, hence not
  // confined) has an intrinsic width and the right-hand group is stuck to the footer's
  // edge.
  play: async ({ canvasElement }) => {
    const footer = canvasElement.querySelector('.v-table-footer') as HTMLElement
    const nav = footer.querySelector('.v-pagination') as HTMLElement
    const perPage = footer.querySelector('.v-table-per-page') as HTMLElement
    await waitFor(() => {
      expect(nav.getBoundingClientRect().width).toBeGreaterThan(0)
      expect(perPage.getBoundingClientRect().right).toBeLessThanOrEqual(
        nav.getBoundingClientRect().left + 1,
      )
      expect(nav.getBoundingClientRect().right).toBeCloseTo(footer.getBoundingClientRect().right, 0)
    })
  },
}

/** The "rows per page" selector re-slices and returns to page 1 (a real popover). */
export const RowsPerPage: Story = {
  args: { showRange: true },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, columns, rows: manyRows, perPage: ref(5), page: ref(2) }),
    template: `
      <VDataTable v-bind="args" :columns="columns" :rows="rows" v-model:per-page="perPage" v-model:page="page"
        :per-page-options="[5, 10, 20]" style="width: 760px" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Rows per page: 5' }))
    const option = await canvas.findByRole('menuitem', { name: '10' })
    await userEvent.click(option)
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr').length).toBe(10)
      // back to page 1: the first row of the set reappears
      expect(canvasElement.querySelector('tbody tr td:nth-child(1)')?.textContent).toContain(
        'Vectis',
      )
    })
  },
}

/** Selection: a checkbox column, and a "select all" master box over the visible page. */
export const Selection: Story = {
  args: { selectable: true, showRange: true },
  render: (args) => ({
    components: { VDataTable, VTypography },
    setup: () => ({
      args,
      t,
      columns,
      rows: manyRows,
      selected: ref<DataTableRowId[]>([]),
      perPage: ref(5),
    }),
    template: `
      <VDataTable v-bind="args" :columns="columns" :rows="rows" v-model:selected="selected" v-model:per-page="perPage"
        :per-page-options="[5, 10]" style="width: 760px" />
      <VTypography tone="muted" style="margin-block-start: 8px">
        {{ t.selection }}: {{ selected.length ? selected.join(', ') : t.none }}
      </VTypography>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const master = canvas.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement

    // the master box → every box of the visible page checked (the hidden inputs are in
    // pointer-events: none, so the enclosing <label>s are clicked)
    await userEvent.click(master.closest('label')!)
    await waitFor(() => {
      const boxes = canvas.getAllByRole('checkbox').filter((box) => box !== master)
      // `for…of` rather than `forEach`: Storybook instruments `expect`, so the callback
      // would be handing a promise to a signature that expects void.
      for (const box of boxes) expect(box).toBeChecked()
    })
    // the count appears on the left of the footer
    await waitFor(() => {
      expect(canvas.getByText('5 items selected')).toBeInTheDocument()
    })

    // unchecking a row → the master box goes back to indeterminate
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row 1' }).closest('label')!)
    await waitFor(() => {
      expect(master.indeterminate).toBe(true)
      expect(canvas.getByText('4 items selected')).toBeInTheDocument()
    })
  },
}

/** Every option together: header, search, selection, striping, footer. */
export const FullTable: Story = {
  args: {
    searchable: true,
    selectable: true,
    striped: true,
    showRange: true,
  },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({
      args,
      t,
      columns,
      rows: manyRows,
      selected: ref<DataTableRowId[]>([]),
      perPage: ref(5),
      page: ref(1),
    }),
    template: `
      <VDataTable v-bind="args" :columns="columns" :rows="rows" :title="t.orgProjects"
        v-model:selected="selected" v-model:per-page="perPage"
        v-model:page="page" :per-page-options="[5, 10, 20]" style="width: 760px" />
    `,
  }),
}

export const CustomCells: Story = {
  render: (args) => ({
    components: { VDataTable, VChip },
    setup: () => ({ args, t, columns, rows }),
    template: `
      <VDataTable v-bind="args" :columns="columns" :rows="rows" :caption="t.orgProjects" style="width: 640px">
        <template #cell-status="{ value }">
          <VChip :tone="value === t.active ? 'success' : 'neutral'">{{ value }}</VChip>
        </template>
      </VDataTable>
    `,
  }),
}

/** The `head-<key>` slot: an enriched header label (rendered inside the sort button). */
export const CustomHeaders: Story = {
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns, rows }),
    template: `
      <VDataTable v-bind="args" :columns="columns" :rows="rows" :caption="t.orgProjects" style="width: 640px">
        <template #head-commits="{ column }">
          <span>{{ column.label }} {{ t.last30Days }}</span>
        </template>
      </VDataTable>
    `,
  }),
}

/** Decoration of the container — the same scale as VAccordion: `flat` (the default) and `outlined`. */
export const Variants: Story = {
  args: { searchable: true },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns, rows, variants: ['flat', 'outlined'] as const }),
    template: `
      <div style="display: grid; gap: 32px; width: 680px">
        <VDataTable
          v-for="variant in variants"
          :key="variant"
          v-bind="args"
          :columns="columns"
          :rows="rows"
          :variant="variant"
          :title="t.projectsDash(variant)"
        />
      </div>
    `,
  }),
}

/** Reduced density: cell paddings one notch down, the composed parts in compact. */
export const Compact: Story = {
  args: { compact: true, searchable: true, showRange: true },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns, rows: manyRows, perPage: ref(10) }),
    template: `
      <VDataTable v-bind="args" :columns="columns" :rows="rows" :title="t.projects"
        v-model:per-page="perPage" :per-page-options="[10, 20]" style="width: 760px" />
    `,
  }),
}

/**
 * A frozen header: it assumes a bounded scroll area — here through `height`, which
 * bounds the whole component (the toolbar and the pagination included). A parent with a
 * defined height works too, see `FullHeight`.
 */
export const StickyHeader: Story = {
  args: { stickyHeader: true, height: 320 },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, columns, rows: manyRows }),
    template: '<VDataTable v-bind="args" :columns="columns" :rows="rows" style="width: 640px" />',
  }),
}

/**
 * A height driven by the parent: the table takes 100% of its container and does NOT
 * shrink on an incomplete page — the last page (2 rows) is exactly the same height as a
 * full one, and the pagination stays stuck to the bottom. No prop needed: `stickyHeader`
 * works here without `height`, the scroller being bounded by the parent.
 */
export const FullHeight: Story = {
  args: {
    variant: 'outlined',
    searchable: true,
    stickyHeader: true,
    showRange: true,
  },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns, rows: manyRows, perPage: ref(10), page: ref(1) }),
    template: `
      <div style="block-size: 460px; inline-size: 760px">
        <VDataTable v-bind="args" :columns="columns" :rows="rows" :title="t.projects"
          v-model:per-page="perPage" v-model:page="page" :per-page-options="[10, 20]" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const wrapper = canvasElement.querySelector('.v-table-wrapper') as HTMLElement
    const scroller = canvasElement.querySelector('.v-table-scroller') as HTMLElement

    // the component matches the parent, and the overflow scrolls (instead of being
    // cropped by the outlined variant's `overflow: clip`)
    expect(Math.round(wrapper.getBoundingClientRect().height)).toBe(460)
    expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight)

    // the last page: only 2 rows, the component's height unchanged
    await userEvent.click(canvas.getByRole('button', { name: 'Page 3' }))
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr').length).toBe(2)
      expect(Math.round(wrapper.getBoundingClientRect().height)).toBe(460)
    })
  },
}

/** Striping: every other row on a sunken background. */
export const Striped: Story = {
  args: { striped: true },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, columns, rows: computed(() => manyRows.value.slice(0, 8)) }),
    template: '<VDataTable v-bind="args" :columns="columns" :rows="rows" style="width: 640px" />',
  }),
}

/** Stack mode: under 640px of CONTAINER, the rows become cards — pure CSS. */
export const ResponsiveStack: Story = {
  args: { responsive: 'stack', selectable: true },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, columns, rows, selected: ref<DataTableRowId[]>([]) }),
    template: `
      <div style="width: 360px; border: 1px dashed var(--vectis-color-border); padding: 8px">
        <VDataTable v-bind="args" :columns="columns" :rows="rows" v-model:selected="selected" />
      </div>
    `,
  }),
}

/**
 * Server mode: the component applies NEITHER filter NOR sort NOR slicing — every state
 * change emits `update:params` and the consumer answers (here a pseudo-server: a
 * simulated latency + filter/sort/slice on the full set).
 */
export const ServerSide: Story = {
  args: {
    searchable: true,
    serverSide: true,
    showRange: true,
  },
  render: (args) => ({
    components: { VDataTable },
    setup: () => {
      const serverRows = ref(manyRows.value.slice(0, 5))
      const total = ref(manyRows.value.length)
      const loading = ref(false)
      const perPage = ref(5)
      const page = ref(1)

      function onParams(params: DataTableParams) {
        loading.value = true
        setTimeout(() => {
          let result = [...manyRows.value]
          if (params.search) {
            const needle = params.search.toLowerCase()
            result = result.filter((row) => row.name.toLowerCase().includes(needle))
          }
          if (params.sortKey) {
            const key = params.sortKey as keyof (typeof result)[number]
            const factor = params.sortDirection === 'desc' ? -1 : 1
            result.sort((a, b) => String(a[key]).localeCompare(String(b[key])) * factor)
          }
          total.value = result.length
          const per = params.perPage ?? result.length
          serverRows.value = result.slice((params.page - 1) * per, params.page * per)
          loading.value = false
        }, 500)
      }

      return { args, t, columns, serverRows, total, loading, perPage, page, onParams }
    },
    template: `
      <VDataTable v-bind="args" :columns="columns" :rows="serverRows" :total="total" :loading="loading"
        :title="t.simulatedServer" v-model:per-page="perPage" v-model:page="page" :per-page-options="[5, 10]"
        style="width: 760px" @update:params="onParams" />
    `,
  }),
}

export const Loading: Story = {
  args: { loading: true },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns, rows }),
    template:
      '<VDataTable v-bind="args" :columns="columns" :rows="rows" :caption="t.orgProjects" style="width: 640px" />',
  }),
}

export const Empty: Story = {
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns }),
    template:
      '<VDataTable v-bind="args" :columns="columns" :rows="[]" :empty-text="t.noProjectYet" style="width: 640px" />',
  }),
}
