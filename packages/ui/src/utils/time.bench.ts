/** Benchmark repeated time formatting and its Intl cache. */
import { test } from 'vitest'

import { formatTimeDisplay, hourCycleFor, parseTime } from './time'
import { snapMinute, timeList } from './clock'

const LOCALE = 'en-US'

test('timeList — the memo the comment is about', async ({ bench }) => {
  await bench.compare(
    bench('every 15 minutes (96 rows)', () => {
      timeList(15, LOCALE, '24h')
    }),
    bench('every minute (1440 rows)', () => {
      timeList(1, LOCALE, '12h')
    }),
  )
})

test('memoized — the floor', async ({ bench }) => {
  await bench('formatTimeDisplay', () => {
    formatTimeDisplay('14:30', LOCALE, '12h')
  }).run()
})

test('memoized per locale — the cache these guard', async ({ bench }) => {
  await bench.compare(
    bench('hourCycleFor (DateTimeFormat + resolvedOptions)', () => {
      hourCycleFor(LOCALE)
    }),
    bench('× 20 (a form of twenty time fields mounting)', () => {
      for (let i = 0; i < 20; i++) hourCycleFor(LOCALE)
    }),
  )
})

test('pure — no Intl at all', async ({ bench }) => {
  await bench.compare(
    bench('parseTime', () => {
      parseTime('14:30')
    }),
    bench('snapMinute', () => {
      snapMinute(32, 5)
    }),
  )
})
