<script setup lang="ts">
// @core
/**
 * Native range inputs own thumb interaction. JavaScript keeps range endpoints ordered and
 * synchronizes optional number fields, labels and ARIA values.
 */

import { computed, inject, ref, watchEffect } from 'vue'
import VField from '../VField/VField.vue'
import type { FieldControlProps, FieldLabelPosition } from '../VField/VField.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import { inputGroupKey } from '../VInput/context'
import VNumberInput from '../VNumberInput/VNumberInput.vue'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useControlShape } from '../../composables/useControlShape'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { isDev } from '../../utils/env'
import { clamp } from '../../utils/number'
import { useMessages, useResolvedLocale } from '../../i18n/state'

/**
 * What one step of the track is called: a piece of text, or an icon paired with the words that
 * name it, which a screen reader reads in place of the raw number.
 */
export type SliderLabel = string | { icon: IconSource; label: string }

/** The value of a slider: one number, or an ordered pair of them in range mode. */
export type SliderValue = number | [number, number]

/** Which way the track runs. */
export type SliderOrientation = 'horizontal' | 'vertical'

/** The height of the number fields: 32, 40 or 48 pixels. */
export type SliderSize = 'sm' | 'md' | 'lg'

/**
 * Where the number fields sit: none, at the ends of the track, or in a row above or below
 * it. On an upright slider, above and below become the two sides of it.
 */
export type SliderInputs = false | 'ends' | 'top' | 'bottom'

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
   * The label above the slider, which also names its thumbs: in range mode they are announced
   * as the start and the end of it.
   */
  label?: string
  /** Hides the label visually. It still names the thumbs for assistive technology. */
  hideLabel?: boolean
  /**
   * Where the label sits: above the slider (`top`, the default), or at its start, in a column of
   * its own, moving back above when there is not room for both.
   */
  labelPosition?: FieldLabelPosition
  /**
   * A line of help under the track, stating what the numbers mean or where they may go. It
   * is tied to the slider for assistive technology, so it is read out after the name rather
   * than as part of it.
   */
  hint?: string
  /**
   * A message saying what is wrong with the value, shown in place of the hint so that the field
   * does not grow. It marks the field invalid, is read along with it, and is announced when it
   * appears or changes.
   */
  error?: string
  /** Turns the slider upright, with the lowest value at the bottom. */
  orientation?: SliderOrientation
  /**
   * Adds a number field for setting the value exactly: one, or one per end in range mode. No
   * field is drawn by default.
   */
  inputs?: SliderInputs
  /**
   * Marks each step on the track. Providing labels implies it. Past fifty steps the
   * marks would be an unreadable comb and are not drawn at all.
   */
  ticks?: boolean
  /**
   * A label for every step, in order: a piece of text, or an icon with the words that
   * name it for screen readers. They also become what a screen reader announces in
   * place of the raw number.
   */
  labels?: SliderLabel[]
  /** Shows the value in a bubble above the thumb while it is being moved or focused. */
  tooltip?: boolean
  /**
   * How the value is written in the bubble, the number fields and what the thumbs announce: the
   * options of `Intl.NumberFormat`, for a price, a unit or a percentage. `min`, `max` and `step`
   * stay in the model's unit: with `style: 'percent'`, 0.25 is written 25%.
   */
  formatOptions?: Intl.NumberFormatOptions
  /** The locale the value is written and read in. It defaults to the design system's. */
  locale?: string
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
  hideLabel: false,
  labelPosition: 'top',
  hint: undefined,
  error: undefined,
  orientation: 'horizontal',
  inputs: false,
  ticks: false,
  labels: undefined,
  tooltip: false,
  formatOptions: undefined,
  locale: undefined,
})

/** The value: a single number, 0 to begin with, or an ordered pair once `range` is set. */
const model = defineModel<SliderValue>({ default: 0 })

const emit = defineEmits<{
  /** The value is BEING changed: every step of a drag, and every key that moves a thumb. */
  input: [value: SliderValue]
  /**
   * The reader has SETTLED on a value: a thumb was released or moved by a key, or a number
   * field was committed.
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

// @core
// The thumb being held PUSHES its sibling; it must not stop against it. Two thumbs resting on
// the same value are one thumb as far as the pointer is concerned, the end one being last in
// the DOM and therefore the only one it can reach; so a range stopped at `[100, 100]` could
// only ever be raised, and at the maximum it could not move at all.
function writeThumb(which: Thumb, n: number): SliderValue {
  const next: SliderValue = !props.range
    ? n
    : which === 'start'
      ? [n, Math.max(n, endValue.value)]
      : [Math.min(n, startValue.value), n]
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
  const next = writeThumb(which, Number(el.value))
  el.value = String(writtenFor(next, which))
  emit('input', next)
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
 * The settled value is read off the THUMB, never off the model. A key press fires `input` and
 * `change` back to back in one task, and under a parent `v-model` the model's local copy only
 * catches up when the parent re-renders, so it would still hold the value from before the key.
 */
function onThumbChange(which: Thumb, event: Event) {
  if (props.readonly) return
  const value = Number((event.target as HTMLInputElement).value)
  if (!props.range) emit('change', value)
  else if (which === 'start') emit('change', [value, Math.max(value, endValue.value)])
  else emit('change', [Math.min(value, startValue.value), value])
}

/** How many whole steps the thumb can actually stop on. */
const stepCount = computed(() =>
  props.step > 0 ? Math.floor((props.max - props.min) / props.step + 1e-9) : 0,
)

/**
 * The highest value a thumb can actually stop on, which is the last whole step and not
 * necessarily the maximum: with `min=0 max=95 step=10` the native control stops at 90.
 */
const lastStop = computed(() =>
  props.step > 0 ? props.min + stepCount.value * props.step : props.max,
)

const showTicks = computed(
  () =>
    (props.ticks || props.labels !== undefined) && stepCount.value >= 1 && stepCount.value <= 50,
)

/** Each step's value and the style that places it, shared by the ticks and the labels. */
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

// Resolved once here and handed to the number fields as the result, so the fields and the
// bubble can never read the value in two different languages.
const resolvedLocale = useResolvedLocale(() => props.locale)
const numberFormat = computed(
  () => new Intl.NumberFormat(resolvedLocale.value, props.formatOptions),
)
const formatValue = (value: number) => numberFormat.value.format(value)

/** What a value is called, if the consumer named its step; failing that, the number written. */
function labelTextAt(value: number): string {
  const item = props.labels?.[Math.round((value - props.min) / props.step)]
  if (item === undefined) return formatValue(value)
  return typeof item === 'string' ? item : item.label
}

// @a11y
/*
 * Resolve the label against consumer ARIA attributes before deriving distinct range-thumb
 * names; an undefined prop must not erase their accessible name.
 */
const m = useMessages()
const resolvedLabel = useAriaLabel(() => props.label)
const startLabel = computed(() =>
  resolvedLabel.value ? m.value.slider.rangeStart(resolvedLabel.value) : m.value.slider.start,
)
const endLabel = computed(() =>
  resolvedLabel.value ? m.value.slider.rangeEnd(resolvedLabel.value) : m.value.slider.end,
)
const thumbEndLabel = computed(() => (props.range ? endLabel.value : resolvedLabel.value))
const fieldEndLabel = computed(() =>
  props.range ? endLabel.value : (resolvedLabel.value ?? m.value.slider.value),
)

// @a11y
// Said only when it adds something to the bare number a range announces: a step label, or a
// value written with `formatOptions` ("120 €" rather than "120").
const spokenText = (value: number) =>
  props.labels || props.formatOptions ? labelTextAt(value) : undefined
const startValueText = computed(() => (props.range ? spokenText(startValue.value) : undefined))
const endValueText = computed(() => spokenText(endValue.value))

// @a11y
/*
 * The wrapper-root split. The root here is a layout box holding the labels, the track and the
 * optional number fields, so a consumer's `name`, `id`, `required` and `aria-*` have to be
 * redirected onto the real `<input type="range">`; left on the wrapper, a `name` submits
 * nothing and a `<label for>` points at a div.
 */
defineOptions({ inheritAttrs: false })
const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

/**
 * What reaches the end thumb from VField: the consumer's attributes and the description. The
 * thumbs are named by `aria-label`, carrying the label's words, so VField's reference to the
 * label text gives way to the consumer's own `aria-labelledby`, if any. A `required` attribute
 * is VField's prop on the way, which group mode keeps for its asterisk: it is handed on here.
 */
function thumbAttrs(fieldProps: FieldControlProps): FieldControlProps {
  return {
    ...fieldProps,
    'aria-labelledby': attrs['aria-labelledby'] as string | undefined,
    required: attrs.required as true | undefined,
  }
}
const isInvalid = computed(() => props.invalid || !!props.error)

/**
 * Where the fields go, `ends` standing in for any other truthy value: a bare `inputs`
 * attribute reaches the component as `true`, the prop being part boolean.
 */
const inputsPlace = computed(() =>
  props.inputs === 'top' || props.inputs === 'bottom' ? props.inputs : props.inputs && 'ends',
)

// @devwarn
/*
 * Every guard here describes something that fails SILENTLY. They sit in an effect, so a
 * bound that only becomes wrong on a later render is still caught, and each sentence is
 * given once per instance: the same warning repeated on every keystroke is how a warning
 * stops being read (the `useFileField` arrangement).
 */
if (isDev) {
  // Keyed by a short id rather than by the sentence: each of these embeds a count, so the
  // same guard reported twice would read as two different messages and warn again.
  const warned = new Set<string>()
  const warn = (id: string, message: string) => {
    if (warned.has(id)) return
    warned.add(id)
    console.warn(`[VSlider] ${message}`)
  }
  watchEffect(() => {
    if (props.step <= 0)
      warn(
        'step',
        `step="${props.step}" cannot move a thumb: the arrow keys do nothing and a value typed into a field is committed as it stands. Give a positive step.`,
      )
    if ((props.ticks || props.labels) && stepCount.value > 50)
      warn(
        'ticks',
        `${stepCount.value} steps: no tick is drawn past 50, the comb being unreadable.`,
      )
    if (props.labels && props.labels.length !== stepCount.value + 1)
      warn(
        'labels',
        `${props.labels.length} labels for ${stepCount.value + 1} steps: one label per step expected.`,
      )
    if (props.inputs !== false && props.inputs !== inputsPlace.value)
      warn(
        'inputs',
        `inputs="${String(props.inputs)}" is not a placement: the fields are drawn at the ends. Write inputs="ends", "top" or "bottom".`,
      )
    if (props.range && attrs.name !== undefined)
      warn(
        'name',
        `name="${String(attrs.name)}" on a range: only the end thumb carries it, so the form receives one value of the two. Bind the model to two inputs of your own instead.`,
      )
  })
}

// @a11y
/*
 * The fields are rendered in the order they are SEEN, before or after the track, so that
 * the tab order follows the screen. Laid out by the grid alone from a fixed DOM order, a
 * row of fields above the track would be reached one on each side of the thumbs.
 */
const fieldsBefore = computed<Thumb[]>(() => {
  if (inputsPlace.value === 'ends') return props.range ? ['start'] : []
  if (inputsPlace.value === 'top') return props.range ? ['start', 'end'] : ['end']
  return []
})
const fieldsAfter = computed<Thumb[]>(() => {
  if (inputsPlace.value === 'ends') return ['end']
  if (inputsPlace.value === 'bottom') return props.range ? ['start', 'end'] : ['end']
  return []
})

const fieldLabel = (which: Thumb) => (which === 'start' ? startLabel.value : fieldEndLabel.value)

// @core
/**
 * What a number field commits, on leaving it or on Enter. VNumberInput has already parsed and
 * bounded it, and puts its text back to the value it is given when this refuses or changes
 * what was typed; an emptied field is refused.
 */
function commitField(which: Thumb, typed: number | null) {
  if (typed === null) return
  // The ceiling is the last step that FITS, never `max` itself: a native range stops there
  // (what `stepCount` counts), so a value past it would put the thumb, the fill and the number
  // out of step.
  const snapped =
    props.step > 0 ? props.min + Math.round((typed - props.min) / props.step) * props.step : typed
  const value = Math.min(lastStop.value, Math.round(snapped * 1e10) / 1e10)
  const previous = thumbValue(which)
  const next = writeThumb(which, value)
  // Emitted only when the value MOVED, as a native range emits nothing for a key that cannot
  // move its thumb; and the payload is `next`, the model's local copy lagging a parent
  // `v-model` (see `onThumbChange`).
  if (writtenFor(next, which) !== previous) emit('change', next)
}

const endThumbEl = ref<HTMLInputElement | null>(null)

// Both members point at the END thumb: it is the one always rendered, and the one the
// consumer's `id` lands on, so `focus()` goes where a `<label for>` would send it.
defineExpose({
  /** Moves the focus to the end thumb, the only thumb outside range mode. */
  focus: (options?: FocusOptions) => endThumbEl.value?.focus(options),
  /** The end thumb's real `<input type="range">`, for what `focus` does not cover. */
  el: endThumbEl,
})
</script>

<template>
  <VField
    v-bind="forwardedAttrs"
    class="v-slider"
    :class="rootClass"
    :style="rootStyle"
    :label="label"
    :hint="hint"
    :error="error"
    :disabled="resolvedDisabled"
    :hide-label="hideLabel"
    :label-position="labelPosition"
    group
  >
    <!-- The label is text only: the thumbs carry the same words as their accessible names. -->
    <template #default="{ fieldProps }">
      <div
        class="v-slider-body"
        :data-range="range ? '' : undefined"
        :data-disabled="resolvedDisabled ? '' : undefined"
        :data-readonly="readonly ? '' : undefined"
        :data-invalid="isInvalid ? '' : undefined"
        :data-size="resolvedSize"
        :data-orientation="orientation"
        :data-inputs="inputsPlace || undefined"
        :style="{
          '--slider-start-fraction': range ? String(frac(startValue)) : undefined,
          '--slider-end-fraction': String(frac(endValue)),
        }"
      >
        <VNumberInput
          v-for="which in fieldsBefore"
          :key="which"
          :model-value="thumbValue(which)"
          :class="['v-slider-field', `v-slider-field-${which}`]"
          controls="none"
          :format-options="formatOptions"
          :locale="resolvedLocale"
          :size="resolvedSize"
          :compact="resolvedCompact"
          :min="min"
          :max="max"
          :step="step"
          :disabled="resolvedDisabled"
          :readonly="readonly"
          :invalid="isInvalid"
          :aria-label="fieldLabel(which)"
          @update:model-value="commitField(which, $event)"
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
              :aria-invalid="isInvalid || undefined"
              :aria-readonly="readonly || undefined"
              @keydown="onThumbKeydown"
              @input="onThumbInput('start', $event)"
              @change="onThumbChange('start', $event)"
            />
            <!--
          The consumer's attributes come first, so what the component decides for itself; the
          bounds, the value and the disabled state; cannot be overwritten by one of them, and so
          that an ARIA state the consumer sets is not erased by an `undefined` of ours.
          `aria-valuetext` is one of those: the component has one to say only when `labels` or
          `formatOptions` was given.
        -->
            <input
              ref="endThumbEl"
              :aria-invalid="isInvalid || undefined"
              :aria-readonly="readonly || undefined"
              :aria-valuetext="endValueText"
              v-bind="thumbAttrs(fieldProps)"
              type="range"
              class="v-slider-input v-slider-input-end"
              :min="min"
              :max="max"
              :step="step"
              :disabled="resolvedDisabled"
              :value="endValue"
              :aria-label="thumbEndLabel"
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
            <span class="v-slider-tooltip-bubble">{{ labelTextAt(startValue) }}</span>
          </span>
          <span v-if="tooltip" class="v-slider-tooltip v-slider-tooltip-end" aria-hidden="true">
            <span class="v-slider-tooltip-bubble">{{ labelTextAt(endValue) }}</span>
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
        <VNumberInput
          v-for="which in fieldsAfter"
          :key="which"
          :model-value="thumbValue(which)"
          :class="['v-slider-field', `v-slider-field-${which}`]"
          controls="none"
          :format-options="formatOptions"
          :locale="resolvedLocale"
          :size="resolvedSize"
          :compact="resolvedCompact"
          :min="min"
          :max="max"
          :step="step"
          :disabled="resolvedDisabled"
          :readonly="readonly"
          :invalid="isInvalid"
          :aria-label="fieldLabel(which)"
          @update:model-value="commitField(which, $event)"
        />
      </div>
    </template>
  </VField>
</template>

<style>
@layer vectis.components {
  .v-slider-body {
    --slider-thumb: var(--vectis-control-size-slider-thumb);
    --slider-track: var(--vectis-control-size-slider-track);
    display: grid;
    grid-template-areas: 'rail';
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    column-gap: var(--vectis-space-2);
    row-gap: var(--vectis-space-1);
    inline-size: 100%;
    font-family: var(--vectis-text-family);
  }

  /*
   * Each combination is written with exactly the conditions that define it, so a richer one
   * always carries one condition more than the poorer ones it also matches and wins on WEIGHT,
   * never on source order: `[data-inputs='ends'][data-range]:has(.v-slider-labels)` is (0,4,0)
   * against the (0,3,0) of the two it builds on. `:has()` weighs its argument.
   */
  .v-slider-body:has(.v-slider-labels) {
    grid-template-areas: 'rail' 'labels';
  }

  .v-slider-body[data-inputs='ends'] {
    grid-template-areas: 'rail field-end';
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .v-slider-body[data-inputs='ends']:has(.v-slider-labels) {
    grid-template-areas: 'rail field-end' 'labels .';
  }

  .v-slider-body[data-inputs='ends'][data-range] {
    grid-template-areas: 'field-start rail field-end';
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .v-slider-body[data-inputs='ends'][data-range]:has(.v-slider-labels) {
    grid-template-areas: 'field-start rail field-end' '. labels .';
  }

  .v-slider-body[data-inputs='top'] {
    grid-template-areas: 'field-start . field-end' 'rail rail rail';
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .v-slider-body[data-inputs='top']:has(.v-slider-labels) {
    grid-template-areas: 'field-start . field-end' 'rail rail rail' 'labels labels labels';
  }

  .v-slider-body[data-inputs='bottom'] {
    grid-template-areas: 'rail rail rail' 'field-start . field-end';
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .v-slider-body[data-inputs='bottom']:has(.v-slider-labels) {
    grid-template-areas: 'rail rail rail' 'labels labels labels' 'field-start . field-end';
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
   * It must be declared on the element that CARRIES the fraction, never on an ancestor. A
   * custom property's `var()` is resolved where the property is declared, so set on the root it
   * would read a `--fill-fraction` the root does not have and turn invalid, and every tick,
   * label and bubble would drop to its static position at the start of the track, with no
   * error.
   */
  .v-slider-fill,
  .v-slider-tick,
  .v-slider-tooltip,
  .v-slider-label {
    --slider-at: calc(
      var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * var(--fill-fraction)
    );
  }

  .v-slider-fill {
    --fill-fraction: var(--slider-end-fraction);
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: var(--slider-at);
    background: var(--vectis-color-accent);
  }

  .v-slider-body[data-range] .v-slider-fill {
    --fill-fraction: var(--slider-start-fraction);
    inset-inline-start: var(--slider-at);
    inline-size: calc(
      (100% - var(--slider-thumb)) * (var(--slider-end-fraction) - var(--slider-start-fraction))
    );
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

  /*
   * Without that, the one on top would swallow every click and the other thumb could never be
   * grabbed. The thumb's paint lives in variables set here, on the control, and read once by
   * each vendor pseudo-element below.
   */
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

  /*
   * With a single thumb there is nothing underneath to protect, so the whole control takes the
   * pointer again; which makes clicking the track jump the value there and start dragging at
   * once, natively and with no code at all. The accepted side effect is that the thumb lights
   * up when the pointer is anywhere over the track.
   */
  .v-slider-body:not([data-range]) .v-slider-input {
    pointer-events: auto;
    cursor: pointer;
  }

  /*
   * The two vendor pseudo-elements stay in two separate rules. A selector list holding one a
   * browser does not know is dropped whole, so merged, each engine would throw away the other's
   * thumb and draw its native one.
   */
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

  .v-slider-body[data-readonly] .v-slider-input {
    --slider-thumb-bg: var(--vectis-color-surface);
    --slider-thumb-border: var(--vectis-color-text-muted);
    --slider-thumb-cursor: default;
    cursor: default;
  }

  .v-slider-body[data-readonly] .v-slider-fill {
    background: var(--vectis-color-text-muted);
  }

  .v-slider-body[data-readonly] .v-slider-tick[data-filled] {
    background: var(--vectis-color-surface);
  }

  .v-slider-body[data-invalid] .v-slider-input {
    --slider-thumb-border: var(--vectis-color-danger);
  }

  /*
   * It looks like a VTooltip but is placed by arithmetic rather than anchored to the thumb: a
   * native thumb is a pseudo-element, and the browser's anchoring cannot attach anything to
   * one. The fraction it follows is the one the root already carries for the fill.
   */
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
    --fill-fraction: var(--slider-start-fraction);
  }

  .v-slider-tooltip-end {
    --fill-fraction: var(--slider-end-fraction);
  }

  .v-slider-body:has(.v-slider-input-start:active) .v-slider-tooltip-start,
  .v-slider-body:has(.v-slider-input-start:focus-visible) .v-slider-tooltip-start,
  .v-slider-body:has(.v-slider-input-end:active) .v-slider-tooltip-end,
  .v-slider-body:has(.v-slider-input-end:focus-visible) .v-slider-tooltip-end {
    opacity: 1;
    visibility: visible;
  }

  .v-slider-tooltip-bubble {
    padding: var(--vectis-space-1) var(--vectis-space-2);
    background: var(--vectis-color-surface-inverse);
    color: var(--vectis-color-text-on-inverse);
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
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
    /* The pair travels together, as it does in every `[data-size]` block of
       control-size.css: the size applies to every source, the optical size only to the
       ligature, and setting one without the other draws a 20px glyph cut for 24. */
    --vectis-icon-size: var(--vectis-icon-size-md);
    --vectis-icon-opsz: 20;
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

  /* Qualify number-field selectors so their layout cannot depend on VInput stylesheet order. */
  .v-slider-field-start.v-input {
    grid-area: field-start;
  }

  .v-slider-field-end.v-input {
    grid-area: field-end;
  }

  .v-slider-body[data-orientation='vertical'] {
    grid-template-areas: 'rail';
    grid-template-columns: none;
    inline-size: fit-content;
    justify-items: center;
  }

  .v-slider-body[data-orientation='vertical']:has(.v-slider-labels) {
    grid-template-areas: 'rail labels';
    grid-template-columns: auto auto;
  }

  .v-slider-body[data-orientation='vertical'][data-inputs='ends'] {
    grid-template-areas: 'field-end' 'rail';
    grid-template-columns: none;
  }

  .v-slider-body[data-orientation='vertical'][data-inputs='ends']:has(.v-slider-labels) {
    grid-template-areas: 'field-end .' 'rail labels';
    grid-template-columns: auto auto;
  }

  .v-slider-body[data-orientation='vertical'][data-inputs='ends'][data-range] {
    grid-template-areas: 'field-end' 'rail' 'field-start';
    grid-template-columns: none;
  }

  .v-slider-body[data-orientation='vertical'][data-inputs='ends'][data-range]:has(
      .v-slider-labels
    ) {
    grid-template-areas: 'field-end .' 'rail labels' 'field-start .';
    grid-template-columns: auto auto;
  }

  /*
   * Upright, `top` and `bottom` become the two SIDES, the inline start and the inline end: the
   * fields stack in a column beside the track, the end field level with its top and the start
   * field with its bottom, where the values they hold sit. The track spans the three rows and
   * gives them their height, the middle one taking whatever the fields leave.
   */
  .v-slider-body[data-orientation='vertical'][data-inputs='top'] {
    grid-template-areas: 'field-end rail' '. rail' 'field-start rail';
    grid-template-columns: auto auto;
    grid-template-rows: auto 1fr auto;
  }

  .v-slider-body[data-orientation='vertical'][data-inputs='top']:has(.v-slider-labels) {
    grid-template-areas:
      'field-end rail labels'
      '. rail labels'
      'field-start rail labels';
    grid-template-columns: auto auto auto;
  }

  .v-slider-body[data-orientation='vertical'][data-inputs='bottom'] {
    grid-template-areas: 'rail field-end' 'rail .' 'rail field-start';
    grid-template-columns: auto auto;
    grid-template-rows: auto 1fr auto;
  }

  .v-slider-body[data-orientation='vertical'][data-inputs='bottom']:has(.v-slider-labels) {
    grid-template-areas:
      'rail labels field-end'
      'rail labels .'
      'rail labels field-start';
    grid-template-columns: auto auto auto;
  }

  .v-slider-body[data-orientation='vertical'] .v-slider-rail {
    inline-size: var(--slider-thumb);
    block-size: var(--vectis-control-size-slider-length);
  }

  /*
   * Rotate only the track box and reverse its direction; labels remain horizontal and the
   * minimum value stays at the bottom.
   */
  .v-slider-body[data-orientation='vertical'] .v-slider-control {
    writing-mode: vertical-lr;
    direction: rtl;
  }

  .v-slider-body[data-orientation='vertical'] .v-slider-tooltip {
    inset-block-end: var(--slider-at);
    inset-inline-start: auto;
    inset-inline-end: calc(100% + var(--vectis-space-2));
    inline-size: auto;
    block-size: 0;
    align-items: center;
    justify-content: flex-end;
  }

  .v-slider-body[data-orientation='vertical'] .v-slider-labels {
    align-self: stretch;
    min-block-size: auto;
  }

  .v-slider-body[data-orientation='vertical'] .v-slider-label {
    inset-block-start: auto;
    inset-block-end: var(--slider-at);
    inset-inline-start: 0;
    inline-size: auto;
    block-size: 0;
    align-items: center;
    justify-content: flex-start;
  }

  /*
   * A disabled slider greys out through the colour tokens, the same ones VCheckbox and VSwitch
   * use, and never through opacity. It comes last among the states, so a slider both disabled
   * and read-only or invalid is drawn disabled.
   */
  .v-slider-body[data-disabled] {
    cursor: not-allowed;
  }

  .v-slider-body[data-disabled] .v-slider-track {
    background: var(--vectis-color-surface-muted);
  }

  .v-slider-body[data-disabled] .v-slider-fill {
    background: var(--vectis-color-text-subtle);
  }

  .v-slider-body[data-disabled] .v-slider-tick {
    background: var(--vectis-color-text-subtle);
  }

  /*
   * A tick sitting on the greyed fill takes the light colour back, so that it stays visible
   * against it; the same inversion VCheckbox applies to its disabled tick.
   */
  .v-slider-body[data-disabled] .v-slider-tick[data-filled] {
    background: var(--vectis-color-surface-muted);
  }

  .v-slider-body[data-disabled] .v-slider-labels {
    color: var(--vectis-color-text-subtle);
  }

  .v-slider-body[data-disabled] .v-slider-input {
    --slider-thumb-bg: var(--vectis-color-surface-muted);
    --slider-thumb-border: var(--vectis-color-text-subtle);
    --slider-thumb-shadow: none;
    --slider-thumb-cursor: not-allowed;
    cursor: not-allowed;
  }

  /*
   * Forced colours erase background-only tracks and ticks. Restore the track edge and use
   * system Highlight/HighlightText for selected portions.
   */
  @media (forced-colors: active) {
    .v-slider-body .v-slider-track {
      forced-color-adjust: none;
      background: Canvas;
      box-shadow: inset 0 0 0 var(--vectis-control-border-width) CanvasText;
    }

    .v-slider-body .v-slider-fill {
      forced-color-adjust: none;
      background: Highlight;
    }

    .v-slider-body .v-slider-tick {
      forced-color-adjust: none;
      background: CanvasText;
    }

    .v-slider-body .v-slider-tick[data-filled] {
      background: HighlightText;
    }

    .v-slider-body .v-slider-input {
      forced-color-adjust: none;
      --slider-thumb-bg: Canvas;
      --slider-thumb-border: CanvasText;
      --slider-thumb-shadow: none;
    }

    .v-slider-body[data-disabled] .v-slider-track {
      box-shadow: inset 0 0 0 var(--vectis-control-border-width) GrayText;
    }

    .v-slider-body[data-disabled] .v-slider-fill,
    .v-slider-body[data-disabled] .v-slider-tick {
      background: GrayText;
    }

    .v-slider-body[data-disabled] .v-slider-input {
      --slider-thumb-border: GrayText;
    }
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
