// @core
/**
 * Format reference dates in UTC so month and weekday names do not vary with the rendering
 * machine's time zone.
 */

import { dateFormatter } from '../../utils/date'

/** The full names of the twelve months, in January-to-December order. */
export function monthNames(locale: string): string[] {
  const fmt = dateFormatter(locale, MONTH_LONG)
  return Array.from({ length: 12 }, (_, i) => fmt.format(Date.UTC(2021, i, 1)))
}

/**
 * The options every month name is read with. `calendar: 'gregory'` is not optional: the
 * grid is Gregorian, and a locale whose default calendar is another one (fa-IR, or any tag
 * carrying `-u-ca-islamic`) would otherwise title a January grid with the month of ITS
 * calendar that happens to hold the 1st, "Dey" in Persian.
 */
const MONTH_LONG = { month: 'long', calendar: 'gregory', timeZone: 'UTC' } as const

/**
 * The cut is not safe everywhere. Vietnamese writes every month "Tháng N", so all twelve come
 * out "Thá.", and Estonian, Czech, Lithuanian or Greek lose a pair; the months view then shows
 * identical cells.
 */
export function monthNamesCompact(locale: string): string[] {
  const cut = monthNames(locale).map((n) => {
    const chars = [...n]
    return chars.length <= 4 ? n : chars.slice(0, 3).join('') + '.'
  })
  if (new Set(cut).size === 12) return cut
  const fmt = dateFormatter(locale, { ...MONTH_LONG, month: 'short' })
  return Array.from({ length: 12 }, (_, i) => fmt.format(Date.UTC(2021, i, 1)))
}

/** The full name of one month, 0 being January. */
export function monthName(locale: string, month0: number): string {
  return dateFormatter(locale, MONTH_LONG).format(Date.UTC(2021, month0, 1))
}

/**
 * A month and its year written the way the language writes them together: "June 2026", "juin
 * 2026", but "2026年6月" in Japanese and "2026. június" in Hungarian, where gluing the two with a
 * space gets the order wrong.
 */
export function monthYearName(locale: string, year: number, month0: number): string {
  const at = new Date(Date.UTC(2021, month0, 1))
  at.setUTCFullYear(year)
  return dateFormatter(locale, {
    ...MONTH_LONG,
    year: 'numeric',
    numberingSystem: 'latn',
  }).format(at)
}
