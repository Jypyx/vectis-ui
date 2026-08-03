<script setup lang="ts" generic="Row extends Record<string, unknown>">
import { computed, ref, watch } from 'vue'
import type { StyleValue } from 'vue'

import VButton from '../VButton/VButton.vue'
import VCheckbox from '../VCheckbox/VCheckbox.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
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

/**
 * A data table: a semantic <table> (caption, scope, aria-sort), composed from the
 * design system's bricks — VInput (search), VCheckbox (selection), VMenu+VButton (rows
 * per page), VPagination. The JS is limited to pure derivations (filtering → sorting →
 * pagination, selection states) and to two effects justified where they sit: the page
 * reset and the server-side search debounce.
 *
 * Responsiveness and height: 100% CSS. In `stack` mode, under 640px of container, each
 * row becomes a card (::before + data-label) — with no measuring JS; 640px is
 * hardcoded, as @container conditions do not accept var(). The root is a flex column
 * at `block-size: 100%` where only the scroll area stretches.
 */
export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
}

/** The active sort (`v-model:sort`). */
export interface DataTableSort {
  key: string
  direction: 'asc' | 'desc'
}

/** A row's identity: the `rowKey` value (String()) or a fallback index. */
export type DataTableRowId = string | number

/** The current state emitted by `update:params` (in `serverSide` mode). */
export interface DataTableParams {
  page: number
  perPage: number | null
  sortKey: string | null
  sortDirection: 'asc' | 'desc' | null
  search: string
}

// Exported (and not local): the generic SFC inlines the props signature into its
// emitted declarations — a private name would fail the d.ts build (TS4025). Generic
// itself: hoisted out of the SFC's scope, it cannot reference its `Row` parameter
// directly.
export interface DataTableProps<Row extends Record<string, unknown>> {
  columns: DataTableColumn[]
  rows: Row[]
  /** Identity key of the rows (otherwise the index). Required in practice as soon as `selectable`. */
  rowKey?: string
  /** Summary of the table (accessibility). */
  caption?: string
  /** Decoration of the container. `flat`: none. `outlined`: a raised background, a border and a radius. */
  variant?: 'flat' | 'outlined'
  /** `stack`: rows as cards under 640px of container; `scroll`: horizontal scrolling. */
  responsive?: 'scroll' | 'stack'
  loading?: boolean
  /** Text displayed when there is no row to show. Default: the DS dictionary. */
  emptyText?: string
  /**
   * Title of the header's left zone (the #header slot wins). Note: it shadows the
   * global HTML attribute of the same name on the component (an accepted trade-off).
   */
  title?: string
  /** A search field on the right of the header. */
  searchable?: boolean
  /** Placeholder of the search field. Default: the DS dictionary. */
  searchPlaceholder?: string
  /** Accessible name of the search field (aria-label). Default: the DS dictionary. */
  searchLabel?: string
  /** serverSide: the delay (ms) before emitting after typing. `0` = synchronous. */
  searchDebounce?: number
  /** Alternates the background of even rows. */
  striped?: boolean
  /**
   * Freezes the header on vertical scrolling. It assumes a bounded scroll area: the
   * `height` prop or a parent with a defined height.
   */
  stickyHeader?: boolean
  /** Cell paddings reduced by one notch, propagated to the composed parts. */
  compact?: boolean
  /**
   * Height of the whole component — the toolbar and the pagination included (a number
   * → px, otherwise a free CSS string). By default, the table takes its parent's height
   * when the parent has one.
   */
  height?: number | string
  /** Header icon of a sortable but unsorted column. */
  sortIcon?: IconSource
  /** Icon of the ascending sort (the spreadsheet convention: sorting A to Z points down). */
  sortAscIcon?: IconSource
  /** Icon of the descending sort. */
  sortDescIcon?: IconSource
  /** The "rows per page" choices (displayed when supplied and the pagination is active). */
  perPageOptions?: number[]
  /** Label of the "rows per page" selector. Default: the DS dictionary. */
  perPageLabel?: string
  /** serverSide: the total number of rows on the server (pages + range). */
  total?: number
  /** Displays "X–Y of Z" in the footer. */
  showRange?: boolean
  /** Rephrases the displayed range. Default: the DS dictionary. */
  rangeLabel?: (range: { start: number; end: number; total: number }) => string
  /** A checkbox selection column + a "select all" box. */
  selectable?: boolean
  /** Accessible name of the "select all" box. Default: the DS dictionary. */
  selectAllLabel?: string
  /**
   * Text of the footer's left zone (`selectable`). Empty at zero. Default: the DS
   * dictionary.
   */
  selectionLabel?: (count: number) => string
  /** Accessible name of a row's box. Default: the DS dictionary. */
  selectRowLabel?: (row: Row, index: number) => string
  /**
   * No local filtering/sorting/pagination: the rows are displayed as they come and
   * every parameter change emits `update:params`.
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
  sortIcon: 'swap_vert',
  sortAscIcon: 'arrow_downward',
  sortDescIcon: 'arrow_upward',
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

/** A sort controllable from outside (v-model:sort) or internal. */
const sort = defineModel<DataTableSort | null>('sort', { default: null })
const page = defineModel<number>('page', { default: 1 })
/** Pagination is active iff > 0 (a one-way `:per-page="10"` is enough to enable it). */
const perPage = defineModel<number | undefined>('perPage', { default: undefined })
const selected = defineModel<DataTableRowId[]>('selected', { default: () => [] })
const search = defineModel<string>('search', { default: '' })

const emit = defineEmits<{
  /**
   * serverSide: emitted on every change of page/perPage/sort/search (the search being
   * debounced). Nothing is emitted on mount — the initial fetch belongs to the consumer.
   */
  'update:params': [params: DataTableParams]
}>()

defineSlots<{
  /** Custom rendering of a cell: a slot named `cell-<key>` */
  [name: `cell-${string}`]: (scope: {
    row: Row
    value: unknown
    column: DataTableColumn
  }) => unknown
  /** Custom label of a column header: a slot named `head-<key>` */
  [name: `head-${string}`]: (scope: { column: DataTableColumn }) => unknown
  /** Left zone of the global header (wins over the `title` prop). */
  header?: () => unknown
}>()

// Wrapper root: class/style stay on the root, the rest (id, aria-*…) is carried over
// to the <table> — the only element they validly describe.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

if (isDev) {
  if (props.selectable && !props.rowKey)
    console.warn(
      '[VDataTable] `selectable` without `rowKey` — index-based identities are corrupted by sorting, filtering and pagination.',
    )
}

function rowIdentity(row: Row, index: number): DataTableRowId {
  return props.rowKey ? String(row[props.rowKey]) : index
}

// Filtering → sorting → pagination (pure derivations).
//
// Scope of the filter: the declared columns (what the user sees), never the rows'
// other fields.
const filteredRows = computed(() => {
  if (props.serverSide || !props.searchable) return props.rows
  const needle = normalizeText(search.value.trim())
  if (!needle) return props.rows
  return props.rows.filter((row) =>
    props.columns.some((column) => normalizeText(String(row[column.key] ?? '')).includes(needle)),
  )
})

const sortedRows = computed(() => {
  const current = sort.value
  if (!current || props.serverSide) return filteredRows.value
  const factor = current.direction === 'asc' ? 1 : -1
  return [...filteredRows.value].sort((a, b) => {
    const av = a[current.key]
    const bv = b[current.key]
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
    return (
      String(av ?? '').localeCompare(String(bv ?? ''), vectisLocale.value, { numeric: true }) *
      factor
    )
  })
})

const paginated = computed(() => (perPage.value ?? 0) > 0)
const totalCount = computed(() =>
  props.serverSide ? (props.total ?? props.rows.length) : filteredRows.value.length,
)
const pageCount = computed(() =>
  paginated.value ? Math.max(1, Math.ceil(totalCount.value / (perPage.value ?? 1))) : 1,
)
// Clamped by derivation, without mutating the model: if the filter reduces the number
// of pages, the display falls back to the last one.
const currentPage = computed(() => clamp(page.value, 1, pageCount.value))

const displayedRows = computed(() => {
  // serverSide: the rows received are already the current page.
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

function ariaSort(column: DataTableColumn): 'ascending' | 'descending' | undefined {
  if (sort.value?.key !== column.key) return undefined
  return sort.value.direction === 'asc' ? 'ascending' : 'descending'
}

/**
 * The sort glyph: neutral outside the sorted column, then the direction's arrow — the
 * spreadsheet convention (sorting A to Z = an arrow pointing down).
 */
function sortIconFor(column: DataTableColumn): IconSource {
  if (sort.value?.key !== column.key) return props.sortIcon
  return sort.value.direction === 'asc' ? props.sortAscIcon : props.sortDescIcon
}

// Search: the page reset and the server-side debounce.
// JS justified: a filter that changes invalidates the current position (back to page
// 1); in server mode, no native primitive debounces an input. The deferral is delegated
// to `useTimer` (a synchronous delay ≤ 0, cancellation on unmount); the committed term
// is re-read by the `params` computed.
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

// Server mode: emitting the current state.
const params = computed<DataTableParams>(() => ({
  page: currentPage.value,
  perPage: perPage.value ?? null,
  sortKey: sort.value?.key ?? null,
  sortDirection: sort.value?.direction ?? null,
  search: committedSearch.value,
}))

// The synchronous mutations (the search commit + the return to page 1) coalesce into a
// single invocation per flush: never a double request.
watch(params, (value) => {
  if (props.serverSide) emit('update:params', value)
})

// Selection (the master box covers the visible page, the Material way).
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

// It only touches the visible page: the selections of the other pages are preserved.
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

function rowSelectLabel(row: Row, index: number): string {
  // The dictionary receives the HUMAN index (1-based); the prop keeps its original
  // signature (`row`, a 0-based index).
  return props.selectRowLabel?.(row, index) ?? m.value.dataTable.selectRow(index + 1)
}

function setPerPage(option: number) {
  perPage.value = option
  page.value = 1
}

const colCount = computed(() => props.columns.length + (props.selectable ? 1 : 0))

/**
 * Left zone of the footer: rendered (empty) as soon as `selectable` is set so the live
 * region pre-exists the first selection — an aria-live container inserted at the same
 * time as its text is not announced.
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

// The height is set on the ROOT (and not as a max-block-size on the scroller): the
// whole component takes the requested height and the scroll area absorbs the rest — so
// an incomplete page no longer shrinks the table. A soft ceiling stays available to the
// consumer (`style="max-block-size: …"`), the root being a flex column whose scroller
// can compress.
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
        icon-start="search"
        clearable
        :placeholder="resolvedSearchPlaceholder"
        :aria-label="resolvedSearchLabel"
      />
    </div>

    <!-- Only the table scrolls: the toolbar and the footer stay put. -->
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
                <!-- decorative: with no `label`, VIcon sets aria-hidden itself — the
                     sort state is carried by the th's aria-sort. -->
                <VIcon class="v-table-sort-icon" v-bind="iconProps(sortIconFor(column))" />
              </button>
              <template v-else>
                <slot :name="`head-${column.key}`" :column="column">{{ column.label }}</slot>
              </template>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Order of the states: loading → empty → content. -->
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
              <!-- data-selected and not aria-selected: invalid on a row of role=table
                   (grid only) — the accessible state is the checked box. -->
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

    <!-- Footer: the selection on the left, rows per page → range → pagination on the right. -->
    <div v-if="paginated || selectable" class="v-table-footer">
      <span v-if="selectable" class="v-table-selection" aria-live="polite">{{
        selectionText
      }}</span>
      <div v-if="paginated" class="v-table-footer-end">
        <div v-if="perPageOptions?.length" class="v-table-per-page">
          <span class="v-table-per-page-label" aria-hidden="true">{{ resolvedPerPageLabel }}</span>
          <!-- match-trigger: the panel matches the widest option ("10", "25"…) instead
               of the default minimum width, without ever being narrower than the button
               that opens it. -->
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
                <VIcon name="arrow_drop_down" />
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
        <VPagination
          v-model="page"
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
    /* Density: cell paddings, reduced by one notch in compact (the VAccordion model —
       no .v-control scale: there is no single control height here). */
    --table-pad-block: var(--vectis-space-3);
    --table-pad-inline: var(--vectis-space-3);
    --table-head-pad-block: var(--vectis-space-2);

    /* Inner margin of the frame: zero when flat (the caption, the toolbar and the
       footer stay flush with the edge), aligned on the cells' inline padding as soon as a
       variant frames the table. */
    --table-frame-pad: 0px;
    /* Background of the frozen headers: it follows the frame's — otherwise the seam
       would be visible in the dark theme (surface ≠ surface-raised). */
    --table-surface: var(--vectis-color-surface);

    container-type: inline-size;
    font-family: var(--vectis-text-family);

    /*
     * A toolbar / scroller / footer column: the component takes its parent's height and
     * it is the scroll area that absorbs the rest — the table no longer shrinks when a
     * page is incomplete (a last page with 2 rows) and the footer stays stuck to the
     * bottom. With no height imposed by the parent, `100%` falls back to `auto` (a
     * percentage resolved against an undefined height), with no JS measurement.
     * Deliberately no `min-block-size: 0` here: inside a too-short flex column parent,
     * the automatic minimum keeps the table at its natural height instead of crushing it.
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

  /* A bordered card; `flat` (the default) has nothing to cancel, it simply adds nothing
     — the host is what carries the frame and the surface. */
  .v-table-wrapper[data-variant='outlined'] {
    --table-frame-pad: var(--table-pad-inline);
    --table-surface: var(--vectis-color-surface-raised);

    background: var(--table-surface);
    border: 1px solid var(--vectis-color-border);
    border-radius: var(--vectis-radius-surface);
    /*
     * The counterpart of the radius: row backgrounds (striping, selection), the opaque
     * background of the frozen header and the scroller's square corners would otherwise
     * spill out of the corners. `clip` and not `hidden`: `hidden` would make the root a
     * scroll container and the `sticky` header would anchor to it instead of the
     * scroller. Conditioned on the variant — when flat, the toolbar and the footer are
     * flush with the edge and the clip would crop their focus rings. The "rows per page"
     * panel is a native popover (top layer): never cropped.
     */
    overflow: clip;
  }

  /*
   * The ONLY zone that scrolls: it takes the room left by the toolbar and the footer.
   * `flex: 1 1 auto` and not `flex: 1` (= base 0): the `auto` base starts from the
   * content height, hence inert as long as there is no free space to distribute.
   * `min-block-size: 0` lifts the flex item's automatic minimum (= the content height),
   * without which the scroller would refuse to compress and the table would overflow
   * instead of scrolling. Not qualified by `data-responsive`: in `stack` too, a table
   * taller than its host must scroll — otherwise it would be cropped, and unreachable,
   * by the `overflow: clip` of the `outlined` variant.
   */
  .v-table-scroller {
    flex: 1 1 auto;
    min-block-size: 0;
    overflow: auto;
  }

  .v-table-toolbar {
    flex: none; /* fixed at the top, outside the scroll area */
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--vectis-space-3);
    padding-block-start: var(--table-frame-pad);
    padding-block-end: var(--vectis-space-3);
    padding-inline: var(--table-frame-pad);
  }

  /* Title: rendered by VTypography (heading-4) — the colour stays explicit, as the
     toolbar may live inside a dimmed text context. */
  .v-table-title {
    color: var(--vectis-color-text);
  }

  /* A qualified (0,2,0) override of VInput's `.v-input { width: 100% }` (0,1,0) —
     independent of the bundle order. */
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
    /* semibold: state emphasis, not a type role */
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

  /* The selection column shrunk to its content (auto table layout). */
  .v-table .v-table-select {
    inline-size: 0;
  }

  .v-table-wrapper[data-striped] tbody tr:nth-child(even) {
    background-color: var(--vectis-color-surface-sunken);
  }

  /* After the striping: at equal specificity, the selection wins by order. */
  .v-table-wrapper[data-selectable] tbody tr[data-selected] {
    background-color: var(--vectis-color-accent-surface);
  }

  /* A mandatory opaque background: the content scrolls under the frozen header. It must
     equal the table's real surface, hence the variable — a hardcoded value would leave a
     seam at the frame's edge in the dark theme. */
  .v-table-wrapper[data-sticky-header] th {
    position: sticky;
    inset-block-start: 0;
    z-index: 1;
    background-color: var(--table-surface);
  }

  .v-table-sort {
    /* VIcon context: 20px, opsz 20. Without it the icon would fall back to 1em, i.e. the
       th's text size. */
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

  /* Dimmed as long as the column is not the one carrying the sort: the neutral glyph
     announces the affordance without competing with the active direction */
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
    flex: none; /* fixed at the bottom, outside the scroll area */
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
   * The right zone as one block: `margin-inline-start: auto` sticks it to the edge
   * whether or not the selection count is present on the left (a plain justify-content
   * would not do — the two zones are sibling items and the count must stay at the
   * opposite edge).
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

  /* Stack mode: cards under 640px of container, pure CSS */
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

    /* Card pseudo-header: the overline role (no forced capitals) */
    .v-table-wrapper[data-responsive='stack'] td::before {
      content: attr(data-label);
      font-size: var(--vectis-text-overline-size);
      font-weight: var(--vectis-text-overline-weight);
      letter-spacing: var(--vectis-text-overline-tracking);
      color: var(--vectis-color-text-muted);
    }

    /* The selection box has no data-label: no pseudo-header, it opens the card. */
    .v-table-wrapper[data-responsive='stack'] td.v-table-select {
      justify-content: flex-start;
    }

    .v-table-wrapper[data-responsive='stack'] td.v-table-select::before {
      content: none;
    }

    /* A narrow toolbar: the search field moves under the title, full width (this holds
       for scroll AND stack — the toolbar never scrolls). */
    .v-table-search {
      flex: 1 1 100%;
    }
  }
}
</style>
