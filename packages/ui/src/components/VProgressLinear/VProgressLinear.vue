<script setup lang="ts">
// @core — no behavioural JS at all: value normalization and the display string.
/**
 * A bar filling up as something progresses. The element rendered IS the track, and the
 * whole geometry follows from a single number set on it — the fraction filled, with no
 * unit. Everything is written in logical properties, so turning the bar vertical needs
 * nothing but a change of writing direction.
 *
 * There is no behavioural JavaScript: the value is clamped and a percentage is
 * formatted, and that is all.
 *
 * On naming: pass an `aria-label` saying what is progressing. The text shown inside the
 * bar cannot serve as that name — the role a progress bar carries makes its content
 * presentational, so screen readers do not announce it.
 */
import { useProgressValue } from '../../composables/useProgressValue'
import { useMessages } from '../../i18n/state'
import { px } from '../../utils/css'

interface ProgressLinearProps {
  /** How far along it is. Anything outside the range is brought back into it. */
  value?: number
  /** What counts as finished. The other end is always zero. */
  max?: number
  /**
   * Says that the progress cannot be measured: the bar animates continuously and the
   * value is ignored. It is what to use while waiting for a server that reports no
   * percentage.
   */
  indeterminate?: boolean
  /** What the progress means, expressed as a colour. */
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral'
  /**
   * A colour of your own (hex, CSS name or `oklch()`), which replaces the tone. The
   * track's own shade is derived from it against the theme, so it follows the light and
   * the dark one.
   */
  color?: string
  /**
   * How thick the bar is, always IN PIXELS: `12` and `'12'` both give 12px. It is 4px
   * by default — bear in mind that showing text inside a bar that thin needs an
   * explicit thickness.
   */
  thickness?: number | string
  /** Whether the ends of the bar are rounded or square. */
  shape?: 'rounded' | 'square'
  /**
   * Writes the percentage inside the bar. It is ignored while the progress is
   * unmeasurable, there being no figure to write.
   */
  showValue?: boolean
  /**
   * Where that text sits along the bar. On a vertical bar the start is the zero end,
   * hence the bottom.
   */
  valuePosition?: 'start' | 'center' | 'end'
  /** Turns the bar upright, filling from the bottom up. */
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
   * What to write inside the bar instead of the percentage.
   *
   * TRAP — it is rendered TWICE, once over the empty track and once over the filled
   * part in a colour that contrasts with it, each copy cut at the fill's edge. So
   * whatever it renders must be pure: anything with a side effect would happen twice.
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
  <div
    class="v-progress-linear"
    role="progressbar"
    :aria-label="m.progress.label"
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
      The same text twice, each copy cut at the fill's edge so that the two complete
      each other exactly: the first in the ordinary text colour over the empty track,
      the second over the filled part, coloured to contrast with it. The second is
      hidden from screen readers, being a duplicate of text already there.
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
   * The element IS the track, and it takes the whole length available. Sizing it is the
   * consumer's business, through the parent or through a width of their own — a
   * consumer's style sits outside our layers and always wins.
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
     * The fill is animated by changing its LENGTH, which the browser has to lay out
     * again on every frame. Scaling it would be cheaper, but a scale is physical: it
     * would have to be undone for the vertical orientation and again for a
     * right-to-left page, where a logical length simply works.
     *
     * The duration and easing are repeated by the clip of the text over the fill, or the
     * colour boundary would drift away from the fill's own edge for the length of the
     * transition.
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
    /* White does not reach the required contrast on amber, so this tone has a text
       colour of its own. */
    --tone-text-fallback: var(--vectis-color-text-on-warning);
  }

  /* The neutral tone inverts text and surface rather than using a mid grey, which would
     be unreadable in one theme or the other. */
  .v-progress-linear[data-tone='neutral'] {
    --progress-fill: var(--vectis-color-text);
    --progress-track: var(--vectis-color-surface-muted);
    --tone-text-fallback: var(--vectis-color-surface);
  }

  /* Placed after the tones on purpose: the specificity is the same, so it is the order
     that lets a custom colour override the tone it replaces. */
  .v-progress-linear[data-custom] {
    --progress-fill: var(--custom-color);
    --progress-track: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 85%);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  /* The text inside the bar, in two copies laid over the same box — the track's own,
     which is why a cut expressed as a fraction of it lands exactly on the fill's edge.
     Bear in mind that the default 4px thickness cannot hold text at all: showing any
     implies asking for a thicker bar.

     TRAP — the two copies are COMPLEMENTARY and never superimposed: this one is cut OUT
     of the filled part, the other cut TO it, so every letter is painted exactly once.
     Removing either clip raises no error and stays invisible for as long as both copies
     resolve to the SAME colour, which is what happens wherever the adaptive colour
     function is unsupported. Where it IS supported and the two disagree — black over an
     accent fill against white text in the dark theme — the copy underneath shows its
     antialiased edges all around the letters of the one on top, and the label reads as
     a halo. */
  .v-progress-linear-text {
    /* The two insets of the cut: one on the edge the fill grows FROM, one on the edge it
       grows towards. They are named after those roles rather than after physical sides,
       so the three geometry rules further down — horizontal, right-to-left, vertical —
       all read the same pair. This copy cuts on the start side; the one over the fill
       swaps them. */
    --progress-clip-start: calc(100% * var(--fill-fraction));
    --progress-clip-end: -100vmax;
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: var(--vectis-space-2);
    color: var(--vectis-color-text);
    /* The large negative inset on the two sides that do NOT carry the cut is what stops
       text taller or wider than the bar from being cropped by its own clip. */
    clip-path: inset(-100vmax var(--progress-clip-end) -100vmax var(--progress-clip-start));
    /* The same duration and easing as the fill's own length, or the colour boundary
       would drift away from the fill's edge for the length of the transition. */
    transition: clip-path var(--vectis-duration-base) var(--vectis-ease-default);
    /* The bar itself is turned on its side in vertical mode; the text is put back
       upright here, since a label read sideways is not the point. */
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
    /* The exact complement of the copy above: the cut moves to the other end of the
       axis, so the two together cover the whole bar and overlap nowhere. */
    --progress-clip-start: -100vmax;
    --progress-clip-end: calc(100% * (1 - var(--fill-fraction)));
    /* The per-tone fallback colour. The adaptive one cannot simply be written as a
       second declaration after it: because that declaration contains a var(), a browser
       with no support does not reject it at parse time — it would win the cascade and
       only then turn invalid, which resets the colour to inherited and leaves the
       fallback never applied. The block below is the way round it, being evaluated
       before any var() substitution. */
    color: var(--tone-text-fallback);
  }

  /* Where the adaptive colour function exists, the text picks black or white against
     whatever colour the fill ended up with. */
  @supports (color: contrast-color(red)) {
    .v-progress-linear-text[data-on-fill] {
      color: contrast-color(var(--progress-fill));
    }
  }

  /* In a right-to-left page the fill grows from the right, so the two insets change
     physical sides — the variables themselves keep their meaning. */
  .v-progress-linear:dir(rtl) .v-progress-linear-text {
    clip-path: inset(-100vmax var(--progress-clip-start) -100vmax var(--progress-clip-end));
  }

  /* Upright, the bar fills from the bottom.

     Changing the writing direction on the element is enough to turn everything: the
     axis the fill grows along becomes vertical, so the length and the thickness swap
     places, and both the fill and the animation follow with no rule written twice.

     TRAP — putting zero at the bottom is NOT done by reversing the direction, which
     would also apply to the text of the two copies: bidirectional reordering would then
     display "50 %" as "% 50". The fill is anchored to the far end of the axis instead.

     The length comes from a token because there is nothing to inherit it from: in a
     parent of automatic height the bar would collapse to nothing. A consumer's own
     height overrides it, sitting outside our layers. */
  .v-progress-linear[data-orientation='vertical'] {
    writing-mode: vertical-lr;
    inline-size: var(--vectis-control-size-progress-linear-length);
  }

  .v-progress-linear[data-orientation='vertical'] .v-progress-linear-fill {
    inset-inline-start: auto;
    inset-inline-end: 0;
  }

  /* The text now stacks along the vertical axis, whose start is the zero end — the
     bottom of the bar. */
  .v-progress-linear[data-orientation='vertical'] .v-progress-linear-text {
    flex-direction: column-reverse;
    padding-inline: 0;
    padding-block: var(--vectis-space-2);
  }

  /* The cut moves to the vertical axis: the fill rises from the bottom, which is that
     axis' start. It is therefore the same in both reading directions, which means the
     right-to-left rule further up has to be neutralized.

     TRAP — the second selector is what neutralizes it, and it is written that way on
     purpose: it is one step MORE specific than that rule, where the first selector alone
     would merely tie with it and win by source order — a far more fragile arrangement. */
  .v-progress-linear[data-orientation='vertical'] .v-progress-linear-text,
  .v-progress-linear[data-orientation='vertical']:dir(rtl) .v-progress-linear-text {
    clip-path: inset(var(--progress-clip-end) -100vmax var(--progress-clip-start) -100vmax);
  }

  /* When the progress cannot be measured, a bar of fixed size crosses the track from
     just outside one end to just outside the other. At each extreme it is exactly flush
     with the edge without ever pulling away from it, which is what makes the loop
     invisible and keeps the track from ever looking empty — no second bar is needed.

     The easing carries the whole impression: a gradual entry, a quick crossing, a damped
     exit. A linear run, or an asymmetric curve, immediately reads as mechanical.

     The movement is expressed in LOGICAL properties — a position and a size as
     percentages of the track — rather than as a transform. One definition then serves
     the horizontal, the vertical and the right-to-left cases, where a transform, being
     physical, would need its own keyframes per axis and a flip per direction. */
  .v-progress-linear[data-indeterminate] {
    overflow: hidden;
  }

  .v-progress-linear[data-indeterminate] .v-progress-linear-fill {
    /* The starting position is derived from this size, and the two must stay tied: that
       is what has the bar begin exactly off the track rather than half on it. */
    --progress-bar: 40%;
    /* The anchoring is put back at the start of the axis, vertical case included — where
       a measurable progress anchors at the far end instead. */
    inset-inline-start: 0;
    inset-inline-end: auto;
    inline-size: var(--progress-bar);
    /* The transition of a measurable progress has no place here: switching to this mode
       would otherwise be animated as the bar growing to its new size. */
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

  /* Turned upright, the axis runs downwards, so the bar would travel from the top down —
     the opposite of a measurable fill, which rises from the bottom. The same keyframes
     are simply read backwards, which changes nothing else BECAUSE the easing curve is
     symmetric; an asymmetric one would need a second set of keyframes.

     Nothing is needed for a right-to-left page: the logical inset already follows the
     reading direction. */
  .v-progress-linear[data-orientation='vertical'][data-indeterminate] .v-progress-linear-fill {
    animation-direction: reverse;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-progress-linear-fill,
    .v-progress-linear-text {
      transition: none;
    }

    /* Slowed down and not stopped: a motionless loader no longer says that anything is
       happening, which is the one thing it exists to say. */
    .v-progress-linear[data-indeterminate] .v-progress-linear-fill {
      animation-duration: calc(var(--vectis-duration-slow) * 15);
    }
  }
}
</style>
