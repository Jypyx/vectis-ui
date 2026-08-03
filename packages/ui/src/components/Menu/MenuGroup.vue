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
    gap: var(--vectis-space-1);
  }

  /* Micro-label de section : rôle overline (sans capitales forcées — la casse
     du libellé appartient au consommateur). Retrait ET hauteur décalquent la
     recette des items (`--control-padding-inline` et `--control-height`
     héritées du panneau) : l'en-tête tient la même hauteur qu'une rangée,
     compact compris, et le rythme vertical de la liste ne casse pas. Seule la
     typo ne suit pas l'échelle (rôle overline), d'où le centrage vertical. */
  .ds-menu-group-label {
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
