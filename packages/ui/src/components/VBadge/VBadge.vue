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
 *
 * Beside a target the pill is `aria-hidden`: read on its own, "3" means nothing, and the
 * target is what a reader reaches, so the count belongs in the target's own name
 * ("Notifications, 3 unread") where it would otherwise be announced twice.
 */
import { computed, h } from 'vue'
import type { FunctionalComponent } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

import { customColorStyle } from '../../utils/css'

/** How strongly the badge is painted: the full colour, or a tint of it. */
export type BadgeVariant = 'solid' | 'soft'
/** What the badge means, in colour. */
export type BadgeTone = 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
/** The corner an overlaid badge is pinned to. */
export type BadgeOverlayPosition = 'top' | 'bottom'

interface BadgeProps {
  /**
   * How strongly the badge is painted: filled with the full colour (`solid`, the
   * default), or a tinted background with the text in the colour (`soft`), for a
   * count that should not draw the eye. A `dot` is always solid: with no content to
   * tint, a soft dot would be a pale disc barely distinguishable from the page.
   */
  variant?: BadgeVariant
  /**
   * The meaning the badge carries, expressed as a colour. A solid badge is filled
   * with it and its text adapts to stay readable; a soft one is tinted with it and
   * writes its text in it.
   */
  tone?: BadgeTone
  /**
   * A colour of your own (hex, CSS name or `oklch()`), which replaces the tone. On a
   * solid badge, browsers that support `contrast-color()` turn the text black or
   * white by themselves; everywhere else it falls back to white, so with a light
   * colour the contrast is yours to check. A soft badge derives its background and
   * text from that colour mixed with the theme's surface and text.
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
   * Reduces the badge to a 10px dot with no content, the discreet way to signal
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
   * bottom one for a marker that belongs at the foot of its target, such as a presence dot
   * under an avatar. The horizontal side follows the reading
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
  variant: 'solid',
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
   * it, the badge is placed beside the element, or in its corner under `overlay`, and is
   * hidden from assistive technology: say the count in the element's own name.
   */
  default?(): unknown
}>()

// TRAP — a function read by the template, never a `computed`: `slots` is not reactive, so a
// computed would keep its first answer while a slot behind a `v-if` comes and goes.
function hasTarget() {
  return slots.default !== undefined
}

/**
 * The counter as it is actually displayed: a whole number, zero or more, and anything past 99
 * becomes "99+". A count that is not a number (a division by a total not yet known) draws
 * nothing rather than the word "NaN".
 */
const displayCount = computed(() => {
  const count = props.count
  if (count === undefined || !Number.isFinite(count)) return undefined
  return count > 99 ? '99+' : Math.max(0, Math.trunc(count))
})

/*
 * The pill itself, written once. The template has two roots — one wrapping a target, one
 * standing alone — and both render the same badge; a functional component is the one way
 * to put the same markup in two places of a template without writing it twice.
 */
const Pill: FunctionalComponent = () =>
  h(
    'span',
    {
      class: 'v-badge v-tone v-variant',
      'data-variant': props.variant,
      'data-tone': props.tone,
      'data-custom': props.color !== undefined ? '' : undefined,
      'data-dot': props.dot ? '' : undefined,
      'data-icon-only': !props.dot && props.icon ? '' : undefined,
      'data-bordered': props.bordered ? '' : undefined,
      style: [
        customColorStyle(props.color),
        props.ringColor !== undefined ? { '--badge-ring-color': props.ringColor } : undefined,
      ],
    },
    props.dot
      ? undefined
      : props.icon
        ? [h(VIcon, iconProps(props.icon))]
        : displayCount.value === undefined
          ? undefined
          : String(displayCount.value),
  )
// TRAP — the empty list is not decoration. A functional component that declares no props lets
// only `class`, `style` and listeners fall through, so a standalone badge, whose root this is,
// would silently drop every other attribute a consumer set on VBadge (an `id`, a `data-*`).
Pill.props = []
</script>

<template>
  <span
    v-if="hasTarget()"
    class="v-badge-host"
    :data-overlay="overlay ? '' : undefined"
    :data-overlay-position="overlayPosition"
  >
    <slot />
    <Pill aria-hidden="true" />
  </span>
  <Pill v-else />
</template>

<style>
@layer vectis.components {
  .v-badge-host {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2); /* the space between the target and the badge, in inline mode */
  }

  /* The pill is painted by the shared `.v-variant` rules (styles/variants.css) over the
     tone table (`.v-tone`), both set in the template: `solid` is the tone's full colour,
     `soft` its tint with the text in the tone's own colour. A custom colour is the table's
     `[data-custom]` row, in styles/tones.css. */
  .v-badge {
    --vectis-icon-size: var(--vectis-icon-size-sm);
    --vectis-icon-opsz: 20;
    /* The colour of the `bordered` ring: a bet on the page background, the only one a
       component can make since CSS cannot read what its parent paints. The `ringColor`
       prop overrides it inline for a badge sitting on anything else. */
    --badge-ring-color: var(--vectis-color-surface);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--vectis-control-size-badge-h);
    /* A minimum width equal to the height, with a small padding on top, is what
       makes a one- or two-digit counter come out round rather than oval. */
    min-width: var(--vectis-control-size-badge-h);
    padding-inline: var(--vectis-space-1);
    border-radius: var(--vectis-radius-pill);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
  }

  /* On a solid pill the text picks black or white against whatever the fill ended up
     with, where the function exists; elsewhere it keeps the table's `--tone-text-solid`.
     TRAP — the class is compounded to (0,3,0): `.v-variant[data-variant='solid']` sets
     `color` at (0,2,0) from another sheet, and a tie would be settled by sheet order. The
     soft pill keeps the tone's own text colour, which says the tone where black or white
     would not. */
  @supports (color: contrast-color(red)) {
    .v-badge.v-variant[data-variant='solid'] {
      color: contrast-color(var(--tone-bg-solid));
    }
  }

  /* A dot is always solid: with no content, a soft dot is a pale disc on the page, which a
     presence marker cannot afford. (0,3,0), above the soft variant's background. */
  .v-badge.v-variant[data-dot] {
    background: var(--tone-bg-solid);
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

  /* Forced colours repaint the background as Canvas and drop the ring, a shadow: the pill
     loses its shape, and a dot, which has nothing else, disappears altogether. The pill
     gets an edge, and the dot is filled in the text colour. */
  @media (forced-colors: active) {
    .v-badge {
      outline: var(--vectis-control-border-width) solid CanvasText;
      outline-offset: calc(-1 * var(--vectis-control-border-width));
    }

    .v-badge.v-variant[data-dot] {
      forced-color-adjust: none;
      background: CanvasText;
    }
  }
}
</style>
