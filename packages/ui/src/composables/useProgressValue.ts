import { computed, type ComputedRef } from 'vue'
import { clamp } from '../utils/number'

// @core
/**
 * Brings a progress value into line, for the bar and the ring alike.
 *
 * It returns two things: the value itself, held inside the range it is allowed to take,
 * and how far along that range it sits, as a number between nothing and one. Everything
 * both components draw comes from those two — how much of the bar is filled, how much of
 * the ring is drawn, the percentage written out, and what a screen reader announces.
 */
export function useProgressValue(
  value: () => number,
  max: () => number,
): { clamped: ComputedRef<number>; fraction: ComputedRef<number> } {
  const clamped = computed(() => clamp(value(), 0, Math.max(max(), 0)))

  /**
   * How far along, from 0 to 1 — the number every part of the rendering is driven by.
   * The fallback denominator is what keeps a maximum of zero from dividing by nothing.
   */
  const fraction = computed(() => clamped.value / (max() || 1))

  return { clamped, fraction }
}
