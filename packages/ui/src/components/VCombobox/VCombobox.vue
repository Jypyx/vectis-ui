<script setup lang="ts">
// @a11y @keyboard @core
/**
 * Keep DOM focus on the field and move aria-activedescendant through options. JavaScript
 * supplies filtering, selection and keyboard navigation unavailable to native text inputs.
 */

import { computed, inject, reactive, ref, useId, watch, watchEffect } from 'vue'

import VChip from '../VChip/VChip.vue'
import VEmptyState from '../VEmptyState/VEmptyState.vue'
import type { ChipSize } from '../VChip/VChip.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import { inbox as inboxIcon } from '../VIcon/icons/inbox'
import { search_off as searchOffIcon } from '../VIcon/icons/search_off'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VPopover from '../VPopover/VPopover.vue'
import VComboboxOption from './VComboboxOption.vue'
import VComboboxGroup from './VComboboxGroup.vue'
import VComboboxSeparator from './VComboboxSeparator.vue'
import VSpinner from '../VSpinner/VSpinner.vue'

import { toggleValue } from '../../utils/array'
import type { ItemValue } from '../../types'
import { inputGroupKey } from '../VInput/context'

import { chipScaleFor } from '../../utils/chip'
import { createNormalizedCache, normalizeText } from '../../utils/text'

import { useControlShape } from '../../composables/useControlShape'
import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFocusoutDismiss } from '../../composables/useFocusoutDismiss'
import { useInfiniteScroll } from '../../composables/useInfiniteScroll'
import { useVirtualList, type VirtualSegment } from '../../composables/useVirtualList'

import { canClear } from '../../composables/useClearable'
import { iconStartListener } from '../../composables/useIconClickHandlers'

import { useTimer } from '../../composables/useTimer'
import { useMessages } from '../../i18n/state'

/** One thing that can be chosen. */
export interface ComboboxOption {
  /**
   * What choosing it means: this is what the value holds. A number is admitted because a
   * list of options almost always comes from somewhere that keys its rows by one.
   */
  value: ItemValue
  /** What it is called on screen, and what the search matches against. */
  label: string
  /** An icon before the label: an icon name, or an explicit render. */
  icon?: IconSource
  /** Shows the option without allowing it to be chosen. */
  disabled?: boolean
}

/**
 * A named block of options, the equivalent of the grouping a native list offers. A
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
 * the search leaves stranded (at the top, at the bottom, or against another one) is
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
 * How the list is narrowed as one types: by the component itself, not at all (when the
 * options already arrive filtered by a server), or by a rule of your own.
 */
export type ComboboxFilter = boolean | ((option: ComboboxOption, query: string) => boolean)

/** Where the list opens relative to the field. */
export type ComboboxPlacement =
  'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

/** The height of the field: 32, 40 or 48 pixels. */
export type ComboboxSize = 'sm' | 'md' | 'lg'

/**
 * How the chosen values are shown in a multiple field: one chip each, or their labels
 * joined by commas.
 */
export type ComboboxDisplay = 'chip' | 'text'

/** What the `#option` slot receives. */
export interface ComboboxOptionSlotProps {
  option: ComboboxOption
  index: number
  active: boolean
  selected: boolean
}

/** What the `#chip` slot receives. */
export interface ComboboxChipSlotProps {
  value: ItemValue
  option: ComboboxOption | undefined
  label: string
  remove: () => void
  size: ChipSize
  compact: boolean
}

/** What the `#overflow` slot receives. */
export interface ComboboxOverflowSlotProps {
  count: number
  size: ChipSize
  compact: boolean
}

/** What the `#empty` slot receives. */
export interface ComboboxEmptySlotProps {
  query: string
}

interface ComboboxProps {
  /**
   * What the list offers. An entry may be an option, a named block of options, or a
   * separator; a plain list of options remains perfectly valid.
   */
  options: ComboboxItem[]
  /**
   * Allows several values to be chosen, which makes the value a list and shows what has
   * been chosen inside the field, as chips or as text depending on `display`.
   */
  multiple?: boolean
  /**
   * How the chosen values are shown when several can be chosen: one dismissible chip each, or
   * their labels joined by commas on a single line, cut short with an ellipsis when they run
   * out of room.
   */
  display?: ComboboxDisplay
  /**
   * How many chosen values to show before the rest are summed up as "+X", as chips or as text
   * alike. Left out, or set to 0, every value is shown.
   */
  max?: number
  /**
   * Rephrases the "+X" standing for the values beyond `max`, "+5 products" for instance.
   * It receives the number of values being hidden.
   */
  overflowText?: (count: number) => string
  /** The label above the field, tied to it so that clicking it focuses the field. */
  label?: string
  /**
   * A line of help under the field. It is tied to the field for assistive technology,
   * so it is read out along with the label.
   */
  hint?: string
  /**
   * A message saying what is wrong with the value, shown in place of the hint so that the field
   * does not grow. It marks the field invalid, is read along with it, and is announced when it
   * appears or changes.
   */
  error?: string
  /** The height of the field: 32, 40 or 48 pixels. */
  size?: ComboboxSize
  /** Takes 4px off the height, as everywhere else in the design system. */
  compact?: boolean
  /** What the field says while nothing is chosen and nothing has been typed. */
  placeholder?: string
  /** Makes the field unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /**
   * Shows what has been chosen without letting it be changed: nothing can be typed, the list
   * never opens, the chips lose their crosses and no clear cross is offered.
   */
  readonly?: boolean
  /** Marks the field as invalid, for a rule of your own. */
  invalid?: boolean
  /**
   * An icon inside the field, at the start, before the chips when several values can
   * be chosen. It is decorative by default and becomes a real button as soon as a
   * `@click:icon-start` listener is attached, in which case it needs `iconStartLabel`.
   */
  iconStart?: IconSource
  /** What the start icon does, in words, once it is clickable. */
  iconStartLabel?: string
  /**
   * The chevron at the end of the field, which turns as the list opens: an icon name, or an
   * explicit render.
   */
  expandIcon?: IconSource
  /**
   * Leaves the chevron out, for a field that reads as a search box with suggestions rather than
   * as a list to pick from.
   */
  hideExpandIcon?: boolean
  /** Offers a cross that empties both the selection and the search. */
  clearable?: boolean
  /** What that cross does, in words. It falls back to the design system dictionary. */
  clearLabel?: string
  /**
   * The title of the empty state the panel shows when the search matches nothing. It is also
   * what a screen reader hears, even when the `#empty` slot draws something else: set both
   * together.
   */
  emptyText?: string
  /** How the list is narrowed as one types. */
  filter?: ComboboxFilter
  /**
   * How long to wait before telling the source what is being searched for, in
   * milliseconds. Zero tells it at once, which suits a source that is not a network
   * request.
   */
  searchDebounce?: number
  /**
   * Says that something is being loaded. Either way the field replaces its chevron with a
   * spinner.
   */
  loading?: boolean
  /**
   * What is said while loading, and what the spinner is announced as. A screen reader hears
   * it even when the `#loading` slot draws something else: set both together.
   */
  loadingText?: string
  /**
   * Says that there are more pages to come, which makes the component ask for the next one as
   * the end of the list comes into view.
   */
  hasMore?: boolean
  /**
   * Renders only the rows near the visible part of the panel, for lists of thousands of options.
   * Rows are measured as they render, so a custom `#option` may vary in height. Options are then
   * announced with their position in the list.
   */
  virtual?: boolean
  /** Where the list opens relative to the field. */
  placement?: ComboboxPlacement
}

const props = withDefaults(defineProps<ComboboxProps>(), {
  multiple: false,
  display: 'chip',
  max: undefined,
  overflowText: undefined,
  label: undefined,
  hint: undefined,
  error: undefined,
  size: 'md',
  compact: false,
  placeholder: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  iconStart: undefined,
  iconStartLabel: undefined,
  expandIcon: () => expandMoreIcon,
  hideExpandIcon: false,
  clearable: false,
  clearLabel: undefined,
  emptyText: undefined,
  filter: true,
  searchDebounce: 250,
  loading: false,
  loadingText: undefined,
  hasMore: false,
  virtual: false,
  placement: 'bottom-start',
})

const m = useMessages()
const resolvedEmptyText = computed(() => props.emptyText ?? m.value.combobox.empty)
const resolvedClearLabel = computed(() => props.clearLabel ?? m.value.combobox.clear)
const resolvedLoadingText = computed(() => props.loadingText ?? m.value.common.loading)

const emit = defineEmits<{
  /** What is being searched for, to be sent to the source. */
  search: [query: string]
  /** The end of the list has come into view: send the next page. */
  'load-more': []
  /** The clear cross emptied the selection and the search. */
  clear: []
  /** The start icon was clicked. Attaching this listener is what makes it a button. */
  'click:icon-start': [event: MouseEvent]
}>()

defineSlots<{
  /**
   * Content at the start of the field, rendered after the chips standing for the chosen
   * values rather than in their place.
   */
  start?(): unknown
  /**
   * Controls of your own inside the field, placed before the ones the field owns: the clear
   * cross and the chevron.
   */
  'value-end'?(): unknown
  /** What a row of the list shows, in place of the plain label: a subtitle, an avatar, a badge. */
  option?(props: ComboboxOptionSlotProps): unknown
  /** Replaces the chip standing for one chosen value. */
  chip?(props: ComboboxChipSlotProps): unknown
  /** Replaces the "+X" standing for the values beyond `max`. */
  overflow?(props: ComboboxOverflowSlotProps): unknown
  /** What the panel shows when nothing matches. It receives the term that was searched. */
  empty?(props: ComboboxEmptySlotProps): unknown
  /** What the panel shows while loading its first options. */
  loading?(): unknown
}>()

// Everything below reads the RESOLVED values and never the props: the chips, the panel and the
// field would otherwise come out at three different scales inside the same row.
const group = inject(inputGroupKey, null)
const {
  size: resolvedSize,
  compact: resolvedCompact,
  disabled: resolvedDisabled,
} = useControlShape(props, group)

// The size, the density and the HEIGHT of the chips sitting inside the field, worked out
// once in `utils/chip.ts` and shared with VFileInput. The height is set inline below
// rather than restated as a table of CSS rules: it is the height the field forces on its
// input, and deriving both from the same pair is what stops them drifting apart.
const chipScale = computed(() => chipScaleFor(resolvedSize.value, resolvedCompact.value))

/** The chosen option's `value`, or the list of them when `multiple` is set. */
const model = defineModel<ItemValue | ItemValue[]>({ default: '' })

// `class` and `style` stay on the wrapper, where a consumer expects to style the component;
// everything else; a name above all; goes down to the text field, which is the element
// assistive technology treats as the combobox.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

// Declared as this component's own event, `click:icon-start` is out of `$attrs`, so the
// listener is relayed to the field by hand; and only when the consumer wrote one.
const iconStartClick = iconStartListener((event) => emit('click:icon-start', event))

/** What reaches the field: the consumer's own attributes, plus that listener. */
const fieldAttrs = computed(() => ({ ...forwardedAttrs.value, ...iconStartClick }))

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
// The text in the field serves two purposes at once: it SHOWS the chosen label when a single
// value is picked, and it is what one searches with. This flag tells the two apart; while it is
// false the text is merely a label and narrows nothing, so reopening the panel offers the whole
// list again.
const typed = ref(false)

const selectedValues = computed<ItemValue[]>(() => {
  if (props.multiple) return Array.isArray(model.value) ? model.value : []
  // An empty string is what an emptied combobox says, and it is not a value. A NUMBER, on the
  // other hand, is a value even at zero; hence the test on the empty string alone rather than
  // on falsiness, which would drop the option keyed `0`.
  return !Array.isArray(model.value) && model.value !== '' ? [model.value] : []
})

// Every option, flattened: the blocks unwrapped, the separators dropped, in the order they were
// given. This is the ONE reading of the options the rest of the component does; the filtering,
// the memory of what was chosen, the labels and the paging all ignore the hierarchy entirely.
const allOptions = computed<ComboboxOption[]>(() =>
  props.options.flatMap((item) => {
    if (isSeparator(item)) return []
    return isGroup(item) ? item.options : [item]
  }),
)

// With a source that answers over the network, the options only ever hold the latest results,
// and something already chosen is usually absent from them; without this, a chip would show a
// raw identifier instead of a name, and a custom chip would lose the option's icon. It is kept
// up to date by an effect rather than by watching the options, because the effect tracks the
// ITERATION and therefore also notices a page appended in place.
const optionCache = reactive(new Map<ItemValue, ComboboxOption>())
watchEffect(() => {
  const wanted = new Set(selectedValues.value)
  for (const option of allOptions.value) {
    if (wanted.has(option.value)) optionCache.set(option.value, option)
  }
  // Without this the memory would grow with every value chosen during the session rather than
  // with the current selection; a slow leak in a long-lived multiple field fed by a paginated
  // source.
  for (const value of optionCache.keys()) if (!wanted.has(value)) optionCache.delete(value)
})

/*
 * A lookup from value to option, built once per list of options rather than searched each time.
 * Finding an option is done several times per chip and per render; for the chip itself, its
 * label and the name of its remove button; so a linear search here would cost the number of
 * chips times the number of options, on every keystroke.
 */
const optionsByValue = computed(() => {
  const map = new Map<ItemValue, ComboboxOption>()
  for (const option of allOptions.value) if (!map.has(option.value)) map.set(option.value, option)
  return map
})

/**
 * The selection as a set, so that asking "is this one chosen?" costs nothing however many are;
 * the same device VDataTable uses for its selected rows.
 */
const selectedSet = computed(() => new Set(selectedValues.value))

/**
 * An option coming from that memory is a reactive PROXY, since making the map reactive converts
 * the objects inside it. Compare options by their value and never by identity, or the two forms
 * of the same option will not match.
 */
function optionOf(value: ItemValue) {
  return optionsByValue.value.get(value) ?? optionCache.get(value)
}

function labelOf(value: ItemValue) {
  return optionOf(value)?.label ?? String(value)
}

/*
 * Reading the label on every call is what keeps the filter reactive: flattening the options
 * only ever touches the containers, so a label changed in place would go unnoticed by anything
 * keyed on the list.
 */
const normalizedOf = createNormalizedCache<ComboboxOption>()
const normalizedLabelOf = (option: ComboboxOption) => normalizedOf(option, option.label)

// ONE search term, read both by the local filter and by what is sent to the source: the
// list on screen and the request in flight therefore cannot describe different searches.
// With nothing typed the term is empty, so a label merely being displayed never narrows
// the list.
const searchTerm = computed(() => (typed.value ? query.value.trim() : ''))

// Closing empties `searchTerm` (the typing flag drops) in the same tick as it hides the panel,
// but the panel fades out rather than vanishing. Filtered on the live term, the list would
// spring back to every option during that fade, and the panel grow under the pointer that just
// chose.
const closedTerm = ref<string | null>(null)

// This is what the keyboard counts through: blocks and separators do not appear in it, which is
// exactly why the arrows never stop on one.
const filtered = computed(() => {
  const matcher = props.filter
  const list = allOptions.value
  if (matcher === false) return list
  const q = closedTerm.value ?? searchTerm.value
  if (!q) return list
  if (typeof matcher === 'function') return list.filter((o) => matcher(o, q))
  const needle = normalizeText(q)
  return list.filter((o) => normalizedLabelOf(o).includes(needle))
})

// @a11y
/**
 * What is announced about the state of the panel; that nothing matches, or that something is
 * loading.
 */
const stateAnnouncement = computed(() => {
  if (!open.value || filtered.value.length > 0) return ''
  return props.loading ? resolvedLoadingText.value : resolvedEmptyText.value
})

// Each option there carries its index in `filtered` (and not its position in the tree): ids,
// highlight and the #option slot stay aligned on the keyboard navigation.
type RenderedOption = { kind: 'option'; key: string; option: ComboboxOption; index: number }
type RenderedNode =
  | RenderedOption
  | { kind: 'group'; key: string; id: string; label: string; options: RenderedOption[] }
  | { kind: 'separator'; key: string }

// Nothing here is keyed by VALUE. Two options may share one (a consumer's duplicate, or `1`
// beside `'1'`, which a template literal spells the same), and a value-keyed index hands both
// the same position, so both light up as active and Vue patches two rows under one key.
const rendered = computed<RenderedNode[]>(() => {
  const kept = new Set(filtered.value)
  let next = 0

  const entryOf = (option: ComboboxOption, key: string): RenderedOption | null => {
    if (!kept.has(option)) return null
    return { kind: 'option', key: `option:${key}`, option, index: next++ }
  }

  const nodes: RenderedNode[] = []
  // A separator is held back and only drawn once something has come before it and something
  // comes after it. That single rule covers all three ways the filtering can strand one: at the
  // top of the list, at the bottom, and two in a row.
  let pendingSeparator: string | null = null

  for (const [i, item] of props.options.entries()) {
    if (isSeparator(item)) {
      if (nodes.length > 0) pendingSeparator = `sep:${i}`
      continue
    }

    let node: RenderedNode | null
    if (isGroup(item)) {
      const options = item.options
        .map((option, j) => entryOf(option, `${i}.${j}`))
        .filter((entry): entry is RenderedOption => entry !== null)
      // A block none of whose options survived is dropped entirely, its name included:
      // a heading over nothing is worse than no heading.
      node =
        options.length > 0
          ? {
              kind: 'group',
              key: `group:${i}`,
              id: `${optionsId}-group-${i}`,
              label: item.label,
              options,
            }
          : null
    } else {
      node = entryOf(item, String(i))
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

// Nothing native waits before sending a request, or refrains from sending the same one twice,
// so both have to be written. The waiting itself is delegated to `useTimer`; re-arming, a delay
// of zero running at once, cancellation when the component goes away; and what stays here is
// specific to this component: not repeating a term, and giving up when the panel closes.
const searchTimer = useTimer()
// The last term actually sent, or nothing if none ever was. It is what stops reopening the
// panel on an unchanged term from firing the request again; a consumer with a cache of their
// own is of course free to answer instantly.
let lastEmitted: string | undefined

const cancelSearch = searchTimer.cancel

function emitSearch(term: string, immediate = false) {
  cancelSearch()
  if (term === lastEmitted) return
  searchTimer.start(
    () => {
      // The panel may have closed while we were waiting: there is then nothing left to load,
      // and the check has to happen here rather than before arming the timer.
      if (!open.value) return
      lastEmitted = term
      emit('search', term)
    },
    immediate ? 0 : props.searchDebounce,
  )
}

watch(searchTerm, (term) => {
  if (!open.value) return
  // A new search means a new list, so the highlight cannot survive it: with an outside source
  // the options are replaced wholesale, and the old position would name a completely unrelated
  // option. It is moved to the first available option rather than dropped altogether, and that
  // matters when the filtering is left to the source: the visible list keeps the very same
  // reference until the answer arrives, so the watcher below would never fire and Enter would
  // do nothing in the meantime.
  activeIndex.value = filtered.value.findIndex((o) => !o.disabled)
  // The page asked for under the previous term will never arrive, and the first page of the new
  // one may be exactly as long as the list it replaces; which the paging would not recognise as
  // an arrival.
  infiniteScroll.restart()
  emitSearch(term)
})

watch(filtered, (list) => {
  // While the panel is open there must always be a valid option highlighted. It is moved back
  // to the first result whenever the highlighted one has fallen out of the list or there was
  // none at all; without that second case, a search that passed through "no result" would leave
  // nothing highlighted, and Enter would not choose the single result that came back.
  if (!open.value) return
  if (activeIndex.value < 0 || activeIndex.value >= list.length) {
    activeIndex.value = list.findIndex((o) => !o.disabled)
  }
})

// With a single value, the field shows its label as ordinary text whenever it is not being
// edited. Read through `selectedValues`, which knows that a number is a value even at zero: a
// test on the string type would leave a numeric value unlabelled.
function singleLabel() {
  const value = props.multiple ? undefined : selectedValues.value[0]
  return value === undefined ? '' : labelOf(value)
}

query.value = singleLabel()

// Refresh copied selection labels when options arrive or the parent updates the value.
// Post-flush timing reads the accepted model after rendering.
watch(
  [allOptions, selectedValues],
  () => {
    if (props.multiple || open.value || typed.value) return
    query.value = singleLabel()
  },
  { flush: 'post' },
)

/** The chosen values are spelled out as one line of text rather than drawn as chips. */
const textDisplay = computed(() => props.multiple && props.display === 'text')

// A read-only TEXT display keeps it folded under the focus too: nothing can be typed, and the
// input's share of the row would only cut the line of values short for nothing.
const collapsed = computed(
  () =>
    props.multiple &&
    selectedValues.value.length > 0 &&
    (!focused.value || (textDisplay.value && props.readonly)),
)

// Unfolded, the reader is working on the selection, and every value must be there to be seen
// and taken back; Backspace included, which would otherwise remove a value hidden behind the
// "+X". `max: 0` means no limit, as on VAvatarGroup: a truthiness test, never `!= null`, which
// would hide every value.
const visibleValues = computed(() =>
  collapsed.value && props.max ? selectedValues.value.slice(0, props.max) : selectedValues.value,
)
const overflowCount = computed(() => selectedValues.value.length - visibleValues.value.length)

// Digits and a plus sign stay out of the dictionary, as VAvatarGroup's "+N" does: rephrasing
// goes through `overflowText` or the `#overflow` slot.
const resolvedOverflowText = computed(() =>
  props.overflowText ? props.overflowText(overflowCount.value) : `+${overflowCount.value}`,
)

// The comma is universal punctuation rather than a word, so it stays out of the dictionary,
// as in VFileInput's own text display.
const displayText = computed(() =>
  textDisplay.value ? visibleValues.value.map(labelOf).join(', ') : '',
)

// The field cannot work that out for itself, since the chips live outside its value, so the
// answer is given to it explicitly, and the room for the cross is reserved accordingly.
const clearVisible = computed(() =>
  canClear(
    props,
    resolvedDisabled.value,
    selectedValues.value.length > 0 || query.value.length > 0,
  ),
)

// @a11y
// An option's id follows the OPTION, from its place among all the options, and never its place
// in the filtered list: a screen reader announces the current option when
// `aria-activedescendant` changes, and a positional id would keep the same value while the
// filter slides another option under the highlight, which then goes unannounced. Still indexed
// by the filtered position, which the keyboard counts through.
const sourceIndex = computed(() => new Map(allOptions.value.map((option, i) => [option, i])))
const optionId = (index: number) => {
  const option = filtered.value[index]
  return `${optionsId}-option-${option ? sourceIndex.value.get(option) : index}`
}

/**
 * The panel as one flat sequence of rows, the unit the virtual mode windows: a block's name is a
 * row of its own, above its options. Each row knows its block, so the rows rendered can be
 * gathered back into their groups. `set` and `position` are the option's place in its block, or
 * among the options outside any block.
 */
type FlatOption = RenderedOption & { group?: string; set: number; position: number }
type FlatRow =
  | FlatOption
  | { kind: 'heading'; key: string; id: string; label: string; group: string }
  | { kind: 'separator'; key: string }

const flat = computed(() => {
  const rows: FlatRow[] = []
  const labels = new Map<string, string>()
  // Indexed by the option's place in `filtered`: where the keyboard's highlight sits in the rows.
  const rowOfOption: number[] = []
  const loose = rendered.value.filter((node) => node.kind === 'option').length
  let looseSeen = 0
  for (const node of rendered.value) {
    if (node.kind === 'separator') rows.push(node)
    else if (node.kind === 'option') {
      rowOfOption[node.index] = rows.length
      rows.push({ ...node, set: loose, position: ++looseSeen })
    } else {
      labels.set(node.key, node.label)
      rows.push({
        kind: 'heading',
        key: `heading:${node.key}`,
        id: node.id,
        label: node.label,
        group: node.key,
      })
      for (const [j, option] of node.options.entries()) {
        rowOfOption[option.index] = rows.length
        rows.push({ ...option, group: node.key, set: node.options.length, position: j + 1 })
      }
    }
  }
  return { rows, labels, rowOfOption }
})

// Only a starting guess for the virtual mode, every row being measured once rendered: the
// height of an option at each size, 4px less when compact, as the control heights go.
const OPTION_HEIGHT: Record<ComboboxSize, number> = { sm: 32, md: 40, lg: 48 }

const panelRef = ref<InstanceType<typeof VPopover> | null>(null)

// @a11y
// The highlighted row stays rendered wherever the panel is scrolled: `aria-activedescendant`
// must name an element that exists.
const virtualList = useVirtualList({
  scrollEl: computed(() => (props.virtual ? (panelRef.value?.el ?? null) : null)),
  count: () => flat.value.rows.length,
  key: (index) => flat.value.rows[index]?.key,
  itemSize: () => OPTION_HEIGHT[resolvedSize.value] - (resolvedCompact.value ? 4 : 0),
  overscan: () => 5,
  initialCount: () => 10,
  pinned: () => {
    const row = flat.value.rowOfOption[activeIndex.value]
    return row === undefined ? [] : [row]
  },
})
const measureRow = virtualList.measure

/**
 * A rendered option with its state worked out, once per row: `row` is what the option element
 * takes, `slot` what the `#option` slot receives, and both read the same two answers. `at` is
 * the row's place in the flat sequence, which the virtual mode measures it under.
 */
type OptionRow = FlatOption & {
  at: number
  row: {
    id: string
    icon?: IconSource
    active: boolean
    selected: boolean
    disabled?: boolean
    'aria-setsize'?: number
    'aria-posinset'?: number
  }
  slot: { option: ComboboxOption; index: number; active: boolean; selected: boolean }
}
type RowBlock =
  | OptionRow
  | { kind: 'heading'; key: string; id: string; label: string; at: number }
  | { kind: 'separator'; key: string; at: number }
  | { kind: 'spacer'; key: string; size: number }
type PanelBlock =
  RowBlock | { kind: 'group'; key: string; label: string; labelId?: string; children: RowBlock[] }

function withState(entry: FlatOption, at: number): OptionRow {
  const active = entry.index === activeIndex.value
  const selected = selectedSet.value.has(entry.option.value)
  // @a11y
  // Only some options exist in the virtual mode, so each one says where it stands; the last
  // block may still grow while pages are coming.
  const placed = props.virtual
    ? { 'aria-setsize': props.hasMore ? -1 : entry.set, 'aria-posinset': entry.position }
    : {}
  return {
    ...entry,
    at,
    row: {
      id: optionId(entry.index),
      icon: entry.option.icon,
      active,
      selected,
      disabled: entry.option.disabled,
      ...placed,
    },
    slot: { option: entry.option, index: entry.index, active, selected },
  }
}

// What the panel renders: the rows of the window and the space standing for the others,
// gathered back into their blocks. Kept apart from `flat` on purpose: the highlight moves on
// every arrow key, and only this pass over the rendered rows follows it; the filtering and the
// grouping stay where they are.
const blocks = computed<PanelBlock[]>(() => {
  const { rows, labels } = flat.value
  const segments: VirtualSegment[] = props.virtual
    ? virtualList.segments.value
    : rows.map((_, index) => ({ type: 'row', index }))
  const groupAt = (segment: VirtualSegment | undefined) => {
    const row = segment?.type === 'row' ? rows[segment.index] : undefined
    return row && row.kind !== 'separator' ? row.group : undefined
  }

  const out: PanelBlock[] = []
  let open: Extract<PanelBlock, { kind: 'group' }> | undefined
  for (const [k, segment] of segments.entries()) {
    let block: RowBlock
    let group: string | undefined
    if (segment.type === 'spacer') {
      block = { kind: 'spacer', key: segment.key, size: segment.size }
      // Between two rows of one block, the space stands for rows of that block.
      const before = groupAt(segments[k - 1])
      group = before === groupAt(segments[k + 1]) ? before : undefined
    } else {
      const row = rows[segment.index]!
      block = row.kind === 'option' ? withState(row, segment.index) : { ...row, at: segment.index }
      group = groupAt(segment)
    }
    if (group === undefined) {
      open = undefined
      out.push(block)
      continue
    }
    if (open?.key !== group) {
      open = { kind: 'group', key: group, label: labels.get(group)!, children: [] }
      out.push(open)
    }
    if (block.kind === 'heading') open.labelId = block.id
    open.children.push(block)
  }
  return out
})

function hover(entry: RenderedOption) {
  if (!entry.option.disabled) activeIndex.value = entry.index
}

// @a11y
// Since the focus never leaves the field, the browser has no reason to scroll the highlighted
// option into view; nothing was focused. It is brought into view by hand instead, and asked for
// the SMALLEST movement that reveals it, so an option already visible does not make the panel
// jump.
watch(
  activeIndex,
  (index) => {
    if (index < 0) return
    if (props.virtual) {
      const row = flat.value.rowOfOption[index]
      if (row !== undefined) void virtualList.scrollToIndex(row)
      return
    }
    // Called optionally: the unit-test environment implements no scrolling at all.
    document.getElementById(optionId(index))?.scrollIntoView?.({ block: 'nearest' })
  },
  { flush: 'post' },
)

// The single cut-off point of a frozen field: every route into the list; a click on the
// control, the focus, a keystroke, typing; ends up here, so `readonly` is refused once rather
// than guarded in each handler.
function openPanel() {
  if (resolvedDisabled.value || props.readonly || open.value) return
  closedTerm.value = null
  open.value = true
  const list = filtered.value
  const selectedIdx = list.findIndex((o) => !o.disabled && selectedSet.value.has(o.value))
  activeIndex.value = selectedIdx >= 0 ? selectedIdx : list.findIndex((o) => !o.disabled)
  // Told to the source after the panel is marked open; the delayed emission checks that flag
  // before firing; which lets an outside source load its first page as the panel appears.
  emitSearch(searchTerm.value, true)
}

// Asking for the next page as the end of the list is reached. The observer itself, its
// re-arming after each page and the lock that stops it firing twice all live in
// `useInfiniteScroll`; it is declared here so that closing the panel can reset it.
const sentinelEl = ref<HTMLElement | null>(null)

const infiniteScroll = useInfiniteScroll({
  sentinelEl,
  // Found by its ARIA role, which is public API, rather than by an internal class.
  root: (sentinel) => sentinel.closest('[role="listbox"]'),
  canLoad: () => open.value && props.hasMore && !props.loading,
  loaded: () => allOptions.value,
  onLoadMore: () => emit('load-more'),
})

function closePanel() {
  if (!open.value) return
  cancelSearch()
  // A page that never arrived; a request that failed; must not leave the paging frozen for
  // good, so the lock is released here.
  infiniteScroll.reset()
  closedTerm.value = searchTerm.value
  open.value = false
  activeIndex.value = -1
  typed.value = false
  query.value = singleLabel()
}

watch(
  () => props.readonly || resolvedDisabled.value,
  (frozen) => {
    if (frozen) closePanel()
  },
)

/**
 * Closes as soon as the focus leaves the component; the panel included, which is a descendant
 * of it even while floating above the page.
 */
const onFocusout = useFocusoutDismiss(rootEl, closePanel)

// @a11y
/*
 * The focus must never leave the field, and this is what prevents it. Without cancelling the
 * press, clicking an option takes the focus off the field, the handler above closes the panel
 * before the click is turned into a selection, and choosing with the mouse stops working
 * entirely.
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
 * With a single value chosen, the label shown in the field is selected on focus, so that typing
 * replaces it rather than appending to it; and until something IS typed, the whole list stays
 * on offer.
 */
function selectQuery() {
  if (!props.multiple && query.value) inputRef.value?.select()
}

function onFocus() {
  focused.value = true
  selectQuery()
}

/** Whether a pointer event landed on the chevron, or on the spinner standing in its place. */
const onChevron = (event: Event) =>
  event.target instanceof Element &&
  event.target.closest('.v-combobox-chevron, .v-combobox-spinner') !== null

// @core
/*
 * The chevron is not focusable, so pressing it would hand the focus to the page: the root's
 * `focusout` then closes the panel, and the click that follows reopens it. A click meant to
 * close would flash the list instead.
 */
function onControlMousedown(event: MouseEvent) {
  if (onChevron(event)) event.preventDefault()
}

/**
 * A click anywhere on the field focuses it and opens the panel; except on the chevron of an
 * open panel, which closes it.
 */
function onControlClick(event: MouseEvent) {
  if (resolvedDisabled.value) return
  inputRef.value?.focus()
  if (open.value && onChevron(event)) {
    closePanel()
    return
  }
  openPanel()
  // Selected again after the click, which has just placed the caret somewhere in the middle of
  // the label.
  selectQuery()
}

function select(option: ComboboxOption) {
  if (option.disabled || props.readonly || resolvedDisabled.value) return
  // Remembered immediately: the option may vanish from the list; on the next search; before the
  // parent has even passed the new value back down.
  optionCache.set(option.value, option)
  if (!props.multiple) closedTerm.value = searchTerm.value
  typed.value = false
  if (props.multiple) {
    model.value = toggleValue(selectedValues.value, option.value)
    query.value = ''
    inputRef.value?.focus()
  } else {
    model.value = option.value
    // This path does not go through the closing function, so the pending search has to be
    // cancelled here as well; otherwise the last keystroke would fire its request after the
    // panel had closed. The paging lock goes for the same reason: a page still on its way when
    // the panel shut would otherwise freeze it on the next opening.
    cancelSearch()
    infiniteScroll.reset()
    // The label is taken from the option just chosen and not by reading the value back.
    query.value = option.label
    open.value = false
    activeIndex.value = -1
  }
}

function removeValue(value: ItemValue) {
  if (!props.multiple || props.readonly) return
  model.value = selectedValues.value.filter((v) => v !== value)
  inputRef.value?.focus()
}

/**
 * The clear cross was pressed. The field has already emptied the text it holds; what is left to
 * empty is the selection itself; the single value, or all the chips.
 */
function onClear() {
  model.value = props.multiple ? [] : ''
  typed.value = false
  // The list may still be open (a pointer press on the cross does not close it): the
  // highlight is moved to the first option rather than dropped, or Enter would do nothing.
  activeIndex.value = open.value ? filtered.value.findIndex((o) => !o.disabled) : -1
  emit('clear')
}

// @keyboard
function move(delta: number) {
  const list = filtered.value
  if (list.length === 0) return
  // From "nothing highlighted" the first step lands on an END of the list: starting at -1,
  // a step back would stop on the second-to-last option.
  let i = activeIndex.value < 0 && delta < 0 ? 0 : activeIndex.value
  for (let step = 0; step < list.length; step++) {
    i = (i + delta + list.length) % list.length
    if (!list[i]?.disabled) break
  }
  activeIndex.value = i
}

// @keyboard @a11y
// Naming the current option and never the focus itself, which stays in the field throughout;
// Backspace on an empty field takes back the last chip, the usual gesture in a field holding
// several values.
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
      // Consumed only when it closes the list, so a surrounding VDialog stays open; on a
      // closed list it is left to go on and close the dialog.
      if (open.value) {
        event.preventDefault()
        closePanel()
      }
      break
    case 'Tab':
      closePanel()
      break
    case 'Backspace':
      if (props.multiple && !query.value) {
        const last = selectedValues.value.at(-1)
        if (last !== undefined) removeValue(last)
      }
      break
  }
}

defineExpose({
  /** Moves the focus to the search field. */
  focus: (options?: FocusOptions) => inputRef.value?.focus(options),
  /** Selects what has been typed in the search field. */
  select: () => inputRef.value?.select(),
  /** The real `<input>` behind the field, for what neither of the two above covers. */
  el: computed(() => inputRef.value?.el ?? null),
})
</script>

<template>
  <div
    ref="rootEl"
    class="v-combobox"
    :class="rootClass"
    :style="[{ '--chip-height': chipScale.height }, rootStyle]"
    :data-size="resolvedSize"
    :data-compact="resolvedCompact ? '' : undefined"
    :data-multiple="multiple ? '' : undefined"
    :data-collapsed="collapsed ? '' : undefined"
    :data-open="open ? '' : undefined"
    @focusout="onFocusout"
  >
    <div class="v-combobox-control" @mousedown="onControlMousedown" @click="onControlClick">
      <!--
        The two arrangements VInput offers a field holding chips: its end controls lifted out of
        the flow, always; the chevron and the cross stay put whether or not the input has folded
        away; and the chips wrapping, when there are chips at all. A text display keeps the
        field on one line and needs only the first.
      -->
      <VInput
        ref="inputRef"
        v-model="query"
        class="v-input-end-pinned"
        :class="{ 'v-input-chips': multiple && !textDisplay }"
        role="combobox"
        aria-haspopup="listbox"
        aria-autocomplete="list"
        :aria-expanded="open"
        :aria-controls="optionsId"
        v-bind="fieldAttrs"
        :label="label"
        :hint="hint"
        :error="error"
        :size="resolvedSize"
        :compact="resolvedCompact"
        :invalid="invalid"
        :disabled="resolvedDisabled"
        :readonly="readonly"
        :icon-start="iconStart"
        :icon-start-label="iconStartLabel"
        :clearable="clearable"
        :clear-visible="clearVisible"
        :clear-label="resolvedClearLabel"
        :placeholder="selectedValues.length === 0 ? placeholder : undefined"
        :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="focused = false"
        @clear="onClear"
      >
        <template v-if="multiple || $slots.start" #start>
          <span v-if="displayText" class="v-combobox-text">{{ displayText }}</span>
          <!-- A box of its own beside the line rather than the end of it: the labels are what
               the ellipsis cuts, and the count of what they do not show must survive it. -->
          <span v-if="textDisplay && overflowCount > 0" class="v-combobox-overflow">
            <slot
              name="overflow"
              :count="overflowCount"
              :size="chipScale.size"
              :compact="chipScale.compact"
              >{{ resolvedOverflowText }}</slot
            >
          </span>
          <template v-for="value in multiple && !textDisplay ? visibleValues : []" :key="value">
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
                :dismissible="!readonly && !resolvedDisabled"
                :dismiss-label="m.common.remove(labelOf(value))"
                :disabled="resolvedDisabled"
                @dismiss="removeValue(value)"
                >{{ labelOf(value) }}</VChip
              >
            </slot>
          </template>
          <!-- Not wrapped, unlike the text display's counter: a box around an inline-flex chip
               opens a line box, whose strut makes the field taller than its chips. Neutral
               and not dismissible, so it reads as a summary rather than one more value. -->
          <slot
            v-if="multiple && !textDisplay && overflowCount > 0"
            name="overflow"
            :count="overflowCount"
            :size="chipScale.size"
            :compact="chipScale.compact"
          >
            <VChip
              class="v-combobox-overflow-chip"
              tone="neutral"
              :size="chipScale.size"
              :compact="chipScale.compact"
              :disabled="resolvedDisabled"
              >{{ resolvedOverflowText }}</VChip
            >
          </slot>
          <slot name="start" />
        </template>

        <template v-if="$slots['value-end']" #value-end><slot name="value-end" /></template>

        <!--
          The chevron sits at the end of the field and turns as the panel opens; the clear cross
          is rendered by the field itself, to its left. While loading, the spinner takes EXACTLY
          the chevron's place; the field gives a spinner among its direct children the size of
          an icon; so nothing shifts.
        -->
        <template v-if="loading || !hideExpandIcon" #end>
          <VSpinner v-if="loading" class="v-combobox-spinner v-input-icon-end" aria-hidden="true" />
          <VIcon
            v-else
            v-bind="iconProps(expandIcon)"
            class="v-combobox-chevron v-input-icon-end"
            aria-hidden="true"
          />
        </template>
      </VInput>
    </div>

    <!--
      The panel itself carries both the listbox role and the scrolling. That single fact is what
      the observer watching for the end of the list and the scrolling of the highlighted option
      both rely on: inserting any wrapper between them breaks the two at once.
    -->
    <VPopover
      :id="optionsId"
      ref="panelRef"
      v-model:open="open"
      mode="manual"
      anchor="--combobox-anchor"
      match-trigger
      :placement="placement"
      role="listbox"
      class="v-combobox-panel v-control"
      :data-size="resolvedSize"
      :data-compact="resolvedCompact ? '' : undefined"
      :aria-multiselectable="multiple ? 'true' : undefined"
      :data-virtual="virtual ? '' : undefined"
      @mousedown="onPanelMousedown"
    >
      <!-- Blocks and separators exist for the eye alone: the keyboard counts through the
           flat list of surviving options and therefore never encounters one. -->
      <template v-for="block in blocks" :key="block.key">
        <div
          v-if="block.kind === 'spacer'"
          class="v-combobox-spacer"
          aria-hidden="true"
          :style="{ blockSize: `${block.size}px` }"
        />

        <VComboboxSeparator
          v-else-if="block.kind === 'separator'"
          :ref="virtual ? (el) => measureRow(el, block.at) : undefined"
        />

        <VComboboxGroup
          v-else-if="block.kind === 'group'"
          :label="block.label"
          :label-id="block.labelId"
        >
          <template v-for="child in block.children" :key="child.key">
            <div
              v-if="child.kind === 'spacer'"
              class="v-combobox-spacer"
              aria-hidden="true"
              :style="{ blockSize: `${child.size}px` }"
            />
            <span
              v-else-if="child.kind === 'heading'"
              :id="child.id"
              :ref="virtual ? (el) => measureRow(el, child.at) : undefined"
              class="v-combobox-group-label"
              >{{ child.label }}</span
            >
            <VComboboxOption
              v-else-if="child.kind === 'option'"
              :ref="virtual ? (el) => measureRow(el, child.at) : undefined"
              v-bind="child.row"
              @select="select(child.option)"
              @pointermove="hover(child)"
            >
              <slot name="option" v-bind="child.slot">{{ child.option.label }}</slot>
            </VComboboxOption>
          </template>
        </VComboboxGroup>

        <VComboboxOption
          v-else-if="block.kind === 'option'"
          :ref="virtual ? (el) => measureRow(el, block.at) : undefined"
          v-bind="block.row"
          @select="select(block.option)"
          @pointermove="hover(block)"
        >
          <slot name="option" v-bind="block.slot">{{ block.option.label }}</slot>
        </VComboboxOption>
      </template>

      <!--
        The order matters: loading is checked before emptiness, so that a panel waiting for an
        answer never claims there is no result. Both are hidden from screen readers, and that is
        not an oversight.
      -->
      <div v-if="loading && filtered.length === 0" class="v-combobox-state" aria-hidden="true">
        <slot name="loading">
          <VSpinner :label="resolvedLoadingText" />
          <span>{{ resolvedLoadingText }}</span>
        </slot>
      </div>
      <div v-else-if="filtered.length === 0" class="v-combobox-state" aria-hidden="true">
        <slot name="empty" :query="searchTerm">
          <VEmptyState
            size="sm"
            class="v-combobox-empty"
            :icon="searchTerm ? searchOffIcon : inboxIcon"
            :title="resolvedEmptyText"
          />
        </slot>
      </div>

      <!--
        It has to stay a SINGLE element: rendering the spinner conditionally in its place would
        destroy the marker and silently cancel the observation, and no further page would ever
        be asked for.
      -->
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
    /*
     * It is declared on the root because that is the common ancestor of the field and the
     * panel; a panel drawn above the page remains a descendant of it in the document.
     */
    anchor-scope: --combobox-anchor;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  .v-combobox-control {
    display: block;
  }

  /*
   * The anchor is the FIELD's box and not this wrapper's, which also holds the label and the
   * hint: anchored to the wrapper, the panel opens a hint's height below the field, and a
   * label's height above it once there is no room below and `flip-block` turns it over. Against
   * the field it covers whichever of the two it lands on, which a panel belonging to a control
   * is supposed to do.
   */
  .v-combobox-control .v-input-field {
    anchor-name: --combobox-anchor;
  }

  /*
   * The panel comes from VPopover, which brings the floating element, its open state, its
   * anchoring, its placement and its surface. It also carries the shared size class, so the
   * options and the state rows read their dimensions from it with no size table here.
   */
  .v-combobox-panel {
    max-block-size: var(--vectis-control-size-combobox-list-max-block);
    overflow: auto;
  }

  /* The virtual mode corrects the scroll itself when a row above the view changes height. */
  .v-combobox-panel[data-virtual] {
    overflow-anchor: none;
  }

  .v-combobox-spacer {
    flex: none;
  }

  /*
   * The chevron and the clear cross are pinned to the end of the field by VInput's
   * `.v-input-end-pinned`, which also reserves their room. The chevron and the spinner take
   * turns in the same place and occupy the same box; the field gives a spinner among its direct
   * children the size of an icon; so swapping one for the other shifts nothing.
   */
  .v-combobox-chevron,
  .v-combobox-spinner {
    color: var(--vectis-color-text-muted);
  }

  .v-combobox-chevron {
    transition: rotate var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-combobox[data-open] .v-combobox-chevron {
    rotate: 180deg;
  }

  /*
   * It remains in the page and remains focusable; clicking the field or tabbing into it brings
   * it straight back, the folded state ending as soon as it has the focus.
   */
  .v-combobox[data-collapsed] .v-input-control {
    position: absolute;
    width: 0;
    height: 0;
    padding: 0;
  }

  /*
   * Under the focus the two share the row, and the line is capped at half of it so that a long
   * selection cannot squeeze what is being typed down to nothing. Folded, the input is out of
   * the flow and the line takes the whole field.
   */
  .v-combobox-text {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v-combobox:not([data-collapsed]) .v-combobox-text {
    max-inline-size: 50%;
  }

  /* The "+X" after a line of text never shrinks: the line gives way instead. */
  .v-combobox-overflow {
    flex: none;
    white-space: nowrap;
    color: var(--vectis-color-text-muted);
  }

  /*
   * An unbroken line has the whole of its text as its min-content width, and that width travels
   * up through the field to the root. In a grid track or a flex row sized `auto`, the component
   * then widens its container to fit every label instead of cutting them short, and the
   * ellipsis never shows.
   */
  .v-combobox:has(.v-combobox-text) {
    min-inline-size: 0;
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

  /*
   * The default empty state spans the panel. `[data-size]` lifts the selector above VEmptyState's
   * own size rules, whose sheet may load after this one.
   */
  .v-combobox-state > .v-combobox-empty[data-size] {
    flex: 1;
    padding-block: var(--vectis-space-3);
    padding-inline: 0;
  }

  /*
   * The foot of the list: the marker watched for the end, and the place the next-page spinner
   * appears. It is given a real height on purpose; a box of no height at all makes the crossing
   * it is watched for unreliable.
   */
  .v-combobox-more {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    min-height: var(--vectis-control-height-xs);
    color: var(--vectis-color-text-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-combobox-chevron {
      transition: none;
    }
  }
}
</style>
