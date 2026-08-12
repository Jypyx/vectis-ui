<script setup lang="ts">
import { computed, ref, useId, watchEffect } from 'vue'

import VCalendar from '../VCalendar/VCalendar.vue'
import type {
  CalendarEvent,
  CalendarSelection,
  CalendarValue,
  DateMatcher,
  DateRange,
} from '../VCalendar/VCalendar.vue'
import {
  caretAfterDigits,
  dateMaskFor,
  formatDateMask,
  formatDisplay,
  formatDisplayRange,
  isValidISO,
  isWithin,
  isoToMask,
  maskPlaceholder,
  parseDateMask,
} from '../../utils/date'
import { digitsOf } from '../../utils/text'
import { resolveMatcher } from '../../utils/matcher'
import { isDev } from '../../utils/env'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VPopover from '../VPopover/VPopover.vue'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFieldPanel } from '../../composables/useFieldPanel'
import { useMaskedField } from '../../composables/useMaskedField'
import { useLocale, useMessages } from '../../i18n/state'

// @a11y @core
/**
 * A field for choosing a date: a text field, and a calendar in a panel below it.
 *
 * The panel is opened from code rather than by the browser, and that is not a detail: a
 * text input cannot be declared as the thing that opens a popover, and opening it
 * ourselves is also what lets the focus be moved INTO the calendar's grid, so the
 * keyboard lands where the dates are. Closing is ours too — the focus leaving the
 * component, or Escape.
 *
 * The field itself comes in two forms. It can be TYPED into, which is the default: the
 * reader types digits only and the separators appear as they go, in the order and with
 * the punctuation their language uses. Or it can be read-only, in which case the calendar
 * is the only way in.
 *
 * That is a different question from WHAT is being chosen — one date, a period, or several
 * dates — which is passed straight through to the calendar.
 */
type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

/** Whether the field can be typed into, or only filled from the calendar. */
export type DatePickerMode = 'readonly' | 'input'

const MODES: DatePickerMode[] = ['readonly', 'input']

/**
 * The century a two-digit year is expanded into — "10/06/26" becomes 2026 — applied only
 * when the reader leaves the field.
 *
 * It is FIXED and never derived from the current year. A sliding rule would make the
 * component's behaviour depend on when it runs, which is the same objection that keeps
 * today's date out of VCalendar's setup, and it would give the tests a shelf life.
 */
const YEAR_PIVOT = 2000

const DEFAULT_DISPLAY_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

interface DatePickerProps {
  // Everything from here to `events` is handed straight to the calendar.
  /** What is being chosen: one date, a period between two, or several separate dates. */
  selection?: CalendarSelection
  /**
   * A BCP 47 locale, which decides the month and day names, the first day of the week and
   * the order the field is typed in. It TAKES PRECEDENCE over the design system's global
   * locale and falls back to it — which is why it has no literal default: `undefined` has
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
  disabledDates?: DateMatcher
  /** Fills the corners of the grid with the greyed days of the neighbouring months. */
  showAdjacentDays?: boolean
  /** Lets those neighbouring days be clicked, which implies showing them. */
  selectAdjacentDays?: boolean
  /** Events to mark under the days they fall on. */
  events?: CalendarEvent[]
  // From here on: the field.
  /**
   * Whether the field can be TYPED into — the default, using the numeric form of the
   * reader's language — or is read-only, the calendar then being the only way in.
   *
   * Typing is reserved for choosing a SINGLE date: a period or a list falls back to
   * read-only, there being no sensible way to type either.
   */
  mode?: DatePickerMode
  /**
   * Offers the calendar alongside a field that can be typed into: an icon at the end of
   * the field, and a panel that opens on focus. It means nothing in read-only mode, where
   * the calendar is already the only way to choose.
   */
  showCalendar?: boolean
  /** The label above the field. */
  label?: string
  /** A line of help under the field. */
  hint?: string
  /** What the field says while empty. */
  placeholder?: string
  /** The height of the field: 32, 40 or 48 pixels. */
  size?: 'sm' | 'md' | 'lg'
  /** Takes 4px off the height. */
  compact?: boolean
  /** Makes the field unusable, greyed out through the colour tokens. */
  disabled?: boolean
  /** Marks the field as invalid — for a rule of your own. */
  invalid?: boolean
  /** Offers a cross that empties the value, shown before the end icon. */
  clearable?: boolean
  /**
   * The icon that opens the calendar, at the end of the field. The clear cross appears to
   * its left rather than in its place, and no icon is rendered at all when there is no
   * panel to open.
   */
  calendarIcon?: IconSource
  /**
   * How the date is WRITTEN OUT in the field. It has no effect on a field being typed
   * into, which necessarily shows the numeric form one types — so it concerns the
   * read-only mode, and the period and list selections, which fall back to it.
   */
  displayFormat?: Intl.DateTimeFormatOptions
  /** Where the panel opens relative to the field. */
  placement?: Placement
}

const props = withDefaults(defineProps<DatePickerProps>(), {
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
  showCalendar: false,
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  invalid: false,
  clearable: true,
  calendarIcon: 'calendar_today',
  // Left undefined rather than defaulted to the format object, for the same reason: it is
  // what lets the component notice that a consumer has asked for a display format in a
  // mode where it has no effect, and say so.
  displayFormat: undefined,
  placement: 'bottom-start',
})

const model = defineModel<CalendarValue>({ default: null })

defineSlots<{
  /** What a day cell shows, handed straight to the calendar. */
  day?(props: {
    iso: string
    day: number
    inMonth: boolean
    disabled: boolean
    selected: boolean
    today: boolean
    inRange: boolean
    events: CalendarEvent[]
  }): unknown
  /**
   * The strip at the foot of the panel — actions, or preset dates such as "today". It
   * receives `close`, which is what lets one of those buttons dismiss the panel.
   */
  footer?(props: { close: () => void }): unknown
}>()

// `class` and `style` stay on the wrapper; everything else goes down to the text field,
// which is what a consumer's label points at and what assistive technology deals with.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof VPopover> | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
const calendarRef = ref<InstanceType<typeof VCalendar> | null>(null)
const panelId = useId()

/** The real input inside the field, which the mask and the caret work on. */
const fieldEl = computed<HTMLInputElement | null>(() => inputRef.value?.el ?? null)

/** What was asked for, falling back to the default when nothing or nonsense was given. */
const requestedMode = computed<DatePickerMode>(() =>
  props.mode !== undefined && MODES.includes(props.mode) ? props.mode : 'input',
)
/**
 * What is actually used. Typing is only possible for a single date: a period or a list
 * has no form one could type into a single field.
 */
const resolvedMode = computed<DatePickerMode>(() =>
  requestedMode.value === 'input' && props.selection === 'single' ? 'input' : 'readonly',
)
const typing = computed(() => resolvedMode.value === 'input')

/**
 * Whether there is a panel at all. The calendar is only optional beside a field one can
 * type into: read-only, it is the only way to choose anything.
 */
const hasPanel = computed(() => !typing.value || props.showCalendar)

// @devwarn
if (isDev) {
  watchEffect(() => {
    if (props.mode !== undefined && !MODES.includes(props.mode))
      console.warn(
        `[VDatePicker] unknown mode "${props.mode}": use "input" (the default) or "readonly".`,
      )
    // Tested on the PROP and not on what was resolved from it: typing being the default,
    // a period or a list falls back on its own with nobody having asked for anything.
    // Only a consumer who explicitly asked to type deserves to be told it cannot work.
    if (props.mode === 'input' && props.selection !== 'single')
      console.warn(
        `[VDatePicker] mode="input" ignored in "${props.selection}" selection: a range or a list of dates cannot be typed on the keyboard.`,
      )
    // Here it is the RESOLVED mode that matters: the format really was supplied, and it
    // really will have no effect, whichever route led to a typed field. The warning stays
    // something the consumer can act on.
    if (props.displayFormat && typing.value)
      console.warn(
        '[VDatePicker] displayFormat is ignored in "input" mode (the default): the field displays the locale\'s numeric mask, the only typeable format. Pass mode="readonly" for a formatted display.',
      )
  })
}

// The whole "field plus panel" shell, shared with VTimePicker: opening and closing, the
// focus leaving the component, a click on the field, and the Escape, ArrowDown and Enter
// keys.
const { open, openPanel, closePanel, onControlClick, onFocusout, onKeydown, onPanelMousedown } =
  useFieldPanel({
    rootEl,
    panelRef,
    fieldEl: inputRef,
    // With no panel there is nothing to open. This is the composable's SINGLE cut-off
    // point, and every way in passes through it — clicking the field, focusing it, the
    // down arrow, Enter, the icon — so the condition never has to be repeated in a
    // handler.
    disabled: () => props.disabled || !hasPanel.value,
    focusInPanel: () => calendarRef.value?.focus(),
    // Beside a field one types into, the panel opens WITHOUT taking the focus: typing
    // carries on in the field, and the down arrow remains the way into the grid.
    focusOnOpen: () => !typing.value,
  })

const hasValue = computed(() => {
  if (props.selection === 'multiple') return Array.isArray(model.value) && model.value.length > 0
  if (props.selection === 'range') {
    const r = model.value as DateRange | null
    return !!(r && (r.start || r.end))
  }
  return typeof model.value === 'string' && !!model.value
})

const vectisLocale = useLocale()
/* The prop wins, and the design system's global locale is what it falls back to.

   TRAP — this component is the SINGLE place that resolution happens: what flows down to
   the calendar is the RESULT, never the prop, which would usually be undefined and would
   have the calendar resolve the language a second time — with every chance of the two
   disagreeing after a later change. */
const resolvedLocale = computed(() => props.locale ?? vectisLocale.value)

const displayText = computed(() => {
  const locale = resolvedLocale.value
  const displayFormat = props.displayFormat ?? DEFAULT_DISPLAY_FORMAT
  if (props.selection === 'single') {
    return typeof model.value === 'string' && isValidISO(model.value)
      ? formatDisplay(model.value, locale, displayFormat)
      : ''
  }
  if (props.selection === 'range') {
    const r = model.value as DateRange | null
    if (!r?.start) return ''
    if (!r.end) return formatDisplay(r.start, locale, displayFormat)
    return formatDisplayRange(r.start, r.end, locale, displayFormat)
  }
  const list = Array.isArray(model.value) ? model.value : []
  return list.map((iso) => formatDisplay(iso, locale, displayFormat)).join(', ')
})

/* From here on: everything the typed field needs. */

const mask = computed(() => dateMaskFor(resolvedLocale.value))
const maskHint = computed(() => maskPlaceholder(resolvedLocale.value, mask.value))
const isDisabledDate = computed(() => resolveMatcher(props.disabledDates))

/**
 * Whether a date the reader has finished typing may actually be taken: it has to fall
 * within the allowed bounds and not be one of the excluded days.
 */
const acceptable = (iso: string) =>
  isWithin(iso, props.min, props.max) && !isDisabledDate.value(iso)

/*
 * The mask machinery — the text being typed, the bridge to the value, the reformatting
 * that preserves the caret, the commit as soon as the date is complete and the silent
 * revert when it is not — is shared with VTimePicker and lives in `useMaskedField`.
 *
 * What is injected here is the date VOCABULARY alone: the order of the fields, the
 * separator between them and their widths, all derived from the reader's language.
 */
const { draft, fieldModel, writeField, commitLive, commitOrRevert, onFieldInput } = useMaskedField({
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

// @keyboard @core — the keys the mask itself needs: completing a field with a separator,
// erasing across one, and the down arrow, which is the one explicit way from the field
// into the calendar.
function onFieldKeydown(event: KeyboardEvent) {
  if (!typing.value) return
  const el = fieldEl.value
  if (!el) return

  if (event.key === 'Enter') {
    // Cancelling the default does two things at once: it stops the surrounding form from
    // being submitted, and it stops the panel this keystroke has just closed from being
    // reopened as the event travels up to the root.
    event.preventDefault()
    commitOrRevert()
    if (open.value) closeAndFocus()
    return
  }
  if (event.key === 'ArrowDown' && open.value) {
    // The one explicit route from the field into the grid of days.
    event.preventDefault()
    calendarRef.value?.focus()
    return
  }
  if (event.key === 'Backspace') {
    const start = el.selectionStart
    if (
      start !== null &&
      start === el.selectionEnd &&
      start > 0 &&
      !/\d/.test(el.value[start - 1] ?? '')
    ) {
      // TRAP — a separator is PLACED by the mask and never typed, so erasing one has to
      // erase the DIGIT before it, which is what the reader believes they are erasing.
      // Left alone, the mask would write the separator straight back and the key would
      // look dead.
      event.preventDefault()
      const n = digitsOf(el.value.slice(0, start)).length
      const digits = digitsOf(el.value)
      const text = formatDateMask(digits.slice(0, n - 1) + digits.slice(n), mask.value)
      writeField(text, caretAfterDigits(text, n - 1))
      commitLive()
    }
    return
  }
  if (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !/\d/.test(event.key)
  ) {
    event.preventDefault()
    padCurrentField(el)
  }
}

/**
 * Pasting. A date recognizable as a whole — in the ISO form, or already written the way
 * this field writes them — is adopted as it stands; anything else contributes its digits
 * alone.
 *
 * Without this, pasting "2026-06-10" into a field expecting day, month, year would
 * produce "20/26/0610": the digits would be taken in order and the separators ignored.
 */
function onFieldPaste(event: ClipboardEvent) {
  if (!typing.value) return
  const el = fieldEl.value
  if (!el) return
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') ?? '').trim()
  const iso = isValidISO(pasted)
    ? pasted
    : parseDateMask(pasted, mask.value, { yearPivot: YEAR_PIVOT })
  if (iso) {
    const text = isoToMask(iso, mask.value)
    writeField(text, text.length)
    commitLive()
    return
  }
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? start
  const digits = digitsOf(el.value)
  const from = digitsOf(el.value.slice(0, start)).length
  const to = digitsOf(el.value.slice(0, end)).length
  const inserted = digitsOf(pasted)
  const next = (digits.slice(0, from) + inserted + digits.slice(to)).slice(0, mask.value.size)
  const text = formatDateMask(next, mask.value)
  writeField(text, caretAfterDigits(text, Math.min(from + inserted.length, next.length)))
  commitLive()
}

// @a11y
/**
 * TRAP — closing the panel hands the focus back to the field, and beside a field one
 * types into the panel opens ON FOCUS: the two would chase each other and the panel would
 * never close.
 *
 * This lock covers the focus call, which is synchronous. EVERY close that returns the
 * focus must go through here; closing directly brings the loop straight back.
 */
let refocusing = false
function closeAndFocus() {
  refocusing = true
  closePanel(true)
  refocusing = false
}

function onFieldFocus() {
  if (!typing.value || refocusing) return
  openPanel(false)
}

// @keyboard @a11y
function onRootKeydown(event: KeyboardEvent) {
  if (typing.value && event.key === 'Escape' && open.value) {
    event.preventDefault()
    closeAndFocus()
    return
  }
  onKeydown(event)
}

/*
 * The clear cross is the field's own, which renders it BEFORE the end icon rather than in
 * its place — the convention every field in the design system follows, so the two live
 * side by side.
 *
 * Whether it is shown has to be answered explicitly here: outside the typed mode the field
 * is read-only, and a read-only field hides its cross by default, rightly so — but here
 * the value comes from the panel, so there is something to clear all the same.
 */
const canClear = computed(
  () => props.clearable && !props.disabled && (hasValue.value || (typing.value && !!draft.value)),
)
const endIcon = computed<IconSource | undefined>(() =>
  hasPanel.value ? props.calendarIcon : undefined,
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

const endIconLabel = computed(() => m.value.datePicker.open)

function onEndIcon() {
  if (open.value) closeAndFocus()
  // Clicking the icon is an explicit request for the calendar, and the focus has already
  // left the field for the button — so carrying it into the grid is right in both modes.
  else openPanel(true)
}
// @a11y
/*
 * Emptying the value, called by the field as it emits its clear event.
 *
 * TRAP — the focus is taken here, under the lock, on purpose: the field focuses itself
 * immediately afterwards, and focusing an element that ALREADY has the focus emits no
 * event at all. That is what stops the panel reopening. Taking the lock away from this
 * function brings the reopening straight back.
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
  refocusing = true
  inputRef.value?.focus()
  refocusing = false
}

/**
 * A date was chosen in the calendar. Choosing ONE date finishes the job, so the panel
 * closes; a period or a list is still being built and it stays open.
 */
function onSelect() {
  if (props.selection === 'single') closeAndFocus()
}

const close = () => closeAndFocus()
</script>

<template>
  <div
    ref="rootEl"
    class="v-datepicker"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    :data-mode="resolvedMode"
    @focusout="onFocusout"
    @keydown="onRootKeydown"
  >
    <div class="v-datepicker-control" @click="onControlClick">
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
        v-bind="forwardedAttrs"
        :readonly="!typing"
        :label="label"
        :hint="hint"
        :placeholder="placeholder ?? (typing ? maskHint : undefined)"
        :size="size"
        :compact="compact"
        :disabled="disabled"
        :invalid="invalid"
        :clearable="clearable"
        :clear-visible="canClear"
        :clear-label="m.datePicker.clear"
        :icon-end="endIcon"
        :icon-end-label="endIconLabel"
        :role="hasPanel ? 'combobox' : undefined"
        :aria-haspopup="hasPanel ? 'dialog' : undefined"
        :aria-expanded="hasPanel ? open : undefined"
        :aria-controls="hasPanel ? panelId : undefined"
        @click:icon-end="onEndIcon"
        @clear="clearValue"
        @focus="onFieldFocus"
        @input="onFieldInput"
        @change="commitOrRevert"
        @blur="commitOrRevert"
        @keydown="onFieldKeydown"
        @paste="onFieldPaste"
      />
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
      anchor="--datepicker-anchor"
      :placement="placement"
      surface
      role="dialog"
      :aria-label="label ?? m.datePicker.label"
      class="v-datepicker-panel"
      @mousedown="onPanelMousedown"
    >
      <VCalendar
        ref="calendarRef"
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
          <slot name="footer" :close="close" />
        </template>
      </VCalendar>
    </VPopover>
  </div>
</template>

<style>
@layer vectis.components {
  .v-datepicker {
    /* Confines the anchor to this instance (the root = the common ancestor of the
       control and the panel) */
    anchor-scope: --datepicker-anchor;
    display: block;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  .v-datepicker-control {
    anchor-name: --datepicker-anchor;
    display: block;
    cursor: pointer;
  }

  /* Input mode: the field is editable, and the <input>'s text caret takes over from the
     control's `pointer` (which signals "this opens a panel"). The mask has a fixed width:
     tabular figures, otherwise the caret jitters from one digit to the next. */
  .v-datepicker[data-mode='input'] .v-datepicker-control {
    cursor: text;
  }

  .v-datepicker[data-mode='input'] .v-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* `position-anchor` and the chrome come from VPopover (the `anchor` and `surface`
     props, the latter setting `.v-panel`): only the dimensions are left here, which
     `panel.css` deliberately does not carry. The padding is cancelled — VCalendar handles
     its own breathing room; compounded with `.v-popover-panel` (VPopover puts both
     classes on the same element) because `.v-panel` declares `padding` too, and at
     equal specificity the winner would depend on the order in which the consumer's
     bundler concatenates the CSS. */
  .v-popover-panel.v-datepicker-panel {
    width: max-content;
    padding: 0;
  }
}
</style>
