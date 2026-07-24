// @core
/**
 * The form of a text used for COMPARING it: capitals and accents no longer count.
 *
 * The accents are removed by pulling each letter apart into the plain letter and the mark
 * above it, then dropping the marks. This is used wherever the design system matches a
 * list against what someone has typed — searching for "e" must find "é", since nobody
 * expects to have to reach for the right accent to find a name.
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
 * Just the digits of a text, everything else thrown away.
 *
 * It knows nothing of dates or of times, and that is why it lives among the text helpers
 * rather than with either of them: the fields one types a date or a time into only ever
 * deal in the run of digits, and place the separators between them themselves.
 */
export const digitsOf = (text: string): string => text.replace(/\D/g, '')
