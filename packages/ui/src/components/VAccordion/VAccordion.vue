<script setup lang="ts">
import { provide, useId } from 'vue'

import type { IconSource } from '../VIcon/types'

import { accordionKey } from './context'

/**
 * 100% native accordion: <details>/<summary>. Exclusive mode rests on the `name`
 * attribute shared between items (supplied here through provide/inject) — no state
 * JS at all.
 */
interface AccordionProps {
  /** A single item open at a time (the native <details name> attribute). */
  exclusive?: boolean
  /** `flat`: no decoration. `outlined`: raised background, border and radius. */
  variant?: 'flat' | 'outlined'
  /** Icon of closed items: a name, or `{ src }` / `{ component }`. Default: a rotating chevron. */
  expandIcon?: IconSource
  /** Icon of open items; absent = `expandIcon` rotated 180°. */
  collapseIcon?: IconSource
  /** Reduced density: -4px on every padding (type and icon unchanged). */
  compact?: boolean
}

const props = withDefaults(defineProps<AccordionProps>(), {
  exclusive: true,
  variant: 'flat',
  expandIcon: 'expand_more',
  collapseIcon: undefined,
  compact: false,
})

defineSlots<{
  /** The <VAccordionItem>s */
  default(): unknown
}>()

const groupName = useId()
provide(accordionKey, {
  get name() {
    return props.exclusive ? groupName : undefined
  },
  get expandIcon() {
    return props.expandIcon
  },
  get collapseIcon() {
    return props.collapseIcon
  },
})
</script>

<template>
  <div class="v-accordion" :data-variant="variant" :data-compact="compact ? '' : undefined">
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  .v-accordion {
    /*
     * Density: variables set on the ROOT only (the only element rendering
     * data-compact) and inherited by the items — the fallbacks live in
     * VAccordionItem, which stays usable outside a group.
     *
     * Compact = -4px on EVERY padding (outside the size scale: the accordion has no
     * imposed height). A single delta drives all three measurements, so the base
     * values are written only here.
     */
    --accordion-pad-delta: 0px;
    --accordion-pad-block: calc(var(--vectis-space-4) - var(--accordion-pad-delta));
    --accordion-pad-inline: calc(var(--vectis-space-5) - var(--accordion-pad-delta));
    --accordion-content-pad-start: calc(var(--vectis-space-2) - var(--accordion-pad-delta));

    font-family: var(--vectis-text-family);
    overflow: hidden;
  }

  /* Compact: tightened paddings only — type, gutter and icon unchanged */
  .v-accordion[data-compact] {
    --accordion-pad-delta: var(--vectis-space-1);
  }

  /* Bordered card; `flat` (the default) has nothing to cancel — including the
     background, which belongs to the frame: when flat, the accordion inherits the
     host surface. */
  .v-accordion[data-variant='outlined'] {
    /*
     * NESTED radius (minus the border), picked up by the summaries of the end items:
     * `overflow: hidden` clips the whole subtree along that curve, so a
     * square-cornered focus ring would lose its corners there.
     */
    --accordion-corner-radius: calc(var(--vectis-radius-surface) - 1px);

    background: var(--vectis-color-surface-raised);
    border: 1px solid var(--vectis-color-border);
    border-radius: var(--vectis-radius-surface);
  }
}
</style>
