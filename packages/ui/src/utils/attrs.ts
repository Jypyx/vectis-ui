/**
 * Splits attributes between two elements: the listed keys go to `picked`, every other one to
 * `rest`. Each listed key is read even when absent, so a computed calling this re-runs when one
 * appears later: enumerating an empty attrs object tracks no reads.
 */
export function partitionAttrs(
  attrs: Record<string, unknown>,
  keys: readonly string[],
): { picked: Record<string, unknown>; rest: Record<string, unknown> } {
  for (const key of keys) void attrs[key]
  const picked: Record<string, unknown> = {}
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    ;(keys.includes(key) ? picked : rest)[key] = value
  }
  return { picked, rest }
}
