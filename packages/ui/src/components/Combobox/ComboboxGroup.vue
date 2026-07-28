<script setup lang="ts">
import { useId } from 'vue'

/**
 * Groupe nommé d'options (interne — rendu par `Combobox` à partir d'une entrée
 * `ComboboxGroup` de sa prop `options`, jamais écrit par le consommateur).
 *
 * `role="group"` est un enfant AUTORISÉ d'un `role="listbox"` (ARIA 1.2) : c'est
 * le pendant du `<optgroup>` natif. Le libellé n'est ni focusable ni
 * sélectionnable — la navigation clavier du Combobox indexe `filtered`, une
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
  <div role="group" class="ds-combobox-group" :aria-labelledby="labelId">
    <span :id="labelId" class="ds-combobox-group-label">{{ label }}</span>
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  /* `flex: none` (contrairement à `.ds-menu-group`) : le panneau du Combobox est
     un flex column borné (`max-block-size` + `overflow: auto`), un groupe s'y
     écraserait — même raison que `.ds-combobox-state` et `.ds-combobox-more`. */
  .ds-combobox-group {
    display: flex;
    flex: none;
    flex-direction: column;
    gap: var(--ds-space-1);
  }

  /* Micro-label de section : rôle overline (sans capitales forcées — la casse
     du libellé appartient au consommateur). Le retrait suit celui des options
     (`--_control-padding-inline` héritée du panneau) pour rester aligné à
     toutes les tailles ; la typo, elle, ne suit pas l'échelle (rôle overline). */
  .ds-combobox-group-label {
    padding: var(--ds-space-1) var(--_control-padding-inline);
    font-size: var(--ds-text-overline-size);
    font-weight: var(--ds-text-overline-weight);
    letter-spacing: var(--ds-text-overline-tracking);
    color: var(--ds-color-text-muted);
  }
}
</style>
