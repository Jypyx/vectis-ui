<script setup lang="ts">
/**
 * The grey silhouette standing in for content that has not arrived yet: a line of
 * text, a button, an avatar. It is drawn entirely in CSS.
 *
 * The element rendered is a CONTAINER holding its silhouettes, and not itself the
 * painted shape — the opposite of VProgressLinear. That is what makes several lines
 * possible at no cost, and what keeps every rule below uniform: there is no
 * "painted root" case beside a "painted child" one. It carries the shared size class,
 * so a skeleton of a given size is exactly as tall as a button of that size.
 *
 * The component MEASURES nothing. It does not look at what it replaces to work out a
 * shape; the shape is declared. The three derived values are all the JavaScript there
 * is — no event, no lifecycle, no DOM.
 */
import { computed } from 'vue'

import { useMessages } from '../../i18n/state'
import { cssSize } from '../../utils/css'

export type SkeletonShape = 'text' | 'control' | 'pill' | 'circle' | 'surface'
export type SkeletonAnimation = 'wave' | 'pulse' | 'none'
export type SkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface SkeletonLoaderProps {
  /**
   * What the silhouette stands for. Each value sets both a corner radius and a way of
   * being sized:
   *
   * - `text` follows the typography around it, so several silhouettes occupy exactly
   *   as many lines as the text they replace;
   * - `control` takes the height of a control of the given size — a button, a field;
   * - `pill` is that same height with fully rounded ends — a chip, a badge;
   * - `circle` is that height in both dimensions — an avatar, a round icon button;
   * - `surface` is a card or an image, with a height of its own.
   */
  shape?: SkeletonShape
  /**
   * The size on the scale shared by every control. It only means something for the
   * shapes sized like a control: text follows the typography around it, and a surface
   * has its own height.
   */
  size?: SkeletonSize
  /** Takes 4px off the height, as everywhere else in the design system. */
  compact?: boolean
  /**
   * The width: a number is read as pixels, and anything else as a CSS length of your
   * own — `'100%'`, `'12ch'`. Left out, the silhouette takes all the width available.
   */
  width?: number | string
  /** The height, read the same way. It wins over the shape and the size. */
  height?: number | string
  /**
   * How many silhouettes to stack. In the text shape the LAST one is drawn shorter
   * than the others, and that single detail is what reads as a paragraph rather than
   * as a table.
   */
  lines?: number
  /**
   * How the silhouette shows that something is happening. Turning it off freezes it,
   * which suits printing, a screenshot, or a parent already animating.
   */
  animation?: SkeletonAnimation
  /**
   * A background colour of your own, replacing the token. The wave's highlight is
   * DERIVED from it, so it stays correct with nothing else to set.
   */
  color?: string
  /**
   * Announces the loading to screen readers. It is OFF by default, because a skeleton
   * is decorative: a page holds a dozen of them, and a dozen competing announcements
   * are unreadable. What should announce the wait is the container around them,
   * marked as busy.
   */
  announce?: boolean
  /**
   * What is announced, which also IMPLIES announcing. Prefer something situated —
   * "Loading the results" — since a generic word is the reason the default is silence.
   * It falls back to the design system dictionary.
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

// A guard against two silent bugs: asked for zero lines the component would render
// NOTHING at all — an invisible skeleton nobody notices is missing — and a fractional
// count would produce a surprising number of them.
const count = computed(() => Math.max(1, Math.trunc(props.lines)))

// @a11y — silent by default, since a dozen silhouettes must not produce a dozen
// announcements. Supplying a label counts as asking to be announced, otherwise that
// prop would sit there doing nothing.
const announced = computed(() => props.announce || props.label !== undefined)

const m = useMessages()
// TRAP — the dictionary must never be read directly in the body of `setup`: the value
// would be captured once and would stop following a later change of language.
const resolvedLabel = computed(() => props.label ?? m.value.common.loading)
</script>

<template>
  <span
    class="v-skeleton v-control"
    :data-shape="shape"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-animation="animation"
    :data-custom="color !== undefined ? '' : undefined"
    :role="announced ? 'status' : undefined"
    :aria-hidden="announced ? undefined : 'true'"
    :style="{
      '--custom-color': color,
      '--skeleton-w': cssSize(width),
      '--skeleton-h': cssSize(height),
    }"
  >
    <!--
      TRAP — the label is rendered BEFORE the silhouettes, and that order is
      structural. The rule shortening the last line of a paragraph asks for the last
      CHILD, so a label rendered after them would quietly take that place and no line
      would be shortened. A unit test locks the order.

      It costs no layout: the class hiding it takes it out of the flow entirely, so it
      is never one of the stacked items. And it is rendered only when something is
      actually announced — inside a subtree hidden from screen readers it would be text
      nobody can reach.
    -->
    <span v-if="announced" class="v-visually-hidden">{{ resolvedLabel }}</span>
    <span v-for="n in count" :key="n" class="v-skeleton-item" />
  </span>
</template>

<style>
@layer vectis.components {
  /*
   * The whole geometry comes down to four variables. The shape table below sets them,
   * and the dimension props overwrite them inline — which always wins over a rule
   * targeting the same element, so no specificity contest is possible.
   */
  .v-skeleton {
    /* The grey has a token of its own. No existing colour role holds the right value in
       BOTH themes: the muted surface is too pale in the light one for the pulse to be
       visible at all, and the border colour has the right tone but the wrong meaning. */
    --skeleton-base: var(--vectis-color-surface-skeleton);
    /*
     * The lighter shade the animation sweeps across is DERIVED from the grey rather
     * than named: it is that same colour, a little lighter.
     *
     * Expressing it as a lightness STEP is what makes one declaration correct in both
     * themes. Mixing towards a target colour would not: in the light theme the
     * silhouette is darker than the page, in the dark theme it is LIGHTER than it, so
     * any fixed target would lighten in one and darken in the other. A step in
     * lightness always goes the same way — and in the light theme it naturally stops at
     * white, exactly the page's colour.
     *
     * It also follows a custom colour with nothing else to set. The step itself is a
     * bare ratio, the same tolerance as the opacities.
     */
    --skeleton-highlight: oklch(from var(--skeleton-base) calc(l + 0.06) c h);
    --skeleton-h: var(--control-height);
    --skeleton-radius: var(--vectis-radius-interactive);
    --skeleton-gap: var(--vectis-space-2);
    display: flex;
    flex-direction: column;
    gap: var(--skeleton-gap);
  }

  /* A custom colour wins by specificity rather than by order, being one step more
     specific than the rule above — unlike VProgressLinear's tones, which all sit at the
     same level and depend on their sequence. */
  .v-skeleton[data-custom] {
    --skeleton-base: var(--custom-color);
  }

  .v-skeleton-item {
    /* The animation's overlay is positioned against this box. */
    position: relative;
    /* The height from the shape table is a DEFAULT: inside a parent that has a height
       of its own, the silhouette grows to fill it — a card fills its slot. */
    flex: 1 1 auto;
    inline-size: var(--skeleton-w, 100%);
    block-size: var(--skeleton-h);
    /* Clipped rather than hidden: hiding the overflow would turn every silhouette into
       a scroll container, for nothing. */
    overflow: clip;
    border-radius: var(--skeleton-radius);
    background: var(--skeleton-base);
  }

  /*
   * A line of text is one em tall, which means it follows the typography it INHERITS,
   * and it is centred in the line box the same way a line of text would be.
   *
   * The gap between lines and the padding around them are derived from that same line
   * height, so that N silhouettes occupy exactly N lines of text: replacing them with
   * the real content shifts nothing on the page. The floor guards against a parent
   * whose lines are set tighter than its font size, where the gap would otherwise go
   * negative.
   */
  .v-skeleton[data-shape='text'] {
    --skeleton-h: 1em;
    --skeleton-radius: var(--vectis-radius-pill);
    --skeleton-gap: max(0px, calc(1lh - 1em));
    padding-block: calc(max(0px, calc(1lh - 1em)) / 2);
  }

  /* A line of text keeps the height its typography gives it: unlike the other shapes it
     neither stretches in a tall parent nor squashes in a short one. */
  .v-skeleton[data-shape='text'] .v-skeleton-item {
    flex: none;
  }

  /*
   * The shortened last line, the one detail that makes a stack of bars read as a
   * paragraph. Asking for a line PRECEDED by another is what guarantees it only
   * applies from two lines up — a single line is not a paragraph — and the proportion
   * is taken from the EFFECTIVE width, so it still works under a `width` prop.
   */
  .v-skeleton[data-shape='text'] .v-skeleton-item + .v-skeleton-item:last-child {
    --skeleton-last-line: 0.6;
    inline-size: calc(var(--skeleton-w, 100%) * var(--skeleton-last-line));
  }

  .v-skeleton[data-shape='pill'] {
    --skeleton-radius: var(--vectis-radius-pill);
  }

  /*
   * A circle takes its width FROM its height through the ratio, so changing the size
   * alone changes the diameter and nothing has to be kept in step.
   *
   * The container sits inline, like the avatar it replaces, rather than spanning the
   * whole width, and aligning to the start stops the silhouette from being stretched
   * sideways — which is what keeps the circle round.
   */
  .v-skeleton[data-shape='circle'] {
    --skeleton-radius: var(--vectis-radius-pill);
    display: inline-flex;
    align-items: start;
  }

  .v-skeleton[data-shape='circle'] .v-skeleton-item {
    /* Left to the content rather than set to the full width, so that the ratio is what
       decides. An explicit `width` still takes over, and then knowingly gives an
       oval. */
    inline-size: var(--skeleton-w, auto);
    aspect-ratio: 1;
  }

  /*
   * A surface — a card, an image, a block — has no height anyone could guess without
   * measuring the page, which this component deliberately never does. It takes a
   * default from a token, which the `height` prop overrides, as does any consumer style
   * (theirs sits outside our layers and therefore wins).
   */
  .v-skeleton[data-shape='surface'] {
    --skeleton-h: var(--vectis-control-size-skeleton-surface);
    --skeleton-radius: var(--vectis-radius-surface);
  }

  /*
   * The pulse: a flat sheet of the lighter shade fades in and out OVER the silhouette.
   *
   * Fading the silhouette itself would be shorter to write, and wrong: it would fade
   * towards the PAGE, which means lightening in the light theme and DARKENING in the
   * dark one — the opposite of what the wave does. Going through an overlay in the
   * derived colour gives the same direction in both, and it is still only an opacity
   * being animated, so it costs no layout.
   */
  .v-skeleton[data-animation='pulse'] .v-skeleton-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: var(--skeleton-highlight);
    animation: v-skeleton-pulse calc(var(--vectis-duration-slow) * 5) var(--vectis-ease-in-out)
      infinite;
  }

  /*
   * The wave: a band of light crossing the silhouette.
   *
   * The gradient is SYMMETRIC — transparent, light, transparent — so the physical angle
   * it is drawn at makes no observable difference, and there is nothing to mirror in a
   * right-to-left page. All that matters is the DIRECTION of the run, and reversing the
   * animation is enough for that. It is exact here because the run is linear, hence
   * identical read backwards; the same argument VProgressLinear uses for its
   * indeterminate bar.
   *
   * The band is moved by a transform, where VProgressLinear runs a logical property.
   * The trade-off is genuinely reversed between the two: that component has a vertical
   * orientation to serve and only ever draws one bar, whereas a page may hold a dozen
   * skeletons, and here a movement the compositor can handle without laying anything
   * out is no longer negotiable.
   */
  .v-skeleton[data-animation='wave'] .v-skeleton-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(90deg, transparent, var(--skeleton-highlight), transparent);
    animation: v-skeleton-wave calc(var(--vectis-duration-slow) * 5) linear infinite;
  }

  /* Scoped to the wave: the pulse uses the same overlay, but its run is symmetric in
     time, so reversing it would change nothing at all. */
  .v-skeleton[data-animation='wave']:dir(rtl) .v-skeleton-item::after {
    animation-direction: reverse;
  }

  /* These keyframes serve this component alone, so they stay in its own stylesheet.
     Only the spin shared by VSpinner and VProgressCircular is declared globally, in
     styles/utilities.css. */
  @keyframes v-skeleton-pulse {
    from,
    to {
      opacity: 0;
    }

    50% {
      opacity: 1;
    }
  }

  @keyframes v-skeleton-wave {
    from {
      translate: -100% 0;
    }

    to {
      translate: 100% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /*
     * The design system's rule for readers who ask for less motion is to slow down
     * rather than to stop: a motionless placeholder no longer says that anything is in
     * progress. But the wave is a TRANSLATION, which is exactly what those readers are
     * flagging, so it FALLS BACK to the pulse — which keeps the signal without moving
     * anything. Both are then slowed considerably.
     *
     * Since the two animations share the same overlay, all that is left to do is
     * replace the moving gradient with the flat colour.
     *
     * TRAP — this rule has exactly the same specificity as the two it overrides, so it
     * is its position at the END of the stylesheet that makes it win.
     */
    .v-skeleton:is([data-animation='wave'], [data-animation='pulse']) .v-skeleton-item::after {
      background-image: none;
      background-color: var(--skeleton-highlight);
      animation: v-skeleton-pulse calc(var(--vectis-duration-slow) * 15) var(--vectis-ease-in-out)
        infinite;
    }
  }
}
</style>
