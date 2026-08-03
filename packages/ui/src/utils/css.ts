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

/**
 * Dimension à unité LIBRE : `12` donne `12px`, mais toute chaîne passe telle
 * quelle (`'100%'`, `'50vh'`, `'max-content'`). Contrairement à `px`, la chaîne
 * n'est pas interprétée — c'est au CSS de la valider, une valeur fautive
 * retombant sur la déclaration du composant.
 */
export function cssSize(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  return typeof v === 'number' ? `${v}px` : v
}
