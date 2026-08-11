<script setup lang="ts">
import { computed, nextTick, reactive, ref, useId, watch, watchEffect } from 'vue'

import VChip from '../VChip/VChip.vue'
import VIcon from '../VIcon/VIcon.vue'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VPopover from '../VPopover/VPopover.vue'
import VComboboxOption from './VComboboxOption.vue'
import VComboboxGroup from './VComboboxGroup.vue'
import VComboboxSeparator from './VComboboxSeparator.vue'
import { useInfiniteScroll } from './infiniteScroll'
import VSpinner from '../VSpinner/VSpinner.vue'

import { toggleValue } from '../../utils/array'
import { chipScaleFor } from '../../utils/chip'
import { normalizeText } from '../../utils/text'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFocusoutDismiss } from '../../composables/useFocusoutDismiss'

import { useTimer } from '../../composables/useTimer'
import { useMessages } from '../../i18n/state'

// @a11y @keyboard @core
/**
 * A combobox with search and multiple selection, composed of `VInput`, `VChip` and
 * a `VPopover` which itself carries `role="listbox"`. The JS implements the ARIA
 * combobox/listbox pattern the platform does not cover (there is no stylable or
 * multiple `<datalist>`): filtering, navigation through `aria-activedescendant` (the
 * DOM focus stays in the input — so the panel has no keyboard of its own), single or
 * multiple selection. This component owns the WHOLE ARIA contract of the field.
 * Closing on `focusout`: the field lives outside the panel, which is opened in
 * `mode="manual"` (no light dismiss).
 */
export interface ComboboxOption {
  value: string
  label: string
  /** Icon before the label: an icon name, or an explicit render (`{ src }`…). */
  icon?: IconSource
  disabled?: boolean
}

/**
 * A named group of options, rendered as `role="group"` + `aria-labelledby` (the
 * counterpart of the native `<optgroup>`). A group no option of which passes the
 * filter disappears, label included.
 */
export interface ComboboxGroup {
  label: string
  options: ComboboxOption[]
}

/**
 * A separating rule between two blocks of options. Purely decorative: separators
 * left orphaned by the filtering (at the head, at the tail, or consecutive) are not
 * rendered.
 */
export interface ComboboxSeparator {
  separator: true
}

/** An entry of the `options` prop: an option, a group or a separator. */
export type ComboboxItem = ComboboxOption | ComboboxGroup | ComboboxSeparator

const isGroup = (item: ComboboxItem): item is ComboboxGroup => 'options' in item
const isSeparator = (item: ComboboxItem): item is ComboboxSeparator => 'separator' in item

/**
 * Local filtering: `true` (the default), `false` (the options already arrive
 * filtered — a server-side search) or a custom matching predicate.
 */
export type ComboboxFilter = boolean | ((option: ComboboxOption, query: string) => boolean)

interface ComboboxProps {
  /**
   * Options of the panel. An entry may also be a `ComboboxGroup` (a named block) or
   * a `ComboboxSeparator`; a flat list of options stays valid.
   */
  options: ComboboxItem[]
  /** Multiple selection — the v-model becomes string[] and Chips are displayed. */
  multiple?: boolean
  /** Field height: sm 32px, md 40px (the default — aligned on VInput), lg 48px. */
  size?: 'sm' | 'md' | 'lg'
  /** Height reduced by 4px (like the other controls). */
  compact?: boolean
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  /** A clear button (a cross) emptying the selection and the search. */
  clearable?: boolean
  /** Message shown when no option matches the search. */
  emptyText?: string
  /**
   * Local filtering of the options. `false`: the options are already filtered by the
   * source (a server-side search) and are displayed as they come. A function receives
   * the RAW query (trimmed), not its NFD-normalized form.
   */
  filter?: ComboboxFilter
  /** Delay before `search` is emitted, in ms. `0` = a synchronous emission. */
  searchDebounce?: number
  /**
   * Loading in progress: a panel with no option → a full-panel state; options already
   * displayed → a spinner at the foot of the list (the next page). The field shows a
   * spinner in place of the chevron in both cases.
   */
  loading?: boolean
  /** Message and spinner label during loading. */
  loadingText?: string
  /** There are pages left to load: renders the sentinel emitting `load-more`. */
  hasMore?: boolean
}

const props = withDefaults(defineProps<ComboboxProps>(), {
  multiple: false,
  size: 'md',
  compact: false,
  placeholder: undefined,
  disabled: false,
  invalid: false,
  clearable: true,
  emptyText: undefined,
  filter: true,
  searchDebounce: 250,
  loading: false,
  loadingText: undefined,
  hasMore: false,
})

const m = useMessages()
const resolvedEmptyText = computed(() => props.emptyText ?? m.value.combobox.empty)
const resolvedLoadingText = computed(() => props.loadingText ?? m.value.common.loading)

const emit = defineEmits<{
  /**
   * The search term to send to the source (debounced; immediate on opening the
   * panel, for the first load). The same term is not re-emitted: reopening the panel
   * does not relaunch the request.
   */
  search: [query: string]
  /** The end of the list has come into view: load the next page. */
  'load-more': []
}>()

defineSlots<{
  /** Content of an option (default: its label). */
  option?(props: {
    option: ComboboxOption
    index: number
    active: boolean
    selected: boolean
  }): unknown
  /**
   * The VChip of a selected value in multiple mode (default: a dismissible `VChip`
   * carrying the label). `option` may be `undefined` if the value has never been seen
   * in `options`; `size`/`compact` are the ones computed to fit in the field — reuse
   * them to keep the template.
   */
  chip?(props: {
    value: string
    option: ComboboxOption | undefined
    label: string
    remove: () => void
    size: 'xs' | 'sm'
    compact: boolean
  }): unknown
  /** Panel with no result (default: `emptyText`); `query` = the searched term. */
  empty?(props: { query: string }): unknown
  /** Panel loading, with no option displayed (default: `loadingText`). */
  loading?(): unknown
}>()

// Size, compact and HEIGHT of the Chips hosted by the field — see `utils/chip.ts`.
// The height is set inline below rather than restated as a CSS table: it is what the
// field forces on its input, and deriving it from the same pair is what stops the two
// from drifting.
const chipScale = computed(() => chipScaleFor(props.size, props.compact))

const model = defineModel<string | string[]>({ default: '' })

// Wrapper root: class/style stay on the root, the rest (aria-label…) is carried over
// to the VInput so it names the role="combobox".
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
// Serves both as the id of the listbox panel (the `aria-controls` target) and as the
// prefix of the option ids (`optionId`): distinct strings, no collision.
const optionsId = useId()

const open = ref(false)
const query = ref('')
const activeIndex = ref(-1)
const focused = ref(false)
// `query` serves both for display (the selected label in single mode) and for
// searching. `typed` distinguishes the two: while it is false, `query` is NOT a
// filter (the whole list is offered on reopening) — it only turns true when the user
// types.
const typed = ref(false)

const selectedValues = computed<string[]>(() => {
  if (props.multiple) return Array.isArray(model.value) ? model.value : []
  return typeof model.value === 'string' && model.value ? [model.value] : []
})

// The options of `props.options` flattened (groups unwrapped, separators dropped),
// in source order. This is the ONLY read of the options by the rest of the component:
// filtering, the cache, the labels and pagination all ignore the hierarchy, which
// only the rendering (`rendered`) knows about.
const allOptions = computed<ComboboxOption[]>(() =>
  props.options.flatMap((item) => {
    if (isSeparator(item)) return []
    return isGroup(item) ? item.options : [item]
  }),
)

// Memory of the SELECTED options: with an asynchronous source, `options` only holds
// the last set of results and an already-chosen value is often absent from it —
// without the cache, the VChip would display its raw identifier (and the #chip slot
// would lose the option's icon).
// watchEffect (and not a watch on `props.options`): it tracks the iteration, hence
// also the in-place additions of a page (infinite scroll). Bounded to the selection:
// the other options are re-read from `options`.
const optionCache = reactive(new Map<string, ComboboxOption>())
watchEffect(() => {
  const wanted = new Set(selectedValues.value)
  for (const option of allOptions.value) {
    if (wanted.has(option.value)) optionCache.set(option.value, option)
  }
  // Drop what is no longer selected: without this the cache is bounded by every value
  // ever chosen in the session rather than by the current selection — a slow leak in a
  // long-lived multi-select over a paginated remote source.
  for (const value of optionCache.keys()) if (!wanted.has(value)) optionCache.delete(value)
})

/*
 * Value → option, built ONCE per option list. `optionOf` is called several times per
 * chip and per render (the chip itself, its label, its remove label), so a linear
 * `find` here is O(chips × options) on every keystroke in the search field. The
 * first matching option wins, as `find` did: a duplicated value keeps its source order.
 */
const optionsByValue = computed(() => {
  const map = new Map<string, ComboboxOption>()
  for (const option of allOptions.value) if (!map.has(option.value)) map.set(option.value, option)
  return map
})

/** Membership test for the selection, O(1) — the `selectedSet` idiom of VDataTable. */
const selectedSet = computed(() => new Set(selectedValues.value))

/**
 * The known option for this value: the current `options` first, the cache as a
 * fallback. An option coming from the cache is a reactive proxy (`reactive` converts
 * object values): compare by `value`, never by identity.
 */
function optionOf(value: string) {
  return optionsByValue.value.get(value) ?? optionCache.get(value)
}

function labelOf(value: string) {
  return optionOf(value)?.label ?? value
}

/*
 * Normalized labels, cached by option identity and REVALIDATED on the label itself.
 * `normalizeText` is NFD + regex + lowercase and the filter below runs on every
 * keystroke: without the cache the whole corpus is re-normalized per character typed.
 *
 * Reading `option.label` on every call is what keeps the filter reactive — a
 * `computed` keyed on the option list alone would not track an in-place label
 * change, since `allOptions` only ever reads the CONTAINERS.
 */
const normalizedLabels = new WeakMap<ComboboxOption, { label: string; normalized: string }>()
function normalizedLabelOf(option: ComboboxOption): string {
  const hit = normalizedLabels.get(option)
  if (hit && hit.label === option.label) return hit.normalized
  const normalized = normalizeText(option.label)
  normalizedLabels.set(option, { label: option.label, normalized })
  return normalized
}

// A single search term, consumed by the local filter AND by the `search` emission:
// the list offered and the request sent cannot diverge. No typing → an empty term
// (the displayed label does not restrict the list).
const searchTerm = computed(() => (typed.value ? query.value.trim() : ''))

// The FLAT list of retained options, in display order: it is what the keyboard
// navigation indexes (`activeIndex`, `optionId`) — groups and separators do not
// appear in it, so they are never a keyboard stop.
const filtered = computed(() => {
  const matcher = props.filter
  const list = allOptions.value
  if (matcher === false) return list
  const q = searchTerm.value
  if (!q) return list
  if (typeof matcher === 'function') return list.filter((o) => matcher(o, q))
  const needle = normalizeText(q)
  return list.filter((o) => normalizedLabelOf(o).includes(needle))
})

// @a11y
/** Empty as soon as the panel has options: a live region must only ever hold what is new. */
const stateAnnouncement = computed(() => {
  if (!open.value || filtered.value.length > 0) return ''
  return props.loading ? resolvedLoadingText.value : resolvedEmptyText.value
})

// The render tree: the only place that knows about the hierarchy. Each option there
// carries its index IN `filtered` (and not its position in the tree): ids, highlight
// and the #option slot stay aligned on the keyboard navigation.
type RenderedOption = { kind: 'option'; key: string; option: ComboboxOption; index: number }
type RenderedNode =
  | RenderedOption
  | { kind: 'group'; key: string; label: string; options: RenderedOption[] }
  | { kind: 'separator'; key: string }

const rendered = computed<RenderedNode[]>(() => {
  const indexOf = new Map<string, number>()
  filtered.value.forEach((option, index) => indexOf.set(option.value, index))

  const entryOf = (option: ComboboxOption): RenderedOption | null => {
    const index = indexOf.get(option.value)
    if (index === undefined) return null
    return { kind: 'option', key: `option:${option.value}`, option, index }
  }

  const nodes: RenderedNode[] = []
  // Deferred separator: materialized only if content both precedes AND follows it. A
  // single mechanism covers the three orphan cases born of filtering (a rule at the
  // head, at the tail, or two in a row).
  let pendingSeparator: string | null = null

  for (const [i, item] of props.options.entries()) {
    if (isSeparator(item)) {
      if (nodes.length > 0) pendingSeparator = `sep:${i}`
      continue
    }

    let node: RenderedNode | null
    if (isGroup(item)) {
      const options = item.options
        .map(entryOf)
        .filter((entry): entry is RenderedOption => entry !== null)
      // a group emptied by the filter: omitted, label included
      node =
        options.length > 0 ? { kind: 'group', key: `group:${i}`, label: item.label, options } : null
    } else {
      node = entryOf(item)
    }
    if (!node) continue

    if (pendingSeparator !== null) {
      nodes.push({ kind: 'separator', key: pendingSeparator })
      pendingSeparator = null
    }
    nodes.push(node)
  }

  return nodes
})

// Search (external source). JS justified: no native primitive debounces or dedupes a
// request. The deferral is delegated to `useTimer` (re-arming, a synchronous delay ≤
// 0, cancellation on unmount); only what is specific to VCombobox stays here:
// deduping by term and cancelling when the panel closes.
const searchTimer = useTimer()
// undefined = never emitted. Deduping: reopening the panel on the same term does not
// relaunch the request (the consumer can always ignore its cache).
let lastEmitted: string | undefined

const cancelSearch = searchTimer.cancel

function emitSearch(term: string, immediate = false) {
  cancelSearch()
  if (term === lastEmitted) return
  searchTimer.start(
    () => {
      // the panel may have closed during the delay: nothing left to load
      if (!open.value) return
      lastEmitted = term
      emit('search', term)
    },
    immediate ? 0 : props.searchDebounce,
  )
}

watch(searchTerm, (term) => {
  if (!open.value) return
  // A new search = a new list: the active index does not survive it (with an external
  // source, `options` is replaced wholesale — it would point at an unrelated option).
  // It is repointed at the first activable one rather than at -1: with `filter:
  // false`, `filtered` keeps the same reference until the source has answered, so the
  // watch below would not fire and Enter would stay inert. When the new list arrives,
  // the index stays within bounds: it then designates its first option.
  activeIndex.value = filtered.value.findIndex((o) => !o.disabled)
  emitSearch(term)
})

watch(filtered, (list) => {
  // Panel open: keep a valid active option. It is repointed at the first result when
  // the active one is out of the list OR non-existent (-1) — otherwise, after a filter
  // that passed through "no result", the index would stay at -1 and Enter would not
  // select the single next result.
  if (!open.value) return
  if (activeIndex.value < 0 || activeIndex.value >= list.length) {
    activeIndex.value = list.findIndex((o) => !o.disabled)
  }
})

// single mode: outside editing, the input displays the selected label (as text)
if (!props.multiple && typeof model.value === 'string' && model.value) {
  query.value = labelOf(model.value)
}

// This label is a COPY (not a derivation): when the options arrive afterwards (an
// asynchronous source), it has to be refreshed — otherwise a field mounted with a
// value but no options displays the raw identifier forever. ONLY `options` is watched:
// watching `model` would reintroduce the premature read `select()` deliberately
// avoids.
// The `open`/`typed` guards: never overwrite an input in progress.
watch(
  allOptions,
  () => {
    if (props.multiple || open.value || typed.value) return
    if (typeof model.value === 'string' && model.value) query.value = labelOf(model.value)
  },
  { flush: 'post' },
)

// multiple with a selection and an unfocused field: fold the search input away (it
// stays in the DOM, focusable) so no empty space is left.
const collapsed = computed(
  () => props.multiple && !focused.value && selectedValues.value.length > 0,
)

// The cross (VInput's `clearable` prop) must appear as soon as there is SOMETHING to
// clear — a selection (Chips) OR a search — not only when the text field is non-empty.
// Its visibility is therefore driven explicitly (VInput exposes it through
// `clearVisible`) and the room on the right is reserved accordingly.
const canClear = computed(
  () =>
    props.clearable &&
    !props.disabled &&
    (selectedValues.value.length > 0 || query.value.length > 0),
)

const optionId = (index: number) => `${optionsId}-option-${index}`

// A row's rendering is written twice (inside a group, and at the panel root) — a Vue
// template has no reusable fragment. These two factories reduce the duplication to one
// line on each side.
function rowProps(entry: RenderedOption) {
  return {
    id: optionId(entry.index),
    icon: entry.option.icon,
    active: entry.index === activeIndex.value,
    selected: selectedSet.value.has(entry.option.value),
    disabled: entry.option.disabled,
  }
}

function optionSlotProps(entry: RenderedOption) {
  return {
    option: entry.option,
    index: entry.index,
    active: entry.index === activeIndex.value,
    selected: selectedSet.value.has(entry.option.value),
  }
}

function hover(entry: RenderedOption) {
  if (!entry.option.disabled) activeIndex.value = entry.index
}

// @a11y
// The DOM focus never leaves the input (navigation through aria-activedescendant), so
// the browser does not scroll the active option into the `overflow: auto` panel. It is
// brought into view by hand. `block: 'nearest'` = no jump if already visible.
watch(activeIndex, (index) => {
  if (index < 0) return
  nextTick(() => {
    // `?.scrollIntoView`: the API does not exist in jsdom (tests).
    document.getElementById(optionId(index))?.scrollIntoView?.({ block: 'nearest' })
  })
})

function openPanel() {
  if (props.disabled || open.value) return
  open.value = true
  const list = filtered.value
  const selectedIdx = list.findIndex((o) => !o.disabled && selectedSet.value.has(o.value))
  activeIndex.value = selectedIdx >= 0 ? selectedIdx : list.findIndex((o) => !o.disabled)
  // After `open = true` (the deferred emission re-checks `open`): it lets an external
  // source load its first page on opening.
  emitSearch(searchTerm.value, true)
}

// Infinite scroll — the observer, its re-observation on each page and the emission
// lock live in `./infiniteScroll`. Declared here so `closePanel` can reset it.
const sentinelEl = ref<HTMLElement | null>(null)

const infiniteScroll = useInfiniteScroll({
  sentinelEl,
  canLoad: () => open.value && props.hasMore && !props.loading,
  loadedCount: () => allOptions.value.length,
  onLoadMore: () => emit('load-more'),
})

function closePanel() {
  if (!open.value) return
  cancelSearch()
  // a page that never arrived (a failed request) must not freeze the pagination
  infiniteScroll.reset()
  open.value = false
  activeIndex.value = -1
  typed.value = false
  query.value =
    !props.multiple && typeof model.value === 'string' && model.value ? labelOf(model.value) : ''
}

/** Closes when the focus leaves the component (the panel included, a DOM descendant). */
const onFocusout = useFocusoutDismiss(rootEl, closePanel)

// @a11y
/*
 * The focus must never leave the field: without this preventDefault, clicking an
 * option removes it, the `focusout` above closes the panel BEFORE the selection is
 * handled — and mouse selection becomes inoperative. Invisible in jsdom: covered by a
 * play function.
 */
function onPanelMousedown(event: MouseEvent) {
  event.preventDefault()
}

/** User typing: activates the filter and opens the panel. */
function onInput() {
  typed.value = true
  openPanel()
}

/** Focus: in single mode, selects the displayed label so typing replaces it (the
    full list stays offered until something is typed). */
function selectQuery() {
  if (!props.multiple && query.value) inputRef.value?.select()
}

function onFocus() {
  focused.value = true
  selectQuery()
}

/** A click anywhere in the control: focuses the field and opens the panel. */
function onControlClick() {
  if (props.disabled) return
  inputRef.value?.focus()
  openPanel()
  // after the click has placed the caret (mouse): re-selects the label
  selectQuery()
}

function select(option: ComboboxOption) {
  if (option.disabled) return
  // memorized straight away: the option may disappear from `options` (the next
  // search) before the parent has propagated the model
  optionCache.set(option.value, option)
  typed.value = false
  if (props.multiple) {
    model.value = toggleValue(selectedValues.value, option.value)
    query.value = ''
    inputRef.value?.focus()
  } else {
    model.value = option.value
    // this path does not go through closePanel(): cancel the search timer here too,
    // or the previous keystroke would fire after the close
    cancelSearch()
    // The label comes from the chosen option, NOT from a re-read of model.value: with
    // defineModel + a parent v-model, `model.value` read just after the write still
    // returns the old value (the label would display the previous selection). It closes
    // without re-deriving the query.
    query.value = option.label
    open.value = false
    activeIndex.value = -1
  }
}

function removeValue(value: string) {
  if (!props.multiple) return
  model.value = selectedValues.value.filter((v) => v !== value)
  inputRef.value?.focus()
}

/** VInput's `clear` event (the cross): VInput has already emptied the search (query);
    the whole selection is emptied too (the value in single, the Chips in multiple). */
function onClear() {
  model.value = props.multiple ? [] : ''
  typed.value = false
  activeIndex.value = -1
}

// @keyboard — modulo wrap, skipping disabled options.
function move(delta: number) {
  const list = filtered.value
  if (list.length === 0) return
  let i = activeIndex.value
  for (let step = 0; step < list.length; step++) {
    i = (i + delta + list.length) % list.length
    if (!list[i]?.disabled) break
  }
  activeIndex.value = i
}

// @keyboard @a11y — the ARIA combobox pattern: the arrows move
// `aria-activedescendant`, never the DOM focus, which stays in the field.
function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (open.value) move(1)
      else openPanel()
      break
    case 'ArrowUp':
      event.preventDefault()
      if (open.value) move(-1)
      else openPanel()
      break
    case 'Enter':
      if (open.value && activeIndex.value >= 0) {
        event.preventDefault()
        const option = filtered.value[activeIndex.value]
        if (option) select(option)
      }
      break
    case 'Escape':
      closePanel()
      break
    case 'Tab':
      closePanel()
      break
    case 'Backspace':
      if (props.multiple && !query.value) {
        const last = selectedValues.value.at(-1)
        if (last) removeValue(last)
      }
      break
  }
}
</script>

<template>
  <div
    ref="rootEl"
    class="v-combobox"
    :class="rootClass"
    :style="[{ '--chip-height': chipScale.height }, rootStyle]"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-multiple="multiple ? '' : undefined"
    :data-collapsed="collapsed ? '' : undefined"
    :data-open="open ? '' : undefined"
    :data-can-clear="canClear ? '' : undefined"
    @focusout="onFocusout"
  >
    <div class="v-combobox-control" @click="onControlClick">
      <VInput
        ref="inputRef"
        v-model="query"
        role="combobox"
        aria-haspopup="listbox"
        aria-autocomplete="list"
        :aria-expanded="open"
        :aria-controls="optionsId"
        v-bind="forwardedAttrs"
        :size="size"
        :compact="compact"
        :invalid="invalid"
        :disabled="disabled"
        :clearable="clearable"
        :clear-visible="canClear"
        :clear-label="m.combobox.clear"
        :placeholder="selectedValues.length === 0 ? placeholder : undefined"
        :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="focused = false"
        @clear="onClear"
      >
        <template v-if="multiple" #start>
          <template v-for="value in selectedValues" :key="value">
            <slot
              name="chip"
              :value="value"
              :option="optionOf(value)"
              :label="labelOf(value)"
              :remove="() => removeValue(value)"
              :size="chipScale.size"
              :compact="chipScale.compact"
            >
              <VChip
                tone="accent"
                :size="chipScale.size"
                :compact="chipScale.compact"
                dismissible
                :dismiss-label="m.combobox.remove(labelOf(value))"
                :disabled="disabled"
                @dismiss="removeValue(value)"
                >{{ labelOf(value) }}</VChip
              >
            </slot>
          </template>
        </template>

        <!-- The chevron is placed absolutely on the right (see the CSS) and rotates on
             opening. The cross comes from VInput's `clearable` prop, rendered to its
             left. While loading, the spinner takes EXACTLY its place (VInput sets
             `font-size: var(--vectis-icon-size)` on the spinners that are direct
             children of the field): no width jump. VInput's `loading` prop is not used,
             as it would overwrite this slot — hence the chevron. `aria-hidden` on the
             VSpinner root neutralizes its role="status": the announcement comes from the
             panel, not twice. -->
        <template #end>
          <VSpinner v-if="loading" class="v-combobox-spinner" aria-hidden="true" />
          <VIcon v-else name="expand_more" class="v-combobox-chevron" aria-hidden="true" />
        </template>
      </VInput>
    </div>

    <!-- The panel itself carries `role="listbox"` AND the scrolling: that is the
         contract the IntersectionObserver's `root` and the active option's
         `scrollIntoView` rest on — never insert a wrapper. -->
    <VPopover
      :id="optionsId"
      v-model:open="open"
      mode="manual"
      anchor="--combobox-anchor"
      placement="bottom-start"
      role="listbox"
      class="v-combobox-panel v-control"
      :data-size="size"
      :data-compact="compact ? '' : undefined"
      :aria-multiselectable="multiple ? 'true' : undefined"
      @mousedown="onPanelMousedown"
    >
      <!-- Groups and separators are ONLY rendering: the keyboard navigation indexes
           `filtered`, which is flat, and therefore never meets them. -->
      <template v-for="node in rendered" :key="node.key">
        <VComboboxSeparator v-if="node.kind === 'separator'" />

        <VComboboxGroup v-else-if="node.kind === 'group'" :label="node.label">
          <VComboboxOption
            v-for="entry in node.options"
            :key="entry.key"
            v-bind="rowProps(entry)"
            @select="select(entry.option)"
            @pointermove="hover(entry)"
          >
            <slot name="option" v-bind="optionSlotProps(entry)">{{ entry.option.label }}</slot>
          </VComboboxOption>
        </VComboboxGroup>

        <VComboboxOption
          v-else
          v-bind="rowProps(node)"
          @select="select(node.option)"
          @pointermove="hover(node)"
        >
          <slot name="option" v-bind="optionSlotProps(node)">{{ node.option.label }}</slot>
        </VComboboxOption>
      </template>

      <!-- Order loading → empty → content: during a request, the panel must not
           announce "no result".
           Both states are `aria-hidden`: a `role="listbox"` owns only `option` and
           `group`, so any other visible child fails aria-required-children — and an
           EMPTY listbox is fine (axe reviews it rather than failing it). What they say
           is announced by the live region outside the panel instead, which is also the
           only way a screen reader hears it: static text inside a combobox popup is not
           part of what the field walks. -->
      <div v-if="loading && filtered.length === 0" class="v-combobox-state" aria-hidden="true">
        <slot name="loading">
          <VSpinner :label="resolvedLoadingText" />
          <span>{{ resolvedLoadingText }}</span>
        </slot>
      </div>
      <div v-else-if="filtered.length === 0" class="v-combobox-state" aria-hidden="true">
        <slot name="empty" :query="searchTerm">{{ resolvedEmptyText }}</slot>
      </div>

      <!-- The infinite-scroll sentinel AND the slot of the next-page spinner: a single
           node, hence stable — a `v-if` on `loading` would destroy the sentinel and
           invalidate the observation. -->
      <div v-if="hasMore" ref="sentinelEl" class="v-combobox-more" aria-hidden="true">
        <VSpinner v-if="loading" :label="resolvedLoadingText" />
      </div>
    </VPopover>

    <!-- The spoken counterpart of the two panel states above. Outside the listbox, since
         it is precisely what may not live inside one. -->
    <span class="v-visually-hidden" role="status">{{ stateAnnouncement }}</span>
  </div>
</template>

<style>
@layer vectis.components {
  .v-combobox {
    /* Confines the anchor to this instance (set on the root, the common ancestor of
       the control and the panel — even in the top layer the panel stays a descendant) */
    anchor-scope: --combobox-anchor;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  .v-combobox-control {
    anchor-name: --combobox-anchor;
    display: block;
  }

  /* The panel comes from `VPopover`: the popover element, its state, anchoring,
     placement and chrome (`.v-panel` through `surface`). It also carries `v-control`
     (see the template) — the options and the state rows read the inherited
     `--control-*`, with no local size table. Only the rules specific to the list stay
     here: a width aligned on the anchor, and the scroll area. */
  .v-combobox-panel {
    min-inline-size: anchor-size(width);
    max-block-size: var(--vectis-control-size-combobox-list-max-block);
    overflow: auto;
  }

  /* Chevron + cross (VInput's clearable) placed ABSOLUTELY on the right of the field:
     they stay right-aligned and centred whatever the Chips (wrapping) or the folding
     of the input. The corresponding room is reserved on the right so the text/Chips do
     not pass under them (chevron alone, or cross + chevron): one glyph
     (`--vectis-icon-size`) each from the field's padding, `--control-gap` between two
     of them, and one last gap before the content — the exact measurement
     `.v-input-field`'s flex flow produces when the end zone is left in place (VInput,
     VDatePicker, VTimePicker). Written from the same two variables as the insets
     below, so the reservation and the glyphs it protects can never disagree.
     Vertically: translate is kept separate from rotate (the chevron rotates). */
  .v-combobox .v-input-field {
    position: relative;
    padding-inline-end: calc(
      var(--control-padding-inline-field) + var(--vectis-icon-size) + var(--control-gap)
    );
  }

  .v-combobox[data-can-clear] .v-input-field {
    padding-inline-end: calc(
      var(--control-padding-inline-field) + 2 * var(--vectis-icon-size) + 2 * var(--control-gap)
    );
  }

  /* Chevron and spinner share the slot: the same box (--vectis-icon-size, set by
     VInput on the spinners that are direct children of the field), so the padding
     reserved above holds for both and the swap shifts nothing. */
  .v-combobox-chevron,
  .v-combobox-spinner {
    position: absolute;
    inset-inline-end: var(--control-padding-inline-field);
    top: 50%;
    translate: 0 -50%;
    color: var(--vectis-color-text-muted);
  }

  .v-combobox-chevron {
    transition: rotate var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-combobox[data-open] .v-combobox-chevron {
    rotate: 180deg;
  }

  /* VInput's cross: placed to the left of the chevron, centred. Both insets land
     on the GLYPH's edge, for two different reasons — the chevron is a bare VIcon,
     whose box IS the glyph box; the cross is a `.v-input-action`, whose derived
     negative margin (VInput's `(icon-size - action-size) / 2`) cancels the button
     box's overhang. So the calc reads directly: the chevron occupies one
     `--vectis-icon-size` from the field's padding, then `--control-gap` separates
     the two glyphs — `.v-input-field`'s own gap, i.e. exactly what its flex flow
     would produce if this end zone were left in place. That agreement is the
     whole point of the variable: a literal here drifts from every other field in
     the DS with nothing to signal it. */
  .v-combobox .v-input-clear {
    position: absolute;
    inset-inline-end: calc(
      var(--control-padding-inline-field) + var(--vectis-icon-size) + var(--control-gap)
    );
    top: 50%;
    translate: 0 -50%;
  }

  /* multiple: the field hosts the Chips (which wrap). Height aligned on the control
     (`--control-height`, size/compact through VInput's .v-control). `--chip-height` is
     set INLINE by `chipScaleFor` (utils/chip.ts) — the Chips' height lives inside the
     VChip subtree, out of the field's reach, and deriving it from the same pair as
     their size/compact is what stops a CSS table here from drifting from the script.
     The input is forced to that SAME height instead of the `100%` inherited from
     VInput: otherwise its intrinsic height exceeds the Chips and makes the field grow.
     The result: the field stays at a constant --control-height, the input is never
     taller than the Chips, and there is no jump on focus. */
  .v-combobox[data-multiple] .v-input-field {
    flex-wrap: wrap;
    height: auto;
    min-height: var(--control-height);
    padding-block: var(--vectis-space-1);
  }

  .v-combobox[data-multiple] .v-input-control {
    height: var(--chip-height);
  }

  /* Outside editing (with a selection): take the input out of the flow (absolutely
     positioned, zero-sized) — otherwise, even at zero width, it overflows onto a second
     line under the Chips and leaves a gap. It stays in the DOM and focusable:
     onControlClick / Tab bring it back (data-collapsed drops on focus). */
  .v-combobox[data-collapsed] .v-input-control {
    position: absolute;
    width: 0;
    height: 0;
    padding: 0;
  }

  /* Full-panel states ("no result", loading): the same template as an option — the
     same `--control-*` inherited from the panel, which carries `v-control` (the spinner
     follows too, through the VIcon context of the same block). `flex: none`: the panel
     is a flex column, and the state must not be squashed. */
  .v-combobox-state {
    display: flex;
    flex: none;
    align-items: center;
    gap: var(--control-gap);
    min-height: var(--control-height);
    padding: var(--vectis-space-1) var(--control-padding-inline);
    font-size: var(--control-font-size);
    color: var(--vectis-color-text-muted);
  }

  /* Foot of the list: the infinite-scroll sentinel (a zero-height box would make the
     intersection fragile) and the slot of the next-page spinner. */
  .v-combobox-more {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    min-height: var(--vectis-space-6);
    color: var(--vectis-color-text-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-combobox-chevron {
      transition: none;
    }
  }
}
</style>
