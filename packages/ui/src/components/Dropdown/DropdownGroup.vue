<script setup lang="ts">
import { useId } from 'vue'

/**
 * Groupe d'items nommé (role="group" + aria-labelledby, pattern ARIA menu).
 * Le libellé n'est pas sélectionnable : simple texte hors roving focus.
 */
interface DropdownGroupProps {
  /** Nom du groupe (non sélectionnable). */
  label: string
}

defineProps<DropdownGroupProps>()

defineSlots<{
  /** Les DropdownItem du groupe. */
  default(): unknown
}>()

const labelId = useId()
</script>

<template>
  <div role="group" class="ds-dropdown-group" :aria-labelledby="labelId">
    <span :id="labelId" class="ds-dropdown-group-label">{{ label }}</span>
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  .ds-dropdown-group {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-1);
  }

  .ds-dropdown-group-label {
    padding: var(--ds-space-1) var(--ds-space-3);
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-medium);
    color: var(--ds-color-text-muted);
  }
}
</style>
