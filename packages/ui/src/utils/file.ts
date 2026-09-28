// @core
/**
 * Pure file screening and formatting; return accepted files and rejection reasons for
 * components to emit.
 */
import { memo } from './memo'

/** All the matching needs of a file, so that a test does not have to counterfeit one. */
export interface FileCandidate {
  name: string
  type: string
}

/**
 * An `accept` list read into its tokens: split on commas, trimmed, lowercased, the empty ones
 * dropped. An empty result accepts everything.
 */
export function parseAccept(accept?: string): string[] {
  if (!accept) return []
  return accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * `file.type` is the browser's GUESS and is often empty (an unknown extension, some Linux
 * setups). A list written only in MIME types then turns away a perfectly good file, which is
 * why the docs ask for extensions alongside: `image/*,.heic`, not `image/*` alone.
 */
export function matchesAccept(file: FileCandidate, accept?: string | readonly string[]): boolean {
  const tokens = typeof accept === 'string' || accept === undefined ? parseAccept(accept) : accept
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

/** A stable key per FILE OBJECT, for the `v-for` of a file list. */
const fileIds = new WeakMap<File, number>()
let nextFileId = 0

export function fileKey(file: File): number {
  let id = fileIds.get(file)
  if (id === undefined) {
    id = nextFileId++
    fileIds.set(file, id)
  }
  return id
}

/** The units a size can be written in, smallest first; the rungs of the ladder. */
const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const

/**
 * Building a number formatter costs one to two orders of magnitude more than using one, and a
 * running total is rewritten every time a file is added; so one is built per language and rung,
 * and kept for as long as the page lives.
 */
const formatters = new Map<string, Intl.NumberFormat>()

/** Bytes are counted whole; above that, one decimal is what reads as a size. */
const digitsFor = (step: number) => (step === 0 ? 0 : 1)

function formatterFor(locale: string, step: number): Intl.NumberFormat {
  return memo(
    formatters,
    `${locale}|${step}`,
    () =>
      new Intl.NumberFormat(locale, {
        style: 'unit',
        unit: UNITS[step]!,
        // The byte rung is spelled out, plural included: CLDR's short English name for a
        // byte is the word "byte" itself, which printed "999 byte".
        unitDisplay: step === 0 ? 'long' : 'short',
        maximumFractionDigits: digitsFor(step),
      }),
  )
}

/** A file size as a reader expects it: 1 200 000 gives "1.2 MB" in English, "1,2 Mo" in French. */
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

/** Why a file was turned away: its kind, its size, how many there already are, or the total. */
export type FileRejectReason = 'type' | 'size' | 'count' | 'total-size'

/** One file that was turned away, and the reason it was. */
export interface FileRejection {
  /** The file itself, so a message can name it. */
  file: File
  /** What it fell foul of. */
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
 * Screens an arriving batch against what is already chosen, returning the accepted files and
 * one rejection per refusal. What is already chosen counts towards both the count and the
 * running total, so a second drop obeys the same limits as the first instead of starting over.
 */
export function screenFiles(
  incoming: readonly File[],
  current: readonly File[],
  limits: FileLimits,
): { accepted: File[]; rejected: FileRejection[] } {
  const accepted: File[] = []
  const rejected: FileRejection[] = []
  let total = current.reduce((sum, file) => sum + file.size, 0)
  const accept = parseAccept(limits.accept)

  for (const file of incoming) {
    if (!matchesAccept(file, accept)) {
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
