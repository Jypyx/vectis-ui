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
        .container.querySelector('.v-table-wrapper')
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
    const glyph = () => sortButton.querySelector<HTMLElement>('.v-table-sort-icon')?.dataset.icon

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
    const glyph = () => sortButton.querySelector<HTMLElement>('.v-table-sort-icon')?.dataset.icon

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

  /* The button's name is COMPOSITE: the `perPageLabel` prop (or its dictionary default)
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
        perPageLabel: 'Per page',
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

    // page 2 → Vectis / Éclair visible; one row checked → a rowKey identity
    await fireEvent.click(getByRole('checkbox', { name: 'Select row 1' }))
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
    const footer = container.querySelector('.v-table-footer') as HTMLElement
    const selection = footer.querySelector('.v-table-selection') as HTMLElement

    // the live region is set as soon as `selectable` is (empty at zero selection)
    expect([...footer.children].indexOf(selection)).toBe(0)
    expect(selection.textContent).toBe('')

    await fireEvent.click(getByRole('checkbox', { name: 'Select row 1' }))
    expect(selection.textContent).toBe('1 item selected')
    await fireEvent.click(getByRole('checkbox', { name: 'Select row 2' }))
    expect(selection.textContent).toBe('2 items selected')

    const end = footer.querySelector('.v-table-footer-end') as HTMLElement
    expect([...end.children].map((el) => el.classList[0])).toEqual([
      'v-table-per-page',
      'v-table-range',
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

  it('fallthrough: class on the wrapper, the rest on the table', () => {
    const { container } = render(VDataTable, {
      props: { columns: COLUMNS, rows: ROWS },
      attrs: { class: 'my-class', 'aria-describedby': 'caption' },
    })
    const wrapper = container.querySelector('.v-table-wrapper') as HTMLElement
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
      const wrapper = container.querySelector('.v-table-wrapper') as HTMLElement
      expect(wrapper.style.blockSize).toBe(typeof height === 'number' ? '320px' : '60vh')
      // the consumer's style comes after the prop's: it survives
      expect(wrapper.style.width).toBe('640px')
      expect(container.querySelector('.v-table-scroller')?.hasAttribute('style')).toBe(false)
    }
  })

  it('without height: no inline height, the parent decides', () => {
    const { container } = render(VDataTable, { props: { columns: COLUMNS, rows: ROWS } })
    const wrapper = container.querySelector('.v-table-wrapper') as HTMLElement
    expect(wrapper.style.blockSize).toBe('')
    expect(container.querySelector('.v-table-scroller')?.hasAttribute('style')).toBe(false)
  })
})
