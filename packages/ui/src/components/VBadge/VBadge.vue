<script setup lang="ts">
// @core
/**
 * A small pill carrying one piece of information at a glance: a count of unread
 * items, or a single icon. It is never interactive — there is nothing to click and
 * nothing to focus — and it either stands on its own, sits next to an element, or
 * is pinned to one of that element's corners.
 *
 * It is made of HTML and CSS alone. The only JavaScript decides what to render:
 * whether a target element was given at all, capping the counter at "99+", and
 * handing the two colours a consumer may choose to the stylesheet as
 * `--custom-color` and `--badge-ring-color`.
 */
import { computed } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

export type BadgeTone = 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
export type BadgeOverlayPosition = 'top' | 'bottom'

interface BadgeProps {
  /**
   * The meaning the badge carries, expressed as a colour. The pill is filled with
   * it and the text adapts to stay readable; there is a single, fully coloured
   * rendering, so no variant to choose alongside it.
   */
  tone?: BadgeTone
  /**
   * A colour of your own (hex, CSS name or `oklch()`), which replaces the tone. On
   * browsers that support `contrast-color()` the text turns black or white by
   * itself; everywhere else it falls back to white, so with a light colour the
   * contrast is yours to check.
   */
  color?: string
  /**
   * The number to display. Anything above 99 is shown as "99+", so that a busy
   * counter cannot stretch the pill indefinitely.
   */
  count?: number
  /**
   * A single icon shown instead of a number: an icon name, or an explicit render
   * (the VIcon contract). It takes precedence over `count`, and is ignored when the
   * badge is a `dot`.
   */
  icon?: IconSource
  /**
   * Reduces the badge to a 10px dot with no content — the discreet way to signal
   * that something is new without saying how much.
   */
  dot?: boolean
  /**
   * Pins the badge to a corner of the target element instead of placing it beside
   * it. It does nothing when the badge has no target.
   */
  overlay?: boolean
  /**
   * Which corner an `overlay` badge is pinned to: the top one by default, the
   * bottom one for a marker that belongs at the foot of its target — a presence dot
   * under an avatar, for instance. The horizontal side follows the reading
   * direction and is not configurable. It does nothing without `overlay`.
   */
  overlayPosition?: BadgeOverlayPosition
  /**
   * Draws a 2px ring around the badge, in the colour of the surface behind it,
   * which detaches it from a busy target such as a picture. That colour defaults to
   * the page background and is named through `ringColor` on any other surface.
   */
  bordered?: boolean
  /**
   * The colour of the ring drawn by `bordered`. It defaults to the page background,
   * which is what makes the ring read as a gap around the badge; on another surface
   * (a card, a coloured banner), pass that surface's colour. It does nothing without
   * `bordered`.
   */
  ringColor?: string
}

const props = withDefaults(defineProps<BadgeProps>(), {
  tone: 'accent',
  color: undefined,
  count: undefined,
  icon: undefined,
  overlayPosition: 'top',
  ringColor: undefined,
  // Written out although Vue casts an absent boolean to `false` on its own: left out,
  // `vue-component-meta` reports no default at all and the docs table's cell goes blank.
  dot: false,
  overlay: false,
  bordered: false,
})

const slots = defineSlots<{
  /**
   * The element the badge belongs to. Without it the badge stands on its own; with
   * it, the badge is placed beside the element, or in its corner under `overlay`.
   */
  default?(): unknown
}>()

// TRAP — a function read by the template, never a `computed`: `slots` is not reactive, so a
// computed would keep its first answer while a slot behind a `v-if` comes and goes.
function hasTarget() {
  return slots.default !== undefined
}

/** The counter as it is actually displayed: anything past 99 becomes "99+". */
const displayCount = computed(() =>
  props.count !== undefined && props.count > 99 ? '99+' : props.count,
)

/*
 * The attributes of the pill itself. The template has two roots — one wrapping a
 * target, one standing alone — and both render the same badge, so the attributes
 * are computed once here rather than written twice.
 */
const badgeAttrs = computed(() => ({
  'data-tone': props.tone,
  'data-custom': props.color !== undefined ? '' : undefined,
  'data-dot': props.dot ? '' : undefined,
  'data-icon-only': !props.dot && props.icon ? '' : undefined,
  'data-bordered': props.bordered ? '' : undefined,
  style: [
    props.color !== undefined ? { '--custom-color': props.color } : undefined,
    props.ringColor !== undefined ? { '--badge-ring-color': props.ringColor } : undefined,
  ],
}))
</script>

<template>
  <span
    v-if="hasTarget()"
    class="v-badge-host"
    :data-overlay="overlay ? '' : undefined"
    :data-overlay-position="overlayPosition"
  >
    <slot />
    <span class="v-badge v-tone" v-bind="badgeAttrs">
      <template v-if="!dot">
        <VIcon v-if="icon" v-bind="iconProps(icon)" />
        <template v-else>{{ displayCount }}</template>
      </template>
    </span>
  </span>
  <span v-else class="v-badge v-tone" v-bind="badgeAttrs">
    <template v-if="!dot">
      <VIcon v-if="icon" v-bind="iconProps(icon)" />
      <template v-else>{{ displayCount }}</template>
    </template>
  </span>
</template>

<style>
@layer vectis.components {
  .v-badge-host {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2); /* the space between the target and the badge, in inline mode */
  }

  .v-badge {
    --vectis-icon-size: var(--vectis-icon-size-sm);
    --vectis-icon-opsz: 20;
    /* The colour of the `bordered` ring: a bet on the page background, the only one a
       component can make since CSS cannot read what its parent paints. The `ringColor`
       prop overrides it inline for a badge sitting on anything else. */
    --badge-ring-color: var(--vectis-color-surface);
    /* The pill is the tone's solid pair, read from the shared table (`.v-tone`, set in the
       template). Its neutral is the text/surface inversion, which is what lets the
       fallback text and contrast-color() agree in both themes. */
    --badge-bg: var(--tone-bg-solid);
    --badge-text-fallback: var(--tone-text-solid);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--vectis-control-size-badge-h);
    /* A minimum width equal to the height, with a small padding on top, is what
       makes a one- or two-digit counter come out round rather than oval. */
    min-width: var(--vectis-control-size-badge-h);
    padding-inline: var(--vectis-space-1);
    border-radius: var(--vectis-radius-pill);
    background: var(--badge-bg);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
    color: var(--badge-text-fallback);
  }

  @supports (color: contrast-color(red)) {
    .v-badge {
      color: contrast-color(var(--badge-bg));
    }
  }

  /* A custom colour replaces the tone: at (0,2,0) it beats the base rule's mapping
     whatever the order the two are written in. */
  .v-badge[data-custom] {
    --badge-bg: var(--custom-color);
    --badge-text-fallback: var(--vectis-color-text-on-accent);
  }

  .v-badge[data-icon-only] {
    padding: 0;
  }

  .v-badge[data-dot] {
    width: var(--vectis-control-size-badge-dot);
    height: var(--vectis-control-size-badge-dot);
    min-width: 0;
    padding: 0;
  }

  .v-badge[data-bordered] {
    box-shadow: 0 0 0 var(--vectis-control-size-badge-ring) var(--badge-ring-color);
  }

  /* The tuck-in offset is a ratio of the badge's own size, so it stays proportionate
     across the pill, the dot and the icon. Each half of it is held in its own
     variable: the corner and the reading direction each flip ONE axis, and writing
     the whole `translate` again in each branch would make the two multiply — four
     rules to keep in step by hand for two independent decisions. */
  .v-badge-host[data-overlay] > .v-badge {
    --badge-overlay-x: 25%;
    --badge-overlay-y: -25%;

    position: absolute;
    inset-block: 0 auto;
    inset-inline-end: 0;
    translate: var(--badge-overlay-x) var(--badge-overlay-y);
    /* TRAP — an overlaid badge deliberately leaves its target's box, so it lands on
       whatever sits beside it, and the host opens no stacking context of its own
       (`position: relative` with `z-index: auto`). Left at `auto` the badge is painted
       with the other positioned boxes in TREE ORDER, which means anything positioned
       after it covers it: inside a VButtonGroup, where every segment is positioned, the
       badge on one segment disappears under the borders of the next. The lift takes it
       past that step, and no further: the segment it leans into comes later in tree
       order, so that segment's focus ring, raised to this same level, is still drawn
       over the badge rather than under it. */
    z-index: 1;
  }

  .v-badge-host[data-overlay][data-overlay-position='bottom'] > .v-badge {
    --badge-overlay-y: 25%;

    inset-block: auto 0;
  }

  /* In a right-to-left direction the logical corner moves to the left, so the
     horizontal half of the translation has to flip with it — `translate` is a
     physical property and knows nothing about direction. */
  .v-badge-host[data-overlay]:dir(rtl) > .v-badge {
    --badge-overlay-x: -25%;
  }
}
</style>
