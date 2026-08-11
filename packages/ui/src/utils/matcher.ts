// @core
/**
 * Turns any of the design system's "which entries are unavailable" props into a
 * single function to ask. Those props — `disabledDates`, `disabledPages` and their
 * kind — accept either a LIST of the values concerned or a FUNCTION deciding for
 * each one, and this is what lets the components stop caring which of the two they
 * were handed.
 *
 * It is meant to be resolved ONCE, inside a `computed`, and not called afresh for
 * every value: a list is converted into a `Set` here, so each lookup is then
 * immediate, where an `includes` would walk the whole list again for every cell on
 * screen.
 */
export function resolveMatcher<T>(
  matcher: readonly T[] | ((value: T) => boolean) | undefined,
): (value: T) => boolean {
  if (!matcher) return () => false
  if (typeof matcher === 'function') return matcher
  const set = new Set(matcher)
  return (value: T) => set.has(value)
}
