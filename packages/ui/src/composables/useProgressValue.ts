// @core
/**
 * Normalize finite bounds and values once so CSS, slot text and progressbar ARIA all describe
 * the same range.
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
  /* A value computed by the consumer (`loaded / total * 100` before `total` is known) can
     be NaN, which `clamp` and `Math.max` both hand back unchanged: it would reach
     `aria-valuenow` and the text as the word "NaN". A value that is not a number is read as
     no progress, and a bound that is not a finite number as the default of 100. */
  const normalizedMax = computed(() => {
    const bound = max()
    return Number.isFinite(bound) ? Math.max(bound, 0) : 100
  })
  const clamped = computed(() => {
    const current = value()
    return Number.isNaN(current) ? 0 : clamp(current, 0, normalizedMax.value)
  })

  const fraction = computed(() => clamped.value / (normalizedMax.value || 1))
  const percent = computed(() => fraction.value * 100)
  /* Rounded to the nearest whole number, except at the two ends: "100%" is written only
     once the work is complete and "0%" only while nothing has been done, so 99.6 reads 99%
     and 0.4 reads 1%. A plain round would announce a finished task that is still running. */
  const roundedPercent = computed(() => {
    const p = percent.value
    return p <= 0 || p >= 100 ? Math.round(p) : clamp(Math.round(p), 1, 99)
  })

  return { max: normalizedMax, clamped, fraction, percent, roundedPercent }
}
