import { computed, type ComputedRef } from 'vue'
import { clamp } from '../utils/number'

/**
 * Normalized value of a progress indicator, shared by VProgressLinear and
 * VProgressCircular: their entire rendering (fill, dash-offset, text, ARIA)
 * derives from these two values.
 */
export function useProgressValue(
  value: () => number,
  max: () => number,
): { clamped: ComputedRef<number>; fraction: ComputedRef<number> } {
  const clamped = computed(() => clamp(value(), 0, Math.max(max(), 0)))

  /** Fraction [0, 1] driving the whole rendering. `max || 1` neutralizes max: 0. */
  const fraction = computed(() => clamped.value / (max() || 1))

  return { clamped, fraction }
}
