<script setup lang="ts">
/**
 * A named block of options inside a VCombobox's list. It is internal: the component
 * renders it from the entries of its own options prop, and a consumer never writes it.
 *
 * A block of this kind is one of the two things a list is allowed to contain — it is the
 * equivalent of the grouping a native list offers. Its name can be neither focused nor
 * chosen: the keyboard counts through the flat list of options and therefore never
 * encounters this element at all.
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
    <span :id="labelId" class="v-combobox-group-label v-group-label">{{ label }}</span>
    <slot />
  </div>
</template>

<style>
@layer vectis.components {
  /* It refuses to shrink, where a menu group has no need to: this panel is a column of
     bounded height that scrolls, and a block left free to shrink would be squashed to
     make its content fit — the same reason the state rows and the foot of the list refuse
     it too. */
  .v-combobox-group {
    display: flex;
    flex: none;
    flex-direction: column;
    gap: var(--vectis-space-1);
  }
}
</style>
