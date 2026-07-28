/**
 * Borne `n` à l'intervalle `[min, max]`. Sur un intervalle vide (`min > max`,
 * qu'un `max` dérivé peut produire — `list.length - 1` sur une liste vide),
 * c'est `min` qui gagne : la borne basse est toujours une position valide.
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
