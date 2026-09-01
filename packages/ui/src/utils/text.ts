// @core
/**
 * The form of a text used for COMPARING it: case and accents no longer count.
 *
 * NFD splits each letter into the plain letter and its mark, and the marks are dropped.
 * Used wherever the library matches a list against what someone typed: searching "e" has
 * to find "é", nobody reaching for the right accent to find a name.
 */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// @core
/** A whole number written on two digits, so that 7 becomes "07" — as dates and times are. */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

// @core
/**
 * Just the digits of a string, everything else dropped.
 *
 * It knows nothing of dates or times, which is why it lives here rather than with either:
 * the masked fields only ever handle the run of digits and place the separators themselves.
 */
export const digitsOf = (text: string): string => text.replace(/\D/g, '')
