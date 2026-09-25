// @core
/**
 * How a date is TYPED: the numeric mask of VDateInput's field, whose order, separator and
 * placeholder are derived from the locale.
 *
 * It sits in the component's folder rather than in `utils/date.ts`: there is one consumer,
 * and `utils/date.ts` is in the import closure of every VCalendar component, which would
 * pay for a mask no calendar ever shows, the `VTimeInput/search.ts` argument.
 */

import { isValidISO } from '../../utils/date'
import { memo } from '../../utils/memo'
import { digitsOf } from '../../utils/text'

/*
 * The numeric input mask, used by VDateInput when its field can be typed into.
 *
 * A field being typed into never shows the long display format — "10 June 2026" is
 * not something one can type — but a purely numeric mask instead. The order of the
 * three fields and the separator between them are DERIVED from the locale rather
 * than hardcoded, which is what makes the same field work for a reader in Tokyo and
 * one in Chicago.
 */

export type DateMaskField = 'day' | 'month' | 'year'

/** Everything a locale decides about how a date is typed. */
export interface DateMask {
  /**
   * The order the three fields appear in: day, month, year in the United Kingdom,
   * month, day, year in the United States, year, month, day in Japan.
   */
  order: readonly DateMaskField[]
  /** The single character between two fields, stripped of bidi marks and spaces. */
  separator: string
  /** How many digits each field takes, in the same order: 4 for the year, 2 otherwise. */
  lengths: readonly number[]
  /** How many digits the complete mask holds, which is always 8. */
  size: number
}

const MASK_FALLBACK: DateMask = {
  order: ['day', 'month', 'year'],
  separator: '/',
  lengths: [2, 2, 4],
  size: 8,
}

/**
 * The date the mask is read from: 22 November 2021. Its three numbers all differ, so
 * whichever order the locale prints them in, each one can be told apart.
 */
const REF_MASK_DATE = Date.UTC(2021, 10, 22)

/** The invisible direction marks some locales insert, such as U+200F before "/" in ar-EG. */
const BIDI_MARKS = /[‎‏؜]/g

const maskCache = new Map<string, DateMask>()

/**
 * Works out how a date is typed in a given locale, by formatting a known date and
 * looking at what came out.
 *
 * The calendar and the numbering system are FORCED to Gregorian and Latin digits.
 * Without that, `fa-IR` answers with a Persian year (1400 rather than 2021) and
 * `ar-EG` with Arabic-Indic digits: two things a numeric field could neither
 * display nor read back. An invalid locale throws, and the answer then falls back to
 * day/month/year separated by "/".
 */
export function dateMaskFor(locale: string): DateMask {
  return memo(maskCache, locale, () => buildDateMask(locale))
}

/*
 * TRAP — the returned `DateMask` is SHARED between every caller for a locale, so it must be
 * treated as read-only. Nothing mutates it today (it is read field by field in
 * `formatDateMask`, `parseDateMask` and `maskPlaceholder`), and it is the same contract the
 * memoized `Intl` formatters in this file already have.
 */
function buildDateMask(locale: string): DateMask {
  try {
    const parts = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
      calendar: 'gregory',
      numberingSystem: 'latn',
    }).formatToParts(REF_MASK_DATE)

    const order = parts
      .map((p) => p.type)
      .filter((t): t is DateMaskField => t === 'day' || t === 'month' || t === 'year')

    // The separator is the first literal appearing AFTER the first field, and not
    // simply the first literal: Hungarian and Korean end the whole format with a dot
    // ("2021. 11. 22."), which must not be mistaken for it.
    const firstField = parts.findIndex((p) => p.type !== 'literal')
    const separator = parts
      .slice(firstField)
      .find((p) => p.type === 'literal')
      ?.value.replace(BIDI_MARKS, '')
      .trim()

    if (order.length === 3 && separator) {
      const lengths = order.map((f) => (f === 'year' ? 4 : 2))
      return { order, separator, lengths, size: 8 }
    }
  } catch {
    /* an invalid locale throws a RangeError: fall through to the fallback */
  }
  return MASK_FALLBACK
}

/**
 * Lays a run of digits out as masked text. The separator appears AS SOON AS the field
 * before it is full: typing "22" already gives "22/", so the reader sees their
 * progress without ever having to type a separator themselves.
 *
 * This has a consequence the component must honour: pressing Backspace on such a
 * separator has to delete the DIGIT before it. Deleting the separator alone would
 * see the mask write it straight back, and the key would look dead.
 */
export function formatDateMask(digits: string, mask: DateMask): string {
  const all = digitsOf(digits).slice(0, mask.size)
  let out = ''
  let i = 0
  for (let f = 0; f < mask.lengths.length; f++) {
    const len = mask.lengths[f] as number
    const chunk = all.slice(i, i + len)
    if (!chunk) break
    out += chunk
    i += len
    if (chunk.length < len) break // this field is still being typed: no separator yet
    if (f < mask.lengths.length - 1) out += mask.separator
  }
  return out
}

/**
 * Writes an ISO date in the mask of the locale, ready to be put in the field: the
 * same day reads "10/06/2026" in London and "06/10/2026" in Chicago.
 */
export function isoToMask(iso: string, mask: DateMask): string {
  if (!isValidISO(iso)) return ''
  const [year, month, day] = iso.split('-') as [string, string, string]
  const by: Record<DateMaskField, string> = { year, month, day }
  return formatDateMask(mask.order.map((f) => by[f]).join(''), mask)
}

export interface ParseMaskOptions {
  /**
   * The century a two-digit year is expanded into: with 2000, "10/06/26" is read as
   * 2026. It is only accepted when the year is the LAST field of the mask, since
   * elsewhere the following separator already tells the two apart.
   *
   * Leaving it out refuses any year shorter than four digits, and that is the mode
   * used while the reader types, so that "26", passed through on the way to "2026",
   * is never committed as a year of its own.
   */
  yearPivot?: number
}

/**
 * Reads masked text back into an ISO date, or returns `null` when the text is
 * incomplete, holds too many digits, or names a day that does not exist: 31
 * February passes every length check and is caught by the round trip `isValidISO`
 * performs.
 *
 * Whether the resulting date is allowed is a different question: the `min`/`max`
 * bounds and the disabled dates belong to the component, and this function knows
 * nothing about props.
 */
export function parseDateMask(
  text: string,
  mask: DateMask,
  options: ParseMaskOptions = {},
): string | null {
  const digits = digitsOf(text)
  const by: Partial<Record<DateMaskField, string>> = {}
  let i = 0
  for (let k = 0; k < mask.order.length; k++) {
    const field = mask.order[k] as DateMaskField
    const len = mask.lengths[k] as number
    const chunk = digits.slice(i, i + len)
    if (chunk.length === len) i += len
    else if (
      field === 'year' &&
      options.yearPivot !== undefined &&
      k === mask.order.length - 1 &&
      chunk.length === 2
    )
      i += 2
    else return null
    by[field] = chunk
  }
  if (i !== digits.length) return null // digits are left over: the entry is too long
  const year =
    (by.year as string).length === 2
      ? String((options.yearPivot as number) + Number(by.year))
      : (by.year as string)
  const iso = `${year}-${by.month}-${by.day}`
  return isValidISO(iso) ? iso : null
}

/**
 * Where the caret has to go to sit just after the nth digit. Counting digits is the
 * only landmark that survives a reformat: an absolute position jumps by one the
 * moment a separator appears or disappears, so restoring it would leave the caret in
 * the wrong place on exactly the keystrokes that matter.
 *
 * When a separator is passed and it directly follows that position, the caret steps
 * over it: while typing, it must land in the NEXT field rather than in front of a
 * separator that has just been written. On deletion the argument is omitted, so the
 * caret stays before it and the next Backspace reaches the digit.
 */
export function caretAfterDigits(text: string, n: number, separator?: string): number {
  let pos = 0
  if (n > 0) {
    pos = text.length
    let seen = 0
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i)
      if (code >= 48 && code <= 57 && ++seen === n) {
        pos = i + 1
        break
      }
    }
  }
  if (separator && text.startsWith(separator, pos)) pos += separator.length
  return pos
}

const PLACEHOLDER_FALLBACK: Record<DateMaskField, string> = { day: 'd', month: 'm', year: 'y' }

/**
 * Ideographic scripts, which are excluded from the placeholder: a repeated "日" does
 * not read as a template the way a repeated letter does.
 */
const IDEOGRAPHIC = /[\p{sc=Han}\p{sc=Hangul}\p{sc=Hiragana}\p{sc=Katakana}]/u

// @fallback
/**
 * The empty template shown in the field: "dd/mm/yyyy" in English, "jj/mm/aaaa" in
 * French, "tt.mm.jjjj" in German, "дд/мм/гггг" in Russian.
 *
 * Each letter is the first letter of the field's own name in that language, taken
 * from `Intl.DisplayNames`, which lands on the attested convention of every
 * alphabetic script without a table to maintain. It falls back to the Latin letters
 * when that part of `Intl` is missing, or when the script is ideographic and the
 * repetition would mean nothing.
 */
export function maskPlaceholder(locale: string, mask: DateMask): string {
  const letters = placeholderLetters(locale)
  return mask.order.map((f, k) => letters[f].repeat(mask.lengths[k] as number)).join(mask.separator)
}

const placeholderLetterCache = new Map<string, typeof PLACEHOLDER_FALLBACK>()

/**
 * The three letters a locale writes its date fields with, worked out once per locale.
 *
 * The LETTERS are cached, not the finished placeholder: that also depends on the mask handed
 * in, and would be wrong the moment a caller passes one that is not `dateMaskFor(locale)`.
 * All the cost is here anyway — `Intl.DisplayNames` is this file's most expensive
 * constructor by an order of magnitude (~0.22 ms against ~0.07 for `dateMaskFor`).
 */
function placeholderLetters(locale: string): typeof PLACEHOLDER_FALLBACK {
  return memo(placeholderLetterCache, locale, () => buildPlaceholderLetters(locale))
}

function buildPlaceholderLetters(locale: string): typeof PLACEHOLDER_FALLBACK {
  const letters = { ...PLACEHOLDER_FALLBACK }
  try {
    const names = new Intl.DisplayNames(locale, { type: 'dateTimeField' })
    for (const field of ['day', 'month', 'year'] as const) {
      const first = [...(names.of(field) ?? '')][0]
      if (first && /\p{L}/u.test(first) && !IDEOGRAPHIC.test(first))
        letters[field] = first.toLocaleLowerCase(locale)
    }
  } catch {
    /* Intl.DisplayNames is unavailable here: keep the Latin letters */
  }
  return letters
}
