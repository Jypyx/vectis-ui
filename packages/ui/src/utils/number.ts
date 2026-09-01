// @core
/**
 * Holds a number between a lower and an upper bound.
 *
 * On an empty interval the LOWER bound wins, which is deliberate: `max` is often derived
 * from a list, and an empty one puts its last position one short of its first. The lower
 * bound is the one that is always somewhere a value can sit.
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
