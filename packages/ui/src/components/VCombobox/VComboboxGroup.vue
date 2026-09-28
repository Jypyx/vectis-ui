<script setup lang="ts">
/**
 * Group generated options under their accessible label; groups and options are the listbox's
 * permitted children.
 */

import { useId } from 'vue'

interface ComboboxGroupProps {
  /** The name of the block. It is a heading, not something that can be chosen. */
  label: string
}

defineProps<ComboboxGroupProps>()

defineSlots<{
  /** The options belonging to this block. */
  default(): unknown
}>()

const labelId = useId()
</script>

<template>
  <div role="group" class="v-combobox-group" :aria-labelledby="labelId">
    <span :id="labelId" class="v-combobox-group-label">{{ label }}</span>
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * It refuses to shrink, where a menu group has no need to: this panel is a column of bounded
   * height that scrolls, and a block left free to shrink would be squashed to make its content
   * fit; the same reason the state rows and the foot of the list refuse it too.
   */
  .v-combobox-group {
    display: flex;
    flex: none;
    flex-direction: column;
    gap: var(--vectis-space-1);
  }

  .v-combobox-group-label {
    display: flex;
    align-items: center;
    min-block-size: var(--control-height);
    padding-block: var(--vectis-space-1);
    padding-inline: var(--control-padding-inline);
    font-size: var(--vectis-text-overline-size);
    font-weight: var(--vectis-text-overline-weight);
    letter-spacing: var(--vectis-text-overline-tracking);
    color: var(--vectis-color-text-muted);
  }
}
</style>
