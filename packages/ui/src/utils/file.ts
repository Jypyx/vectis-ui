// @core — module-wide: pure domain logic, no a11y, no DOM, no environment guard.
/**
 * Everything the design system has to decide about a file the browser hands it, before
 * that file is accepted: is it of a kind we asked for, how do we write its size out, and
 * which of a batch may come in.
 *
 * The three are grouped because they are about the same SUBJECT, not because they share
 * any code — the same arrangement as the text helpers.
 *
 * Nothing here knows anything about components, which is what gives the screening its
 * shape: it HANDS BACK the files it refused instead of announcing them. One body then
 * serves a component that reports refusals one at a time and a test that reads them all
 * as a list.
 */

/** All the matching needs of a file, so that a test does not have to counterfeit one. */
export interface FileCandidate {
  name: string
  type: string
}

/**
 * Decides whether a file is one of the kinds a component said it would take.
 *
 * The list of accepted kinds is written exactly as HTML has always written it, and it
 * admits three forms: an extension such as ".pdf", regardless of capitals; a whole family
 * such as "image/*"; or one precise kind. Saying nothing at all accepts everything, which
 * is what saying nothing has always meant.
 *
 * The reason this exists in code rather than being left to the browser is that the
 * browser only applies that list to the dialog it opens. A file DROPPED onto the page
 * goes around it entirely and arrives untouched. Without this second reading, dropping
 * would smuggle in anything at all past a restriction the consumer believes is being
 * enforced.
 *
 * TRAP — the kind of a file is the BROWSER's guess, and it is often simply empty: an
 * extension it has never heard of, or certain Linux setups. A list written only in terms
 * of kinds then turns away a perfectly good file, which is why the documentation asks for
 * extensions to be spelled out alongside them — "image/*,.heic" rather than "image/*" on
 * its own.
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
 * Writes a size out the way a reader expects to see it: 1 200 000 becomes "1.2 MB" in
 * English and "1,2 Mo" in French.
 *
 * The design system's rule about language applies here unchanged. The FORM comes from the
 * browser, which already knows the unit in every language and where the decimal mark
 * goes; only the WORDS around it come from the dictionary. Nothing in this function is
 * translatable.
 *
 * A kilobyte is a thousand bytes, and each rung of the ladder is a thousand of the one
 * below. That is exactly what the unit names the browser prints mean. Using the other,
 * computing convention of 1024 would have a file of 1024 bytes shown as "1.02 kB" — a
 * discrepancy no reader could explain to themselves.
 *
 * A size that is negative, or not a number at all, is treated as nothing rather than
 * producing nonsense. The number comes straight from the file, and a size shown beside a
 * name must never be the thing that breaks.
 */
export function formatBytes(bytes: number, locale: string): string {
  const n = Number.isFinite(bytes) && bytes > 0 ? bytes : 0

  let step = n === 0 ? 0 : Math.min(UNITS.length - 1, Math.max(0, Math.floor(Math.log10(n) / 3)))
  let value = n / 1000 ** step

  /*
   * The carry. A size of 999 999 bytes belongs on the kilobyte rung, and at one decimal
   * it ROUNDS to 1000 — so the rung and the rounding have to agree, or the reader is
   * shown "1,000 kB" where they expect "1 MB". The rounding is done first and the step up
   * second: the other order lets exactly the same discrepancy through one rung higher.
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
 * Sorts an arriving batch of files into those that may come in and those that may not,
 * given what has already been chosen.
 *
 * The checks run in the order a reader can act on. A file of the wrong KIND is reported
 * as such even when it is also too big, because being told to shrink a file that would
 * never have been accepted anyway is worse than useless.
 *
 * Nothing is set aside for being chosen twice. There is no reliable way to tell one file
 * from another — two files in different folders may perfectly well share a name — so
 * "already chosen" is deliberately not one of the reasons a file can be refused.
 *
 * What is already chosen counts towards BOTH the number of files and the running total,
 * which is what makes a second drop obey the same limits as the first rather than
 * starting again from nothing.
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
