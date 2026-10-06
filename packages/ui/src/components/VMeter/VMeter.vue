<script setup lang="ts">
// @a11y
/**
 * A measurement within a known range, drawn in CSS under the `meter` role. The native `<meter>`
 * is styled only through vendor pseudo-elements, which need one rule set per engine, does not
 * transition its fill in Firefox and cannot be split into segments; the role carries the same
 * semantics. As with the native element, `low`, `high` and `optimum` place the value in a
 * region, which picks the tone.
 */
import { computed, useId } from 'vue'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useLocale, useMessages } from '../../i18n/state'
import { customColorStyle } from '../../utils/css'
import { clamp } from '../../utils/number'

/** The colour of the fill, which replaces the one chosen from `low`, `high` and `optimum`. */
export type MeterTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger'

/** The thickness of the bar, 4, 8 or 12 pixels, and the size of the text above it. */
export type MeterSize = 'sm' | 'md' | 'lg'

interface MeterProps {
  /** The measurement. Anything outside the range is brought back into it. */
  value?: number
  /** The lower bound of the range. */
  min?: number
  /** The upper bound of the range. A bound below `min` is raised to it. */
  max?: number
  /**
   * The upper end of the low part of the range. With `high` and `optimum`, it decides whether
   * the value is good, average or poor, which colours the bar.
   */
  low?: number
  /** The lower end of the high part of the range. */
  high?: number
  /**
   * The best value. In the low part, low values are good; in the high part, high values are;
   * between `low` and `high`, the middle is good and both ends are average.
   */
  optimum?: number
  /**
   * What is measured, shown above the bar and naming it for screen readers. Without it, the bar
   * is named from the design system dictionary; an `aria-label` or `aria-labelledby` of your own
   * takes precedence.
   */
  label?: string
  /** Hides the label visually. It still names the bar for screen readers. */
  hideLabel?: boolean
  /**
   * The value as written above the bar and read by screen readers, such as "7.2 GB of 10 GB" or
   * "Strong". It replaces the formatted value.
   */
  valueText?: string
  /**
   * Formats the value for the current locale, such as a unit or a currency. Without it, the
   * value is written as a percentage of the range.
   */
  formatOptions?: Intl.NumberFormatOptions
  /** Hides the value visually. Screen readers still read it from the bar. */
  hideValue?: boolean
  /**
   * The colour of the fill. Without it, the region of the value picks one when `low`, `high` or
   * `optimum` is set: success, warning or danger; otherwise the accent.
   */
  tone?: MeterTone
  /**
   * A colour of your own (hex, CSS name or `oklch()`), which replaces the tone. The track is
   * derived from it against the theme.
   */
  color?: string
  /** Splits the bar into this many equal parts, for a strength or a battery level. */
  segments?: number
  /** The thickness of the bar and the size of the text above it. */
  size?: MeterSize
}

// The root only lays out the text and the bar: the consumer's ARIA and other attributes belong
// on the element carrying the role.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MeterProps>(), {
  value: 0,
  min: 0,
  max: 100,
  low: undefined,
  high: undefined,
  optimum: undefined,
  label: undefined,
  hideLabel: false,
  valueText: undefined,
  formatOptions: undefined,
  hideValue: false,
  // Deliberately undefined: the region of the value then picks the tone.
  tone: undefined,
  color: undefined,
  segments: 1,
  size: 'md',
})

const { attrs, rootClass, rootStyle, forwardedAttrs } = useRootAttrs()
const m = useMessages()
const locale = useLocale()
const labelId = useId()

/* The normalization of the HTML `<meter>`: the bounds first, then each point brought into
   them, `high` never below `low`. A value that is not a number reads as the minimum. */
const range = computed(() => {
  const min = Number.isFinite(props.min) ? props.min : 0
  const max = Number.isFinite(props.max) ? Math.max(props.max, min) : Math.max(100, min)
  const fit = (point: number | undefined, from: number, fallback: number) =>
    point === undefined || Number.isNaN(point) ? fallback : clamp(point, from, max)
  const low = fit(props.low, min, min)
  return {
    min,
    max,
    value: fit(props.value, min, min),
    low,
    high: fit(props.high, low, max),
    optimum: fit(props.optimum, min, (min + max) / 2),
  }
})

const fraction = computed(() => {
  const { min, max, value } = range.value
  return max > min ? (value - min) / (max - min) : 0
})

// @core
// The regions of the HTML `<meter>`, with the boundaries Chromium draws: the part holding the
// optimum is good, the part next to it average, and the far part, when the optimum sits beyond
// `low` or `high`, poor.
const level = computed<'optimum' | 'suboptimal' | 'poor'>(() => {
  const { value, low, high, optimum } = range.value
  if (optimum >= low && optimum <= high)
    return value >= low && value <= high ? 'optimum' : 'suboptimal'
  if (optimum < low) return value < low ? 'optimum' : value <= high ? 'suboptimal' : 'poor'
  return value > high ? 'optimum' : value >= low ? 'suboptimal' : 'poor'
})

const LEVEL_TONES = { optimum: 'success', suboptimal: 'warning', poor: 'danger' } as const

const resolvedTone = computed<MeterTone>(() => {
  if (props.tone) return props.tone
  const graded = props.low !== undefined || props.high !== undefined || props.optimum !== undefined
  return graded ? LEVEL_TONES[level.value] : 'accent'
})

const text = computed(() => {
  if (props.valueText !== undefined) return props.valueText
  if (props.formatOptions)
    return new Intl.NumberFormat(locale.value, props.formatOptions).format(range.value.value)
  return m.value.progress.percent(Math.round(fraction.value * 100))
})

const segmentCount = computed(() =>
  Number.isFinite(props.segments) ? Math.max(1, Math.floor(props.segments)) : 1,
)

/** How much of segment `index` is filled, from 0 to 1. */
const segmentFill = (index: number) => clamp(fraction.value * segmentCount.value - index, 0, 1)

// @a11y
// A visible label names the bar by reference, unless the consumer named it themselves; without
// one, the dictionary does.
const ariaLabel = useAriaLabel(() => (props.label ? undefined : m.value.meter.label))
const labelledBy = computed(() =>
  props.label && attrs['aria-label'] == null && attrs['aria-labelledby'] == null
    ? labelId
    : undefined,
)
</script>

<template>
  <div
    class="v-meter v-tone"
    :class="rootClass"
    :style="[customColorStyle(color), rootStyle]"
    :data-tone="resolvedTone"
    :data-custom="color !== undefined ? '' : undefined"
    :data-level="level"
    :data-size="size"
  >
    <div v-if="(label && !hideLabel) || !hideValue" class="v-meter-header">
      <span v-if="label && !hideLabel" :id="labelId" class="v-meter-label">{{ label }}</span>
      <!-- Read from the bar's `aria-valuetext`, so hidden here to avoid reading it twice. -->
      <span v-if="!hideValue" class="v-meter-value" aria-hidden="true">{{ text }}</span>
    </div>
    <span v-if="label && hideLabel" :id="labelId" class="v-visually-hidden">{{ label }}</span>
    <div
      class="v-meter-track"
      role="meter"
      :aria-valuenow="range.value"
      :aria-valuemin="range.min"
      :aria-valuemax="range.max"
      :aria-valuetext="text"
      :aria-labelledby="labelledBy"
      :aria-label="ariaLabel"
      v-bind="forwardedAttrs"
    >
      <span
        v-for="segment in segmentCount"
        :key="segment"
        class="v-meter-segment"
        :style="{ '--meter-segment-fill': String(segmentFill(segment - 1)) }"
      >
        <span class="v-meter-fill" />
      </span>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-meter {
    --meter-thickness: var(--vectis-control-size-meter-thickness-md);
    /*
     * Fill and track come from the shared tone table. The track takes the soft border rather than
     * the soft background: the empty part must stay visible, since the reading is a proportion.
     */
    --meter-fill: var(--tone-bg-solid);
    --meter-track: var(--tone-border-soft);
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    min-inline-size: 0;
    font-family: var(--vectis-text-family);
  }

  /* The custom-colour row of the tone table defines no soft border; the tone's would show. */
  .v-meter[data-custom] {
    --meter-track: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 70%);
  }

  .v-meter[data-size='sm'] {
    --meter-thickness: var(--vectis-control-size-meter-thickness-sm);
  }

  .v-meter[data-size='lg'] {
    --meter-thickness: var(--vectis-control-size-meter-thickness-lg);
  }

  .v-meter-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: var(--vectis-space-2);
  }

  .v-meter-label {
    color: var(--vectis-color-text);
    font-size: var(--vectis-text-label-size);
    font-weight: var(--vectis-text-label-weight);
    line-height: var(--vectis-text-label-leading);
  }

  /* Pushed to the end even without a label before it. */
  .v-meter-value {
    margin-inline-start: auto;
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-body-md-size);
    font-weight: var(--vectis-text-body-md-weight);
    line-height: var(--vectis-text-body-md-leading);
    font-variant-numeric: tabular-nums;
  }

  .v-meter[data-size='sm'] .v-meter-label,
  .v-meter[data-size='sm'] .v-meter-value {
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-text-caption-weight);
    line-height: var(--vectis-text-caption-leading);
  }

  .v-meter-track {
    display: flex;
    gap: var(--vectis-control-size-meter-segment-gap);
    block-size: var(--meter-thickness);
  }

  .v-meter-segment {
    position: relative;
    flex: 1 1 0;
    border-radius: var(--vectis-radius-pill);
    background: var(--meter-track);
  }

  .v-meter-fill {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: calc(100% * var(--meter-segment-fill));
    border-radius: inherit;
    background: var(--meter-fill);
    /* A logical length rather than a scale, which would have to be undone in right to left. */
    transition:
      inline-size var(--vectis-duration-base) var(--vectis-ease-default),
      background-color var(--vectis-duration-base) var(--vectis-ease-default);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-meter-fill {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .v-meter-segment {
      forced-color-adjust: none;
      background: Canvas;
      box-shadow: inset 0 0 0 var(--vectis-control-border-width) CanvasText;
    }

    .v-meter-fill {
      background: Highlight;
    }
  }
}
</style>
