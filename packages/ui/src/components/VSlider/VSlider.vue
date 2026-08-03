<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VInput from '../VInput/VInput.vue'

import { isDev } from '../../utils/env'
import { useMessages } from '../../i18n/state'

/**
 * A native <input type="range"> (keyboard, the ARIA slider, forms — all for free). The
 * JS is limited to preventing the values from crossing in range mode (two
 * superimposed inputs — there is no dual-thumb primitive), to the numeric fields'
 * bridge (the native element does not validate free input) and to pure derivations for
 * the ticks/labels/tooltips.
 *
 * The inline custom properties (unitless fractions) are the only style binding: they
 * align the fill/ticks/labels/tooltips on the thumb's real CENTRE, which travels
 * [thumb/2, 100% − thumb/2] and not [0, 100%].
 * Vertical: native support for the vertical range in Chrome/Edge 129+, Safari 18.1+.
 */
export type SliderLabel = string | { icon: IconSource; label: string }

interface SliderProps {
  min?: number
  max?: number
  step?: number
  /** Two thumbs — the v-model becomes [start, end]. */
  range?: boolean
  disabled?: boolean
  /** Accessible label (suffixed "start"/"end" in range mode). */
  label?: string
  /** Vertical: min at the bottom, max at the top. */
  orientation?: 'horizontal' | 'vertical'
  /** Numeric fields for precise adjustment (one in single mode, one per bound in range). */
  inputs?: boolean
  /** Dots on the track at each step (implied by `labels`; not rendered past 50 steps). */
  ticks?: boolean
  /** One label per step; a string = text, an object = a Material icon + an accessible label. */
  labels?: SliderLabel[]
  /** A value bubble following the thumb during the drag / on keyboard focus. */
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

/** Fraction [0, 1] of the run for a value (the `|| 1` guards against min === max). */
const frac = (v: number) => Math.min(1, Math.max(0, (v - props.min) / (props.max - props.min || 1)))

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

/** Number of whole steps actually reachable (the native element stops at the last step ≤ max). */
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

/** Text label of the step matching a value (fallback: the raw value). */
function labelTextAt(value: number): string {
  const item = props.labels?.[Math.round((value - props.min) / props.step)]
  if (item === undefined) return String(value)
  return typeof item === 'string' ? item : item.label
}

/* Accessible names of the thumbs. No dedicated prop: the dictionary is the only
   override point.

   Outside range mode, the upper end IS the value: it keeps the consumer's `label`, and
   stays without an accessible name if none was supplied (the "Value" fallback only
   applies to the numeric field, which needs a name of its own). */
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

if (isDev) {
  if ((props.ticks || props.labels) && stepCount.value > 50)
    console.warn(`[VSlider] ${stepCount.value} steps — ticks/labels not rendered past 50.`)
  if (props.labels && props.labels.length !== stepCount.value + 1)
    console.warn(
      `[VSlider] ${props.labels.length} labels for ${stepCount.value + 1} steps — one label per step expected.`,
    )
}

// Numeric fields: the string ↔ number v-model bridge.
//
// `string | number`: the fields are `<input type="number">`, whose value Vue casts to
// a number as soon as it is parsable — an empty or intermediate entry stays a string.
// Hence the String() at commit time.
const startFieldText = ref<string | number>(String(startValue.value))
const endFieldText = ref<string | number>(String(endValue.value))

// Dragging the slider resynchronizes the fields continuously.
watch(startValue, (v) => (startFieldText.value = String(v)))
watch(endValue, (v) => (endFieldText.value = String(v)))

/**
 * Commit on `change` only (blur/Enter) — never while typing, or "1" would be clamped
 * halfway through entering "15". Empty/NaN = a silent revert.
 */
function commitField(which: 'start' | 'end') {
  const raw = which === 'start' ? startFieldText.value : endFieldText.value
  // parseFloat (and not Number): on an empty string it yields NaN → a revert, where
  // Number('') would be 0 and would overwrite the value.
  const parsed = Number.parseFloat(String(raw))
  if (Number.isNaN(parsed)) {
    resyncFields()
    return
  }
  const clamped = Math.min(props.max, Math.max(props.min, parsed))
  // Snap to the step; the 1e10 rounding neutralizes the float noise of decimal steps.
  let value = props.min + Math.round((clamped - props.min) / props.step) * props.step
  value = Math.min(props.max, Math.round(value * 1e10) / 1e10)
  if (!props.range) {
    model.value = value
  } else if (which === 'start') {
    model.value = [Math.min(value, endValue.value), endValue.value]
  } else {
    model.value = [startValue.value, Math.max(value, startValue.value)]
  }
  // An explicit resync: a commit with no model change (e.g. re-clamping onto the same
  // value) does not trigger the watchers.
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

  /* The inputs are superimposed; only their thumbs capture the pointer (indispensable
     in range mode so both stay usable). */
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

  /* In single mode the whole input captures the pointer: clicking the track moves the
     value natively (a jump + an immediate drag), with zero JS. An accepted side effect:
     the thumb's hover triggers when hovering anywhere on the track. */
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
    box-shadow: var(--vectis-shadow-1);
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
    box-shadow: var(--vectis-shadow-1);
    cursor: pointer;
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* Hover/drag: the thumb's tinted background. The states are set on the host input —
     pseudo-classes chained after the pseudo-thumb are unreliable. */
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

  /* A value tooltip: the appearance of VTooltip, but positioned by fraction — the
     native thumb is a pseudo-element, so it cannot be an anchor-positioning anchor. */
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
    box-shadow: var(--vectis-shadow-2);
    white-space: nowrap;
  }

  .v-slider-labels {
    grid-area: labels;
    position: relative;
    /* Absolutely positioned children: this reserves the height (covering xs text AND md
       icons). */
    min-block-size: var(--vectis-icon-size-md);
    --vectis-icon-size: var(--vectis-icon-size-md);
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
  }

  /* A zero-width box: the content overflows symmetrically, hence centred on the step —
     with no transform (physical, and it would break in vertical/RTL). */
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

  /* The subcontainer alone carries the writing mode: the logical geometry
     (inset-inline-*) of the track/fill/ticks switches with no duplicated rule, while
     the tooltips and labels stay outside this context (horizontal text). */
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

  /* Disabled: greys (the VCheckbox/VSwitch tokens), with no opacity */
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

  /* On the grey fill, the tick goes back to a light colour (VCheckbox's "grey tick"). */
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
