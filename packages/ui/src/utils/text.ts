// @core
/** Remove NFD combining marks for accent-insensitive matching. */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// @core
/**
 * A memory of `normalizeText` results, filed under the object a text belongs to: a table row, a
 * combobox option, and under a field name when one object holds several texts.
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
/** Just the digits of a string, everything else dropped. */
export const digitsOf = (text: string): string => text.replace(/\D/g, '')
