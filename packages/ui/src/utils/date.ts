// @ssr @core — module-wide: every export below is @core unless tagged otherwise.
/**
 * The date arithmetic behind VDatePicker and VDateInput, written as pure functions:
 * they read nothing outside their arguments and change nothing around them.
 *
 * The whole module speaks one language, the ISO `YYYY-MM-DD` string, and computes
 * everything in the reader's LOCAL time. Two shortcuts are therefore banned
 * throughout: `new Date('YYYY-MM-DD')`, which the language interprets as UTC and
 * which consequently lands on the previous or the next day depending on the time
 * zone, and `toISOString()`, which formats in UTC for the same reason. `Date`
 * objects exist here only as an intermediate step, built with `new Date(y, m, d)` —
 * local midnight — and turned back into text by concatenation.
 *
 * The names of months and days come from `Intl`, which is available on the server as
 * well as in the browser. They are formatted from REFERENCE dates pinned to
 * `timeZone: 'UTC'`, so that the resulting label never depends on the time zone of
 * the machine doing the rendering.
 */

import { digitsOf, pad2 } from './text'

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Tells whether a value is a real `YYYY-MM-DD` date. The shape alone is not enough:
 * `2026-02-31` matches the pattern, so the check goes through a parse and a
 * reformat, and only a value that survives the round trip unchanged is accepted.
 */
export function isValidISO(iso: unknown): iso is string {
  if (typeof iso !== 'string' || !ISO_RE.test(iso)) return false
  const d = parseISO(iso)
  return d !== null && formatISO(d) === iso
}

/**
 * Turns an ISO string into a `Date` set at local midnight, or returns `null` when
 * the string is not one. Every caller here has to handle that `null`: the bounds a
 * consumer passes are raw strings and may be anything.
 */
export function parseISO(iso: string | null | undefined): Date | null {
  if (typeof iso !== 'string' || !ISO_RE.test(iso)) return null
  const parts = iso.split('-')
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Writes a `Date` as an ISO string, reading its LOCAL components. This manual
 * concatenation is what `toISOString()` cannot do, since that one formats in UTC.
 */
export function formatISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/**
 * Builds an ISO string from separate values. The month is 0-indexed, as everywhere
 * in the language: 0 is January.
 */
export function isoOf(year: number, month0: number, day: number): string {
  return formatISO(new Date(year, month0, day))
}

/**
 * Moves a date by a number of days, forwards or backwards. Crossing into another
 * month or year is handled by `Date` itself.
 */
export function addDays(iso: string, n: number): string {
  const d = parseISO(iso)
  if (!d) return iso
  d.setDate(d.getDate() + n)
  return formatISO(d)
}

/**
 * Moves a date by a number of months, keeping the day of the month where possible.
 * When the target month is too short the day is brought back to its last one: 31
 * January plus one month gives 28 or 29 February, and never spills over into March
 * the way a naive addition would.
 */
export function addMonths(iso: string, n: number): string {
  const d = parseISO(iso)
  if (!d) return iso
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  d.setDate(Math.min(day, daysInMonth(d.getFullYear(), d.getMonth())))
  return formatISO(d)
}

/**
 * How many days the given month holds, leap years included. Day 0 of the following
 * month is the last day of this one, which is what makes the leap year rule the
 * language's problem rather than ours.
 */
export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate()
}

/**
 * Compares two dates chronologically, returning the usual -1, 0 or 1. Because the
 * `YYYY-MM-DD` format puts its most significant part first, comparing the strings as
 * text already gives the chronological order: no parsing is needed.
 */
export function compareISO(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/**
 * Whether two dates are the same day, with a null on either side counting as no
 * date at all rather than as a match.
 */
export const isSameISO = (a: string | null, b: string | null) => !!a && a === b

/**
 * Brings a date back inside the allowed interval, returning the bound it exceeded.
 * Both bounds are optional, and an absent one means unbounded on that side.
 */
export function clampISO(iso: string, min?: string, max?: string): string {
  if (min && compareISO(iso, min) < 0) return min
  if (max && compareISO(iso, max) > 0) return max
  return iso
}

/** Whether a date falls inside the allowed interval, each bound being optional. */
export function isWithin(iso: string, min?: string, max?: string): boolean {
  if (min && compareISO(iso, min) < 0) return false
  if (max && compareISO(iso, max) > 0) return false
  return true
}

/** One square of a month grid. */
export interface MonthCell {
  /** The day it stands for, as an ISO `YYYY-MM-DD` string. */
  iso: string
  /**
   * Which side of the displayed month this day belongs to when it is not part of it,
   * and `null` when it is.
   */
  adjacent: 'prev' | 'next' | null
}

/**
 * Builds the grid of a month: 42 cells, six rows of seven, filled out at both ends
 * with the days of the neighbouring months. The count is fixed on purpose, so that
 * the calendar keeps the same height from one month to the next instead of jumping
 * by a row. `firstDayOfWeek` runs from 0 for Sunday to 6 for Saturday.
 */
export function buildMonthGrid(year: number, month0: number, firstDayOfWeek: number): MonthCell[] {
  const first = new Date(year, month0, 1)
  // How many cells the 1st of the month sits after the start of its row, which is
  // exactly how many days of the previous month the grid has to open with.
  const offset = (first.getDay() - firstDayOfWeek + 7) % 7
  const cells: MonthCell[] = []
  const start = new Date(year, month0, 1 - offset)
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const adjacent =
      d.getMonth() === month0 && d.getFullYear() === year
        ? null
        : compareISO(formatISO(d), formatISO(first)) < 0
          ? 'prev'
          : 'next'
    cells.push({ iso: formatISO(d), adjacent })
  }
  return cells
}

// @fallback @ssr
/**
 * The day the week starts on in a given locale, from 0 for Sunday to 6 for Saturday
 * — Sunday in the United States, Monday in most of Europe, Saturday in much of the
 * Middle East. It comes from `Intl.Locale`, whose own numbering runs from 1 for
 * Monday to 7 for Sunday.
 *
 * That part of `Intl` is not everywhere (some Node builds lack it), so the answer
 * falls back to Monday when it is missing. A component can always override the
 * result with its `firstDayOfWeek` prop.
 */
export function firstDayOfWeekFor(locale: string): number {
  try {
    // Implementations disagree on the shape: Chrome and Safari expose `weekInfo` as
    // a getter, others a `getWeekInfo()` method. Both are tried.
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: { firstDay: number }
      getWeekInfo?: () => { firstDay: number }
    }
    const info = loc.getWeekInfo?.() ?? loc.weekInfo
    if (info?.firstDay) return info.firstDay % 7 // brings Sunday, their 7, back to 0
  } catch {
    /* an invalid locale throws a RangeError: fall through to the fallback */
  }
  return 1 // Monday
}

// The reference instants the names are formatted from. Any Sunday will do for the
// weekdays, and any year for the months; combined with `timeZone: 'UTC'` at every
// call site, they pin the output whatever zone the machine is in.
const REF_SUNDAY = Date.UTC(2021, 7, 1) // 1 August 2021 fell on a Sunday
const MS_DAY = 86_400_000

/**
 * The names of the seven days, starting from `firstDayOfWeek` so the list can be
 * dropped straight into a calendar header.
 */
export function weekdayNames(
  locale: string,
  firstDayOfWeek: number,
  weekday: 'narrow' | 'short' | 'long' = 'short',
): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday, timeZone: 'UTC' })
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(REF_SUNDAY + ((firstDayOfWeek + i) % 7) * MS_DAY),
  )
}

/** The names of the twelve months, in January-to-December order. */
export function monthNames(locale: string, month: 'long' | 'short' = 'long'): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { month, timeZone: 'UTC' })
  return Array.from({ length: 12 }, (_, i) => fmt.format(Date.UTC(2021, i, 1)))
}

/**
 * Month names shortened for the picker's narrow cells: a name of four characters or
 * fewer is kept whole ("May", "June", "July"), a longer one is cut to three
 * characters followed by a dot ("January" becomes "Jan."). The name is spread with
 * `[...n]` rather than indexed, so that an accented or non-Latin character counts as
 * one character and is never cut in half.
 */
export function monthNamesCompact(locale: string): string[] {
  return monthNames(locale, 'long').map((n) => {
    const chars = [...n]
    return chars.length <= 4 ? n : chars.slice(0, 3).join('') + '.'
  })
}

/**
 * One formatter kept per locale and set of options, for the lifetime of the module —
 * the same `formatterFor` idiom as in `utils/file.ts` and `utils/time.ts`.
 *
 * Building an `Intl.DateTimeFormat` costs one to two orders of magnitude more than
 * using one, and the three functions below are called ONE VALUE AT A TIME: VDateInput
 * formats a multiple selection inside a `.map`, so a fresh formatter would be built
 * for every date. `weekdayNames` and `monthNames` already hoist theirs out of their
 * loop; this cache gives the per-call functions the same property.
 *
 * The options object is part of the cache key. `JSON.stringify` is stable enough
 * here — these objects are literals written by the components, not data coming from
 * a user — and costs a fraction of a construction.
 */
const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    formatters.set(key, formatter)
  }
  return formatter
}

/** The name of one month, 0 being January. */
export function monthName(
  locale: string,
  month0: number,
  month: 'long' | 'short' = 'long',
): string {
  return formatterFor(locale, { month, timeZone: 'UTC' }).format(Date.UTC(2021, month0, 1))
}

/**
 * A date written out for the reader, in the conventions of their locale — this is
 * what VDateInput shows in its field. An unparsable date yields an empty string
 * rather than a broken one.
 */
export function formatDisplay(
  iso: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const d = parseISO(iso)
  return d ? formatterFor(locale, options).format(d) : ''
}

/**
 * A period written out for the reader. `Intl`'s own `formatRange` is what factors
 * out the parts the two dates share, giving "19–26 June 2026" rather than the two
 * full dates side by side. A period of a single day is formatted as that one date.
 */
export function formatDisplayRange(
  start: string,
  end: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const a = parseISO(start)
  const b = parseISO(end)
  if (!a || !b) return ''
  const fmt = formatterFor(locale, options)
  return compareISO(start, end) === 0 ? fmt.format(a) : fmt.formatRange(a, b)
}

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

/**
 * Works out how a date is typed in a given locale, by formatting a known date and
 * looking at what came out.
 *
 * The calendar and the numbering system are FORCED to Gregorian and Latin digits.
 * Without that, `fa-IR` answers with a Persian year (1400 rather than 2021) and
 * `ar-EG` with Arabic-Indic digits — two things a numeric field could neither
 * display nor read back. An invalid locale throws, and the answer then falls back to
 * day/month/year separated by "/".
 */
export function dateMaskFor(locale: string): DateMask {
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
 * before it is full — typing "22" already gives "22/" — so the reader sees their
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
   * used while the reader types — so that "26", passed through on the way to "2026",
   * is never committed as a year of its own.
   */
  yearPivot?: number
}

/**
 * Reads masked text back into an ISO date, or returns `null` when the text is
 * incomplete, holds too many digits, or names a day that does not exist — 31
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
 * from `Intl.DisplayNames` — which lands on the attested convention of every
 * alphabetic script without a table to maintain. It falls back to the Latin letters
 * when that part of `Intl` is missing, or when the script is ideographic and the
 * repetition would mean nothing.
 */
export function maskPlaceholder(locale: string, mask: DateMask): string {
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
  return mask.order.map((f, k) => letters[f].repeat(mask.lengths[k] as number)).join(mask.separator)
}
