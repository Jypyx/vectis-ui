// @ssr @core — module-wide: every export below is @core unless tagged otherwise.
/**
 * The TIME domain every component that shows a time shares: VTimePicker, VTimeInput and the
 * VCalendar views. Pure: nothing here draws or touches the page, and the same numbers always
 * give the same answer.
 *
 * TRAP — what only the clock and the field need lives in `./clock`, not here. This module
 * is in the import closure of every VCalendar component (`minutesOf`, `hourCycleFor`,
 * `formatTimeDisplay`), and anything added to it is paid by each of them: the dial, the
 * AM/PM arithmetic, the typing mask and the list of times weighed some 600 B gzip on
 * `VCalendarYear`, which shows no time at all.
 *
 * A time is always the canonical 24-hour string `'HH:mm'`, whatever is being SHOWN — a
 * picker displaying "7:05 PM" still holds `'19:05'`. That is what keeps the value a
 * consumer receives independent of the reader's locale.
 *
 * `Intl` is asked on UTC reference instants only, so nothing depends on the host clock and
 * the server render agrees with the browser's.
 */
import { memo } from './memo'
import { pad2 } from './text'

export type HourFormat = '12h' | '24h'
export type Meridiem = 'AM' | 'PM'

export interface TimeParts {
  /** The hour on the 24-hour clock, from 0 to 23. */
  hour: number
  minute: number
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

/** Whether something is a time in the canonical form — two digits, a colon, two digits. */
export function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_RE.test(value)
}

/** Reads a canonical time into its two numbers, or nothing at all if it is not one. */
export function parseTime(value: string | null | undefined): TimeParts | null {
  if (!isValidTime(value)) return null
  const [h, m] = value.split(':')
  return { hour: Number(h), minute: Number(m) }
}

/** Writes an hour and a minute back into the canonical form, both on two digits. */
export function formatTime(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`
}

const hourCycleCache = new Map<string, HourFormat>()

// @fallback
/**
 * Whether a language counts the hours to twelve, with a morning and an afternoon, or
 * straight to twenty-four. It is the browser that knows, and it is asked.
 *
 * A language tag it cannot make sense of falls back to the 24-hour clock rather than
 * failing.
 */
export function hourCycleFor(locale: string): HourFormat {
  return memo(hourCycleCache, locale, () => resolveHourCycle(locale))
}

function resolveHourCycle(locale: string): HourFormat {
  try {
    const { hourCycle } = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
    return hourCycle === 'h11' || hourCycle === 'h12' ? '12h' : '24h'
  } catch {
    return '24h'
  }
}

/**
 * One formatter per locale and clock, module-lived — the `formatterFor` idiom of `file.ts`.
 *
 * Construction costs one to two orders of magnitude more than use, and `timeList` formats
 * ONE VALUE AT A TIME: 1440 entries at one-minute steps, so 1440 constructions per rebuild.
 * Measured at ~82 ms against ~2 ms memoized. The clock is part of the key because it is
 * imposed below rather than following from the locale.
 */
const displayFormatters = new Map<string, Intl.DateTimeFormat>()

function displayFormatterFor(locale: string, format: HourFormat): Intl.DateTimeFormat {
  return memo(
    displayFormatters,
    `${locale}|${format}`,
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hourCycle: format === '12h' ? 'h12' : 'h23',
        timeZone: 'UTC',
      }),
  )
}

/**
 * A time written out for a reader: "19:05", or "7:05 PM".
 *
 * `hourCycle` is imposed rather than left to `Intl`, so the text follows what the component
 * settled on: a consumer asking for a 24-hour clock in a locale that would choose otherwise
 * must get theirs.
 */
export function formatTimeDisplay(time: string, locale: string, format: HourFormat): string {
  const parts = parseTime(time)
  if (!parts) return ''
  return displayFormatterFor(locale, format).format(Date.UTC(2021, 0, 1, parts.hour, parts.minute))
}

/** A time as minutes since midnight, `null` if it is not one — its position in a list. */
export function minutesOf(time: string | null | undefined): number | null {
  const parts = parseTime(time)
  return parts ? parts.hour * 60 + parts.minute : null
}
