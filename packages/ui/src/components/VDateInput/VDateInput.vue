<script setup lang="ts">
// @a11y @core
/**
 * A field for choosing a date: a VInput, and a VDatePicker in a panel below it.
 *
 * The panel is `mode="manual"` and driven imperatively, which is not a detail — `popovertarget`
 * is invalid on a text `<input>`, and opening it ourselves is also what lets focus be moved
 * INTO the grid so the keyboard lands on the dates. Closing is ours too: `focusout`, or Escape.
 *
 * Two FIELD modes, `mode`: `input` (the default) types digits only, the separators appearing
 * as they go in the order and punctuation of the reader's locale; `picker` makes the calendar
 * the only way in. What the field is FOR is a different question from the `readonly` prop,
 * which freezes whatever it holds by every route at once.
 *
 * That is a different question from WHAT is chosen — one date, a range, or several — which is
 * `selection`, passed straight through to the picker.
 */

import { computed, inject, provide, ref, watchEffect } from 'vue'

import { inputGroupKey } from '../VInput/context'

import VDatePicker from '../VDatePicker/VDatePicker.vue'
import type {
  DatePickerDaySlotProps,
  DatePickerEvent,
  DatePickerSelection,
  DatePickerValue,
  DatePickerMatcher,
  DatePickerRange,
} from '../VDatePicker/VDatePicker.vue'
import {
  compareISO,
  formatDateDisplay,
  formatDisplayRange,
  isDateAllowed,
  isValidISO,
} from '../../utils/date'
import {
  caretAfterDigits,
  dateMaskFor,
  formatDateMask,
  isoToMask,
  maskPlaceholder,
  parseDateMask,
} from './mask'
import { digitsOf } from '../../utils/text'
import { resolveMatcher } from '../../utils/matcher'
import { isDev } from '../../utils/env'
import { hostWarnsKey } from '../../utils/hostWarns'
import { calendar_today as calendarTodayIcon } from '../VIcon/icons/calendar_today'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VPopover from '../VPopover/VPopover.vue'

import { useControlShape } from '../../composables/useControlShape'
import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFieldPanel } from '../../composables/useFieldPanel'
import { canClear } from '../../composables/useClearable'
import { iconStartListener } from '../../composables/useIconClickHandlers'
import { useMaskedField } from '../../composables/useMaskedField'
import { useMessages, useResolvedLocale } from '../../i18n/state'

/** Where the calendar opens relative to the field. */
export type DateInputPlacement =
  'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

/** Whether the field can be typed into, or only filled from the calendar. */
export type DateInputMode = 'picker' | 'input'

/** What the `#footer` slot receives. */
export interface DateInputFooterSlotProps {
  /** Closes the panel and hands the focus back to the field. */
  close: () => void
}

const MODES: DateInputMode[] = ['picker', 'input']

/**
 * The century a two-digit year is expanded into — "10/06/26" becomes 2026 — applied only
 * when the reader leaves the field.
 *
 * It is FIXED and never derived from the current year. A sliding rule would make the
 * component's behaviour depend on when it runs, which is the same objection that keeps
 * today's date out of VDatePicker's setup, and it would give the tests a shelf life.
 */
const YEAR_PIVOT = 2000

const DEFAULT_DISPLAY_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

/** The height of the field: 32, 40 or 48 pixels. */
export type DateInputSize = 'sm' | 'md' | 'lg'

interface DateInputProps {
  // Everything from here to `events` is handed straight to the calendar.
  /** What is being chosen: one date, a period between two, or several separate dates. */
  selection?: DatePickerSelection
  /**
   * A BCP 47 locale, which decides the month and day names, the first day of the week and
   * the order the field is typed in. It TAKES PRECEDENCE over the design system's global
   * locale and falls back to it, which is why it has no literal default: `undefined` has
   * to stay recognizable for the global locale to have its chance.
   */
  locale?: string
  /** Forces the day the weeks start on, from 0 for Sunday to 6 for Saturday. */
  firstDayOfWeek?: number
  /** The earliest date that can be chosen, as an ISO string. */
  min?: string
  /** The latest date that can be chosen, as an ISO string. */
  max?: string
  /** Dates that cannot be chosen, as a list or as a function. */
  disabledDates?: DatePickerMatcher
  /** Fills the corners of the grid with the greyed days of the neighbouring months. */
  showAdjacentDays?: boolean
  /** Lets those neighbouring days be clicked, which implies showing them. */
  selectAdjacentDays?: boolean
  /** Events to mark under the days they fall on. */
  events?: DatePickerEvent[]
  // From here on: the field.
  /**
   * Whether the field can be TYPED into (the default, using the numeric form of the
   * reader's language) or is filled from the calendar alone, which is `picker`.
   *
   * Typing is reserved for choosing a SINGLE date: a period or a list falls back to
   * `picker`, there being no sensible way to type either.
   */
  mode?: DateInputMode
  /**
   * Offers the date picker alongside a field that can be typed into: an icon at the end of
   * the field, and a panel that opens on focus. It means nothing in `picker` mode, where
   * the calendar is already the only way to choose.
   */
  showPicker?: boolean
  /** The label above the field. */
  label?: string
  /** A line of help under the field. */
  hint?: string
  /** What the field says while empty. */
  placeholder?: string
  /** The height of the field: 32, 40 or 48 pixels. */
  size?: DateInputSize
  /** Takes 4px off the height. */
  compact?: boolean
  /** Makes the field unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /**
   * Shows the date without letting it be changed: nothing can be typed, there is no
   * calendar and no clear cross. The field stays focusable and can be copied from,
   * which is what separates it from `disabled`, and it is a different question from
   * `mode`, which says how a field that CAN be changed is filled in.
   */
  readonly?: boolean
  /** Marks the field as invalid, for a rule of your own. */
  invalid?: boolean
  /**
   * An icon inside the field, at the start. It is decorative by default and becomes a
   * real button as soon as a `@click:icon-start` listener is attached, in which case it
   * needs `iconStartLabel`.
   */
  iconStart?: IconSource
  /** What the start icon does, in words, once it is clickable. */
  iconStartLabel?: string
  /**
   * What the calendar button does, in words. It names the button `pickerIcon` renders,
   * and falls back to the design system dictionary.
   */
  pickerIconLabel?: string
  /**
   * Shows a spinner at the end of the field, in place of the calendar icon. It says
   * that something is being loaded and changes nothing else: the field can still be
   * typed into and the panel still opens.
   */
  loading?: boolean
  /**
   * What screen readers announce while the spinner turns. It falls back to the design
   * system dictionary.
   */
  loadingText?: string
  /** Offers a cross that empties the value, shown before the end icon. */
  clearable?: boolean
  /** What that cross does, in words. It falls back to the design system dictionary. */
  clearLabel?: string
  /**
   * The icon that opens the date picker, at the end of the field. The clear cross appears
   * to its left rather than in its place, and no icon is rendered at all when there is no
   * panel to open.
   */
  pickerIcon?: IconSource
  /**
   * How the date is WRITTEN OUT in the field. It has no effect on a field being typed
   * into, which necessarily shows the numeric form one types, so it concerns the
   * `picker` mode, and the period and list selections, which fall back to it.
   */
  displayFormat?: Intl.DateTimeFormatOptions
  /** Where the panel opens relative to the field. */
  placement?: DateInputPlacement
}

const props = withDefaults(defineProps<DateInputProps>(), {
  selection: 'single',
  locale: undefined,
  firstDayOfWeek: undefined,
  min: undefined,
  max: undefined,
  disabledDates: undefined,
  showAdjacentDays: false,
  selectAdjacentDays: false,
  events: undefined,
  // Deliberately left undefined rather than defaulted to the typed mode: that is what
  // distinguishes "the prop was not given" from "the prop was given this value", and
  // therefore what allows warning ONLY the consumer who explicitly asked for something
  // that cannot work.
  mode: undefined,
  showPicker: false,
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  readonly: false,
  invalid: false,
  iconStart: undefined,
  iconStartLabel: undefined,
  pickerIconLabel: undefined,
  loading: false,
  loadingText: undefined,
  clearable: false,
  clearLabel: undefined,
  pickerIcon: () => calendarTodayIcon,
  // Left undefined rather than defaulted to the format object, for the same reason: it is
  // what lets the component notice that a consumer has asked for a display format in a
  // mode where it has no effect, and say so.
  displayFormat: undefined,
  placement: 'bottom-start',
})

/**
 * The date or dates chosen, in the shape `selection` calls for: an ISO `YYYY-MM-DD` string
 * for `single`, a `{ start, end }` pair for `range`, an array for `multiple`. Nothing is
 * selected to begin with.
 *
 * While the reader types, it is only written once what they have entered is a complete and
 * acceptable date; an unfinished or refused entry leaves it untouched and is reverted when
 * they leave the field.
 */
const model = defineModel<DatePickerValue>({ default: null })

const emit = defineEmits<{
  /** The clear cross emptied the field. The value has already been reset. */
  clear: []
  /** The start icon was clicked. Attaching this listener is what makes it a button. */
  'click:icon-start': [event: MouseEvent]
}>()

defineSlots<{
  /**
   * Content at the start of the field, rendered after `iconStart` rather than in its place,
   * as in VInput.
   */
  start?(): unknown
  /**
   * Controls of your own inside the field, placed before the ones the field owns: the clear
   * cross and the icon that opens the panel. Those two are this component's own affordance,
   * which is why there is no `#end` here: it would replace them.
   */
  'value-end'?(): unknown
  /** What a day cell shows, handed straight to the calendar. */
  day?(props: DatePickerDaySlotProps): unknown
  /**
   * The strip at the foot of the panel: actions, or preset dates such as "today". It
   * receives `close`, which is what lets one of those buttons dismiss the panel.
   */
  footer?(props: DateInputFooterSlotProps): unknown
}>()

// `class` and `style` stay on the wrapper; everything else goes down to the text field,
// which is what a consumer's label points at and what assistive technology deals with.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

// Declared as this component's own event, `click:icon-start` is out of `$attrs`, so the
// listener is relayed to the field by hand — and only when the consumer wrote one.
const iconStartClick = iconStartListener((event) => emit('click:icon-start', event))

/** What reaches the field: the consumer's own attributes, plus that listener. */
const fieldAttrs = computed(() => ({ ...forwardedAttrs.value, ...iconStartClick }))

const rootEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof VPopover> | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
const pickerRef = ref<InstanceType<typeof VDatePicker> | null>(null)

/** The real input inside the field, which the mask and the caret work on. */
const fieldEl = computed<HTMLInputElement | null>(() => inputRef.value?.el ?? null)

/** What was asked for, falling back to the default when nothing or nonsense was given. */
const requestedMode = computed<DateInputMode>(() =>
  props.mode !== undefined && MODES.includes(props.mode) ? props.mode : 'input',
)
/**
 * What is actually used. Typing is only possible for a single date: a period or a list
 * has no form one could type into a single field.
 */
const resolvedMode = computed<DateInputMode>(() =>
  requestedMode.value === 'input' && props.selection === 'single' ? 'input' : 'picker',
)
const typing = computed(() => resolvedMode.value === 'input')

/**
 * Whether there is a panel at all. The calendar is only optional beside a field one can
 * type into: in `picker` mode it is the only way to choose anything, and a frozen field
 * has none at all.
 */
const hasPanel = computed(() => !props.readonly && (!typing.value || props.showPicker))

// @devwarn
if (isDev) {
  // The calendar receives `min` and `max` as they stand, so what it would say about them is
  // said here, under the name the consumer wrote (utils/hostWarns).
  provide(hostWarnsKey, true)
  watchEffect(() => {
    if (props.min && props.max && compareISO(props.min, props.max) > 0)
      console.warn(
        `[VDateInput] min "${props.min}" falls after max "${props.max}", so no date can be chosen.`,
      )
    // Without a panel there is no icon to draw and no button to name. A read-only field is
    // left out: it is a state that comes and goes, not a configuration to correct.
    if (typing.value && !props.showPicker) {
      const inert = ([] as string[]).concat(
        props.pickerIcon !== calendarTodayIcon ? 'pickerIcon' : [],
        props.pickerIconLabel ? 'pickerIconLabel' : [],
      )
      if (inert.length > 0)
        console.warn(
          `[VDateInput] ${inert.join(', ')} ${inert.length > 1 ? 'are' : 'is'} ignored without showPicker: a field one types into has no calendar icon unless it offers the calendar.`,
        )
    }
    if (props.mode !== undefined && !MODES.includes(props.mode))
      console.warn(
        `[VDateInput] unknown mode "${props.mode}": use "input" (the default) or "picker".`,
      )
    // Tested on the PROP and not on what was resolved from it: typing being the default,
    // a period or a list falls back on its own with nobody having asked for anything.
    // Only a consumer who explicitly asked to type deserves to be told it cannot work.
    if (props.mode === 'input' && props.selection !== 'single')
      console.warn(
        `[VDateInput] mode="input" ignored in "${props.selection}" selection: a range or a list of dates cannot be typed on the keyboard.`,
      )
    // Here it is the RESOLVED mode that matters: the format really was supplied, and it
    // really will have no effect, whichever route led to a typed field. The warning stays
    // something the consumer can act on.
    if (props.displayFormat && typing.value)
      console.warn(
        '[VDateInput] displayFormat is ignored in "input" mode (the default): the field displays the locale\'s numeric mask, the only typeable format. Pass mode="picker" for a formatted display.',
      )
  })
}

// A VInputGroup joins several controls into one object, so the shape of this field is the
// row's decision rather than its own (VInput/context.ts).
const group = inject(inputGroupKey, null)
const {
  size: resolvedSize,
  compact: resolvedCompact,
  disabled: resolvedDisabled,
} = useControlShape(props, group)

// The whole "field plus panel" shell, shared with VTimeInput: opening and closing, the
// focus leaving the component and coming back to the field, a click on the field or its
// icon, and the Escape, ArrowDown and Enter keys.
const {
  open,
  panelId,
  closeAndFocus,
  focusField,
  onFieldFocus,
  toggleFromIcon,
  onControlClick,
  onFocusout,
  onKeydown,
  onPanelMousedown,
} = useFieldPanel({
  rootEl,
  panelRef,
  field: inputRef,
  // With no panel there is nothing to open. This is the composable's SINGLE cut-off
  // point, and every way in passes through it — clicking the field, focusing it, the
  // down arrow, Enter, the icon — so the condition never has to be repeated in a
  // handler.
  disabled: () => resolvedDisabled.value || !hasPanel.value,
  focusInPanel: () => pickerRef.value?.focus(),
  // The calendar stays mounted while the panel is closed, so it is put back on the days
  // view both ways: a field that opens on focus never goes through `focus()`.
  onOpen: () => pickerRef.value?.reset(),
  onClose: () => pickerRef.value?.reset(),
  // Beside a field one types into, the panel opens on focus WITHOUT taking it: typing
  // carries on in the field, and the down arrow remains the way into the grid.
  openOnFocus: () => typing.value,
})

// @a11y
// TRAP — the popup wiring is spread OVER the forwarded attributes, never bound as four
// attributes after them. A binding written after `v-bind` wins even when it is
// `undefined`, so a field with no panel would erase the consumer's own `role` or
// `aria-controls`; spread, the wiring carries no key at all when there is no panel, and
// wins over the consumer's when there is one, which is what a combobox needs.
const inputAttrs = computed(() =>
  hasPanel.value
    ? {
        ...fieldAttrs.value,
        role: 'combobox',
        'aria-haspopup': 'dialog',
        'aria-expanded': open.value,
        'aria-controls': panelId,
      }
    : fieldAttrs.value,
)

const hasValue = computed(() => {
  if (props.selection === 'multiple') return Array.isArray(model.value) && model.value.length > 0
  if (props.selection === 'range') {
    const r = model.value as DatePickerRange | null
    return !!(r && (r.start || r.end))
  }
  return typeof model.value === 'string' && !!model.value
})

/* TRAP — this component is the SINGLE place the locale is resolved: what flows down to the
   calendar is the RESULT, never the prop, which would usually be undefined and would have
   the calendar resolve the language a second time — with every chance of the two
   disagreeing after a later change. */
const resolvedLocale = useResolvedLocale(() => props.locale)

const displayText = computed(() => {
  const locale = resolvedLocale.value
  const displayFormat = props.displayFormat ?? DEFAULT_DISPLAY_FORMAT
  if (props.selection === 'single') {
    return typeof model.value === 'string' && isValidISO(model.value)
      ? formatDateDisplay(model.value, locale, displayFormat)
      : ''
  }
  if (props.selection === 'range') {
    const r = model.value as DatePickerRange | null
    if (!r?.start) return ''
    if (!r.end) return formatDateDisplay(r.start, locale, displayFormat)
    return formatDisplayRange(r.start, r.end, locale, displayFormat)
  }
  const list = Array.isArray(model.value) ? model.value : []
  return list.map((iso) => formatDateDisplay(iso, locale, displayFormat)).join(', ')
})

/* From here on: everything the typed field needs. */

const mask = computed(() => dateMaskFor(resolvedLocale.value))
const maskHint = computed(() => maskPlaceholder(resolvedLocale.value, mask.value))
const isDisabledDate = computed(() => resolveMatcher(props.disabledDates))

/**
 * Whether a date the reader has finished typing may actually be taken: it has to fall
 * within the allowed bounds and not be one of the excluded days.
 */
const acceptable = (iso: string) => isDateAllowed(iso, props.min, props.max, isDisabledDate.value)

/*
 * The mask machinery — the text being typed, the bridge to the value, the reformatting
 * that preserves the caret, the commit as soon as the date is complete and the silent
 * revert when it is not — is shared with VTimeInput and lives in `useMaskedField`.
 *
 * What is injected here is the date VOCABULARY alone: the order of the fields, the
 * separator between them and their widths, all derived from the reader's language.
 */
const {
  draft,
  fieldModel,
  writeField,
  commitOrRevert,
  onFieldInput,
  onKeydown: onMaskKeydown,
  onPaste,
} = useMaskedField({
  fieldEl,
  typing: () => typing.value,
  displayText: () => displayText.value,
  readValue: () =>
    typeof model.value === 'string' && isValidISO(model.value) ? model.value : null,
  writeValue: (iso) => {
    model.value = iso
  },
  maxDigits: () => mask.value.size,
  format: (digits) => formatDateMask(digits, mask.value),
  caret: (text, digitsBefore, inserting) =>
    caretAfterDigits(text, digitsBefore, inserting ? mask.value.separator : undefined),
  // A two-digit year is only expanded on the FINAL commit, when the reader leaves the
  // field — never while they are still typing, where "26" may well be on its way to
  // becoming "2026".
  parse: (text, final) =>
    parseDateMask(text, mask.value, final ? { yearPivot: YEAR_PIVOT } : undefined),
  toMask: (iso) => (iso ? isoToMask(iso, mask.value) : ''),
  acceptable,
})

/**
 * Typing anything that is not a digit — a slash, a dot, a space — completes the field
 * being typed with a leading zero and moves on to the next. It is what lets someone type
 * "5/6/2026" and get the same result as typing all eight digits.
 *
 * It applies to the day and the month only: a year cut short has no such convention, "26"
 * being neither 0026 nor 2026 until the reader has finished.
 */
function padCurrentField(el: HTMLInputElement) {
  const start = el.selectionStart ?? el.value.length
  const before = digitsOf(el.value.slice(0, start)).length
  const digits = digitsOf(el.value)
  let offset = 0
  for (let k = 0; k < mask.value.order.length; k++) {
    const len = mask.value.lengths[k] as number
    if (before < offset + len) {
      const filled = before - offset
      if (mask.value.order[k] === 'year' || filled !== len - 1) return
      const next = digits.slice(0, offset) + '0'.repeat(len - filled) + digits.slice(offset)
      const text = formatDateMask(next.slice(0, mask.value.size), mask.value)
      writeField(text, caretAfterDigits(text, offset + len, mask.value.separator))
      return
    }
    offset += len
  }
}

// @keyboard
// What the mask's keys mean for a date: a separator completes the field being
// typed, and the down arrow is the one explicit way from the field into the calendar.
function onFieldKeydown(event: KeyboardEvent) {
  onMaskKeydown(event, {
    onSeparator: padCurrentField,
    onArrowDown: () => {
      if (!open.value) return false
      pickerRef.value?.focus()
      return true
    },
    onEnter: closeAndFocus,
  })
}

/**
 * Pasting. A date recognizable as a whole — in the ISO form, or already written the way
 * this field writes them — is adopted as it stands; anything else contributes its digits
 * alone.
 */
function onFieldPaste(event: ClipboardEvent) {
  onPaste(event, (pasted) =>
    isValidISO(pasted) ? pasted : parseDateMask(pasted, mask.value, { yearPivot: YEAR_PIVOT }),
  )
}

/*
 * The clear cross is the field's own, which renders it BEFORE the end icon rather than in
 * its place — the convention every field in the design system follows, so the two live
 * side by side.
 *
 * Whether it is shown has to be answered explicitly here: outside the typed mode the field
 * is read-only, and a read-only field hides its cross by default, rightly so — but here
 * the value comes from the panel, so there is something to clear all the same. The
 * `readonly` PROP is the one case where the default answer was right: frozen, the field
 * offers no route to a new value, so it offers no route to none either.
 */
const clearVisible = computed(() =>
  canClear(props, resolvedDisabled.value, hasValue.value || (typing.value && !!draft.value)),
)
const endIcon = computed<IconSource | undefined>(() =>
  hasPanel.value ? props.pickerIcon : undefined,
)
// @a11y @devwarn
/*
 * TRAP — the LABEL is defined at all times, even when no icon is rendered at all.
 *
 * The helper detecting a click handler on an icon warns AT SETUP if one is attached
 * without a label, and it has no way of knowing whether an icon exists. Since the
 * listener here is attached permanently and that detection is static, making the label
 * conditional would produce a false warning every time a field without a calendar is
 * mounted.
 *
 * The wording itself has no prop: the dictionary is where it is changed — see `src/i18n/`.
 */
const m = useMessages()

const endIconLabel = computed(() => props.pickerIconLabel ?? m.value.dateInput.openPicker)
const resolvedClearLabel = computed(() => props.clearLabel ?? m.value.dateInput.clear)

/*
 * Emptying the value, called by the field as it emits its clear event. The focus is taken
 * through `focusField`, whose note says why that stops the panel reopening.
 */
function clearValue() {
  model.value =
    props.selection === 'multiple'
      ? []
      : props.selection === 'range'
        ? { start: null, end: null }
        : null
  // The typed text is emptied EXPLICITLY: when the value was already empty, nothing
  // changes, and the guard that keeps the field and the value from chasing each other
  // would leave the text where it was.
  if (typing.value) writeField('')
  focusField()
  emit('clear')
}

/**
 * A date was chosen in the calendar. Choosing ONE date finishes the job, so the panel
 * closes; a period or a list is still being built and it stays open.
 */
function onSelect() {
  if (props.selection === 'single') closeAndFocus()
}

defineExpose({
  /** Moves the focus to the text field. */
  focus: (options?: FocusOptions) => inputRef.value?.focus(options),
  /** Selects what the field is showing. */
  select: () => inputRef.value?.select(),
  /** The real `<input>` behind the field, for what neither of the two above covers. */
  el: computed(() => inputRef.value?.el ?? null),
})
</script>

<template>
  <div
    ref="rootEl"
    class="v-date-input"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    :data-mode="resolvedMode"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    @focusout="onFocusout"
    @keydown="onKeydown"
  >
    <div class="v-date-input-control" @click="onControlClick">
      <!-- The field is declared a combobox rather than left as the plain text box it
           implicitly is, because a text box may not carry the attribute saying whether
           something is expanded — and a text field with a panel attached IS the combobox
           pattern, the same role VCombobox gives its own field.

           The role and the three attributes are all conditioned on the SAME thing, so the
           role never appears without the expanded state it requires, and nothing ever
           points at a panel that was not rendered. -->
      <VInput
        ref="inputRef"
        v-model="fieldModel"
        :inputmode="typing ? 'numeric' : undefined"
        :autocomplete="typing ? 'off' : undefined"
        v-bind="inputAttrs"
        :readonly="readonly"
        :no-typing="!typing"
        :label="label"
        :hint="hint"
        :placeholder="placeholder ?? (typing ? maskHint : undefined)"
        :size="resolvedSize"
        :compact="resolvedCompact"
        :disabled="resolvedDisabled"
        :invalid="invalid"
        :clearable="clearable"
        :clear-visible="clearVisible"
        :clear-label="resolvedClearLabel"
        :icon-start="iconStart"
        :icon-start-label="iconStartLabel"
        :loading="loading"
        :loading-text="loadingText"
        :icon-end="endIcon"
        :icon-end-label="endIconLabel"
        @click:icon-end="toggleFromIcon"
        @clear="clearValue"
        @focus="onFieldFocus"
        @input="onFieldInput"
        @change="commitOrRevert"
        @blur="commitOrRevert"
        @keydown="onFieldKeydown"
        @paste="onFieldPaste"
      >
        <template v-if="$slots.start" #start><slot name="start" /></template>
        <template v-if="$slots['value-end']" #value-end><slot name="value-end" /></template>
      </VInput>
    </div>

    <!-- With no panel rendered there is nothing to hold a reference to, and the open state
         — which is fed by the panel's own events — can no longer become true. The absence
         of a panel is therefore self-enforcing. -->
    <VPopover
      v-if="hasPanel"
      :id="panelId"
      ref="panelRef"
      v-model:open="open"
      mode="manual"
      anchor="--date-input-anchor"
      :placement="placement"
      role="dialog"
      :aria-label="label ?? m.dateInput.pickerLabel"
      class="v-date-input-panel"
      @mousedown="onPanelMousedown"
    >
      <VDatePicker
        ref="pickerRef"
        v-model="model"
        :selection="selection"
        :locale="resolvedLocale"
        :first-day-of-week="firstDayOfWeek"
        :min="min"
        :max="max"
        :disabled-dates="disabledDates"
        :show-adjacent-days="showAdjacentDays"
        :select-adjacent-days="selectAdjacentDays"
        :events="events"
        @select="onSelect"
      >
        <template v-if="$slots.day" #day="slotProps">
          <slot name="day" v-bind="slotProps" />
        </template>
        <template v-if="$slots.footer" #footer>
          <slot name="footer" :close="closeAndFocus" />
        </template>
      </VDatePicker>
    </VPopover>
  </div>
</template>

<style>
@layer vectis.components {
  .v-date-input {
    /* Confines the anchor to this instance (the root = the common ancestor of the
       control and the panel) */
    anchor-scope: --date-input-anchor;
    display: block;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /* The pointer says "this opens a panel", which a read-only or disabled field no longer
     does: the VFileInput gating. */
  .v-date-input:not([data-disabled]):not([data-readonly]) .v-date-input-control {
    cursor: pointer;
  }

  /* The anchor is the FIELD's box and not this wrapper's, which also holds the label and
     the hint: anchored to the wrapper, the calendar opens a hint's height below the field,
     and a label's height above it once there is no room below and `flip-block` turns it
     over. Against the field it covers whichever of the two it lands on, which is what a
     panel belonging to a control is supposed to do. */
  .v-date-input-control .v-input-field {
    anchor-name: --date-input-anchor;
  }

  /* Input mode: the field is editable, and the <input>'s text caret takes over from the
     control's `pointer` (which signals "this opens a panel"). The mask has a fixed width:
     tabular figures, otherwise the caret jitters from one digit to the next. */
  .v-date-input[data-mode='input']:not([data-disabled]):not([data-readonly]) .v-date-input-control {
    cursor: text;
  }

  .v-date-input[data-mode='input'] .v-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* `position-anchor` and the chrome come from VPopover (the `anchor` prop, and the
     `.v-panel` it sets on any panel that is not `bare`): only the dimensions are left here,
     which `panel.css` deliberately does not carry. The panel's OWN padding is cancelled,
     VDatePicker padding itself as VTimePicker does, so both pickers keep the same room
     on a page and in a panel. Compounded with `.v-popover-panel` (VPopover puts both
     classes on the same element) because `.v-panel` declares `padding` too, and at
     equal specificity the winner would depend on the order in which the consumer's
     bundler concatenates the CSS. */
  .v-popover-panel.v-date-input-panel {
    width: max-content;
    padding: 0;
  }
}
</style>
