<script setup lang="ts">
import { computed } from 'vue'

/**
 * Aucune primitive native pour un progrès circulaire : SVG piloté par CSS
 * (pathLength=100 → stroke-dasharray en %). Le JS se limite à normaliser la
 * valeur et au contrat ARIA progressbar. La custom property inline est la
 * seule liaison de style autorisée (règle projet : custom properties only).
 */
interface ProgressCircularProps {
  /** Valeur courante ; absente = indéterminé (rotation continue). */
  value?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  /** Nom accessible. */
  label?: string
}

const props = withDefaults(defineProps<ProgressCircularProps>(), {
  value: undefined,
  max: 100,
  size: 'md',
  label: undefined,
})

const percent = computed(() => {
  if (props.value === undefined) return undefined
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})
</script>

<template>
  <span
    class="ds-progress-circular"
    role="progressbar"
    :data-size="size"
    :data-indeterminate="percent === undefined ? '' : undefined"
    :aria-valuenow="percent === undefined ? undefined : Math.round(percent)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label"
    :style="{ '--ds-progress-value': String(percent ?? 25) }"
  >
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle class="ds-progress-circular-track" cx="20" cy="20" r="17" pathLength="100" />
      <circle class="ds-progress-circular-bar" cx="20" cy="20" r="17" pathLength="100" />
    </svg>
  </span>
</template>

<style>
@layer ds.components {
  .ds-progress-circular {
    --_size: var(--ds-control-size-progress-circular-md);
    display: inline-flex;
    width: var(--_size);
    height: var(--_size);
  }

  .ds-progress-circular svg {
    width: 100%;
    height: 100%;
    /* départ à midi */
    rotate: -90deg;
  }

  .ds-progress-circular-track,
  .ds-progress-circular-bar {
    fill: none;
    stroke-width: 4;
  }

  .ds-progress-circular-track {
    stroke: var(--ds-color-surface-muted);
  }

  .ds-progress-circular-bar {
    stroke: var(--ds-color-accent);
    stroke-linecap: round;
    stroke-dasharray: var(--ds-progress-value) 100;
    transition: stroke-dasharray var(--ds-duration-base) var(--ds-ease-default);
  }

  .ds-progress-circular[data-indeterminate] svg {
    animation: ds-spin calc(var(--ds-duration-slow) * 3) linear infinite;
  }

  .ds-progress-circular[data-size='sm'] {
    --_size: var(--ds-control-size-progress-circular-sm);
  }

  .ds-progress-circular[data-size='lg'] {
    --_size: var(--ds-control-size-progress-circular-lg);
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-progress-circular-bar {
      transition: none;
    }

    .ds-progress-circular[data-indeterminate] svg {
      animation-duration: calc(var(--ds-duration-slow) * 10);
    }
  }
}
</style>
