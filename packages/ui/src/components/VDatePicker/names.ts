// @core
/**
 * The names of the months, as VDatePicker writes them in its header, its months view and
 * the title of its grid.
 *
 * It sits in the component's folder rather than in `utils/date.ts`: there is one consumer,
 * and `utils/date.ts` is in the import closure of every VCalendar component, which would
 * pay for rules only the picker needs, the `VTimeInput/search.ts` argument.
 *
 * Every name is read on a REFERENCE date pinned to `timeZone: 'UTC'`, so a label never
 * depends on the rendering machine's zone and the server agrees with the browser.
 */

import { memo } from '../../utils/memo'

/** The full names of the twelve months, in January-to-December order. */
export function monthNames(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, MONTH_LONG)
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
 * Month names shortened for the picker's narrow cells: a name of four characters or
 * fewer is kept whole ("May", "June", "July"), a longer one is cut to three
 * characters followed by a dot ("January" becomes "Jan."). The name is spread with
 * `[...n]` rather than indexed, so that an accented or non-Latin character counts as
 * one character and is never cut in half.
 *
 * TRAP — the cut is not safe everywhere. Vietnamese writes every month "Tháng N", so all
 * twelve come out "Thá.", and Estonian, Czech, Lithuanian or Greek lose a pair; the months
 * view then shows identical cells. When the cut repeats itself, the language's own short
 * names are used instead, which CLDR keeps distinct.
 */
export function monthNamesCompact(locale: string): string[] {
  const cut = monthNames(locale).map((n) => {
    const chars = [...n]
    return chars.length <= 4 ? n : chars.slice(0, 3).join('') + '.'
  })
  if (new Set(cut).size === 12) return cut
  const fmt = new Intl.DateTimeFormat(locale, { ...MONTH_LONG, month: 'short' })
  return Array.from({ length: 12 }, (_, i) => fmt.format(Date.UTC(2021, i, 1)))
}

/**
 * One formatter kept per locale and set of options, for the lifetime of the module: the
 * two functions below are asked one month at a time, and building an `Intl` formatter
 * costs far more than using one.
 */
const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return memo(
    formatters,
    `${locale}|${JSON.stringify(options)}`,
    () => new Intl.DateTimeFormat(locale, options),
  )
}

/** The full name of one month, 0 being January. */
export function monthName(locale: string, month0: number): string {
  return formatterFor(locale, MONTH_LONG).format(Date.UTC(2021, month0, 1))
}

/**
 * A month and its year written the way the language writes them together: "June 2026",
 * "juin 2026", but "2026年6月" in Japanese and "2026. június" in Hungarian, where gluing the
 * two with a space gets the order wrong. The digits are Latin, as on the year button.
 */
export function monthYearName(locale: string, year: number, month0: number): string {
  const at = new Date(Date.UTC(2021, month0, 1))
  at.setUTCFullYear(year)
  return formatterFor(locale, {
    ...MONTH_LONG,
    year: 'numeric',
    numberingSystem: 'latn',
  }).format(at)
}
