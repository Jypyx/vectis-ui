// @ssr @core — module-wide: every export below is @core unless tagged otherwise.
/**
 * The TIME domain behind VTimePicker and VTimeInput. Pure: nothing here draws or touches
 * the page, and the same numbers always give the same answer.
 *
 * A time is always the canonical 24-hour string `'HH:mm'`, whatever is being SHOWN — a
 * picker displaying "7:05 PM" still holds `'19:05'`. That is what keeps the value a
 * consumer receives independent of the reader's locale.
 *
 * `Intl` is asked on UTC reference instants only, so nothing depends on the host clock and
 * the server render agrees with the browser's.
 *
 * The dial's geometry lives here too, and for a practical reason: jsdom lays nothing out and
 * measures every element at zero, so a calculation kept inside the component is untestable.
 */
import { digitsOf, pad2 } from './text'

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

/**
 * Turns an hour of the 24-hour clock into the hour a 12-hour clock face shows, together
 * with which half of the day it belongs to: midnight is 12 AM, noon is 12 PM, and eleven
 * at night is 11 PM.
 */
export function to12h(hour24: number): { hour: number; meridiem: Meridiem } {
  const meridiem: Meridiem = hour24 >= 12 ? 'PM' : 'AM'
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12
  return { hour, meridiem }
}

/**
 * The way back: an hour read off a 12-hour clock face, plus the half of the day it is in,
 * gives the hour on the 24-hour clock — 12 in the morning is 0, 12 in the afternoon is 12.
 */
export function to24h(hour12: number, meridiem: Meridiem): number {
  const base = hour12 % 12 // Twelve is the zero of the cycle, not its top.
  return meridiem === 'PM' ? base + 12 : base
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
  const cached = hourCycleCache.get(locale)
  if (cached) return cached
  const format = resolveHourCycle(locale)
  hourCycleCache.set(locale, format)
  return format
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
  const key = `${locale}|${format}`
  let formatter = displayFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: format === '12h' ? 'h12' : 'h23',
      timeZone: 'UTC',
    })
    displayFormatters.set(key, formatter)
  }
  return formatter
}

/**
 * A time written out for a reader: "19:05", or "7:05 PM".
 *
 * `hourCycle` is imposed rather than left to `Intl`, so the text follows what the component
 * settled on: a consumer asking for a 24-hour clock in a locale that would choose otherwise
 * must get theirs.
 */
export function formatDisplay(time: string, locale: string, format: HourFormat): string {
  const parts = parseTime(time)
  if (!parts) return ''
  return displayFormatterFor(locale, format).format(Date.UTC(2021, 0, 1, parts.hour, parts.minute))
}

/**
 * Snaps a minute to the nearest allowed step and wraps it back inside the hour.
 *
 * Both ends need the wrap: 58 snapped to five-minute steps lands on 60, which is 0, and
 * stepping back from 0 with the keyboard passes through -1, which is 59.
 */
export function snapMinute(minute: number, step: number): number {
  const snapped = step <= 1 ? Math.round(minute) : Math.round(minute / step) * step
  return ((snapped % 60) + 60) % 60
}

/**
 * Which mark a pointer offset from the dial's centre is aiming at. Marks are numbered
 * clockwise from twelve o'clock and the nearest wins. `dy` is negated because screen
 * coordinates grow DOWNWARD and the angle is measured from the top.
 */
export function angleToIndex(dx: number, dy: number, segments: number): number {
  // The angle from twelve o'clock, clockwise-positive, as a fraction of a full turn.
  const angle = Math.atan2(dx, -dy)
  const turn = (angle / (2 * Math.PI) + 1) % 1
  return Math.round(turn * segments) % segments
}

/** How far from the centre a finger landed, as a fraction: nothing at the centre, one at the edge. */
export function distanceFraction(dx: number, dy: number, radius: number): number {
  return radius > 0 ? Math.hypot(dx, dy) / radius : 0
}

/**
 * How close to the centre a pointer must land to be aiming at the INNER ring, the one
 * holding the small hours of a 24-hour dial: the halfway mark between the two rings.
 *
 * TRAP — the number is DERIVED from the dial tokens. A 256px dial with 48px numerals puts
 * the rings' centres at 104px and 56px from the middle, whose midpoint is 0.625 of the
 * radius. Change either token without changing this and the threshold no longer separates
 * the two rings: a tap near the boundary quietly sets the wrong hour.
 */
export const DIAL_INNER_THRESHOLD = 0.625

/**
 * Which hour a mark stands for on the two-ring dial: outer carries 12 then 1-11, inner
 * carries 00 then 13-23. Index 0 of each is the mark at twelve o'clock.
 */
export function dialIndexToHour24(index: number, ring: 'outer' | 'inner'): number {
  if (ring === 'outer') return index === 0 ? 12 : index
  return index === 0 ? 0 : index + 12
}

/** The way back, which is what tells the hand where to point. */
export function hour24ToDial(hour: number): { index: number; ring: 'outer' | 'inner' } {
  if (hour === 0) return { index: 0, ring: 'inner' }
  if (hour === 12) return { index: 0, ring: 'outer' }
  if (hour > 12) return { index: hour - 12, ring: 'inner' }
  return { index: hour, ring: 'outer' }
}

export interface TimeOption {
  /** The canonical time, which is what the component's value will be set to. */
  value: string
  /** The same time written out for the reader: "07:30", or "7:30 AM". */
  label: string
}

/** A time as minutes since midnight, `null` if it is not one — its position in a list. */
export function minutesOf(time: string | null | undefined): number | null {
  const parts = parseTime(time)
  return parts ? parts.hour * 60 + parts.minute : null
}

/**
 * Every time of the day at a given interval, midnight to the last one before the next.
 *
 * There is deliberately no earliest or latest, VTimePicker having none: do not invent one.
 * A nonsensical step — zero, a fraction, more than an hour — falls back to hourly, so the
 * list stays FINITE even when the component's warning about it was ignored.
 */
export function timeList(step: number, locale: string, format: HourFormat): TimeOption[] {
  const safe = Number.isInteger(step) && step >= 1 && step <= 60 ? step : 60
  const out: TimeOption[] = []
  for (let m = 0; m < 24 * 60; m += safe) {
    const value = formatTime(Math.floor(m / 60), m % 60)
    out.push({ value, label: formatDisplay(value, locale, format) })
  }
  return out
}

/*
 * Unlike a date's separator this one is UNIVERSAL: every language writes a time with a
 * colon, and only the 12/24-hour cycle varies. It therefore stays out of the dictionary,
 * where the empty field's `hh:mm` placeholder does belong — that one is made of the
 * initials of words.
 */
const TIME_SEPARATOR = ':'

/**
 * Lays a run of typed digits out as a time. The colon appears AS SOON AS the hour is
 * complete — typing "09" already gives "09:" — exactly as a date's separators do.
 */
export function formatTimeMask(digits: string): string {
  const all = digitsOf(digits).slice(0, 4)
  return all.length >= 2 ? `${all.slice(0, 2)}${TIME_SEPARATOR}${all.slice(2)}` : all
}

/**
 * Where the caret belongs to sit just after `n` digits. A closed formula rather than
 * `date.ts`'s scan, the colon always being in the same place.
 *
 * `skipSeparator` means something was INSERTED, and the caret then steps over the colon
 * into the minutes. On a DELETION it stays in front of it, or the next Backspace steps
 * over the colon instead of erasing a digit and the key appears to do nothing.
 */
export function timeCaret(n: number, skipSeparator = false): number {
  if (n < 2) return n
  if (n === 2) return skipSeparator ? 3 : 2
  return Math.min(n + 1, 5)
}

/**
 * A canonical time written into the field in whichever form is SHOWN. On a 12-hour clock the
 * hour comes back into 1-12: the meridiem belongs to the toggle beside the field, never to
 * the text.
 */
export function timeToMask(time: string | null | undefined, format: HourFormat): string {
  const parts = parseTime(time)
  if (!parts) return ''
  const hour = format === '12h' ? to12h(parts.hour).hour : parts.hour
  return formatTimeMask(pad2(hour) + pad2(parts.minute))
}

/**
 * What was typed read back into a canonical time, or `null` when it is incomplete, too long
 * or not a real time. On a 12-hour clock this is the ONE place the typed digits and the
 * meridiem toggle meet.
 */
export function parseTimeMask(
  text: string,
  format: HourFormat,
  meridiem: Meridiem = 'AM',
): string | null {
  const digits = digitsOf(text)
  if (digits.length !== 4) return null
  const hour = Number(digits.slice(0, 2))
  const minute = Number(digits.slice(2))
  if (minute > 59) return null
  if (format === '12h')
    return hour >= 1 && hour <= 12 ? formatTime(to24h(hour, meridiem), minute) : null
  return hour <= 23 ? formatTime(hour, minute) : null
}
