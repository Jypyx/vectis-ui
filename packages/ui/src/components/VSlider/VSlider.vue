<script setup lang="ts">
// @core
/**
 * A value chosen by sliding a thumb along a track, optionally a range between two.
 *
 * Underneath is a native `<input type="range">`, which brings the keyboard, the ARIA and the
 * form behaviour. The JS covers only what it cannot: stopping the two values crossing —
 * there is no native two-thumb control, so a range is two superimposed — refusing a change
 * when `readonly`, which a range input has no native form of, feeding the optional number
 * fields, and computing the positions of the ticks and labels.
 *
 * Those positions reach the stylesheet as unitless inline fractions, and that is the whole
 * binding between the two. They matter because a thumb's CENTRE does not travel the full
 * width of the track: it runs from half a thumb in to half a thumb from the end, and
 * everything meant to line up with it has to follow that same run.
 */

import { computed, inject, ref, watch } from 'vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'
import { inputGroupKey } from '../VInput/context'

import { useControlShape } from '../../composables/useControlShape'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { isDev } from '../../utils/env'
import { clamp } from '../../utils/number'
import { useMessages } from '../../i18n/state'

export type SliderLabel = string | { icon: IconSource; label: string }

/** The value of a slider: one number, or an ordered pair of them in range mode. */
export type SliderValue = number | [number, number]

/** Which way the track runs. */
export type SliderOrientation = 'horizontal' | 'vertical'

/** The height of the number fields: 32, 40 or 48 pixels. */
export type SliderSize = 'sm' | 'md' | 'lg'

interface SliderProps {
  /** The lowest value the thumb can reach. It is 0 by default. */
  min?: number
  /** The highest value the thumb can reach. It is 100 by default. */
  max?: number
  /**
   * The gap between two values the thumb can stop on, 1 by default. It is also what the
   * arrow keys move by, and what a value typed into the companion field is snapped to.
   */
  step?: number
  /** Offers two thumbs to pick a range, which makes the v-model a pair of values. */
  range?: boolean
  /** Makes the slider unusable. */
  disabled?: boolean
  /**
   * Shows the value without allowing it to be changed. The thumbs can still be focused and
   * are announced as read-only, but neither the pointer nor the keyboard moves them, and the
   * number fields turn read-only with them.
   */
  readonly?: boolean
  /**
   * Marks the value as invalid, which colours the thumbs and tells assistive technology
   * so. It is for a rule the browser cannot check by itself.
   */
  invalid?: boolean
  /**
   * The height of the number fields `inputs` adds. Inside a VInputGroup the group's size
   * wins, as it does for every field of the row.
   */
  size?: SliderSize
  /**
   * What screen readers announce for the slider. It is an accessible name and draws
   * nothing on screen. In range mode the two thumbs are announced as the start and the
   * end of it.
   */
  label?: string
  /** Turns the slider upright, with the lowest value at the bottom. */
  orientation?: SliderOrientation
  /**
   * Adds a number field beside the slider for setting the value exactly — one, or one
   * per end in range mode. Sliding is quick but imprecise; this is the way out.
   */
  inputs?: boolean
  /**
   * Marks each step on the track. Providing labels implies it. Past fifty steps the
   * marks would be an unreadable comb and are not drawn at all.
   */
  ticks?: boolean
  /**
   * A label for every step, in order — a piece of text, or an icon with the words that
   * name it for screen readers. They also become what a screen reader announces in
   * place of the raw number.
   */
  labels?: SliderLabel[]
  /** Shows the value in a bubble above the thumb while it is being moved or focused. */
  tooltip?: boolean
}

const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  range: false,
  disabled: false,
  readonly: false,
  invalid: false,
  size: 'md',
  label: undefined,
  orientation: 'horizontal',
  inputs: false,
  ticks: false,
  labels: undefined,
  tooltip: false,
})

/**
 * The value, and its SHAPE is what puts the slider in range mode: a single number — 0 to
 * begin with — gives one thumb, a pair of them gives two. The pair is always ordered, the
 * thumbs being stopped from crossing.
 */
const model = defineModel<SliderValue>({ default: 0 })

const emit = defineEmits<{
  /**
   * The reader has SETTLED on a value: a thumb was released or moved by a key, or a number
   * field was committed. It carries the whole value, a pair in range mode, and fires for
   * either thumb, where the v-model follows every step of a drag.
   */
  change: [value: SliderValue]
}>()

// The number fields are fields of a VInputGroup row like any other, so the row's size and
// its disabled state reach them through the same arbitration. A slider has no `compact` of
// its own: only the row's can apply.
const group = inject(inputGroupKey, null)
const {
  size: resolvedSize,
  compact: resolvedCompact,
  disabled: resolvedDisabled,
} = useControlShape(
  {
    get size() {
      return props.size
    },
    compact: false,
    get disabled() {
      return props.disabled
    },
  },
  group,
)

type Thumb = 'start' | 'end'

const startValue = computed(() => (Array.isArray(model.value) ? model.value[0] : props.min))
const endValue = computed(() =>
  Array.isArray(model.value) ? model.value[1] : (model.value as number),
)

const thumbValue = (which: Thumb) => (which === 'start' ? startValue.value : endValue.value)

/**
 * Where a value sits along the run, as a fraction between 0 and 1. The guard covers a
 * slider whose two bounds are equal, which would otherwise divide by zero.
 */
const frac = (v: number) => clamp((v - props.min) / (props.max - props.min || 1), 0, 1)

// @core — the ONE place a thumb is written, so what stops the two values crossing exists
// once for the thumbs and the number fields alike. A range is two native controls laid over
// one another, and there is no dual-thumb control to inherit this behaviour from. It returns
// what was written, which is what each caller reads back: a model that lags a parent
// `v-model` would still hold the value from before.
function writeThumb(which: Thumb, n: number): SliderValue {
  const next: SliderValue = !props.range
    ? n
    : which === 'start'
      ? [Math.min(n, endValue.value), endValue.value]
      : [startValue.value, Math.max(n, startValue.value)]
  model.value = next
  return next
}

const writtenFor = (value: SliderValue, which: Thumb) =>
  Array.isArray(value) ? value[which === 'start' ? 0 : 1] : value

function onThumbInput(which: Thumb, event: Event) {
  const el = event.target as HTMLInputElement
  // @core
  // A drag or a click on the track has ALREADY moved the native thumb when `input` fires,
  // and the event cannot be cancelled: putting the value back is the only refusal there is.
  // It lands before the browser paints, so the thumb never visibly leaves its place, and
  // since the value at release is the one it started from, no `change` follows either.
  if (props.readonly) {
    el.value = String(thumbValue(which))
    return
  }
  // Written back to the DOM as well: a thumb dragged past its sibling stops against it.
  el.value = String(writtenFor(writeThumb(which, Number(el.value)), which))
}

// @keyboard @core
// The keys that move a range input, cancelled before the browser applies them when the
// slider is read-only. Tab and every other key pass, so the thumbs stay reachable.
const VALUE_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
])

function onThumbKeydown(event: KeyboardEvent) {
  if (props.readonly && VALUE_KEYS.has(event.key)) event.preventDefault()
}

// @core
/*
 * A range is two native controls, and a consumer's `@change` could only ever reach ONE of
 * them through the forwarded attributes: moving the start thumb told nobody. So `change` is
 * declared and fed by both.
 *
 * TRAP — the settled value is read off the THUMB, never off the model. A key press fires
 * `input` and `change` back to back in one task, and under a parent `v-model` the model's
 * local copy only catches up when the parent re-renders, so it would still hold the value
 * from before the key.
 */
function onThumbChange(which: Thumb, event: Event) {
  if (props.readonly) return
  const value = Number((event.target as HTMLInputElement).value)
  if (!props.range) emit('change', value)
  else emit('change', which === 'start' ? [value, endValue.value] : [startValue.value, value])
}

/**
 * How many whole steps the thumb can actually stop on. It matters when the range does
 * not divide evenly by the step: the native control stops at the last step that fits,
 * short of the maximum, and the ticks have to agree with it.
 */
const stepCount = computed(() => Math.floor((props.max - props.min) / props.step + 1e-9))

const showTicks = computed(
  () =>
    (props.ticks || props.labels !== undefined) && stepCount.value >= 1 && stepCount.value <= 50,
)

/**
 * Each step's value and the style that places it, shared by the ticks and the labels. Only
 * the bounds and the step move them, so dragging a thumb rebuilds none of it: each style
 * object keeps its identity from one render to the next, and Vue skips a binding whose
 * object has not changed. Which ticks are FILLED does follow the value, and is asked
 * separately, in `isFilled`.
 */
const stepPlaces = computed(() => {
  const length = Math.max(showTicks.value ? stepCount.value + 1 : 0, props.labels?.length ?? 0)
  return Array.from({ length }, (_, i) => {
    const value = props.min + i * props.step
    return { value, style: { '--fill-fraction': String(frac(value)) } }
  })
})

const tickPlaces = computed(() =>
  showTicks.value ? stepPlaces.value.slice(0, stepCount.value + 1) : [],
)

const isFilled = (value: number) =>
  props.range ? value >= startValue.value && value <= endValue.value : value <= endValue.value

/** What a value is called, if the consumer named its step; failing that, the number itself. */
function labelTextAt(value: number): string {
  const item = props.labels?.[Math.round((value - props.min) / props.step)]
  if (item === undefined) return String(value)
  return typeof item === 'string' ? item : item.label
}

// @a11y
/* What each thumb is announced as. There is no prop for the two halves: the wording
   comes from the dictionary, which is also where it is changed.

   With a single thumb there is nothing to distinguish: that thumb IS the value, so it
   simply takes the consumer's label, and is left unnamed when none was given. The
   generic fallback applies to the NUMBER FIELD alone, which cannot go unnamed — a bare
   field in a form has to say what it holds. */
const m = useMessages()
const startLabel = computed(() =>
  props.label ? m.value.slider.rangeStart(props.label) : m.value.slider.start,
)
const endLabel = computed(() =>
  props.label ? m.value.slider.rangeEnd(props.label) : m.value.slider.end,
)
const thumbEndLabel = computed(() => (props.range ? endLabel.value : props.label))
const fieldEndLabel = computed(() =>
  props.range ? endLabel.value : (props.label ?? m.value.slider.value),
)

const startValueText = computed(() =>
  props.range && props.labels ? labelTextAt(startValue.value) : undefined,
)
const endValueText = computed(() => (props.labels ? labelTextAt(endValue.value) : undefined))

// @a11y
/*
 * The wrapper-root split. The root here is a layout box holding the labels, the track and
 * the optional number fields, so a consumer's `name`, `id`, `required` and `aria-*` have
 * to be redirected onto the real `<input type="range">` — left on the wrapper, a `name`
 * submits nothing and a `<label for>` points at a div.
 *
 * They go to the END thumb, which is the one always rendered. A RANGE has two thumbs and
 * therefore no single value to submit, which the warning below says out loud rather than
 * letting a form come back with half the answer.
 */
defineOptions({ inheritAttrs: false })
const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

// @devwarn
if (isDev) {
  if ((props.ticks || props.labels) && stepCount.value > 50)
    console.warn(`[VSlider] ${stepCount.value} steps — ticks/labels not rendered past 50.`)
  if (props.labels && props.labels.length !== stepCount.value + 1)
    console.warn(
      `[VSlider] ${props.labels.length} labels for ${stepCount.value + 1} steps — one label per step expected.`,
    )
  if (props.range && attrs.name !== undefined)
    console.warn(
      `[VSlider] name="${String(attrs.name)}" on a range: only the end thumb carries it, so the form receives one value of the two. Bind the model to two inputs of your own instead.`,
    )
}

// The text held by the number fields, kept apart from the slider's own value.
//
// It is typed as text OR a number because these are number fields, whose value Vue
// converts to a number as soon as it can be read as one — while an empty field, or one
// holding a half-typed "1-", stays text. That is why the value is turned back into text
// when it is committed. The start field exists in range mode only, and so does its sync.
const startFieldText = ref<string | number>(String(startValue.value))
const endFieldText = ref<string | number>(String(endValue.value))

// Sliding the thumb keeps the fields in step, continuously.
watch(startValue, (v) => {
  if (props.range) startFieldText.value = String(v)
})
watch(endValue, (v) => (endFieldText.value = String(v)))

/**
 * Takes what was typed in a field and makes it the value — but only once the reader has
 * finished, on leaving the field or on Enter. Reading it as they type would clamp the
 * "1" of "15" to the minimum before the 5 was ever pressed.
 *
 * Anything unreadable, an empty field included, silently puts the previous value back.
 */
function commitField(which: Thumb) {
  const raw = which === 'start' ? startFieldText.value : endFieldText.value
  // TRAP — parsed rather than converted: an empty string parses to nothing, which is
  // what triggers the revert below, where converting it would give ZERO and quietly
  // overwrite the value with it.
  const parsed = Number.parseFloat(String(raw))
  if (Number.isNaN(parsed)) {
    resyncFields()
    return
  }
  // Brought onto the nearest step. The rounding that follows removes the noise decimal
  // steps leave behind — a tenth cannot be represented exactly, so 0.1 × 3 comes out as
  // 0.30000000000000004.
  const clamped = clamp(parsed, props.min, props.max)
  let value = props.min + Math.round((clamped - props.min) / props.step) * props.step
  value = Math.min(props.max, Math.round(value * 1e10) / 1e10)
  const previous = thumbValue(which)
  const next = writeThumb(which, value)
  // Emitted only when the value MOVED, as a native range emits nothing for a key that
  // cannot move its thumb — and the payload is `next`, the model's local copy lagging a
  // parent `v-model` (see `onThumbChange`).
  if (writtenFor(next, which) !== previous) emit('change', next)
  // Put back explicitly, because a commit that does not change the value — typing 200
  // where the maximum is 100 — changes nothing for the watchers to react to, and the
  // field would go on showing what was typed.
  resyncFields()
}

function resyncFields() {
  if (props.range) startFieldText.value = String(startValue.value)
  endFieldText.value = String(endValue.value)
}

const endThumbEl = ref<HTMLInputElement | null>(null)

// The root is a layout box, so a template ref on the component reaches the wrapper and not
// the control. Both members point at the END thumb: it is the one always rendered, and the
// one the consumer's `id` lands on, so `focus()` goes where a `<label for>` would send it.
defineExpose({
  /** Moves the focus to the end thumb, the only thumb outside range mode. */
  focus: (options?: FocusOptions) => endThumbEl.value?.focus(options),
  /** The end thumb's real `<input type="range">`, for what `focus` does not cover. */
  el: endThumbEl,
})
</script>

<template>
  <div
    class="v-slider"
    :class="rootClass"
    :data-range="range ? '' : undefined"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-size="resolvedSize"
    :data-orientation="orientation"
    :style="[
      rootStyle,
      {
        '--start-fraction': range ? String(frac(startValue)) : undefined,
        '--end-fraction': String(frac(endValue)),
      },
    ]"
  >
    <VInput
      v-if="inputs && range"
      v-model="startFieldText"
      class="v-slider-field v-slider-field-start"
      type="number"
      :size="resolvedSize"
      :compact="resolvedCompact"
      :min="min"
      :max="max"
      :step="step"
      :disabled="resolvedDisabled"
      :readonly="readonly"
      :invalid="invalid"
      :aria-label="startLabel"
      @change="commitField('start')"
    />
    <div class="v-slider-rail">
      <span class="v-slider-control">
        <span class="v-slider-track" aria-hidden="true">
          <span class="v-slider-fill" />
          <span
            v-for="(tick, i) in tickPlaces"
            :key="i"
            class="v-slider-tick"
            :data-filled="isFilled(tick.value) ? '' : undefined"
            :style="tick.style"
          />
        </span>
        <input
          v-if="range"
          type="range"
          class="v-slider-input v-slider-input-start"
          :min="min"
          :max="max"
          :step="step"
          :disabled="resolvedDisabled"
          :value="startValue"
          :aria-label="startLabel"
          :aria-valuetext="startValueText"
          :aria-invalid="invalid || undefined"
          :aria-readonly="readonly || undefined"
          @keydown="onThumbKeydown"
          @input="onThumbInput('start', $event)"
          @change="onThumbChange('start', $event)"
        />
        <!-- The consumer's attributes come FIRST, so what the component decides for
             itself — the bounds, the value, the disabled state and the thumb's own
             accessible name — cannot be overwritten by one of them. Naming a slider
             goes through the `label` prop, which is what gives each thumb of a range a
             name of its own. -->
        <input
          ref="endThumbEl"
          v-bind="forwardedAttrs"
          type="range"
          class="v-slider-input v-slider-input-end"
          :min="min"
          :max="max"
          :step="step"
          :disabled="resolvedDisabled"
          :value="endValue"
          :aria-label="thumbEndLabel"
          :aria-valuetext="endValueText"
          :aria-invalid="invalid || undefined"
          :aria-readonly="readonly || undefined"
          @keydown="onThumbKeydown"
          @input="onThumbInput('end', $event)"
          @change="onThumbChange('end', $event)"
        />
      </span>
      <span
        v-if="tooltip && range"
        class="v-slider-tooltip v-slider-tooltip-start"
        aria-hidden="true"
      >
        <span class="v-slider-tooltip-bubble">{{ startValueText ?? startValue }}</span>
      </span>
      <span v-if="tooltip" class="v-slider-tooltip v-slider-tooltip-end" aria-hidden="true">
        <span class="v-slider-tooltip-bubble">{{ endValueText ?? endValue }}</span>
      </span>
    </div>
    <div v-if="labels" class="v-slider-labels">
      <span
        v-for="(item, i) in labels"
        :key="i"
        class="v-slider-label"
        :style="stepPlaces[i]?.style"
      >
        <template v-if="typeof item === 'string'">{{ item }}</template>
        <VIcon v-else v-bind="iconProps(item.icon)" :label="item.label" />
      </span>
    </div>
    <VInput
      v-if="inputs"
      v-model="endFieldText"
      class="v-slider-field v-slider-field-end"
      type="number"
      :size="resolvedSize"
      :compact="resolvedCompact"
      :min="min"
      :max="max"
      :step="step"
      :disabled="resolvedDisabled"
      :readonly="readonly"
      :invalid="invalid"
      :aria-label="fieldEndLabel"
      @change="commitField('end')"
    />
  </div>
</template>

<style>
@layer vectis.components {
  .v-slider {
    --slider-thumb: var(--vectis-control-size-slider-thumb);
    --slider-track: var(--vectis-control-size-slider-track);
    display: grid;
    grid-template-areas: 'rail';
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    column-gap: var(--vectis-space-2);
    row-gap: var(--vectis-space-1);
    width: 100%;
    font-family: var(--vectis-text-family);
  }

  /*
     The zones the root lays out, from least to most furnished. `:has()` takes the
     specificity of its argument, so the single-condition rules are all (0,2,0) and the
     two-condition ones (0,3,0) — which means the five below are arbitrated by SOURCE
     ORDER as much as by weight, and a range slider with inputs matches three of them at
     once. They must stay in this order, each configuration overwriting the poorer one it
     builds on. Alphabetize them, or move `field-start` above `field-end`, and the start
     field lands outside the grid: no error, just a control sitting where nothing put it. */
  .v-slider:has(.v-slider-labels) {
    grid-template-areas: 'rail' 'labels';
  }

  .v-slider:has(.v-slider-field-end) {
    grid-template-areas: 'rail field-end';
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .v-slider:has(.v-slider-field-end):has(.v-slider-labels) {
    grid-template-areas: 'rail field-end' 'labels .';
  }

  .v-slider:has(.v-slider-field-start) {
    grid-template-areas: 'field-start rail field-end';
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .v-slider:has(.v-slider-field-start):has(.v-slider-labels) {
    grid-template-areas: 'field-start rail field-end' '. labels .';
  }

  .v-slider-rail {
    grid-area: rail;
    position: relative;
    block-size: var(--slider-thumb);
  }

  .v-slider-control {
    position: absolute;
    inset: 0;
  }

  .v-slider-track {
    position: absolute;
    inset-inline: 0;
    inset-block: 0;
    margin-block: auto;
    block-size: var(--slider-track);
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-border);
    overflow: hidden;
  }

  /*
     Where a thumb's CENTRE sits for the fraction `--fill-fraction`, written once for every
     element lined up with it: half a thumb in, then the fraction of the run that is left.

     TRAP — it must be declared on the element that CARRIES the fraction, never on an
     ancestor. A custom property's `var()` is resolved where the property is declared, so
     set on the root it would read a `--fill-fraction` the root does not have and turn
     invalid, and every tick, label and bubble would drop to its static position at the
     start of the track, with no error. The `100%`, on the other hand, stays a percentage
     until it is used, and resolves against the box of the property that reads it — the
     inline size of the track for an inset, the block size in the vertical rules. */
  .v-slider-fill,
  .v-slider-tick,
  .v-slider-tooltip,
  .v-slider-label {
    --slider-at: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction)
    );
  }

  .v-slider-fill {
    --fill-fraction: var(--end-fraction);
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: var(--slider-at);
    background: var(--vectis-color-accent);
  }

  .v-slider[data-range] .v-slider-fill {
    --fill-fraction: var(--start-fraction);
    inset-inline-start: var(--slider-at);
    inline-size: calc((100% - var(--slider-thumb)) * (var(--end-fraction) - var(--start-fraction)));
  }

  .v-slider-tick {
    --slider-tick: calc(var(--slider-track) / 3 * 2);
    position: absolute;
    inset-block: 0;
    margin-block: auto;
    inset-inline-start: calc(var(--slider-at) - var(--slider-tick) / 2);
    inline-size: var(--slider-tick);
    block-size: var(--slider-tick);
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-border-strong);
  }

  .v-slider-tick[data-filled] {
    background: var(--vectis-color-text-on-accent);
  }

  /* The two controls lie exactly on top of one another, so only their thumbs are allowed
     to receive the pointer. Without that, the one on top would swallow every click and
     the other thumb could never be grabbed.

     The thumb's paint lives in variables set HERE, on the control, and read once by each
     vendor pseudo-element below. That is what lets every state be written a single time:
     a state pseudo-class written after the thumb's own pseudo-element is unreliable across
     browsers, so a state has to be read on the control either way, and the thumb inherits
     the variables from it.

     The thumb is white in BOTH themes, the VSwitch thumb's colour: on a dark page a thumb
     painted in `surface` sinks into the track instead of standing out as the handle. */
  .v-slider-input {
    --slider-thumb-bg: var(--vectis-color-text-on-accent);
    --slider-thumb-border: var(--vectis-color-accent);
    --slider-thumb-shadow: var(--vectis-shadow-xs);
    --slider-thumb-outline: none;
    --slider-thumb-cursor: pointer;
    --slider-thumb-transition: background-color var(--vectis-duration-fast)
      var(--vectis-ease-default);
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    appearance: none;
    background: transparent;
    pointer-events: none;
  }

  /* With a single thumb there is nothing underneath to protect, so the whole control
     takes the pointer again — which is what makes clicking the track jump the value
     there and start dragging at once, natively and with no code at all. The accepted
     side effect is that the thumb lights up when the pointer is anywhere over the
     track. */
  .v-slider:not([data-range]) .v-slider-input {
    pointer-events: auto;
    cursor: pointer;
  }

  /* TRAP — the two vendor pseudo-elements stay in two separate rules. A selector list
     holding one a browser does not know is dropped WHOLE, so merged, each engine would
     throw away the other's thumb and draw its native one. */
  .v-slider-input::-webkit-slider-thumb {
    appearance: none;
    pointer-events: auto;
    width: var(--slider-thumb);
    height: var(--slider-thumb);
    border-radius: var(--vectis-radius-pill);
    background: var(--slider-thumb-bg);
    border: var(--vectis-control-border-width) solid var(--slider-thumb-border);
    box-shadow: var(--slider-thumb-shadow);
    outline: var(--slider-thumb-outline);
    outline-offset: var(--vectis-focus-ring-offset);
    cursor: var(--slider-thumb-cursor);
    transition: var(--slider-thumb-transition);
  }

  .v-slider-input::-moz-range-thumb {
    pointer-events: auto;
    width: var(--slider-thumb);
    height: var(--slider-thumb);
    border-radius: var(--vectis-radius-pill);
    background: var(--slider-thumb-bg);
    border: var(--vectis-control-border-width) solid var(--slider-thumb-border);
    box-shadow: var(--slider-thumb-shadow);
    outline: var(--slider-thumb-outline);
    outline-offset: var(--vectis-focus-ring-offset);
    cursor: var(--slider-thumb-cursor);
    transition: var(--slider-thumb-transition);
  }

  /* The states, all at (0,3,0) but the base, so their ORDER arbitrates them: hover, then
     read-only, invalid and disabled, each overriding what came before on a thumb that is
     several at once.

     The hover tint is mixed from the thumb's own white rather than read from
     `accent-surface`: that token turns dark in the dark theme, and a white thumb would
     flash nearly black under the pointer. */
  .v-slider-input:is(:hover, :active):not(:disabled) {
    --slider-thumb-bg: color-mix(
      in oklab,
      var(--vectis-color-text-on-accent),
      var(--vectis-color-accent) 10%
    );
  }

  .v-slider-input:focus-visible {
    --slider-thumb-outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline: none;
  }

  /* The muted text colour a read-only VCheckbox takes, on the fill and the thumb's ring:
     the value stays plainly readable, the accent no longer invites a drag. */
  .v-slider[data-readonly] .v-slider-input {
    --slider-thumb-bg: var(--vectis-color-surface);
    --slider-thumb-border: var(--vectis-color-text-muted);
    --slider-thumb-cursor: default;
    cursor: default;
  }

  .v-slider[data-readonly] .v-slider-fill {
    background: var(--vectis-color-text-muted);
  }

  .v-slider[data-readonly] .v-slider-tick[data-filled] {
    background: var(--vectis-color-surface);
  }

  /* The border colour VCheckbox and VRadio take when invalid, on the thumb's ring. */
  .v-slider[data-invalid] .v-slider-input {
    --slider-thumb-border: var(--vectis-color-danger);
  }

  /* The bubble showing the value. It looks like a VTooltip but is placed by arithmetic
     rather than anchored to the thumb: a native thumb is a pseudo-element, and the
     browser's anchoring cannot attach anything to one. The fraction it follows is the one
     the root already carries for the fill. */
  .v-slider-tooltip {
    position: absolute;
    inset-block-end: calc(100% + var(--vectis-space-2));
    inset-inline-start: var(--slider-at);
    inline-size: 0;
    display: flex;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity var(--vectis-duration-fast) var(--vectis-ease-default),
      visibility var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-slider-tooltip-start {
    --fill-fraction: var(--start-fraction);
  }

  .v-slider-tooltip-end {
    --fill-fraction: var(--end-fraction);
  }

  .v-slider:has(.v-slider-input-start:active) .v-slider-tooltip-start,
  .v-slider:has(.v-slider-input-start:focus-visible) .v-slider-tooltip-start,
  .v-slider:has(.v-slider-input-end:active) .v-slider-tooltip-end,
  .v-slider:has(.v-slider-input-end:focus-visible) .v-slider-tooltip-end {
    opacity: 1;
    visibility: visible;
  }

  .v-slider-tooltip-bubble {
    padding: var(--vectis-space-1) var(--vectis-space-2);
    background: var(--vectis-color-surface-inverse);
    color: var(--vectis-color-text-on-inverse);
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
    /* VTooltip's bubble corner, so the two tooltips of the design system stay one shape. */
    border-radius: min(var(--vectis-radius-interactive), calc(0.5lh + var(--vectis-space-1)));
    box-shadow: var(--vectis-shadow-sm);
    white-space: nowrap;
  }

  .v-slider-labels {
    grid-area: labels;
    position: relative;
    /* The labels are positioned individually and therefore contribute no height of
       their own; this reserves enough room for either kind, a small line of text or an
       icon. */
    min-block-size: var(--vectis-icon-size-md);
    --vectis-icon-size: var(--vectis-icon-size-md);
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
  }

  /* A box of zero width placed exactly on the step: its content then overflows equally
     on both sides, which centres it there. Centring it with a transform would be the
     usual trick, but a transform is physical and would have to be undone for the
     vertical orientation and again for a right-to-left page. */
  .v-slider-label {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: var(--slider-at);
    inline-size: 0;
    display: flex;
    justify-content: center;
    white-space: nowrap;
  }

  .v-slider-field.v-input {
    inline-size: var(--vectis-control-size-slider-field);
  }

  .v-slider-field-start {
    grid-area: field-start;
  }

  .v-slider-field-end {
    grid-area: field-end;
  }

  .v-slider[data-orientation='vertical'] {
    grid-template-areas: 'rail';
    grid-template-columns: none;
    inline-size: fit-content;
    justify-items: center;
  }

  .v-slider[data-orientation='vertical']:has(.v-slider-labels) {
    grid-template-areas: 'rail labels';
    grid-template-columns: auto auto;
  }

  .v-slider[data-orientation='vertical']:has(.v-slider-field-end) {
    grid-template-areas: 'field-end' 'rail';
    grid-template-columns: none;
  }

  .v-slider[data-orientation='vertical']:has(.v-slider-field-end):has(.v-slider-labels) {
    grid-template-areas: 'field-end .' 'rail labels';
    grid-template-columns: auto auto;
  }

  .v-slider[data-orientation='vertical']:has(.v-slider-field-start) {
    grid-template-areas: 'field-end' 'rail' 'field-start';
    grid-template-columns: none;
  }

  .v-slider[data-orientation='vertical']:has(.v-slider-field-start):has(.v-slider-labels) {
    grid-template-areas: 'field-end .' 'rail labels' 'field-start .';
    grid-template-columns: auto auto;
  }

  .v-slider[data-orientation='vertical'] .v-slider-rail {
    inline-size: var(--slider-thumb);
    block-size: var(--vectis-control-size-slider-length);
  }

  /* Only this inner box is turned upright, and that is the whole trick: the track, the
     fill and the ticks are all placed with logical properties, so they follow the change
     of axis with no rule written a second time — while the bubbles and the labels stay
     outside that box, and therefore keep their text horizontal.

     The direction is reversed with it so that the lowest value ends up at the bottom. */
  .v-slider[data-orientation='vertical'] .v-slider-control {
    writing-mode: vertical-lr;
    direction: rtl;
  }

  .v-slider[data-orientation='vertical'] .v-slider-tooltip {
    inset-block-end: var(--slider-at);
    inset-inline-start: auto;
    inset-inline-end: calc(100% + var(--vectis-space-2));
    inline-size: auto;
    block-size: 0;
    align-items: center;
    justify-content: flex-end;
  }

  .v-slider[data-orientation='vertical'] .v-slider-labels {
    align-self: stretch;
    min-block-size: auto;
  }

  .v-slider[data-orientation='vertical'] .v-slider-label {
    inset-block-start: auto;
    inset-block-end: var(--slider-at);
    inset-inline-start: 0;
    inline-size: auto;
    block-size: 0;
    align-items: center;
    justify-content: flex-start;
  }

  /* A disabled slider greys out through the colour tokens, the same ones VCheckbox and
     VSwitch use, and never through opacity. It comes LAST among the states, so a slider
     both disabled and read-only or invalid is drawn disabled. */
  .v-slider[data-disabled] {
    cursor: not-allowed;
  }

  .v-slider[data-disabled] .v-slider-track {
    background: var(--vectis-color-surface-muted);
  }

  .v-slider[data-disabled] .v-slider-fill {
    background: var(--vectis-color-text-subtle);
  }

  .v-slider[data-disabled] .v-slider-tick {
    background: var(--vectis-color-text-subtle);
  }

  /* A tick sitting on the greyed fill takes the light colour back, so that it stays
     visible against it — the same inversion VCheckbox applies to its disabled tick. */
  .v-slider[data-disabled] .v-slider-tick[data-filled] {
    background: var(--vectis-color-surface-muted);
  }

  .v-slider[data-disabled] .v-slider-labels {
    color: var(--vectis-color-text-subtle);
  }

  .v-slider[data-disabled] .v-slider-input {
    --slider-thumb-bg: var(--vectis-color-surface-muted);
    --slider-thumb-border: var(--vectis-color-text-subtle);
    --slider-thumb-shadow: none;
    --slider-thumb-cursor: not-allowed;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-slider-input {
      --slider-thumb-transition: none;
    }

    .v-slider-tooltip {
      transition: none;
    }
  }
}
</style>
