<script setup lang="ts" generic="Row extends Record<string, unknown>">
// @core
/**
 * Native table semantics remain intact. JavaScript adds sorting, paging, selection and
 * debounced search; browser measurements stay in browser tests.
 */

import { computed, ref, useId, useSlots, watch, watchEffect } from 'vue'
import type { StyleValue } from 'vue'

import VButton from '../VButton/VButton.vue'
import VCheckbox from '../VCheckbox/VCheckbox.vue'
import VEmptyState from '../VEmptyState/VEmptyState.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { arrow_downward as arrowDownwardIcon } from '../VIcon/icons/arrow_downward'
import { arrow_drop_down as arrowDropDownIcon } from '../VIcon/icons/arrow_drop_down'
import { arrow_upward as arrowUpwardIcon } from '../VIcon/icons/arrow_upward'
import { inbox as inboxIcon } from '../VIcon/icons/inbox'
import { search as searchIcon } from '../VIcon/icons/search'
import { search_off as searchOffIcon } from '../VIcon/icons/search_off'
import { swap_vert as swapVertIcon } from '../VIcon/icons/swap_vert'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VMenu from '../VMenu/VMenu.vue'
import VMenuItem from '../VMenu/VMenuItem.vue'
import VPagination from '../VPagination/VPagination.vue'
import VSpinner from '../VSpinner/VSpinner.vue'
import VTypography from '../VTypography/VTypography.vue'

import { toggleValue } from '../../utils/array'
import { cssSize } from '../../utils/css'
import { isDev } from '../../utils/env'
import { clamp } from '../../utils/number'
import { createNormalizedCache, normalizeText } from '../../utils/text'

import { useInfiniteScroll } from '../../composables/useInfiniteScroll'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useVirtualList, type VirtualSegment } from '../../composables/useVirtualList'

import { useTimer } from '../../composables/useTimer'
import { useLocale, useMessages } from '../../i18n/state'

/** How a column's content is aligned. */
export type DataTableColumnAlign = 'start' | 'center' | 'end'

/** One column of the table. */
export interface DataTableColumn {
  /** Which field of a row it shows, and the name its slots are addressed by. */
  key: string
  /** Its heading. */
  label: string
  /** Lets the reader sort by this column. */
  sortable?: boolean
  /** How its content is aligned. Numbers usually belong at the end. */
  align?: DataTableColumnAlign
}

/** Which way a column is sorted: A to Z, or Z to A. */
export type DataTableSortDirection = 'asc' | 'desc'

/** Which column the table is sorted by, and in which direction. */
export interface DataTableSort {
  /** The `key` of the column the rows are ordered by. */
  key: string
  /** Which way they are ordered. */
  direction: DataTableSortDirection
}

/** How a row is identified: by the field named in `rowKey`, or failing that by its position. */
export type DataTableRowId = string | number

/**
 * Everything the table is currently being asked for, reported whenever it changes so a
 * server can answer it. What is not set is `null` rather than left out, so the object keeps
 * the same keys once serialized into a request.
 */
export interface DataTableParams {
  /** The page asked for, from 1. */
  page: number
  /** How many rows a page holds, `null` when the table is not paginated. */
  perPage: number | null
  /** The `key` of the sorted column, `null` when the rows are not sorted. */
  sortKey: string | null
  /** Which way they are sorted, `null` when they are not. */
  sortDirection: DataTableSortDirection | null
  /** The committed search, empty when nothing is searched for. */
  search: string
}

/** What the `cell-<key>` slots receive. */
export interface DataTableCellSlotProps<Row extends Record<string, unknown>> {
  /** The row the cell belongs to. */
  row: Row
  /** The value of the column's field in that row. */
  value: unknown
  /** The column the cell belongs to. */
  column: DataTableColumn
}

/** What the `head-<key>` slots receive. */
export interface DataTableHeadSlotProps {
  /** The column the heading belongs to. */
  column: DataTableColumn
}

/** What the `#empty` slot receives. */
export interface DataTableEmptySlotProps {
  /** The search that produced the empty result, empty when nothing was searched for. */
  search: string
}

/** The rows on show, as `rangeText` receives them, counted from 1. */
export interface DataTableRange {
  /** The position of the first row on show. */
  start: number
  /** The position of the last row on show. */
  end: number
  /** How many rows there are in all. */
  total: number
}

/** How the rows are set off from the page: nothing, a border, a shadow, or a muted fill. */
export type DataTableVariant = 'flat' | 'outline' | 'elevated' | 'filled'

// This interface is exported rather than kept local, and it is generic rather than referring to
// the component's own type parameter. A component typed over its rows inlines the whole
// signature of its props into the declarations it emits, so a name that is not exported cannot
// be written there and the build of the type declarations fails.
export interface DataTableProps<Row extends Record<string, unknown>> {
  /** The columns to show, in order. */
  columns: DataTableColumn[]
  /** The rows to show. */
  rows: Row[]
  /** Which field identifies a row. */
  rowKey?: string
  /**
   * How the rows and the footer are framed: nothing at all (`flat`, the default), or a card
   * with rounded corners set off by a border on the page surface (`outline`), a shadow over a
   * raised surface (`elevated`), or a muted fill (`filled`). The header and the toolbar stay
   * outside the frame.
   */
  variant?: DataTableVariant
  /** Shows that the rows are being loaded. */
  loading?: boolean
  /**
   * What is written beside the spinner while the rows are loading. It falls back to the design
   * system dictionary.
   */
  loadingText?: string
  /**
   * The title of the empty state shown when there is no row to show. It falls back to the design
   * system dictionary, which words a table with no data and a search with no match differently.
   */
  emptyText?: string
  /**
   * A title above the table, which also names it for assistive technology. It is ignored when
   * the `#header` slot replaces the title and subtitle.
   */
  title?: string
  /**
   * A line under the title saying what the table holds. It also describes the table for
   * assistive technology.
   */
  subtitle?: string
  /** Adds a search field to the header. */
  searchable?: boolean
  /** What that field says while empty. It falls back to the design system dictionary. */
  searchPlaceholder?: string
  /**
   * What screen readers announce for the search field. It falls back to the design
   * system dictionary.
   */
  searchLabel?: string
  /**
   * When a server does the searching, how long to wait after a keystroke before asking
   * it, in milliseconds. Zero asks at once.
   */
  searchDebounce?: number
  /** Tints every other row, which helps the eye follow a long line across the table. */
  striped?: boolean
  /**
   * Keeps the column headings in place while the rows scroll under them. It needs a
   * bounded scrolling area to work: either the `height` prop, or a parent with a height
   * of its own.
   */
  stickyHeader?: boolean
  /** Tightens the cells by one step, and everything the table renders with them. */
  compact?: boolean
  /**
   * The height of the whole component, header, toolbar and pagination included: a number is read as
   * pixels, anything else as a CSS length. Left out, the table takes its parent's height
   * whenever the parent has one.
   */
  height?: number | string
  /** The heading icon of a column that can be sorted but currently is not. */
  sortIcon?: IconSource
  /**
   * The icon of an ascending sort. It points DOWN by default, the spreadsheet
   * convention: sorting A to Z reads downwards.
   */
  sortAscIcon?: IconSource
  /** The icon of a descending sort. */
  sortDescIcon?: IconSource
  /** The choices offered for how many rows a page holds. */
  perPageOptions?: number[]
  /** What that choice is called. It falls back to the design system dictionary. */
  perPageText?: string
  /**
   * How many rows there are in all on the server. It is what lets the pagination and the
   * range be right when the table only ever holds one page.
   */
  total?: number
  /** Shows which rows are being looked at ("1–10 of 42") in the footer. */
  showRange?: boolean
  /** Rephrases that range. It falls back to the design system dictionary. */
  rangeText?: (range: DataTableRange) => string
  /** Adds a checkbox to every row, and one in the heading to take the whole page. */
  selectable?: boolean
  /**
   * What the heading checkbox is announced as. It falls back to the design system
   * dictionary.
   */
  selectAllLabel?: string
  /**
   * How the selection is summed up in the footer. It says nothing at all when nothing is
   * selected, and falls back to the design system dictionary.
   */
  selectionText?: (count: number) => string
  /**
   * What a row's checkbox is announced as. "Select row" tells a screen reader user nothing
   * about WHICH row, so this is worth supplying with something from the row itself. It falls
   * back to the design system dictionary, which numbers the rows from 1.
   */
  selectRowLabel?: (row: Row, index: number) => string
  /**
   * Hands the searching, the sorting and the paging over to a server: the rows are shown
   * exactly as they arrive, and every change of what is being asked for is reported so
   * the server can answer it.
   */
  serverSide?: boolean
  /**
   * Renders only the rows near the visible part of the table, for tables of thousands of rows.
   * It needs a bounded height, like `stickyHeader`. Rows are measured as they render, so they
   * may vary in height, and each one is announced with its place in the whole table.
   */
  virtual?: boolean
  /**
   * Says that more rows are to come, which makes the table ask for them through `load-more` as
   * the end of its rows comes into view. While `loading`, the rows already there stay on show.
   */
  hasMore?: boolean
}

const props = withDefaults(defineProps<DataTableProps<Row>>(), {
  rowKey: undefined,
  variant: 'flat',
  loading: false,
  loadingText: undefined,
  emptyText: undefined,
  title: undefined,
  subtitle: undefined,
  searchable: false,
  searchPlaceholder: undefined,
  searchLabel: undefined,
  searchDebounce: 250,
  striped: false,
  stickyHeader: false,
  compact: false,
  height: undefined,
  sortIcon: () => swapVertIcon,
  sortAscIcon: () => arrowDownwardIcon,
  sortDescIcon: () => arrowUpwardIcon,
  perPageOptions: undefined,
  perPageText: undefined,
  total: undefined,
  showRange: false,
  rangeText: undefined,
  selectable: false,
  selectAllLabel: undefined,
  selectionText: undefined,
  selectRowLabel: undefined,
  serverSide: false,
  virtual: false,
  hasMore: false,
})

const m = useMessages()
const vectisLocale = useLocale()
const resolvedLoadingText = computed(() => props.loadingText ?? m.value.dataTable.loading)
const resolvedSearchPlaceholder = computed(
  () => props.searchPlaceholder ?? m.value.dataTable.searchPlaceholder,
)
const resolvedSearchLabel = computed(() => props.searchLabel ?? m.value.dataTable.searchLabel)
const resolvedPerPageText = computed(() => props.perPageText ?? m.value.dataTable.perPage)
const resolvedSelectAllLabel = computed(() => props.selectAllLabel ?? m.value.dataTable.selectAll)

/** Which column the rows are sorted by, and in which direction. */
const sort = defineModel<DataTableSort | null>('sort', { default: null })
/** The page being shown, counted from 1. */
const page = defineModel<number>('page', { default: 1 })
/**
 * How many rows a page holds. Any value above zero turns the pagination on, so passing
 * one down without binding it is enough to enable it.
 */
const perPage = defineModel<number | undefined>('perPage', { default: undefined })
/*
 * `sort` is `null` because the TABLE writes that state itself, a third click on a heading
 * clearing the order, and a model the component writes needs a value a consumer can store and
 * compare. `perPage` is `undefined` because nothing here ever clears it: it is simply a model
 * that was not given.
 */
/** The selected rows, as the identities `rowKey` gives them, never the row objects themselves. */
const selected = defineModel<DataTableRowId[]>('selected', { default: () => [] })
/**
 * What is typed in the search field, empty to begin with. Only the declared columns are
 * searched, accent- and case-insensitively; in `serverSide` mode nothing is filtered here
 * and the term is reported through `update:params` instead.
 */
const search = defineModel<string>('search', { default: '' })

const emit = defineEmits<{
  /**
   * What the table is now being asked for, when a server is answering: the page, the page size,
   * the sort or the search has changed, the last one after its delay.
   */
  'update:params': [params: DataTableParams]
  /** The end of the rows has come into view while `hasMore` is set: send the next ones. */
  'load-more': []
}>()

defineSlots<{
  /** What a cell of a given column shows: a slot named after that column's key. */
  [name: `cell-${string}`]: (scope: DataTableCellSlotProps<Row>) => unknown
  /** What a column's heading shows: a slot named after that column's key. */
  [name: `head-${string}`]: (scope: DataTableHeadSlotProps) => unknown
  /**
   * Replaces the title and subtitle with content of your own; the search field stays beside it.
   * Name the table with `aria-label` or `aria-labelledby` then.
   */
  header?(): unknown
  /** A row between the header and the table, for actions and filters. */
  toolbar?(): unknown
  /** What the table shows while its rows are loading, replacing the spinner and its text. */
  loading?(): unknown
  /**
   * What the table shows when there is no row to show, replacing `emptyText`. It receives the
   * search that produced the empty result, empty when nothing was searched for.
   */
  empty?(scope: DataTableEmptySlotProps): unknown
}>()

// `class` and `style` stay on the wrapper, where a consumer expects to place the component;
// everything else; an id, the aria-*; goes to the `<table>` itself, the only element they
// validly describe.
defineOptions({ inheritAttrs: false })
const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()
const slots = useSlots()

// A template ref on the component reaches the wrapper, a layout box; the `<table>` is where
// the consumer's attributes land and what they describe.
const tableEl = ref<HTMLTableElement | null>(null)
defineExpose({
  /** The `<table>` element, where the consumer's attributes land. */
  el: tableEl,
})

// @a11y
/*
 * The title names the table unless the `#header` slot replaced it, or the consumer named the
 * table, whose own `aria-label` a reference to the title would override. Bound before the
 * forwarded attributes, like every state the component owns.
 */
const titleId = useId()
const subtitleId = useId()
const namedByConsumer = () =>
  attrs['aria-label'] !== undefined || attrs['aria-labelledby'] !== undefined
const tableLabelledBy = computed(() =>
  props.title && !slots.header && !namedByConsumer() ? titleId : undefined,
)
const tableDescribedBy = computed(() => (props.subtitle && !slots.header ? subtitleId : undefined))

// @devwarn
if (isDev) {
  if (!tableLabelledBy.value && !namedByConsumer())
    console.warn(
      '[VDataTable] the table has no accessible name: set `title`, or aria-label or aria-labelledby when the `#header` slot replaces it.',
    )
  if (props.selectable && !props.rowKey)
    console.warn(
      '[VDataTable] `selectable` without `rowKey` — index-based identities are corrupted by sorting, filtering and pagination.',
    )
  /*
   * A key that is missing, or not a string or a number, turns into the same text on every
   * row ("undefined"), and two rows sharing a key share an identity: ticking one ticks them
   * all, and the rows' own `:key`s collide. Once per instance and per kind.
   */
  const warned = new Set<string>()
  watchEffect(() => {
    const key = props.rowKey
    if (!key) return
    const seen = new Set<unknown>()
    for (const row of props.rows) {
      const value = row[key]
      if (typeof value !== 'string' && typeof value !== 'number') {
        if (!warned.has('type')) {
          warned.add('type')
          console.warn(
            `[VDataTable] \`rowKey\` "${key}" is missing or is not a string or a number on some rows: those rows share one identity.`,
          )
        }
      } else if (seen.has(value)) {
        if (!warned.has('duplicate')) {
          warned.add('duplicate')
          console.warn(
            `[VDataTable] \`rowKey\` "${key}" holds the value "${value}" twice: rows are told apart by it, so it must be unique.`,
          )
        }
      } else seen.add(value)
    }
  })
}

/*
 * A key that is already a string or a number is returned AS IT IS. The selection holds these
 * identities and is looked up with a Set, which tells the number 7 from the string "7": turned
 * into text, a table keyed by numeric ids never found a selected row again, so every checkbox
 * stayed unticked.
 */
function rowIdentity(row: Row, index: number): DataTableRowId {
  if (!props.rowKey) return index
  const key = row[props.rowKey]
  return typeof key === 'string' || typeof key === 'number' ? key : String(key)
}

// Searching fields the reader cannot see would return rows for reasons nothing on screen
// explains.
/*
 * The filter below re-reads the whole table on every keystroke: ten thousand rows across five
 * columns is fifty thousand normalizations per character typed without it.
 */
const normalizedOf = createNormalizedCache<Row>()
const normalizedCell = (row: Row, key: string) => normalizedOf(row, String(row[key] ?? ''), key)

const filteredRows = computed(() => {
  if (props.serverSide || !props.searchable) return props.rows
  const needle = normalizeText((search.value ?? '').trim())
  if (!needle) return props.rows
  return props.rows.filter((row) =>
    props.columns.some((column) => normalizedCell(row, column.key).includes(needle)),
  )
})

/*
 * The locale must nonetheless stay EXPLICIT: an `undefined` one resolves differently in Node
 * and in the browser, so the row order would diverge across hydration.
 */
const collator = computed(() => new Intl.Collator(vectisLocale.value, { numeric: true }))

/*
 * What a cell is compared by. A `Date` by its instant: as text it collates on `toString()`,
 * which opens with the WEEKDAY, so Monday the 5th sorted before Saturday the 3rd.
 */
const NUMERIC_TEXT = /^\s*[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?\s*$/i
function sortKey(value: unknown): unknown {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'string' && NUMERIC_TEXT.test(value)) return Number(value)
  return value
}

const sortedRows = computed(() => {
  const current = sort.value
  if (!current || props.serverSide) return filteredRows.value
  const factor = current.direction === 'asc' ? 1 : -1
  const compare = collator.value.compare
  return [...filteredRows.value].sort((a, b) => {
    const av = sortKey(a[current.key])
    const bv = sortKey(b[current.key])
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
    return compare(String(av ?? ''), String(bv ?? '')) * factor
  })
})

const paginated = computed(() => (perPage.value ?? 0) > 0)
const totalCount = computed(() =>
  props.serverSide ? (props.total ?? props.rows.length) : filteredRows.value.length,
)
const pageCount = computed(() =>
  paginated.value ? Math.max(1, Math.ceil(totalCount.value / (perPage.value ?? 1))) : 1,
)
// The page actually shown is CLAMPED by derivation and the model is never rewritten: a
// search that leaves fewer pages simply falls back to the last one, and typing a
// character that would have emptied the table does not silently move the consumer's own
// page number.
const currentPage = computed(() => clamp(page.value, 1, pageCount.value))

const displayedRows = computed(() => {
  // With a server answering, the rows received ARE the current page: cutting them again
  // would show a tenth of a page.
  if (props.serverSide || !paginated.value) return sortedRows.value
  const start = (currentPage.value - 1) * (perPage.value ?? 0)
  return sortedRows.value.slice(start, start + (perPage.value ?? 0))
})

function toggleSort(key: string) {
  const current = sort.value
  if (!current || current.key !== key) sort.value = { key, direction: 'asc' }
  else if (current.direction === 'asc') sort.value = { key, direction: 'desc' }
  else sort.value = null
}

// @a11y
// Only the column actually sorted carries the attribute. Setting it on every heading would have a screen reader announce "not sorted" on each one in turn, drowning
// the single piece of information that matters: which column the order comes from.
function ariaSort(column: DataTableColumn): 'ascending' | 'descending' | undefined {
  if (sort.value?.key !== column.key) return undefined
  return sort.value.direction === 'asc' ? 'ascending' : 'descending'
}

/**
 * Which icon a column's heading shows: a neutral one on any sortable column, and the
 * arrow of the current direction on the one being sorted by.
 *
 * It is deliberately named differently from the prop it falls back to: written the same,
 * the function would shadow the prop inside the template and the icons would never be
 * overridable.
 */
function sortIconFor(column: DataTableColumn): IconSource {
  if (sort.value?.key !== column.key) return props.sortIcon
  return sort.value.direction === 'asc' ? props.sortAscIcon : props.sortDescIcon
}

// With `serverSide`, the search reaches the server only once the reader pauses: nothing native
// waits before asking. The term actually committed is what the parameters below report.
const committedSearch = ref(search.value)
const searchTimer = useTimer()

function commitSearch() {
  // A term typed and erased inside the debounce is no new search: going back to page 1
  // and asking the server again would be a request for what is already on screen.
  if (search.value === committedSearch.value) return
  committedSearch.value = search.value
  page.value = 1
}

watch(search, () => {
  if (!props.serverSide) {
    page.value = 1
    return
  }
  searchTimer.start(commitSearch, props.searchDebounce)
})

const emptySearch = computed(() => (props.serverSide ? committedSearch.value : search.value))
/** The title of the empty state: a table with no data does not read like a search with no match. */
const resolvedEmptyText = computed(
  () =>
    props.emptyText ?? (emptySearch.value ? m.value.dataTable.noResults : m.value.dataTable.empty),
)

/*
 * `page` is the model, never the clamped `currentPage`. The clamp reads `total`, which is the
 * server's own answer: read here, a response that changed the total would move the parameters
 * and ask for the page again, and a consumer clearing `total` while it loads would send the
 * reader back to page 1.
 */
// Committing a search and going back to the first page happen one after the other, but both
// land in the same flush, so this runs once on the final values; never two requests for what
// the reader experienced as a single action. Compared by value: a parent handing down an equal
// `sort` object is no new request.
watch(
  [
    page,
    () => perPage.value ?? null,
    () => sort.value?.key ?? null,
    () => sort.value?.direction ?? null,
    committedSearch,
  ],
  ([page, perPage, sortKey, sortDirection, search]) => {
    if (props.serverSide) emit('update:params', { page, perPage, sortKey, sortDirection, search })
  },
)

// The selection. The heading checkbox covers the rows currently VISIBLE and not the whole
// table: a box that silently selected forty thousand rows would be a trap.
const selectedSet = computed(() => new Set<DataTableRowId>(selected.value))
const visibleIds = computed(() => displayedRows.value.map((row, index) => rowIdentity(row, index)))
const allVisibleSelected = computed(
  () => visibleIds.value.length > 0 && visibleIds.value.every((id) => selectedSet.value.has(id)),
)
const masterIndeterminate = computed(
  () => !allVisibleSelected.value && visibleIds.value.some((id) => selectedSet.value.has(id)),
)

/*
 * A row is asked about by the identity `visibleIds` already holds for it: the template reads
 * `visibleIds[index]` for the key, the tint and the checkbox alike, rather than deriving it
 * again three or four times per row per render.
 */
const isSelected = (id: DataTableRowId) => selectedSet.value.has(id)

function toggleRow(id: DataTableRowId) {
  selected.value = toggleValue(selected.value, id)
}

// It only ever touches the rows on screen, so what was selected on the other pages
// survives moving between them.
// Refused with no row on screen, or while the rows on screen are the PREVIOUS ones behind
// the loading state: ticked there, it stayed ticked with nothing selected, or selected rows
// the reader could not see.
const masterDisabled = computed(() => visibleIds.value.length === 0 || props.loading)

function toggleMaster() {
  if (masterDisabled.value) return
  const ids = visibleIds.value
  if (allVisibleSelected.value) {
    const visible = new Set(ids)
    selected.value = selected.value.filter((id) => !visible.has(id))
  } else {
    const current = selectedSet.value
    selected.value = [...selected.value, ...ids.filter((id) => !current.has(id))]
  }
}

// @a11y
// Without this every checkbox in the column would be announced identically, and a screen
// reader user would have no way of knowing which row they were about to select.
function rowSelectLabel(row: Row, index: number): string {
  // The position in the whole table, or every page would have its own "Select row 1". The
  // dictionary counts from one as a human does, the prop from zero as code does.
  const position = pageOffset.value + index
  return props.selectRowLabel?.(row, position) ?? m.value.dataTable.selectRow(position + 1)
}

/** How many rows of the whole table come before the page on show. */
const pageOffset = computed(() =>
  paginated.value ? (currentPage.value - 1) * (perPage.value ?? 0) : 0,
)

const scrollerEl = ref<HTMLElement | null>(null)
const theadEl = ref<HTMLElement | null>(null)
const tbodyEl = ref<HTMLElement | null>(null)

// @a11y
// The row holding the focus stays rendered while the table scrolls away from it: dropping it
// would send the focus back to the page.
const focusedIndex = ref(-1)

function rowIndexOf(target: EventTarget | null) {
  if (!(target instanceof Element)) return -1
  const row = target.closest('tr')
  if (!row || row.parentElement !== tbodyEl.value || row.dataset.index === undefined) return -1
  return Number(row.dataset.index)
}

// Only a starting guess, every row being measured once rendered: a line of body text between
// the cells' block padding, and the border under it.
const ROW_HEIGHT = { regular: 46, compact: 38 }

const virtualList = useVirtualList({
  scrollEl: computed(() => (props.virtual ? scrollerEl.value : null)),
  listEl: tbodyEl,
  count: () => displayedRows.value.length,
  key: (index) => visibleIds.value[index],
  itemSize: () => (props.compact ? ROW_HEIGHT.compact : ROW_HEIGHT.regular),
  overscan: () => 5,
  initialCount: () => 20,
  pinned: () => (focusedIndex.value >= 0 ? [focusedIndex.value] : []),
  insetStart: () => (props.stickyHeader ? (theadEl.value?.offsetHeight ?? 0) : 0),
})
const measureRow = virtualList.measure

/** The rows to render: those of the window and the space for the others, or every row. */
const rowSegments = computed<VirtualSegment[]>(() =>
  props.virtual
    ? virtualList.segments.value
    : displayedRows.value.map((_, index) => ({ type: 'row', index })),
)

// @a11y
// Only some rows exist in the virtual mode, so the table says how many it has and each row
// where it stands, the heading row being the first. The total is unknown while more may come.
const ariaRowCount = computed(() => {
  if (!props.virtual) return undefined
  return props.hasMore ? -1 : totalCount.value + 1
})

// The full loading state replaces the rows, except while the next ones are on their way: the
// rows already loaded then stay, and the foot of the table says it is loading.
const loadingMore = computed(() => props.loading && props.hasMore && displayedRows.value.length > 0)

const sentinelEl = ref<HTMLElement | null>(null)
useInfiniteScroll({
  sentinelEl,
  root: () => scrollerEl.value,
  canLoad: () => props.hasMore && !props.loading,
  loaded: () => props.rows,
  onLoadMore: () => emit('load-more'),
})

// @devwarn
// A table without a bounded height grows with its rows, so every row is in view and rendered.
if (isDev) {
  watch(
    rowSegments,
    (segments) => {
      const el = scrollerEl.value
      if (!props.virtual || !el || displayedRows.value.length < 100) return
      if (el.scrollHeight > el.clientHeight) return
      if (segments.some((segment) => segment.type === 'spacer')) return
      console.warn(
        '[VDataTable] `virtual` renders every row because the table does not scroll: give it a `height` or a parent with a height.',
      )
    },
    { flush: 'post', once: true },
  )
}

watch(perPage, () => {
  page.value = 1
})

const colCount = computed(() => props.columns.length + (props.selectable ? 1 : 0))

// @a11y
/**
 * It is rendered, empty, as soon as rows can be selected at all. A region meant to announce its
 * own changes must already exist before the first change: inserted into the page at the same
 * moment as its text, it announces nothing, and the first row selected would pass in silence.
 */
const selectionSummary = computed(() => {
  const count = selected.value.length
  if (count === 0) return ''
  if (props.selectionText) return props.selectionText(count)
  return m.value.dataTable.selection(count)
})

const rangeSummary = computed(() => {
  const per = perPage.value ?? 0
  const total = totalCount.value
  const start = total === 0 ? 0 : (currentPage.value - 1) * per + 1
  const end = Math.min(currentPage.value * per, total)
  return props.rangeText?.({ start, end, total }) ?? m.value.dataTable.range({ start, end, total })
})

// The height is applied to the whole component and not as a ceiling on the scrolling area. A
// soft ceiling remains available to the consumer through a maximum height of their own: the
// component is a column whose scrolling area can be compressed.
const heightStyle = computed<StyleValue | undefined>(() =>
  props.height !== undefined ? { blockSize: cssSize(props.height) } : undefined,
)
</script>

<template>
  <div
    class="v-data-table"
    :class="rootClass"
    :style="[heightStyle, rootStyle]"
    :data-variant="variant"
    :data-striped="striped ? '' : undefined"
    :data-compact="compact ? '' : undefined"
    :data-sticky-header="stickyHeader ? '' : undefined"
    :data-selectable="selectable ? '' : undefined"
    :data-virtual="virtual ? '' : undefined"
  >
    <div v-if="title || subtitle || $slots.header || searchable" class="v-data-table-header">
      <slot name="header">
        <div v-if="title || subtitle" class="v-data-table-titles">
          <VTypography
            v-if="title"
            :id="titleId"
            as="div"
            variant="heading-4"
            class="v-data-table-title"
          >
            {{ title }}
          </VTypography>
          <VTypography
            v-if="subtitle"
            :id="subtitleId"
            variant="subtitle"
            tone="muted"
            class="v-data-table-subtitle"
          >
            {{ subtitle }}
          </VTypography>
        </div>
      </slot>
      <VInput
        v-if="searchable"
        v-model="search"
        class="v-data-table-search"
        type="search"
        size="sm"
        :compact="compact"
        :icon-start="searchIcon"
        clearable
        :placeholder="resolvedSearchPlaceholder"
        :aria-label="resolvedSearchLabel"
      />
    </div>

    <div v-if="$slots.toolbar" class="v-data-table-toolbar">
      <slot name="toolbar" />
    </div>

    <!-- What the variant frames: the rows and the footer under them, while the header and the
         toolbar stay outside, on the surface of the page. -->
    <div class="v-data-table-frame">
      <div ref="scrollerEl" class="v-data-table-scroller">
        <table
          ref="tableEl"
          class="v-data-table-table"
          :aria-labelledby="tableLabelledBy"
          :aria-describedby="tableDescribedBy"
          :aria-rowcount="ariaRowCount"
          :aria-busy="loadingMore ? 'true' : undefined"
          v-bind="forwardedAttrs"
        >
          <thead ref="theadEl" class="v-data-table-head">
            <tr :aria-rowindex="virtual ? 1 : undefined">
              <th v-if="selectable" scope="col" class="v-data-table-select">
                <VCheckbox
                  :model-value="allVisibleSelected"
                  :indeterminate="masterIndeterminate"
                  :disabled="masterDisabled"
                  :aria-label="resolvedSelectAllLabel"
                  @update:model-value="toggleMaster"
                />
              </th>
              <th
                v-for="column in columns"
                :key="column.key"
                scope="col"
                :data-align="column.align"
                :aria-sort="ariaSort(column)"
              >
                <button
                  v-if="column.sortable"
                  type="button"
                  class="v-data-table-sort"
                  :data-direction="sort?.key === column.key ? sort.direction : undefined"
                  @click="toggleSort(column.key)"
                >
                  <slot :name="`head-${column.key}`" :column="column">{{ column.label }}</slot>
                  <!-- Decorative, and deliberately so: given no label, an icon hides itself
                       from screen readers. What the sort state is, is already carried by
                       the heading itself. -->
                  <VIcon class="v-data-table-sort-icon" v-bind="iconProps(sortIconFor(column))" />
                </button>
                <template v-else>
                  <slot :name="`head-${column.key}`" :column="column">{{ column.label }}</slot>
                </template>
              </th>
            </tr>
          </thead>
          <tbody
            ref="tbodyEl"
            @focusin="focusedIndex = rowIndexOf($event.target)"
            @focusout="focusedIndex = rowIndexOf($event.relatedTarget)"
          >
            <!--
              The order matters: loading is checked before emptiness, so a table waiting for its
              rows never claims there are none.
            -->
            <tr v-if="loading && !loadingMore">
              <td :colspan="colCount" class="v-data-table-state">
                <slot name="loading">
                  <!-- The spinner carries the text for a screen reader, so the visible copy is
                       hidden from it: read twice, the cell would say it is loading twice. -->
                  <span class="v-data-table-state-loading">
                    <VSpinner :label="resolvedLoadingText" />
                    <span aria-hidden="true">{{ resolvedLoadingText }}</span>
                  </span>
                </slot>
              </td>
            </tr>
            <tr v-else-if="displayedRows.length === 0">
              <td :colspan="colCount" class="v-data-table-state">
                <slot name="empty" :search="emptySearch">
                  <VEmptyState
                    size="sm"
                    :icon="emptySearch ? searchOffIcon : inboxIcon"
                    :title="resolvedEmptyText"
                  />
                </slot>
              </td>
            </tr>
            <template v-else>
              <template
                v-for="segment in rowSegments"
                :key="segment.type === 'row' ? visibleIds[segment.index] : segment.key"
              >
                <tr v-if="segment.type === 'spacer'" class="v-data-table-spacer" aria-hidden="true">
                  <td :colspan="colCount" :style="{ blockSize: `${segment.size}px` }" />
                </tr>
                <tr
                  v-else
                  :ref="
                    virtual ? (el) => measureRow(el as Element | null, segment.index) : undefined
                  "
                  :data-index="virtual ? segment.index : undefined"
                  :aria-rowindex="virtual ? pageOffset + segment.index + 2 : undefined"
                  :data-stripe="striped && segment.index % 2 === 1 ? '' : undefined"
                  :data-selected="
                    selectable && isSelected(visibleIds[segment.index]!) ? '' : undefined
                  "
                >
                  <!--
                    The selection is marked with a plain attribute and not with the ARIA selected
                    state, which is invalid on the row of a table: it belongs to a grid. What tells
                    assistive technology that a row is selected is its checkbox being checked.
                  -->
                  <td v-if="selectable" class="v-data-table-select">
                    <VCheckbox
                      :model-value="isSelected(visibleIds[segment.index]!)"
                      :aria-label="rowSelectLabel(displayedRows[segment.index]!, segment.index)"
                      @update:model-value="toggleRow(visibleIds[segment.index]!)"
                    />
                  </td>
                  <td v-for="column in columns" :key="column.key" :data-align="column.align">
                    <slot
                      :name="`cell-${column.key}`"
                      :row="displayedRows[segment.index]!"
                      :value="displayedRows[segment.index]![column.key]"
                      :column="column"
                    >
                      {{ displayedRows[segment.index]![column.key] }}
                    </slot>
                  </td>
                </tr>
              </template>
              <!--
                A single element for as long as more rows may come: replacing it would cancel the
                observation, and no further rows would be asked for. Hidden from assistive
                technology, which hears `aria-busy` on the table instead.
              -->
              <tr v-if="hasMore" ref="sentinelEl" class="v-data-table-more" aria-hidden="true">
                <td :colspan="colCount">
                  <span v-if="loading" class="v-data-table-state-loading">
                    <VSpinner />
                    <span>{{ resolvedLoadingText }}</span>
                  </span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- The footer has two zones: what is selected on the left, and on the right the page
           size, the range and the pagination, in that order. -->
      <div v-if="paginated || selectable" class="v-data-table-footer">
        <span v-if="selectable" class="v-data-table-selection" aria-live="polite">{{
          selectionSummary
        }}</span>
        <div v-if="paginated" class="v-data-table-footer-end">
          <div v-if="perPageOptions?.length" class="v-data-table-per-page">
            <span class="v-data-table-per-page-label" aria-hidden="true">{{
              resolvedPerPageText
            }}</span>
            <!-- The panel is told to match its trigger, which here replaces the default
                 minimum width with something sensible: a menu of "10", "25", "50" has no
                 use for the width a menu of commands assumes, and it still cannot end up
                 narrower than the button opening it. -->
            <VMenu size="sm" :compact="compact" placement="top-end" match-trigger>
              <template #trigger="{ triggerProps }">
                <VButton
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  :compact="compact"
                  v-bind="triggerProps"
                  :aria-label="m.dataTable.perPageValue(resolvedPerPageText, perPage ?? 0)"
                >
                  {{ perPage }}
                  <VIcon :name="arrowDropDownIcon" />
                </VButton>
              </template>
              <VMenuItem
                v-for="option in perPageOptions"
                :key="option"
                :label="String(option)"
                :selected="option === perPage"
                @select="perPage = option"
              />
            </VMenu>
          </div>
          <span v-if="showRange" class="v-data-table-range" aria-live="polite">{{
            rangeSummary
          }}</span>
          <!--
            Named after the table rather than with the generic pagination wording: a page holding
            this table and a pagination of its own would otherwise expose two navigation landmarks
            with the same name, and a screen reader user could not tell them apart.
          -->
          <VPagination
            v-model="page"
            :label="m.dataTable.pagination"
            :length="pageCount"
            size="sm"
            :compact="compact"
            align="end"
            :total-visible="0"
            edge-controls
            detached
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-data-table {
    /*
     * It does not go through the shared control scale; there is no single control height in a
     * table; which is the same case VAccordion is in.
     */
    --data-table-pad-block: var(--vectis-space-3);
    --data-table-pad-inline: var(--vectis-space-3);
    --data-table-head-pad-block: var(--vectis-space-2);

    /* The gutter between the frame and the footer it holds: nothing when the table is
       unframed, so the footer sits flush with the edge, and the cells' own inline padding
       as soon as a frame appears. */
    --data-table-frame-pad: 0px;

    font-family: var(--vectis-text-family);

    /*
     * Deliberately no `min-block-size: 0` here. Inside a flex column parent too short for it,
     * the automatic minimum is what keeps the table at its natural height instead of letting it
     * be crushed to nothing.
     */
    display: flex;
    flex-direction: column;
    block-size: 100%;
  }

  .v-data-table[data-compact] {
    --data-table-pad-block: var(--vectis-space-2);
    --data-table-pad-inline: var(--vectis-space-2);
    --data-table-head-pad-block: var(--vectis-space-1);
  }

  /* The same `min-block-size: 0` as the scrolling area below, one level up. */
  .v-data-table-frame {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-block-size: 0;
  }

  /*
   * The card. The unframed default has nothing to undo, since it declares no decoration at all;
   * whatever surrounds the table is what provides the surface then. The border is transparent
   * rather than absent on `filled`: forced colours paint it. `elevated` has none, so that the
   * rules between the rows reach the edge its shadow draws.
   */
  .v-data-table:is([data-variant='outline'], [data-variant='elevated'], [data-variant='filled'])
    > .v-data-table-frame {
    --data-table-frame-pad: var(--data-table-pad-inline);

    border: 1px solid transparent;
    border-radius: var(--vectis-radius-surface);
    /*
     * `clip` and not `hidden`. Hiding the overflow would make this element a scroll container
     * of its own, and the sticky heading would then anchor to IT rather than to the area that
     * actually scrolls; which is to say it would not stick at all.
     */
    overflow: clip;
  }

  .v-data-table[data-variant='outline'] > .v-data-table-frame {
    background: var(--vectis-color-surface);
    border-color: var(--vectis-color-border);
  }

  .v-data-table[data-variant='elevated'] > .v-data-table-frame {
    border: none;
    background: var(--vectis-color-surface-raised);
    box-shadow: var(--vectis-shadow-sm);
  }

  /* The heading's usual tint is the muted surface itself, which would merge into this fill. */
  .v-data-table[data-variant='filled'] {
    --data-table-head-bg: color-mix(
      in oklab,
      var(--vectis-color-surface-muted),
      var(--vectis-color-text) 4%
    );
  }

  .v-data-table[data-variant='filled'] > .v-data-table-frame {
    background: var(--vectis-color-surface-muted);
  }

  /*
   * `min-block-size: 0` is load-bearing; a flex item refuses by default to shrink below its
   * content, so without it the area never compresses and the table overflows instead of
   * scrolling.
   */
  .v-data-table-scroller {
    /*
     * Positioned, so it contains the absolutely positioned parts of the cells, a consumer's
     * included: positioned against an ancestor beyond it, they escape its clip and stretch the
     * page.
     */
    position: relative;
    flex: 1 1 auto;
    min-block-size: 0;
    overflow: auto;
  }

  /*
   * Unframed, the tinted heading and rows are rounded by the area that already clips them,
   * not by the frame: the footer sits flush with the frame's edges, and a clip there would
   * crop its focus rings.
   */
  .v-data-table[data-variant='flat'] > .v-data-table-frame > .v-data-table-scroller {
    border-radius: var(--vectis-radius-surface);
  }

  .v-data-table-header,
  .v-data-table-toolbar {
    flex: none;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--vectis-space-3);
    padding-block-end: var(--vectis-space-3);
  }

  .v-data-table-titles {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
  }

  /*
   * It is set through the colour VARIABLE that component reads, and not with a plain colour
   * declaration. That declaration would collide with VTypography's own at equal specificity,
   * and the winner would be decided by whichever sheet the consumer's bundler put last.
   */
  .v-data-table-title {
    --typography-color: var(--vectis-color-text);
  }

  /* The search field is given a width of its own, overriding the full width VInput takes
     by default, and is pushed to the end of the row even with no title beside it. The
     selector is qualified by its context, which makes it one step more specific than
     VInput's own rule and therefore independent of the order the two sheets end up in. */
  .v-data-table-header > .v-data-table-search {
    inline-size: var(--vectis-control-size-table-search);
    max-inline-size: 100%;
    margin-inline-start: auto;
  }

  .v-data-table-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--vectis-text-body-md-size);
    color: var(--vectis-color-text);
  }

  .v-data-table-table th {
    padding: var(--data-table-head-pad-block) var(--data-table-pad-inline);
    text-align: start;
    font-size: var(--vectis-text-body-md-size);
    /*
     * The heavier weight distinguishes a heading from the data under it, which is emphasis
     * rather than a typographic role; hence a font token read directly.
     */
    font-weight: var(--vectis-font-weight-semibold);
    color: var(--vectis-color-text-muted);
    /*
     * The heading row gets a tint of its own so it reads apart from the data. `muted` and not
     * `sunken`: the striped rows already take `sunken`, and a heading painted the same would
     * read as one more stripe.
     */
    background-color: var(--data-table-head-bg, var(--vectis-color-surface-muted));
    border-block-end: 1px solid var(--vectis-color-border);
  }

  .v-data-table-table td {
    padding: var(--data-table-pad-block) var(--data-table-pad-inline);
    border-block-end: 1px solid var(--vectis-color-border);
  }

  .v-data-table-table tbody tr:last-child td {
    border-block-end: none;
  }

  .v-data-table-table [data-align='end'] {
    text-align: end;
  }

  .v-data-table-table [data-align='center'] {
    text-align: center;
  }

  /* The checkbox column is reduced to the width of its content. A table lays its columns
     out automatically, so asking for no width at all is what makes it take the least
     possible. */
  .v-data-table-table .v-data-table-select {
    inline-size: 0;
  }

  /* By the row's own index: in the virtual mode, the space standing for hidden rows is a row too. */
  .v-data-table[data-striped] tbody tr[data-stripe] {
    background-color: var(--vectis-color-surface-sunken);
  }

  /* Placed after the striping on purpose: the specificity is the same, so it is the order
     that makes a selected row keep its tint on both odd and even rows. */
  .v-data-table[data-selectable] tbody tr[data-selected] {
    background-color: var(--vectis-color-accent-surface);
  }

  /* Forced colours flatten both tints to `Canvas`: the stripes are only a reading aid, but
     a selected row would be told apart by its checkbox alone. It draws an inward outline in
     the system selection colour, which the mode keeps. */
  @media (forced-colors: active) {
    .v-data-table[data-selectable] tbody tr[data-selected] {
      outline: var(--vectis-focus-ring-width) solid Highlight;
      outline-offset: calc(-1 * var(--vectis-focus-ring-width));
    }
  }

  /*
   * A frozen heading relies on the opaque background every `th` already carries: the rows
   * scroll underneath it, and a consumer restyling that background with a translucent colour
   * will see them through.
   */
  .v-data-table[data-sticky-header] th {
    position: sticky;
    inset-block-start: 0;
    z-index: 1;
  }

  .v-data-table-sort {
    /*
     * The icon context for the sort glyph. Without it the icon would fall back to one em; the
     * heading's own text size; and come out visibly smaller than every other icon in the
     * component.
     */
    --vectis-icon-size: var(--vectis-icon-size-md);
    --vectis-icon-opsz: 20;

    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-1);
    border: none;
    background: transparent;
    padding: 0;
    color: inherit;
    font: inherit;
    cursor: pointer;
    /* Seen only on the focus ring: the control radius capped at half a line, VBreadcrumb's
       link recipe, since a heading that wraps would otherwise round to half its height. */
    border-radius: min(var(--vectis-radius-interactive), 0.5lh);
  }

  .v-data-table-sort:hover {
    color: var(--vectis-color-text);
  }

  .v-data-table-sort:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* The glyph stays faint on every column that merely COULD be sorted: it announces that
     the heading can be clicked without competing for attention with the one column
     actually carrying the order. */
  .v-data-table-sort-icon {
    opacity: 0.35;
  }

  .v-data-table-sort[data-direction] .v-data-table-sort-icon {
    opacity: 1;
  }

  /* The table corrects its scroll itself when a row above the view changes height. */
  .v-data-table[data-virtual] .v-data-table-scroller {
    overflow-anchor: none;
  }

  .v-data-table-table .v-data-table-spacer td {
    padding: 0;
    border: none;
  }

  /*
   * The foot of the rows: the marker watched for their end, and where the next rows are said
   * to be loading. It keeps a real height, a box of none making the crossing unreliable.
   */
  .v-data-table-table .v-data-table-more td {
    block-size: var(--vectis-control-height-md);
    padding: var(--vectis-space-2);
    border: none;
    text-align: center;
    color: var(--vectis-color-text-muted);
  }

  .v-data-table-state {
    padding: var(--vectis-space-6);
    text-align: center;
    color: var(--vectis-color-text-muted);
  }

  /*
   * The cell already pads the default empty state. `[data-size]` lifts the selector above
   * VEmptyState's own size rules, whose sheet may load after this one.
   */
  .v-data-table-state > .v-empty-state[data-size] {
    padding: 0;
  }

  .v-data-table-state-loading {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2);
  }

  .v-data-table-footer {
    flex: none;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--vectis-space-4);
    padding-block-start: var(--vectis-space-3);
    padding-block-end: var(--data-table-frame-pad);
    padding-inline: var(--data-table-frame-pad);
  }

  /*
   * The right-hand zone is pushed to the edge by an automatic margin rather than by an
   * alignment on the footer. The two zones are siblings in the same row, and the count on the
   * left has to stay at the OPPOSITE edge: any alignment set on the footer would move both of
   * them together.
   */
  .v-data-table-footer-end {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--vectis-space-4);
    margin-inline-start: auto;
  }

  .v-data-table-selection,
  .v-data-table-range,
  .v-data-table-per-page-label {
    font-size: var(--vectis-text-body-md-size);
    color: var(--vectis-color-text-muted);
  }

  .v-data-table-per-page {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-2);
  }
}
</style>
