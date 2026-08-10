<script setup lang="ts">
/**
 * A 100% CSS loading placeholder: the silhouette of a design system component
 * while its content is on its way.
 *
 * The root is a CONTAINER (the VSpinner model) and not the painted silhouette (the
 * VProgressLinear model): that is what makes `lines` free and keeps EVERY selector
 * uniform — not one "painted root" case and one "painted child" case. It carries
 * `v-control`, so `size`/`compact` reuse the DS's single height table: an `md`
 * skeleton is exactly the height of an `md` VButton.
 *
 * The component never MEASURES anything: no silhouette is deduced from the content
 * it replaces, it is declared. The three `computed`s are the only JS — no event, no
 * lifecycle, no DOM.
 */
import { computed } from 'vue'

import { useMessages } from '../../i18n/state'
import { cssSize } from '../../utils/css'

export type SkeletonShape = 'text' | 'control' | 'pill' | 'circle' | 'surface'
export type SkeletonAnimation = 'wave' | 'pulse' | 'none'
export type SkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface SkeletonLoaderProps {
  /**
   * Silhouette to match — each value sets a DS radius and a height rule:
   * - `text` (the default): height `1em`, centred in the inherited line box — the
   *   silhouette follows the parent's typography and N lines occupy exactly N lines
   *   of text; pill radius.
   * - `control`: height taken from the control scale (`size`), interactive radius —
   *   VButton, VInput, a select.
   * - `pill`: as `control` with a pill radius — VChip, VBadge.
   * - `circle`: as `control` in a 1:1 ratio — VAvatar, a round VIconButton.
   * - `surface`: surface radius, default height from the token — a card, an image.
   */
  shape?: SkeletonShape
  /**
   * Size on the DS control scale (24/32/40/48/56px). It only acts on `control`,
   * `pill` and `circle`: `text` follows the inherited typography and `surface` has a
   * height of its own.
   */
  size?: SkeletonSize
  /** Height reduced by 4px, as everywhere else in the DS. */
  compact?: boolean
  /**
   * Width: a number → px, otherwise a free CSS string (`'100%'`, `'12ch'`). By
   * default the silhouette takes the available width.
   */
  width?: number | string
  /** Height, same rules as `width` — wins over `shape` and `size`. */
  height?: number | string
  /**
   * Number of stacked silhouettes. In `shape="text"` the LAST one is shortened:
   * that detail is what reads as a "paragraph" rather than a "table". Floored at 1.
   */
  lines?: number
  /**
   * Loading animation. `none` freezes the silhouette (printing, a screenshot, or an
   * animation driven by a parent).
   */
  animation?: SkeletonAnimation
  /**
   * Custom background (hex, CSS name or `oklch()`) — replaces the token. The
   * `wave`'s highlight is DERIVED from it: it stays correct with no second setting.
   */
  color?: string
  /**
   * Announces the loading (`role="status"`). **False by default: a skeleton is
   * decorative** — a page holds a dozen of them, and as many competing announcements
   * would be unreadable. The announcement belongs to the container, which carries
   * `aria-busy`.
   */
  announce?: boolean
  /**
   * Announced text; **implies `announce`**. Default: the DS dictionary. Prefer a
   * situated label ("Loading the results…"): that is the whole point of announcing.
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

// Guard: `v-for="n in 0"` would render NOTHING — an invisible skeleton, hence a
// silent bug. A float would render a surprising number of lines.
const count = computed(() => Math.max(1, Math.trunc(props.lines)))

// @a11y — decorative by default: 12 silhouettes must not produce 12 announcements.
// Supplying a `label` counts as asking for an announcement, or the prop would be inert.
const announced = computed(() => props.announce || props.label !== undefined)

const m = useMessages()
// Never `.value.x` in the setup body: the value would be frozen.
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
      The label is rendered BEFORE the silhouettes, and that is structural: the
      "shortened last line" rule rests on `.v-skeleton-item:last-child`, which a label
      rendered last would break. Locked by a unit test. It is absolutely positioned
      (.v-visually-hidden), so never a flex item. Rendered CONDITIONALLY: inside an
      `aria-hidden` subtree it would be dead text.
    -->
    <span v-if="announced" class="v-visually-hidden">{{ resolvedLabel }}</span>
    <span v-for="n in count" :key="n" class="v-skeleton-item" />
  </span>
</template>

<style>
@layer vectis.components {
  /*
   * The whole geometry fits in four local variables, set by the `[data-shape]` table
   * and overridable inline by the dimension props (an inline style always beats a
   * rule targeting the same element).
   */
  .v-skeleton {
    /* Background: a dedicated token. No existing role has the right value in BOTH
       themes — `surface-muted` is too pale in light for a pulse to show, and `border`
       would have the right tone but the wrong role. */
    --skeleton-base: var(--vectis-color-surface-skeleton);
    /*
     * Highlight DERIVED from the background (relative color syntax): +0.06 of OKLCH
     * lightness. One declaration lightens correctly in light — the natural clamp at
     * L=1 lands exactly on the page white — AND in dark, where the background
     * (neutral.800) is LIGHTER than the page (neutral.950): aiming at a target colour
     * through `color-mix` would invert from one theme to the other, a lightness DELTA
     * would not. It also follows a custom `color` with no second setting. The delta is
     * a ratio, the same family as the opacities.
     */
    --skeleton-highlight: oklch(from var(--skeleton-base) calc(l + 0.06) c h);
    --skeleton-h: var(--control-height);
    --skeleton-radius: var(--vectis-radius-interactive);
    --skeleton-gap: var(--vectis-space-2);
    display: flex;
    flex-direction: column;
    gap: var(--skeleton-gap);
  }

  /* Specificity (0,2,0) > (0,1,0): independent of order, unlike VProgressLinear's
     tones, which all sit at the same level. */
  .v-skeleton[data-custom] {
    --skeleton-base: var(--custom-color);
  }

  .v-skeleton-item {
    /* Anchor of the wave's ::after */
    position: relative;
    /* The token height is a DEFAULT: inside a parent with a defined height the
       silhouette takes it (a card fills its slot) */
    flex: 1 1 auto;
    inline-size: var(--skeleton-w, 100%);
    block-size: var(--skeleton-h);
    /* `clip` and not `hidden`: `hidden` would make every silhouette a scroll
       container */
    overflow: clip;
    border-radius: var(--skeleton-radius);
    background: var(--skeleton-base);
  }

  /*
   * A line of text: height = 1em, hence the INHERITED typography, the bar centred in
   * the line box. Gutter and padding derive from the same leading, so that N lines
   * occupy exactly N lines of text — replacing them with the real content does not
   * shift the layout. `max()` protects against a parent with a tight `line-height`,
   * where the gap would go negative.
   */
  .v-skeleton[data-shape='text'] {
    --skeleton-h: 1em;
    --skeleton-radius: var(--vectis-radius-pill);
    --skeleton-gap: max(0px, calc(1lh - 1em));
    padding-block: calc(max(0px, calc(1lh - 1em)) / 2);
  }

  /* A line of text keeps its typographic height: it neither stretches in a tall
     parent nor squashes in a short one. */
  .v-skeleton[data-shape='text'] .v-skeleton-item {
    flex: none;
  }

  /*
   * A shortened last line — the detail that reads as a "paragraph". The `+` selector
   * alone guarantees there are at least two lines, and the ratio applies to the
   * EFFECTIVE width, the `width` prop included.
   */
  .v-skeleton[data-shape='text'] .v-skeleton-item + .v-skeleton-item:last-child {
    --skeleton-last-line: 0.6;
    inline-size: calc(var(--skeleton-w, 100%) * var(--skeleton-last-line));
  }

  .v-skeleton[data-shape='pill'] {
    --skeleton-radius: var(--vectis-radius-pill);
  }

  /*
   * Circle: the width is TRANSFERRED from the height by `aspect-ratio` — so `size`
   * alone is enough to change the diameter. The root composes inline (like a VAvatar)
   * instead of spanning the full width, and `align-items: start` prevents the inline
   * stretch: a circle stays round.
   */
  .v-skeleton[data-shape='circle'] {
    --skeleton-radius: var(--vectis-radius-pill);
    display: inline-flex;
    align-items: start;
  }

  .v-skeleton[data-shape='circle'] .v-skeleton-item {
    /* `auto` and not 100%: the ratio is what derives the width. An explicit `width`
       prop takes over and accepts the oval. */
    inline-size: var(--skeleton-w, auto);
    aspect-ratio: 1;
  }

  /*
   * Surface (a card, an image, a block): its height cannot be guessed without
   * measuring the DOM. A default token, which a `height` prop — or a consumer style,
   * outside any layer — overrides.
   */
  .v-skeleton[data-shape='surface'] {
    --skeleton-h: var(--vectis-control-size-skeleton-surface);
    --skeleton-radius: var(--vectis-radius-surface);
  }

  /*
   * Pulse: a flat fill of the highlight rises and falls OVER the silhouette.
   *
   * Varying the opacity of the silhouette itself would be shorter, but it would fade
   * towards the PAGE background — so lighten in light and DARKEN in dark, the
   * opposite of the wave. Going through a layer with the derived highlight gives the
   * same direction in both themes, and stays composited (it is still an opacity being
   * animated, on a pseudo-element).
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
   * Wave: a band of brightness crosses the silhouette.
   *
   * The gradient is SYMMETRIC (transparent → highlight → transparent): its physical
   * angle therefore has no observable effect, and there is nothing to flip in RTL.
   * Only the DIRECTION of the run matters, and it flips through `animation-direction`
   * — exact here because the run is `linear`, hence reversible identically (the same
   * argument as VProgressLinear's indeterminate mode, whose symmetric curve allows
   * reading it backwards).
   *
   * `translate` (composited) rather than a run in logical properties as in
   * VProgressLinear: this component has no vertical orientation, and the only
   * variable is RTL — one rule. The trade-off therefore flips: a page may hold twelve
   * skeletons, so compositing is no longer negotiable.
   */
  .v-skeleton[data-animation='wave'] .v-skeleton-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(90deg, transparent, var(--skeleton-highlight), transparent);
    animation: v-skeleton-wave calc(var(--vectis-duration-slow) * 5) linear infinite;
  }

  /* Qualified `wave`: the pulse shares this layer but its run is symmetric, so
     reversing it would mean nothing. */
  .v-skeleton[data-animation='wave']:dir(rtl) .v-skeleton-item::after {
    animation-direction: reverse;
  }

  /* LOCAL keyframes: they serve this component only, so they stay in its <style>,
     inside the layer. Only `v-spin`, shared by two components, lives outside any
     layer in styles/utilities.css. */
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
     * DS doctrine: slow down, do not remove — a motionless placeholder no longer says
     * "in progress". But the wave is a TRANSLATION, precisely what these users are
     * flagging: it FALLS BACK to the pulse, which keeps the signal with no motion.
     * Both are heavily slowed.
     *
     * The two animations share the same layer: all that is left is swapping the moving
     * gradient for the flat highlight. This rule is at EQUAL specificity with those of
     * `wave` and `pulse` — its position at the end of the sheet is what decides.
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
