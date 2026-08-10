// @core
/**
 * Comparison form of a text: insensitive to case AND to accents (NFD
 * decomposition, then diacritics removed). Used everywhere the DS filters a list
 * against user input — "e" must find "é".
 */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// @core
/** Two-digit integer (`7` → `'07'`) — date and time components. */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

// @core
/**
 * The digits of a text. A purely lexical helper, with no domain: the DS's input
 * masks (VDatePicker's date, VTimePicker's time) only ever know the digit run,
 * never the separators, which they place themselves.
 */
export const digitsOf = (text: string): string => text.replace(/\D/g, '')
