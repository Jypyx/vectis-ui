// @core
/**
 * Turns the design system's "which entries are unavailable" props — `disabledDates`,
 * `disabledPages` and their kind, each accepting a list OR a predicate — into one
 * function to ask, so components need not care which they were handed.
 *
 * Resolve it ONCE inside a `computed`, never per value: the list becomes a `Set` here, so
 * each lookup is immediate where an `includes` would rescan it for every cell on screen.
 */
export function resolveMatcher<T>(
  matcher: readonly T[] | ((value: T) => boolean) | undefined,
): (value: T) => boolean {
  if (!matcher) return () => false
  if (typeof matcher === 'function') return matcher
  const set = new Set(matcher)
  return (value: T) => set.has(value)
}
