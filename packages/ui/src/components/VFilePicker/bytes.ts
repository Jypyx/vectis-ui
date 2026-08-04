/**
 * Human-readable file sizes, localized. The DS boundary applies as-is: the FORMAT
 * comes from `Intl` (which already gives "1.2 MB" in English and "1,2 Mo" in
 * French, unit included), the WORDS around it from the dictionary. Nothing here
 * is translatable.
 *
 * SI ladder, base **1000**, because that is exactly what Intl's sanctioned unit
 * names mean — a kilobyte is 1000 bytes. Mixing in the 1024 base would print
 * "1.02 kB" for a 1024-byte file, a discrepancy with no possible explanation for
 * the user.
 *
 * Pure, no Vue: a single consumer, so it stays in the component's folder rather
 * than in `utils/` (the `VHotkeys/platform.ts` precedent). Promote it the day a
 * second one appears.
 */

/** The Intl-sanctioned byte units, in ascending order — the ladder's rungs. */
const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const

/**
 * `Intl.NumberFormat` construction is the expensive part, and a counter
 * re-renders on every added file: one instance per (locale, rung) pair, kept for
 * the lifetime of the module.
 */
const formatters = new Map<string, Intl.NumberFormat>()

/** Bytes are whole; above that a single decimal is what reads as a size. */
const digitsFor = (step: number) => (step === 0 ? 0 : 1)

function formatterFor(locale: string, step: number): Intl.NumberFormat {
  const key = `${locale}|${step}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: UNITS[step]!,
      unitDisplay: 'short',
      maximumFractionDigits: digitsFor(step),
    })
    formatters.set(key, formatter)
  }
  return formatter
}

/**
 * Formats a byte count for display: `formatBytes(1_200_000, 'en-US')` → `1.2 MB`,
 * `formatBytes(1_200_000, 'fr-FR')` → `1,2 Mo`.
 *
 * A negative, NaN or infinite input falls back to 0 rather than producing a
 * nonsensical size: the value comes from `File.size`, and a counter must never
 * be the thing that breaks.
 */
export function formatBytes(bytes: number, locale: string): string {
  const n = Number.isFinite(bytes) && bytes > 0 ? bytes : 0

  let step = n === 0 ? 0 : Math.min(UNITS.length - 1, Math.max(0, Math.floor(Math.log10(n) / 3)))
  let value = n / 1000 ** step

  /*
   * The carry. 999 999 B lands on the kilobyte rung and ROUNDS to 1000 at one
   * decimal: the ladder and the rounding must agree, or the output reads
   * "1,000 kB". Round first, step up second — the reverse order lets the same
   * discrepancy through one rung higher.
   */
  const rounded = Math.round(value * 10 ** digitsFor(step)) / 10 ** digitsFor(step)
  if (rounded >= 1000 && step < UNITS.length - 1) {
    step += 1
    value = n / 1000 ** step
  }

  return formatterFor(locale, step).format(value)
}
