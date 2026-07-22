<script setup lang="ts">
/**
 * <progress> natif stylé : sémantique, ARIA et état indéterminé (absence de
 * value → :indeterminate) gratuits. Aucun JS. Nom accessible : passer
 * aria-label (fallthrough).
 */
interface ProgressLinearProps {
  /** Valeur courante ; absente = indéterminé (animation). */
  value?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<ProgressLinearProps>(), {
  value: undefined,
  max: 100,
  size: 'md',
})
</script>

<template>
  <progress class="ds-progress" :value="value" :max="max" :data-size="size" />
</template>

<style>
@layer ds.components {
  .ds-progress {
    appearance: none;
    width: 100%;
    height: var(--ds-control-size-progress-linear-md);
    border: none;
    border-radius: var(--ds-radius-full);
    overflow: hidden;
    /* piste (Firefox utilise le background de l'élément) */
    background: var(--ds-color-surface-muted);
  }

  .ds-progress::-webkit-progress-bar {
    background: var(--ds-color-surface-muted);
    border-radius: var(--ds-radius-full);
  }

  .ds-progress::-webkit-progress-value {
    background: var(--ds-color-accent);
    border-radius: var(--ds-radius-full);
    transition: inline-size var(--ds-duration-base) var(--ds-ease-default);
  }

  .ds-progress::-moz-progress-bar {
    background: var(--ds-color-accent);
    border-radius: var(--ds-radius-full);
  }

  /* Indéterminé : bande animée sur le fond de l'élément, barres neutralisées */
  .ds-progress:indeterminate {
    background-image: linear-gradient(to right, transparent, var(--ds-color-accent), transparent);
    background-size: 40% 100%;
    background-repeat: no-repeat;
    animation: ds-progress-slide calc(var(--ds-duration-slow) * 4) var(--ds-ease-default) infinite;
  }

  .ds-progress:indeterminate::-webkit-progress-bar {
    background: transparent;
  }

  .ds-progress:indeterminate::-moz-progress-bar {
    background: transparent;
  }

  @keyframes ds-progress-slide {
    from {
      background-position-x: 0%;
    }

    to {
      background-position-x: 100%;
    }
  }

  .ds-progress[data-size='sm'] {
    height: var(--ds-control-size-progress-linear-sm);
  }

  .ds-progress[data-size='lg'] {
    height: var(--ds-control-size-progress-linear-lg);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-progress::-webkit-progress-value {
      transition: none;
    }

    .ds-progress:indeterminate {
      animation-duration: calc(var(--ds-duration-slow) * 12);
    }
  }
}
</style>
