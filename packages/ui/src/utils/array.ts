// @core
/**
 * Adds a value to a selection, or takes it out again if it is already there.
 *
 * ALWAYS returns a new list rather than mutating the one it was given: it is the new
 * reference, not a change made inside the old list, that wakes a consumer's v-model.
 */
export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}
