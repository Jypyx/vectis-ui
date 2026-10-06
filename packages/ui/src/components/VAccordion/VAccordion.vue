<script setup lang="ts">
/**
 * Native details elements own disclosure and exclusive groups; multiple removes the shared
 * group name.
 */

import { provide, useId } from 'vue'

import { expand_more as expandMoreIcon } from '../VIcon/icons/expand_more'
import type { IconSource } from '../VIcon/types'

import { accordionKey } from './context'

/** How much decoration the block carries. */
export type AccordionVariant = 'flat' | 'outlined'

interface AccordionProps {
  /**
   * Lets the reader keep several sections open at once. Left out, only one may stay
   * open and opening one closes the previous one, which the browser does on its own
   * once every item shares the same `<details>` name.
   */
  multiple?: boolean
  /**
   * How the group is decorated. `flat`, the default, draws nothing and lets the
   * accordion sit directly on the surface behind it; `outlined` gives it a raised
   * background, a border and rounded corners, so it reads as a card.
   */
  variant?: AccordionVariant
  /**
   * The icon shown on a closed item: an icon name, or an explicit `{ src }` /
   * `{ component }`. It is a chevron by default, which rotates by 180° when the
   * item opens.
   */
  expandIcon?: IconSource
  /**
   * The icon shown on an open item. Leave it out and the `expandIcon` is simply
   * rotated 180°; provide one and the two icons are swapped instead.
   */
  collapseIcon?: IconSource
  /**
   * Reduced density: every padding loses 4px, while the text and the icons keep
   * their size.
   */
  compact?: boolean
}

const props = withDefaults(defineProps<AccordionProps>(), {
  multiple: false,
  variant: 'flat',
  expandIcon: () => expandMoreIcon,
  collapseIcon: undefined,
  compact: false,
})

defineSlots<{
  /** The `<VAccordionItem>`s that make up the group. */
  default(): unknown
}>()

const groupName = useId()
provide(accordionKey, {
  get name() {
    return props.multiple ? undefined : groupName
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
    --accordion-pad-delta: 0px;
    --accordion-pad-block: calc(var(--vectis-space-4) - var(--accordion-pad-delta));
    --accordion-pad-inline: calc(var(--vectis-space-5) - var(--accordion-pad-delta));
    --accordion-content-pad-start: calc(var(--vectis-space-2) - var(--accordion-pad-delta));

    font-family: var(--vectis-text-family);
  }

  /* Read by the first and last rows to round their hover. Without a frame there is no clip,
     so the rows carry the whole radius. */
  .v-accordion[data-variant='flat'] {
    --accordion-corner-radius: var(--vectis-radius-surface);
  }

  .v-accordion[data-compact] {
    --accordion-pad-delta: var(--vectis-space-1);
  }

  .v-accordion[data-variant='outlined'] {
    --accordion-corner-radius: calc(var(--vectis-radius-surface) - 1px);

    background: var(--vectis-color-surface-raised);
    border: 1px solid var(--vectis-color-border);
    border-radius: var(--vectis-radius-surface);
    /* The clip is what keeps the first and last rows' hover inside the rounded corners, so
       it belongs to the variant that HAS corners. `clip` and not `hidden`: `hidden` makes
       the box a scroll container, which captures every `position: sticky` in the content
       and pins it to the accordion instead of the page. */
    overflow: clip;
  }
}
</style>
