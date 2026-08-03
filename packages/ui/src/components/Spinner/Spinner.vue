<script setup lang="ts">
/**
 * Indicateur de chargement 100 % CSS. role="status" + libellé masqué :
 * annoncé par les lecteurs d'écran sans bruit visuel.
 *
 * Le `computed` de libellé est le seul JS : ce n'est pas du comportement (ni
 * événement, ni cycle de vie, ni DOM), mais le composant perd sa propriété
 * « zéro import » — précédent assumé d'Icon depuis son résolveur.
 */
import { computed } from 'vue'

import { useMessages } from '../../i18n/state'

interface SpinnerProps {
  /** Taille explicite en pixels (ex. :size="32"). Sans elle : 1em — le
   * spinner suit le texte du parent. */
  size?: number
  /** Libellé pour les lecteurs d'écran. Défaut : dictionnaire du DS. */
  label?: string
}

const props = withDefaults(defineProps<SpinnerProps>(), {
  size: undefined,
  label: undefined,
})

const m = useMessages()
// Cascade prop > dictionnaire : la prop garde la priorité (aucun breaking
// change), mais son défaut devient traduisible par `setLocale`.
const resolvedLabel = computed(() => props.label ?? m.value.common.loading)
</script>

<template>
  <span
    class="ds-spinner"
    :style="size !== undefined ? { '--spinner-size': `${size}px` } : undefined"
    role="status"
  >
    <span class="ds-spinner-circle" aria-hidden="true" />
    <span class="ds-visually-hidden">{{ resolvedLabel }}</span>
  </span>
</template>

<style>
@layer ds.components {
  .ds-spinner {
    /* 1em : le spinner suit le texte du parent (un consommateur le
       dimensionne par font-size, ex. Button pose font-size: var(--vectis-icon-size)
       sur sa boîte). La prop `size` pose --spinner-size en px inline et prime. */
    --spinner-size: 1em;
    display: inline-flex;
  }

  .ds-spinner-circle {
    width: var(--spinner-size);
    height: var(--spinner-size);
    /* épaisseur proportionnelle (ratio technique toléré, comme les
       opacités) : 16px → 2px, 24px → 3px ; plancher 1px aux très petites
       tailles */
    border: max(1px, calc(var(--spinner-size) / 8)) solid
      color-mix(in oklab, currentcolor, transparent 75%);
    border-block-start-color: currentcolor;
    border-radius: var(--vectis-radius-full);
    animation: ds-spin calc(var(--vectis-duration-slow) * 3.5) linear infinite;
  }

  /* La keyframe `ds-spin` est partagée (styles/utilities.css) : globale, donc
     hors layer et déclarée une seule fois pour tout le DS. */

  @media (prefers-reduced-motion: reduce) {
    .ds-spinner-circle {
      animation-duration: calc(var(--vectis-duration-slow) * 8);
    }
  }
}
</style>
