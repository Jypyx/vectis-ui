// @core
/**
 * Clamps `n` to the `[min, max]` interval. On an empty interval (`min > max`,
 * which a derived `max` can produce — `list.length - 1` on an empty list), `min`
 * wins: the lower bound is always a valid position.
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
