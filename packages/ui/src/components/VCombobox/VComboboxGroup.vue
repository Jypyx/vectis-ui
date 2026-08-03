<script setup lang="ts">
import { useId } from 'vue'

/**
 * Groupe nommé d'options (interne — rendu par `VCombobox` à partir d'une entrée
 * `ComboboxGroup` de sa prop `options`, jamais écrit par le consommateur).
 *
 * `role="group"` est un enfant AUTORISÉ d'un `role="listbox"` (ARIA 1.2) : c'est
 * le pendant du `<optgroup>` natif. Le libellé n'est ni focusable ni
 * sélectionnable — la navigation clavier du VCombobox indexe `filtered`, une
 * liste plate d'options, et ne voit donc jamais ce nœud.
 */
interface ComboboxGroupProps {
  /** Nom du groupe (non sélectionnable). */
  label: string
}

defineProps<ComboboxGroupProps>()

defineSlots<{
  /** Les options du groupe. */
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
  /* `flex: none` (contrairement à `.v-menu-group`) : le panneau du VCombobox est
     un flex column borné (`max-block-size` + `overflow: auto`), un groupe s'y
     écraserait — même raison que `.v-combobox-state` et `.v-combobox-more`. */
  .v-combobox-group {
    display: flex;
    flex: none;
    flex-direction: column;
    gap: var(--vectis-space-1);
  }

  /* Micro-label de section : rôle overline (sans capitales forcées — la casse
     du libellé appartient au consommateur). Retrait ET hauteur décalquent la
     recette des options (`--control-padding-inline` et `--control-height`
     héritées du panneau) : l'en-tête tient la même hauteur qu'une rangée,
     compact compris, et le rythme vertical de la liste ne casse pas. Seule la
     typo ne suit pas l'échelle (rôle overline), d'où le centrage vertical. */
  .v-combobox-group-label {
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
