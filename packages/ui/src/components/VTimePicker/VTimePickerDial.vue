<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  DIAL_INNER_THRESHOLD,
  angleToIndex,
  dialIndexToHour24,
  distanceFraction,
  hour24ToDial,
  snapMinute,
  to12h,
  to24h,
} from '../../utils/time'
import type { HourFormat } from '../../utils/time'
import { pad2 } from '../../utils/text'
import { useMessages } from '../../i18n/state'

// @a11y @keyboard @core
/**
 * The clock face VTimePicker draws. It is internal to that component and never exported.
 *
 * Nothing native covers choosing a value by pointing at an angle, so the JavaScript does
 * two things: it turns a point on the face into a time — measuring the face once, then
 * pure trigonometry that lives in `utils/time` — and it implements the keyboard of a
 * slider, the arrows and the Home, End and Page keys.
 *
 * Everything one SEES is CSS: the numerals are placed around the circle, and the hand is
 * turned, from a single unitless fraction of a turn written inline.
 *
 * There is exactly ONE focusable element, and it is announced as a slider. The numerals
 * are visual markers hidden from screen readers, reached by the pointer's angle rather
 * than one cell at a time — which is why the whole spoken value has to be carried by that
 * one element.
 */
interface TimePickerDialProps {
  /** Which of the two is being adjusted: the hour or the minutes. */
  step: 'hour' | 'minute'
  /** Whether the face shows a 12- or a 24-hour clock. */
  format: HourFormat
  /** The hour being adjusted, always on the 24-hour clock. */
  hour: number
  /** The minutes being adjusted. */
  minute: number
  /** The interval the minutes snap to, both when dragging and with the arrow keys. */
  minuteStep: number
}

const props = defineProps<TimePickerDialProps>()

const emit = defineEmits<{
  /** The hour changed, still on the 24-hour clock. */
  'update:hour': [hour: number]
  /** The minutes changed. */
  'update:minute': [minute: number]
  /**
   * This step has been settled — the pointer released, or Enter pressed. WHICH of the two
   * is reported, because they do not mean the same thing: releasing a hand one has been
   * dragging is not a confirmation.
   */
  'confirm-step': [via: 'pointer' | 'keyboard']
}>()

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

const cells = computed<DialCell[]>(() => {
  if (props.step === 'minute') {
    // Only twelve markers are printed, one every five minutes — sixty numerals would be
    // unreadable — while dragging remains accurate to the minute.
    return Array.from({ length: 12 }, (_, i) => ({
      key: `m-${i}`,
      label: pad2(i * 5),
      turn: i / 12,
      ring: 'outer' as const,
      selected: props.minute === i * 5,
    }))
  }
  const outer: DialCell[] = Array.from({ length: 12 }, (_, i) => {
    const hour24 = dialIndexToHour24(i, 'outer')
    return {
      key: `o-${i}`,
      label: String(i === 0 ? 12 : i),
      turn: i / 12,
      ring: 'outer' as const,
      selected:
        props.format === '24h'
          ? props.hour === hour24
          : to12h(props.hour).hour === (i === 0 ? 12 : i),
    }
  })
  if (props.format === '12h') return outer
  const inner: DialCell[] = Array.from({ length: 12 }, (_, i) => {
    const hour24 = dialIndexToHour24(i, 'inner')
    return {
      key: `i-${i}`,
      label: pad2(hour24),
      turn: i / 12,
      ring: 'inner' as const,
      selected: props.hour === hour24,
    }
  })
  return [...outer, ...inner]
})

const handTurn = computed(() => {
  if (props.step === 'minute') return props.minute / 60
  const index =
    props.format === '24h' ? hour24ToDial(props.hour).index : to12h(props.hour).hour % 12
  return index / 12
})

const handRing = computed(() =>
  props.step === 'hour' && props.format === '24h' ? hour24ToDial(props.hour).ring : 'outer',
)

/**
 * Whether the hand points at a minute that has no marker of its own. The tip is then
 * drawn small: at full size it would cover the two neighbouring markers and read as
 * pointing at neither.
 */
const handMinor = computed(() => props.step === 'minute' && props.minute % 5 !== 0)

// @a11y — the entire spoken value of the dial. The numerals are hidden from screen
// readers, so these four attributes are the ONLY thing assistive technology has: what the
// value is, what its bounds are, and how to say it.
const ariaValueNow = computed(() => {
  if (props.step === 'minute') return props.minute
  return props.format === '12h' ? to12h(props.hour).hour : props.hour
})
const ariaValueMin = computed(() => (props.step === 'minute' ? 0 : props.format === '12h' ? 1 : 0))
const ariaValueMax = computed(() =>
  props.step === 'minute' ? 59 : props.format === '12h' ? 12 : 23,
)
// The wording has no prop: the dictionary is where it is changed.
const m = useMessages()
const ariaValueText = computed(() =>
  props.step === 'minute'
    ? m.value.timePicker.minutesValue(props.minute)
    : m.value.timePicker.hoursValue(ariaValueNow.value),
)

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
  if (props.step === 'minute') {
    emit('update:minute', snapMinute(angleToIndex(dx, dy, 60), props.minuteStep))
    return
  }
  const index = angleToIndex(dx, dy, 12)
  if (props.format === '24h') {
    const ring = distanceFraction(dx, dy, rect.width / 2) < DIAL_INNER_THRESHOLD ? 'inner' : 'outer'
    emit('update:hour', dialIndexToHour24(index, ring))
  } else {
    emit('update:hour', to24h(index === 0 ? 12 : index, to12h(props.hour).meridiem))
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
  emit('confirm-step', 'pointer')
}

function onPointercancel() {
  dragging.value = false
}

// @keyboard @a11y — the keyboard a slider is expected to have.
function moveHour(delta: number) {
  if (props.format === '24h') {
    emit('update:hour', (props.hour + delta + 24) % 24)
    return
  }
  // On a 12-hour face the hours cycle from 1 to 12 WITHIN the current half of the day:
  // passing midday is done on the AM/PM control, not by walking the hand past twelve.
  const { hour, meridiem } = to12h(props.hour)
  emit('update:hour', to24h(((hour - 1 + delta + 12) % 12) + 1, meridiem))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('confirm-step', 'keyboard')
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
  if (props.step === 'hour') {
    if (delta) moveHour(delta)
    else if (event.key === 'Home')
      emit('update:hour', props.format === '12h' ? to24h(1, to12h(props.hour).meridiem) : 0)
    else if (event.key === 'End')
      emit('update:hour', props.format === '12h' ? to24h(12, to12h(props.hour).meridiem) : 23)
    else return
    event.preventDefault()
    return
  }
  if (delta)
    emit('update:minute', snapMinute(props.minute + delta * props.minuteStep, props.minuteStep))
  else if (event.key === 'PageUp')
    emit('update:minute', snapMinute(props.minute + 5, props.minuteStep))
  else if (event.key === 'PageDown')
    emit('update:minute', snapMinute(props.minute - 5, props.minuteStep))
  else if (event.key === 'Home') emit('update:minute', 0)
  else if (event.key === 'End')
    emit('update:minute', snapMinute(60 - props.minuteStep, props.minuteStep))
  else return
  event.preventDefault()
}
</script>

<template>
  <div
    ref="faceEl"
    role="slider"
    tabindex="0"
    class="v-timepicker-dial-face"
    :aria-label="step === 'hour' ? m.timePicker.hour : m.timePicker.minutes"
    :aria-valuemin="ariaValueMin"
    :aria-valuemax="ariaValueMax"
    :aria-valuenow="ariaValueNow"
    :aria-valuetext="ariaValueText"
    :data-dragging="dragging ? '' : undefined"
    @pointerdown="onPointerdown"
    @pointermove="onPointermove"
    @pointerup="onPointerup"
    @pointercancel="onPointercancel"
    @keydown="onKeydown"
  >
    <div
      class="v-timepicker-hand"
      aria-hidden="true"
      :data-ring="handRing"
      :data-minor="handMinor ? '' : undefined"
      :style="{ '--dial-turn': String(handTurn) }"
    />
    <span class="v-timepicker-dial-center" aria-hidden="true" />
    <span
      v-for="cell in cells"
      :key="cell.key"
      class="v-timepicker-number"
      aria-hidden="true"
      :data-ring="cell.ring"
      :data-selected="cell.selected ? '' : undefined"
      :style="{ '--dial-turn': String(cell.turn) }"
      >{{ cell.label }}</span
    >
  </div>
</template>

<style>
@layer vectis.components {
  .v-timepicker-dial-face {
    position: relative;
    inline-size: var(--vectis-control-size-timepicker-dial);
    block-size: var(--vectis-control-size-timepicker-dial);
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
      var(--vectis-control-size-timepicker-dial) / 2 -
        var(--vectis-control-size-timepicker-number) / 2
    );
  }

  .v-timepicker-dial-face:focus-visible {
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
  .v-timepicker-number {
    position: absolute;
    left: calc(50% + var(--dial-radius) * sin(var(--dial-turn) * 1turn));
    top: calc(50% - var(--dial-radius) * cos(var(--dial-turn) * 1turn));
    translate: -50% -50%;
    inline-size: var(--vectis-control-size-timepicker-number);
    block-size: var(--vectis-control-size-timepicker-number);
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

  .v-timepicker-number[data-ring='inner'],
  .v-timepicker-hand[data-ring='inner'] {
    --dial-radius: calc(
      var(--vectis-control-size-timepicker-dial) / 2 -
        var(--vectis-control-size-timepicker-number) * 1.5
    );
  }

  .v-timepicker-number[data-ring='inner'] {
    font-size: var(--vectis-text-body-md-size);
    color: var(--vectis-color-text-muted);
  }

  .v-timepicker-number[data-selected] {
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
  .v-timepicker-hand {
    position: absolute;
    left: calc(50% - var(--vectis-control-size-timepicker-hand) / 2);
    bottom: 50%;
    inline-size: var(--vectis-control-size-timepicker-hand);
    block-size: var(--dial-radius);
    background: var(--vectis-color-accent);
    transform-origin: 50% 100%;
    rotate: calc(var(--dial-turn) * 1turn);
  }

  /* The dot at the tip of the hand. It is exactly the size of a numeral's cell, so it
     covers the one being pointed at — whose text turns to the colour that reads on it. */
  .v-timepicker-hand::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    translate: -50% -50%;
    inline-size: var(--vectis-control-size-timepicker-number);
    block-size: var(--vectis-control-size-timepicker-number);
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
  .v-timepicker-hand[data-minor]::before {
    inline-size: var(--vectis-control-size-timepicker-hand-minor);
    block-size: var(--vectis-control-size-timepicker-hand-minor);
  }

  .v-timepicker-dial-center {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    inline-size: var(--vectis-control-size-timepicker-center);
    block-size: var(--vectis-control-size-timepicker-center);
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-accent);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-timepicker-hand::before {
      transition: none;
    }
  }
}
</style>
