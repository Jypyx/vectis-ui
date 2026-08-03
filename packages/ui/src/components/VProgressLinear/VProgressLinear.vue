<script setup lang="ts">
/**
 * A progress bar. The root IS the track; the whole geometry derives from an inline
 * unitless `--fill-fraction`, in logical properties — the vertical orientation then
 * only needs a `writing-mode`. No behavioural JS.
 *
 * Accessible name: pass `aria-label` (through fallthrough). The progressbar role is
 * "children presentational": the text visible inside the bar is NOT announced, so it
 * does not replace an aria-label.
 */
import { useProgressValue } from '../../composables/useProgressValue'
import { useMessages } from '../../i18n/state'
import { px } from '../../utils/css'

interface ProgressLinearProps {
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
  /**
   * Thickness of the bar, **in pixels**: `12` as well as `'12'` gives 12px. Default:
   * 4px (a token).
   */
  thickness?: number | string
  /** Rounded ends (the default) or square corners. */
  shape?: 'rounded' | 'square'
  /** Displays the progress as a percentage inside the bar (ignored when indeterminate). */
  showValue?: boolean
  /** Position of the text inside the bar (vertically: start = the 0 side, hence the bottom). */
  valuePosition?: 'start' | 'center' | 'end'
  /** Vertical bar: 0 at the bottom, max at the top. */
  orientation?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<ProgressLinearProps>(), {
  value: 0,
  max: 100,
  indeterminate: false,
  tone: 'accent',
  color: undefined,
  thickness: undefined,
  shape: 'rounded',
  showValue: false,
  valuePosition: 'center',
  orientation: 'horizontal',
})

defineSlots<{
  /**
   * Content displayed inside the bar; wins over `showValue`. Rendered TWICE (a base
   * copy + a contrasted copy clipped to the fill): the content must be pure, with no
   * side effect.
   */
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
  <div
    class="v-progress-linear"
    role="progressbar"
    :data-tone="tone"
    :data-custom="color !== undefined ? '' : undefined"
    :data-shape="shape"
    :data-orientation="orientation === 'vertical' ? 'vertical' : undefined"
    :data-value-position="valuePosition"
    :data-indeterminate="indeterminate ? '' : undefined"
    :aria-valuenow="indeterminate ? undefined : clamped"
    aria-valuemin="0"
    :aria-valuemax="max"
    :style="{
      '--fill-fraction': String(fraction),
      '--custom-color': color,
      '--progress-thickness': px(thickness),
    }"
  >
    <span class="v-progress-linear-fill" />
    <!--
      Two superimposed copies of the same content: the first in the text colour over
      the track, the second clipped to the filled portion and coloured by contrast on
      the fill. The clipped copy duplicates visible text → aria-hidden.
    -->
    <template v-if="!indeterminate && (showValue || $slots.default)">
      <span class="v-progress-linear-text">
        <slot :value="clamped" :max="max" :percent="fraction * 100">
          {{ m.progress.percent(Math.round(fraction * 100)) }}
        </slot>
      </span>
      <span class="v-progress-linear-text" data-on-fill aria-hidden="true">
        <slot :value="clamped" :max="max" :percent="fraction * 100">
          {{ m.progress.percent(Math.round(fraction * 100)) }}
        </slot>
      </span>
    </template>
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * The root IS the track. It takes the whole available length: it is up to the
   * consumer to size it through its parent (or a direct `width`/`height`, which beats
   * this layer).
   */
  .v-progress-linear {
    --progress-thickness: var(--vectis-control-size-progress-linear-thickness);
    position: relative;
    display: block;
    inline-size: 100%;
    block-size: var(--progress-thickness);
    border-radius: var(--vectis-radius-pill);
    background: var(--progress-track);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
  }

  .v-progress-linear[data-shape='square'] {
    border-radius: 0;
  }

  .v-progress-linear-fill {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: calc(100% * var(--fill-fraction));
    border-radius: inherit;
    background: var(--progress-fill);
    /*
     * The animation runs on inline-size (a layout property, not composited: a
     * deliberate trade-off — `scale` is physical and would break the vertical and the
     * RTL). The same duration and easing are reused by the contrasted text's clip, or
     * the colour boundary would come loose from the fill's edge during the transition.
     */
    transition: inline-size var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .v-progress-linear[data-tone='accent'] {
    --progress-fill: var(--vectis-color-accent);
    --progress-track: var(--vectis-color-accent-surface);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .v-progress-linear[data-tone='success'] {
    --progress-fill: var(--vectis-color-success);
    --progress-track: var(--vectis-color-success-surface);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .v-progress-linear[data-tone='danger'] {
    --progress-fill: var(--vectis-color-danger);
    --progress-track: var(--vectis-color-danger-surface);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .v-progress-linear[data-tone='warning'] {
    --progress-fill: var(--vectis-color-warning);
    --progress-track: var(--vectis-color-warning-surface);
    /* White fails AA on amber: a dedicated token */
    --tone-text-fallback: var(--vectis-color-text-on-warning);
  }

  /* Neutral: a text/surface inversion — a mid grey would be unreadable in one of the
     two themes. */
  .v-progress-linear[data-tone='neutral'] {
    --progress-fill: var(--vectis-color-text);
    --progress-track: var(--vectis-color-surface-muted);
    --tone-text-fallback: var(--vectis-color-surface);
  }

  /* Custom colour: after the tones (equal specificity, the last one wins) */
  .v-progress-linear[data-custom] {
    --progress-fill: var(--custom-color);
    --progress-track: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 85%);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  /* Text inside the bar: two superimposed copies, both aligned on the root's box —
     which is also the track's, hence a clip landing exactly on the fill's edge. The
     default thickness (4px) cannot host text: displaying any implies a `thickness`. */
  .v-progress-linear-text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: var(--vectis-space-2);
    color: var(--vectis-color-text);
    /* The root switches to vertical writing; the text itself stays horizontal */
    writing-mode: horizontal-tb;
    white-space: nowrap;
    pointer-events: none;
  }

  .v-progress-linear[data-value-position='start'] .v-progress-linear-text {
    justify-content: start;
  }

  .v-progress-linear[data-value-position='end'] .v-progress-linear-text {
    justify-content: end;
  }

  .v-progress-linear-text[data-on-fill] {
    /* Per-tone fallback. contrast-color() can NOT be a plain second declaration:
       containing a var(), it is never rejected at parse time by browsers without
       support — it would win the cascade then become invalid at computed-value time
       (IACVT → color: unset → inheritance, and the fallback would never apply). Hence
       the @supports below, which IS evaluated without var() substitution. */
    color: var(--tone-text-fallback);
    /* inset() is physical: one set of values per orientation and direction. The
       negative overshoot on the other three sides avoids cropping text taller (or
       wider) than the bar. */
    clip-path: inset(-100vmax calc(100% * (1 - var(--fill-fraction))) -100vmax -100vmax);
    transition: clip-path var(--vectis-duration-base) var(--vectis-ease-default);
  }

  /* Adaptive black/white text where contrast-color() exists (Safari 26+, Edge 150+). */
  @supports (color: contrast-color(red)) {
    .v-progress-linear-text[data-on-fill] {
      color: contrast-color(var(--progress-fill));
    }
  }

  .v-progress-linear:dir(rtl) .v-progress-linear-text[data-on-fill] {
    clip-path: inset(-100vmax -100vmax -100vmax calc(100% * (1 - var(--fill-fraction))));
  }

  /* Vertical: 0 at the bottom, max at the top.
     `writing-mode` on the root is enough: the inline axis becomes vertical, so
     inline-size = length, block-size = thickness, and both the fill and the animation
     switch axis with no duplicated rule.

     NO `direction: rtl` to put the 0 at the bottom — it would apply to the copies'
     text and bidi would reorder "50 %" as "% 50". The fill is anchored to the END of
     the inline axis instead.

     The length comes from a token for want of being able to inherit from a parent of
     auto height (it would collapse to zero); a consumer `height`, outside any layer,
     overrides it. */
  .v-progress-linear[data-orientation='vertical'] {
    writing-mode: vertical-lr;
    inline-size: var(--vectis-control-size-progress-linear-length);
  }

  .v-progress-linear[data-orientation='vertical'] .v-progress-linear-fill {
    inset-inline-start: auto;
    inset-inline-end: 0;
  }

  /* The text stacks on the vertical axis, start = the 0 side (hence the bottom). */
  .v-progress-linear[data-orientation='vertical'] .v-progress-linear-text {
    flex-direction: column-reverse;
    padding-inline: 0;
    padding-block: var(--vectis-space-2);
  }

  /* The clip moves to the vertical axis (the fill rises from the bottom) — hence
     identical in LTR and RTL, which is why the horizontal :dir(rtl) rule above is
     neutralized. */
  .v-progress-linear[data-orientation='vertical'] .v-progress-linear-text[data-on-fill],
  .v-progress-linear[data-orientation='vertical']:dir(rtl) .v-progress-linear-text[data-on-fill] {
    clip-path: inset(calc(100% * (1 - var(--fill-fraction))) -100vmax -100vmax -100vmax);
  }

  /* Indeterminate: a fixed-size bar crosses the track, from the outer starting edge
     to the outer finishing edge. At both extremes it is exactly flush with the edge
     without ever moving away from it: the loop is invisible AND the track is never
     empty — no second bar is needed.

     `ease-in-out` carries the whole rendering: a gradual entry, a fast crossing, a
     damped exit. An asymmetric curve (or `linear`) makes the loop mechanical.

     The run is described in LOGICAL properties (position and size as a % of the
     track) rather than in `translate`: a single definition serves horizontal, vertical
     and RTL, where a transform — being physical — would impose one set of keyframes per
     axis and a direction flip in RTL. */
  .v-progress-linear[data-indeterminate] {
    overflow: hidden;
  }

  .v-progress-linear[data-indeterminate] .v-progress-linear-fill {
    /* The starting position derives from this size (the two must stay equal for the
       bar to start exactly off the track). */
    --progress-bar: 40%;
    /* the anchoring at the start of the inline axis is taken back, including
       vertically, where the determinate mode anchors at the end (see above) */
    inset-inline-start: 0;
    inset-inline-end: auto;
    inline-size: var(--progress-bar);
    /* the progress transition has no place here, and would grow the bar on the switch
       to indeterminate */
    transition: none;
    animation: v-progress-linear-indeterminate calc(var(--vectis-duration-slow) * 5)
      var(--vectis-ease-in-out) infinite;
  }

  @keyframes v-progress-linear-indeterminate {
    from {
      inset-inline-start: calc(-1 * var(--progress-bar));
    }

    to {
      inset-inline-start: 100%;
    }
  }

  /* In vertical writing the inline axis goes down: the bar would travel top to
     bottom, the opposite of the determinate fill, which starts at the bottom. The same
     keyframes are read backwards — possible without altering the rendering because the
     curve is symmetric (with an asymmetric easing a second set of keyframes would be
     needed). In horizontal RTL there is nothing to do: `inset-inline-start` already
     follows the reading direction. */
  .v-progress-linear[data-orientation='vertical'][data-indeterminate] .v-progress-linear-fill {
    animation-direction: reverse;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-progress-linear-fill,
    .v-progress-linear-text[data-on-fill] {
      transition: none;
    }

    /* A motionless loader would lose its purpose: slow down, do not remove. */
    .v-progress-linear[data-indeterminate] .v-progress-linear-fill {
      animation-duration: calc(var(--vectis-duration-slow) * 15);
    }
  }
}
</style>
