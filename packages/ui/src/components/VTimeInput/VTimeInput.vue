<script setup lang="ts">
import { computed, ref, useId, watchEffect } from 'vue'

import VButton from '../VButton/VButton.vue'
import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import { schedule as scheduleIcon } from '../VIcon/icons/schedule'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VPopover from '../VPopover/VPopover.vue'
import VToggle from '../VToggle/VToggle.vue'
import type { ToggleModelValue } from '../VToggle/VToggle.vue'
import VToggleItem from '../VToggle/VToggleItem.vue'
import VTimePicker from '../VTimePicker/VTimePicker.vue'
import type { TimePickerFormat } from '../VTimePicker/VTimePicker.vue'
import {
  formatDisplay,
  formatTime,
  formatTimeMask,
  hourCycleFor,
  isValidTime,
  minutesOf,
  parseTime,
  parseTimeMask,
  snapMinute,
  timeCaret,
  timeList,
  timeToMask,
  to12h,
  to24h,
} from '../../utils/time'
import type { Meridiem, TimeOption } from '../../utils/time'
import { arrowNavigate } from '../../utils/arrowNav'
import { clamp } from '../../utils/number'
import { isDev } from '../../utils/env'
import { digitsOf } from '../../utils/text'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFieldPanel } from '../../composables/useFieldPanel'
import { useMaskedField } from '../../composables/useMaskedField'
import { useLocale, useMessages } from '../../i18n/state'

// @a11y @core
/**
 * A field for choosing a time, with an optional panel below it. The shell is the same one
 * VDateInput uses: the panel is opened from code, which is what lets the focus be moved
 * into it, and closed when the focus leaves the component or Escape is pressed.
 *
 * The field comes in three forms. It can be TYPED into, hours and minutes behind a mask,
 * optionally with a picker beside it. It can be read-only, the picker then being the only way
 * in. Or it can offer a LIST of times at a fixed interval, which suits booking a slot far
 * better than pointing at a clock face.
 *
 * The two panels commit differently, and deliberately so. The PICKER works on a draft that
 * only OK writes to the value — Cancel, Escape and the focus leaving all discard it —
 * because dragging a hand across a clock passes over dozens of times nobody meant. The
 * LIST writes immediately: choosing a row there is one deliberate gesture.
 *
 * Whatever is displayed, the value itself is always a 24-hour time.
 */
export type TimeInputMode = 'readonly' | 'input' | 'list'

const MODES: TimeInputMode[] = ['readonly', 'input', 'list']

type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

interface TimeInputProps {
  /**
   * Whether times are shown on a 12- or a 24-hour clock. Left out, the reader's language
   * decides, which is almost always what one wants.
   */
  format?: TimePickerFormat
  /**
   * Which form the field takes: one that can be TYPED into, a read-only one where the
   * picker is the only way in — so the picker is forced on there — or a LIST of times at a
   * fixed interval, where a picker would make no sense.
   */
  mode?: TimeInputMode
  /**
   * Offers the picker beside a field one can type into: an icon at the end of the field,
   * and a panel it opens.
   *
   * It is left undefined by default rather than set to off, which is what distinguishes
   * "not given" from an explicit refusal — and therefore what allows warning only the
   * consumer who really asked to remove the picker from a read-only field, where it is the
   * only way in.
   */
  showPicker?: boolean
  /**
   * The interval between two times that can be chosen. It applies to the picker, to the
   * arrow keys and to the rows of the list.
   */
  minuteStep?: number
  /**
   * A BCP 47 locale, which decides the clock and how a time is written out. It TAKES
   * PRECEDENCE over the design system's global locale and falls back to it — which is why
   * it has no literal default: `undefined` has to stay recognizable for the global locale
   * to have its chance.
   */
  locale?: string
  // From here on: the field.
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
   * The icon that opens the PICKER, at the end of the field. It has no effect on the list
   * form, whose chevron follows the combobox convention. The clear cross appears to its
   * left rather than in its place.
   */
  pickerIcon?: IconSource
  /** Where the panel opens relative to the field. */
  placement?: Placement
}

const props = withDefaults(defineProps<TimeInputProps>(), {
  format: undefined,
  // Deliberately left undefined rather than defaulted to the typed mode: that is what
  // distinguishes "the prop was not given" from "the prop was given this value", and
  // therefore what allows warning ONLY the consumer who explicitly asked for something
  // that cannot work.
  mode: undefined,
  showPicker: undefined,
  minuteStep: 1,
  locale: undefined,
  label: undefined,
  hint: undefined,
  placeholder: undefined,
  size: 'md',
  compact: false,
  disabled: false,
  invalid: false,
  clearable: true,
  pickerIcon: () => scheduleIcon,
  placement: 'bottom-start',
})

/**
 * The time, always as a 24-hour "HH:mm" string whatever clock is displayed. A consumer
 * therefore never has to know which clock the reader's language uses.
 */
const model = defineModel<string | null>({ default: null })

// `class` and `style` stay on the wrapper; everything else goes down to the text field,
// which is what a consumer's label points at and what assistive technology deals with.
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const rootEl = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof VPopover> | null>(null)
const inputRef = ref<InstanceType<typeof VInput> | null>(null)
const pickerRef = ref<InstanceType<typeof VTimePicker> | null>(null)
const panelId = useId()

/** The real input inside the field, which the mask and the caret work on. */
const fieldEl = computed<HTMLInputElement | null>(() => inputRef.value?.el ?? null)

const resolvedMode = computed<TimeInputMode>(() => {
  // TRAP — the default is applied BEFORE the value is checked. A prop that was never
  // given is not an unknown value, and treating it as one would warn on a bare
  // `<VTimeInput />`.
  const mode = props.mode ?? 'input'
  return MODES.includes(mode) ? mode : 'input'
})
const typing = computed(() => resolvedMode.value === 'input')
const isList = computed(() => resolvedMode.value === 'list')
/**
 * Whether there is a picker. It is forced on a read-only field, where nothing else could
 * fill it; offered beside a field one types into; and meaningless in the list form, which
 * has a panel of its own.
 */
const hasPicker = computed(
  () => resolvedMode.value === 'readonly' || (typing.value && props.showPicker === true),
)
const hasPanel = computed(() => hasPicker.value || isList.value)

const vectisLocale = useLocale()
/* The prop wins, and the design system's global locale is what it falls back to. */
const resolvedLocale = computed(() => props.locale ?? vectisLocale.value)

const resolvedFormat = computed<TimePickerFormat>(
  () => props.format ?? hourCycleFor(resolvedLocale.value),
)

// @devwarn
if (isDev) {
  watchEffect(() => {
    if (props.minuteStep < 1 || 60 % props.minuteStep !== 0)
      console.warn(`[VTimeInput] minuteStep ${props.minuteStep} — a divisor of 60 is expected.`)
    if (props.mode !== undefined && !MODES.includes(props.mode))
      console.warn(
        `[VTimeInput] unknown mode "${props.mode}": use "input" (the default), "readonly" or "list".`,
      )
    if (resolvedMode.value === 'readonly' && props.showPicker === false)
      console.warn(
        '[VTimeInput] showPicker is forced to true in "readonly" mode: with no picker, a read-only field would be impossible to fill.',
      )
    if (isList.value && props.showPicker === true)
      console.warn(
        '[VTimeInput] showPicker is ignored in "list" mode: the list of times is the only panel.',
      )
    if (isList.value && props.minuteStep < 5)
      console.warn(
        `[VTimeInput] minuteStep ${props.minuteStep} in "list" mode would render ${Math.ceil(1440 / props.minuteStep)} rows: a step of 15 or 30 minutes is expected.`,
      )
  })
}

/**
 * The time being built on the clock, in the same canonical form as the value itself.
 * Nothing here reaches the value until OK is pressed — which is the whole reason the
 * picker is bound to THIS rather than to the model.
 */
const draft = ref<string | null>(null)

const modelParts = computed(() => parseTime(model.value))

/**
 * Which half of the day is chosen while NO time is set at all. The AM/PM control always
 * needs a value — it refuses to have none — and "nothing" is not one.
 *
 * It starts at AM rather than at whatever the current time happens to be, which keeps the
 * component's first render identical on a server and in a browser, and its tests free of
 * a clock.
 */
const pendingMeridiem = ref<Meridiem>('AM')

/**
 * The AM/PM control beside the FIELD. It is what the mask needs — the half of the day has
 * to be known while the panel is shut, and in the list form there is no picker at all — so
 * it is rendered in every form but the read-only one, where the picker carries its own.
 */
const meridiemModel = computed<ToggleModelValue>({
  get: () => {
    // With the picker open it is the DRAFT that is on screen, and this control has to read
    // the same thing: two controls showing opposite halves of the day until OK is pressed
    // is the one state that must not happen.
    const parts = open.value && hasPicker.value ? parseTime(draft.value) : modelParts.value
    return parts ? to12h(parts.hour).meridiem : pendingMeridiem.value
  },
  set: (value) => {
    const meridiem: Meridiem = value === 'PM' ? 'PM' : 'AM'
    pendingMeridiem.value = meridiem
    const parts = modelParts.value
    // With no time set there is nothing to convert, so the choice is simply REMEMBERED
    // and applies to the first time typed or chosen.
    if (parts) model.value = formatTime(to24h(to12h(parts.hour).hour, meridiem), parts.minute)
    // With the picker open the draft has to follow as well, or OK would write back the
    // half of the day the reader has just changed.
    const pending = open.value && hasPicker.value ? parseTime(draft.value) : null
    if (pending) draft.value = formatTime(to24h(to12h(pending.hour).hour, meridiem), pending.minute)
  },
})

const hasValue = computed(() => !!modelParts.value)
const displayText = computed(() =>
  model.value ? formatDisplay(model.value, resolvedLocale.value, resolvedFormat.value) : '',
)

// @a11y
// Where the focus goes when the panel opens.
function focusInPanel() {
  if (!isList.value) {
    // The picker publishes where its own focus goes, so nothing here has to know that the
    // target is a slider — the same arrangement VDateInput has with VDatePicker.
    pickerRef.value?.focus()
    return
  }
  const panel = panelRef.value?.el
  if (panel) focusListSelection(panel)
}

// The whole "field plus panel" shell, shared with VDateInput. What is specific to this
// component is only what happens around it: preparing the draft as the panel opens, and
// clearing the announcement as it closes.
const { open, openPanel, closePanel, onControlClick, onFocusout, onKeydown, onPanelMousedown } =
  useFieldPanel({
    rootEl,
    panelRef,
    fieldEl: inputRef,
    // With no panel there is nothing to open. This is the composable's SINGLE cut-off
    // point, and every way in passes through it — clicking the field, focusing it, the
    // down arrow, Enter, the icon.
    disabled: () => props.disabled || !hasPanel.value,
    focusInPanel,
    // Beside a field one types into, the panel opens WITHOUT taking the focus, so typing
    // carries on.
    focusOnOpen: () => !typing.value,
    onOpen: () => {
      // Only the picker works on a draft; the list writes its choice straight away.
      if (!hasPicker.value) return
      const parts = modelParts.value
      if (parts) draft.value = formatTime(parts.hour, parts.minute)
      else {
        // Opening on the current time when none is set. Reading the clock is safe here:
        // this runs from a handler, hence in a browser, never during a render — and it is
        // why the picker itself never reads it, so that it stays identical on both sides
        // of hydration. The instant is taken ONCE: two reads could straddle a minute.
        const now = new Date()
        draft.value = formatTime(now.getHours(), snapMinute(now.getMinutes(), props.minuteStep))
      }
      pickerRef.value?.reset()
    },
    onClose: () => {
      pickerRef.value?.reset()
    },
  })

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

/** OK: the ONE route by which the picker's draft becomes the value. */
function confirm() {
  if (draft.value) model.value = draft.value
  closeAndFocus()
}

function cancel() {
  closeAndFocus()
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
  model.value = null
  // The typed text is emptied EXPLICITLY: when the value was already empty, nothing
  // changes, and the guard that keeps the field and the value from chasing each other
  // would leave the text where it was.
  if (typing.value) writeField('')
  refocusing = true
  inputRef.value?.focus()
  refocusing = false
}

// Escape and the focus leaving both close WITHOUT committing, which is the picker's Cancel
// behaviour: closing never writes the value, and only OK does.

const m = useMessages()

/* From here on: everything the typed field needs. */

const currentMeridiem = (): Meridiem => (meridiemModel.value === 'PM' ? 'PM' : 'AM')

/*
 * The mask machinery — the text being typed, the bridge to the value, the reformatting
 * that preserves the caret, the commit and the silent revert — is shared with VDateInput
 * and lives in `useMaskedField`.
 *
 * The time vocabulary is the simpler of the two: four digits, and a separator that is the
 * SAME in every language. That is why the caret can be computed outright here, where a
 * date has to look for a separator it cannot predict; and why nothing distinguishes a
 * final commit from a live one, there being no equivalent of expanding a two-digit year.
 */
const {
  draft: maskDraft,
  fieldModel,
  writeField,
  commitLive,
  commitOrRevert,
  onFieldInput,
} = useMaskedField({
  fieldEl,
  typing: () => typing.value,
  displayText: () => displayText.value,
  readValue: () => model.value,
  writeValue: (time) => {
    model.value = time
  },
  maxDigits: () => 4,
  format: formatTimeMask,
  caret: (_text, digitsBefore, inserting) => timeCaret(digitsBefore, inserting),
  parse: (text) => parseTimeMask(text, resolvedFormat.value, currentMeridiem()),
  toMask: (time) => timeToMask(time, resolvedFormat.value),
})

// @keyboard @core — the keys the mask itself needs, plus the down arrow, which is the one
// explicit way from the field into the picker.
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
  if (event.key === 'ArrowDown' && open.value && hasPicker.value) {
    // The one explicit route from the field into the picker.
    event.preventDefault()
    focusInPanel()
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
      // TRAP — the separator is PLACED by the mask and never typed, so erasing one has to
      // erase the DIGIT before it. Left alone, the mask would write it straight back and
      // the key would look dead.
      event.preventDefault()
      const n = digitsOf(el.value.slice(0, start)).length
      const digits = digitsOf(el.value)
      writeField(formatTimeMask(digits.slice(0, n - 1) + digits.slice(n)), timeCaret(n - 1))
      commitLive()
    }
    return
  }
  // Typing anything that is not a digit — the separator included, so that "9:30" can be
  // typed exactly as it reads — completes the hour with a leading zero and moves on to
  // the minutes.
  if (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !/\d/.test(event.key)
  ) {
    event.preventDefault()
    const digits = digitsOf(el.value)
    if (digits.length === 1) writeField(formatTimeMask(`0${digits}`), 3)
  }
}

/**
 * Pasting. A time recognizable as a whole is adopted as it stands; anything else
 * contributes its digits alone.
 */
function onFieldPaste(event: ClipboardEvent) {
  if (!typing.value) return
  const el = fieldEl.value
  if (!el) return
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') ?? '').trim()
  // A pasted 24-hour time is read as one whatever clock is on display: "19:05" means
  // seven in the evening even in a field showing a 12-hour clock.
  if (isValidTime(pasted)) {
    const text = timeToMask(pasted, resolvedFormat.value)
    writeField(text, text.length)
    if (pasted !== model.value) model.value = pasted
    return
  }
  const digits = digitsOf(el.value)
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? start
  const from = digitsOf(el.value.slice(0, start)).length
  const to = digitsOf(el.value.slice(0, end)).length
  const inserted = digitsOf(pasted)
  const next = (digits.slice(0, from) + inserted + digits.slice(to)).slice(0, 4)
  writeField(formatTimeMask(next), timeCaret(Math.min(from + inserted.length, next.length), true))
  commitLive()
}

function onFieldFocus() {
  if (!typing.value || refocusing) return
  openPanel(false)
}

function onRootKeydown(event: KeyboardEvent) {
  if (typing.value && event.key === 'Escape' && open.value) {
    event.preventDefault()
    closeAndFocus()
    return
  }
  onKeydown(event)
}

/* From here on: everything the list form needs. */

const options = computed<TimeOption[]>(() =>
  isList.value ? timeList(props.minuteStep, resolvedLocale.value, resolvedFormat.value) : [],
)

// @keyboard
/**
 * The rows the arrows may move to, gathered by hand rather than through the shared
 * helper.
 *
 * That helper asks the browser for the computed style of EVERY element it considers, to
 * skip the hidden ones. Across dozens of rows — a list at a five-minute step holds nearly
 * three hundred — that is a real cost, and none of these rows is ever hidden.
 */
const optionEls = (panel: HTMLElement) => [
  ...panel.querySelectorAll<HTMLElement>('[role="option"]'),
]

// @a11y
/**
 * On opening, the list is both scrolled and focused onto the current time — or onto the
 * NEAREST row, since a value need not be one of them: "09:07" against a list stepping
 * every fifteen minutes matches nothing at all.
 */
function focusListSelection(panel: HTMLElement) {
  const items = optionEls(panel)
  if (!items.length) return
  const minutes = minutesOf(model.value)
  const index =
    minutes === null ? 0 : clamp(Math.round(minutes / props.minuteStep), 0, items.length - 1)
  const el = items[index]
  // Called optionally, the unit-test environment implementing no scrolling. No scrolling
  // behaviour is requested either: leaving it out lets the stylesheet decide, which is
  // what makes the movement respect a reader who has asked for less motion.
  el?.scrollIntoView?.({ block: 'center' })
  el?.focus({ preventScroll: true })
}

/**
 * Choosing a row writes the value straight away and closes — no draft and no footer, the
 * same way choosing a single date closes the calendar.
 */
function selectTime(value: string) {
  model.value = value
  closeAndFocus()
}

// @keyboard @a11y
function onPanelKeydown(event: KeyboardEvent) {
  if (!isList.value) return
  const panel = panelRef.value?.el
  if (!panel) return
  if (event.key === 'Enter' || event.key === ' ') {
    // TRAP — cancelling the default here is MANDATORY, and the commit consequently has to
    // be explicit. Left alone, Enter would fire the row's own click — which closes the
    // panel — and then travel up to the root WITHOUT being marked as handled, so the
    // guard that stops a consumed key reopening the panel would not apply, and it would
    // reopen immediately.
    const value = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>(
      '[role="option"]',
    )?.dataset.value
    if (!value) return
    event.preventDefault()
    selectTime(value)
    return
  }
  arrowNavigate(event, panel, optionEls(panel), { vertical: true })
}

/*
 * The clear cross and the icon at the end of the field.
 *
 * The cross is the field's own, which renders it BEFORE the end icon rather than in its
 * place — the convention every field in the design system follows. In the list form that
 * gives exactly the cross-and-chevron pairing of a combobox, which is the right thing:
 * the two behave the same way.
 *
 * Whether the cross is shown has to be answered explicitly here: outside the typed mode
 * the field is read-only and would hide it, while the value comes from the panel.
 */
const canClear = computed(
  () =>
    props.clearable && !props.disabled && (hasValue.value || (typing.value && !!maskDraft.value)),
)
const endIcon = computed<IconSource | undefined>(() =>
  isList.value ? expandMoreIcon : hasPicker.value ? props.pickerIcon : undefined,
)
// @a11y @devwarn
/*
 * TRAP — the LABEL is defined at all times, even when no icon is rendered at all.
 *
 * The helper detecting a click handler on an icon warns AT SETUP if one is attached
 * without a label, and it has no way of knowing whether an icon exists. Since the
 * listener here is attached permanently and that detection is static, making the label
 * conditional would produce a false warning every time a typed field without a picker is
 * mounted.
 */
const endIconLabel = computed(() =>
  isList.value ? m.value.timeInput.openList : m.value.timeInput.openPicker,
)

function onEndIcon() {
  if (open.value) closeAndFocus()
  else openPanel(true)
}
</script>

<template>
  <div
    ref="rootEl"
    class="v-time-input"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    :data-mode="resolvedMode"
    @focusout="onFocusout"
    @keydown="onRootKeydown"
  >
    <div class="v-time-input-row">
      <div class="v-time-input-control" @click="onControlClick">
        <!-- The field is declared a combobox rather than left as the plain text box it
             implicitly is, because a text box may not carry the attribute saying whether
             something is expanded — the same reasoning as in VDateInput. Here it also
             agrees with the list form, where what the field opens really is a list. -->
        <VInput
          ref="inputRef"
          v-model="fieldModel"
          :inputmode="typing ? 'numeric' : undefined"
          :autocomplete="typing ? 'off' : undefined"
          v-bind="forwardedAttrs"
          :readonly="!typing"
          :label="label"
          :hint="hint"
          :placeholder="placeholder ?? (typing ? m.timeInput.maskPlaceholder : undefined)"
          :size="size"
          :compact="compact"
          :disabled="disabled"
          :invalid="invalid"
          :clearable="clearable"
          :clear-visible="canClear"
          :clear-label="m.timeInput.clear"
          :icon-end="endIcon"
          :icon-end-label="endIconLabel"
          :role="hasPanel ? 'combobox' : undefined"
          :aria-haspopup="hasPanel ? (isList ? 'listbox' : 'dialog') : undefined"
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

      <!-- The AM/PM control beside the field, which the two typed forms cannot do without:
           the mask needs the half of the day while the panel is shut, and the list form
           has no picker at all. It is dropped in the READ-ONLY form alone, where the
           picker is the only way in and carries its own.

           It stays INSIDE the component's root: clicking it must not count as the focus
           leaving, which would close the panel under the reader's hand. -->
      <VToggle
        v-if="resolvedFormat === '12h' && resolvedMode !== 'readonly'"
        v-model="meridiemModel"
        class="v-time-input-meridiem"
        mandatory
        variant="outline"
        :size="size"
        :compact="compact"
        :label="m.timePicker.meridiem"
      >
        <VToggleItem value="AM" :label="m.timePicker.am" />
        <VToggleItem value="PM" :label="m.timePicker.pm" />
      </VToggle>
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
      anchor="--time-input-anchor"
      :placement="placement"
      surface
      :role="isList ? 'listbox' : 'dialog'"
      :class="isList ? 'v-time-input-list v-control' : 'v-time-input-panel'"
      :data-size="isList ? size : undefined"
      :data-compact="isList && compact ? '' : undefined"
      :aria-label="label ?? (isList ? m.timeInput.listLabel : m.timeInput.pickerLabel)"
      @mousedown="onPanelMousedown"
      @keydown="onPanelKeydown"
    >
      <!-- The list: rows the focus really moves between, as in a menu or a calendar —
           unlike VCombobox, where the focus stays in the field — and a choice written
           straight away on a click or on Enter. -->
      <template v-if="isList">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          role="option"
          tabindex="-1"
          class="v-time-input-option"
          :data-value="option.value"
          :aria-selected="option.value === model ? 'true' : 'false'"
          @click="selectTime(option.value)"
        >
          {{ option.label }}
        </button>
      </template>

      <!-- The picker works on the DRAFT and not on the value, which is what makes OK the
           only way in: Cancel, Escape and the focus leaving simply drop it. The two
           actions are handed to its own footer slot, since they belong to this panel
           rather than to a clock shown on its own. -->
      <VTimePicker
        v-else
        ref="pickerRef"
        v-model="draft"
        :format="resolvedFormat"
        :locale="resolvedLocale"
        :minute-step="minuteStep"
        @confirm="confirm"
      >
        <template #footer>
          <VButton variant="ghost" tone="neutral" @click="cancel">{{ m.common.cancel }}</VButton>
          <VButton @click="confirm">{{ m.common.confirm }}</VButton>
        </template>
      </VTimePicker>
    </VPopover>
  </div>
</template>

<style>
@layer vectis.components {
  .v-time-input {
    /* Confines the anchor name to this instance. It is declared on the root because that
       is the common ancestor of the field and the panel. */
    anchor-scope: --time-input-anchor;
    display: block;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /* The row holding the field: the field takes whatever room is left, and the AM/PM
     control keeps its natural width. */
  .v-time-input-row {
    display: flex;
    align-items: stretch;
    gap: var(--vectis-space-2);
  }

  .v-time-input-control {
    anchor-name: --time-input-anchor;
    flex: 1;
    /* Without this the field would refuse to shrink below its own content and would
       overflow the row. */
    min-inline-size: 0;
    cursor: pointer;
  }

  /* A field one types into shows the text cursor rather than the pointer a clickable
     control shows. Its figures are also given equal widths: with proportional ones the
     text shifts as digits are typed, and the caret appears to jitter. */
  .v-time-input[data-mode='input'] .v-time-input-control {
    cursor: text;
  }

  .v-time-input[data-mode='input'] .v-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* The AM/PM control lines up with the FIELD and not with the whole block, which also
     stacks a label above and a hint below it. Those two are compensated with margins
     derived from their own type, so the control sits exactly beside the field whatever
     the field is given. */
  .v-time-input-meridiem {
    flex: none;
    align-self: center;
  }

  .v-time-input-row:has(.v-input-label) .v-time-input-meridiem {
    margin-block-start: calc(
      var(--vectis-text-label-size) * var(--vectis-text-label-leading) + var(--vectis-space-1)
    );
  }

  .v-time-input-row:has(.v-input-hint) .v-time-input-meridiem {
    margin-block-end: calc(
      var(--vectis-text-caption-size) * var(--vectis-text-caption-leading) + var(--vectis-space-1)
    );
  }

  /* The anchoring and the panel's surface both come from VPopover; what is left here is
     the padding around the picker. The picker brings its own layout — including the gap
     between its parts and the centring of the face — so nothing of that is declared here.

     TRAP — NO `display` here, and that is not an omission. The column layout comes from
     `.v-panel`, which is (0,1,0) and therefore loses to `.v-overlay:not(:popover-open)`, the
     guard that hides a closed popover. This selector is (0,2,0): declaring a display on it
     would TIE with that guard, and a tie between two sheets is settled by whichever the
     consumer's bundler put last. The symptom when the component wins is silent and nasty —
     the closed panel keeps its box, invisible at `opacity: 0` and fixed over the page, and
     swallows every click that lands on it.

     The selector compounds two classes VPopover puts on the same element, because the
     padding is also declared by the shared panel class: at equal specificity the winner
     would be whichever sheet the consumer's bundler put last. The size attribute cannot
     serve that purpose here — the picker's panel carries none. */
  .v-popover-panel.v-time-input-panel {
    width: max-content;
    padding: var(--vectis-space-3);
    color: var(--vectis-color-text);
  }

  /* The list's surface comes from the shared panel class, and its rows read their
     dimensions from the size class set on the PANEL. What stays here are the panel's own
     dimensions, which the shared class deliberately declares none of. */
  .v-time-input-list {
    min-inline-size: anchor-size(width);
    max-block-size: var(--vectis-control-size-time-input-list-max-block);
    overflow: auto;
  }

  .v-time-input-option {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: var(--control-height);
    padding: var(--vectis-space-1) var(--control-padding-inline);
    border: none;
    border-radius: var(--vectis-radius-sm);
    background: transparent;
    color: var(--vectis-color-text);
    font-family: inherit;
    font-size: var(--control-font-size);
    line-height: var(--vectis-text-body-md-leading);
    font-variant-numeric: tabular-nums;
    text-align: start;
    cursor: pointer;
  }

  .v-time-input-option:hover {
    background: var(--vectis-color-surface-muted);
  }

  /* The focus ring is drawn INSIDE the row: the panel scrolls, and a ring sitting outside
     it would be cropped on the first and last rows. */
  .v-time-input-option:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  .v-time-input-option[aria-selected='true'] {
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }

  .v-time-input-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--vectis-space-2);
  }
}
</style>
