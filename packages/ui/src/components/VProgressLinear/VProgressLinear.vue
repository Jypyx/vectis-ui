<script setup lang="ts">
/**
 * CSS draws the fill. JavaScript normalizes values shared by geometry, slots and progressbar
 * ARIA attributes.
 */
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useProgressValue } from '../../composables/useProgressValue'
import { useMessages } from '../../i18n/state'
import { px } from '../../utils/css'

/** What the progress means, in colour. */
export type ProgressLinearTone = 'neutral' | 'accent' | 'danger' | 'success' | 'warning'

/** How the track and the fill end. */
export type ProgressLinearShape = 'rounded' | 'square'

/** Where the value sits along the bar. */
export type ProgressLinearValuePosition = 'start' | 'center' | 'end'

/** Which way the bar fills. */
export type ProgressLinearOrientation = 'horizontal' | 'vertical'

/** What the default slot receives. */
export interface ProgressLinearSlotProps {
  /** The value, brought back into the range. */
  value: number
  /** The bound, zero or more. */
  max: number
  /** How far along it is, as a percentage and unrounded. */
  percent: number
}

interface ProgressLinearProps {
  /** How far along it is. Anything outside the range is brought back into it. */
  value?: number
  /**
   * What is progressing, in words, for screen readers. It draws nothing on screen, and falls
   * back to the design system dictionary; an `aria-label` or `aria-labelledby` of your own
   * takes precedence over it.
   */
  label?: string
  /** What counts as finished. The other end is always zero. */
  max?: number
  /** It is what to use while waiting for a server that reports no percentage. */
  indeterminate?: boolean
  /** What the progress means, expressed as a colour. */
  tone?: ProgressLinearTone
  /**
   * A colour of your own (hex, CSS name or `oklch()`), which replaces the tone. The
   * track's own shade is derived from it against the theme, so it follows the light and
   * the dark one.
   */
  color?: string
  /**
   * How thick the bar is, always in PIXELS: `12` and `'12'` both give 12px. It is 4px by
   * default, and showing text inside a bar that thin needs an explicit thickness.
   */
  thickness?: number | string
  /** Whether the ends of the bar are rounded or square. */
  shape?: ProgressLinearShape
  /**
   * Writes the percentage inside the bar. It is ignored while the progress is
   * unmeasurable, there being no figure to write.
   */
  showValue?: boolean
  /**
   * Where that text sits along the bar. On a vertical bar the start is the zero end,
   * hence the bottom.
   */
  valuePosition?: ProgressLinearValuePosition
  /** Turns the bar upright, filling from the bottom up. */
  orientation?: ProgressLinearOrientation
}

const props = withDefaults(defineProps<ProgressLinearProps>(), {
  value: 0,
  label: undefined,
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
  /** What to write inside the bar instead of the percentage. */
  default?(props: ProgressLinearSlotProps): unknown
}>()

/* The percent sign, and the non-breaking space French puts before it where English puts
   nothing, are a convention of the language: they belong in the dictionary rather than
   in this file. Any other format goes through the slot above. */
const m = useMessages()

const {
  max: normalizedMax,
  clamped,
  fraction,
  percent,
  roundedPercent,
} = useProgressValue(
  () => props.value,
  () => props.max,
)

// @a11y
// The canonical cascade: a consumer's `aria-labelledby`, then their `aria-label`, then the
// `label` prop, then the dictionary. An indicator takes no name from the text inside it, so
// without the last step it would have none at all.
const ariaLabel = useAriaLabel(() => props.label ?? m.value.progress.label)
</script>

<template>
  <div
    class="v-progress-linear v-tone"
    role="progressbar"
    :aria-label="ariaLabel"
    :data-tone="tone"
    :data-custom="color !== undefined ? '' : undefined"
    :data-shape="shape"
    :data-orientation="orientation"
    :data-value-position="valuePosition"
    :data-indeterminate="indeterminate ? '' : undefined"
    :aria-valuenow="indeterminate ? undefined : clamped"
    aria-valuemin="0"
    :aria-valuemax="normalizedMax"
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
        <slot :value="clamped" :max="normalizedMax" :percent="percent">
          {{ m.progress.percent(roundedPercent) }}
        </slot>
      </span>
      <span class="v-progress-linear-text" data-on-fill aria-hidden="true">
        <slot :value="clamped" :max="normalizedMax" :percent="percent">
          {{ m.progress.percent(roundedPercent) }}
        </slot>
      </span>
    </template>
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * The element IS the track, and it takes the whole length available. Sizing it is the
   * consumer's business, through the parent or through a width of their own; a consumer's style
   * sits outside our layers and always wins.
   */
  .v-progress-linear {
    --progress-thickness: var(--vectis-control-size-progress-linear-thickness);
    /* Fill, track and the text over the fill are the tone's solid, soft and on-solid
       colours, read from the shared table (`.v-tone`, set in the template). */
    --progress-fill: var(--tone-bg-solid);
    --progress-track: var(--tone-bg-soft);
    --progress-text-fallback: var(--tone-text-solid);
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
     * The fill is animated by changing its LENGTH, which the browser has to lay out again on
     * every frame. Scaling it would be cheaper, but a scale is physical: it would have to be
     * undone for the vertical orientation and again for a right-to-left page, where a logical
     * length simply works.
     */
    transition: inline-size var(--vectis-duration-base) var(--vectis-ease-default);
  }

  /*
   * The two copies are COMPLEMENTARY and never superimposed: this one is cut OUT of the filled
   * part, the other cut TO it, so every letter is painted exactly once. Removing either clip
   * raises no error and stays invisible for as long as both copies resolve to the same colour,
   * which happens wherever the adaptive colour function is unsupported.
   */
  .v-progress-linear-text {
    /*
     * The two insets of the cut: one on the edge the fill grows FROM, one on the edge it grows
     * towards. They are named after those roles rather than after physical sides, so the three
     * geometry rules further down; horizontal, right-to-left, vertical; all read the same pair.
     */
    --progress-clip-start: calc(100% * var(--fill-fraction));
    --progress-clip-end: -100vmax;
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: var(--vectis-space-2);
    color: var(--vectis-color-text);
    /*
     * The large negative inset on the two sides that do not carry the cut is what stops text
     * taller or wider than the bar from being cropped by its own clip.
     */
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
    /*
     * The per-tone fallback colour. The adaptive one cannot simply be written as a second
     * declaration after it: because that declaration contains a var(), a browser with no
     * support does not reject it at parse time; it would win the cascade and only then turn
     * invalid, which resets the colour to inherited and leaves the fallback never applied.
     */
    color: var(--progress-text-fallback);
  }

  /* Where the adaptive colour function exists, the text picks black or white against
     whatever colour the fill ended up with. */
  @supports (color: contrast-color(red)) {
    .v-progress-linear-text[data-on-fill] {
      color: contrast-color(var(--progress-fill));
    }
  }

  /*
   * In a right-to-left page the fill grows from the right, so the two insets change physical
   * sides; the variables themselves keep their meaning.
   */
  .v-progress-linear:dir(rtl) .v-progress-linear-text {
    clip-path: inset(-100vmax var(--progress-clip-start) -100vmax var(--progress-clip-end));
  }

  /*
   * Putting zero at the bottom is not done by reversing the direction, which would also apply
   * to the text of the two copies: bidirectional reordering would then display "50 %" as "%
   * 50". The fill is anchored to the far end of the axis instead.
   */
  .v-progress-linear[data-orientation='vertical'] {
    writing-mode: vertical-lr;
    inline-size: var(--vectis-control-size-progress-linear-length);
  }

  .v-progress-linear[data-orientation='vertical'] .v-progress-linear-fill {
    inset-inline-start: auto;
    inset-inline-end: 0;
  }

  /*
   * A right-to-left page reverses the inline axis of a vertical writing mode too: `vertical-lr`
   * then runs from the bottom up, so the far end anchored above is the TOP. The fill goes back
   * to the start of the axis, which is now the bottom.
   */
  .v-progress-linear[data-orientation='vertical']:dir(rtl) .v-progress-linear-fill {
    inset-inline-start: 0;
    inset-inline-end: auto;
  }

  .v-progress-linear[data-orientation='vertical'] .v-progress-linear-text {
    flex-direction: column-reverse;
    padding-inline: 0;
    padding-block: var(--vectis-space-2);
  }

  /*
   * The second selector is what neutralizes it, and it is written that way on purpose: it is
   * one step MORE specific than that rule, where the first selector alone would merely tie with
   * it and win by source order; a far more fragile arrangement.
   */
  .v-progress-linear[data-orientation='vertical'] .v-progress-linear-text,
  .v-progress-linear[data-orientation='vertical']:dir(rtl) .v-progress-linear-text {
    clip-path: inset(var(--progress-clip-end) -100vmax var(--progress-clip-start) -100vmax);
  }

  /*
   * At each extreme it is exactly flush with the edge without ever pulling away from it, which
   * makes the loop invisible and keeps the track from ever looking empty; no second bar is
   * needed. The easing carries the whole impression: a gradual entry, a quick crossing, a
   * damped exit.
   */
  .v-progress-linear[data-indeterminate] {
    overflow: hidden;
  }

  .v-progress-linear[data-indeterminate] .v-progress-linear-fill {
    /* The starting position is derived from this size, and the two must stay tied: that
       is what has the bar begin exactly off the track rather than half on it. */
    --progress-bar: 40%;
    /*
     * The anchoring is put back at the start of the axis, vertical case included; where a
     * measurable progress anchors at the far end instead.
     */
    inset-inline-start: 0;
    inset-inline-end: auto;
    inline-size: var(--progress-bar);
    /* The transition of a measurable progress has no place here: switching to this mode
       would otherwise be animated as the bar growing to its new size. */
    transition: none;
    animation: v-progress-linear-indeterminate var(--vectis-duration-1500) var(--vectis-ease-in-out)
      infinite;
  }

  @keyframes v-progress-linear-indeterminate {
    from {
      inset-inline-start: calc(-1 * var(--progress-bar));
    }

    to {
      inset-inline-start: 100%;
    }
  }

  /*
   * The same keyframes are simply read backwards, which changes nothing else BECAUSE the easing
   * curve is symmetric; an asymmetric one would need a second set of keyframes. A horizontal
   * right-to-left page needs nothing: the logical inset already follows the reading direction.
   */
  .v-progress-linear[data-orientation='vertical'][data-indeterminate] .v-progress-linear-fill {
    animation-direction: reverse;
  }

  /* On a right-to-left page the vertical axis already runs upwards (see the trap above),
     so the keyframes are read forwards again. */
  .v-progress-linear[data-orientation='vertical'][data-indeterminate]:dir(rtl)
    .v-progress-linear-fill {
    animation-direction: normal;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-progress-linear-fill,
    .v-progress-linear-text {
      transition: none;
    }

    .v-progress-linear[data-indeterminate] .v-progress-linear-fill {
      animation-duration: var(--vectis-duration-5000);
    }
  }

  /* `forced-color-adjust` inherits, so both copies of the text are given their colour here too. */
  @media (forced-colors: active) {
    .v-progress-linear {
      forced-color-adjust: none;
      background: Canvas;
      box-shadow: inset 0 0 0 var(--vectis-control-border-width) CanvasText;
    }

    .v-progress-linear-fill {
      background: Highlight;
    }

    .v-progress-linear-text {
      color: CanvasText;
    }

    .v-progress-linear-text[data-on-fill] {
      color: HighlightText;
    }
  }
}
</style>
