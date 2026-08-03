<script setup lang="ts">
/**
 * A non-interactive information pill: a counter or an icon. HTML + CSS only — the
 * only JS is render computation (detecting the target slot, the "99+" cap, the
 * custom colour → --custom-color bridge).
 */
import { computed, useSlots } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

export type BadgeTone = 'neutral' | 'accent' | 'danger' | 'success' | 'warning'

interface BadgeProps {
  /** Semantic colour (a single full-colour rendering). */
  tone?: BadgeTone
  /**
   * Custom colour (hex, CSS name or oklch()) — replaces the tone. The text adapts
   * black/white through contrast-color() on the browsers supporting it; elsewhere it
   * falls back to white (the contrast of a light colour is the consumer's
   * responsibility, as with VChip's custom solid).
   */
  color?: string
  /** Numeric counter. Past 99, the display becomes "99+". */
  count?: number
  /**
   * Icon alone (a Material Symbols name or an image URL) — wins over `count`,
   * ignored in `dot` mode. An icon name, or an explicit render (the VIcon contract).
   */
  icon?: IconSource
  /** A 10px dot with no visible content. */
  dot?: boolean
  /** With a target: top-right corner instead of inline. Ignored with no target. */
  overlay?: boolean
  /**
   * A 2px ring in the colour of the background behind (`--vectis-color-surface`,
   * overridable per subtree) to detach the badge from its target.
   */
  bordered?: boolean
}

const props = withDefaults(defineProps<BadgeProps>(), {
  tone: 'accent',
  color: undefined,
  count: undefined,
  icon: undefined,
})

defineSlots<{
  /** Target element. Absent → standalone; present → inline or overlay. */
  default?(): unknown
}>()

const slots = useSlots()
const hasTarget = computed(() => slots.default !== undefined)

/** Capped counter: past 99, the display becomes "99+". */
const displayCount = computed(() =>
  props.count !== undefined && props.count > 99 ? '99+' : props.count,
)

/* Attributes of the badge itself, shared between the template's two roots. */
const badgeAttrs = computed(() => ({
  'data-tone': props.tone,
  'data-custom': props.color !== undefined ? '' : undefined,
  'data-dot': props.dot ? '' : undefined,
  'data-icon-only': !props.dot && props.icon ? '' : undefined,
  'data-bordered': props.bordered ? '' : undefined,
  style: props.color !== undefined ? { '--custom-color': props.color } : undefined,
}))
</script>

<template>
  <span v-if="hasTarget" class="v-badge-host" :data-overlay="overlay ? '' : undefined">
    <slot />
    <span class="v-badge" v-bind="badgeAttrs">
      <template v-if="!dot">
        <VIcon v-if="icon" v-bind="iconProps(icon)" />
        <template v-else>{{ displayCount }}</template>
      </template>
    </span>
  </span>
  <span v-else class="v-badge" v-bind="badgeAttrs">
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
    gap: var(--vectis-space-2); /* target ↔ badge gap in inline mode */
  }

  .v-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--vectis-control-size-badge-h);
    /* min-width = height + reduced padding → a round 1- or 2-digit counter */
    min-width: var(--vectis-control-size-badge-h);
    padding-inline: var(--vectis-space-1);
    border-radius: var(--vectis-radius-pill);
    background: var(--badge-bg);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);

    /* Icon context: the xs mapping of the size scale (16px, opsz 20 — literal, the
       Material Symbols font contract). */
    --vectis-icon-size: var(--vectis-icon-size-sm);
    --vectis-icon-opsz: 20;

    /* Per-tone fallback (the tones below). contrast-color() can NOT be a plain
       second declaration: containing a var(), it is never rejected at parse time by
       browsers without support — it would win the cascade then become invalid at
       computed-value time (IACVT → color: unset → inheritance, and the fallback would
       never apply). Hence the @supports below, which IS evaluated without var()
       substitution. */
    color: var(--tone-text-fallback);
  }

  /* Adaptive black/white text where contrast-color() exists (Safari 26+, Edge 150+). */
  @supports (color: contrast-color(red)) {
    .v-badge {
      color: contrast-color(var(--badge-bg));
    }
  }

  .v-badge[data-tone='accent'] {
    --badge-bg: var(--vectis-color-accent);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .v-badge[data-tone='danger'] {
    --badge-bg: var(--vectis-color-danger);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .v-badge[data-tone='success'] {
    --badge-bg: var(--vectis-color-success);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .v-badge[data-tone='warning'] {
    --badge-bg: var(--vectis-color-warning);
    --tone-text-fallback: var(--vectis-color-text-on-warning);
  }

  /* Neutral: a text/surface inversion — a text-muted-like grey would be neutral-400
     in dark, where the white fallback would fail; here the fallback and
     contrast-color() agree in both themes. */
  .v-badge[data-tone='neutral'] {
    --badge-bg: var(--vectis-color-text);
    --tone-text-fallback: var(--vectis-color-surface);
  }

  /* After the tones: equal specificity, the last one wins. */
  .v-badge[data-custom] {
    --badge-bg: var(--custom-color);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  /* Icon alone: min-width makes the circle, the padding is removed. */
  .v-badge[data-icon-only] {
    padding: 0;
  }

  /* min-width neutralized: it would beat the dot's width. */
  .v-badge[data-dot] {
    width: var(--vectis-control-size-badge-dot);
    height: var(--vectis-control-size-badge-dot);
    min-width: 0;
    padding: 0;
  }

  /* Outer ring as a box-shadow: it does not change the dimensions (the dot stays a
     full 10px) and follows the border-radius. */
  .v-badge[data-bordered] {
    box-shadow: 0 0 0 2px var(--vectis-color-surface);
  }

  /* The translate percentages are ratios of the badge's own size (50% = centred on
     the corner) — not spacing, so no token. */
  .v-badge-host[data-overlay] > .v-badge {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    translate: 25% -25%;
  }

  /* RTL: the logical corner moves left, so the X translation flips */
  .v-badge-host[data-overlay]:dir(rtl) > .v-badge {
    translate: -25% -25%;
  }
}
</style>
