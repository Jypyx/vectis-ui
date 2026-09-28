// @core
/** Resolve matchers once in a computed value so repeated cell lookups reuse the compiled Set. */
export function resolveMatcher<T>(
  matcher: readonly T[] | ((value: T) => boolean) | undefined,
): (value: T) => boolean {
  if (!matcher) return () => false
  if (typeof matcher === 'function') return matcher
  const set = new Set(matcher)
  return (value: T) => set.has(value)
}
