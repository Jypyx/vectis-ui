// @core — module-wide: pure domain logic, no a11y, no DOM, no environment guard.
/**
 * The FILE domain: whether a file is of an accepted kind, how its size is written out, and
 * which of a batch may come in. Grouped by subject rather than by shared code, like `text.ts`.
 *
 * Nothing here knows about components, which is what shapes the screening: it RETURNS its
 * refusals instead of emitting them. One body then serves VFileInput, which reports them one
 * at a time, and a test that reads them all as a list without a mount.
 */

/** All the matching needs of a file, so that a test does not have to counterfeit one. */
export interface FileCandidate {
  name: string
  type: string
}

/**
 * Whether a file matches an `accept` list, written exactly as the HTML attribute is:
 * `.pdf` (case-insensitive), `image/*`, or one precise MIME type. An empty list accepts
 * everything.
 *
 * The rule is applied in JS because the ATTRIBUTE only governs the dialog the browser
 * opens: a DROPPED file bypasses it entirely. Without this second reading, dropping
 * smuggles anything past a restriction the consumer believes is enforced.
 *
 * TRAP — `file.type` is the browser's GUESS and is often empty (an unknown extension, some
 * Linux setups). A list written only in MIME types then turns away a perfectly good file,
 * which is why the docs ask for extensions alongside: `image/*,.heic`, not `image/*` alone.
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

/** The units a size can be written in, smallest first — the rungs of the ladder. */
const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const

/**
 * Building a number formatter costs one to two orders of magnitude more than using one,
 * and a running total is rewritten every time a file is added — so one is built per
 * language and rung, and kept for as long as the page lives.
 */
const formatters = new Map<string, Intl.NumberFormat>()

/** Bytes are counted whole; above that, one decimal is what reads as a size. */
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
 * A file size as a reader expects it: 1 200 000 gives "1.2 MB" in English, "1,2 Mo" in
 * French. Nothing here is translatable — `Intl` knows the unit names and the decimal mark.
 *
 * SI base 1000, which is what the unit names `Intl` prints actually mean. The computing
 * convention of 1024 would show a 1024-byte file as "1.02 kB", a discrepancy no reader can
 * explain to themselves. A negative or non-finite size reads as 0: the number comes straight
 * off the file, and a size beside a name must never be the thing that breaks.
 */
export function formatBytes(bytes: number, locale: string): string {
  const n = Number.isFinite(bytes) && bytes > 0 ? bytes : 0

  let step = n === 0 ? 0 : Math.min(UNITS.length - 1, Math.max(0, Math.floor(Math.log10(n) / 3)))
  let value = n / 1000 ** step

  /*
   * The carry. 999 999 bytes belongs on the kB rung and ROUNDS to 1000 at one decimal, so
   * rung and rounding have to agree or the reader is shown "1,000 kB" for "1 MB". Round
   * first, then step up: the other order lets the same discrepancy through one rung higher.
   */
  const rounded = Math.round(value * 10 ** digitsFor(step)) / 10 ** digitsFor(step)
  if (rounded >= 1000 && step < UNITS.length - 1) {
    step += 1
    value = n / 1000 ** step
  }

  return formatterFor(locale, step).format(value)
}

/**
 * Why a file was turned away. Each component declares its own public name for this: a
 * type belongs to the component that exposes it, and nothing in here is public.
 */
export type FileRejectReason = 'type' | 'size' | 'count' | 'total-size'

export interface FileRejection {
  file: File
  reason: FileRejectReason
}

export interface FileLimits {
  accept?: string
  /** How large ONE file may be, in bytes. */
  maxSize?: number
  /** Already settled by the caller: a field that takes a single file passes one. */
  maxFiles?: number
  maxTotalSize?: number
}

/**
 * Screens an arriving batch against what is already chosen, returning the accepted files
 * and one rejection per refusal.
 *
 * The order `type → size → count → total-size` is a contract both `.mdx` pages state, and
 * it is the order a reader can act on: a file of the wrong KIND is reported as such even
 * when it is also too big, since being told to shrink a file that would never be accepted
 * is worse than useless.
 *
 * Duplicates are deliberately NOT a reason: two files in different folders may share a
 * name, and there is no reliable way to tell one from another. What is already chosen
 * counts towards both the count and the running total, so a second drop obeys the same
 * limits as the first instead of starting over.
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
