// @ssr @core
/** Pure date arithmetic shared by date inputs, pickers and calendars. */

import { memo } from './memo'
import { pad2 } from './text'

/**
 * Not `new Date(y, m, d)` itself, which reads a year from 0 to 99 as 1900 to 1999: `0050-01-01`
 * would come back as 1950, and a `min` in the first century would open the years view nineteen
 * centuries late. `setFullYear` takes the year as it is.
 */
function localDate(year: number, month0: number, day: number): Date {
  const date = new Date(year, month0, day)
  if (year >= 0 && year < 100) date.setFullYear(year, month0, day)
  return date
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

/** Tells whether a value is a real `YYYY-MM-DD` date. */
export function isValidISO(iso: unknown): iso is string {
  return typeof iso === 'string' && parseISO(iso) !== null
}

/**
 * Parse ISO dates at local midnight, returning null for invalid input. Round-trip the result to
 * reject impossible days that Date silently rolls into the next month.
 */
export function parseISO(iso: string | null | undefined): Date | null {
  if (typeof iso !== 'string' || !ISO_RE.test(iso)) return null
  const parts = iso.split('-')
  const date = localDate(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return Number.isNaN(date.getTime()) || formatISO(date) !== iso ? null : date
}

/**
 * Writes a `Date` as an ISO string, reading its LOCAL components. This manual
 * concatenation is what `toISOString()` cannot do, since that one formats in UTC.
 */
export function formatISO(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  return `${year}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/**
 * Builds an ISO string from separate values. The month is 0-indexed, as everywhere
 * in the language: 0 is January.
 */
export function isoOf(year: number, month0: number, day: number): string {
  return formatISO(localDate(year, month0, day))
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

/** Moves a date by a number of months, keeping the day of the month where possible. */
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
 * How many days the given month holds, leap years included. Day 0 of the following month is the
 * last day of this one, which makes the leap year rule the language's problem rather than ours.
 */
export function daysInMonth(year: number, month0: number): number {
  return localDate(year, month0 + 1, 0).getDate()
}

/** Compares two dates chronologically, returning the usual -1, 0 or 1. */
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

/** Whether a date may be chosen: inside the bounds, and not one the matcher excludes. */
export function isDateAllowed(
  iso: string,
  min: string | undefined,
  max: string | undefined,
  excluded: (iso: string) => boolean,
): boolean {
  return isWithin(iso, min, max) && !excluded(iso)
}

/** One square of a month grid. */
export interface MonthCell {
  /** The day it stands for, as an ISO `YYYY-MM-DD` string. */
  iso: string
  /** The day of the month, carried so a caller does not parse back what was just formatted. */
  day: number
  /**
   * Which side of the displayed month this day belongs to when it is not part of it,
   * and `null` when it is.
   */
  adjacent: 'prev' | 'next' | null
}

/**
 * Builds the grid of a month: 42 cells, six rows of seven, filled out at both ends with the
 * days of the neighbouring months. The count is fixed on purpose, so that the calendar keeps
 * the same height from one month to the next instead of jumping by a row.
 */
export function buildMonthGrid(year: number, month0: number, firstDayOfWeek: number): MonthCell[] {
  const first = localDate(year, month0, 1)
  // How many cells the 1st of the month sits after the start of its row, which is
  // exactly how many days of the previous month the grid has to open with.
  const offset = (first.getDay() - firstDayOfWeek + 7) % 7
  const cells: MonthCell[] = []
  for (let i = 0; i < 42; i++) {
    // Built from the 1st rather than stepped from a start date, so the month and year
    // rolling over at either end is `Date`'s arithmetic and not ours.
    const d = localDate(year, month0, 1 - offset + i)
    const adjacent =
      d.getMonth() === month0 && d.getFullYear() === year ? null : d < first ? 'prev' : 'next'
    cells.push({ iso: formatISO(d), day: d.getDate(), adjacent })
  }
  return cells
}

const firstDayCache = new Map<string, number>()

// @fallback @ssr
/**
 * The day the week starts on in a given locale, from 0 for Sunday to 6 for Saturday : Sunday in
 * the United States, Monday in most of Europe, Saturday in much of the Middle East. That part
 * of `Intl` is not everywhere (some Node builds lack it), so the answer falls back to Monday
 * when it is missing.
 */
export function firstDayOfWeekFor(locale: string): number {
  return memo(firstDayCache, locale, () => resolveFirstDayOfWeek(locale))
}

function resolveFirstDayOfWeek(locale: string): number {
  try {
    // Implementations disagree on the shape: Chrome and Safari expose `weekInfo` as
    // a getter, others a `getWeekInfo()` method. Both are tried.
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: { firstDay: number }
      getWeekInfo?: () => { firstDay: number }
    }
    const info = loc.getWeekInfo?.() ?? loc.weekInfo
    if (info?.firstDay) return info.firstDay % 7
  } catch {
    /* An invalid locale throws a RangeError: fall through to the fallback */
  }
  return 1
}

// The reference instants the names are formatted from. Any Sunday will do for the
// weekdays, and any year for the months; combined with `timeZone: 'UTC'` at every
// call site, they pin the output whatever zone the machine is in.
const REF_SUNDAY = Date.UTC(2021, 7, 1)
const MS_DAY = 86_400_000

/**
 * The names of the seven days, starting from `firstDayOfWeek` so the list can be
 * dropped straight into a calendar header.
 */
export function weekdayNames(
  locale: string,
  firstDayOfWeek: number,
  weekday: 'short' | 'long' = 'short',
): string[] {
  const fmt = dateFormatter(locale, { weekday, timeZone: 'UTC' })
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(REF_SUNDAY + ((firstDayOfWeek + i) % 7) * MS_DAY),
  )
}

/**
 * One formatter kept per locale and set of options, for the lifetime of the module: building an
 * `Intl` formatter costs far more than using one.
 */
const formatters = new Map<string, Intl.DateTimeFormat>()

export function dateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  return memo(
    formatters,
    `${locale}|${JSON.stringify(options)}`,
    () => new Intl.DateTimeFormat(locale, options),
  )
}

/**
 * A date written out for the reader, in the conventions of their locale: this is
 * what VDateInput shows in its field. An unparsable date yields an empty string
 * rather than a broken one.
 */
export function formatDateDisplay(
  iso: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const d = parseISO(iso)
  return d ? dateFormatter(locale, options).format(d) : ''
}

/**
 * ICU releases disagree on the spaces around a range's dash: Node 24 (ICU 78) writes thin spaces
 * where Chromium writes plain ones. Writing every thin or hair space as a plain one keeps a
 * prerendered range identical to the one the browser hydrates.
 */
const RANGE_SPACES = /[\u2009\u200A]/g

/** A period written out for the reader. */
export function formatDisplayRange(
  start: string,
  end: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const a = parseISO(start)
  const b = parseISO(end)
  if (!a || !b) return ''
  const fmt = dateFormatter(locale, options)
  const order = compareISO(start, end)
  if (order === 0) return fmt.format(a)
  const text = order < 0 ? fmt.formatRange(a, b) : fmt.formatRange(b, a)
  return text.replace(RANGE_SPACES, ' ')
}
