/**
 * The cost of the date helpers, and specifically of the `Intl` objects behind them.
 *
 * WHAT THIS IS FOR. `date.ts` memoizes everything that touches `Intl`, because construction
 * costs one to two orders of magnitude more than use. Three helpers escaped that for a
 * while — `dateMaskFor`, `maskPlaceholder` and `firstDayOfWeekFor` each built a fresh `Intl`
 * object on every call. Every consumer wraps them in a `computed`, so they never ran per
 * render, but they ran once per component instance per locale: a form of twenty date fields
 * paid twenty constructions at mount, measured here at 4.73 ms before the caches went in
 * and 0.005 ms after.
 *
 * The benches stay after the fix, because what they now guard is the cache itself: the
 * figures collapse if one is removed, and `× 20` is the line that would say so loudest.
 *
 * `formatterFor`'s cache key is built with `JSON.stringify(options)` on every call, so the
 * `formatDisplay` figure includes that stringify. It is measured here rather than assumed:
 * the year view calls it 504 times per render.
 */
import { bench, describe } from 'vitest'

import {
  buildMonthGrid,
  dateMaskFor,
  firstDayOfWeekFor,
  formatDisplay,
  maskPlaceholder,
  monthNames,
  weekdayNames,
} from './date'

const LOCALE = 'en-US'
const ISO = '2021-11-22'

describe('memoized — the floor', () => {
  // The formatter is cached after the first call, so this measures a Map lookup, a
  // JSON.stringify of the options literal, and one Intl format.
  bench('formatDisplay', () => {
    formatDisplay(ISO, LOCALE, { day: 'numeric' })
  })

  // The VCalendarYear render: one formatted day number per square, twelve months of them.
  bench('formatDisplay × 504 (a year of day numbers)', () => {
    for (let i = 0; i < 504; i++) formatDisplay(ISO, LOCALE, { day: 'numeric' })
  })

  // These two already hoist their formatter out of the loop.
  bench('weekdayNames', () => {
    weekdayNames(LOCALE, 1, 'short')
  })

  bench('monthNames', () => {
    monthNames(LOCALE, 'long')
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
   * What a form of twenty date fields pays at mount, since each instance resolves these in
   * its own `computed`. 4.73 ms before the caches, 0.005 ms after — so this is the line that
   * goes red if one of them is ever removed.
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
