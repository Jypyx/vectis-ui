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
 * A field one types into to search a list, and picks one or several values from. It is
 * built out of a text field, a floating panel holding the list, and chips for the values
 * already chosen.
 *
 * The platform offers nothing to build this on: its own suggestion list can be neither
 * styled nor made to accept several values. So the JavaScript here implements the whole
 * pattern assistive technology expects of a combobox — the filtering, the moving of the
 * highlight, and the selection.
 *
 * One decision shapes all the rest: the DOM focus NEVER leaves the text field. What
 * moves as the reader presses the arrows is a pointer naming the current option, which
 * is why the panel has no keyboard of its own and why this component owns the entire
 * accessibility contract of the field.
 *
 * The panel is opened in the mode where nothing dismisses it by itself, and closing is
 * decided by the focus leaving the component — which the field being OUTSIDE the panel
 * makes possible.
 */
/** One thing that can be chosen. */
export interface ComboboxOption {
  /** What choosing it means: this is what the value holds. */
  value: string
  /** What it is called on screen, and what the search matches against. */
  label: string
  /** An icon before the label: an icon name, or an explicit render. */
  icon?: IconSource
  /** Shows the option without allowing it to be chosen. */
  disabled?: boolean
}

/**
 * A named block of options — the equivalent of the grouping a native list offers. A
 * group none of whose options survive the search disappears entirely, its name
 * included.
 */
export interface ComboboxGroup {
  /** The name of the block. */
  label: string
  /** The options it holds. */
  options: ComboboxOption[]
}

/**
 * A rule drawn between two blocks of options. It is purely decorative, and a separator
 * the search leaves stranded — at the top, at the bottom, or against another one — is
 * simply not drawn.
 */
export interface ComboboxSeparator {
  separator: true
}

/** Anything the list may hold: an option, a named block, or a separator. */
export type ComboboxItem = ComboboxOption | ComboboxGroup | ComboboxSeparator

const isGroup = (item: ComboboxItem): item is ComboboxGroup => 'options' in item
const isSeparator = (item: ComboboxItem): item is ComboboxSeparator => 'separator' in item

/**
 * How the list is narrowed as one types: by the component itself, not at all — when the
 * options already arrive filtered by a server — or by a rule of your own.
 */
export type ComboboxFilter = boolean | ((option: ComboboxOption, query: string) => boolean)

interface ComboboxProps {
  /**
   * What the list offers. An entry may be an option, a named block of options, or a
   * separator; a plain list of options remains perfectly valid.
   */
  options: ComboboxItem[]
  /**
   * Allows several values to be chosen, which makes the value a list and shows what has
   * been chosen as chips inside the field.
   */
  multiple?: boolean
  /** The height of the field: 32, 40 or 48 pixels. */
  size?: 'sm' | 'md' | 'lg'
  /** Takes 4px off the height, as everywhere else in the design system. */
  compact?: boolean
  /** What the field says while nothing is chosen and nothing has been typed. */
  placeholder?: string
  /** Makes the field unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /** Marks the field as invalid — for a rule of your own. */
  invalid?: boolean
  /** Offers a cross that empties both the selection and the search. */
  clearable?: boolean
  /** What the panel says when the search matches nothing. */
  emptyText?: string
  /**
   * How the list is narrowed as one types. Turning it off means the options already
   * arrive filtered by their source and are shown exactly as they come.
   *
   * A rule of your own receives the query as it was TYPED, merely trimmed — not the
   * accent-insensitive form used internally.
   */
  filter?: ComboboxFilter
  /**
   * How long to wait before telling the source what is being searched for, in
   * milliseconds. Zero tells it at once, which suits a source that is not a network
   * request.
   */
  searchDebounce?: number
  /**
   * Says that something is being loaded. With no option yet, the whole panel says so;
   * with options already listed, a spinner appears at the foot of the list, since what
   * is loading is then the next page. Either way the field replaces its chevron with a
   * spinner.
   */
  loading?: boolean
  /** What is said while loading, and what the spinner is announced as. */
  loadingText?: string
  /**
   * Says that there are more pages to come, which is what makes the component ask for
   * the next one as the end of the list comes into view.
   */
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
   * What is being searched for, to be sent to the source. It is delayed by
   * `searchDebounce` while typing, and emitted at once when the panel opens so that a
   * first page can be loaded.
   *
   * The same term is never emitted twice in a row, so reopening the panel does not
   * repeat a request that has already been answered.
   */
  search: [query: string]
  /** The end of the list has come into view: send the next page. */
  'load-more': []
}>()

defineSlots<{
  /**
   * What a row of the list shows, in place of the plain label — a subtitle, an avatar,
   * a badge. It is told whether the row is the highlighted one and whether it is
   * already chosen, so the rendering can react to both.
   */
  option?(props: {
    option: ComboboxOption
    index: number
    active: boolean
    selected: boolean
  }): unknown
  /**
   * Replaces the chip standing for one chosen value.
   *
   * Three of the values it receives are what make it usable without regressions:
   * `remove`, without which the value could no longer be taken back, and the size and
   * density worked out to sit inside the field, which cannot be guessed from outside.
   * The option itself may be missing, if that value has never appeared among the
   * options.
   */
  chip?(props: {
    value: string
    option: ComboboxOption | undefined
    label: string
    remove: () => void
    size: 'xs' | 'sm'
    compact: boolean
  }): unknown
  /** What the panel shows when nothing matches. It receives the term that was searched. */
  empty?(props: { query: string }): unknown
  /** What the panel shows while loading its first options. */
  loading?(): unknown
}>()

// The size, the density and the HEIGHT of the chips sitting inside the field, worked out
// once in `utils/chip.ts` and shared with VFileInput. The height is set inline below
// rather than restated as a table of CSS rules: it is the height the field forces on its
// input, and deriving both from the same pair is what stops them drifting apart.
const chipScale = computed(() => chipScaleFor(props.size, props.compact))

const model = defineModel<string | string[]>({ default: '' })

// `class` and `style` stay on the wrapper, where a consumer expects to style the
// component; everything else — a name above all — goes down to the text field, which is
// the element assistive technology treats as the combobox.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
// One generated identifier serves twice: as the panel's own id, which the field points
// at, and as the prefix of every option's id. The two strings can never collide, one
// being a prefix of longer ones.
const optionsId = useId()

const open = ref(false)
const query = ref('')
const activeIndex = ref(-1)
const focused = ref(false)
// The text in the field serves two purposes at once: it SHOWS the chosen label when a
// single value is picked, and it is what one searches with. This flag tells the two
// apart — while it is false the text is merely a label and narrows nothing, so reopening
// the panel offers the whole list again. It only becomes true once the reader types.
const typed = ref(false)

const selectedValues = computed<string[]>(() => {
  if (props.multiple) return Array.isArray(model.value) ? model.value : []
  return typeof model.value === 'string' && model.value ? [model.value] : []
})

// Every option, flattened: the blocks unwrapped, the separators dropped, in the order
// they were given. This is the ONE reading of the options the rest of the component
// does — the filtering, the memory of what was chosen, the labels and the paging all
// ignore the hierarchy entirely. Only the rendering below knows about it.
const allOptions = computed<ComboboxOption[]>(() =>
  props.options.flatMap((item) => {
    if (isSeparator(item)) return []
    return isGroup(item) ? item.options : [item]
  }),
)

// A memory of the options that were CHOSEN. With a source that answers over the network,
// the options only ever hold the latest results, and something already chosen is usually
// absent from them — without this, a chip would show a raw identifier instead of a name,
// and a custom chip would lose the option's icon.
//
// It is kept up to date by an effect rather than by watching the options, because the
// effect tracks the ITERATION and therefore also notices a page appended in place. And
// it is bounded to what is currently chosen: everything else is read from the options
// themselves.
const optionCache = reactive(new Map<string, ComboboxOption>())
watchEffect(() => {
  const wanted = new Set(selectedValues.value)
  for (const option of allOptions.value) {
    if (wanted.has(option.value)) optionCache.set(option.value, option)
  }
  // What is no longer chosen is forgotten. Without this the memory would grow with every
  // value chosen during the session rather than with the current selection — a slow leak
  // in a long-lived multiple field fed by a paginated source.
  for (const value of optionCache.keys()) if (!wanted.has(value)) optionCache.delete(value)
})

/*
 * A lookup from value to option, built once per list of options rather than searched
 * each time. Finding an option is done several times per chip and per render — for the
 * chip itself, its label and the name of its remove button — so a linear search here
 * would cost the number of chips times the number of options, on every keystroke.
 *
 * The FIRST match wins, exactly as a search would have done, so a duplicated value keeps
 * the option that came first.
 */
const optionsByValue = computed(() => {
  const map = new Map<string, ComboboxOption>()
  for (const option of allOptions.value) if (!map.has(option.value)) map.set(option.value, option)
  return map
})

/**
 * The selection as a set, so that asking "is this one chosen?" costs nothing however
 * many are — the same device VDataTable uses for its selected rows.
 */
const selectedSet = computed(() => new Set(selectedValues.value))

/**
 * The option a value stands for: from the current options first, and from the memory of
 * chosen ones failing that.
 *
 * TRAP — an option coming from that memory is a reactive PROXY, since making the map
 * reactive converts the objects inside it. Compare options by their value and never by
 * identity, or the two forms of the same option will not match.
 */
function optionOf(value: string) {
  return optionsByValue.value.get(value) ?? optionCache.get(value)
}

function labelOf(value: string) {
  return optionOf(value)?.label ?? value
}

/*
 * The labels in their accent-insensitive form, remembered per option and re-checked
 * against the label itself.
 *
 * Normalizing a string means decomposing it, stripping what it decomposed into, and
 * lowercasing it — and the filter below runs on every keystroke. Without this memory the
 * entire list would be normalized again for each character typed.
 *
 * Reading the label on every call, rather than deriving the whole table once, is what
 * keeps the filter reactive: a derived value keyed on the list alone would not notice a
 * label changed in place, since flattening the options only ever touches the containers.
 */
const normalizedLabels = new WeakMap<ComboboxOption, { label: string; normalized: string }>()
function normalizedLabelOf(option: ComboboxOption): string {
  const hit = normalizedLabels.get(option)
  if (hit && hit.label === option.label) return hit.normalized
  const normalized = normalizeText(option.label)
  normalizedLabels.set(option, { label: option.label, normalized })
  return normalized
}

// ONE search term, read both by the local filter and by what is sent to the source: the
// list on screen and the request in flight therefore cannot describe different searches.
// With nothing typed the term is empty, so a label merely being displayed never narrows
// the list.
const searchTerm = computed(() => (typed.value ? query.value.trim() : ''))

// The options that survive the search, flat and in the order they are shown. This is
// what the keyboard counts through: blocks and separators do not appear in it, which is
// exactly why the arrows never stop on one.
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
/**
 * What is announced about the state of the panel — that nothing matches, or that
 * something is loading. It is emptied as soon as there are options to show: a region
 * that announces its changes must only ever hold what is new, or the same sentence is
 * read out again at every keystroke.
 */
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
  // A separator is held back and only drawn once something has come BEFORE it and
  // something comes AFTER it. That single rule covers all three ways the filtering can
  // strand one: at the top of the list, at the bottom, and two in a row.
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
      // A block none of whose options survived is dropped entirely, its name included:
      // a heading over nothing is worse than no heading.
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

// Telling an outside source what is being searched for. Nothing native waits before
// sending a request, or refrains from sending the same one twice, so both have to be
// written. The waiting itself is delegated to `useTimer` — re-arming, a delay of zero
// running at once, cancellation when the component goes away — and what stays here is
// specific to this component: not repeating a term, and giving up when the panel closes.
const searchTimer = useTimer()
// The last term actually sent, or nothing if none ever was. It is what stops reopening
// the panel on an unchanged term from firing the request again — a consumer with a cache
// of their own is of course free to answer instantly.
let lastEmitted: string | undefined

const cancelSearch = searchTimer.cancel

function emitSearch(term: string, immediate = false) {
  cancelSearch()
  if (term === lastEmitted) return
  searchTimer.start(
    () => {
      // The panel may have closed while we were waiting: there is then nothing left to
      // load, and the check has to happen HERE rather than before arming the timer.
      if (!open.value) return
      lastEmitted = term
      emit('search', term)
    },
    immediate ? 0 : props.searchDebounce,
  )
}

watch(searchTerm, (term) => {
  if (!open.value) return
  // A new search means a new list, so the highlight cannot survive it: with an outside
  // source the options are replaced wholesale, and the old position would name a
  // completely unrelated option.
  //
  // It is moved to the first available option rather than dropped altogether, and that
  // matters when the filtering is left to the source: the visible list keeps the very
  // same reference until the answer arrives, so the watcher below would never fire and
  // Enter would do nothing in the meantime. When the new list does arrive, the position
  // is still within it and simply names its first option.
  activeIndex.value = filtered.value.findIndex((o) => !o.disabled)
  emitSearch(term)
})

watch(filtered, (list) => {
  // While the panel is open there must always be a valid option highlighted. It is moved
  // back to the first result whenever the highlighted one has fallen out of the list OR
  // there was none at all — without that second case, a search that passed through "no
  // result" would leave nothing highlighted, and Enter would not choose the single
  // result that came back.
  if (!open.value) return
  if (activeIndex.value < 0 || activeIndex.value >= list.length) {
    activeIndex.value = list.findIndex((o) => !o.disabled)
  }
})

// With a single value, the field shows its label as ordinary text whenever it is not
// being edited.
if (!props.multiple && typeof model.value === 'string' && model.value) {
  query.value = labelOf(model.value)
}

// That label is a COPY and not something derived, so it has to be refreshed when the
// options arrive later — otherwise a field mounted with a value but no options yet would
// show a raw identifier for ever.
//
// ONLY the options are watched. Watching the value as well would bring back the
// premature read that selecting deliberately avoids, and the two guards below are what
// keep the refresh from ever overwriting something being typed.
watch(
  allOptions,
  () => {
    if (props.multiple || open.value || typed.value) return
    if (typeof model.value === 'string' && model.value) query.value = labelOf(model.value)
  },
  { flush: 'post' },
)

// With several values chosen and the field unfocused, the search input folds away so the
// chips are not followed by an empty gap. It stays in the page and stays focusable —
// only its width goes.
const collapsed = computed(
  () => props.multiple && !focused.value && selectedValues.value.length > 0,
)

// The clear cross has to appear as soon as there is SOMETHING to clear — chosen values,
// or a search in progress — and not merely when the text field holds text. The field
// cannot work that out for itself, since the chips live outside its value, so the answer
// is given to it explicitly, and the room for the cross is reserved accordingly.
const canClear = computed(
  () =>
    props.clearable &&
    !props.disabled &&
    (selectedValues.value.length > 0 || query.value.length > 0),
)

const optionId = (index: number) => `${optionsId}-option-${index}`

// A row has to be written twice in the template, once inside a block and once at the top
// level of the panel, a Vue template having no way to declare a reusable fragment. These
// two builders are what reduce that duplication to a single line on each side.
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
// Since the focus never leaves the field, the browser has no reason to scroll the
// highlighted option into view — nothing was focused. It is brought into view by hand
// instead, and asked for the SMALLEST movement that reveals it, so an option already
// visible does not make the panel jump.
watch(activeIndex, (index) => {
  if (index < 0) return
  nextTick(() => {
    // Called optionally: the unit-test environment implements no scrolling at all.
    document.getElementById(optionId(index))?.scrollIntoView?.({ block: 'nearest' })
  })
})

function openPanel() {
  if (props.disabled || open.value) return
  open.value = true
  const list = filtered.value
  const selectedIdx = list.findIndex((o) => !o.disabled && selectedSet.value.has(o.value))
  activeIndex.value = selectedIdx >= 0 ? selectedIdx : list.findIndex((o) => !o.disabled)
  // Told to the source AFTER the panel is marked open — the delayed emission checks that
  // flag before firing — which is what lets an outside source load its first page as the
  // panel appears.
  emitSearch(searchTerm.value, true)
}

// Asking for the next page as the end of the list is reached. The observer itself, its
// re-arming after each page and the lock that stops it firing twice all live in
// `./infiniteScroll`; it is declared here so that closing the panel can reset it.
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
  // A page that never arrived — a request that failed — must not leave the paging
  // frozen for good, so the lock is released here.
  infiniteScroll.reset()
  open.value = false
  activeIndex.value = -1
  typed.value = false
  query.value =
    !props.multiple && typeof model.value === 'string' && model.value ? labelOf(model.value) : ''
}

/**
 * Closes as soon as the focus leaves the component — the panel included, which is a
 * descendant of it even while floating above the page.
 */
const onFocusout = useFocusoutDismiss(rootEl, closePanel)

// @a11y
/*
 * TRAP — the focus must never leave the field, and this is what prevents it. Without
 * cancelling the press, clicking an option takes the focus off the field, the handler
 * above closes the panel BEFORE the click is turned into a selection, and choosing with
 * the mouse stops working entirely.
 *
 * It is invisible in the unit tests, where clicking moves no focus; a browser test
 * covers it.
 */
function onPanelMousedown(event: MouseEvent) {
  event.preventDefault()
}

/** The reader is typing: the text becomes a search, and the panel opens. */
function onInput() {
  typed.value = true
  openPanel()
}

/**
 * With a single value chosen, the label shown in the field is selected on focus, so that
 * typing replaces it rather than appending to it — and until something IS typed, the
 * whole list stays on offer.
 */
function selectQuery() {
  if (!props.multiple && query.value) inputRef.value?.select()
}

function onFocus() {
  focused.value = true
  selectQuery()
}

/** A click anywhere on the field focuses it and opens the panel. */
function onControlClick() {
  if (props.disabled) return
  inputRef.value?.focus()
  openPanel()
  // Selected again AFTER the click, which has just placed the caret somewhere in the
  // middle of the label.
  selectQuery()
}

function select(option: ComboboxOption) {
  if (option.disabled) return
  // Remembered immediately: the option may vanish from the list — on the next search —
  // before the parent has even passed the new value back down.
  optionCache.set(option.value, option)
  typed.value = false
  if (props.multiple) {
    model.value = toggleValue(selectedValues.value, option.value)
    query.value = ''
    inputRef.value?.focus()
  } else {
    model.value = option.value
    // This path does not go through the closing function, so the pending search has to
    // be cancelled here as well — otherwise the last keystroke would fire its request
    // after the panel had closed.
    cancelSearch()
    // TRAP — the label is taken from the option just chosen and NOT by reading the value
    // back. With a value bound by the parent, reading it immediately after writing still
    // returns the OLD one, and the field would show the previously selected label.
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

/**
 * The clear cross was pressed. The field has already emptied the text it holds; what is
 * left to empty is the selection itself — the single value, or all the chips.
 */
function onClear() {
  model.value = props.multiple ? [] : ''
  typed.value = false
  activeIndex.value = -1
}

// @keyboard — moves the highlight, skipping over the options that cannot be chosen and
// wrapping round from one end of the list to the other.
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

// @keyboard @a11y — the whole keyboard of the pattern. The arrows move the POINTER
// naming the current option and never the focus itself, which stays in the field
// throughout; Backspace on an empty field takes back the last chip, the usual gesture in
// a field holding several values.
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

        <!-- The chevron sits at the end of the field and turns as the panel opens; the
             clear cross is rendered by the field itself, to its left.

             While loading, the spinner takes EXACTLY the chevron's place — the field
             gives a spinner among its direct children the size of an icon — so nothing
             shifts. The field's own loading option is deliberately not used: it would
             overwrite this slot, chevron and all.

             The spinner is hidden from screen readers, which neutralizes the status role
             it carries: what announces the loading is the panel, and once is enough. -->
        <template #end>
          <VSpinner v-if="loading" class="v-combobox-spinner" aria-hidden="true" />
          <VIcon v-else name="expand_more" class="v-combobox-chevron" aria-hidden="true" />
        </template>
      </VInput>
    </div>

    <!-- TRAP — the panel itself carries BOTH the listbox role and the scrolling. That
         single fact is what the observer watching for the end of the list and the
         scrolling of the highlighted option both rely on: inserting any wrapper between
         them breaks the two at once. -->
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
      <!-- Blocks and separators exist for the eye alone: the keyboard counts through the
           flat list of surviving options and therefore never encounters one. -->
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

      <!-- The order matters: loading is checked BEFORE emptiness, so that a panel
           waiting for an answer never claims there is no result.

           Both are hidden from screen readers, and that is not an oversight. A listbox
           may contain nothing but options and blocks of options, so any other visible
           child would make the panel invalid — where an EMPTY listbox is perfectly
           acceptable. What they say is announced instead by the live region outside the
           panel, which is also the only way a screen reader would ever hear it: plain
           text sitting inside a combobox's popup is not part of what the field walks
           through. -->
      <div v-if="loading && filtered.length === 0" class="v-combobox-state" aria-hidden="true">
        <slot name="loading">
          <VSpinner :label="resolvedLoadingText" />
          <span>{{ resolvedLoadingText }}</span>
        </slot>
      </div>
      <div v-else-if="filtered.length === 0" class="v-combobox-state" aria-hidden="true">
        <slot name="empty" :query="searchTerm">{{ resolvedEmptyText }}</slot>
      </div>

      <!-- One element serves as both the marker watched for the end of the list and the
           place the next-page spinner appears. TRAP — it has to stay a SINGLE element:
           rendering the spinner conditionally in its place would destroy the marker and
           silently cancel the observation, and no further page would ever be asked
           for. -->
      <div v-if="hasMore" ref="sentinelEl" class="v-combobox-more" aria-hidden="true">
        <VSpinner v-if="loading" :label="resolvedLoadingText" />
      </div>
    </VPopover>

    <!-- The spoken counterpart of the two panel states above. It sits OUTSIDE the
         listbox, being exactly the kind of content a listbox may not contain. -->
    <span class="v-visually-hidden" role="status">{{ stateAnnouncement }}</span>
  </div>
</template>

<style>
@layer vectis.components {
  .v-combobox {
    /* Confines the anchor name to this instance. It is declared on the root because that
       is the common ancestor of the field and the panel — a panel drawn above the page
       remains a descendant of it in the document. */
    anchor-scope: --combobox-anchor;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  .v-combobox-control {
    anchor-name: --combobox-anchor;
    display: block;
  }

  /* The panel comes from VPopover, which brings the floating element, its open state, its
     anchoring, its placement and its surface. It also carries the shared size class, so
     the options and the state rows read their dimensions from it with no size table
     here. What stays are the two things specific to a list: a width tied to the field
     below it, and the scrolling. */
  .v-combobox-panel {
    min-inline-size: anchor-size(width);
    max-block-size: var(--vectis-control-size-combobox-list-max-block);
    overflow: auto;
  }

  /* The chevron and the clear cross are lifted out of the field's flow, so that they stay
     pinned to its end and vertically centred whatever the chips do and whether or not the
     input has folded away.

     The room they occupy is then reserved with padding, or the text and the chips would
     run underneath them. That reservation is written as exactly what the flow would have
     produced with them left in place — one glyph's width each from the field's padding,
     one gap between two of them — which is what keeps this field's spacing identical to
     every other field in the design system. It reads from the same two variables as the
     insets below, so the room reserved and the glyphs it protects cannot drift apart.

     Vertically they are centred with a translation kept SEPARATE from the rotation, since
     the chevron turns when the panel opens. */
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

  /* The chevron and the spinner take turns in the same place and occupy the same box —
     the field gives a spinner among its direct children the size of an icon — so the
     padding reserved above serves both, and swapping one for the other shifts
     nothing. */
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

  /* The clear cross goes just before the chevron, centred the same way.

     TRAP — both insets are measured to the GLYPH's edge, and they get there by different
     routes: the chevron is a bare icon, whose box IS its glyph, while the cross is one of
     the field's buttons, whose negative margin — half the difference between icon and
     button — cancels its own overhang. Because of that the arithmetic reads directly: one
     glyph's width from the field's padding, then one gap between the two.

     That gap is the field's own, which is the entire point: a number written here instead
     would drift from every other field in the design system, with nothing to signal
     it. */
  .v-combobox .v-input-clear {
    position: absolute;
    inset-inline-end: calc(
      var(--control-padding-inline-field) + var(--vectis-icon-size) + var(--control-gap)
    );
    top: 50%;
    translate: 0 -50%;
  }

  /* With several values allowed, the field holds the chips and lets them WRAP onto
     several rows, growing instead of scrolling — but never shrinking below the height of
     an ordinary control.

     The chips' height is written inline by the same helper that gives them their size,
     because it belongs to their own subtree and the field cannot read it. The input is
     then forced to that SAME height rather than the full height it inherits: its natural
     height is greater than a chip's, and the field would grow the moment it was focused.

     The result is a field that stays exactly one control tall, an input never taller than
     the chips beside it, and no jump when the focus arrives. */
  .v-combobox[data-multiple] .v-input-field {
    flex-wrap: wrap;
    height: auto;
    min-height: var(--control-height);
    padding-block: var(--vectis-space-1);
  }

  .v-combobox[data-multiple] .v-input-control {
    height: var(--chip-height);
  }

  /* Folded away, the input is taken out of the flow entirely rather than merely narrowed:
     even at zero width it would still occupy a line of its own under the chips and leave
     a visible gap.

     It remains in the page and remains focusable — clicking the field or tabbing into it
     brings it straight back, the folded state ending as soon as it has the focus. */
  .v-combobox[data-collapsed] .v-input-control {
    position: absolute;
    width: 0;
    height: 0;
    padding: 0;
  }

  /* The rows saying "nothing matches" or "loading" are built like an option: they read
     the same inherited dimensions from the panel, and the spinner follows through the
     same block's icon context. They refuse to shrink, the panel being a bounded column
     that would otherwise squash them. */
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

  /* The foot of the list: the marker watched for the end, and the place the next-page
     spinner appears. It is given a real height on purpose — a box of no height at all
     makes the crossing it is watched for unreliable. */
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
