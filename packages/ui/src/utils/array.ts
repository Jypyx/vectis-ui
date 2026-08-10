// @core
/**
 * Toggles a value in a selection list: removes it if present, otherwise appends
 * it. ALWAYS returns a new array — the DS's multiple v-models never mutate in
 * place (the new reference is what wakes reactivity in the consumer).
 */
export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}
