/**
 * The cost of the time helpers, and the one figure this repo already quotes from memory.
 *
 * `time.ts` records that building `timeList(1, …)` — 1440 entries, one per minute of the
 * day — measured "~82 ms against ~2 ms memoized". That number has lived in a comment with
 * nothing able to reproduce it. `timeList — every minute` is that measurement, so the claim
 * can be checked rather than trusted, and so a regression in the formatter memo shows up as
 * a number instead of as a slow list nobody attributes to anything.
 *
 * `hourCycleFor` was the file's one helper to escape that memo: it constructed a
 * `DateTimeFormat` and read `resolvedOptions()` on every call. Like the `date.ts` three, its
 * consumers all wrap it in a `computed`, so the cost was per instance rather than per
 * render — twenty time fields cost 1.98 ms at mount before it was cached, 0.0004 ms after.
 * The bench stays to guard the cache.
 */
import { bench, describe } from 'vitest'

import { formatDisplay, hourCycleFor, parseTime, snapMinute, timeList } from './time'

const LOCALE = 'en-US'

describe('timeList — the memo the comment is about', () => {
  // The realistic case: a VTimeInput list at a 15-minute step is 96 rows.
  bench('every 15 minutes (96 rows)', () => {
    timeList(15, LOCALE, '24h')
  })

  // The pathological case the ~82 ms / ~2 ms figure was taken on.
  bench('every minute (1440 rows)', () => {
    timeList(1, LOCALE, '12h')
  })
})

describe('memoized — the floor', () => {
  bench('formatDisplay', () => {
    formatDisplay('14:30', LOCALE, '12h')
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
