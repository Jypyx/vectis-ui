// @core
/**
 * Adds a value to a selection or takes it out again, depending on whether it is already
 * there.
 *
 * It ALWAYS hands back a new list rather than changing the one it was given. Every
 * multiple-choice value in the design system works this way: it is the arrival of a new
 * list, not a change made inside the old one, that tells the surrounding application
 * something has happened.
 */
export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}
