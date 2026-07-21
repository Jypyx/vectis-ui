<script setup lang="ts">
/**
 * Indicateur de chargement 100 % CSS. role="status" + libellé masqué :
 * annoncé par les lecteurs d'écran sans bruit visuel.
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  /** Libellé pour les lecteurs d'écran. */
  label?: string
}

withDefaults(defineProps<SpinnerProps>(), {
  size: 'md',
  label: 'Chargement…',
})
</script>

<template>
  <span class="ds-spinner" :data-size="size" role="status">
    <span class="ds-spinner-circle" aria-hidden="true" />
    <span class="ds-visually-hidden">{{ label }}</span>
  </span>
</template>

<style>
@layer ds.components {
  .ds-spinner {
    display: inline-flex;
  }

  .ds-spinner-circle {
    --_size: var(--ds-space-6);
    width: var(--_size);
    height: var(--_size);
    border: 2px solid color-mix(in oklab, currentcolor, transparent 75%);
    border-block-start-color: currentcolor;
    border-radius: var(--ds-radius-full);
    /* durée dérivée d'un token plutôt qu'une valeur brute */
    animation: ds-spin calc(var(--ds-duration-slow) * 2.5) linear infinite;
  }

  .ds-spinner[data-size='sm'] .ds-spinner-circle {
    --_size: var(--ds-space-4);
  }

  .ds-spinner[data-size='lg'] .ds-spinner-circle {
    --_size: var(--ds-space-7);
    border-width: 3px;
  }

  /* Même définition que dans Button.vue : les keyframes CSS sont globales,
     la double déclaration (identique) rend chaque fichier autonome. */
  @keyframes ds-spin {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-spinner-circle {
      animation-duration: calc(var(--ds-duration-slow) * 8);
    }
  }
}
</style>
