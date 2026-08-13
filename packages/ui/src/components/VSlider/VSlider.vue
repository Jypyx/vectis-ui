<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'

import { isDev } from '../../utils/env'
import { useMessages } from '../../i18n/state'

// @core
/**
 * A value chosen by sliding a thumb along a track, and optionally a range between two
 * of them.
 *
 * Underneath is the browser's own range control, which brings the keyboard, the correct
 * announcement to screen readers and the form behaviour with it. The JavaScript covers
 * only what it cannot: stopping the two values from crossing over each other — there is
 * no native control with two thumbs, so a range is two of them superimposed — feeding
 * the optional number fields, which the native element does not validate, and computing
 * the positions of the ticks, the labels and the tooltip.
 *
 * Those positions are handed to the stylesheet as plain fractions written inline, and
 * that is the only binding between the two. They matter because a thumb's centre does
 * NOT travel the full width of the track: it runs from half a thumb in to half a thumb
 * from the end, and everything meant to line up with it has to follow that same run.
 */
export type SliderLabel = string | { icon: IconSource; label: string }

interface SliderProps {
  /** The lowest value the thumb can reach. */
  min?: number
  /** The highest value the thumb can reach. */
  max?: number
  /** The gap between two values it can stop on. */
  step?: number
  /** Offers two thumbs to pick a range, which makes the v-model a pair of values. */
  range?: boolean
  /** Makes the slider unusable. */
  disabled?: boolean
  /**
   * What screen readers announce for the slider. In range mode the two thumbs are
   * announced as the start and the end of it.
   */
  label?: string
  /** Turns the slider upright, with the lowest value at the bottom. */
  orientation?: 'horizontal' | 'vertical'
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
  label: undefined,
  orientation: 'horizontal',
  inputs: false,
  ticks: false,
  labels: undefined,
  tooltip: false,
})

const model = defineModel<number | [number, number]>({ default: 0 })

const startValue = computed(() => (Array.isArray(model.value) ? model.value[0] : props.min))
const endValue = computed(() =>
  Array.isArray(model.value) ? model.value[1] : (model.value as number),
)

/**
 * Where a value sits along the run, as a fraction between 0 and 1. The guard covers a
 * slider whose two bounds are equal, which would otherwise divide by zero.
 */
const frac = (v: number) => Math.min(1, Math.max(0, (v - props.min) / (props.max - props.min || 1)))

// @core — what stops the two values from crossing. A range is two native controls laid
// over one another, and there is no dual-thumb control to inherit this behaviour from.
function onStartInput(event: Event) {
  const el = event.target as HTMLInputElement
  const clamped = Math.min(Number(el.value), endValue.value)
  el.value = String(clamped)
  model.value = [clamped, endValue.value]
}

function onEndInput(event: Event) {
  const el = event.target as HTMLInputElement
  if (!props.range) {
    model.value = Number(el.value)
    return
  }
  const clamped = Math.max(Number(el.value), startValue.value)
  el.value = String(clamped)
  model.value = [startValue.value, clamped]
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

const tickItems = computed(() => {
  if (!showTicks.value) return []
  return Array.from({ length: stepCount.value + 1 }, (_, i) => {
    const value = props.min + i * props.step
    const filled = props.range
      ? value >= startValue.value && value <= endValue.value
      : value <= endValue.value
    return { f: frac(value), filled }
  })
})

const labelFraction = (index: number) => frac(props.min + index * props.step)

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
const rangeEndLabel = computed(() => (props.range ? endLabel.value : props.label))
const fieldEndLabel = computed(() =>
  props.range ? endLabel.value : (props.label ?? m.value.slider.value),
)

const startValueText = computed(() => (props.labels ? labelTextAt(startValue.value) : undefined))
const endValueText = computed(() => (props.labels ? labelTextAt(endValue.value) : undefined))

// @devwarn
if (isDev) {
  if ((props.ticks || props.labels) && stepCount.value > 50)
    console.warn(`[VSlider] ${stepCount.value} steps — ticks/labels not rendered past 50.`)
  if (props.labels && props.labels.length !== stepCount.value + 1)
    console.warn(
      `[VSlider] ${props.labels.length} labels for ${stepCount.value + 1} steps — one label per step expected.`,
    )
}

// The text held by the number fields, kept apart from the slider's own value.
//
// It is typed as text OR a number because these are number fields, whose value Vue
// converts to a number as soon as it can be read as one — while an empty field, or one
// holding a half-typed "1-", stays text. That is why the value is turned back into text
// when it is committed.
const startFieldText = ref<string | number>(String(startValue.value))
const endFieldText = ref<string | number>(String(endValue.value))

// Sliding the thumb keeps the fields in step, continuously.
watch(startValue, (v) => (startFieldText.value = String(v)))
watch(endValue, (v) => (endFieldText.value = String(v)))

/**
 * Takes what was typed in a field and makes it the value — but only once the reader has
 * finished, on leaving the field or on Enter. Reading it as they type would clamp the
 * "1" of "15" to the minimum before the 5 was ever pressed.
 *
 * Anything unreadable, an empty field included, silently puts the previous value back.
 */
function commitField(which: 'start' | 'end') {
  const raw = which === 'start' ? startFieldText.value : endFieldText.value
  // TRAP — parsed rather than converted: an empty string parses to nothing, which is
  // what triggers the revert below, where converting it would give ZERO and quietly
  // overwrite the value with it.
  const parsed = Number.parseFloat(String(raw))
  if (Number.isNaN(parsed)) {
    resyncFields()
    return
  }
  const clamped = Math.min(props.max, Math.max(props.min, parsed))
  // Brought onto the nearest step. The rounding that follows removes the noise decimal
  // steps leave behind — a tenth cannot be represented exactly, so 0.1 × 3 comes out as
  // 0.30000000000000004.
  let value = props.min + Math.round((clamped - props.min) / props.step) * props.step
  value = Math.min(props.max, Math.round(value * 1e10) / 1e10)
  if (!props.range) {
    model.value = value
  } else if (which === 'start') {
    model.value = [Math.min(value, endValue.value), endValue.value]
  } else {
    model.value = [startValue.value, Math.max(value, startValue.value)]
  }
  // Put back explicitly, because a commit that does not change the value — typing 200
  // where the maximum is 100 — changes nothing for the watchers to react to, and the
  // field would go on showing what was typed.
  resyncFields()
}

function resyncFields() {
  startFieldText.value = String(startValue.value)
  endFieldText.value = String(endValue.value)
}
</script>

<template>
  <div
    class="v-slider"
    :data-range="range ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-orientation="orientation === 'vertical' ? 'vertical' : undefined"
    :style="{
      '--start-fraction': String(frac(startValue)),
      '--end-fraction': String(frac(endValue)),
    }"
  >
    <VInput
      v-if="inputs && range"
      v-model="startFieldText"
      class="v-slider-field v-slider-field-start"
      type="number"
      size="sm"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-label="startLabel"
      @change="commitField('start')"
    />
    <div class="v-slider-rail">
      <span class="v-slider-control">
        <span class="v-slider-track" aria-hidden="true">
          <span class="v-slider-fill" />
          <span
            v-for="(tick, i) in tickItems"
            :key="i"
            class="v-slider-tick"
            :data-filled="tick.filled ? '' : undefined"
            :style="{ '--fill-fraction': String(tick.f) }"
          />
        </span>
        <input
          v-if="range"
          type="range"
          class="v-slider-input v-slider-input-start"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :value="startValue"
          :aria-label="startLabel"
          :aria-valuetext="startValueText"
          @input="onStartInput"
        />
        <input
          type="range"
          class="v-slider-input v-slider-input-end"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :value="endValue"
          :aria-label="rangeEndLabel"
          :aria-valuetext="endValueText"
          @input="onEndInput"
        />
      </span>
      <span
        v-if="tooltip && range"
        class="v-slider-tooltip v-slider-tooltip-start"
        aria-hidden="true"
        :style="{ '--fill-fraction': String(frac(startValue)) }"
      >
        <span class="v-slider-tooltip-bubble">{{ startValueText ?? startValue }}</span>
      </span>
      <span
        v-if="tooltip"
        class="v-slider-tooltip v-slider-tooltip-end"
        aria-hidden="true"
        :style="{ '--fill-fraction': String(frac(endValue)) }"
      >
        <span class="v-slider-tooltip-bubble">{{ endValueText ?? endValue }}</span>
      </span>
    </div>
    <div v-if="labels" class="v-slider-labels">
      <span
        v-for="(item, i) in labels"
        :key="i"
        class="v-slider-label"
        :style="{ '--fill-fraction': String(labelFraction(i)) }"
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
      size="sm"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
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
    border-radius: var(--vectis-radius-full);
    background: var(--vectis-color-border);
    overflow: hidden;
  }

  .v-slider-fill {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: calc(var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--end-fraction));
    background: var(--vectis-color-accent);
  }

  .v-slider[data-range] .v-slider-fill {
    inset-inline-start: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--start-fraction)
    );
    inline-size: calc((100% - var(--slider-thumb)) * (var(--end-fraction) - var(--start-fraction)));
  }

  .v-slider-tick {
    --slider-tick: calc(var(--slider-track) / 3 * 2);
    position: absolute;
    inset-block: 0;
    margin-block: auto;
    inset-inline-start: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction) -
        var(--slider-tick) / 2
    );
    inline-size: var(--slider-tick);
    block-size: var(--slider-tick);
    border-radius: var(--vectis-radius-full);
    background: var(--vectis-color-border-strong);
  }

  .v-slider-tick[data-filled] {
    background: var(--vectis-color-text-on-accent);
  }

  /* The two controls lie exactly on top of one another, so only their thumbs are allowed
     to receive the pointer. Without that, the one on top would swallow every click and
     the other thumb could never be grabbed. */
  .v-slider-input {
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

  .v-slider-input::-webkit-slider-thumb {
    appearance: none;
    pointer-events: auto;
    width: var(--slider-thumb);
    height: var(--slider-thumb);
    border-radius: var(--vectis-radius-full);
    background: var(--vectis-color-surface);
    border: var(--vectis-control-border-width) solid var(--vectis-color-accent);
    box-shadow: var(--vectis-shadow-xs);
    cursor: pointer;
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-slider-input::-moz-range-thumb {
    pointer-events: auto;
    width: var(--slider-thumb);
    height: var(--slider-thumb);
    border-radius: var(--vectis-radius-full);
    background: var(--vectis-color-surface);
    border: var(--vectis-control-border-width) solid var(--vectis-color-accent);
    box-shadow: var(--vectis-shadow-xs);
    cursor: pointer;
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* The thumb tints as the pointer rests on it or drags it. TRAP — the state is read on
     the control and the thumb is then addressed, never the reverse: a state pseudo-class
     written after the thumb's own pseudo-element is unreliable across browsers. */
  .v-slider-input:hover:not(:disabled)::-webkit-slider-thumb,
  .v-slider-input:active:not(:disabled)::-webkit-slider-thumb {
    background: var(--vectis-color-accent-surface);
  }

  .v-slider-input:hover:not(:disabled)::-moz-range-thumb,
  .v-slider-input:active:not(:disabled)::-moz-range-thumb {
    background: var(--vectis-color-accent-surface);
  }

  .v-slider-input:focus-visible {
    outline: none;
  }

  .v-slider-input:focus-visible::-webkit-slider-thumb {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-slider-input:focus-visible::-moz-range-thumb {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* The bubble showing the value. It looks like a VTooltip but is placed by arithmetic
     rather than anchored to the thumb: a native thumb is a pseudo-element, and the
     browser's anchoring cannot attach anything to one. */
  .v-slider-tooltip {
    position: absolute;
    inset-block-end: calc(100% + var(--vectis-space-2));
    inset-inline-start: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction)
    );
    inline-size: 0;
    display: flex;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity var(--vectis-duration-fast) var(--vectis-ease-default),
      visibility var(--vectis-duration-fast) var(--vectis-ease-default);
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
    border-radius: var(--vectis-radius-sm);
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
    inset-inline-start: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction)
    );
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
    inset-block-end: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction)
    );
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
    inset-block-end: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction)
    );
    inset-inline-start: 0;
    inline-size: auto;
    block-size: 0;
    align-items: center;
    justify-content: flex-start;
  }

  /* A disabled slider greys out through the colour tokens, the same ones VCheckbox and
     VSwitch use, and never through opacity. */
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
    cursor: not-allowed;
  }

  .v-slider[data-disabled] .v-slider-input::-webkit-slider-thumb {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-text-subtle);
    box-shadow: none;
    cursor: not-allowed;
  }

  .v-slider[data-disabled] .v-slider-input::-moz-range-thumb {
    background: var(--vectis-color-surface-muted);
    border-color: var(--vectis-color-text-subtle);
    box-shadow: none;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-slider-input::-webkit-slider-thumb {
      transition: none;
    }

    .v-slider-input::-moz-range-thumb {
      transition: none;
    }

    .v-slider-tooltip {
      transition: none;
    }
  }
}
</style>
