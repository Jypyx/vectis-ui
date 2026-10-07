<script setup lang="ts">
// @keyboard @a11y @core
/**
 * Keep DOM focus on the field and move aria-activedescendant through options. JavaScript
 * supplies filtering, selection and keyboard navigation unavailable to native text inputs.
 */

import { computed, inject, ref, useId, watch } from 'vue'

import VEmptyState from '../VEmptyState/VEmptyState.vue'
import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import { inbox as inboxIcon } from '../VIcon/icons/inbox'
import { search_off as searchOffIcon } from '../VIcon/icons/search_off'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VListboxChevron from '../VListbox/VListboxChevron.vue'
import VListboxPanel from '../VListbox/VListboxPanel.vue'
import VListboxValues from '../VListbox/VListboxValues.vue'
import VSpinner from '../VSpinner/VSpinner.vue'

import { toggleValue } from '../../utils/array'
import type {
  ItemValue,
  ListboxGroup,
  ListboxItem,
  ListboxChipSlotProps,
  ListboxOption,
  ListboxOptionSlotProps,
  ListboxOverflowSlotProps,
  ListboxSeparator,
} from '../../types'
import { inputGroupKey } from '../VInput/context'

import { chipScaleFor } from '../../utils/chip'
import { createNormalizedCache, normalizeText } from '../../utils/text'

import { useControlShape } from '../../composables/useControlShape'
import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFocusoutDismiss } from '../../composables/useFocusoutDismiss'
import { useInfiniteScroll } from '../../composables/useInfiniteScroll'
import { selectionOf, useListbox } from '../../composables/useListbox'

import { canClear } from '../../composables/useClearable'
import { iconStartListener } from '../../composables/useIconClickHandlers'

import { useDebouncedSearch } from '../../composables/useDebouncedSearch'
import { useMessages } from '../../i18n/state'

/** One thing that can be chosen. */
export type ComboboxOption = ListboxOption

/**
 * A named block of options, the equivalent of the grouping a native list offers. A
 * group none of whose options survive the search disappears entirely, its name
 * included.
 */
export type ComboboxGroup = ListboxGroup

/**
 * A rule drawn between two blocks of options. It is purely decorative, and a separator the
 * search leaves stranded (at the top, at the bottom, or against another one) is simply not
 * drawn.
 */
export type ComboboxSeparator = ListboxSeparator

/** Anything the list may hold: an option, a named block, or a separator. */
export type ComboboxItem = ListboxItem

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
export type ComboboxOptionSlotProps = ListboxOptionSlotProps

/** What the `#chip` slot receives. */
export type ComboboxChipSlotProps = ListboxChipSlotProps

/** What the `#overflow` slot receives. */
export type ComboboxOverflowSlotProps = ListboxOverflowSlotProps

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
const focused = ref(false)
// The text in the field serves two purposes at once: it SHOWS the chosen label when a single
// value is picked, and it is what one searches with. This flag tells the two apart; while it is
// false the text is merely a label and narrows nothing, so reopening the panel offers the whole
// list again.
const typed = ref(false)

const selectedValues = computed(() => selectionOf(model.value, props.multiple))

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

const panelRef = ref<InstanceType<typeof VListboxPanel> | null>(null)

const {
  allOptions,
  visible: filtered,
  optionOf,
  labelOf,
  remember,
  activeIndex,
  optionId,
  highlightFirst,
  highlightSelected,
  move,
  hover,
  blocks,
  measureRow,
} = useListbox({
  items: () => props.options,
  filter: (list) => {
    const matcher = props.filter
    if (matcher === false) return list
    const q = closedTerm.value ?? searchTerm.value
    if (!q) return list
    if (typeof matcher === 'function') return list.filter((o) => matcher(o, q))
    const needle = normalizeText(q)
    return list.filter((o) => normalizedLabelOf(o).includes(needle))
  },
  selected: () => selectedValues.value,
  open: () => open.value,
  id: optionsId,
  panelEl: () => panelRef.value?.el ?? null,
  virtual: () => props.virtual,
  hasMore: () => props.hasMore,
  size: () => resolvedSize.value,
  compact: () => resolvedCompact.value,
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

const { request: emitSearch, cancel: cancelSearch } = useDebouncedSearch({
  delay: () => props.searchDebounce,
  active: () => open.value,
  report: (term) => emit('search', term),
})

watch(searchTerm, (term) => {
  if (!open.value) return
  // A new search means a new list, so the highlight cannot survive it: with an outside source
  // the options are replaced wholesale, and the old position would name a completely unrelated
  // option. It is moved to the first available option rather than dropped altogether, and that
  // matters when the filtering is left to the source: the visible list keeps the very same
  // reference until the answer arrives, so the watcher below would never fire and Enter would
  // do nothing in the meantime.
  highlightFirst()
  // The page asked for under the previous term will never arrive, and the first page of the new
  // one may be exactly as long as the list it replaces; which the paging would not recognise as
  // an arrival.
  infiniteScroll.restart()
  emitSearch(term)
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

// The field cannot work that out for itself, since the chips live outside its value, so the
// answer is given to it explicitly, and the room for the cross is reserved accordingly.
const clearVisible = computed(() =>
  canClear(
    props,
    resolvedDisabled.value,
    selectedValues.value.length > 0 || query.value.length > 0,
  ),
)

// The single cut-off point of a frozen field: every route into the list; a click on the
// control, the focus, a keystroke, typing; ends up here, so `readonly` is refused once rather
// than guarded in each handler.
function openPanel() {
  if (resolvedDisabled.value || props.readonly || open.value) return
  closedTerm.value = null
  open.value = true
  highlightSelected()
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

/**
 * Closes the list. The field then shows `label`: the chosen value's, unless the caller passes the
 * label of the option it has just chosen, which the value read back may not yet carry.
 */
function closePanel(label = singleLabel()) {
  if (!open.value) return
  cancelSearch()
  // A page that never arrived; a request that failed; must not leave the paging frozen for
  // good, so the lock is released here.
  infiniteScroll.reset()
  closedTerm.value = searchTerm.value
  open.value = false
  activeIndex.value = -1
  typed.value = false
  query.value = label
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
const onFocusout = useFocusoutDismiss(rootEl, () => closePanel())

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
  remember(option)
  if (props.multiple) {
    typed.value = false
    model.value = toggleValue(selectedValues.value, option.value)
    query.value = ''
    inputRef.value?.focus()
  } else {
    model.value = option.value
    closePanel(option.label)
  }
}

function removeValue(value: ItemValue) {
  if (!props.multiple || props.readonly || resolvedDisabled.value) return
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
  if (open.value) highlightFirst()
  else activeIndex.value = -1
  emit('clear')
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
          <VListboxValues
            v-if="multiple"
            :values="selectedValues"
            :display="display"
            :max="max"
            :collapsed="collapsed"
            :overflow-text="overflowText"
            :scale="chipScale"
            :removable="!readonly"
            :disabled="resolvedDisabled"
            :label-of="labelOf"
            :option-of="optionOf"
            @remove="removeValue"
          >
            <template v-if="$slots.chip" #chip="chipProps">
              <slot name="chip" v-bind="chipProps" />
            </template>
            <template v-if="$slots.overflow" #overflow="overflowProps">
              <slot name="overflow" v-bind="overflowProps" />
            </template>
          </VListboxValues>
          <slot name="start" />
        </template>

        <template v-if="$slots['value-end']" #value-end><slot name="value-end" /></template>

        <!--
          The chevron sits at the end of the field and turns as the panel opens; the clear cross
          is rendered by the field itself, to its left. While loading, the spinner takes EXACTLY
          the chevron's place; the field gives a spinner among its direct children the size of
          an icon; so nothing shifts.
        -->
        <template #end>
          <VSpinner v-if="loading" class="v-combobox-spinner v-input-icon-end" aria-hidden="true" />
          <VListboxChevron v-else class="v-combobox-chevron" :icon="expandIcon" :open="open" />
        </template>
      </VInput>
    </div>

    <VListboxPanel
      :id="optionsId"
      ref="panelRef"
      v-model:open="open"
      anchor="--combobox-anchor"
      :placement="placement"
      class="v-combobox-panel"
      :size="resolvedSize"
      :compact="resolvedCompact"
      :multiple="multiple"
      :virtual="virtual"
      :blocks="blocks"
      :measure="measureRow"
      @select="select"
      @highlight="hover"
    >
      <template v-if="$slots.option" #option="slotProps">
        <slot name="option" v-bind="slotProps" />
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
    </VListboxPanel>

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

  .v-combobox-panel {
    max-block-size: var(--vectis-control-size-combobox-list-max-block);
  }

  /*
   * The chevron and the clear cross are pinned to the end of the field by VInput's
   * `.v-input-end-pinned`, which also reserves their room. The chevron and the spinner take
   * turns in the same place and occupy the same box; the field gives a spinner among its direct
   * children the size of an icon; so swapping one for the other shifts nothing.
   */
  .v-combobox-spinner {
    color: var(--vectis-color-text-muted);
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
  .v-combobox:not([data-collapsed]) .v-listbox-text {
    max-inline-size: 50%;
  }

  /*
   * An unbroken line has the whole of its text as its min-content width, and that width travels
   * up through the field to the root. In a grid track or a flex row sized `auto`, the component
   * then widens its container to fit every label instead of cutting them short, and the
   * ellipsis never shows.
   */
  .v-combobox:has(.v-listbox-text) {
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
