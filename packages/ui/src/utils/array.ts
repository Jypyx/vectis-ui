// @core
/**
 * Toggle membership without mutating the input; returning a new reference propagates selection
 * changes through v-model.
 */
export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}
