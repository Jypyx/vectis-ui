// @core
/**
 * The DS convention for "which entries are disabled" props: either an ARRAY of
 * values or a PREDICATE (`disabledDates`, `disabledPages`…).
 *
 * Resolve once and for all (inside a `computed`) rather than on every call: the
 * array becomes a `Set`, hence constant-time membership where an `includes`
 * would be re-scanned linearly for every rendered cell.
 */
export function resolveMatcher<T>(
  matcher: readonly T[] | ((value: T) => boolean) | undefined,
): (value: T) => boolean {
  if (!matcher) return () => false
  if (typeof matcher === 'function') return matcher
  const set = new Set(matcher)
  return (value: T) => set.has(value)
}
