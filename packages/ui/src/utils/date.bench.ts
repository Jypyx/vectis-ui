/**
 * Benchmark repeated date-formatting calls to exercise memoized Intl construction under field
 * workloads.
 */
import { bench, describe } from 'vitest'

import { buildMonthGrid, firstDayOfWeekFor, formatDateDisplay, weekdayNames } from './date'
import { dateMaskFor, maskPlaceholder } from '../components/VDateInput/mask'
import { monthNames } from '../components/VDatePicker/names'

const LOCALE = 'en-US'
const ISO = '2021-11-22'

describe('memoized — the floor', () => {
  // The formatter is cached after the first call, so this measures a Map lookup, a
  // JSON.stringify of the options literal, and one Intl format.
  bench('formatDateDisplay', () => {
    formatDateDisplay(ISO, LOCALE, { day: 'numeric' })
  })

  bench('formatDateDisplay × 504 (a year of day numbers)', () => {
    for (let i = 0; i < 504; i++) formatDateDisplay(ISO, LOCALE, { day: 'numeric' })
  })

  bench('weekdayNames', () => {
    weekdayNames(LOCALE, 1, 'short')
  })

  bench('monthNames', () => {
    monthNames(LOCALE)
  })
})

describe('memoized per locale — the caches these guard', () => {
  bench('dateMaskFor (DateTimeFormat + formatToParts)', () => {
    dateMaskFor(LOCALE)
  })

  bench('firstDayOfWeekFor (Intl.Locale + getWeekInfo)', () => {
    firstDayOfWeekFor(LOCALE)
  })

  bench('maskPlaceholder (Intl.DisplayNames)', () => {
    maskPlaceholder(LOCALE, dateMaskFor(LOCALE))
  })

  /*
   * What a form of twenty date fields pays at mount, since each instance resolves these in its
   * own `computed`. 4.73 ms before the caches, 0.005 ms after; so this is the line that goes
   * red if one of them is ever removed.
   */
  bench('× 20 (a form of twenty date fields mounting)', () => {
    for (let i = 0; i < 20; i++) {
      const mask = dateMaskFor(LOCALE)
      firstDayOfWeekFor(LOCALE)
      maskPlaceholder(LOCALE, mask)
    }
  })
})

describe('pure arithmetic — no Intl at all', () => {
  bench('buildMonthGrid', () => {
    buildMonthGrid(2021, 10, 1)
  })
})
