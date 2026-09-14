// @core
/**
 * A progress value normalized for VProgressLinear and VProgressCircular: the bound brought
 * back to zero or above, the value clamped into range, and its position in that range as a
 * 0-to-1 fraction and as a percentage. Everything either component draws comes from those —
 * the fill, the arc, the percentage written inside, the ARIA values.
 *
 * The bound is returned rather than left for each component to read off its prop: the value
 * is clamped against the NORMALIZED bound, so announcing the raw one would give assistive
 * technology a `aria-valuenow` above an `aria-valuemax` of -5.
 */

import { computed, type ComputedRef } from 'vue'
import { clamp } from '../utils/number'

export function useProgressValue(
  value: () => number,
  max: () => number,
): {
  max: ComputedRef<number>
  clamped: ComputedRef<number>
  fraction: ComputedRef<number>
  /** The fraction as a percentage, unrounded: what the default slot receives. */
  percent: ComputedRef<number>
  /** The percentage rounded to a whole number: what the component writes by default. */
  roundedPercent: ComputedRef<number>
} {
  const normalizedMax = computed(() => Math.max(max(), 0))
  const clamped = computed(() => clamp(value(), 0, normalizedMax.value))

  // The `|| 1` denominator is what keeps a max of 0 from dividing by nothing.
  const fraction = computed(() => clamped.value / (normalizedMax.value || 1))
  const percent = computed(() => fraction.value * 100)
  const roundedPercent = computed(() => Math.round(percent.value))

  return { max: normalizedMax, clamped, fraction, percent, roundedPercent }
}
