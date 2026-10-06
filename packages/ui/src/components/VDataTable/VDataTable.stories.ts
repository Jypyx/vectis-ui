import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import type { Component } from 'vue'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VChip from '../VChip/VChip.vue'
import VTypography from '../VTypography/VTypography.vue'
import VDataTableSfc from './VDataTable.vue'
import type { DataTableParams, DataTableRowId } from './VDataTable.vue'

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
    orgProjectsSubtitle: 'Every project of the organization, active or archived.',
    activeOnly: 'Active only',
    newProject: 'New project',
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
    orgProjectsSubtitle: "Tous les projets de l'organisation, actifs ou archivés.",
    activeOnly: 'Actifs seulement',
    newProject: 'Nouveau projet',
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
      '<VDataTable v-bind="args" :columns="columns" :rows="rows" :title="t.orgProjects" style="width: 640px" />',
  }),
}

export const Sorting: Story = {
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns, rows }),
    template:
      '<VDataTable v-bind="args" :columns="columns" :rows="rows" :title="t.orgProjects" style="width: 640px" />',
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

/** The header: the title on the left, the search on the right. */
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
     * The title is a VTypography, so `.v-data-table-title` and `.v-typography` sit on the same
     * element at equal specificity. The colour goes through the custom property `.v-typography`
     * reads, and not through a `color` declaration that would collide with it and be arbitrated
     * by an order nothing controls once each sheet ships separately.
     */
    const title = canvasElement.querySelector('.v-data-table-title') as HTMLElement
    await expect(getComputedStyle(title).getPropertyValue('--typography-color')).not.toBe('')

    await userEvent.type(field, 'brume')
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr').length).toBe(1)
    })
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }))
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr').length).toBe(4)
    })
  },
}

/** The footer: rows per page, "X–Y of Z" then the VPagination, grouped on the right. */
/**
 * `subtitle` under the title, which describes the table; the `#toolbar` slot adds a row of
 * actions and filters between the header and the table.
 */
export const HeaderAndToolbar: Story = {
  args: { searchable: true },
  render: (args) => ({
    components: { VDataTable, VButton },
    setup: () => {
      const activeOnly = ref(false)
      const shown = computed(() =>
        activeOnly.value ? rows.value.filter((row) => row.status === t.value.active) : rows.value,
      )
      return { args, t, columns, shown, activeOnly }
    },
    template: `
      <VDataTable v-bind="args" :columns="columns" :rows="shown" :title="t.orgProjects"
        :subtitle="t.orgProjectsSubtitle" style="width: 640px">
        <template #toolbar>
          <VButton variant="outline" tone="neutral" size="sm" :aria-pressed="activeOnly"
            @click="activeOnly = !activeOnly">{{ t.activeOnly }}</VButton>
          <VButton size="sm">{{ t.newProject }}</VButton>
        </template>
      </VDataTable>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole('table', { name: 'Organization projects' })
    await expect(table).toHaveAccessibleDescription(
      'Every project of the organization, active or archived.',
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Active only' }))
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr').length).toBe(3)
    })
  },
}

/** The `#header` slot replaces the title and subtitle; the table is then named with `aria-label`. */
export const CustomHeader: Story = {
  args: { searchable: true },
  render: (args) => ({
    components: { VDataTable, VChip },
    setup: () => ({ args, t, columns, rows }),
    template: `
      <VDataTable v-bind="args" :columns="columns" :rows="rows" :aria-label="t.orgProjects"
        style="width: 640px">
        <template #header>
          <strong>{{ t.orgProjects }}</strong>
          <VChip tone="neutral">{{ rows.length }}</VChip>
        </template>
      </VDataTable>
    `,
  }),
}

export const LocalPagination: Story = {
  args: { showRange: true },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns, rows: manyRows, perPage: ref(5), page: ref(1) }),
    template: `
      <VDataTable v-bind="args" :title="t.projects" :columns="columns" :rows="rows" v-model:per-page="perPage" v-model:page="page"
        :per-page-options="[5, 10, 20]" style="width: 760px" />
    `,
  }),
  // Layout that is not measurable in jsdom: the nav has an intrinsic width and the
  // right-hand group is stuck to the footer's edge.
  play: async ({ canvasElement }) => {
    const footer = canvasElement.querySelector('.v-data-table-footer') as HTMLElement
    const nav = footer.querySelector('.v-pagination') as HTMLElement
    const perPage = footer.querySelector('.v-data-table-per-page') as HTMLElement
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
    setup: () => ({ args, t, columns, rows: manyRows, perPage: ref(5), page: ref(2) }),
    template: `
      <VDataTable v-bind="args" :title="t.projects" :columns="columns" :rows="rows" v-model:per-page="perPage" v-model:page="page"
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
      <VDataTable v-bind="args" :title="t.projects" :columns="columns" :rows="rows" v-model:selected="selected" v-model:per-page="perPage"
        :per-page-options="[5, 10]" style="width: 760px" />
      <VTypography tone="muted" style="margin-block-start: 8px">
        {{ t.selection }}: {{ selected.length ? selected.join(', ') : t.none }}
      </VTypography>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const master = canvas.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement

    // The master box → every box of the visible page checked (the hidden inputs are in
    // pointer-events: none, so the enclosing <label>s are clicked)
    await userEvent.click(master.closest('label')!)
    await waitFor(() => {
      const boxes = canvas.getAllByRole('checkbox').filter((box) => box !== master)
      for (const box of boxes) expect(box).toBeChecked()
    })
    await waitFor(() => {
      expect(canvas.getByText('5 items selected')).toBeInTheDocument()
    })

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
      <VDataTable v-bind="args" :columns="columns" :rows="rows" :title="t.orgProjects" style="width: 640px">
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
      <VDataTable v-bind="args" :columns="columns" :rows="rows" :title="t.orgProjects" style="width: 640px">
        <template #head-commits="{ column }">
          <span>{{ column.label }} {{ t.last30Days }}</span>
        </template>
      </VDataTable>
    `,
  }),
}

/**
 * Decoration of the container; the same scale as VAccordion: `flat` (the default) and
 * `outlined`.
 */
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
  // Jsdom computes no style: unframed, the scrolling area rounds the tinted heading, while the
  // root stays unclipped so the search field's focus ring is not cropped.
  play: async ({ canvasElement }) => {
    const flat = canvasElement.querySelector<HTMLElement>('.v-data-table[data-variant="flat"]')!
    const scroller = flat.querySelector<HTMLElement>('.v-data-table-scroller')!
    await expect(getComputedStyle(scroller).borderTopLeftRadius).not.toBe('0px')
    await expect(getComputedStyle(flat).overflow).toBe('visible')
  },
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
 * A frozen header: it assumes a bounded scroll area; here through `height`, which bounds the
 * whole component (the header and the pagination included).
 */
export const StickyHeader: Story = {
  args: { stickyHeader: true, height: 320 },
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns, rows: manyRows }),
    template:
      '<VDataTable v-bind="args" :title="t.projects" :columns="columns" :rows="rows" style="width: 640px" />',
  }),
}

/**
 * `virtual` renders only the rows near the visible part of the table: ten thousand here, under a
 * frozen heading. The heading checkbox still takes every row.
 */
export const Virtual: Story = {
  args: { stickyHeader: true, height: 400, virtual: true, selectable: true, striped: true },
  render: (args) => ({
    components: { VDataTable },
    setup: () => {
      const generated = computed(() =>
        Array.from({ length: 10000 }, (_, index) => ({
          name: `${t.value.project} ${index + 1}`,
          owner: OWNERS[index % OWNERS.length],
          status: index % 3 === 0 ? t.value.archived : t.value.active,
          commits: ((index + 3) * 37) % 500,
        })),
      )
      return { args, t, columns, rows: generated }
    },
    template:
      '<VDataTable v-bind="args" :columns="columns" :rows="rows" :title="t.orgProjects" style="width: 640px" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole('table')
    expect(table).toHaveAttribute('aria-rowcount', '10001')
    const bodyRows = () => [...table.querySelectorAll('tbody tr[aria-rowindex]')]
    await waitFor(() => expect(bodyRows().length).toBeLessThan(40))

    // Scrolled to the end, the last row ends where the scroller does, under a heading still in
    // place: every height is accounted for.
    const scroller = canvasElement.querySelector<HTMLElement>('.v-data-table-scroller')!
    const pageHeight = document.documentElement.scrollHeight
    scroller.scrollTop = scroller.scrollHeight
    await waitFor(() => expect(canvas.getByText('Project 10000')).toBeInTheDocument())
    scroller.scrollTop = scroller.scrollHeight
    await waitFor(() => {
      const last = bodyRows().at(-1)!
      expect(last).toHaveAttribute('aria-rowindex', '10001')
      const gap = scroller.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom
      expect(Math.abs(gap)).toBeLessThan(2)
    })
    const heading = table.querySelector('thead th')!.getBoundingClientRect()
    expect(Math.abs(heading.top - scroller.getBoundingClientRect().top)).toBeLessThan(1)
    // The rows' absolutely positioned parts, their hidden checkboxes, stay inside the scroller
    // rather than stretching the page down to where the rows sit in the scrolled content.
    expect(document.documentElement.scrollHeight).toBe(pageHeight)

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all' }).closest('label')!)
    await waitFor(() => expect(canvas.getByText('10000 items selected')).toBeInTheDocument())
    scroller.scrollTop = 0
    await waitFor(() => expect(canvas.getByText('Project 1')).toBeVisible())
  },
}

/**
 * `hasMore` asks for the next rows through `load-more` as the end of the rows comes into view;
 * the rows already there stay while the next ones load.
 */
export const InfiniteScroll: Story = {
  args: { stickyHeader: true, height: 360, virtual: true },
  render: (args) => ({
    components: { VDataTable },
    setup: () => {
      const page = (from: number) =>
        Array.from({ length: 30 }, (_, i) => ({
          name: `${t.value.project} ${from + i + 1}`,
          owner: OWNERS[(from + i) % OWNERS.length],
          status: t.value.active,
          commits: ((from + i + 3) * 37) % 500,
        }))
      const loaded = ref(page(0))
      const loading = ref(false)
      function onLoadMore() {
        loading.value = true
        setTimeout(() => {
          loaded.value = [...loaded.value, ...page(loaded.value.length)]
          loading.value = false
        }, 400)
      }
      const hasMore = computed(() => loaded.value.length < 150)
      return { args, t, columns, loaded, loading, hasMore, onLoadMore }
    },
    template: `
      <div style="display: grid; gap: 8px; width: 640px">
        <VDataTable
          v-bind="args"
          :title="t.projects"
          :columns="columns"
          :rows="loaded"
          :loading="loading"
          :has-more="hasMore"
          @load-more="onLoadMore"
        />
        <output data-testid="count">{{ loaded.length }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole('table')
    expect(table).toHaveAttribute('aria-rowcount', '-1')
    const scroller = canvasElement.querySelector<HTMLElement>('.v-data-table-scroller')!
    scroller.scrollTop = scroller.scrollHeight
    await waitFor(() => expect(table).toHaveAttribute('aria-busy', 'true'))
    expect(canvas.getByText('Project 30')).toBeInTheDocument()
    await waitFor(() => expect(canvas.getByTestId('count')).toHaveTextContent('60'))
    await waitFor(() => expect(table).not.toHaveAttribute('aria-busy'))
  },
}

/**
 * A height driven by the parent: the table takes 100% of its container and does not shrink on
 * an incomplete page; the last page (2 rows) is exactly the same height as a full one, and the
 * pagination stays stuck to the bottom.
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
    const wrapper = canvasElement.querySelector('.v-data-table') as HTMLElement
    const scroller = canvasElement.querySelector('.v-data-table-scroller') as HTMLElement

    // The component matches the parent, and the overflow scrolls (instead of being cropped by
    // the outlined variant's `overflow: clip`)
    expect(Math.round(wrapper.getBoundingClientRect().height)).toBe(460)
    expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight)

    await userEvent.click(canvas.getByRole('button', { name: 'Last page' }))
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
    setup: () => ({ args, t, columns, rows: computed(() => manyRows.value.slice(0, 8)) }),
    template:
      '<VDataTable v-bind="args" :title="t.projects" :columns="columns" :rows="rows" style="width: 640px" />',
  }),
}

/**
 * Server mode: the component applies NEITHER filter NOR sort NOR slicing; every state change
 * emits `update:params` and the consumer answers (here a pseudo-server: a simulated latency +
 * filter/sort/slice on the full set).
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
      '<VDataTable v-bind="args" :columns="columns" :rows="rows" :title="t.orgProjects" style="width: 640px" />',
  }),
}

export const Empty: Story = {
  render: (args) => ({
    components: { VDataTable },
    setup: () => ({ args, t, columns }),
    template:
      '<VDataTable v-bind="args" :title="t.projects" :columns="columns" :rows="[]" :empty-text="t.noProjectYet" style="width: 640px" />',
  }),
}
