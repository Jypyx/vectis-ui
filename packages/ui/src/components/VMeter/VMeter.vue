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

import { useAriaLabel, useLabelledBy } from '../../composables/useAriaLabel'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { useLocale, useMessages } from '../../i18n/state'
import { customColorStyle } from '../../utils/css'
import { clamp } from '../../utils/number'

/** The colour of the fill, which replaces the one chosen from `low`, `high` and `optimum`. */
export type MeterTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger'

/** The thickness of the bar: 2, 4, 8, 12 or 20 pixels. */
export type MeterSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Where the value is written: after the label, or inside the bar at its start, centre or end. */
export type MeterValuePosition = 'header' | 'start' | 'center' | 'end'

/** Which way the bar fills. */
export type MeterOrientation = 'horizontal' | 'vertical'

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
   * The value as written and read by screen readers, such as "7.2 GB of 10 GB" or "Strong". It
   * replaces the formatted value.
   */
  valueText?: string
  /**
   * Formats the value for the current locale, such as a unit or a currency. Without it, the
   * value is written as a percentage of the range.
   */
  formatOptions?: Intl.NumberFormatOptions
  /** Writes the value. Screen readers read it from the bar either way. */
  showValue?: boolean
  /**
   * Where that text is written: at the end of the label's line, or inside the bar. On a vertical
   * bar the start is the minimum end, hence the bottom.
   */
  valuePosition?: MeterValuePosition
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
  /** The thickness of the bar. Only `xl` is thick enough to hold the value written inside it. */
  size?: MeterSize
  /**
   * Turns the bar upright, filling from the bottom up. Its length is then a height set on the
   * component.
   */
  orientation?: MeterOrientation
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
  showValue: false,
  valuePosition: 'header',
  // Deliberately undefined: the region of the value then picks the tone.
  tone: undefined,
  color: undefined,
  segments: 1,
  size: 'md',
  orientation: 'horizontal',
})

const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()
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

const valueInHeader = computed(() => props.showValue && props.valuePosition === 'header')
const valueInBar = computed(() => props.showValue && props.valuePosition !== 'header')

// @a11y
// A visible label names the bar by reference, unless the consumer named it themselves; without
// one, the dictionary does.
const ariaLabel = useAriaLabel(() => (props.label ? undefined : m.value.meter.label))
const labelledBy = useLabelledBy(labelId, () => props.label)
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
    :data-value-position="valuePosition"
    :data-orientation="orientation"
  >
    <div v-if="(label && !hideLabel) || valueInHeader" class="v-meter-header">
      <span v-if="label && !hideLabel" :id="labelId" class="v-meter-label">{{ label }}</span>
      <!-- Read from the bar's `aria-valuetext`, so hidden here to avoid reading it twice. -->
      <span v-if="valueInHeader" class="v-meter-value" aria-hidden="true">{{ text }}</span>
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
      :style="{
        '--meter-fraction': String(fraction),
        '--meter-segments': String(segmentCount),
        '--meter-gaps-filled': String(Math.floor(fraction * segmentCount)),
      }"
    >
      <span
        v-for="segment in segmentCount"
        :key="segment"
        class="v-meter-segment"
        :style="{ '--meter-segment-fill': String(segmentFill(segment - 1)) }"
      >
        <span class="v-meter-fill" />
      </span>
      <!--
        The same text twice, as in VProgressLinear: each copy is cut at the fill's edge, the
        second coloured to contrast with the fill. Both are hidden, `aria-valuetext` carrying
        the text.
      -->
      <template v-if="valueInBar">
        <span class="v-meter-text" aria-hidden="true">{{ text }}</span>
        <span class="v-meter-text" data-on-fill aria-hidden="true">{{ text }}</span>
      </template>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-meter {
    --meter-thickness: var(--vectis-control-size-bar-thickness-md);
    /* Fill, track and the text over the fill come from the shared tone table, as in
       VProgressLinear. */
    --meter-fill: var(--tone-bg-solid);
    --meter-track: var(--tone-bg-soft);
    --meter-text-fallback: var(--tone-text-solid);
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
    min-inline-size: 0;
    font-family: var(--vectis-text-family);
  }

  .v-meter[data-size='xs'] {
    --meter-thickness: var(--vectis-control-size-bar-thickness-xs);
  }

  .v-meter[data-size='sm'] {
    --meter-thickness: var(--vectis-control-size-bar-thickness-sm);
  }

  .v-meter[data-size='lg'] {
    --meter-thickness: var(--vectis-control-size-bar-thickness-lg);
  }

  .v-meter[data-size='xl'] {
    --meter-thickness: var(--vectis-control-size-bar-thickness-xl);
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

  /*
   * Upright, the root carries the length, so a consumer's height on it sets the bar's: the track
   * takes whatever the header leaves.
   */
  .v-meter[data-orientation='vertical'] {
    align-items: flex-start;
    block-size: var(--vectis-control-size-bar-length);
  }

  .v-meter-track {
    /*
     * Where the fill ends along the whole track, gaps included: the filled fraction of the
     * segments' total length, plus every gap the fill has crossed.
     */
    --meter-edge: calc(
      (100% - (var(--meter-segments) - 1) * var(--vectis-control-size-meter-segment-gap)) *
        var(--meter-fraction) + var(--meter-gaps-filled) *
        var(--vectis-control-size-meter-segment-gap)
    );
    position: relative;
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

  /*
   * The two copies are complementary, each cut to its own side of the fill's edge, so every
   * letter is painted once. The large negative insets keep text taller than the bar uncropped.
   */
  .v-meter-text {
    --meter-clip-start: var(--meter-edge);
    --meter-clip-end: -100vmax;
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: var(--vectis-space-2);
    color: var(--vectis-color-text);
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
    font-variant-numeric: tabular-nums;
    clip-path: inset(-100vmax var(--meter-clip-end) -100vmax var(--meter-clip-start));
    transition: clip-path var(--vectis-duration-base) var(--vectis-ease-default);
    white-space: nowrap;
    pointer-events: none;
  }

  .v-meter[data-value-position='start'] .v-meter-text {
    justify-content: start;
  }

  .v-meter[data-value-position='end'] .v-meter-text {
    justify-content: end;
  }

  /* The fallback stands alone for the reason given in VProgressLinear: a var() in a second
     declaration would win the cascade and then turn invalid. */
  .v-meter-text[data-on-fill] {
    --meter-clip-start: -100vmax;
    --meter-clip-end: calc(100% - var(--meter-edge));
    color: var(--meter-text-fallback);
  }

  @supports (color: contrast-color(red)) {
    .v-meter-text[data-on-fill] {
      color: contrast-color(var(--meter-fill));
    }
  }

  .v-meter-track:dir(rtl) .v-meter-text {
    clip-path: inset(-100vmax var(--meter-clip-start) -100vmax var(--meter-clip-end));
  }

  /*
   * As in VProgressLinear, the track turns on its side through its writing mode, so every inline
   * length and inset above follows. Zero goes to the bottom by anchoring the first segment and
   * each fill at the far end of the axis, never by reversing the direction, which would reorder
   * the text's characters.
   */
  .v-meter[data-orientation='vertical'] .v-meter-track {
    flex: 1 1 0;
    flex-direction: row-reverse;
    writing-mode: vertical-lr;
  }

  .v-meter[data-orientation='vertical'] .v-meter-fill {
    inset-inline-start: auto;
    inset-inline-end: 0;
  }

  /* A right-to-left page already runs a vertical inline axis from the bottom up. */
  .v-meter[data-orientation='vertical'] .v-meter-track:dir(rtl) {
    flex-direction: row;
  }

  .v-meter[data-orientation='vertical'] .v-meter-track:dir(rtl) .v-meter-fill {
    inset-inline-start: 0;
    inset-inline-end: auto;
  }

  .v-meter[data-orientation='vertical'] .v-meter-text {
    flex-direction: column-reverse;
    padding-inline: 0;
    padding-block: var(--vectis-space-2);
    /* The text stays upright on a bar turned on its side. */
    writing-mode: horizontal-tb;
  }

  /* The second selector outranks the right-to-left rule above instead of tying with it. */
  .v-meter[data-orientation='vertical'] .v-meter-text,
  .v-meter[data-orientation='vertical'] .v-meter-track:dir(rtl) .v-meter-text {
    clip-path: inset(var(--meter-clip-end) -100vmax var(--meter-clip-start) -100vmax);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-meter-fill,
    .v-meter-text {
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

    .v-meter-text {
      forced-color-adjust: none;
      color: CanvasText;
    }

    .v-meter-text[data-on-fill] {
      color: HighlightText;
    }
  }
}
</style>
