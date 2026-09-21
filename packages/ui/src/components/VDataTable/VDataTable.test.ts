import { fireEvent, render, waitFor } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VDataTable from './VDataTable.vue'

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'count', label: 'Total', sortable: true, align: 'end' as const },
]

const ROWS = [
  { name: 'Brume', count: 12 },
  { name: 'Atlas', count: 3 },
  { name: 'Vectis', count: 47 },
]

// A wider set for the pagination/selection (5 rows, one accented name). `Éclair` keeps
// its accent on purpose: it is what the accent-insensitive search is asserted against.
const ROWS_MANY = [
  { name: 'Brume', count: 12 },
  { name: 'Atlas', count: 3 },
  { name: 'Vectis', count: 47 },
  { name: 'Éclair', count: 8 },
  { name: 'Granit', count: 21 },
]

function firstColumnCells(container: Element) {
  return [...container.querySelectorAll('tbody tr td:first-child')].map((td) =>
    td.textContent?.trim(),
  )
}

function bodyRowCount(container: Element) {
  return container.querySelectorAll('tbody tr').length
}

// A harness factory (a single defineComponent in this file): the SFC's generic
// signature is incompatible with the Component type expected here.
function harness(setup: () => Record<string, unknown>, template: string) {
  return defineComponent({
    components: { VDataTable: VDataTable as object },
    setup,
    template,
  })
}

describe('VDataTable', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders a caption, th scope=col and cells with data-label (stack mode)', () => {
    const { container, getByText } = render(VDataTable, {
      props: { columns: COLUMNS, rows: ROWS, caption: 'Projects', responsive: 'stack' },
    })
    expect(getByText('Projects').tagName).toBe('CAPTION')
    expect(container.querySelector('th')?.getAttribute('scope')).toBe('col')
    expect(container.querySelector('td')?.getAttribute('data-label')).toBe('Name')
  })

  it('variant: data-variant set on the root, flat by default', () => {
    const variantOf = (variant?: 'flat' | 'outlined') =>
      render(VDataTable, { props: { columns: COLUMNS, rows: ROWS, variant } })
        .container.querySelector('.v-data-table')
        ?.getAttribute('data-variant')
    expect(variantOf()).toBe('flat')
    expect(variantOf('outlined')).toBe('outlined')
  })

  it('sorting: asc → desc → none, with aria-sort', async () => {
    const { container, getByRole } = render(VDataTable, {
      props: { columns: COLUMNS, rows: ROWS },
    })
    const sortButton = getByRole('button', { name: 'Total' })
    const th = sortButton.closest('th') as HTMLElement
    // `data-icon` names the icon whatever its source (an embedded SVG, a ligature…)
    const glyph = () =>
      sortButton.querySelector<HTMLElement>('.v-data-table-sort-icon')?.dataset.icon

    // the accessible name keeps only the label: the icon is decorative
    expect(glyph()).toBe('swap_vert')

    await fireEvent.click(sortButton)
    expect(firstColumnCells(container)).toEqual(['Atlas', 'Brume', 'Vectis'])
    expect(th.getAttribute('aria-sort')).toBe('ascending')
    expect(glyph()).toBe('arrow_downward')

    await fireEvent.click(sortButton)
    expect(firstColumnCells(container)).toEqual(['Vectis', 'Brume', 'Atlas'])
    expect(th.getAttribute('aria-sort')).toBe('descending')
    expect(glyph()).toBe('arrow_upward')

    await fireEvent.click(sortButton)
    expect(firstColumnCells(container)).toEqual(['Brume', 'Atlas', 'Vectis'])
    expect(th.hasAttribute('aria-sort')).toBe(false)
    expect(glyph()).toBe('swap_vert')
  })

  it('sortIcon/sortAscIcon/sortDescIcon: all three states are overridable', async () => {
    const { getByRole } = render(VDataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        sortIcon: 'unfold_more',
        sortAscIcon: 'north',
        sortDescIcon: 'south',
      },
    })
    const sortButton = getByRole('button', { name: 'Total' })
    const glyph = () =>
      sortButton.querySelector<HTMLElement>('.v-data-table-sort-icon')?.dataset.icon

    expect(glyph()).toBe('unfold_more')
    await fireEvent.click(sortButton)
    expect(glyph()).toBe('north')
    await fireEvent.click(sortButton)
    expect(glyph()).toBe('south')
    await fireEvent.click(sortButton)
    expect(glyph()).toBe('unfold_more')
  })

  it('the empty and loading states', async () => {
    const { getByText, rerender, getByRole } = render(VDataTable, {
      props: { columns: COLUMNS, rows: [], emptyText: 'Nothing to show' },
    })
    expect(getByText('Nothing to show')).toBeTruthy()
    await rerender({ loading: true })
    expect(getByRole('status')).toBeTruthy()
  })

  it('writes the loading text beside the spinner, from the dictionary or the prop', async () => {
    const { container, getByRole, rerender } = render(VDataTable, {
      props: { columns: COLUMNS, rows: [], loading: true },
    })
    const state = container.querySelector('.v-data-table-state') as HTMLElement
    // The spinner names the state once for a screen reader; the visible copy is hidden from it.
    expect(getByRole('status').textContent).toContain('Loading data…')
    expect(
      state.querySelector('.v-data-table-state-loading > span[aria-hidden="true"]')?.textContent,
    ).toBe('Loading data…')
    await rerender({ loadingText: 'Fetching projects' })
    expect(state.textContent).toContain('Fetching projects')
  })

  it('lets the empty and loading states be replaced, handing the empty one the search', async () => {
    const loading = ref(false)
    const Harness = harness(
      () => ({ columns: COLUMNS, rows: ROWS, loading }),
      `
        <VDataTable :columns="columns" :rows="rows" :loading="loading" searchable>
          <template #empty="{ search }"><p>No match for {{ search }}</p></template>
          <template #loading><p>Hold on</p></template>
        </VDataTable>
      `,
    )
    const { getByRole, getByText, queryByRole } = render(Harness)
    await fireEvent.update(getByRole('searchbox'), 'zzz')
    expect(getByText('No match for zzz')).toBeTruthy()

    loading.value = true
    await nextTick()
    expect(getByText('Hold on')).toBeTruthy()
    expect(queryByRole('status')).toBeNull()
  })

  it('puts the #title slot where the title prop goes', () => {
    const Harness = harness(
      () => ({ columns: COLUMNS, rows: ROWS }),
      `
        <VDataTable :columns="columns" :rows="rows" title="Ignored">
          <template #title><strong>Projects</strong></template>
        </VDataTable>
      `,
    )
    const { container } = render(Harness)
    const title = container.querySelector('.v-data-table-title') as HTMLElement
    expect(title.querySelector('strong')?.textContent).toBe('Projects')
    expect(title.textContent).not.toContain('Ignored')
  })

  it('custom cell (with the column scope) and header slots', () => {
    const Harness = harness(
      () => ({ columns: COLUMNS, rows: [ROWS[0]] }),
      `
        <VDataTable :columns="columns" :rows="rows">
          <template #head-name="{ column }"><span>{{ column.label }} (col)</span></template>
          <template #cell-count="{ value, column }"><em>{{ column.label }}: {{ value }}</em></template>
        </VDataTable>
      `,
    )
    const { getByText, getByRole } = render(Harness)
    // head-<key> is rendered inside the sort button (a sortable column)
    expect(getByRole('button', { name: 'Name (col)' })).toBeTruthy()
    expect(getByText('Total: 12').tagName).toBe('EM')
  })

  it('local search: accent-insensitive filtering, on the declared columns only', async () => {
    const rows = ROWS_MANY.map((row) => ({ ...row, secret: 'zzz' }))
    const { container, getByRole, getByText } = render(VDataTable, {
      props: { columns: COLUMNS, rows, searchable: true },
    })
    const field = getByRole('searchbox', { name: 'Search the table' })

    // "eclair" (unaccented) matches "Éclair"
    await fireEvent.update(field, 'eclair')
    expect(firstColumnCells(container)).toEqual(['Éclair'])

    // the `secret` field is not a declared column: no result
    await fireEvent.update(field, 'zzz')
    expect(bodyRowCount(container)).toBe(1)
    expect(getByText('No data')).toBeTruthy()
  })

  it('local pagination: slicing, a controlled page and clamping by derivation', async () => {
    const { container, getByRole } = render(VDataTable, {
      props: { columns: COLUMNS, rows: ROWS_MANY, perPage: 2, page: 3, searchable: true },
    })
    // page 3 of 3 (5 rows / 2) → the last row alone
    expect(firstColumnCells(container)).toEqual(['Granit'])

    // the filter reduces it to 1 page: the display falls back to page 1 without mutating
    // the model
    const field = getByRole('searchbox', { name: 'Search the table' })
    await fireEvent.update(field, 'atlas')
    expect(firstColumnCells(container)).toEqual(['Atlas'])
  })

  it('the "rows per page" selector: it re-slices and returns to page 1', async () => {
    const Harness = harness(
      () => ({ columns: COLUMNS, rows: ROWS_MANY, page: ref(2), perPage: ref(2) }),
      `
        <VDataTable :columns="columns" :rows="rows" row-key="name"
          v-model:page="page" v-model:per-page="perPage" :per-page-options="[2, 4]" />
      `,
    )
    const { container, getByRole } = render(Harness)
    expect(firstColumnCells(container)).toEqual(['Vectis', 'Éclair'])
    expect(getByRole('button', { name: 'Rows per page: 2' })).toBeTruthy()

    // opened through the jsdom popover stub
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    menu.showPopover()
    await nextTick()
    await fireEvent.click(getByRole('menuitem', { name: '4' }))
    // 4 rows per page AND a return to page 1
    expect(firstColumnCells(container)).toEqual(['Brume', 'Atlas', 'Vectis', 'Éclair'])
  })

  /* The button's name is COMPOSITE: the `perPageText` prop (or its dictionary default)
     is passed to `dataTable.perPageValue`, which places the separator — and that varies
     by language (" : " in French, ": " with no space in English). A custom prop must
     therefore travel through the function, not short-circuit it. */
  it('the "rows per page" selector: a custom prop travels through the format', () => {
    const { getByRole } = render(VDataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS_MANY,
        rowKey: 'name',
        perPage: 2,
        perPageOptions: [2, 4],
        perPageText: 'Per page',
      },
    })
    expect(getByRole('button', { name: 'Per page: 2' })).toBeTruthy()
  })

  it('selection: rowKey identities, the master box bounded to the visible page, indeterminate', async () => {
    const selected = ref<(string | number)[]>([])
    const Harness = harness(
      () => ({ columns: COLUMNS, rows: ROWS_MANY, selected, page: ref(2) }),
      `
        <VDataTable :columns="columns" :rows="rows" row-key="name" selectable
          v-model:selected="selected" v-model:page="page" :per-page="2" />
      `,
    )
    const { container, getByRole } = render(Harness)

    // page 2 → Vectis / Éclair visible; row 3 of the table checked → a rowKey identity
    await fireEvent.click(getByRole('checkbox', { name: 'Select row 3' }))
    expect(selected.value).toEqual(['Vectis'])
    expect(container.querySelector('tbody tr')?.hasAttribute('data-selected')).toBe(true)

    // the master box half checked → the indeterminate DOM property (watchEffect flush post)
    const master = getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement
    await waitFor(() => expect(master.indeterminate).toBe(true))

    // the master box: it completes the visible page without touching the rest
    await fireEvent.click(master)
    expect(selected.value).toEqual(['Vectis', 'Éclair'])
    await waitFor(() => expect(master.indeterminate).toBe(false))

    // clicking again: it empties the visible page only (here everything, nothing off-page)
    await fireEvent.click(master)
    expect(selected.value).toEqual([])
  })

  it('footer: the selection count on the left, rows per page → range → pagination on the right', async () => {
    const selected = ref<(string | number)[]>([])
    const Harness = harness(
      () => ({ columns: COLUMNS, rows: ROWS_MANY, selected }),
      `
        <VDataTable :columns="columns" :rows="rows" row-key="name" selectable show-range
          v-model:selected="selected" :per-page="2" :per-page-options="[2, 4]" />
      `,
    )
    const { container, getByRole } = render(Harness)
    const footer = container.querySelector('.v-data-table-footer') as HTMLElement
    const selection = footer.querySelector('.v-data-table-selection') as HTMLElement

    // the live region is set as soon as `selectable` is (empty at zero selection)
    expect([...footer.children].indexOf(selection)).toBe(0)
    expect(selection.textContent).toBe('')

    await fireEvent.click(getByRole('checkbox', { name: 'Select row 1' }))
    expect(selection.textContent).toBe('1 item selected')
    await fireEvent.click(getByRole('checkbox', { name: 'Select row 2' }))
    expect(selection.textContent).toBe('2 items selected')

    const end = footer.querySelector('.v-data-table-footer-end') as HTMLElement
    expect([...end.children].map((el) => el.classList[0])).toEqual([
      'v-data-table-per-page',
      'v-data-table-range',
      'v-pagination',
    ])
  })

  it('warns in DEV when selectable is set without rowKey', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(VDataTable, { props: { columns: COLUMNS, rows: ROWS, selectable: true } })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[VDataTable]'))
  })

  it('serverSide: no local sorting, update:params emitted on sort and on page change', async () => {
    const { container, getByRole, emitted } = render(VDataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        serverSide: true,
        sort: { key: 'name', direction: 'asc' as const },
        perPage: 3,
        total: 9,
      },
    })
    // a controlled sort is set but there is NO local reordering
    expect(firstColumnCells(container)).toEqual(['Brume', 'Atlas', 'Vectis'])

    // the next page (through the composed VPagination) → the full state emitted
    await fireEvent.click(getByRole('button', { name: 'Next page' }))
    const payloads = emitted('update:params') as [unknown][]
    expect(payloads.at(-1)).toEqual([
      { page: 2, perPage: 3, sortKey: 'name', sortDirection: 'asc', search: '' },
    ])
  })

  it('serverSide: a debounced search, a single emission with a return to page 1', async () => {
    vi.useFakeTimers()
    const { getByRole, emitted } = render(VDataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        serverSide: true,
        searchable: true,
        searchDebounce: 200,
        perPage: 3,
        total: 9,
        page: 2,
      },
    })
    const field = getByRole('searchbox', { name: 'Search the table' })
    await fireEvent.update(field, 'so')
    expect(emitted('update:params')).toBeUndefined()

    // the commit (the term + the return to page 1) coalesces into ONE emission
    vi.advanceTimersByTime(200)
    await nextTick()
    const payloads = emitted('update:params') as [unknown][]
    expect(payloads).toHaveLength(1)
    expect(payloads[0]).toEqual([
      { page: 1, perPage: 3, sortKey: null, sortDirection: null, search: 'so' },
    ])
  })

  it('serverSide: searchDebounce 0 emits synchronously', async () => {
    const { getByRole, emitted } = render(VDataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        serverSide: true,
        searchable: true,
        searchDebounce: 0,
        perPage: 3,
      },
    })
    await fireEvent.update(getByRole('searchbox'), 'atlas')
    await nextTick()
    expect(emitted('update:params')).toHaveLength(1)
  })

  it('serverSide: a search given at mount is the one every request reports', async () => {
    const { getByRole, emitted } = render(VDataTable, {
      props: { columns: COLUMNS, rows: ROWS, serverSide: true, search: 'atlas', perPage: 3 },
    })
    await fireEvent.click(getByRole('button', { name: 'Name' }))
    const payloads = emitted('update:params') as [{ search: string }][]
    expect(payloads.at(-1)?.[0].search).toBe('atlas')
  })

  // The selection is looked up with a Set, which tells 7 from "7": turned into text, a
  // numeric key never matched a selected id again.
  it('selection: a numeric rowKey keeps its identities numbers, and finds them again', async () => {
    const rows = [
      { id: 7, name: 'Brume', count: 12 },
      { id: 8, name: 'Atlas', count: 3 },
    ]
    const selected = ref<(string | number)[]>([8])
    const Harness = harness(
      () => ({ columns: COLUMNS, rows, selected }),
      `<VDataTable :columns="columns" :rows="rows" row-key="id" selectable v-model:selected="selected" />`,
    )
    const { getByRole } = render(Harness)
    expect((getByRole('checkbox', { name: 'Select row 2' }) as HTMLInputElement).checked).toBe(true)

    await fireEvent.click(getByRole('checkbox', { name: 'Select row 1' }))
    expect(selected.value).toEqual([8, 7])
  })

  // VPagination has no `variant` prop: passed anyway, it lands on the <nav> as a stray
  // HTML attribute.
  it('hands the pagination no attribute it does not declare', () => {
    const { container } = render(VDataTable, {
      props: { columns: COLUMNS, rows: ROWS_MANY, perPage: 2 },
    })
    expect(container.querySelector('.v-pagination')?.hasAttribute('variant')).toBe(false)
  })

  it('fallthrough: class on the wrapper, the rest on the table', () => {
    const { container } = render(VDataTable, {
      props: { columns: COLUMNS, rows: ROWS },
      attrs: { class: 'my-class', 'aria-describedby': 'caption' },
    })
    const wrapper = container.querySelector('.v-data-table') as HTMLElement
    expect(wrapper.classList.contains('my-class')).toBe(true)
    expect(wrapper.hasAttribute('aria-describedby')).toBe(false)
    expect(container.querySelector('table')?.getAttribute('aria-describedby')).toBe('caption')
  })

  // The filling itself (the flex column, the stretchable scroll area) is the browser's
  // business: it is covered by the `FullHeight` play function. Here only the style
  // wiring is locked down.
  it('height: a block-size on the root, never on the scroller', () => {
    const heights: Array<number | string> = [320, '60vh']
    for (const height of heights) {
      const { container } = render(VDataTable, {
        props: { columns: COLUMNS, rows: ROWS, height },
        attrs: { style: 'width: 640px' },
      })
      const wrapper = container.querySelector('.v-data-table') as HTMLElement
      expect(wrapper.style.blockSize).toBe(typeof height === 'number' ? '320px' : '60vh')
      // the consumer's style comes after the prop's: it survives
      expect(wrapper.style.width).toBe('640px')
      expect(container.querySelector('.v-data-table-scroller')?.hasAttribute('style')).toBe(false)
    }
  })

  it('without height: no inline height, the parent decides', () => {
    const { container } = render(VDataTable, { props: { columns: COLUMNS, rows: ROWS } })
    const wrapper = container.querySelector('.v-data-table') as HTMLElement
    expect(wrapper.style.blockSize).toBe('')
    expect(container.querySelector('.v-data-table-scroller')?.hasAttribute('style')).toBe(false)
  })

  describe('logic', () => {
    const DATE_COLUMNS = [{ key: 'd', label: 'Date', sortable: true }]

    it('sorts Date values by time, not by their weekday', async () => {
      const rows = [
        { d: new Date(2026, 0, 5) },
        { d: new Date(2026, 0, 3) },
        { d: new Date(2026, 0, 1) },
      ]
      const { container } = render(VDataTable, {
        props: { columns: DATE_COLUMNS, rows, sort: { key: 'd', direction: 'asc' as const } },
      })
      const days = [...container.querySelectorAll('tbody td')].map(
        (td) => td.textContent?.match(/Jan 0(\d)/)?.[1],
      )
      expect(days).toEqual(['1', '3', '5'])
    })

    it('sorts numbers written as text by value, negatives and decimals included', () => {
      const rows = [{ v: '1.5' }, { v: '-10' }, { v: 1.25 }, { v: '-5' }]
      const { container } = render(VDataTable, {
        props: {
          columns: [{ key: 'v', label: 'V', sortable: true }],
          rows,
          sort: { key: 'v', direction: 'asc' as const },
        },
      })
      expect(firstColumnCells(container)).toEqual(['-10', '-5', '1.25', '1.5'])
    })

    it('serverSide: a response changing the total emits no request', async () => {
      const { emitted, rerender } = render(VDataTable, {
        props: { columns: COLUMNS, rows: [], serverSide: true, page: 3, perPage: 10 },
      })
      await rerender({
        columns: COLUMNS,
        rows: ROWS,
        serverSide: true,
        page: 3,
        perPage: 10,
        total: 100,
      })
      await nextTick()
      expect(emitted('update:params')).toBeUndefined()
    })

    it('serverSide: a search typed and erased within the debounce asks for nothing', async () => {
      vi.useFakeTimers()
      const { getByRole, emitted } = render(VDataTable, {
        props: {
          columns: COLUMNS,
          rows: ROWS,
          serverSide: true,
          searchable: true,
          page: 3,
          perPage: 3,
          total: 30,
        },
      })
      const field = getByRole('searchbox')
      await fireEvent.update(field, 'a')
      await fireEvent.update(field, '')
      vi.advanceTimersByTime(500)
      await nextTick()
      expect(emitted('update:params')).toBeUndefined()
      expect(emitted('update:page')).toBeUndefined()
    })

    it('serverSide: an equal sort handed down again asks for nothing', async () => {
      const { emitted, rerender } = render(VDataTable, {
        props: {
          columns: COLUMNS,
          rows: ROWS,
          serverSide: true,
          sort: { key: 'name', direction: 'asc' as const },
        },
      })
      await rerender({
        columns: COLUMNS,
        rows: ROWS,
        serverSide: true,
        sort: { key: 'name', direction: 'asc' as const },
      })
      await nextTick()
      expect(emitted('update:params')).toBeUndefined()
    })

    it('warns when rowKey names no scalar field, or two rows share one', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      render(VDataTable, {
        props: {
          columns: COLUMNS,
          rows: [{ name: 'A' }, { name: 'A' }, { count: 1 }],
          rowKey: 'name',
          selectable: true,
        },
      })
      const text = warn.mock.calls.flat().join(' ')
      expect(text).toMatch(/rowKey/)
      expect(text).toMatch(/twice|duplicate/i)
    })

    it('the master box refuses an empty page and a loading table', async () => {
      const { getByRole, emitted, rerender } = render(VDataTable, {
        props: { columns: COLUMNS, rows: [], rowKey: 'name', selectable: true },
      })
      const master = getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement
      expect(master.disabled).toBe(true)
      await rerender({
        columns: COLUMNS,
        rows: ROWS,
        rowKey: 'name',
        selectable: true,
        loading: true,
      })
      expect(master.disabled).toBe(true)
      expect(emitted('update:selected')).toBeUndefined()
    })

    it('an outside change of perPage goes back to page 1', async () => {
      const page = ref(3)
      const perPage = ref(1)
      const Harness = harness(
        () => ({ columns: COLUMNS, rows: ROWS_MANY, page, perPage }),
        '<VDataTable :columns="columns" :rows="rows" v-model:page="page" v-model:per-page="perPage" />',
      )
      render(Harness)
      perPage.value = 2
      await nextTick()
      await nextTick()
      expect(page.value).toBe(1)
    })

    it('says nothing about the selection at zero, even with selectionText', () => {
      const { container } = render(VDataTable, {
        props: {
          columns: COLUMNS,
          rows: ROWS,
          rowKey: 'name',
          selectable: true,
          selectionText: (n: number) => `${n} picked`,
        },
      })
      expect(container.textContent).not.toContain('0 picked')
    })

    it('survives a null search model', () => {
      expect(() =>
        render(VDataTable, {
          props: {
            columns: COLUMNS,
            rows: ROWS,
            searchable: true,
            search: null as unknown as string,
          },
        }),
      ).not.toThrow()
    })
  })

  describe('accessibility', () => {
    it('is named by its title when it has no caption', () => {
      const { container } = render(VDataTable, {
        props: { columns: COLUMNS, rows: ROWS, title: 'Projects' },
      })
      const table = container.querySelector('table') as HTMLTableElement
      const id = table.getAttribute('aria-labelledby')
      expect(id).toBeTruthy()
      expect(container.querySelector(`[id="${id}"]`)?.textContent?.trim()).toBe('Projects')
    })

    it('leaves the naming to a caption, or to the consumer', () => {
      const withCaption = render(VDataTable, {
        props: { columns: COLUMNS, rows: ROWS, title: 'Projects', caption: 'All projects' },
      })
      expect(withCaption.container.querySelector('table')?.hasAttribute('aria-labelledby')).toBe(
        false,
      )
      const withLabel = render(VDataTable, {
        props: { columns: COLUMNS, rows: ROWS, title: 'Projects' },
        attrs: { 'aria-label': 'Mine' },
      })
      const table = withLabel.container.querySelector('table')
      expect(table?.getAttribute('aria-label')).toBe('Mine')
      expect(table?.hasAttribute('aria-labelledby')).toBe(false)
    })

    it('numbers the row checkboxes across the whole table, not per page', () => {
      const selectRowLabel = vi.fn((_row: unknown, index: number) => `Row #${index}`)
      const { getByRole } = render(VDataTable, {
        props: {
          columns: COLUMNS,
          rows: ROWS_MANY,
          rowKey: 'name',
          selectable: true,
          page: 2,
          perPage: 2,
        },
      })
      expect(getByRole('checkbox', { name: 'Select row 3' })).toBeTruthy()
      const custom = render(VDataTable, {
        props: {
          columns: COLUMNS,
          rows: ROWS_MANY,
          rowKey: 'name',
          selectable: true,
          page: 2,
          perPage: 2,
          selectRowLabel,
        },
      })
      expect(custom.getByRole('checkbox', { name: 'Row #2' })).toBeTruthy()
    })

    it('writes a sortable heading a second time, as text, for the stacked layout', () => {
      const { container } = render(VDataTable, {
        props: { columns: COLUMNS, rows: ROWS, responsive: 'stack' },
      })
      const copies = [...container.querySelectorAll('th .v-data-table-stack-label')]
      expect(copies.map((el) => el.textContent?.trim())).toEqual(['Name', 'Total'])
    })
  })

  it('exposes the <table> as el', async () => {
    const table = ref<{ el: HTMLTableElement | null } | null>(null)
    const { container } = render(
      harness(
        () => ({ columns: COLUMNS, rows: ROWS, table }),
        '<VDataTable ref="table" :columns="columns" :rows="rows" />',
      ),
    )
    await nextTick()
    expect(table.value?.el).toBe(container.querySelector('table'))
  })
})
