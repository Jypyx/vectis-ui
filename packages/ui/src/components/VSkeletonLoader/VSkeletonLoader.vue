<script setup lang="ts">
/**
 * CSS animates placeholders. JavaScript supplies accessible loading text and normalizes
 * dimensions; decorative loaders remain hidden from assistive technology.
 */
import { computed } from 'vue'

import { useMessages } from '../../i18n/state'
import { cssSize } from '../../utils/css'

/** What the silhouette stands for, which sets its corners and how it is sized. */
export type SkeletonLoaderShape = 'text' | 'control' | 'pill' | 'circle' | 'surface'
/** How the silhouette says it is loading: a sweep, a slow pulse, or nothing. */
export type SkeletonLoaderAnimation = 'wave' | 'pulse' | 'none'
/** The step of the control size scale a control-shaped silhouette takes. */
export type SkeletonLoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface SkeletonLoaderProps {
  /** What the silhouette stands for. */
  shape?: SkeletonLoaderShape
  /**
   * The size on the scale shared by every control. It only means something for the
   * shapes sized like a control: text follows the typography around it, and a surface
   * has its own height.
   */
  size?: SkeletonLoaderSize
  /** Takes 4px off the height, as everywhere else in the design system. */
  compact?: boolean
  /**
   * The width: a number is read as pixels, and anything else as a CSS length of your
   * own, such as `'100%'` or `'12ch'`. Left out, the silhouette takes all the width available.
   */
  width?: number | string
  /** The height, read the same way. It wins over the shape and the size. */
  height?: number | string
  /**
   * How many silhouettes to stack. In the text shape the last one is drawn shorter than the
   * others, and that single detail is what reads as a paragraph rather than as a table.
   */
  lines?: number
  /**
   * How the silhouette shows that something is happening. Turning it off freezes it,
   * which suits printing, a screenshot, or a parent already animating.
   */
  animation?: SkeletonLoaderAnimation
  /**
   * A background colour of your own, replacing the token. The wave's highlight is
   * DERIVED from it, so it stays correct with nothing else to set.
   */
  color?: string
  /**
   * Announces the loading to screen readers. It is OFF by default, because a skeleton is
   * decorative: a page holds a dozen of them, and a dozen competing announcements are
   * unreadable.
   */
  announce?: boolean
  /**
   * What is announced, which also IMPLIES announcing. Prefer something situated, such as
   * "Loading the results", since a generic word is the reason the default is silence.
   */
  label?: string
}

const props = withDefaults(defineProps<SkeletonLoaderProps>(), {
  shape: 'text',
  size: 'md',
  compact: false,
  width: undefined,
  height: undefined,
  lines: 1,
  animation: 'wave',
  color: undefined,
  announce: false,
  label: undefined,
})

// A guard against two silent bugs: asked for zero lines the component would render NOTHING at
// all; an invisible skeleton nobody notices is missing; and a fractional count would produce a
// surprising number of them.
const count = computed(() =>
  Number.isFinite(props.lines) ? Math.max(1, Math.trunc(props.lines)) : 1,
)

// @a11y
// Supplying a label counts as asking to be announced, otherwise that prop would sit there doing
// nothing. An empty label is no label: it would otherwise open a live region with nothing in
// it.
const announced = computed(() => props.announce || Boolean(props.label))

const m = useMessages()
// The dictionary must never be read directly in the body of `setup`: the value would be
// captured once and would stop following a later change of language.
const resolvedLabel = computed(() => props.label || m.value.common.loading)
</script>

<template>
  <span
    class="v-skeleton-loader v-control"
    :data-shape="shape"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-animation="animation"
    :data-custom="color !== undefined ? '' : undefined"
    :role="announced ? 'status' : undefined"
    :aria-hidden="announced ? undefined : 'true'"
    :style="{
      '--custom-color': color,
      '--skeleton-loader-w': cssSize(width),
      '--skeleton-loader-h': cssSize(height),
    }"
  >
    <!--
      The label is rendered before the silhouettes, and that order is structural. The rule
      shortening the last line of a paragraph asks for the last CHILD, so a label rendered after
      them would quietly take that place and no line would be shortened.
    -->
    <span v-if="announced" class="v-visually-hidden">{{ resolvedLabel }}</span>
    <span v-for="n in count" :key="n" class="v-skeleton-loader-item" />
  </span>
</template>

<style>
@layer vectis.components {
  /*
   * The shape table below sets them, and the dimension props overwrite them inline; which
   * always wins over a rule targeting the same element, so no specificity contest is possible.
   */
  .v-skeleton-loader {
    /*
     * The grey has a token of its own. No existing colour role holds the right value in both
     * themes: the muted surface is too pale in the light one for the pulse to be visible at
     * all, and the border colour has the right tone but the wrong meaning.
     */
    --skeleton-loader-base: var(--vectis-color-surface-skeleton);
    /*
     * The highlight is DERIVED from the grey rather than named: the same colour, a little
     * lighter. A lightness STEP is what makes one declaration correct in both themes, where a
     * `color-mix()` towards a target would not; the silhouette is darker than the page in light
     * and LIGHTER than it in dark, so a fixed target would lighten in one and darken in the
     * other.
     */
    --skeleton-loader-highlight: oklch(from var(--skeleton-loader-base) calc(l + 0.06) c h);
    --skeleton-loader-h: var(--control-height);
    /*
     * The cap is not calc(var(--skeleton-loader-h) / 2), which looks like the closer unit and
     * is the wrong one twice over: --skeleton-loader-h is a flex BASIS on an item that grows to
     * fill a taller parent (see below), and the `height` prop overwrites it inline. Two equally
     * tall silhouettes would then round differently depending on how they got there.
     */
    --skeleton-loader-radius: min(
      var(--vectis-radius-interactive),
      calc(var(--control-height) / 2)
    );
    --skeleton-loader-gap: var(--vectis-space-2);
    display: flex;
    flex-direction: column;
    gap: var(--skeleton-loader-gap);
  }

  /* A custom colour wins by specificity rather than by order, being one step more
     specific than the rule above. */
  .v-skeleton-loader[data-custom] {
    --skeleton-loader-base: var(--custom-color);
  }

  .v-skeleton-loader-item {
    position: relative;
    /*
     * The height from the shape table is a default: inside a parent that has a height of its
     * own, the silhouette grows to fill it; a card fills its slot.
     */
    flex: 1 1 auto;
    inline-size: var(--skeleton-loader-w, 100%);
    block-size: var(--skeleton-loader-h);
    /* Clipped rather than hidden: hiding the overflow would turn every silhouette into
       a scroll container, for nothing. */
    overflow: clip;
    border-radius: var(--skeleton-loader-radius);
    background: var(--skeleton-loader-base);
  }

  /*
   * A line of text is one em tall, which means it follows the typography it INHERITS, and it is
   * centred in the line box the same way a line of text would be. The gap between lines and the
   * padding around them are derived from that same line height, so that N silhouettes occupy
   * exactly N lines of text: replacing them with the real content shifts nothing on the page.
   */
  .v-skeleton-loader[data-shape='text'] {
    --skeleton-loader-h: 1em;
    --skeleton-loader-radius: var(--vectis-radius-pill);
    --skeleton-loader-gap: max(0px, calc(1lh - 1em));
    padding-block: calc(var(--skeleton-loader-gap) / 2);
  }

  /* A line of text keeps the height its typography gives it: unlike the other shapes it
     neither stretches in a tall parent nor squashes in a short one. */
  .v-skeleton-loader[data-shape='text'] .v-skeleton-loader-item {
    flex: none;
  }

  /*
   * The shortened last line, the one detail that makes a stack of bars read as a paragraph.
   * Asking for a line PRECEDED by another is what guarantees it only applies from two lines up;
   * a single line is not a paragraph; and the proportion is taken from the EFFECTIVE width, so
   * it still works under a `width` prop.
   */
  .v-skeleton-loader[data-shape='text']
    .v-skeleton-loader-item
    + .v-skeleton-loader-item:last-child {
    --skeleton-loader-last-line: 0.6;
    inline-size: calc(var(--skeleton-loader-w, 100%) * var(--skeleton-loader-last-line));
  }

  .v-skeleton-loader[data-shape='pill'] {
    --skeleton-loader-radius: var(--vectis-radius-pill);
  }

  /*
   * A circle takes its width FROM its height through the ratio, so changing the size alone
   * changes the diameter and nothing has to be kept in step. The container sits inline, like
   * the avatar it replaces, rather than spanning the whole width, and aligning to the start
   * stops the silhouette from being stretched sideways; which keeps the circle round.
   */
  .v-skeleton-loader[data-shape='circle'] {
    --skeleton-loader-radius: var(--vectis-radius-pill);
    display: inline-flex;
    align-items: start;
  }

  .v-skeleton-loader[data-shape='circle'] .v-skeleton-loader-item {
    /* Left to the content rather than set to the full width, so that the ratio is what
       decides. An explicit `width` still takes over, and then knowingly gives an
       oval. */
    inline-size: var(--skeleton-loader-w, auto);
    aspect-ratio: 1;
  }

  /*
   * A surface; a card, an image, a block; has no height anyone could guess without measuring
   * the page, which this component deliberately never does. It takes a default from a token,
   * which the `height` prop overrides, as does any consumer style (theirs sits outside our
   * layers and therefore wins).
   */
  .v-skeleton-loader[data-shape='surface'] {
    --skeleton-loader-h: var(--vectis-control-size-skeleton-surface);
    --skeleton-loader-radius: var(--vectis-radius-surface);
  }

  .v-skeleton-loader:is([data-animation='wave'], [data-animation='pulse'])
    .v-skeleton-loader-item::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  /*
   * The pulse: a flat sheet of the lighter shade fades in and out OVER the silhouette. Fading
   * the silhouette itself would be shorter to write, and wrong: it would fade towards the PAGE,
   * which means lightening in the light theme and DARKENING in the dark one; the opposite of
   * what the wave does.
   */
  .v-skeleton-loader[data-animation='pulse'] .v-skeleton-loader-item::after {
    background-color: var(--skeleton-loader-highlight);
    animation: v-skeleton-loader-pulse var(--vectis-duration-1500) var(--vectis-ease-in-out)
      infinite;
  }

  /*
   * The wave: a band of light crossing the silhouette. The gradient is SYMMETRIC; transparent,
   * light, transparent; so its physical angle makes no observable difference and there is
   * nothing to mirror in RTL.
   */
  .v-skeleton-loader[data-animation='wave'] .v-skeleton-loader-item::after {
    background-image: linear-gradient(
      90deg,
      transparent,
      var(--skeleton-loader-highlight),
      transparent
    );
    animation: v-skeleton-loader-wave var(--vectis-duration-1500) linear infinite;
  }

  /* Scoped to the wave: the pulse uses the same overlay, but its run is symmetric in
     time, so reversing it would change nothing at all. */
  .v-skeleton-loader[data-animation='wave']:dir(rtl) .v-skeleton-loader-item::after {
    animation-direction: reverse;
  }

  @keyframes v-skeleton-loader-pulse {
    from,
    to {
      opacity: 0;
    }

    50% {
      opacity: 1;
    }
  }

  @keyframes v-skeleton-loader-wave {
    from {
      translate: -100% 0;
    }

    to {
      translate: 100% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /*
     * This has exactly the specificity of the two rules it overrides, so its position at the
     * END of the sheet is the whole of what makes it win.
     */
    .v-skeleton-loader:is([data-animation='wave'], [data-animation='pulse'])
      .v-skeleton-loader-item::after {
      background-image: none;
      background-color: var(--skeleton-loader-highlight);
      animation: v-skeleton-loader-pulse var(--vectis-duration-5000) var(--vectis-ease-in-out)
        infinite;
    }
  }

  /* Forced colours repaint the silhouette as Canvas, the page itself: the placeholder
     vanishes. It is drawn in GrayText, and the pulse or the wave in Canvas over it, so the
     loading cue survives as well as the shape. */
  @media (forced-colors: active) {
    .v-skeleton-loader-item {
      --skeleton-loader-highlight: Canvas;
      forced-color-adjust: none;
      background: GrayText;
    }
  }
}
</style>
