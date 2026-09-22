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

  // The `|| 1` denominator is what keeps a max of 0 from dividing by nothing.
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
