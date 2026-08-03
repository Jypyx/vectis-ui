import { computed, type ComputedRef } from 'vue'
import { clamp } from '../utils/number'

/**
 * Valeur normalisée d'une barre de progression, partagée par VProgressLinear et
 * VProgressCircular : tout leur rendu (remplissage, dash-offset, texte, ARIA)
 * dérive de ces deux valeurs.
 */
export function useProgressValue(
  value: () => number,
  max: () => number,
): { clamped: ComputedRef<number>; fraction: ComputedRef<number> } {
  const clamped = computed(() => clamp(value(), 0, Math.max(max(), 0)))

  /** Fraction [0, 1] pilotant tout le rendu. `max || 1` neutralise max: 0. */
  const fraction = computed(() => clamped.value / (max() || 1))

  return { clamped, fraction }
}
