// @core
/**
 * Holds a number between a lower and an upper bound.
 *
 * When the two bounds cross over — which happens as soon as the upper one is worked out
 * from something empty, the last position of a list with nothing in it being one short of
 * the first — the LOWER bound wins. It is the one that is always a position something can
 * sit at.
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
