<script setup lang="ts">
// @a11y @ssr — the whole script is a single generated id, and it exists only to tie
// the group to its own label. It matches between server and client by construction,
// Vue's `useId` guaranteeing exactly that.
/**
 * A named section inside a menu — "Sort by", "Recent files". The name is announced as
 * the group's label rather than being read as one more item, and it is plain text: it
 * cannot be chosen, and the arrow keys walk straight past it.
 */

import { useId } from 'vue'

interface MenuGroupProps {
  /** The name of the section. It is a heading, not a command: nothing happens on click. */
  label: string
}

defineProps<MenuGroupProps>()

defineSlots<{
  /** The commands belonging to this section. */
  default(): unknown
}>()

const labelId = useId()
</script>

<template>
  <div role="group" class="v-menu-group" :aria-labelledby="labelId">
    <span :id="labelId" class="v-menu-group-label">{{ label }}</span>
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  .v-menu-group {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-1);
  }

  /* The section heading takes the overline type role, without forcing capitals: how
     the label is written is the consumer's decision.

     Its indent and its height are the rows' own recipe, read from the same inherited
     variables, so a heading occupies exactly the height of a row — compact included —
     and the vertical rhythm of the list is not broken by it. The type is the one thing
     staying outside that scale, which is why the text has to be centred vertically by
     hand. */
  .v-menu-group-label {
    display: flex;
    align-items: center;
    min-height: var(--control-height);
    padding: var(--vectis-space-1) var(--control-padding-inline);
    font-size: var(--vectis-text-overline-size);
    font-weight: var(--vectis-text-overline-weight);
    letter-spacing: var(--vectis-text-overline-tracking);
    color: var(--vectis-color-text-muted);
  }
}
</style>
