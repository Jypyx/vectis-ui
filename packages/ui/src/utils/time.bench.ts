/** Benchmark repeated time formatting and its Intl cache. */
import { bench, describe } from 'vitest'

import { formatTimeDisplay, hourCycleFor, parseTime } from './time'
import { snapMinute, timeList } from './clock'

const LOCALE = 'en-US'

describe('timeList — the memo the comment is about', () => {
  bench('every 15 minutes (96 rows)', () => {
    timeList(15, LOCALE, '24h')
  })

  bench('every minute (1440 rows)', () => {
    timeList(1, LOCALE, '12h')
  })
})

describe('memoized — the floor', () => {
  bench('formatTimeDisplay', () => {
    formatTimeDisplay('14:30', LOCALE, '12h')
  })
})

describe('memoized per locale — the cache these guard', () => {
  bench('hourCycleFor (DateTimeFormat + resolvedOptions)', () => {
    hourCycleFor(LOCALE)
  })

  bench('× 20 (a form of twenty time fields mounting)', () => {
    for (let i = 0; i < 20; i++) hourCycleFor(LOCALE)
  })
})

describe('pure — no Intl at all', () => {
  bench('parseTime', () => {
    parseTime('14:30')
  })

  bench('snapMinute', () => {
    snapMinute(32, 5)
  })
})
