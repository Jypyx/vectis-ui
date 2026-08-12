<script setup lang="ts">
import { computed, ref, useId, watch, watchEffect } from 'vue'

import VButton from '../VButton/VButton.vue'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import VPopover from '../VPopover/VPopover.vue'
import VToggle from '../VToggle/VToggle.vue'
import type { ToggleModelValue } from '../VToggle/VToggle.vue'
import VToggleItem from '../VToggle/VToggleItem.vue'
import VTimePickerDial from './VTimePickerDial.vue'
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
import type { HourFormat, Meridiem, TimeOption } from '../../utils/time'
import { arrowNavigate } from '../../utils/arrowNav'
import { clamp } from '../../utils/number'
import { isDev } from '../../utils/env'
import { digitsOf, pad2 } from '../../utils/text'

import { useRootAttrs } from '../../composables/useRootAttrs'

import { useFieldPanel } from '../../composables/useFieldPanel'
import { useMaskedField } from '../../composables/useMaskedField'
import { useLocale, useMessages } from '../../i18n/state'

// @a11y @core
/**
 * A field for choosing a time, with an optional panel below it. The shell is the same one
 * VDatePicker uses: the panel is opened from code, which is what lets the focus be moved
 * into it, and closed when the focus leaves the component or Escape is pressed.
 *
 * The field comes in three forms. It can be TYPED into, hours and minutes behind a mask,
 * optionally with a dial beside it. It can be read-only, the dial then being the only way
 * in. Or it can offer a LIST of times at a fixed interval, which suits booking a slot far
 * better than pointing at a clock face.
 *
 * The two panels commit differently, and deliberately so. The DIAL works on a draft that
 * only OK writes to the value — Cancel, Escape and the focus leaving all discard it —
 * because dragging a hand across a clock passes over dozens of times nobody meant. The
 * LIST writes immediately: choosing a row there is one deliberate gesture.
 *
 * Whatever is displayed, the value itself is always a 24-hour time.
 */
export type TimePickerFormat = HourFormat
export type TimePickerMode = 'readonly' | 'input' | 'list'

const MODES: TimePickerMode[] = ['readonly', 'input', 'list']

type Placement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'

interface TimePickerProps {
  /**
   * Whether times are shown on a 12- or a 24-hour clock. Left out, the reader's language
   * decides, which is almost always what one wants.
   */
  format?: TimePickerFormat
  /**
   * Which form the field takes: one that can be TYPED into, a read-only one where the
   * dial is the only way in — so the dial is forced on there — or a LIST of times at a
   * fixed interval, where a dial would make no sense.
   */
  mode?: TimePickerMode
  /**
   * Offers the dial beside a field one can type into: an icon at the end of the field,
   * and a panel it opens.
   *
   * It is left undefined by default rather than set to off, which is what distinguishes
   * "not given" from an explicit refusal — and therefore what allows warning only the
   * consumer who really asked to remove the dial from a read-only field, where it is the
   * only way in.
   */
  showDial?: boolean
  /**
   * The interval between two times that can be chosen. It applies to the dial, to the
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
   * The icon that opens the DIAL, at the end of the field. It has no effect on the list
   * form, whose chevron follows the combobox convention. The clear cross appears to its
   * left rather than in its place.
   */
  clockIcon?: IconSource
  /** Where the panel opens relative to the field. */
  placement?: Placement
}

const props = withDefaults(defineProps<TimePickerProps>(), {
  format: undefined,
  // Deliberately left undefined rather than defaulted to the typed mode: that is what
  // distinguishes "the prop was not given" from "the prop was given this value", and
  // therefore what allows warning ONLY the consumer who explicitly asked for something
  // that cannot work.
  mode: undefined,
  showDial: undefined,
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
  clockIcon: 'schedule',
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
const panelId = useId()

/** The real input inside the field, which the mask and the caret work on. */
const fieldEl = computed<HTMLInputElement | null>(() => inputRef.value?.el ?? null)

const resolvedMode = computed<TimePickerMode>(() => {
  // TRAP — the default is applied BEFORE the value is checked. A prop that was never
  // given is not an unknown value, and treating it as one would warn on a bare
  // `<VTimePicker />`.
  const mode = props.mode ?? 'input'
  return MODES.includes(mode) ? mode : 'input'
})
const typing = computed(() => resolvedMode.value === 'input')
const isList = computed(() => resolvedMode.value === 'list')
/**
 * Whether there is a dial. It is forced on a read-only field, where nothing else could
 * fill it; offered beside a field one types into; and meaningless in the list form, which
 * has a panel of its own.
 */
const hasDial = computed(
  () => resolvedMode.value === 'readonly' || (typing.value && props.showDial === true),
)
const hasPanel = computed(() => hasDial.value || isList.value)

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
      console.warn(`[VTimePicker] minuteStep ${props.minuteStep} — a divisor of 60 is expected.`)
    if (props.mode !== undefined && !MODES.includes(props.mode))
      console.warn(
        `[VTimePicker] unknown mode "${props.mode}": use "input" (the default), "readonly" or "list".`,
      )
    if (resolvedMode.value === 'readonly' && props.showDial === false)
      console.warn(
        '[VTimePicker] showDial is forced to true in "readonly" mode: with no dial, a read-only field would be impossible to fill.',
      )
    if (isList.value && props.showDial === true)
      console.warn(
        '[VTimePicker] showDial is ignored in "list" mode: the list of times is the only panel.',
      )
    if (isList.value && props.minuteStep < 5)
      console.warn(
        `[VTimePicker] minuteStep ${props.minuteStep} in "list" mode would render ${Math.ceil(1440 / props.minuteStep)} rows: a step of 15 or 30 minutes is expected.`,
      )
  })
}

const activeStep = ref<'hour' | 'minute'>('hour')

// The time being built on the dial. Nothing here reaches the value until OK is pressed.
const draftHour = ref(0) // always on the 24-hour clock, whatever is displayed
const draftMinute = ref(0)

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
 * The AM/PM control sits OUTSIDE the panel, beside the field, so that it serves all three
 * forms. It therefore writes to the VALUE and not to the dial's draft.
 */
const meridiemModel = computed<ToggleModelValue>({
  get: () => (modelParts.value ? to12h(modelParts.value.hour).meridiem : pendingMeridiem.value),
  set: (value) => {
    const meridiem: Meridiem = value === 'PM' ? 'PM' : 'AM'
    pendingMeridiem.value = meridiem
    const parts = modelParts.value
    // With no time set there is nothing to convert, so the choice is simply REMEMBERED
    // and applies to the first time typed or chosen.
    if (parts) model.value = formatTime(to24h(to12h(parts.hour).hour, meridiem), parts.minute)
    // With the dial open the draft has to follow as well, or OK would write back the half
    // of the day the reader has just changed.
    if (open.value && hasDial.value) draftHour.value = to24h(to12h(draftHour.value).hour, meridiem)
  },
})

const displayHourText = computed(() =>
  pad2(resolvedFormat.value === '12h' ? to12h(draftHour.value).hour : draftHour.value),
)

const hasValue = computed(() => !!modelParts.value)
const displayText = computed(() =>
  model.value ? formatDisplay(model.value, resolvedLocale.value, resolvedFormat.value) : '',
)

// @a11y
// Where the focus goes when the panel opens.
function focusInPanel() {
  const panel = panelRef.value?.el
  if (!panel) return
  if (isList.value) focusListSelection(panel)
  // On the dial the useful target is the control the arrows drive. It is found by
  // searching the panel rather than exposed by the dial itself, which therefore has
  // nothing to publish and nothing to keep in step.
  else panel.querySelector<HTMLElement>('[role="slider"]')?.focus()
}

// The whole "field plus panel" shell, shared with VDatePicker. What is specific to this
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
      // Only the dial works on a draft; the list writes its choice straight away.
      if (!hasDial.value) return
      const parts = modelParts.value
      if (parts) {
        draftHour.value = parts.hour
        draftMinute.value = parts.minute
      } else {
        // Opening on the current time when none is set. Reading the clock is safe here:
        // this runs from a handler, hence in a browser, never during a render.
        const now = new Date()
        draftHour.value = now.getHours()
        draftMinute.value = snapMinute(now.getMinutes(), props.minuteStep)
      }
      activeStep.value = 'hour'
    },
    onClose: () => {
      liveMessage.value = ''
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

/** OK: the ONE route by which the dial's draft becomes the value. */
function confirm() {
  model.value = formatTime(draftHour.value, draftMinute.value)
  closeAndFocus()
}

function cancel() {
  closeAndFocus()
}

/**
 * A step of the dial has been settled: after the hour comes the minutes, and after the
 * minutes comes OK — but by KEYBOARD only. Releasing the pointer must not close the
 * panel: on a clock face, letting go of the hand is how one stops adjusting it, not how
 * one confirms.
 */
function onDialConfirm(via: 'pointer' | 'keyboard') {
  if (activeStep.value === 'hour') activeStep.value = 'minute'
  else if (via === 'keyboard') confirm()
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

// Escape and the focus leaving both close WITHOUT committing, which is the dial's Cancel
// behaviour: closing never writes the value, and only OK does.

// @a11y
// Which step the dial is on is otherwise carried by the control's own name alone, and a
// change of name is not reliably announced. A politely announced region says it a second
// time. The wording has no prop: the dictionary is where it is changed.
const m = useMessages()

const liveMessage = ref('')
watch(activeStep, (step) => {
  if (open.value)
    liveMessage.value =
      step === 'minute' ? m.value.timePicker.minuteStep : m.value.timePicker.hourStep
})

/* From here on: everything the typed field needs. */

const currentMeridiem = (): Meridiem => (meridiemModel.value === 'PM' ? 'PM' : 'AM')

/*
 * The mask machinery — the text being typed, the bridge to the value, the reformatting
 * that preserves the caret, the commit and the silent revert — is shared with VDatePicker
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
// explicit way from the field into the dial.
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
  if (event.key === 'ArrowDown' && open.value && hasDial.value) {
    // The one explicit route from the field into the dial.
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
  isList.value ? 'expand_more' : hasDial.value ? props.clockIcon : undefined,
)
// @a11y @devwarn
/*
 * TRAP — the LABEL is defined at all times, even when no icon is rendered at all.
 *
 * The helper detecting a click handler on an icon warns AT SETUP if one is attached
 * without a label, and it has no way of knowing whether an icon exists. Since the
 * listener here is attached permanently and that detection is static, making the label
 * conditional would produce a false warning every time a typed field without a dial is
 * mounted.
 */
const endIconLabel = computed(() =>
  isList.value ? m.value.timePicker.openList : m.value.timePicker.openDial,
)

function onEndIcon() {
  if (open.value) closeAndFocus()
  else openPanel(true)
}
</script>

<template>
  <div
    ref="rootEl"
    class="v-timepicker"
    :class="rootClass"
    :style="rootStyle"
    :data-open="open ? '' : undefined"
    :data-mode="resolvedMode"
    @focusout="onFocusout"
    @keydown="onRootKeydown"
  >
    <div class="v-timepicker-row">
      <div class="v-timepicker-control" @click="onControlClick">
        <!-- The field is declared a combobox rather than left as the plain text box it
             implicitly is, because a text box may not carry the attribute saying whether
             something is expanded — the same reasoning as in VDatePicker. Here it also
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
          :placeholder="placeholder ?? (typing ? m.timePicker.maskPlaceholder : undefined)"
          :size="size"
          :compact="compact"
          :disabled="disabled"
          :invalid="invalid"
          :clearable="clearable"
          :clear-visible="canClear"
          :clear-label="m.timePicker.clear"
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

      <!-- The AM/PM control sits OUTSIDE the panel, which is what lets it serve all three
           forms and write to the value directly. It stays INSIDE the component's root,
           though: clicking it must not count as the focus leaving, which would close the
           panel under the reader's hand. -->
      <VToggle
        v-if="resolvedFormat === '12h'"
        v-model="meridiemModel"
        class="v-timepicker-meridiem"
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
      anchor="--timepicker-anchor"
      :placement="placement"
      surface
      :role="isList ? 'listbox' : 'dialog'"
      :class="isList ? 'v-timepicker-list v-control' : 'v-timepicker-panel'"
      :data-size="isList ? size : undefined"
      :data-compact="isList && compact ? '' : undefined"
      :aria-label="label ?? (isList ? m.timePicker.listLabel : m.timePicker.dialLabel)"
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
          class="v-timepicker-option"
          :data-value="option.value"
          :aria-selected="option.value === model ? 'true' : 'false'"
          @click="selectTime(option.value)"
        >
          {{ option.label }}
        </button>
      </template>

      <template v-else>
        <!-- The two large numerals switch between adjusting the hour and the minutes. The
             one being adjusted takes the accent tone, which on a quiet button shows as
             the colour of the numeral rather than as a filled background. -->
        <div class="v-timepicker-time">
          <VButton
            class="v-timepicker-cell"
            variant="ghost"
            size="lg"
            :tone="activeStep === 'hour' ? 'accent' : 'neutral'"
            :aria-pressed="activeStep === 'hour' ? 'true' : 'false'"
            :aria-label="m.timePicker.selectHour"
            @click="activeStep = 'hour'"
          >
            {{ displayHourText }}
          </VButton>
          <span class="v-timepicker-sep" aria-hidden="true">:</span>
          <VButton
            class="v-timepicker-cell"
            variant="ghost"
            size="lg"
            :tone="activeStep === 'minute' ? 'accent' : 'neutral'"
            :aria-pressed="activeStep === 'minute' ? 'true' : 'false'"
            :aria-label="m.timePicker.selectMinute"
            @click="activeStep = 'minute'"
          >
            {{ pad2(draftMinute) }}
          </VButton>
        </div>

        <VTimePickerDial
          :step="activeStep"
          :format="resolvedFormat"
          :hour="draftHour"
          :minute="draftMinute"
          :minute-step="minuteStep"
          @update:hour="draftHour = $event"
          @update:minute="draftMinute = $event"
          @confirm-step="onDialConfirm"
        />

        <div class="v-visually-hidden" aria-live="polite">{{ liveMessage }}</div>

        <div class="v-timepicker-footer">
          <VButton variant="ghost" tone="neutral" @click="cancel">{{ m.common.cancel }}</VButton>
          <VButton @click="confirm">{{ m.common.confirm }}</VButton>
        </div>
      </template>
    </VPopover>
  </div>
</template>

<style>
@layer vectis.components {
  .v-timepicker {
    /* Confines the anchor name to this instance. It is declared on the root because that
       is the common ancestor of the field and the panel. */
    anchor-scope: --timepicker-anchor;
    display: block;
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /* The row holding the field: the field takes whatever room is left, and the AM/PM
     control keeps its natural width. */
  .v-timepicker-row {
    display: flex;
    align-items: stretch;
    gap: var(--vectis-space-2);
  }

  .v-timepicker-control {
    anchor-name: --timepicker-anchor;
    flex: 1;
    /* Without this the field would refuse to shrink below its own content and would
       overflow the row. */
    min-inline-size: 0;
    cursor: pointer;
  }

  /* A field one types into shows the text cursor rather than the pointer a clickable
     control shows. Its figures are also given equal widths: with proportional ones the
     text shifts as digits are typed, and the caret appears to jitter. */
  .v-timepicker[data-mode='input'] .v-timepicker-control {
    cursor: text;
  }

  .v-timepicker[data-mode='input'] .v-input-control {
    font-variant-numeric: tabular-nums;
  }

  /* The AM/PM control lines up with the FIELD and not with the whole block, which also
     stacks a label above and a hint below it. Those two are compensated with margins
     derived from their own type, so the control sits exactly beside the field whatever
     the field is given. */
  .v-timepicker-meridiem {
    flex: none;
    align-self: center;
  }

  .v-timepicker-row:has(.v-input-label) .v-timepicker-meridiem {
    margin-block-start: calc(
      var(--vectis-text-label-size) * var(--vectis-text-label-leading) + var(--vectis-space-1)
    );
  }

  .v-timepicker-row:has(.v-input-hint) .v-timepicker-meridiem {
    margin-block-end: calc(
      var(--vectis-text-caption-size) * var(--vectis-text-caption-leading) + var(--vectis-space-1)
    );
  }

  /* The anchoring and the panel's surface both come from VPopover; what is left here is
     the column layout and the padding the dial needs.

     TRAP — declaring a display here overrides the browser's own rule hiding a closed
     popover. What closes it back is the shared guard on the overlay class, which is more
     specific than anything a component can write.

     The selector compounds two classes VPopover puts on the same element, because the gap
     and the padding are also declared by the shared panel class: at equal specificity the
     winner would be whichever sheet the consumer's bundler put last. The size attribute
     cannot serve that purpose here — the dial's panel carries none. */
  .v-popover-panel.v-timepicker-panel {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-4);
    width: max-content;
    padding: var(--vectis-space-3);
    color: var(--vectis-color-text);
  }

  /* A time written in figures always reads hours then minutes, in every language. Forcing
     the direction here is what stops bidirectional reordering from swapping the two in a
     right-to-left page. */
  .v-timepicker-time {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--vectis-space-2);
    direction: ltr;
  }

  /* The two large numerals are ordinary quiet buttons. What is overridden here is the
     "large numeral" look alone — the width and the type; the height, the states, the
     focus ring and the transitions all come from the button itself.

     The selector is qualified by an attribute that button always renders, which is what
     makes it win whatever order the two sheets end up in. */
  .v-timepicker-cell[data-size] {
    width: var(--control-height);
    font-size: var(--vectis-text-heading-1-size);
    font-weight: var(--vectis-text-heading-2-weight);
    /* Figures of equal width, so that going from "11" to "00" does not shift the cell. */
    font-variant-numeric: tabular-nums;
  }

  .v-timepicker-sep {
    font-size: var(--vectis-text-heading-2-size);
    color: var(--vectis-color-text);
    user-select: none;
  }

  .v-timepicker-panel .v-timepicker-dial-face {
    align-self: center;
  }

  /* The list's surface comes from the shared panel class, and its rows read their
     dimensions from the size class set on the PANEL. What stays here are the panel's own
     dimensions, which the shared class deliberately declares none of. */
  .v-timepicker-list {
    min-inline-size: anchor-size(width);
    max-block-size: var(--vectis-control-size-timepicker-list-max-block);
    overflow: auto;
  }

  .v-timepicker-option {
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

  .v-timepicker-option:hover {
    background: var(--vectis-color-surface-muted);
  }

  /* The focus ring is drawn INSIDE the row: the panel scrolls, and a ring sitting outside
     it would be cropped on the first and last rows. */
  .v-timepicker-option:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  .v-timepicker-option[aria-selected='true'] {
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }

  .v-timepicker-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--vectis-space-2);
  }
}
</style>
