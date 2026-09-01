<script setup lang="ts">
// @core — no behavioural JS at all: value normalization and the display string.
/**
 * Progress drawn as a ring, an SVG whose geometry is described entirely in CSS with no JS
 * computing anything.
 *
 * Two things make that possible. There is no `viewBox`, so one user unit is one pixel and
 * the circles take plain lengths — a fixed coordinate system would mean converting the
 * thickness into its units, hence knowing the ratio in code and recomputing it at every
 * change of size. And `pathLength="100"` declares the outline 100 units long whatever its
 * real circumference, so the portion drawn is a percentage with no π anywhere.
 *
 * NAMING — pass an `aria-label` saying what is progressing. The figure in the middle cannot
 * serve: `role="progressbar"` makes its content presentational, so it is never announced.
 */
import { useProgressValue } from '../../composables/useProgressValue'
import { useMessages } from '../../i18n/state'
import { px } from '../../utils/css'

interface ProgressCircularProps {
  /** How far along it is. Anything outside the range is brought back into it. */
  value?: number
  /** What counts as finished. The other end is always zero. */
  max?: number
  /**
   * Says that the progress cannot be measured: the ring turns continuously and the
   * value is ignored.
   */
  indeterminate?: boolean
  /** What the progress means, expressed as a colour. */
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral'
  /**
   * A colour of your own (hex, CSS name or `oklch()`), which replaces the tone. The
   * unfilled ring's shade is derived from it against the theme, so it follows the light
   * and the dark one.
   */
  color?: string
  /** The diameter, always IN PIXELS: `96` and `'96'` both give 96px. */
  size?: number | string
  /** How thick the ring is, always IN PIXELS: `8` and `'8'` both give 8px. */
  thickness?: number | string
  /** Whether the ends of the drawn arc are rounded or cut square. */
  shape?: 'rounded' | 'square'
  /**
   * Writes the percentage in the middle of the ring. It is ignored while the progress is
   * unmeasurable, there being no figure to write.
   */
  showValue?: boolean
}

const props = withDefaults(defineProps<ProgressCircularProps>(), {
  value: 0,
  max: 100,
  indeterminate: false,
  tone: 'accent',
  color: undefined,
  size: undefined,
  thickness: undefined,
  shape: 'rounded',
  showValue: false,
})

defineSlots<{
  /**
   * What to put in the middle of the ring instead of the percentage — a count of files,
   * an icon, a shortened figure.
   */
  default?(props: { value: number; max: number; percent: number }): unknown
}>()

/* The percent sign, and the non-breaking space French puts before it where English puts
   nothing, are a convention of the language: they belong in the dictionary rather than
   in this file. Any other format goes through the slot above. */
const m = useMessages()

const { clamped, fraction } = useProgressValue(
  () => props.value,
  () => props.max,
)
</script>

<template>
  <span
    class="v-progress-circular"
    role="progressbar"
    :aria-label="m.progress.label"
    :data-tone="tone"
    :data-custom="color !== undefined ? '' : undefined"
    :data-shape="shape"
    :data-indeterminate="indeterminate ? '' : undefined"
    :aria-valuenow="indeterminate ? undefined : clamped"
    aria-valuemin="0"
    :aria-valuemax="max"
    :style="{
      '--fill-fraction': String(fraction),
      '--custom-color': color,
      '--progress-diameter': px(size),
      '--progress-thickness': px(thickness),
    }"
  >
    <svg class="v-progress-circular-svg" aria-hidden="true">
      <circle class="v-progress-circular-track" pathLength="100" />
      <circle class="v-progress-circular-bar" pathLength="100" />
    </svg>
    <span v-if="!indeterminate && (showValue || $slots.default)" class="v-progress-circular-label">
      <slot :value="clamped" :max="max" :percent="fraction * 100">
        {{ m.progress.percent(Math.round(fraction * 100)) }}
      </slot>
    </span>
  </span>
</template>

<style>
@layer vectis.components {
  /* The two dimensions are declared here as defaults, on the very element the props
     write to inline — which is what makes an explicit size or thickness always win. */
  .v-progress-circular {
    --progress-diameter: var(--vectis-control-size-progress-circular-diameter);
    --progress-thickness: var(--vectis-control-size-progress-circular-thickness);
    display: inline-grid;
    inline-size: var(--progress-diameter);
    block-size: var(--progress-diameter);
    vertical-align: middle;
  }

  .v-progress-circular-svg,
  .v-progress-circular-label {
    grid-area: 1 / 1;
  }

  .v-progress-circular-svg {
    inline-size: 100%;
    block-size: 100%;
    /* Turns the ring so that it starts at twelve o'clock rather than at three. It is
       written as its own property and not as a transform, so that it COMPOSES with the
       spinning of the unmeasurable mode instead of being overwritten by it. */
    rotate: -90deg;
  }

  /* In a right-to-left page the ring fills the other way round, following the reading
     direction. These individual properties are applied in a fixed order — move, turn,
     then mirror — so the mirroring is taken into account before the quarter turn above. */
  .v-progress-circular:dir(rtl) .v-progress-circular-svg {
    scale: 1 -1;
  }

  /* The geometry, entirely in CSS and in plain lengths. Percentages are avoided
     deliberately: a radius given as a percentage is resolved against a normalized
     diagonal rather than against the width, and there is no reason to expose the
     component to that when the diameter is always a length to begin with. */
  .v-progress-circular-track,
  .v-progress-circular-bar {
    cx: calc(var(--progress-diameter) / 2);
    cy: calc(var(--progress-diameter) / 2);
    /* A thickness as large as the diameter would give a NEGATIVE radius, which is an
       error in SVG: the circle would simply not be drawn. The floor degrades that case
       to a radius of zero instead. */
    r: max(0px, calc((var(--progress-diameter) - var(--progress-thickness)) / 2));
    fill: none;
    stroke-width: var(--progress-thickness);
  }

  .v-progress-circular-track {
    stroke: var(--progress-track);
  }

  .v-progress-circular-bar {
    stroke: var(--progress-fill);
    stroke-linecap: round;
    stroke-dasharray: 100;
    stroke-dashoffset: calc(100 - 100 * var(--fill-fraction));
    transition: stroke-dashoffset var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .v-progress-circular[data-shape='square'] .v-progress-circular-bar {
    stroke-linecap: butt;
  }

  /* Unlike the linear bar, no tone declares a text colour: the figure sits in the hole
     of the ring, against the page itself, so it simply takes the ordinary text colour. */
  .v-progress-circular[data-tone='accent'] {
    --progress-fill: var(--vectis-color-accent);
    --progress-track: var(--vectis-color-accent-surface);
  }

  .v-progress-circular[data-tone='success'] {
    --progress-fill: var(--vectis-color-success);
    --progress-track: var(--vectis-color-success-surface);
  }

  .v-progress-circular[data-tone='danger'] {
    --progress-fill: var(--vectis-color-danger);
    --progress-track: var(--vectis-color-danger-surface);
  }

  .v-progress-circular[data-tone='warning'] {
    --progress-fill: var(--vectis-color-warning);
    --progress-track: var(--vectis-color-warning-surface);
  }

  /* The neutral tone inverts text and surface rather than using a mid grey, which would
     be unreadable in one theme or the other. */
  .v-progress-circular[data-tone='neutral'] {
    --progress-fill: var(--vectis-color-text);
    --progress-track: var(--vectis-color-surface-muted);
  }

  /* Placed after the tones on purpose: the specificity is the same, so it is the order
     that lets a custom colour override the tone it replaces. */
  .v-progress-circular[data-custom] {
    --progress-fill: var(--custom-color);
    --progress-track: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 85%);
  }

  .v-progress-circular-label {
    display: flex;
    align-items: center;
    justify-content: center;
    /* TRAP — this centres the BOX itself in its cell, and it is not redundant with the
       centring above. The maximum width below stops the box from being stretched to
       fill the cell, and a stretch that cannot apply falls back to the START edge: the
       figure would end up against the side of the ring. */
    place-self: center;
    max-inline-size: calc(var(--progress-diameter) - var(--progress-thickness) * 2);
    color: var(--vectis-color-text);
    font-family: var(--vectis-text-family);
    /* Sized as a fraction of the diameter so it stays in proportion at every size — the
       same tolerance already granted to VSpinner's stroke — with a floor at the smallest
       type token, below which it would be unreadable. */
    font-size: max(var(--vectis-text-caption-size), calc(var(--progress-diameter) / 4));
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
    text-align: center;
  }

  /* When the progress cannot be measured, two animations run at once: the whole ring
     turns, and the arc drawn on it lengthens and shortens. Their periods are deliberately
     not multiples of one another — were the arc to restart on every rotation, the pair
     would repeat the same picture over and over and read as a mechanical beat. At 1s and
     1.5s they only realign every third turn; the slowed-down pair below is 3s and 5s, so
     every fifth. Keep any change to those four values out of a whole-number ratio. */
  .v-progress-circular[data-indeterminate] .v-progress-circular-svg {
    animation: v-spin var(--vectis-duration-1000) linear infinite;
  }

  .v-progress-circular[data-indeterminate] .v-progress-circular-bar {
    animation: v-progress-circular-dash var(--vectis-duration-1500) var(--vectis-ease-default)
      infinite;
    transition: none;
  }

  /* Both ends of the arc move, so it lengthens, shortens and travels around the circle
     at once. The spin it rides on is the shared one from styles/utilities.css; only
     these keyframes, which belong to this component alone, stay here. */
  @keyframes v-progress-circular-dash {
    0% {
      stroke-dasharray: 5 100;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 70 100;
      stroke-dashoffset: -20;
    }

    100% {
      stroke-dasharray: 5 100;
      stroke-dashoffset: -100;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-progress-circular-bar {
      transition: none;
    }

    /* Slowed down and not stopped: a motionless loader no longer says that anything is
       happening, which is the one thing it exists to say. */
    .v-progress-circular[data-indeterminate] .v-progress-circular-svg {
      animation-duration: var(--vectis-duration-3000);
    }

    .v-progress-circular[data-indeterminate] .v-progress-circular-bar {
      animation-duration: var(--vectis-duration-5000);
    }
  }
}
</style>
