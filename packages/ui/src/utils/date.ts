// @ssr @core — module-wide: every export below is @core unless tagged otherwise.
/**
 * PURE date utilities (VCalendar, VDatePicker).
 *
 * Contract: the public API deals in ISO `YYYY-MM-DD` strings and everything is
 * computed in **local time** — NEVER through `new Date('YYYY-MM-DD')`
 * (interpreted as UTC → a one-day drift depending on the zone) nor through
 * `toISOString()` (which returns UTC). `Date` objects stay internal, built with
 * `new Date(y, m, d)` (local midnight) and reformatted by manual concatenation.
 *
 * Month and day names go through `Intl` (available server-side → SSR-safe) on
 * REFERENCE dates in `timeZone: 'UTC'`, so the label does not depend on the
 * machine's zone.
 */

import { digitsOf, pad2 } from './text'

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

/** True if `iso` is a valid `YYYY-MM-DD` string (coherent month/day). */
export function isValidISO(iso: unknown): iso is string {
  if (typeof iso !== 'string' || !ISO_RE.test(iso)) return false
  const d = parseISO(iso)
  return d !== null && formatISO(d) === iso
}

/** ISO `YYYY-MM-DD` → a `Date` at local midnight (or `null` if malformed). */
export function parseISO(iso: string | null | undefined): Date | null {
  if (typeof iso !== 'string' || !ISO_RE.test(iso)) return null
  const parts = iso.split('-')
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Builds an ISO from local components (0-indexed month). */
export function isoOf(year: number, month0: number, day: number): string {
  return formatISO(new Date(year, month0, day))
}

/** Adds `n` days to an ISO (month/year carry handled by `Date`). */
export function addDays(iso: string, n: number): string {
  const d = parseISO(iso)
  if (!d) return iso
  d.setDate(d.getDate() + n)
  return formatISO(d)
}

/**
 * Adds `n` months keeping the day, clamped to the last day of the target month
 * (31 Jan + 1 month → 28/29 Feb, not an overflow into March).
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

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate()
}

/**
 * Chronological comparison of two ISO strings. Since the `YYYY-MM-DD` format is
 * lexicographically ordered, a string comparison is enough.
 */
export function compareISO(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export const isSameISO = (a: string | null, b: string | null) => !!a && a === b

/** Restricts `iso` to the `[min, max]` interval (bounds optional). */
export function clampISO(iso: string, min?: string, max?: string): string {
  if (min && compareISO(iso, min) < 0) return min
  if (max && compareISO(iso, max) > 0) return max
  return iso
}

/** True if `iso` is within `[min, max]` (bounds optional). */
export function isWithin(iso: string, min?: string, max?: string): boolean {
  if (min && compareISO(iso, min) < 0) return false
  if (max && compareISO(iso, max) > 0) return false
  return true
}

export interface MonthCell {
  iso: string
  /** Position outside the displayed month (a day of an adjacent month), else `null`. */
  adjacent: 'prev' | 'next' | null
}

/**
 * A 42-cell matrix (6 rows × 7 columns) covering month `month0` of `year`,
 * completed with the days of the adjacent months. Stable grid height whatever
 * the month. `firstDayOfWeek`: 0 = Sunday … 6 = Saturday.
 */
export function buildMonthGrid(year: number, month0: number, firstDayOfWeek: number): MonthCell[] {
  const first = new Date(year, month0, 1)
  // Offset of the 1st of the month relative to the first day of the week (0..6).
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
 * First day of the week for the locale (0 = Sunday … 6 = Saturday). Derived from
 * `Intl.Locale.weekInfo` (1 = Monday … 7 = Sunday); falls back to Monday if the
 * API is absent (Node/SSR depending on the version) — overridable by a prop on
 * the component side.
 */
export function firstDayOfWeekFor(locale: string): number {
  try {
    // `weekInfo`: a getter (Chrome/Safari) or a `getWeekInfo()` method, per impl.
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: { firstDay: number }
      getWeekInfo?: () => { firstDay: number }
    }
    const info = loc.getWeekInfo?.() ?? loc.weekInfo
    if (info?.firstDay) return info.firstDay % 7 // 7 (Sunday) → 0
  } catch {
    /* invalid locale → fallback */
  }
  return 1 // Monday
}

// Reference dates in UTC: Sunday 2021-08-01 for the weekdays, any year for the
// months. `timeZone: 'UTC'` pins the output.
const REF_SUNDAY = Date.UTC(2021, 7, 1) // 1 August 2021 = a Sunday
const MS_DAY = 86_400_000

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

export function monthNames(locale: string, month: 'long' | 'short' = 'long'): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { month, timeZone: 'UTC' })
  return Array.from({ length: 12 }, (_, i) => fmt.format(Date.UTC(2021, i, 1)))
}

/**
 * Compact month names for the picker: the whole name if it fits in 4 characters
 * ("May", "June", "July"), otherwise the first 3 + a dot ("January" → "Jan.").
 * `[...n]` counts graphemes (accents included).
 */
export function monthNamesCompact(locale: string): string[] {
  return monthNames(locale, 'long').map((n) => {
    const chars = [...n]
    return chars.length <= 4 ? n : chars.slice(0, 3).join('') + '.'
  })
}

/**
 * One formatter per (locale, options) pair, kept for the lifetime of the module —
 * the `formatterFor` idiom of `utils/file.ts`, and the counterpart of `time.ts`'s.
 *
 * Constructing an `Intl.DateTimeFormat` costs one to two orders of magnitude more
 * than using it, and the three functions below are all called ONE VALUE AT A TIME
 * (VDatePicker formats a `multiple` selection inside a `.map`). The neighbouring
 * `weekdayNames`/`monthNames` already hoist their formatter out of their loop;
 * this is what gives the per-call ones the same property.
 *
 * The options object is part of the key: `JSON.stringify` is stable enough here —
 * these objects are literals built by the components, not user data — and costs a
 * fraction of a construction.
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

export function monthName(
  locale: string,
  month0: number,
  month: 'long' | 'short' = 'long',
): string {
  return formatterFor(locale, { month, timeZone: 'UTC' }).format(Date.UTC(2021, month0, 1))
}

/** Localized display of a single date, for the VDatePicker field. */
export function formatDisplay(
  iso: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const d = parseISO(iso)
  return d ? formatterFor(locale, options).format(d) : ''
}

/** Localized display of a range (`formatRange` → "19–26 June 2026"). */
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
 * Numeric input mask (VDatePicker `mode="input"`).
 *
 * The typing field NEVER shows VDatePicker's `displayFormat` ("10 June 2026" is
 * not typeable) but a purely numeric mask: the field order and the separator are
 * DERIVED from the locale, never hardcoded.
 */

export type DateMaskField = 'day' | 'month' | 'year'

export interface DateMask {
  /** Display order (en-GB `day,month,year` · en-US `month,day,year` · ja `year,month,day`). */
  order: readonly DateMaskField[]
  /** Single separator, stripped of its bidi marks and whitespace. */
  separator: string
  /** Lengths aligned with `order`: year 4, day and month 2. */
  lengths: readonly number[]
  /** Total number of digits in the mask (8). */
  size: number
}

const MASK_FALLBACK: DateMask = {
  order: ['day', 'month', 'year'],
  separator: '/',
  lengths: [2, 2, 4],
  size: 8,
}

/** 22 November 2021: day ≠ month ≠ year → the field order is deducible. */
const REF_MASK_DATE = Date.UTC(2021, 10, 22)

/** Directional marks inserted by some locales (ar-EG: U+200F before "/"). */
const BIDI_MARKS = /[‎‏؜]/g

/**
 * Input mask of the locale. `calendar` and `numberingSystem` are FORCED: without
 * them `fa-IR` returns a Persian year (1400) and `ar-EG` Arabic-Indic digits —
 * two values a numeric field could neither display nor read back. Falls back to
 * day/month/year with "/" if the locale is invalid (`RangeError`).
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

    // The first literal located AFTER the first field: hu-HU/ko-KR suffix the
    // format with a dot ("2021. 11. 22.") that must not be mistaken for it.
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
    /* invalid locale → fallback */
  }
  return MASK_FALLBACK
}

/**
 * Digit run → masked text. The separator is placed AS SOON AS the field before
 * it is complete ("22" → "22/"): it shows typing progress without the user
 * having to type it. Corollary on the component side: a Backspace on that
 * separator must delete the DIGIT before it, otherwise the mask rewrites it
 * straight away and the key looks dead.
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
    if (chunk.length < len) break // field still being typed
    if (f < mask.lengths.length - 1) out += mask.separator
  }
  return out
}

/** ISO `YYYY-MM-DD` → masked text of the locale ("10/06/2026"). */
export function isoToMask(iso: string, mask: DateMask): string {
  if (!isValidISO(iso)) return ''
  const [year, month, day] = iso.split('-') as [string, string, string]
  const by: Record<DateMaskField, string> = { year, month, day }
  return formatDateMask(mask.order.map((f) => by[f]).join(''), mask)
}

export interface ParseMaskOptions {
  /**
   * Expansion century for a 2-digit year ("10/06/26" → 2026 with 2000),
   * tolerated only if the year is the LAST field of the mask. Absent = input
   * refused until the year has its 4 digits: that is the mode used while typing,
   * so as not to commit "26" as a year.
   */
  yearPivot?: number
}

/**
 * Masked text → ISO, or `null` if the input is incomplete, over-long or
 * impossible (31/02: `isValidISO` does the `parseISO`/`formatISO` round trip).
 * The `min`/`max` bounds and the disabled dates stay the component's business:
 * this helper knows nothing about props.
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
  if (i !== digits.length) return null // too many digits
  const year =
    (by.year as string).length === 2
      ? String((options.yearPivot as number) + Number(by.year))
      : (by.year as string)
  const iso = `${year}-${by.month}-${by.day}`
  return isValidISO(iso) ? iso : null
}

/**
 * Caret position equivalent to "just after the nth digit" — the only stable
 * landmark across a reformat, since absolute positions jump as soon as a
 * separator appears or disappears. If `separator` is given and follows that
 * position, it is stepped over: while typing, the caret must land in the NEXT
 * field, not in front of the separator that has just appeared. On deletion it is
 * not stepped over (`separator` omitted).
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

/** Ideographic scripts: a repeated "日" does not form a readable template. */
const IDEOGRAPHIC = /[\p{sc=Han}\p{sc=Hangul}\p{sc=Hiragana}\p{sc=Katakana}]/u

// @fallback
/**
 * Field template (en "dd/mm/yyyy", fr "jj/mm/aaaa", de "tt.mm.jjjj",
 * ru "дд/мм/гггг"). The letter comes from the localized field name
 * (`Intl.DisplayNames`), which lands on the attested conventions of every
 * alphabetic script; falls back to Latin if the API is missing (reduced ICU) or
 * if the script is ideographic.
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
    /* Intl.DisplayNames unavailable → fallback */
  }
  return mask.order.map((f, k) => letters[f].repeat(mask.lengths[k] as number)).join(mask.separator)
}
