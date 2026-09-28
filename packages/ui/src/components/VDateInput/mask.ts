// @core
/**
 * Locale-derived date input masks stay outside general date utilities so calendar views do not
 * import field-only code.
 */

import { isValidISO } from '../../utils/date'
import { memo } from '../../utils/memo'
import { digitsOf } from '../../utils/text'

/*
 * A field being typed into never shows the long display format; "10 June 2026" is not something
 * one can type; but a purely numeric mask instead. The order of the three fields and the
 * separator between them are DERIVED from the locale rather than hardcoded, which makes the
 * same field work for a reader in Tokyo and one in Chicago.
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
 * The calendar and the numbering system are FORCED to Gregorian and Latin digits. An invalid
 * locale throws, and the answer then falls back to day/month/year separated by "/".
 */
export function dateMaskFor(locale: string): DateMask {
  return memo(maskCache, locale, () => buildDateMask(locale))
}

/*
 * The returned `DateMask` is shared between every caller for a locale, so it must be treated as
 * read-only. Nothing mutates it today (it is read field by field in `formatDateMask`,
 * `parseDateMask` and `maskPlaceholder`), and it is the same contract the memoized `Intl`
 * formatters in this file already have.
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

    // The separator is the first literal appearing after the first field, and not simply the
    // first literal: Hungarian and Korean end the whole format with a dot ("2021. 11. 22."),
    // which must not be mistaken for it.
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
    /* An invalid locale throws a RangeError: fall through to the fallback */
  }
  return MASK_FALLBACK
}

/** Lays a run of digits out as masked text. */
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
    if (chunk.length < len) break
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
  /** The century a two-digit year is expanded into: with 2000, "10/06/26" is read as 2026. */
  yearPivot?: number
}

/**
 * Reads masked text back into an ISO date, or returns `null` when the text is incomplete, holds
 * too many digits, or names a day that does not exist: 31 February passes every length check
 * and is caught by the round trip `isValidISO` performs.
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
  if (i !== digits.length) return null
  const year =
    (by.year as string).length === 2
      ? String((options.yearPivot as number) + Number(by.year))
      : (by.year as string)
  const iso = `${year}-${by.month}-${by.day}`
  return isValidISO(iso) ? iso : null
}

/** Where the caret has to go to sit just after the nth digit. */
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
 * The empty template shown in the field: "dd/mm/yyyy" in English, "jj/mm/aaaa" in French,
 * "tt.mm.jjjj" in German, "дд/мм/гггг" in Russian. It falls back to the Latin letters when that
 * part of `Intl` is missing, or when the script is ideographic and the repetition would mean
 * nothing.
 */
export function maskPlaceholder(locale: string, mask: DateMask): string {
  const letters = placeholderLetters(locale)
  return mask.order.map((f, k) => letters[f].repeat(mask.lengths[k] as number)).join(mask.separator)
}

const placeholderLetterCache = new Map<string, typeof PLACEHOLDER_FALLBACK>()

/** The three letters a locale writes its date fields with, worked out once per locale. */
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
