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
  /**
   * The name of the section, replaced by the `#label` slot. One of the two is REQUIRED:
   * it is what names the group, and a section named by neither points its
   * `aria-labelledby` at an empty element. It is a heading, not a command: nothing
   * happens on click.
   */
  label?: string
}

withDefaults(defineProps<MenuGroupProps>(), {
  label: undefined,
})

defineSlots<{
  /** The commands belonging to this section. */
  default(): unknown
  /** A name made of markup, replacing the `label` prop. */
  label?(): unknown
}>()

const labelId = useId()
</script>

<template>
  <div role="group" class="v-menu-group" :aria-labelledby="labelId">
    <span :id="labelId" class="v-menu-group-label v-group-label"
      ><slot name="label">{{ label }}</slot></span
    >
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
}
</style>
