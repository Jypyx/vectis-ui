/**
 * Bascule une valeur dans une liste de sélection : la retire si présente, sinon
 * l'ajoute en fin. Retourne TOUJOURS un nouveau tableau — les v-model multiples
 * du DS ne mutent jamais en place (la nouvelle référence est ce qui réveille la
 * réactivité chez le consommateur).
 */
export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}
