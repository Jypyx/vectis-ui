/**
 * The FILE domain: what a browser hands over as a `File`, and what the design
 * system has to decide about it before it enters a model. Grouped by DOMAIN, the
 * `text.ts` model — three helpers sharing no body, only a subject.
 *
 * Pure and Vue-free, which is what shapes `screenFiles`: it RETURNS its refusals
 * instead of emitting them, so one body serves a component that reports them one
 * event at a time and a test that reads them as a list.
 */

/** What the matcher needs of a `File` — so the tests do not have to forge one. */
export interface FileCandidate {
  name: string
  type: string
}

/**
 * Matches a file against the three token forms of the HTML spec: `.ext` (a
 * case-insensitive suffix), `type/*` and `type/subtype`. An absent or empty
 * `accept` accepts everything — the same meaning the attribute has.
 *
 * The attribute filters the OS dialog, but a DROP goes around it entirely: the
 * browser hands over `dataTransfer.files` untouched. Without this second
 * incarnation, drag & drop would smuggle in any type behind an `accept` the
 * consumer believes is enforced.
 *
 * **Trap**: `file.type` is the BROWSER's guess and is often `''` (an extension
 * it does not know, some Linux setups). A MIME-only `accept` then rejects a
 * perfectly valid file — which is why the docs recommend spelling extensions
 * alongside, `image/*,.heic` rather than `image/*` alone.
 */
export function matchesAccept(file: FileCandidate, accept?: string): boolean {
  if (!accept) return true

  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length === 0) return true

  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  return tokens.some((token) => {
    if (token === '*' || token === '*/*') return true
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type !== '' && type.startsWith(token.slice(0, -1))
    return type === token
  })
}

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
 * The DS boundary applies as-is: the FORMAT comes from `Intl` (which already
 * gives the unit in every language), the WORDS around it from the dictionary.
 * Nothing here is translatable.
 *
 * SI ladder, base **1000**, because that is exactly what Intl's sanctioned unit
 * names mean — a kilobyte is 1000 bytes. Mixing in the 1024 base would print
 * "1.02 kB" for a 1024-byte file, a discrepancy with no possible explanation for
 * the user.
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

/** Why a file never entered a model. Each component re-declares its own public
    alias of this union — a type is owned by its component, and `utils/` exports
    nothing publicly. */
export type FileRejectReason = 'type' | 'size' | 'count' | 'total-size'

export interface FileRejection {
  file: File
  reason: FileRejectReason
}

export interface FileLimits {
  accept?: string
  /** Maximum size of ONE file, in bytes. */
  maxSize?: number
  /** Already resolved by the caller: single mode passes 1. */
  maxFiles?: number
  maxTotalSize?: number
}

/**
 * Screens an incoming batch against the selection a model already holds.
 *
 * The order of the checks is the order of the reasons a user can act on, so a
 * wrong TYPE is reported as such even when the file is also too big. No
 * de-duplication: a `File` is opaque, two files may share a name across folders,
 * and `duplicate` is deliberately not one of the reasons.
 *
 * `current` seeds BOTH the count and the running total: that is what makes a
 * second drop obey the same limits as the first.
 */
export function screenFiles(
  incoming: readonly File[],
  current: readonly File[],
  limits: FileLimits,
): { accepted: File[]; rejected: FileRejection[] } {
  const accepted: File[] = []
  const rejected: FileRejection[] = []
  let total = current.reduce((sum, file) => sum + file.size, 0)

  for (const file of incoming) {
    if (!matchesAccept(file, limits.accept)) {
      rejected.push({ file, reason: 'type' })
      continue
    }
    if (limits.maxSize !== undefined && file.size > limits.maxSize) {
      rejected.push({ file, reason: 'size' })
      continue
    }
    if (limits.maxFiles !== undefined && current.length + accepted.length >= limits.maxFiles) {
      rejected.push({ file, reason: 'count' })
      continue
    }
    if (limits.maxTotalSize !== undefined && total + file.size > limits.maxTotalSize) {
      rejected.push({ file, reason: 'total-size' })
      continue
    }
    accepted.push(file)
    total += file.size
  }

  return { accepted, rejected }
}
