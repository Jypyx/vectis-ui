<script setup lang="ts">
import { useId } from 'vue'

/**
 * Section nommée de la navigation. Le libellé n'est pas focusable : c'est du
 * texte, la liste qu'il coiffe est nommée par `aria-labelledby`.
 *
 * Pas de `role="group"` (contrairement à MenuGroup) : il ne peut pas être
 * enfant direct d'une `<ul>` sans casser ses *required owned elements*. Une
 * `<ul>` NOMMÉE dit la même chose, en HTML strictement valide — et un groupe
 * prend alors exactement la même forme qu'une branche.
 *
 * Un groupe ne compte PAS comme un niveau de hiérarchie : il ne déclare aucune
 * des deux variables du compteur de profondeur, que le niveau traverse intact.
 */
interface SideNavigationGroupProps {
  /** Nom de la section (le slot #label prime). */
  label: string
}

defineProps<SideNavigationGroupProps>()

defineSlots<{
  /** Les items de la section. */
  default(): unknown
  /** Nom riche (prime sur la prop `label`). */
  label?(): unknown
}>()

const labelId = useId()
</script>

<template>
  <li class="ds-side-nav-group">
    <span :id="labelId" class="ds-side-nav-group-label"
      ><slot name="label">{{ label }}</slot></span
    >
    <ul class="ds-side-nav-group-list" :aria-labelledby="labelId">
      <slot />
    </ul>
  </li>
</template>

<style>
@layer ds.components {
  .ds-side-nav-group + .ds-side-nav-group,
  .ds-side-nav-item + .ds-side-nav-group {
    margin-block-start: var(--ds-space-3);
  }

  /*
   * Micro-label de section : rôle overline (sans capitales forcées — la casse
   * du libellé appartient au consommateur). Retrait ET hauteur décalquent la
   * recette des rangées — l'en-tête tient la même hauteur qu'une rangée,
   * compact compris (`--_control-height` en dérive déjà), et le rythme vertical
   * de la liste ne casse pas ; seule la typo ne suit pas l'échelle (rôle
   * overline), d'où le centrage vertical.
   *
   * Le retrait redit le `calc` des rangées, délibérément : une custom property
   * est substituée sur l'élément qui la DÉCLARE, une variable partagée posée
   * plus haut serait figée au niveau 0 (précédent : le `--_chip-height` redit
   * du Combobox).
   */
  .ds-side-nav-group-label {
    display: flex;
    align-items: center;
    min-block-size: var(--_control-height);
    padding-block: var(--ds-space-1);
    padding-inline: calc(var(--_control-padding-inline) + var(--_level, 0) * var(--_indent))
      var(--_control-padding-inline);
    font-size: var(--ds-text-overline-size);
    font-weight: var(--ds-text-overline-weight);
    letter-spacing: var(--ds-text-overline-tracking);
    color: var(--ds-color-text-muted);
  }
}
</style>
