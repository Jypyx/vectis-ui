<script setup lang="ts">
/**
 * Progress as a donut: an SVG driven by CSS, with no geometry JS. The <svg> has NO
 * viewBox (1 user unit = 1 px) and the circles are positioned by the SVG2 `cx`/`cy`/`r`
 * properties as pure lengths — a fixed viewBox would force converting the thickness
 * into viewBox units, hence knowing the ratio in JS and recomputing it on every size
 * change. `pathLength=100` normalizes the path: stroke-dashoffset is then expressed
 * directly as a percentage.
 *
 * Accessible name: pass `aria-label` (through fallthrough). The progressbar role is
 * "children presentational": the label displayed in the centre is NOT announced.
 */
import { useProgressValue } from '../../composables/useProgressValue'
import { useMessages } from '../../i18n/state'
import { px } from '../../utils/css'

interface ProgressCircularProps {
  /** Current value, clamped to [0, max]. */
  value?: number
  /** Upper bound (the lower bound is always 0). */
  max?: number
  /** Unknown progress: a continuous animation, `value` ignored. */
  indeterminate?: boolean
  /** Semantic colour. */
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral'
  /**
   * Custom colour (hex, CSS name or oklch()) — replaces the tone. The shades (the
   * track) are derived by color-mix from the theme tokens.
   */
  color?: string
  /** Diameter, **in pixels**: `96` as well as `'96'` gives 96px. Default: a token. */
  size?: number | string
  /**
   * Stroke thickness, **in pixels**: `8` as well as `'8'` gives 8px. Default: 4px (a
   * token).
   */
  thickness?: number | string
  /** Rounded stroke ends (the default) or blunt ones. */
  shape?: 'rounded' | 'square'
  /** Displays the progress as a percentage in the centre (ignored when indeterminate). */
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
  /** Content in the centre of the donut; wins over `showValue`. */
  default?(props: { value: number; max: number; percent: number }): unknown
}>()

/* The "%" and the NON-BREAKING space preceding it are a language convention (English
   uses none): they therefore live in the dictionary. The scoped slot stays the route
   for an arbitrary format. */
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
  /* The dimension custom properties are declared on the root: the inline style set by
     the props therefore always wins. */
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
    /* Starting at twelve o'clock. An individual property: it COMPOSES with the
       indeterminate mode's `transform` animation instead of being overwritten by it. */
    rotate: -90deg;
  }

  /* RTL: the progress follows the reading direction (counter-clockwise). The
     individual properties compose in the order translate → rotate → scale, so the
     mirroring applies before the twelve o'clock rotation. */
  .v-progress-circular:dir(rtl) .v-progress-circular-svg {
    scale: 1 -1;
  }

  /* 100% CSS geometry, in pure lengths (no percentage: resolving `r` as a percentage
     depends on the "normalized diagonal", and there is no point exposing ourselves to
     that since the diameter is always a length). */
  .v-progress-circular-track,
  .v-progress-circular-bar {
    cx: calc(var(--progress-diameter) / 2);
    cy: calc(var(--progress-diameter) / 2);
    /* max(0px, …): a thickness ≥ the diameter would give a negative radius, which is
       an SVG error (the element is not rendered) — it degrades to a zero radius. */
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

  /* No text fallback colour: the label sits in the donut hole, on the page
     background, hence in the current text colour. */
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

  /* Neutral: a text/surface inversion. */
  .v-progress-circular[data-tone='neutral'] {
    --progress-fill: var(--vectis-color-text);
    --progress-track: var(--vectis-color-surface-muted);
  }

  /* After the tones: equal specificity, the last one wins. */
  .v-progress-circular[data-custom] {
    --progress-fill: var(--custom-color);
    --progress-track: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 85%);
  }

  .v-progress-circular-label {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Centring the BOX in the grid cell: the max-inline-size below prevents the
       default stretch, and an inapplicable `stretch` falls back to `start` — without
       this place-self, the label would be stuck to the edge. */
    place-self: center;
    max-inline-size: calc(var(--progress-diameter) - var(--progress-thickness) * 2);
    color: var(--vectis-color-text);
    font-family: var(--vectis-text-family);
    /* A ratio proportional to the diameter (the same tolerance already granted to
       VSpinner's thickness), floored at the smallest token */
    font-size: max(var(--vectis-text-caption-size), calc(var(--progress-diameter) / 4));
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
    text-align: center;
  }

  /* Indeterminate: a whole-body rotation + an arc whose length varies. The periods
     differ on purpose (×4 and ×5) — an integer ratio would give a mechanical beat. */
  .v-progress-circular[data-indeterminate] .v-progress-circular-svg {
    animation: v-spin calc(var(--vectis-duration-slow) * 4) linear infinite;
  }

  .v-progress-circular[data-indeterminate] .v-progress-circular-bar {
    animation: v-progress-circular-dash calc(var(--vectis-duration-slow) * 5)
      var(--vectis-ease-default) infinite;
    transition: none;
  }

  /* Both ends of the arc move: it lengthens, shortens and slides along the circle.
     `v-spin` is shared (styles/utilities.css); only the keyframe specific to the arc
     stays here. */
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

    /* A motionless loader would lose its purpose: slow down, do not remove. */
    .v-progress-circular[data-indeterminate] .v-progress-circular-svg {
      animation-duration: calc(var(--vectis-duration-slow) * 12);
    }

    .v-progress-circular[data-indeterminate] .v-progress-circular-bar {
      animation-duration: calc(var(--vectis-duration-slow) * 15);
    }
  }
}
</style>
