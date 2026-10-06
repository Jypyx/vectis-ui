// @ssr
/** Writes out the moment of a timeline event at the precision its ISO string gives. */

import { parseISO } from '../../utils/date'
import { memo } from '../../utils/memo'

const YEAR_RE = /^(\d{4})$/
const MONTH_RE = /^(\d{4})-(\d{2})$/
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

const YEAR_FORMAT: Intl.DateTimeFormatOptions = { year: 'numeric' }
const MONTH_FORMAT: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' }
const DAY_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
const DATETIME_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return memo(
    formatters,
    `${locale}|${JSON.stringify(options)}`,
    () => new Intl.DateTimeFormat(locale, options),
  )
}

/** A year or a month read at local time, like a calendar date. */
function localMonth(year: number, month0: number): Date {
  const date = new Date(2000, month0, 1)
  date.setFullYear(year, month0, 1)
  return date
}

/**
 * The text shown for `datetime`. A year (`2019`) is written as a year and a month (`2026-10`) as
 * a month; `options` replaces the format of a day (`2026-10-06`) or of a moment
 * (`2026-10-06T14:30`), which are `dateStyle: 'medium'`, plus `timeStyle: 'short'` for a moment.
 * A value the browser cannot read is shown as it is.
 */
export function formatTimelineDate(
  datetime: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const year = YEAR_RE.exec(datetime)
  if (year) return formatterFor(locale, YEAR_FORMAT).format(localMonth(Number(year[1]), 0))

  const month = MONTH_RE.exec(datetime)
  if (month) {
    const month0 = Number(month[2]) - 1
    if (month0 < 0 || month0 > 11) return datetime
    return formatterFor(locale, MONTH_FORMAT).format(localMonth(Number(month[1]), month0))
  }

  if (DAY_RE.test(datetime)) {
    const day = parseISO(datetime)
    return day ? formatterFor(locale, options ?? DAY_FORMAT).format(day) : datetime
  }

  // A moment without an offset is read at local time, one with an offset (`Z`, `+02:00`) as the
  // instant it names, shown in the time zone the code runs in unless `options` sets one.
  const moment = new Date(datetime)
  if (Number.isNaN(moment.getTime())) return datetime
  return formatterFor(locale, options ?? DATETIME_FORMAT).format(moment)
}
