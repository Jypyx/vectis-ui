<script setup lang="ts">
// @a11y @keyboard @core
/**
 * An inline clock for choosing a time, the hour-and-minute counterpart of VDatePicker.
 * VTimeInput does no more than dress it in a field and a popover; it is usable on its own.
 *
 * Three parts: two large numerals saying what has been chosen and switching between hours
 * and minutes, the AM/PM toggle beside them on a 12-hour clock, and the face below, where a
 * time is POINTED AT rather than stepped through.
 *
 * Nothing native covers choosing a value by angle, so the JS does two things — turning a
 * point on the face into a time (the face measured once, then pure trigonometry in
 * `utils/time`) and implementing a slider's keyboard.
 *
 * Everything one SEES is CSS: the numerals are placed around the circle and the hand turned,
 * both from one unitless turn fraction set inline.
 *
 * Exactly ONE focusable element on the face, announced as a slider. The numerals are
 * `aria-hidden` markers reached by angle rather than one cell at a time, which is why that
 * single element has to carry the whole spoken value.
 */

import { computed, ref, watchEffect } from 'vue'

import VButton from '../VButton/VButton.vue'
import VToggle from '../VToggle/VToggle.vue'
import type { ToggleModelValue } from '../VToggle/VToggle.vue'
import VToggleItem from '../VToggle/VToggleItem.vue'
import {
  DIAL_INNER_THRESHOLD,
  angleToIndex,
  dialIndexToHour24,
  distanceFraction,
  formatTime,
  hour24ToDial,
  hourCycleFor,
  parseTime,
  snapMinute,
  to12h,
  to24h,
} from '../../utils/time'
import type { HourFormat, Meridiem } from '../../utils/time'
import {
  allowedMinutesFor,
  firstAllowed,
  isHourAllowed,
  isTimeAllowed,
  limitsProblem,
  nearestAllowedMinute,
  resolveLimits,
} from './limits'
import type { TimeMatcher } from './limits'
import { pad2 } from '../../utils/text'
import { isDev } from '../../utils/env'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useLocale, useMessages } from '../../i18n/state'

export type TimePickerFormat = HourFormat

/** Which of the two halves of a time is being adjusted. */
export type TimePickerStep = 'hour' | 'minute'

interface TimePickerProps {
  /**
   * Whether the face shows a 12- or a 24-hour clock. Left out, the reader's language
   * decides, which is almost always what one wants.
   */
  format?: TimePickerFormat
  /**
   * A BCP 47 locale, which decides the clock. It TAKES PRECEDENCE over the design
   * system's global locale and falls back to it — which is why it has no literal default:
   * `undefined` has to stay recognizable for the global locale to have its chance.
   */
  locale?: string
  /**
   * The interval the minutes snap to, both when dragging and with the arrow keys. The face
   * prints only the minutes it can reach, so a step of a quarter of an hour marks four.
   */
  minuteStep?: number
  /**
   * The earliest time that can be chosen, inclusive, as a canonical 24-hour `'HH:mm'`.
   * What it rules out is DISABLED on the face rather than removed from it: a bound is
   * only readable beside what it excludes.
   */
  min?: string
  /** The latest time that can be chosen, inclusive, written like `min`. */
  max?: string
  /**
   * Which hours can be chosen: the list of them, or a rule answering for one. The hour
   * handed to a rule is always the 24-hour one, whichever clock is on display, so the
   * same rule holds on both faces.
   */
  allowedHours?: TimeMatcher
  /** Which minutes can be chosen: the list of them, or a rule answering for one. */
  allowedMinutes?: TimeMatcher
  /**
   * Makes the whole clock unusable: the hand cannot be moved, the half-day cannot be
   * changed, and everything greys out through the colour tokens.
   */
  disabled?: boolean
  /**
   * Shows the time without letting it be changed. The face keeps its focus and the two
   * numerals still switch between the hour and the minutes, so the value can be read in
   * full — which is what separates it from `disabled`.
   */
  readonly?: boolean
  /**
   * The accessible name of the whole clock, its two numerals and its face together. It
   * falls back to the dictionary, and a consumer `aria-label` wins over it. The face
   * keeps its own name, which says whether the hand is on the hour or the minutes.
   */
  label?: string
}

const props = withDefaults(defineProps<TimePickerProps>(), {
  format: undefined,
  locale: undefined,
  minuteStep: 1,
  min: undefined,
  max: undefined,
  allowedHours: undefined,
  allowedMinutes: undefined,
  disabled: false,
  readonly: false,
  label: undefined,
})

/**
 * The time, always as a 24-hour "HH:mm" string whatever clock is displayed. A consumer
 * therefore never has to know which clock the reader's language uses.
 *
 * With no value at all the clock shows midnight. It is deliberately NOT the current time:
 * reading the clock while rendering would make a page drawn on a server disagree with the
 * same page in the browser. A component that wants to open on the current time sets it
 * from a handler — which is exactly what VTimeInput does.
 */
const model = defineModel<string | null>({ default: null })

const emit = defineEmits<{
  /**
   * The reader has finished: the minutes were settled from the KEYBOARD. Releasing the
   * pointer does not count — on a clock face, letting go of the hand is how one stops
   * adjusting it, not how one confirms.
   */
  confirm: []
}>()

defineSlots<{
  /** A strip at the foot of the clock — the place for actions such as Cancel and OK. */
  footer?(): unknown
}>()

const m = useMessages()
// @a11y — a roleless box cannot carry an accessible name (axe: aria-prohibited-attr),
// so the root is a named group: the VCarousel viewport arrangement.
const ariaLabel = useAriaLabel(() => props.label ?? m.value.timePicker.label)
const vectisLocale = useLocale()
/* The prop wins, and the design system's global locale is what it falls back to. */
const resolvedLocale = computed(() => props.locale ?? vectisLocale.value)
const resolvedFormat = computed<TimePickerFormat>(
  () => props.format ?? hourCycleFor(resolvedLocale.value),
)

/** The restrictions, resolved once for the whole render. */
const limits = computed(() => resolveLimits(props))

/** Whether an hour is one the restrictions still leave something in. */
const isAvailableHour = (candidate: number) => isHourAllowed(candidate, limits.value)

// @devwarn
if (isDev) {
  watchEffect(() => {
    const problem = limitsProblem(limits.value)
    if (problem) console.warn(`[VTimePicker] ${problem}`)
  })
}

/** Which of the two is being adjusted. It starts on the hour and moves on by itself. */
const step = ref<TimePickerStep>('hour')

const parts = computed(() => parseTime(model.value) ?? { hour: 0, minute: 0 })
const hour = computed(() => parts.value.hour)
const minute = computed(() => parts.value.minute)

/*
 * The two writers are the SINGLE cut-off point for the restrictions: the pointer, the six
 * keys and the AM/PM control all write through them and through nothing else, so not one
 * handler carries a guard of its own.
 */

/**
 * Writing the hour. An hour with nothing left in it has no minute to fall back on, which
 * is what refuses it; one that is only PARTLY available pulls the minutes to what it does
 * allow, since `min: '09:30'` must not be left holding 09:00.
 *
 * The minute in force is kept whenever it is allowed, which is also what leaves an
 * unrestricted clock exactly as it was: a value off the step, 09:07 on a quarter-hour
 * face, belongs to the consumer and is not ours to round.
 */
function setHour(value: number | null) {
  // The two writers below are the ONLY way the value ever changes — pointer, keys and the
  // half-day control all come through them — so the two states are refused here and
  // nowhere else. Changing which face is shown stays allowed under `readonly`: reading
  // the minutes is not changing them.
  if (props.disabled || props.readonly) return
  if (value === null) return
  const minutes = isTimeAllowed(value, minute.value, limits.value)
    ? minute.value
    : nearestAllowedMinute(value, minute.value, limits.value)
  if (minutes === null) return
  model.value = formatTime(value, minutes)
}

/** Writing the minutes. Null is "there was nowhere to go", which every key can produce. */
function setMinute(value: number | null) {
  if (props.disabled || props.readonly) return
  if (value === null || !isTimeAllowed(hour.value, value, limits.value)) return
  model.value = formatTime(hour.value, value)
}

// @a11y
/*
 * Which step the clock is on is otherwise carried by the face's own name alone, and a
 * change of name is not reliably announced. A politely announced region says it a second
 * time. The wording has no prop: the dictionary is where it is changed.
 *
 * It is written HERE, by the function the reader's own gestures go through, rather than by
 * a watcher on the step: putting the clock back on the hour between two openings — what
 * `reset` does — must stay silent, and a watcher could not tell the two apart.
 */
const liveMessage = ref('')

function setStep(next: TimePickerStep) {
  step.value = next
  liveMessage.value =
    next === 'minute' ? m.value.timePicker.minuteStep : m.value.timePicker.hourStep
}

/** One numeral on the face. */
interface DialCell {
  key: string
  /** What is printed. */
  label: string
  /** Where it sits, as a fraction of a full turn from twelve o'clock. */
  turn: number
  /** Which of the two circles it belongs to, a 24-hour face having an inner one. */
  ring: 'outer' | 'inner'
  /** Whether it is the value currently being pointed at. */
  selected: boolean
  /** Whether the restrictions rule it out: it is drawn as such, and refuses the pointer. */
  disabled: boolean
}

/**
 * The minutes the face prints. A numeral one can point at and not land on is a lie, which
 * the hand tells the moment it settles beside it rather than on it, so a marker is only
 * ever a minute `minuteStep` actually reaches.
 *
 * How MANY of them is the other half of the question: sixty numerals would be unreadable,
 * so a step fine enough to offer more than twelve values keeps the five-minute grid a
 * clock is read on — minus, again, whatever it cannot reach, a step of two printing ten
 * past and not five past.
 */
const minuteMarks = computed(() => {
  // A step at or below one minute is what `snapMinute` reads as "every minute".
  const interval = props.minuteStep > 1 ? props.minuteStep : 1
  const spacing = 60 / interval <= 12 ? interval : 5
  const marks: number[] = []
  for (let minutes = 0; minutes < 60; minutes += spacing)
    if (minutes % interval === 0) marks.push(minutes)
  return marks
})

const cells = computed<DialCell[]>(() => {
  if (step.value === 'minute') {
    return minuteMarks.value.map((minutes) => ({
      key: `m-${minutes}`,
      label: pad2(minutes),
      turn: minutes / 60,
      ring: 'outer' as const,
      selected: minute.value === minutes,
      disabled: !isTimeAllowed(hour.value, minutes, limits.value),
    }))
  }
  const outer: DialCell[] = Array.from({ length: 12 }, (_, i) => {
    // The hour the cell would set, which on a 12-hour face is what the half of the day in
    // force turns it into: that is the one the restrictions have to be asked about.
    const hour24 =
      resolvedFormat.value === '24h'
        ? dialIndexToHour24(i, 'outer')
        : to24h(i === 0 ? 12 : i, currentMeridiem.value)
    return {
      key: `o-${i}`,
      label: String(i === 0 ? 12 : i),
      turn: i / 12,
      ring: 'outer' as const,
      selected:
        resolvedFormat.value === '24h'
          ? hour.value === hour24
          : to12h(hour.value).hour === (i === 0 ? 12 : i),
      disabled: !isAvailableHour(hour24),
    }
  })
  if (resolvedFormat.value === '12h') return outer
  const inner: DialCell[] = Array.from({ length: 12 }, (_, i) => {
    const hour24 = dialIndexToHour24(i, 'inner')
    return {
      key: `i-${i}`,
      label: pad2(hour24),
      turn: i / 12,
      ring: 'inner' as const,
      selected: hour.value === hour24,
      disabled: !isAvailableHour(hour24),
    }
  })
  return [...outer, ...inner]
})

const handTurn = computed(() => {
  if (step.value === 'minute') return minute.value / 60
  const index =
    resolvedFormat.value === '24h' ? hour24ToDial(hour.value).index : to12h(hour.value).hour % 12
  return index / 12
})

const handRing = computed(() =>
  step.value === 'hour' && resolvedFormat.value === '24h' ? hour24ToDial(hour.value).ring : 'outer',
)

/**
 * Whether the hand points at a minute that has no marker of its own. The tip is then
 * drawn small: at full size it would cover the two neighbouring markers and read as
 * pointing at neither.
 */
const handMinor = computed(
  () => step.value === 'minute' && !minuteMarks.value.includes(minute.value),
)

/** The hour as the two large numerals show it, on whichever clock is displayed. */
const displayHourText = computed(() =>
  pad2(resolvedFormat.value === '12h' ? to12h(hour.value).hour : hour.value),
)

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
 * The half of the day in force: the value's own once there is one, the remembered choice
 * until then. Every hour written on a 12-hour face goes through it — without which a
 * reader who picks PM on an empty clock and then an hour would get the morning back, the
 * value having no half-day of its own to read.
 */
const currentMeridiem = computed<Meridiem>(() =>
  model.value ? to12h(hour.value).meridiem : pendingMeridiem.value,
)

const meridiemModel = computed<ToggleModelValue>({
  get: () => currentMeridiem.value,
  set: (value) => {
    const meridiem: Meridiem = value === 'PM' ? 'PM' : 'AM'
    pendingMeridiem.value = meridiem
    // With no time set there is nothing to convert, so the choice is simply REMEMBERED
    // and applies to the first time chosen.
    if (!model.value) return
    // What is being chosen here is the HALF OF THE DAY, so the hour gives way to it: kept
    // when the new half allows it, and otherwise the first hour of that half that does.
    // Refusing the write instead would leave the control snapping straight back, since it
    // reads the half of the day off the value.
    const wanted = to24h(to12h(hour.value).hour, meridiem)
    setHour(
      isAvailableHour(wanted)
        ? wanted
        : firstAllowed(12, (i) => to24h(i, meridiem), isAvailableHour),
    )
  },
})

/**
 * Whether a half of the day still holds an hour one could choose. An empty one takes its
 * button with it: a control that can only ever be refused is worse than no control.
 */
function meridiemAvailable(meridiem: Meridiem): boolean {
  return firstAllowed(12, (i) => to24h(i, meridiem), isAvailableHour) !== null
}

// @a11y — the entire spoken value of the face. The numerals are hidden from screen
// readers, so these four attributes are the ONLY thing assistive technology has: what the
// value is, what its bounds are, and how to say it.
const ariaValueNow = computed(() => {
  if (step.value === 'minute') return minute.value
  return resolvedFormat.value === '12h' ? to12h(hour.value).hour : hour.value
})
const ariaValueMin = computed(() =>
  step.value === 'minute' ? 0 : resolvedFormat.value === '12h' ? 1 : 0,
)
const ariaValueMax = computed(() =>
  step.value === 'minute' ? 59 : resolvedFormat.value === '12h' ? 12 : 23,
)
const ariaValueText = computed(() =>
  step.value === 'minute'
    ? m.value.timePicker.minutesValue(minute.value)
    : m.value.timePicker.hoursValue(ariaValueNow.value),
)

/**
 * A step has been settled: after the hour come the minutes, and after the minutes the
 * whole thing is confirmed — but by KEYBOARD only, for the reason given on the emit.
 */
function settleStep(via: 'pointer' | 'keyboard') {
  if (step.value === 'hour') setStep('minute')
  else if (via === 'keyboard') emit('confirm')
}

// Pointing at the face, by click or by drag.
const faceEl = ref<HTMLElement | null>(null)
const dragging = ref(false)

function applyPoint(event: PointerEvent) {
  const face = faceEl.value
  if (!face) return
  // Measuring the face is safe here: this runs from a handler, hence in a browser, never
  // during a render.
  const rect = face.getBoundingClientRect()
  const dx = event.clientX - (rect.left + rect.width / 2)
  const dy = event.clientY - (rect.top + rect.height / 2)
  if (step.value === 'minute') {
    setMinute(snapMinute(angleToIndex(dx, dy, 60), props.minuteStep))
    return
  }
  const index = angleToIndex(dx, dy, 12)
  if (resolvedFormat.value === '24h') {
    const ring = distanceFraction(dx, dy, rect.width / 2) < DIAL_INNER_THRESHOLD ? 'inner' : 'outer'
    setHour(dialIndexToHour24(index, ring))
  } else {
    setHour(to24h(index === 0 ? 12 : index, currentMeridiem.value))
  }
}

function onPointerdown(event: PointerEvent) {
  // Capturing the pointer is what keeps the drag alive when it wanders off the face.
  //
  // @fallback — it is wrapped because a pointer event fired by a TEST refers to no real
  // pointer, and the call then throws. Failing to capture merely means the drag stops at
  // the edge, which no test is checking.
  try {
    faceEl.value?.setPointerCapture(event.pointerId)
  } catch {
    /* a synthetic pointer: nothing to capture */
  }
  dragging.value = true
  applyPoint(event)
}

function onPointermove(event: PointerEvent) {
  if (dragging.value) applyPoint(event)
}

function onPointerup() {
  if (!dragging.value) return
  dragging.value = false
  settleStep('pointer')
}

function onPointercancel() {
  dragging.value = false
}

// @keyboard @a11y — the keyboard a slider is expected to have.
/*
 * Every key below walks until it finds something it MAY land on, rather than stopping at
 * the first thing it may not: with scattered hours a key that stopped would die at the
 * first hole and never reach what lies past it. Against a bound there is nothing past the
 * hole, so the same walk comes back empty and the key holds still, which is what a bound
 * means. Restrict nothing and the first candidate answers: the walk is then the plain step
 * it has always been.
 */
function moveHour(delta: number) {
  if (resolvedFormat.value === '24h') {
    setHour(firstAllowed(23, (i) => (hour.value + delta * i + 24) % 24, isAvailableHour))
    return
  }
  // On a 12-hour face the hours cycle from 1 to 12 WITHIN the current half of the day:
  // passing midday is done on the AM/PM control, not by walking the hand past twelve.
  const hour12 = to12h(hour.value).hour
  setHour(
    firstAllowed(
      11,
      (i) => to24h(((hour12 - 1 + delta * i + 12) % 12) + 1, currentMeridiem.value),
      isAvailableHour,
    ),
  )
}

/** The first or the last hour the face allows, on whichever clock it is showing. */
function edgeHour(edge: 'first' | 'last'): number | null {
  if (resolvedFormat.value === '24h')
    return firstAllowed(24, (i) => (edge === 'first' ? i - 1 : 24 - i), isAvailableHour)
  return firstAllowed(
    12,
    (i) => to24h(edge === 'first' ? i : 13 - i, currentMeridiem.value),
    isAvailableHour,
  )
}

/**
 * The minute a key lands on: the one it asked for when the hour allows it, and otherwise
 * the next one the same way round that it does.
 */
function minuteFrom(start: number, direction: number): number | null {
  const interval = props.minuteStep > 1 ? props.minuteStep : 1
  const allowed = (candidate: number) => isTimeAllowed(hour.value, candidate, limits.value)
  if (allowed(start)) return start
  return firstAllowed(
    Math.ceil(60 / interval),
    (i) => snapMinute(start + direction * i * interval, interval),
    allowed,
  )
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    settleStep('keyboard')
    return
  }
  // The arrows are NOT flipped in a right-to-left page: a clock face is never mirrored —
  // clockwise means the same thing everywhere — so forward stays forward.
  const delta =
    event.key === 'ArrowUp' || event.key === 'ArrowRight'
      ? 1
      : event.key === 'ArrowDown' || event.key === 'ArrowLeft'
        ? -1
        : 0
  if (step.value === 'hour') {
    if (delta) moveHour(delta)
    else if (event.key === 'Home') setHour(edgeHour('first'))
    else if (event.key === 'End') setHour(edgeHour('last'))
    else return
    event.preventDefault()
    return
  }
  const minutes = allowedMinutesFor(hour.value, limits.value)
  if (delta)
    setMinute(
      minuteFrom(snapMinute(minute.value + delta * props.minuteStep, props.minuteStep), delta),
    )
  else if (event.key === 'PageUp')
    setMinute(minuteFrom(snapMinute(minute.value + 5, props.minuteStep), 1))
  else if (event.key === 'PageDown')
    setMinute(minuteFrom(snapMinute(minute.value - 5, props.minuteStep), -1))
  else if (event.key === 'Home') setMinute(minutes[0] ?? null)
  else if (event.key === 'End') setMinute(minutes.at(-1) ?? null)
  else return
  event.preventDefault()
}

defineExpose({
  /** Moves the focus onto the clock face, which is what the arrow keys drive. */
  focus: (options?: FocusOptions) => faceEl.value?.focus(options),
  /**
   * Puts the clock back on the hour and clears the announcement, WITHOUT announcing
   * anything itself. A component holding this one in a panel calls it as the panel opens
   * and closes, so that every visit starts on the hour.
   */
  reset: () => {
    step.value = 'hour'
    liveMessage.value = ''
  },
})
</script>

<template>
  <div
    class="v-time-picker"
    role="group"
    :aria-label="ariaLabel"
    :data-step="step"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
  >
    <!-- The two large numerals switch between adjusting the hour and the minutes. The one
         being adjusted takes the accent tone, which on a quiet button shows as the colour
         of the numeral rather than as a filled background.

         The choice of half-day sits beside them, on the same row: it is read as part of
         the time itself rather than as a property of the face. On a 24-hour clock there
         is no such choice, and the row then holds the numerals alone. -->
    <div class="v-time-picker-header">
      <div class="v-time-picker-time">
        <VButton
          class="v-time-picker-cell"
          variant="ghost"
          size="lg"
          :tone="step === 'hour' ? 'accent' : 'neutral'"
          :aria-pressed="step === 'hour' ? 'true' : 'false'"
          :aria-label="m.timePicker.selectHour"
          :disabled="disabled"
          @click="setStep('hour')"
        >
          {{ displayHourText }}
        </VButton>
        <span class="v-time-picker-sep" aria-hidden="true">:</span>
        <VButton
          class="v-time-picker-cell"
          variant="ghost"
          size="lg"
          :tone="step === 'minute' ? 'accent' : 'neutral'"
          :aria-pressed="step === 'minute' ? 'true' : 'false'"
          :aria-label="m.timePicker.selectMinute"
          :disabled="disabled"
          @click="setStep('minute')"
        >
          {{ pad2(minute) }}
        </VButton>
      </div>

      <VToggle
        v-if="resolvedFormat === '12h'"
        v-model="meridiemModel"
        class="v-time-picker-meridiem"
        mandatory
        variant="outline"
        selected-variant="soft"
        orientation="vertical"
        size="sm"
        :label="m.timePicker.meridiem"
        :disabled="disabled || readonly"
      >
        <VToggleItem value="AM" :label="m.timePicker.am" :disabled="!meridiemAvailable('AM')" />
        <VToggleItem value="PM" :label="m.timePicker.pm" :disabled="!meridiemAvailable('PM')" />
      </VToggle>
    </div>

    <div
      ref="faceEl"
      role="slider"
      :tabindex="disabled ? -1 : 0"
      class="v-time-picker-face"
      :aria-label="step === 'hour' ? m.timePicker.hour : m.timePicker.minutes"
      :aria-valuemin="ariaValueMin"
      :aria-valuemax="ariaValueMax"
      :aria-valuenow="ariaValueNow"
      :aria-valuetext="ariaValueText"
      :data-dragging="dragging ? '' : undefined"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-readonly="readonly ? 'true' : undefined"
      @pointerdown="onPointerdown"
      @pointermove="onPointermove"
      @pointerup="onPointerup"
      @pointercancel="onPointercancel"
      @keydown="onKeydown"
    >
      <div
        class="v-time-picker-hand"
        aria-hidden="true"
        :data-ring="handRing"
        :data-minor="handMinor ? '' : undefined"
        :style="{ '--dial-turn': String(handTurn) }"
      />
      <span class="v-time-picker-center" aria-hidden="true" />
      <span
        v-for="cell in cells"
        :key="cell.key"
        class="v-time-picker-number"
        aria-hidden="true"
        :data-ring="cell.ring"
        :data-selected="cell.selected ? '' : undefined"
        :data-disabled="cell.disabled ? '' : undefined"
        :style="{ '--dial-turn': String(cell.turn) }"
        >{{ cell.label }}</span
      >
    </div>

    <div class="v-visually-hidden" aria-live="polite">{{ liveMessage }}</div>

    <div v-if="$slots.footer" class="v-time-picker-footer"><slot name="footer" /></div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-time-picker {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-4);
    width: max-content;
    font-family: var(--vectis-text-family);
    color: var(--vectis-color-text);
  }

  /* The numerals and the choice of half-day on one row, the second beside the first. The
     gap is logical, so the control follows the reading direction; the numerals inside it
     stay in a group of their own, which is what keeps the direction they force off it.

     The centring is what places the row whether or not that control is rendered — a
     24-hour clock has none, and the numerals then come out centred on their own. */
  .v-time-picker-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--vectis-space-3);
  }

  /* A time written in figures always reads hours then minutes, in every language. Forcing
     the direction here is what stops bidirectional reordering from swapping the two in a
     right-to-left page. */
  .v-time-picker-time {
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
  .v-time-picker-cell[data-size] {
    width: var(--control-height);
    font-size: var(--vectis-text-heading-1-size);
    font-weight: var(--vectis-text-heading-2-weight);
    /* Figures of equal width, so that going from "11" to "00" does not shift the cell. */
    font-variant-numeric: tabular-nums;
  }

  .v-time-picker-sep {
    font-size: var(--vectis-text-heading-2-size);
    color: var(--vectis-color-text);
    user-select: none;
  }

  .v-time-picker-meridiem {
    flex: none;
  }

  .v-time-picker-face {
    position: relative;
    /* The row above is wider than the face as soon as the half-day control is rendered,
       and the column is only as wide as its widest child: without this the clock would
       hang at the start edge of that row instead of under the middle of it. The face
       itself stays physical — a clock is never mirrored. */
    align-self: center;
    inline-size: var(--vectis-control-size-time-picker-dial);
    block-size: var(--vectis-control-size-time-picker-dial);
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-surface-muted);
    /* Dragging across the face IS how one chooses, so it must do nothing else: no
       scrolling under a finger, and no selecting the numerals as text. */
    touch-action: none;
    user-select: none;
    cursor: pointer;
    /* How far from the centre the numerals sit — the outer circle. The numerals and the
       hand both read it, and the inner circle redefines it for itself.

       TRAP — this is coupled to the threshold that decides which of the two circles a
       point belongs to, in `utils/time`. Changing one without the other makes the face
       answer with the wrong ring, and no test can catch it: the unit tests measure
       nothing. */
    --dial-radius: calc(
      var(--vectis-control-size-time-picker-dial) / 2 -
        var(--vectis-control-size-time-picker-number) / 2
    );
  }

  .v-time-picker-face:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /*
   * The numerals are placed around the circle by CSS trigonometry, from the fraction of a
   * turn each one was given — no coordinates are computed in code.
   *
   * The properties used are PHYSICAL on purpose, where the rest of the design system
   * prefers logical ones: a clock face is never mirrored, clockwise meaning the same thing
   * in every language.
   */
  .v-time-picker-number {
    position: absolute;
    left: calc(50% + var(--dial-radius) * sin(var(--dial-turn) * 1turn));
    top: calc(50% - var(--dial-radius) * cos(var(--dial-turn) * 1turn));
    translate: -50% -50%;
    inline-size: var(--vectis-control-size-time-picker-number);
    block-size: var(--vectis-control-size-time-picker-number);
    display: grid;
    place-items: center;
    border-radius: var(--vectis-radius-pill);
    /* The outer circle is set at the large body size: these numerals are read at arm's
       length on a phone, not scanned like a label. */
    font-size: var(--vectis-text-body-lg-size);
    color: var(--vectis-color-text);
    /* Above the hand, so that the numeral being pointed at reads ON its dot rather than
       being covered by it. */
    z-index: 1;
    pointer-events: none;
  }

  .v-time-picker-number[data-ring='inner'],
  .v-time-picker-hand[data-ring='inner'] {
    --dial-radius: calc(
      var(--vectis-control-size-time-picker-dial) / 2 -
        var(--vectis-control-size-time-picker-number) * 1.5
    );
  }

  .v-time-picker-number[data-ring='inner'] {
    font-size: var(--vectis-text-body-md-size);
    color: var(--vectis-color-text-muted);
  }

  /*
   * A numeral the restrictions rule out. Struck through as well as greyed, the VDatePicker
   * idiom: colour alone must not be what says a value is unavailable (WCAG 1.4.1).
   *
   * TRAP — it is greyed with the MUTED token and not with `text-subtle`, which is the one
   * named for disabled text. On this face's own surface that token measures 4.39:1, and
   * where VDatePicker gets away with it these numerals cannot: a disabled BUTTON is exempt
   * from the contrast rule, a `<span>` is judged like any other text however hidden from
   * assistive technology it is. Verified by the axe pass on the Restrictions story.
   */
  .v-time-picker-number[data-disabled] {
    color: var(--vectis-color-text-muted);
    text-decoration: line-through;
  }

  .v-time-picker-number[data-selected] {
    color: var(--vectis-color-text-on-accent);
  }

  /*
   * The hand: a stroke anchored at the centre and turned by the same fraction of a turn.
   *
   * TRAP — the rotation is deliberately NOT animated. Going from 55 minutes to 0 takes the
   * angle from nearly a full turn back to none, and an interpolation would sweep the hand
   * all the way round anticlockwise. That is an accepted departure from the Material
   * design it follows otherwise.
   */
  .v-time-picker-hand {
    position: absolute;
    left: calc(50% - var(--vectis-control-size-time-picker-hand) / 2);
    bottom: 50%;
    inline-size: var(--vectis-control-size-time-picker-hand);
    block-size: var(--dial-radius);
    background: var(--vectis-color-accent);
    transform-origin: 50% 100%;
    rotate: calc(var(--dial-turn) * 1turn);
  }

  /* The dot at the tip of the hand. It is exactly the size of a numeral's cell, so it
     covers the one being pointed at — whose text turns to the colour that reads on it. */
  .v-time-picker-hand::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    translate: -50% -50%;
    inline-size: var(--vectis-control-size-time-picker-number);
    block-size: var(--vectis-control-size-time-picker-number);
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-accent);
    /* The ONE thing animated on the hand: the dot changing size between its two forms. It
       interpolates between two bounded values and can therefore never take a wrong path,
       unlike the rotation above. */
    transition:
      inline-size var(--vectis-duration-fast) var(--vectis-ease-default),
      block-size var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /*
   * On a minute with no marker of its own, the dot covers no numeral and at full size
   * would spill onto both neighbours, reading as pointing at neither. Shrunk, it becomes
   * the precise marker itself — which is also why the pale centre Material draws inside it
   * is dropped here: at this size it would turn the dot into a ring.
   *
   * TRAP — only the DOT's own size changes. Redefining the numeral size variable here
   * would also move the radius derived from it, and with it the hand's length and the
   * position of both circles.
   */
  .v-time-picker-hand[data-minor]::before {
    inline-size: var(--vectis-control-size-time-picker-hand-minor);
    block-size: var(--vectis-control-size-time-picker-hand-minor);
  }

  .v-time-picker-center {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    inline-size: var(--vectis-control-size-time-picker-center);
    block-size: var(--vectis-control-size-time-picker-center);
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-accent);
  }

  /* Neither state is a pointer target. A read-only clock is still read, so it keeps the
     ordinary cursor; a disabled one refuses. */
  .v-time-picker[data-readonly] .v-time-picker-face {
    cursor: default;
  }

  .v-time-picker[data-disabled] .v-time-picker-face {
    cursor: not-allowed;
  }

  /*
   * A disabled clock greys out through the colour tokens and never through opacity: the
   * hand and its centre dot are the two accent-painted parts, and the numeral under the
   * dot is painted for an accent background it no longer has.
   *
   * The whole block sits AFTER the rules it overrides, every one of them at the same
   * specificity: this is one sheet, so its own order is what settles them.
   */
  .v-time-picker[data-disabled] .v-time-picker-hand,
  .v-time-picker[data-disabled] .v-time-picker-hand::before,
  .v-time-picker[data-disabled] .v-time-picker-center {
    background: var(--vectis-color-border-strong);
  }

  .v-time-picker[data-disabled] .v-time-picker-sep,
  .v-time-picker[data-disabled] .v-time-picker-number,
  .v-time-picker[data-disabled] .v-time-picker-number[data-selected] {
    color: var(--vectis-color-text-subtle);
  }

  .v-time-picker-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--vectis-space-2);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-time-picker-hand::before {
      transition: none;
    }
  }
}
</style>
