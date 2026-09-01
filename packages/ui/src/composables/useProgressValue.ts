// @core
/**
 * A progress value normalized for VProgressLinear and VProgressCircular: the value clamped
 * into range, and its position in that range as a 0-to-1 fraction. Everything either
 * component draws comes from those two — the fill, the arc, the percentage, the ARIA value.
 */

import { computed, type ComputedRef } from 'vue'
import { clamp } from '../utils/number'

export function useProgressValue(
  value: () => number,
  max: () => number,
): { clamped: ComputedRef<number>; fraction: ComputedRef<number> } {
  const clamped = computed(() => clamp(value(), 0, Math.max(max(), 0)))

  // The `|| 1` denominator is what keeps a max of 0 from dividing by nothing.
  const fraction = computed(() => clamped.value / (max() || 1))

  return { clamped, fraction }
}
