<script setup lang="ts">
import { provide, useId } from 'vue'

import type { IconSource } from '../VIcon/types'

import { accordionKey } from './context'

/**
 * An accordion is a stack of sections whose content the reader can show or hide,
 * one heading at a time. This component is built entirely on the native HTML
 * `<details>` and `<summary>` elements: the browser itself handles opening,
 * closing, the keyboard and the accessibility semantics, so there is no
 * JavaScript here keeping track of which section is currently open.
 *
 * In exclusive mode, opening one section automatically closes the others.
 */
interface AccordionProps {
  /**
   * Only one item may stay open at a time, so opening one closes the previous one.
   * The browser does this on its own once every item shares the same `<details>`
   * name. Set it to `false` to let the reader keep several sections open.
   */
  exclusive?: boolean
  /**
   * How the group is decorated. `flat`, the default, draws nothing and lets the
   * accordion sit directly on the surface behind it; `outlined` gives it a raised
   * background, a border and rounded corners, so it reads as a card.
   */
  variant?: 'flat' | 'outlined'
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
  exclusive: true,
  variant: 'flat',
  expandIcon: 'expand_more',
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
    --accordion-pad-delta: 0px;
    --accordion-pad-block: calc(var(--vectis-space-4) - var(--accordion-pad-delta));
    --accordion-pad-inline: calc(var(--vectis-space-5) - var(--accordion-pad-delta));
    --accordion-content-pad-start: calc(var(--vectis-space-2) - var(--accordion-pad-delta));

    font-family: var(--vectis-text-family);
    overflow: hidden;
  }

  .v-accordion[data-compact] {
    --accordion-pad-delta: var(--vectis-space-1);
  }

  .v-accordion[data-variant='outlined'] {
    --accordion-corner-radius: calc(var(--vectis-radius-surface) - 1px);

    background: var(--vectis-color-surface-raised);
    border: 1px solid var(--vectis-color-border);
    border-radius: var(--vectis-radius-surface);
  }
}
</style>
