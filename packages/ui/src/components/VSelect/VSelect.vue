<script setup lang="ts">
// @a11y @keyboard @core
/**
 * A select-only combobox: a native button keeps DOM focus and moves aria-activedescendant through
 * the options, since a native `<select>` cannot draw its list with the design system on every
 * engine. A hidden native `<select>` carries the value into forms, with its constraint
 * validation, autofill and reset.
 */

import { computed, inject, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import { inputGroupKey } from '../VInput/context'
import VListboxChevron from '../VListbox/VListboxChevron.vue'
import VListboxPanel from '../VListbox/VListboxPanel.vue'
import VListboxValues from '../VListbox/VListboxValues.vue'

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
import { toggleValue } from '../../utils/array'
import { chipScaleFor } from '../../utils/chip'
import { createNormalizedCache, normalizeText } from '../../utils/text'

import { canClear } from '../../composables/useClearable'
import { useControlShape } from '../../composables/useControlShape'
import { useFocusoutDismiss } from '../../composables/useFocusoutDismiss'
import { iconStartListener } from '../../composables/useIconClickHandlers'
import { selectionOf, useListbox } from '../../composables/useListbox'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useTimer } from '../../composables/useTimer'
import { useMessages } from '../../i18n/state'

/** One thing that can be chosen. */
export type SelectOption = ListboxOption

/** A named block of options, the equivalent of a native `<optgroup>`. */
export type SelectGroup = ListboxGroup

/** A rule drawn between two blocks of options, purely decorative. */
export type SelectSeparator = ListboxSeparator

/** Anything the list may hold: an option, a named block, or a separator. */
export type SelectItem = ListboxItem

/** Where the list opens relative to the field. */
export type SelectPlacement =
  'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

/** The height of the field: 32, 40 or 48 pixels. */
export type SelectSize = 'sm' | 'md' | 'lg'

/**
 * How the chosen values are shown in a multiple field: one chip each, or their labels
 * joined by commas.
 */
export type SelectDisplay = 'chip' | 'text'

/** What the `#option` slot receives. */
export type SelectOptionSlotProps = ListboxOptionSlotProps

/** What the `#chip` slot receives. */
export type SelectChipSlotProps = ListboxChipSlotProps

/** What the `#overflow` slot receives. */
export type SelectOverflowSlotProps = ListboxOverflowSlotProps

interface SelectProps {
  /**
   * What the list offers. An entry may be an option, a named block of options, or a
   * separator; a plain list of options remains perfectly valid.
   */
  options: SelectItem[]
  /**
   * Allows several values to be chosen, which makes the value a list and shows what has been
   * chosen inside the field, as chips or as text depending on `display`. The list then stays
   * open while options are toggled.
   */
  multiple?: boolean
  /**
   * How the chosen values are shown when several can be chosen: one dismissible chip each, or
   * their labels joined by commas on a single line, cut short with an ellipsis when they run
   * out of room.
   */
  display?: SelectDisplay
  /**
   * How many chosen values to show while the field is not focused, before the rest are summed
   * up as "+X". Left out, or set to 0, every value is shown.
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
  size?: SelectSize
  /** Takes 4px off the height, as everywhere else in the design system. */
  compact?: boolean
  /** What the field says while nothing is chosen. */
  placeholder?: string
  /** Makes the field unusable, greyed out through the colour tokens. Its value is not submitted. */
  disabled?: boolean
  /**
   * Shows what has been chosen without letting it be changed: the field stays focusable and its
   * value is submitted, but the list never opens, the chips lose their crosses and no clear
   * cross is offered.
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
  /** Offers a cross that empties the selection. */
  clearable?: boolean
  /** What that cross does, in words. It falls back to the design system dictionary. */
  clearLabel?: string
  /** Where the list opens relative to the field. */
  placement?: SelectPlacement
}

const props = withDefaults(defineProps<SelectProps>(), {
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
  placement: 'bottom-start',
})

const m = useMessages()
const resolvedClearLabel = computed(() => props.clearLabel ?? m.value.select.clear)

const emit = defineEmits<{
  /** The clear cross emptied the selection. */
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
  option?(props: SelectOptionSlotProps): unknown
  /** Replaces the chip standing for one chosen value. */
  chip?(props: SelectChipSlotProps): unknown
  /** Replaces the "+X" standing for the values beyond `max`. */
  overflow?(props: SelectOverflowSlotProps): unknown
}>()

const group = inject(inputGroupKey, null)
const {
  size: resolvedSize,
  compact: resolvedCompact,
  disabled: resolvedDisabled,
} = useControlShape(props, group)

const chipScale = computed(() => chipScaleFor(resolvedSize.value, resolvedCompact.value))

/** The chosen option's `value`, `''` while nothing is chosen, or the list of them when `multiple` is set. */
const model = defineModel<ItemValue | ItemValue[]>({ default: '' })

// `class` and `style` stay on the wrapper; the form attributes go to the hidden `<select>`, which
// is what a form reads; everything else goes down to the button, the element assistive
// technology treats as the combobox.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const NATIVE_ONLY = ['name', 'form', 'required', 'autocomplete']
// Reading every key even when absent keeps the split in step with the attributes.
const split = computed(() => {
  const native: Record<string, unknown> = {}
  const field: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(forwardedAttrs.value)) {
    ;(NATIVE_ONLY.includes(key) ? native : field)[key] = value
  }
  return { native, field }
})
const nativeAttrs = computed(() => split.value.native)

// @a11y
// `required` is not an attribute of a button: the combobox says it through ARIA instead.
const required = computed(() => {
  const value = nativeAttrs.value.required
  return value !== undefined && value !== false
})

// Declared as this component's own event, `click:icon-start` is out of `$attrs`, so the
// listener is relayed to the field by hand; and only when the consumer wrote one.
const iconStartClick = iconStartListener((event) => emit('click:icon-start', event))
const fieldAttrs = computed(() => ({ ...split.value.field, ...iconStartClick }))

const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLButtonElement | null>(null)
const nativeEl = ref<HTMLSelectElement | null>(null)
const panelRef = ref<InstanceType<typeof VListboxPanel> | null>(null)
const optionsId = useId()

const open = ref(false)
const focused = ref(false)

const selectedValues = computed(() => selectionOf(model.value, props.multiple))

const {
  allOptions,
  visible,
  optionOf,
  labelOf,
  remember,
  activeIndex,
  optionId,
  highlightFirst,
  highlightLast,
  highlightSelected,
  move,
  page,
  hover,
  blocks,
  measureRow,
} = useListbox({
  items: () => props.options,
  selected: () => selectedValues.value,
  open: () => open.value,
  id: optionsId,
  panelEl: () => panelRef.value?.el ?? null,
  virtual: () => false,
  size: () => resolvedSize.value,
  compact: () => resolvedCompact.value,
})

// @a11y
// What the button says, which assistive technology reads as the combobox's value: the chosen
// label, or every chosen label when the chips beside it show them.
const valueText = computed(() => selectedValues.value.map(labelOf).join(', '))

const textDisplay = computed(() => props.multiple && props.display === 'text')

// Folded, the values beyond `max` are summed up; under the focus, every value is there to be
// seen and taken back.
const collapsed = computed(() => props.multiple && !focused.value && !open.value)

const clearVisible = computed(() =>
  canClear(props, resolvedDisabled.value, selectedValues.value.length > 0),
)

/** Whether the hidden `<select>` failed validation since the value last changed. */
const nativeInvalid = ref(false)

function openPanel() {
  if (resolvedDisabled.value || props.readonly || open.value) return
  open.value = true
  highlightSelected()
}

function closePanel() {
  if (!open.value) return
  open.value = false
  activeIndex.value = -1
}

function togglePanel() {
  if (open.value) closePanel()
  else openPanel()
}

const onFocusout = useFocusoutDismiss(rootEl, () => {
  focused.value = false
  closePanel()
})

function choose(option: SelectOption) {
  if (option.disabled || props.readonly || resolvedDisabled.value) return
  remember(option)
  if (props.multiple) {
    model.value = toggleValue(selectedValues.value, option.value)
  } else {
    // Choosing the option already chosen (Tab without moving, for one) changes nothing.
    if (model.value !== option.value) model.value = option.value
    closePanel()
  }
}

function chooseActive() {
  const option = visible.value[activeIndex.value]
  if (option) choose(option)
}

function removeValue(value: ItemValue) {
  if (!props.multiple || props.readonly || resolvedDisabled.value) return
  model.value = selectedValues.value.filter((v) => v !== value)
  // The cross disappears along with its chip, so the focus would fall back to the page.
  triggerEl.value?.focus()
}

/** The cross was pressed. It disappears with the selection, so the focus goes back to the button. */
function onClear() {
  model.value = props.multiple ? [] : ''
  triggerEl.value?.focus()
  emit('clear')
}

const normalizedOf = createNormalizedCache<SelectOption>()
let typed = ''
const typeTimer = useTimer()

// @keyboard
/*
 * Typing a label's first letters highlights it, as a native list does: the letters typed within
 * half a second add up to a prefix, and the same letter repeated cycles through the options it
 * starts.
 */
function typeahead(key: string) {
  typed += normalizeText(key)
  typeTimer.start(() => (typed = ''), 500)
  const list = visible.value
  if (list.length === 0) return
  const cycling = [...typed].every((char) => char === typed[0])
  const needle = cycling ? typed[0]! : typed
  // A new prefix may match the highlighted option itself; a cycle moves on from it.
  const from = activeIndex.value + (typed.length === 1 || cycling ? 1 : 0)
  for (let step = 0; step < list.length; step++) {
    const index = (Math.max(from, 0) + step) % list.length
    const option = list[index]!
    if (!option.disabled && normalizedOf(option, option.label).startsWith(needle)) {
      activeIndex.value = index
      return
    }
  }
}

const printable = (event: KeyboardEvent) =>
  event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey

// @keyboard
// The keys of the select-only combobox pattern. Enter and Space are consumed on the closed button
// too, so the click they would synthesise does not toggle the list a second time.
function onKeydown(event: KeyboardEvent) {
  if (!open.value) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        event.preventDefault()
        openPanel()
        return
      case 'Home':
        event.preventDefault()
        openPanel()
        if (open.value) highlightFirst()
        return
      case 'End':
        event.preventDefault()
        openPanel()
        if (open.value) highlightLast()
        return
    }
    if (printable(event)) {
      openPanel()
      if (open.value) typeahead(event.key)
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (event.altKey) {
        chooseActive()
        closePanel()
      } else move(-1)
      break
    case 'Home':
      event.preventDefault()
      highlightFirst()
      break
    case 'End':
      event.preventDefault()
      highlightLast()
      break
    case 'PageDown':
      event.preventDefault()
      page(10)
      break
    case 'PageUp':
      event.preventDefault()
      page(-10)
      break
    case ' ':
      event.preventDefault()
      // While letters are being typed, a space belongs to the prefix: "New York".
      if (typed) typeahead(' ')
      else chooseActive()
      break
    case 'Enter':
      event.preventDefault()
      chooseActive()
      break
    case 'Escape':
      // Consumed only when it closes the list, so a surrounding VDialog stays open.
      event.preventDefault()
      closePanel()
      break
    case 'Tab':
      // Leaving a single list takes the highlighted option, as the pattern prescribes.
      if (!props.multiple) chooseActive()
      closePanel()
      break
    default:
      if (printable(event)) typeahead(event.key)
  }
}

const interactive = 'a, button, input, select, textarea, [tabindex]'

// @core
/*
 * The rest of the field is not focusable, so pressing it would hand the focus to the page: the
 * root's `focusout` then closes the list, and the click that follows reopens it.
 */
function onControlMousedown(event: MouseEvent) {
  const target = event.target as Element
  if (target.closest('.v-input-field') && !target.closest(interactive)) event.preventDefault()
}

/**
 * A click anywhere in the box of the field toggles the list, as one on the button does. The
 * field's own controls keep their clicks, and the label's reaches the button by itself.
 */
function onControlClick(event: MouseEvent) {
  const target = event.target as Element
  if (resolvedDisabled.value || !target.closest('.v-input-field') || target.closest(interactive))
    return
  triggerEl.value?.focus()
  togglePanel()
}

/*
 * The hidden `<select>` is written by hand rather than through `selected` bindings: a form reset
 * changes it behind the virtual DOM's back, which would then consider unchanged options already
 * in the right state.
 */
function syncNative() {
  const el = nativeEl.value
  if (!el) return
  for (const option of el.options) {
    option.selected = option.value !== '' && wantedValues.value.has(option.value)
  }
  if (!props.multiple && selectedValues.value.length === 0) el.value = ''
}

const wantedValues = computed(() => new Set(selectedValues.value.map(String)))

watch([selectedValues, allOptions], syncNative, { flush: 'post' })

// A choice that satisfies the constraint clears the error the last submission raised; one that
// does not raises it again, `checkValidity` firing `invalid`.
watch(
  selectedValues,
  () => {
    if (nativeInvalid.value) nativeInvalid.value = !nativeEl.value?.checkValidity()
  },
  { flush: 'post' },
)

/** Autofill writes the hidden `<select>`; the strings it holds are read back as option values. */
function onNativeChange() {
  const el = nativeEl.value
  if (!el) return
  const values = [...el.selectedOptions]
    .map((native) => allOptions.value.find((option) => String(option.value) === native.value))
    .filter((option): option is SelectOption => option !== undefined)
    .map((option) => option.value)
  model.value = props.multiple ? values : (values[0] ?? '')
}

// @core
// A form reset restores the value the field was created with. The browser resets the hidden
// `<select>` after the event, so it is rewritten on the next task.
let initial: ItemValue | ItemValue[] = ''
let formEl: HTMLFormElement | null = null

function onFormReset() {
  model.value = Array.isArray(initial) ? [...initial] : initial
  nativeInvalid.value = false
  setTimeout(syncNative)
}

onMounted(() => {
  initial = Array.isArray(model.value) ? [...model.value] : model.value
  syncNative()
  formEl = nativeEl.value?.form ?? null
  formEl?.addEventListener('reset', onFormReset)
})

onBeforeUnmount(() => formEl?.removeEventListener('reset', onFormReset))

defineExpose({
  /** Moves the focus to the field. */
  focus: (options?: FocusOptions) => triggerEl.value?.focus(options),
  /** The button that acts as the combobox. */
  el: triggerEl,
})
</script>

<template>
  <div
    ref="rootEl"
    class="v-select"
    :class="rootClass"
    :style="[{ '--chip-height': chipScale.height }, rootStyle]"
    :data-size="resolvedSize"
    :data-multiple="multiple ? '' : undefined"
    :data-open="open ? '' : undefined"
    @focusin="focused = true"
    @focusout="onFocusout"
  >
    <div class="v-select-control" @mousedown="onControlMousedown" @click="onControlClick">
      <VInput
        class="v-input-end-pinned"
        :class="{ 'v-input-chips': multiple && !textDisplay }"
        v-bind="fieldAttrs"
        :label="label"
        :hint="hint"
        :error="error"
        :size="resolvedSize"
        :compact="resolvedCompact"
        :invalid="invalid || nativeInvalid"
        :disabled="resolvedDisabled"
        :readonly="readonly"
        :icon-start="iconStart"
        :icon-start-label="iconStartLabel"
        :clearable="clearable"
        :clear-visible="clearVisible"
        :clear-label="resolvedClearLabel"
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
            hide-text
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

        <template #control="{ controlProps }">
          <button
            ref="triggerEl"
            type="button"
            role="combobox"
            :aria-expanded="open"
            :aria-controls="optionsId"
            :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
            :aria-required="required || undefined"
            :aria-readonly="readonly || undefined"
            v-bind="controlProps"
            class="v-select-trigger"
            @click="togglePanel"
            @keydown="onKeydown"
          >
            <span
              v-if="valueText"
              class="v-select-value"
              :class="{ 'v-visually-hidden': multiple }"
              >{{ valueText }}</span
            >
            <span v-else-if="placeholder" class="v-select-placeholder">{{ placeholder }}</span>
          </button>
          <!--
            Out of the tab order and hidden from screen readers, it leaves the button as the
            single stop and the single announcement. Its options mirror the flat list: a form
            needs no groups.
          -->
          <select
            ref="nativeEl"
            v-bind="nativeAttrs"
            class="v-select-native v-hidden-input"
            tabindex="-1"
            aria-hidden="true"
            :multiple="multiple || undefined"
            :disabled="resolvedDisabled || undefined"
            @change="onNativeChange"
            @focus="triggerEl?.focus()"
            @invalid="nativeInvalid = true"
          >
            <option v-if="!multiple" value="" />
            <option
              v-for="(option, index) in allOptions"
              :key="index"
              :value="String(option.value)"
              :disabled="option.disabled"
            >
              {{ option.label }}
            </option>
          </select>
        </template>

        <template v-if="$slots['value-end']" #value-end><slot name="value-end" /></template>

        <template #end>
          <VListboxChevron :icon="expandIcon" :open="open" />
        </template>
      </VInput>
    </div>

    <VListboxPanel
      :id="optionsId"
      ref="panelRef"
      v-model:open="open"
      anchor="--select-anchor"
      :placement="placement"
      class="v-select-panel"
      :size="resolvedSize"
      :compact="resolvedCompact"
      :multiple="multiple"
      :blocks="blocks"
      :measure="measureRow"
      @select="choose"
      @highlight="hover"
    >
      <template v-if="$slots.option" #option="slotProps">
        <slot name="option" v-bind="slotProps" />
      </template>
    </VListboxPanel>
  </div>
</template>

<style>
@layer vectis.components {
  .v-select {
    /*
     * Declared on the root, the common ancestor of the field and the panel; a panel drawn above
     * the page remains a descendant of it in the document.
     */
    anchor-scope: --select-anchor;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  .v-select-control {
    display: block;
  }

  /* The panel opens against the box of the field, not against its label and hint. */
  .v-select-control .v-input-field {
    anchor-name: --select-anchor;
  }

  .v-select-panel {
    max-block-size: var(--vectis-control-size-select-list-max-block);
  }

  /*
   * VInput's `.v-input-control` gives the button the input's box: it fills the field and draws
   * no border of its own, the field drawing the focus around it.
   */
  .v-select-trigger {
    display: flex;
    align-items: center;
    text-align: start;
    cursor: pointer;
  }

  /*
   * Beside chips the button takes what is left of the last row, down to nothing, rather than
   * wrapping onto a row of its own.
   */
  .v-select[data-multiple] .v-select-trigger {
    flex: 1 1 0;
  }

  .v-select-value,
  .v-select-placeholder {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v-select-placeholder {
    color: var(--vectis-color-text-subtle);
  }

  /*
   * An unbroken line has the whole of its text as its min-content width; without this, a grid
   * track or a flex row sized `auto` widens to fit every label and the ellipsis never shows.
   */
  .v-select:has(.v-listbox-text) {
    min-inline-size: 0;
  }
}
</style>
