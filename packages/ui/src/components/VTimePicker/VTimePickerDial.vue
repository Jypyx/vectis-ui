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
 * VTimePicker's clock dial (internal, not exported).
 *
 * No native primitive covers angular selection: the JS is limited to (1) the pointer →
 * value conversion (pointerdown/move: measuring the rect then PURE trigonometry in
 * `utils/time` — atan2, the ring threshold) and (2) the ARIA "slider" keyboard pattern
 * (arrows / Home / End / PageUp-Down). All the rendering — the numerals' positions, the
 * hand — is CSS (`sin()`/`cos()` on the inline unitless turn fraction `--dial-turn`).
 *
 * A single focusable `role="slider"` element (1 tab stop, a localized `aria-valuetext`):
 * the numerals are purely visual markers (`aria-hidden`), reached by the pointer's angle,
 * not cell by cell.
 */
interface TimePickerDialProps {
  /** The current step: selecting the hour or the minutes. */
  step: 'hour' | 'minute'
  format: HourFormat
  /** A canonical 24 h hour (0–23). */
  hour: number
  minute: number
  /** Minute granularity (dragging and arrows). */
  minuteStep: number
}

const props = defineProps<TimePickerDialProps>()

const emit = defineEmits<{
  'update:hour': [hour: number]
  'update:minute': [minute: number]
  /** A settled step value (releasing the pointer, Enter/Space). */
  'confirm-step': [via: 'pointer' | 'keyboard']
}>()

interface DialCell {
  key: string
  label: string
  /** The turn fraction [0, 1) of the numeral's position (0 = twelve o'clock). */
  turn: number
  ring: 'outer' | 'inner'
  selected: boolean
}

const cells = computed<DialCell[]>(() => {
  if (props.step === 'minute') {
    // 5-minute markers; the drag selection stays accurate to the minute.
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

/** A minute off the 5-minute markers: the hand carries a dot (an M3 detail). */
const handMinor = computed(() => props.step === 'minute' && props.minute % 5 !== 0)

// @a11y — the whole slider value contract: the numerals are aria-hidden markers,
// so `aria-valuenow`/`-min`/`-max`/`-text` are the ONLY thing AT reads off the dial.
const ariaValueNow = computed(() => {
  if (props.step === 'minute') return props.minute
  return props.format === '12h' ? to12h(props.hour).hour : props.hour
})
const ariaValueMin = computed(() => (props.step === 'minute' ? 0 : props.format === '12h' ? 1 : 0))
const ariaValueMax = computed(() =>
  props.step === 'minute' ? 59 : props.format === '12h' ? 12 : 23,
)
// No dedicated prop: the dictionary is the only override point.
const m = useMessages()
const ariaValueText = computed(() =>
  props.step === 'minute'
    ? m.value.timePicker.minutesValue(props.minute)
    : m.value.timePicker.hoursValue(ariaValueNow.value),
)

// Pointer: clicking and dragging on the face.
const faceEl = ref<HTMLElement | null>(null)
const dragging = ref(false)

function applyPoint(event: PointerEvent) {
  const face = faceEl.value
  if (!face) return
  const rect = face.getBoundingClientRect() // handler → client only (SSR-safe)
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
  // @fallback
  // try/catch: synthetic PointerEvents (play functions) have no active pointer →
  // setPointerCapture would throw NotFoundError.
  try {
    faceEl.value?.setPointerCapture(event.pointerId)
  } catch {
    /* a synthetic pointer */
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

// @keyboard @a11y
// Keyboard (the slider pattern).
function moveHour(delta: number) {
  if (props.format === '24h') {
    emit('update:hour', (props.hour + delta + 24) % 24)
    return
  }
  // 12h: a 1–12 cycle within the current meridiem (AM/PM is changed on the VToggle).
  const { hour, meridiem } = to12h(props.hour)
  emit('update:hour', to24h(((hour - 1 + delta + 12) % 12) + 1, meridiem))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('confirm-step', 'keyboard')
    return
  }
  // The arrows are not inverted in RTL: the dial is never mirrored (clockwise is
  // invariant), and + stays "forward" in both directions.
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
    /* dragging selects: it must neither scroll (touch) nor select text */
    touch-action: none;
    user-select: none;
    cursor: pointer;
    /* Radius of the numerals' centre (the outer ring). Inherited by the numerals and the
       hand; the inner ring redefines it. Keep it in step with DIAL_INNER_THRESHOLD
       (`utils/time`). */
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
   * The numerals are positioned by CSS trigonometry on the inline turn fraction
   * `--dial-turn` (sin()/cos(): Chrome 111+ / Safari 15.4+, well below the repo's floor).
   * PHYSICAL `left`/`top`/`rotate` on purpose: a clock is never mirrored in RTL
   * (clockwise is universal).
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
    /* The outer ring: dial legibility, at the large body text size */
    font-size: var(--vectis-text-body-lg-size);
    color: var(--vectis-color-text);
    /* Above the hand: the targeted numeral reads on its dot */
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
   * The hand: a stroke anchored at the centre, turned by `rotate` on the same turn
   * fraction. NO transition on rotate: between 55 and 0 min the angle goes back from
   * 0.916turn to 0turn, and the interpolation would take the long way round (an accepted
   * trade-off against Material).
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

  /* The tip dot: it covers the targeted numeral (the text switching to text-on-accent
     through [data-selected]) */
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
    /* Only the SIZE SWITCH (a marker ↔ [data-minor]) is animated: it interpolates
       between two bounded values, unlike the hand's `rotate`, left without a transition
       (see above). */
    transition:
      inline-size var(--vectis-duration-fast) var(--vectis-ease-default),
      block-size var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /*
   * A minute off the 5-minute markers: the dot covers no numeral and would spill onto
   * both neighbours → shrunk, it becomes the precise marker on its own (hence dropping
   * M3's light central dot, which would make a ring at that size). Only the pseudo's size
   * changes: redefining --vectis-control-size-timepicker-number here would also move
   * --dial-radius, hence the hand's length and the rings' radius.
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
