/**
 * Convention du DS pour les props « quelles entrées sont désactivées » :
 * un TABLEAU de valeurs ou un PRÉDICAT (`disabledDates`, `disabledPages`…).
 *
 * Résoudre une fois pour toutes (dans un `computed`) plutôt qu'à chaque appel :
 * le tableau devient un `Set`, donc une appartenance en temps constant là où un
 * `includes` serait relu linéairement pour chaque cellule rendue.
 */
export function resolveMatcher<T>(
  matcher: readonly T[] | ((value: T) => boolean) | undefined,
): (value: T) => boolean {
  if (!matcher) return () => false
  if (typeof matcher === 'function') return matcher
  const set = new Set(matcher)
  return (value: T) => set.has(value)
}
