/**
 * Dimensions toujours en pixels : `12` comme `'12'` donnent `12px`. Une valeur
 * non numérique retourne undefined plutôt qu'une custom property invalide, qui
 * casserait la géométrie au lieu de retomber sur le token.
 */
export function px(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  const n = typeof v === 'number' ? v : Number.parseFloat(v)
  return Number.isFinite(n) ? `${n}px` : undefined
}
