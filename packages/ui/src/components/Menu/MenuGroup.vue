<script setup lang="ts">
import { useId } from 'vue'

/**
 * Groupe d'items nommé (role="group" + aria-labelledby, pattern ARIA menu).
 * Le libellé n'est pas sélectionnable : simple texte hors roving focus.
 */
interface MenuGroupProps {
  /** Nom du groupe (non sélectionnable). */
  label: string
}

defineProps<MenuGroupProps>()

defineSlots<{
  /** Les MenuItem du groupe. */
  default(): unknown
}>()

const labelId = useId()
</script>

<template>
  <div role="group" class="ds-menu-group" :aria-labelledby="labelId">
    <span :id="labelId" class="ds-menu-group-label">{{ label }}</span>
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  .ds-menu-group {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-1);
  }

  /* Micro-label de section : rôle overline (sans capitales forcées — la casse
     du libellé appartient au consommateur). Le retrait suit celui des items
     (`--_control-padding-inline` héritée du panneau) pour rester aligné à
     toutes les tailles ; la typo, elle, ne suit pas l'échelle (rôle overline). */
  .ds-menu-group-label {
    padding: var(--ds-space-1) var(--_control-padding-inline);
    font-size: var(--ds-text-overline-size);
    font-weight: var(--ds-text-overline-weight);
    letter-spacing: var(--ds-text-overline-tracking);
    color: var(--ds-color-text-muted);
  }
}
</style>
