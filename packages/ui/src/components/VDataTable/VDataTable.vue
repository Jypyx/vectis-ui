<script setup lang="ts" generic="Row extends Record<string, unknown>">
// @core
/**
 * A table of data with everything usually built around one: a title, a search field, sortable
 * columns, a selection and pagination.
 *
 * A real `<table>` underneath, with a caption, proper column headers and `aria-sort` — which
 * is what lets a screen reader say "row 3 of 40, column Name" rather than read a grid of
 * unrelated text. The furniture is composed from the library's own components.
 *
 * The JS is almost all derivation — filter, then sort, then slice — plus two effects
 * explained where they sit.
 *
 * Narrow-space behaviour and height-filling are both entirely CSS: `stack` turns each row
 * into a card once the COMPONENT is narrow, measured by a container query rather than by
 * code, and the root is a flex column in which only the scroller stretches.
 */

import { computed, ref, watch } from 'vue'
import type { StyleValue } from 'vue'

import VButton from '../VButton/VButton.vue'
import VCheckbox from '../VCheckbox/VCheckbox.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { arrow_downward as arrowDownwardIcon } from '../VIcon/icons/arrow_downward'
import { arrow_drop_down as arrowDropDownIcon } from '../VIcon/icons/arrow_drop_down'
import { arrow_upward as arrowUpwardIcon } from '../VIcon/icons/arrow_upward'
import { search as searchIcon } from '../VIcon/icons/search'
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
import { normalizeText } from '../../utils/text'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useTimer } from '../../composables/useTimer'
import { useLocale, useMessages } from '../../i18n/state'

/** One column of the table. */
export interface DataTableColumn {
  /** Which field of a row it shows, and the name its slots are addressed by. */
  key: string
  /** Its heading. */
  label: string
  /** Lets the reader sort by this column. */
  sortable?: boolean
  /** How its content is aligned — numbers usually belong at the end. */
  align?: 'start' | 'center' | 'end'
}

/** Which column the table is sorted by, and in which direction. */
export interface DataTableSort {
  key: string
  direction: 'asc' | 'desc'
}

/** How a row is identified: by the field named in `rowKey`, or failing that by its position. */
export type DataTableRowId = string | number

/**
 * Everything the table is currently being asked for, reported whenever it changes so a
 * server can answer it.
 */
export interface DataTableParams {
  page: number
  perPage: number | null
  sortKey: string | null
  sortDirection: 'asc' | 'desc' | null
  search: string
}

// TRAP — this interface is exported rather than kept local, and it is generic rather than
// referring to the component's own type parameter.
//
// A component typed over its rows inlines the whole signature of its props into the
// declarations it emits, so a name that is not exported cannot be written there and the
// build of the type declarations fails. And being lifted out of the component's scope, it
// has no access to that parameter and must take one of its own.
export interface DataTableProps<Row extends Record<string, unknown>> {
  /** The columns to show, in order. */
  columns: DataTableColumn[]
  /** The rows to show. */
  rows: Row[]
  /**
   * Which field identifies a row. Without it a row is identified by its position, which
   * is enough for display but not for a selection: it must be given as soon as rows can
   * be selected, or the selection follows the positions rather than the rows.
   */
  rowKey?: string
  /**
   * A sentence describing what the table holds. It is announced before the table itself,
   * and is what tells a screen reader user whether it is worth exploring.
   */
  caption?: string
  /**
   * How the table is framed: nothing at all, or a card with a raised background, a border
   * and rounded corners.
   */
  variant?: 'flat' | 'outlined'
  /**
   * What happens when the component is too narrow: the table scrolls sideways, or each
   * row becomes a card with its column headings repeated inside it.
   */
  responsive?: 'scroll' | 'stack'
  /** Shows that the rows are being loaded. */
  loading?: boolean
  /** What is said when there is no row to show. It falls back to the design system dictionary. */
  emptyText?: string
  /**
   * A title above the table, on the left of its toolbar.
   *
   * Note that this prop shadows the HTML attribute of the same name on the component
   * itself, an accepted trade-off — a tooltip over a whole table would be of little
   * use.
   */
  title?: string
  /** Adds a search field to the toolbar. */
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
   * The height of the WHOLE component, toolbar and pagination included: a number is read
   * as pixels, anything else as a CSS length. Left out, the table takes its parent's
   * height whenever the parent has one.
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
  perPageLabel?: string
  /**
   * How many rows there are in all on the server. It is what lets the pagination and the
   * range be right when the table only ever holds one page.
   */
  total?: number
  /** Shows which rows are being looked at — "1–10 of 42" — in the footer. */
  showRange?: boolean
  /** Rephrases that range. It falls back to the design system dictionary. */
  rangeLabel?: (range: { start: number; end: number; total: number }) => string
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
  selectionLabel?: (count: number) => string
  /**
   * What a row's checkbox is announced as. "Select row" tells a screen reader user
   * nothing about WHICH row, so this is worth supplying with something from the row
   * itself. It falls back to the design system dictionary.
   */
  selectRowLabel?: (row: Row, index: number) => string
  /**
   * Hands the searching, the sorting and the paging over to a server: the rows are shown
   * exactly as they arrive, and every change of what is being asked for is reported so
   * the server can answer it.
   */
  serverSide?: boolean
}

const props = withDefaults(defineProps<DataTableProps<Row>>(), {
  rowKey: undefined,
  caption: undefined,
  variant: 'flat',
  responsive: 'scroll',
  loading: false,
  emptyText: undefined,
  title: undefined,
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
  perPageLabel: undefined,
  total: undefined,
  showRange: false,
  rangeLabel: undefined,
  selectable: false,
  selectAllLabel: undefined,
  selectionLabel: undefined,
  selectRowLabel: undefined,
  serverSide: false,
})

const m = useMessages()
const vectisLocale = useLocale()
const resolvedEmptyText = computed(() => props.emptyText ?? m.value.dataTable.empty)
const resolvedSearchPlaceholder = computed(
  () => props.searchPlaceholder ?? m.value.dataTable.searchPlaceholder,
)
const resolvedSearchLabel = computed(() => props.searchLabel ?? m.value.dataTable.searchLabel)
const resolvedPerPageLabel = computed(() => props.perPageLabel ?? m.value.dataTable.perPage)
const resolvedSelectAllLabel = computed(() => props.selectAllLabel ?? m.value.dataTable.selectAll)

/**
 * Which column the rows are sorted by, and in which direction. Nothing is sorted to begin
 * with. It may be driven from outside or simply left to the table, which sets it as headers
 * are clicked; changing it does not send the reader back to the first page.
 */
const sort = defineModel<DataTableSort | null>('sort', { default: null })
/**
 * The page being shown, counted from 1. It starts on the first, and searching or changing
 * the page size sends it back there. It is clamped by derivation rather than written to, so
 * a page beyond the last simply displays the last.
 */
const page = defineModel<number>('page', { default: 1 })
/**
 * How many rows a page holds. Any value above zero turns the pagination on, so passing
 * one down without binding it is enough to enable it.
 */
const perPage = defineModel<number | undefined>('perPage', { default: undefined })
/**
 * The selected rows, as the identities `rowKey` gives them — never the row objects
 * themselves. Nothing is selected to begin with, and a selection SURVIVES a change of page:
 * the header checkbox covers the visible page alone, which is why it can be indeterminate.
 */
const selected = defineModel<DataTableRowId[]>('selected', { default: () => [] })
/**
 * What is typed in the search field, empty to begin with. Only the declared columns are
 * searched, accent- and case-insensitively; in `serverSide` mode nothing is filtered here
 * and the term is reported through `update:params` instead.
 */
const search = defineModel<string>('search', { default: '' })

const emit = defineEmits<{
  /**
   * What the table is now being asked for, when a server is answering: the page, the
   * page size, the sort or the search has changed — the last one after its delay.
   *
   * Nothing is emitted when the component appears: fetching the first page is the
   * consumer's own business, and emitting would make every table fetch twice.
   */
  'update:params': [params: DataTableParams]
}>()

defineSlots<{
  /** What a cell of a given column shows: a slot named after that column's key. */
  [name: `cell-${string}`]: (scope: {
    row: Row
    value: unknown
    column: DataTableColumn
  }) => unknown
  /** What a column's heading shows: a slot named after that column's key. */
  [name: `head-${string}`]: (scope: { column: DataTableColumn }) => unknown
  /** The left side of the toolbar, replacing the `title` prop. */
  header?: () => unknown
}>()

// `class` and `style` stay on the wrapper, where a consumer expects to place the
// component; everything else — an id, the aria-* — goes to the `<table>` itself, the only
// element they validly describe.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

// @devwarn
if (isDev) {
  if (props.selectable && !props.rowKey)
    console.warn(
      '[VDataTable] `selectable` without `rowKey` — index-based identities are corrupted by sorting, filtering and pagination.',
    )
}

function rowIdentity(row: Row, index: number): DataTableRowId {
  return props.rowKey ? String(row[props.rowKey]) : index
}

// From here on: filter, then sort, then cut into pages — three derivations, each reading
// the one before it.
//
// The search only ever looks at the columns that are DISPLAYED. Searching fields the
// reader cannot see would return rows for reasons nothing on screen explains.
/*
 * The cells in accent-insensitive form, memoized per row and column and re-checked against
 * the raw value.
 *
 * Normalizing decomposes, strips the marks and lowercases, and the filter below re-reads the
 * whole table on every keystroke: ten thousand rows across five columns is fifty thousand of
 * those per character typed.
 *
 * The cell is read on every call rather than the table derived once, which is what keeps the
 * filter reactive to a value edited in place. Keyed by ROW, so replacing the rows lets the
 * old entries be collected with no invalidation to write anywhere.
 */
const normalizedCells = new WeakMap<Row, Map<string, { raw: string; normalized: string }>>()
function normalizedCell(row: Row, key: string): string {
  const raw = String(row[key] ?? '')
  let cells = normalizedCells.get(row)
  if (!cells) {
    cells = new Map()
    normalizedCells.set(row, cells)
  }
  const hit = cells.get(key)
  if (hit && hit.raw === raw) return hit.normalized
  const normalized = normalizeText(raw)
  cells.set(key, { raw, normalized })
  return normalized
}

const filteredRows = computed(() => {
  if (props.serverSide || !props.searchable) return props.rows
  const needle = normalizeText(search.value.trim())
  if (!needle) return props.rows
  return props.rows.filter((row) =>
    props.columns.some((column) => normalizedCell(row, column.key).includes(needle)),
  )
})

/*
 * The collator is built ONCE per locale rather than per comparison.
 *
 * `String.localeCompare` reuses an engine-cached collator only when the locale AND the
 * options are both `undefined`; passing either takes the slow path and constructs an
 * `Intl.Collator` per call — the cost class `utils/date.ts` fights, construction running one
 * to two orders of magnitude longer than use. Nor is it paid once: `search` feeds
 * `filteredRows` feeds this, so a sorted table re-sorts on every keystroke.
 *
 * The locale must nonetheless stay EXPLICIT: an `undefined` one resolves differently in Node
 * and in the browser, so the row order would diverge across hydration.
 */
const collator = computed(() => new Intl.Collator(vectisLocale.value, { numeric: true }))

const sortedRows = computed(() => {
  const current = sort.value
  if (!current || props.serverSide) return filteredRows.value
  const factor = current.direction === 'asc' ? 1 : -1
  const compare = collator.value.compare
  return [...filteredRows.value].sort((a, b) => {
    const av = a[current.key]
    const bv = b[current.key]
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

// @a11y — only the column actually sorted carries the attribute. Setting it on every
// heading would have a screen reader announce "not sorted" on each one in turn, drowning
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

// The two effects the search needs.
//
// A changed search invalidates where one was: page 4 of the old results has nothing to
// do with page 4 of the new ones, so the reader goes back to the first. And when a server
// answers, nothing native waits before asking it, so that has to be written.
//
// The waiting is delegated to `useTimer` — a delay of zero running at once, cancellation
// when the component goes away — and the term that was actually committed is what the
// parameters below report.
const committedSearch = ref('')
const searchTimer = useTimer()

function commitSearch() {
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

// What the table is asking for, as one value.
const params = computed<DataTableParams>(() => ({
  page: currentPage.value,
  perPage: perPage.value ?? null,
  sortKey: sort.value?.key ?? null,
  sortDirection: sort.value?.direction ?? null,
  search: committedSearch.value,
}))

// Committing a search and going back to the first page happen one after the other, but
// both land in the same flush, so this runs ONCE on the final values — never two requests
// for what the reader experienced as a single action.
watch(params, (value) => {
  if (props.serverSide) emit('update:params', value)
})

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

function isSelected(row: Row, index: number): boolean {
  return selectedSet.value.has(rowIdentity(row, index))
}

function toggleRow(row: Row, index: number) {
  selected.value = toggleValue(selected.value, rowIdentity(row, index))
}

// It only ever touches the rows on screen, so what was selected on the other pages
// survives moving between them.
function toggleMaster() {
  const ids = visibleIds.value
  if (allVisibleSelected.value) {
    const visible = new Set(ids)
    selected.value = selected.value.filter((id) => !visible.has(id))
  } else {
    const current = selectedSet.value
    selected.value = [...selected.value, ...ids.filter((id) => !current.has(id))]
  }
}

// @a11y — without this every checkbox in the column would be announced identically, and
// a screen reader user would have no way of knowing which row they were about to select.
function rowSelectLabel(row: Row, index: number): string {
  // The dictionary is given the position as a HUMAN would count it, from one, while the
  // prop keeps the position as code counts it — changing that would break every consumer
  // already using it.
  return props.selectRowLabel?.(row, index) ?? m.value.dataTable.selectRow(index + 1)
}

function setPerPage(option: number) {
  perPage.value = option
  page.value = 1
}

const colCount = computed(() => props.columns.length + (props.selectable ? 1 : 0))

// @a11y
/**
 * What the footer says about the selection.
 *
 * TRAP — it is rendered, EMPTY, as soon as rows can be selected at all. A region meant to
 * announce its own changes must already exist before the first change: inserted into the
 * page at the same moment as its text, it announces nothing, and the first row selected
 * would pass in silence.
 */
const selectionText = computed(() => {
  const count = selected.value.length
  if (props.selectionLabel) return props.selectionLabel(count)
  if (count === 0) return ''
  return m.value.dataTable.selection(count)
})

const rangeText = computed(() => {
  const per = perPage.value ?? 0
  const total = totalCount.value
  const start = total === 0 ? 0 : (currentPage.value - 1) * per + 1
  const end = Math.min(currentPage.value * per, total)
  return props.rangeLabel?.({ start, end, total }) ?? m.value.dataTable.range({ start, end, total })
})

// The height is applied to the WHOLE component and not as a ceiling on the scrolling
// area. The component then takes exactly the height asked for and the scrolling area
// absorbs whatever is left, so a page with three rows on it no longer makes the table
// shrink around them.
//
// A soft ceiling remains available to the consumer through a maximum height of their own:
// the component is a column whose scrolling area can be compressed.
const heightStyle = computed<StyleValue | undefined>(() =>
  props.height !== undefined ? { blockSize: cssSize(props.height) } : undefined,
)
</script>

<template>
  <div
    class="v-table-wrapper"
    :class="rootClass"
    :style="[heightStyle, rootStyle]"
    :data-variant="variant"
    :data-responsive="responsive"
    :data-striped="striped ? '' : undefined"
    :data-compact="compact ? '' : undefined"
    :data-sticky-header="stickyHeader ? '' : undefined"
    :data-selectable="selectable ? '' : undefined"
  >
    <div v-if="title || $slots.header || searchable" class="v-table-toolbar">
      <VTypography as="div" variant="heading-4" class="v-table-title">
        <slot name="header">{{ title }}</slot>
      </VTypography>
      <VInput
        v-if="searchable"
        v-model="search"
        class="v-table-search"
        type="search"
        size="sm"
        :compact="compact"
        :icon-start="searchIcon"
        clearable
        :placeholder="resolvedSearchPlaceholder"
        :aria-label="resolvedSearchLabel"
      />
    </div>

    <!-- Only the table itself scrolls; the toolbar above and the footer below stay
         where they are. -->
    <div class="v-table-scroller">
      <table class="v-table" v-bind="forwardedAttrs">
        <caption v-if="caption" class="v-table-caption">
          {{
            caption
          }}
        </caption>
        <thead class="v-table-head">
          <tr>
            <th v-if="selectable" scope="col" class="v-table-select">
              <VCheckbox
                :model-value="allVisibleSelected"
                :indeterminate="masterIndeterminate"
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
                class="v-table-sort"
                :data-direction="sort?.key === column.key ? sort.direction : undefined"
                @click="toggleSort(column.key)"
              >
                <slot :name="`head-${column.key}`" :column="column">{{ column.label }}</slot>
                <!-- Decorative, and deliberately so: given no label, an icon hides itself
                     from screen readers. What the sort state is, is already carried by
                     the heading itself. -->
                <VIcon class="v-table-sort-icon" v-bind="iconProps(sortIconFor(column))" />
              </button>
              <template v-else>
                <slot :name="`head-${column.key}`" :column="column">{{ column.label }}</slot>
              </template>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- The order matters: loading is checked BEFORE emptiness, so a table waiting
               for its rows never claims there are none. -->
          <tr v-if="loading">
            <td :colspan="colCount" class="v-table-state">
              <VSpinner :label="m.dataTable.loading" />
            </td>
          </tr>
          <tr v-else-if="displayedRows.length === 0">
            <td :colspan="colCount" class="v-table-state">{{ resolvedEmptyText }}</td>
          </tr>
          <template v-else>
            <tr
              v-for="(row, index) in displayedRows"
              :key="rowIdentity(row, index)"
              :data-selected="selectable && isSelected(row, index) ? '' : undefined"
            >
              <!-- TRAP — the selection is marked with a plain attribute and NOT with the
                   ARIA selected state, which is invalid on the row of a table: it belongs
                   to a grid. What tells assistive technology that a row is selected is
                   its checkbox being checked. -->
              <td v-if="selectable" class="v-table-select">
                <VCheckbox
                  :model-value="isSelected(row, index)"
                  :aria-label="rowSelectLabel(row, index)"
                  @update:model-value="toggleRow(row, index)"
                />
              </td>
              <td
                v-for="column in columns"
                :key="column.key"
                :data-label="column.label"
                :data-align="column.align"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="row[column.key]"
                  :column="column"
                >
                  {{ row[column.key] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- The footer has two zones: what is selected on the left, and on the right the page
         size, the range and the pagination, in that order. -->
    <div v-if="paginated || selectable" class="v-table-footer">
      <span v-if="selectable" class="v-table-selection" aria-live="polite">{{
        selectionText
      }}</span>
      <div v-if="paginated" class="v-table-footer-end">
        <div v-if="perPageOptions?.length" class="v-table-per-page">
          <span class="v-table-per-page-label" aria-hidden="true">{{ resolvedPerPageLabel }}</span>
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
                :aria-label="m.dataTable.perPageValue(resolvedPerPageLabel, perPage ?? 0)"
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
              @select="setPerPage(option)"
            />
          </VMenu>
        </div>
        <span v-if="showRange" class="v-table-range" aria-live="polite">{{ rangeText }}</span>
        <!-- Named after the table rather than with the generic pagination wording: a page
             holding this table AND a pagination of its own would otherwise expose two
             navigation landmarks with the same name, and a screen reader user could not
             tell them apart. -->
        <VPagination
          v-model="page"
          :label="m.dataTable.pagination"
          :length="pageCount"
          size="sm"
          :compact="compact"
          align="end"
          variant="ghost"
          :total-visible="7"
        />
      </div>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-table-wrapper {
    /* The density, expressed as the cells' padding and tightened by one step in the
       compact form. It does not go through the shared control scale — there is no single
       control height in a table — which is the same case VAccordion is in. */
    --table-pad-block: var(--vectis-space-3);
    --table-pad-inline: var(--vectis-space-3);
    --table-head-pad-block: var(--vectis-space-2);

    /* The gutter between the frame and what it holds: nothing when the table is
       unframed, so the caption, the toolbar and the footer sit flush with the edge, and
       the cells' own inline padding as soon as a frame appears. */
    --table-frame-pad: 0px;
    /* The colour a frozen heading is painted with. It follows the frame's own background:
       any other value would show as a visible seam in the dark theme, where the two
       surfaces differ. */
    --table-surface: var(--vectis-color-surface);

    container-type: inline-size;
    font-family: var(--vectis-text-family);

    /*
     * A column of three: toolbar, scroller, footer. The root takes its parent's height and
     * the scroller absorbs what is left, which stops a last page of two rows shrinking the
     * whole table and keeps the footer at the bottom. With no height on the parent, a
     * percentage of `auto` resolves to `auto`, so this costs nothing and measures nothing.
     *
     * TRAP — deliberately NO `min-block-size: 0` here. Inside a flex column parent too short
     * for it, the automatic minimum is what keeps the table at its natural height instead of
     * letting it be crushed to nothing.
     */
    display: flex;
    flex-direction: column;
    block-size: 100%;
  }

  .v-table-wrapper[data-compact] {
    --table-pad-block: var(--vectis-space-2);
    --table-pad-inline: var(--vectis-space-2);
    --table-head-pad-block: var(--vectis-space-1);
  }

  /* The card. The unframed default has nothing to undo, since it declares no decoration
     at all — whatever surrounds the table is what provides the surface then. */
  .v-table-wrapper[data-variant='outlined'] {
    --table-frame-pad: var(--table-pad-inline);
    --table-surface: var(--vectis-color-surface-raised);

    background: var(--table-surface);
    border: 1px solid var(--vectis-color-border);
    border-radius: var(--vectis-radius-surface);
    /*
     * The price of the rounded corners: striped and selected row backgrounds, the sticky
     * heading's opaque background and the scroller's square corners would all spill past.
     *
     * TRAP — `clip` and not `hidden`. Hiding the overflow would make this element a scroll
     * container of its own, and the sticky heading would then anchor to IT rather than to
     * the area that actually scrolls — which is to say it would not stick at all.
     *
     * Confined to the framed form on purpose: unframed, the toolbar and footer sit flush
     * with the edge and the clip would crop their focus rings.
     */
    overflow: clip;
  }

  /*
   * The ONE part that scrolls, taking whatever the toolbar and footer leave. The `auto`
   * basis grows it from its CONTENT, so the whole arrangement is inert while there is no
   * free space: a table shorter than its container stays exactly as tall as it is.
   *
   * `min-block-size: 0` is load-bearing — a flex item refuses by default to shrink below its
   * content, so without it the area never compresses and the table overflows instead of
   * scrolling.
   *
   * Deliberately NOT confined to `data-responsive='scroll'`: a table taller than its host
   * must scroll in `stack` too, or `outlined`'s clip crops it and the rows below become
   * unreachable.
   */
  .v-table-scroller {
    flex: 1 1 auto;
    min-block-size: 0;
    overflow: auto;
  }

  .v-table-toolbar {
    flex: none; /* stays at the top, outside whatever scrolls */
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--vectis-space-3);
    padding-block-start: var(--table-frame-pad);
    padding-block-end: var(--vectis-space-3);
    padding-inline: var(--table-frame-pad);
  }

  /* The title is rendered by VTypography, and its colour is stated explicitly because the
     toolbar may well sit inside a context whose text is dimmed.

     TRAP — it is set through the colour VARIABLE that component reads, and not with a
     plain colour declaration. That declaration would collide with VTypography's own at
     equal specificity, and the winner would be decided by whichever sheet the consumer's
     bundler put last. */
  .v-table-title {
    --typography-color: var(--vectis-color-text);
  }

  /* The search field is given a width of its own, overriding the full width VInput takes
     by default. The selector is qualified by its context, which makes it one step more
     specific than VInput's own rule and therefore independent of the order the two sheets
     end up in. */
  .v-table-toolbar .v-input {
    inline-size: var(--vectis-control-size-table-search);
    max-inline-size: 100%;
  }

  .v-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--vectis-text-body-md-size);
    color: var(--vectis-color-text);
  }

  .v-table-caption {
    padding-block-end: var(--vectis-space-3);
    padding-inline: var(--table-frame-pad);
    text-align: start;
    font-size: var(--vectis-text-body-md-size);
    color: var(--vectis-color-text-muted);
  }

  .v-table th {
    padding: var(--table-head-pad-block) var(--table-pad-inline);
    text-align: start;
    font-size: var(--vectis-text-body-md-size);
    /* The heavier weight distinguishes a heading from the data under it, which is
       emphasis rather than a typographic role — hence a font token read directly. */
    font-weight: var(--vectis-font-weight-semibold);
    color: var(--vectis-color-text-muted);
    border-block-end: 1px solid var(--vectis-color-border);
  }

  .v-table td {
    padding: var(--table-pad-block) var(--table-pad-inline);
    border-block-end: 1px solid var(--vectis-color-border);
  }

  .v-table tbody tr:last-child td {
    border-block-end: none;
  }

  .v-table [data-align='end'] {
    text-align: end;
  }

  .v-table [data-align='center'] {
    text-align: center;
  }

  /* The checkbox column is reduced to the width of its content. A table lays its columns
     out automatically, so asking for no width at all is what makes it take the least
     possible. */
  .v-table .v-table-select {
    inline-size: 0;
  }

  .v-table-wrapper[data-striped] tbody tr:nth-child(even) {
    background-color: var(--vectis-color-surface-sunken);
  }

  /* Placed after the striping on purpose: the specificity is the same, so it is the order
     that makes a selected row keep its tint on both odd and even rows. */
  .v-table-wrapper[data-selectable] tbody tr[data-selected] {
    background-color: var(--vectis-color-accent-surface);
  }

  /* A frozen heading MUST be opaque: the rows scroll underneath it, and without a
     background they would show through. Its colour is read from the variable holding the
     table's real surface — a fixed value would leave a visible seam along the frame's
     edge in the dark theme, where the two surfaces differ. */
  .v-table-wrapper[data-sticky-header] th {
    position: sticky;
    inset-block-start: 0;
    z-index: 1;
    background-color: var(--table-surface);
  }

  .v-table-sort {
    /* The icon context for the sort glyph. Without it the icon would fall back to one em
       — the heading's own text size — and come out visibly smaller than every other icon
       in the component. */
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
    border-radius: var(--vectis-radius-xs);
  }

  .v-table-sort:hover {
    color: var(--vectis-color-text);
  }

  .v-table-sort:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* The glyph stays faint on every column that merely COULD be sorted: it announces that
     the heading can be clicked without competing for attention with the one column
     actually carrying the order. */
  .v-table-sort-icon {
    opacity: 0.35;
  }

  .v-table-sort[data-direction] .v-table-sort-icon {
    opacity: 1;
  }

  .v-table-state {
    padding: var(--vectis-space-6);
    text-align: center;
    color: var(--vectis-color-text-muted);
  }

  .v-table-footer {
    flex: none; /* stays at the bottom, outside whatever scrolls */
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--vectis-space-4);
    padding-block-start: var(--vectis-space-3);
    padding-block-end: var(--table-frame-pad);
    padding-inline: var(--table-frame-pad);
  }

  /*
   * The right-hand zone is pushed to the edge by an automatic margin rather than by an
   * alignment on the footer. The two zones are siblings in the same row, and the count on
   * the left has to stay at the OPPOSITE edge: any alignment set on the footer would move
   * both of them together.
   *
   * The margin also does the right thing when there is no count at all, the zone simply
   * being pushed against the far edge on its own.
   */
  .v-table-footer-end {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--vectis-space-4);
    margin-inline-start: auto;
  }

  .v-table-selection,
  .v-table-range,
  .v-table-per-page-label {
    font-size: var(--vectis-text-body-md-size);
    color: var(--vectis-color-text-muted);
  }

  .v-table-per-page {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-2);
  }

  /* The stacked form: once the COMPONENT is narrow, each row becomes a card carrying its
     own headings. It is entirely CSS, and the threshold is written as a literal length —
     these queries accept no variables.

     The column headings are not removed but hidden the way visually hidden text is: they
     still name each column for a screen reader, which reads the cells in the same order
     either way. */
  @container (max-width: 640px) {
    .v-table-wrapper[data-responsive='stack'] .v-table-head {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
    }

    .v-table-wrapper[data-responsive='stack'] tbody tr {
      display: block;
      padding-block: var(--vectis-space-2);
      border-block-end: 1px solid var(--vectis-color-border);
    }

    .v-table-wrapper[data-responsive='stack'] tbody tr:last-child {
      border-block-end: none;
    }

    .v-table-wrapper[data-responsive='stack'] td {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--vectis-space-4);
      padding: var(--vectis-space-1) var(--vectis-space-2);
      border: none;
      text-align: end;
    }

    /* Each cell writes its own column's name before itself, taken from the attribute the
       template put there. It takes the overline type role, without forcing capitals. */
    .v-table-wrapper[data-responsive='stack'] td::before {
      content: attr(data-label);
      font-size: var(--vectis-text-overline-size);
      font-weight: var(--vectis-text-overline-weight);
      letter-spacing: var(--vectis-text-overline-tracking);
      color: var(--vectis-color-text-muted);
    }

    /* The checkbox cell carries no column name — there is none — so it gets no heading
       and opens the card on its own line. */
    .v-table-wrapper[data-responsive='stack'] td.v-table-select {
      justify-content: flex-start;
    }

    .v-table-wrapper[data-responsive='stack'] td.v-table-select::before {
      content: none;
    }

    /* In a narrow component the search field drops under the title and takes the whole
       width. This applies to both responsive forms, the toolbar never being part of what
       scrolls. */
    .v-table-search {
      flex: 1 1 100%;
    }
  }
}
</style>
