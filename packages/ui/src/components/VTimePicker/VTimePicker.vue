<script setup lang="ts">
// @a11y @keyboard @core
/**
 * CSS places clock numerals and the hand. JavaScript maps pointer angles and keyboard steps to
 * a time because HTML has no interactive clock-face primitive.
 */

import { computed, inject, ref, watchEffect } from 'vue'

import VButton from '../VButton/VButton.vue'
import VToggle from '../VToggle/VToggle.vue'
import type { ToggleModelValue } from '../VToggle/VToggle.vue'
import VToggleItem from '../VToggle/VToggleItem.vue'
import { formatTime, hourCycleFor, parseTime } from '../../utils/time'
import {
  DIAL_DEAD_ZONE,
  DIAL_INNER_THRESHOLD,
  angleToIndex,
  dialIndexToHour24,
  distanceFraction,
  hour24ToDial,
  hourWithMeridiem,
  snapMinute,
  to12h,
  to24h,
} from '../../utils/clock'
import type { HourFormat, Meridiem } from '../../utils/time'
import {
  allowedMinutesFor,
  firstAllowed,
  isHourAllowed,
  isTimeAllowed,
  limitsProblem,
  minuteGrid,
  minuteInterval,
  nearestAllowedMinute,
  resolveLimits,
} from './limits'
import type { TimePickerAllowed } from './limits'
import { pad2 } from '../../utils/text'
import { isDev } from '../../utils/env'
import { hostWarnsKey } from '../../utils/hostWarns'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages, useResolvedLocale } from '../../i18n/state'

/** Whether the face shows a 12- or a 24-hour clock. */
export type TimePickerFormat = HourFormat

/** Which of the two halves of a time is being adjusted. */
type TimePickerStep = 'hour' | 'minute'

interface TimePickerProps {
  /**
   * Whether the face shows a 12- or a 24-hour clock. Left out, the reader's language
   * decides, which is almost always what one wants.
   */
  format?: TimePickerFormat
  /**
   * A BCP 47 locale, which decides the clock. It TAKES PRECEDENCE over the design
   * system's global locale and falls back to it, which is why it has no literal default:
   * `undefined` has to stay recognizable for the global locale to have its chance.
   */
  locale?: string
  /**
   * The interval the minutes snap to, both when dragging and with the arrow keys. The face
   * prints only the minutes it can reach, so a step of a quarter of an hour marks four.
   */
  minuteStep?: number
  /** The earliest time that can be chosen, inclusive, as a canonical 24-hour `'HH:mm'`. */
  min?: string
  /** The latest time that can be chosen, inclusive, written like `min`. */
  max?: string
  /** Which hours can be chosen: the list of them, or a rule answering for one. */
  allowedHours?: TimePickerAllowed
  /**
   * Which minutes can be chosen: the list of them, or a rule answering for one. The
   * minutes it leaves out are not printed.
   */
  allowedMinutes?: TimePickerAllowed
  /**
   * Makes the whole clock unusable: the hand cannot be moved, the half-day cannot be
   * changed, and everything greys out through the colour tokens.
   */
  disabled?: boolean
  /** Shows the time without letting it be changed. */
  readonly?: boolean
  /**
   * The accessible name of the whole clock, its two numerals and its face together. It falls
   * back to the dictionary, and a consumer `aria-label` wins over it.
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

/** The time, always as a 24-hour "HH:mm" string whatever clock is displayed. */
const model = defineModel<string | null>({ default: null })

const emit = defineEmits<{
  /**
   * The reader has FINISHED, carrying the time as it stands: the minutes were settled from the
   * keyboard.
   */
  confirm: [value: string | null]
}>()

defineSlots<{
  /** A strip at the foot of the clock, the place for actions such as Cancel and OK. */
  footer?(): unknown
}>()

const m = useMessages()
// @a11y
// A roleless box cannot carry an accessible name (axe: aria-prohibited-attr),
// so the root is a named group: the VCarousel viewport arrangement.
const ariaLabel = useAriaLabel(() => props.label ?? m.value.timePicker.label)
const resolvedLocale = useResolvedLocale(() => props.locale)
const resolvedFormat = computed<TimePickerFormat>(
  () => props.format ?? hourCycleFor(resolvedLocale.value),
)

/** The restrictions, resolved once for the whole render. */
const limits = computed(() => resolveLimits(props))

/** The hours the restrictions still leave something in, worked out once per set of restrictions. */
const availableHours = computed(() => {
  const hours = new Set<number>()
  for (let candidate = 0; candidate < 24; candidate += 1)
    if (isHourAllowed(candidate, limits.value)) hours.add(candidate)
  return hours
})

/** Whether an hour is one the restrictions still leave something in. */
const isAvailableHour = (candidate: number) => availableHours.value.has(candidate)

// @devwarn
if (isDev && !inject(hostWarnsKey, false)) {
  watchEffect(() => {
    if (!Number.isInteger(props.minuteStep) || props.minuteStep < 1 || 60 % props.minuteStep !== 0)
      console.warn(`[VTimePicker] minuteStep ${props.minuteStep} — a divisor of 60 is expected.`)
    const problem = limitsProblem(limits.value)
    if (problem) console.warn(`[VTimePicker] ${problem}`)
  })
}

/** Which of the two is being adjusted. It starts on the hour and moves on by itself. */
const step = ref<TimePickerStep>('hour')

// With no value the clock shows the first hour of the half of the day chosen so far, which
// is midnight until PM is picked. It is also the hour a time started from the MINUTES is
// written with, so that choice is not lost when the reader begins there.
const parts = computed(
  () =>
    parseTime(model.value) ?? {
      hour: resolvedFormat.value === '12h' ? to24h(12, pendingMeridiem.value) : 0,
      minute: 0,
    },
)
const hour = computed(() => parts.value.hour)
const minute = computed(() => parts.value.minute)

/*
 * The two writers are the SINGLE cut-off point for the restrictions: the pointer, the six
 * keys and the AM/PM control all write through them and through nothing else, so not one
 * handler carries a guard of its own.
 */

/**
 * Writing the hour. An hour with nothing left in it has no minute to fall back on, which
 * refuses it; one that is only PARTLY available pulls the minutes to what it does allow, since
 * `min: '09:30'` must not be left holding 09:00.
 */
function setHour(value: number | null) {
  // Changing which face is shown stays allowed under `readonly`: reading the minutes is not
  // changing them.
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
 * Which step the clock is on is otherwise carried by the face's own name alone, and a change of
 * name is not reliably announced. A politely announced region says it a second time.
 */
const liveMessage = ref('')

function setStep(next: TimePickerStep) {
  step.value = next
  liveMessage.value =
    next === 'minute' ? m.value.timePicker.choosingMinutes : m.value.timePicker.choosingHour
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
}

/** The hour a position on the face stands for. */
function hourAt(index: number, ring: 'outer' | 'inner'): number {
  return resolvedFormat.value === '24h'
    ? dialIndexToHour24(index, ring)
    : to24h(index === 0 ? 12 : index, currentMeridiem.value)
}

/** The minutes the face prints. */
const minuteMarks = computed(() => {
  const interval = minuteInterval(props.minuteStep)
  const spacing = 60 / interval <= 12 ? interval : 5
  const marks: number[] = []
  for (let minutes = 0; minutes < 60; minutes += spacing)
    if (minutes % interval === 0 && isTimeAllowed(hour.value, minutes, limits.value))
      marks.push(minutes)
  return marks
})

/*
 * A numeral that is only there to be refused says nothing the missing numeral does not say
 * better, and it says it in grey text a screen reader has no way to reach: the markers are
 * `aria-hidden`, so what the restrictions leave is spoken by the face's own value and by
 * nothing else.
 */
const cells = computed<DialCell[]>(() => {
  if (step.value === 'minute') {
    return minuteMarks.value.map((minutes) => ({
      key: `m-${minutes}`,
      label: pad2(minutes),
      turn: minutes / 60,
      ring: 'outer' as const,
      selected: minute.value === minutes,
    }))
  }
  // Each position's hour is worked out once, since on a 12-hour face that takes the half of the
  // day in force. The selection there still compares numerals and not hours: an empty clock
  // holding a PM choice sits on midnight, and its hand points at the 12 all the same.
  const twelve = resolvedFormat.value === '12h'
  const shown12 = to12h(hour.value).hour
  const rings: DialCell['ring'][] = twelve ? ['outer'] : ['outer', 'inner']
  const out: DialCell[] = []
  for (const ring of rings)
    for (let i = 0; i < 12; i += 1) {
      const target = hourAt(i, ring)
      if (!isAvailableHour(target)) continue
      const numeral = i === 0 ? 12 : i
      out.push({
        key: `${ring === 'outer' ? 'o' : 'i'}-${i}`,
        label: ring === 'inner' ? pad2(target) : String(numeral),
        turn: i / 12,
        ring,
        selected: twelve ? shown12 === numeral : hour.value === target,
      })
    }
  return out
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

/** Which half of the day is chosen while no time is set at all. */
const pendingMeridiem = ref<Meridiem>('AM')

/**
 * The half of the day in force: the value's own once there is one, the remembered choice until
 * then.
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
    const wanted = hourWithMeridiem(hour.value, meridiem)
    setHour(
      isAvailableHour(wanted)
        ? wanted
        : firstAllowed(12, (i) => to24h(i, meridiem), isAvailableHour),
    )
  },
})

/**
 * Whether each half of the day still holds an hour one could choose. An empty one takes its
 * button with it: a control that can only ever be refused is worse than no control.
 */
const meridiemAvailable = computed<Record<Meridiem, boolean>>(() => ({
  AM: firstAllowed(12, (i) => to24h(i, 'AM'), isAvailableHour) !== null,
  PM: firstAllowed(12, (i) => to24h(i, 'PM'), isAvailableHour) !== null,
}))

// @a11y
// The entire spoken value of the face. The numerals are hidden from screen readers, so these
// four attributes are the only thing assistive technology has: what the value is, what its
// bounds are, and how to say it.
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
// On a 12-hour face the half of the day is spoken with the hour: the AM/PM control is not
// on the slider's way, and "9 o'clock" alone is two different times.
const ariaValueText = computed(() => {
  const m_ = m.value.timePicker
  if (step.value === 'minute') return m_.minutesValue(minute.value)
  const spoken = m_.hourValue(ariaValueNow.value)
  if (resolvedFormat.value === '24h') return spoken
  return `${spoken} ${currentMeridiem.value === 'PM' ? m_.pm : m_.am}`
})

/**
 * A step has been settled: after the hour come the minutes, and after the minutes the whole
 * thing is confirmed; but by KEYBOARD only, for the reason given on the emit.
 */
function settleStep(via: 'pointer' | 'keyboard') {
  if (step.value === 'hour') setStep('minute')
  else if (via === 'keyboard') emit('confirm', model.value)
}

const faceEl = ref<HTMLElement | null>(null)
const dragging = ref(false)
/** Whether anything in the gesture under way landed on a numeral. */
let landed = false

/**
 * Where a point on the face lands, and whether there was anything there at all. The write
 * itself still goes through `setHour`/ `setMinute` and their own guards, which is why
 * `readonly` is refused THERE and not here: a frozen clock is still one whose numerals are
 * real, and a tap on one moves the step on as it always did.
 */
function applyPoint(event: PointerEvent): boolean {
  const face = faceEl.value
  // A disabled clock aims at nothing, so no step is moved on either: its header buttons
  // are disabled for the same reason.
  if (!face || props.disabled) return false
  // Measuring the face is safe here: this runs from a handler, hence in a browser, never
  // during a render.
  const rect = face.getBoundingClientRect()
  const dx = event.clientX - (rect.left + rect.width / 2)
  const dy = event.clientY - (rect.top + rect.height / 2)
  if (Math.hypot(dx, dy) <= DIAL_DEAD_ZONE * (rect.width / 2)) return false
  if (step.value === 'minute') {
    // The step's own snapping stands: a point between two markers has always been pulled
    // to the one it is nearest. What it is pulled to still has to BE on the face.
    const minutes = snapMinute(angleToIndex(dx, dy, 60), props.minuteStep)
    if (!isTimeAllowed(hour.value, minutes, limits.value)) return false
    setMinute(minutes)
    return true
  }
  const index = angleToIndex(dx, dy, 12)
  const ring =
    resolvedFormat.value === '24h' &&
    distanceFraction(dx, dy, rect.width / 2) < DIAL_INNER_THRESHOLD
      ? 'inner'
      : 'outer'
  const target = hourAt(index, ring)
  if (!isAvailableHour(target)) return false
  setHour(target)
  return true
}

function onPointerdown(event: PointerEvent) {
  // @fallback
  // Capture keeps dragging active outside the clock face; synthetic events may not reference a
  // capturable pointer.
  try {
    faceEl.value?.setPointerCapture(event.pointerId)
  } catch {
    /* Synthetic pointers cannot be captured. */
  }
  dragging.value = true
  landed = applyPoint(event)
}

function onPointermove(event: PointerEvent) {
  if (dragging.value && applyPoint(event)) landed = true
}

function onPointerup() {
  if (!dragging.value) return
  dragging.value = false
  // A gesture that never landed on a numeral has chosen nothing, so there is nothing to
  // move on FROM: the reader is left on the face they aimed at, looking at what they missed.
  if (landed) settleStep('pointer')
}

function onPointercancel() {
  dragging.value = false
}

// @keyboard @a11y
// The keyboard a slider is expected to have.
/*
 * Every key below walks until it finds something it MAY land on, rather than stopping at the
 * first thing it may not: with scattered hours a key that stopped would die at the first hole
 * and never reach what lies past it. Against a bound there is nothing past the hole, so the
 * same walk comes back empty and the key holds still, which a bound means.
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
 * The minute a key lands on: the first step of the grid at least `distance` minutes away, that
 * way round, and then the next one the hour allows.
 */
function minuteToward(direction: 1 | -1, distance: number): number | null {
  const grid = minuteGrid(props.minuteStep)
  const target = (((minute.value + direction * distance) % 60) + 60) % 60
  const n = grid.length
  let start = direction > 0 ? 0 : n - 1
  for (let k = 0; k < n; k += 1) {
    const i = direction > 0 ? k : n - 1 - k
    if (direction > 0 ? grid[i]! >= target : grid[i]! <= target) {
      start = i
      break
    }
  }
  return firstAllowed(
    n,
    (i) => grid[(((start + direction * (i - 1)) % n) + n) % n]!,
    (candidate) => isTimeAllowed(hour.value, candidate, limits.value),
  )
}

function onKeydown(event: KeyboardEvent) {
  // The face of a disabled clock is out of the tab order, but `focus()` can still put the
  // focus there: nothing it is sent may move the step on or confirm.
  if (props.disabled) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    settleStep('keyboard')
    return
  }
  // The arrows are not flipped in a right-to-left page: a clock face is never mirrored;
  // clockwise means the same thing everywhere; so forward stays forward.
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
  if (delta) setMinute(minuteToward(delta, 1))
  else if (event.key === 'PageUp') setMinute(minuteToward(1, 5))
  else if (event.key === 'PageDown') setMinute(minuteToward(-1, 5))
  // The list is built in these two branches alone: the arrows walk to a neighbour and never
  // need the whole of it.
  else if (event.key === 'Home') setMinute(allowedMinutesFor(hour.value, limits.value)[0] ?? null)
  else if (event.key === 'End')
    setMinute(allowedMinutesFor(hour.value, limits.value).at(-1) ?? null)
  else return
  event.preventDefault()
}

defineExpose({
  /** Moves the focus onto the clock face, which the arrow keys drive. */
  focus: (options?: FocusOptions) => faceEl.value?.focus(options),
  /**
   * Puts the clock back on the hour and clears the announcement, WITHOUT announcing anything
   * itself.
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
    <!--
      The two large numerals switch between adjusting the hour and the minutes. The one being
      adjusted takes the accent tone, which on a quiet button shows as the colour of the numeral
      rather than as a filled background.
    -->
    <div class="v-time-picker-header">
      <div class="v-time-picker-time">
        <VButton
          class="v-time-picker-cell"
          variant="ghost"
          size="lg"
          :tone="step === 'hour' ? 'accent' : 'neutral'"
          :aria-pressed="step === 'hour' ? 'true' : 'false'"
          :aria-label="`${displayHourText}, ${m.timePicker.selectHour}`"
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
          :aria-label="`${pad2(minute)}, ${m.timePicker.selectMinutes}`"
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
        <VToggleItem value="AM" :label="m.timePicker.am" :disabled="!meridiemAvailable.AM" />
        <VToggleItem value="PM" :label="m.timePicker.pm" :disabled="!meridiemAvailable.PM" />
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
  /* The same root as VDatePicker's: an inline column that sizes to its content and pads
     itself, so the clock reads the same on a page as in VTimeInput's panel, which adds no
     padding of its own. The gap is the clock's, its parts being larger. */
  .v-time-picker {
    display: inline-flex;
    flex-direction: column;
    gap: var(--vectis-space-4);
    padding: var(--vectis-space-3);
    font-family: var(--vectis-text-family);
    color: var(--vectis-color-text);
  }

  /*
   * The numerals and the choice of half-day on one row, the second beside the first. The gap is
   * logical, so the control follows the reading direction; the numerals inside it stay in a
   * group of their own, which keeps the direction they force off it.
   */
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

  /*
   * What is overridden here is the "large numeral" look alone; the width and the type; the
   * height, the states, the focus ring and the transitions all come from the button itself. The
   * type is the `heading-1` recipe taken whole, and the colon the `heading-2` one: read in
   * halves, a consumer repointing `--vectis-text-heading-1-weight` would move every heading but
   * these two numerals.
   */
  .v-time-picker-cell[data-size] {
    width: var(--control-height);
    font-size: var(--vectis-text-heading-1-size);
    font-weight: var(--vectis-text-heading-1-weight);
    line-height: var(--vectis-text-heading-1-leading);
    letter-spacing: var(--vectis-text-heading-1-tracking);
    /* Figures of equal width, so that going from "11" to "00" does not shift the cell. */
    font-variant-numeric: tabular-nums;
  }

  .v-time-picker-sep {
    font-size: var(--vectis-text-heading-2-size);
    font-weight: var(--vectis-text-heading-2-weight);
    line-height: var(--vectis-text-heading-2-leading);
    color: var(--vectis-color-text);
    user-select: none;
  }

  .v-time-picker-meridiem {
    flex: none;
  }

  .v-time-picker-face {
    position: relative;
    /*
     * The row above is wider than the face as soon as the half-day control is rendered, and the
     * column is only as wide as its widest child: without this the clock would hang at the
     * start edge of that row instead of under the middle of it. The face itself stays physical;
     * a clock is never mirrored.
     */
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
    /*
     * This is coupled to the threshold that decides which of the two circles a point belongs
     * to, in `utils/clock`. Changing one without the other makes the face answer with the wrong
     * ring, and no test can catch it: the unit tests measure nothing.
     */
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
   * The properties used are PHYSICAL on purpose, where the rest of the design system prefers
   * logical ones: a clock face is never mirrored, clockwise meaning the same thing in every
   * language.
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
    /*
     * Above the hand, so that the numeral being pointed at reads on its dot rather than being
     * covered by it.
     */
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

  .v-time-picker-number[data-selected] {
    color: var(--vectis-color-text-on-accent);
  }

  /*
   * The rotation is deliberately not animated. Going from 55 minutes to 0 takes the angle from
   * nearly a full turn back to none, and an interpolation would sweep the hand all the way
   * round anticlockwise.
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

  /*
   * The dot at the tip of the hand. It is exactly the size of a numeral's cell, so it covers
   * the one being pointed at; whose text turns to the colour that reads on it.
   */
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
   * Only the DOT's own size changes. Redefining the numeral size variable here would also move
   * the radius derived from it, and with it the hand's length and the position of both circles.
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
   * The whole block sits after the rules it overrides, every one of them at the same
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
    padding-block-start: var(--vectis-space-2);
    border-block-start: 1px solid var(--vectis-color-border);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-time-picker-hand::before {
      transition: none;
    }
  }
}
</style>
