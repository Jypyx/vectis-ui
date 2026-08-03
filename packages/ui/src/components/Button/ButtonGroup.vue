<script setup lang="ts">
/**
 * Rattache visuellement plusieurs Button/IconButton en un contrôle segmenté :
 * bordures fusionnées, coins arrondis aux seules extrémités du groupe. Tout est
 * en CSS (aucun provide/inject) — chaque bouton garde ses propres props ; poser
 * les mêmes variant/tone/size sur les enfants donne un rendu cohérent.
 */
interface ButtonGroupProps {
  /** Sens du rattachement. Défaut horizontal. */
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<ButtonGroupProps>(), {
  orientation: 'horizontal',
})

defineSlots<{
  /** Les Button/IconButton à rattacher. */
  default(): unknown
}>()
</script>

<template>
  <!-- La racine EST le div : aria-label / role="toolbar" custom tombent dessus par fallthrough. -->
  <div class="ds-button-group" role="group" :data-orientation="orientation">
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  .ds-button-group {
    display: inline-flex;
    /* hauteurs (horizontal) ou largeurs (vertical) égalisées entre segments */
    align-items: stretch;
  }

  .ds-button-group[data-orientation='vertical'] {
    flex-direction: column;
  }

  /* Collapse la bordure 1px partagée (margin négatif) et pose une couture neutre
     qui matérialise la séparation pour les variantes pleines (bordure
     transparente) et uniformise la jointure des variantes outline. Chaque bloc
     est scopé à son orientation : sinon les règles horizontales zéroïseraient
     aussi les coins et bordures latérales en mode vertical. */
  .ds-button-group[data-orientation='horizontal'] > .ds-button:not(:first-child) {
    margin-inline-start: -1px;
    border-inline-start-color: var(--vectis-color-border);
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  .ds-button-group[data-orientation='horizontal'] > .ds-button:not(:last-child) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  .ds-button-group[data-orientation='vertical'] > .ds-button:not(:first-child) {
    margin-block-start: -1px;
    border-block-start-color: var(--vectis-color-border);
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }

  .ds-button-group[data-orientation='vertical'] > .ds-button:not(:last-child) {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  /* Le bouton survolé/focus/actif remonte au-dessus des voisins : sinon sa
     bordure teintée et son focus-ring sont rognés par le segment adjacent. */
  .ds-button-group > .ds-button:hover,
  .ds-button-group > .ds-button:focus-visible,
  .ds-button-group > .ds-button:active {
    z-index: 1;
  }
}
</style>
