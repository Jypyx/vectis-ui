// @core
/** Clamp to the lower bound when the interval is empty, as with the last index of an empty list. */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
