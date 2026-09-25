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
/**
 * A memory of `normalizeText` results, filed under the object a text belongs to: a table row,
 * a combobox option, and under a field name when one object holds several texts.
 *
 * A filter normalizes the whole list again on every keystroke, and normalizing decomposes,
 * strips and lowercases each string: this is what makes the second keystroke cost a lookup.
 *
 * The raw text is passed on EVERY call and compared with the one remembered, rather than the
 * list being derived once: that is what notices a label edited in place, which a value keyed
 * on the list alone would not. And the memory is a `WeakMap` keyed by the owner, so replacing
 * the list lets the old entries be collected with no invalidation written anywhere.
 */
export function createNormalizedCache<K extends object>() {
  const cache = new WeakMap<K, Map<string, { raw: string; normalized: string }>>()
  return (owner: K, raw: string, field = ''): string => {
    let texts = cache.get(owner)
    if (!texts) {
      texts = new Map()
      cache.set(owner, texts)
    }
    const hit = texts.get(field)
    if (hit && hit.raw === raw) return hit.normalized
    const normalized = normalizeText(raw)
    texts.set(field, { raw, normalized })
    return normalized
  }
}

// @core
/** A whole number written on two digits, so that 7 becomes "07": as dates and times are. */
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
