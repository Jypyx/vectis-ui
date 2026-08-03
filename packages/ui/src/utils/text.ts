/**
 * Forme de comparaison d'un texte : insensible à la casse ET aux accents
 * (décomposition NFD puis retrait des diacritiques). Utilisée partout où le DS
 * filtre une liste sur une saisie utilisateur — « e » doit trouver « é ».
 */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/** Entier sur deux chiffres (`7` → `'07'`) — composantes de date et d'heure. */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Chiffres d'un texte. Helper purement lexical, sans domaine : les masques de
 * saisie du DS (date du VDatePicker, heure du VTimePicker) ne connaissent que la
 * suite de chiffres, jamais les séparateurs, qu'ils posent eux-mêmes.
 */
export const digitsOf = (text: string): string => text.replace(/\D/g, '')
