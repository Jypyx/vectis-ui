// @ssr @core — module-wide: every export below is @core unless tagged otherwise.
/**
 * All the reasoning about TIMES that the time picker and its clock face rest on. Nothing
 * here draws anything or touches the page: give it the same numbers twice and it answers
 * the same way twice.
 *
 * A time is always carried as text of the form "19:05", counted on the 24-hour clock, no
 * matter how it is being SHOWN — a picker displaying "7:05 PM" still holds "19:05". That
 * one rule is what keeps the value a consumer receives independent of the reader's
 * language and habits.
 *
 * Dates are used only to ask the browser to write a time out in someone's language, and
 * always at a fixed reference instant taken in universal time. Nothing here therefore
 * depends on the clock of the machine it runs on, which is what lets a page rendered on a
 * server and the same page in the browser agree.
 *
 * The clock face's geometry — where a finger landed, which ring it fell on — is worked
 * out here too, and for a practical reason: the environment the tests run in has no
 * layout at all and measures every element as having no size, so a calculation kept
 * inside the component could not be tested.
 */
import { clamp } from './number'
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

// @fallback
/**
 * Whether a language counts the hours to twelve, with a morning and an afternoon, or
 * straight to twenty-four. It is the browser that knows, and it is asked.
 *
 * A language tag it cannot make sense of falls back to the 24-hour clock rather than
 * failing.
 */
export function hourCycleFor(locale: string): HourFormat {
  try {
    const { hourCycle } = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
    return hourCycle === 'h11' || hourCycle === 'h12' ? '12h' : '24h'
  } catch {
    return '24h'
  }
}

/**
 * One formatter per language and clock, kept for as long as the page lives — the same
 * arrangement as the one that writes out file sizes.
 *
 * Building a formatter costs one to two orders of magnitude more than using one, and the
 * list of times is built ONE ENTRY AT A TIME: a list at one-minute intervals is 1440
 * entries, so 1440 formatters would be built every time it is recalculated — measured at
 * around 82 ms, against 2 ms once they are kept. Both the language AND the clock make up
 * the key, since the clock is imposed below rather than following from the language.
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
 * A time written out for a reader — "19:05", or "7:05 PM".
 *
 * The choice of clock is imposed on the browser rather than left to it, so that the text
 * follows what the component settled on. A consumer may ask for a 24-hour clock in a
 * language that would have chosen otherwise, and their choice must be the one that shows.
 */
export function formatDisplay(time: string, locale: string, format: HourFormat): string {
  const parts = parseTime(time)
  if (!parts) return ''
  return displayFormatterFor(locale, format).format(Date.UTC(2021, 0, 1, parts.hour, parts.minute))
}

/** Holds a whole number between two bounds, rounding first — what comes in is free-form. */
export function clampInt(n: number, min: number, max: number): number {
  return clamp(Math.round(n), min, max)
}

/**
 * Snaps a minute to the nearest one the component allows — every five minutes, say — and
 * brings it back inside the hour.
 *
 * Both ends need that last part: 58 minutes snapped to five-minute steps lands on 60,
 * which is 0, and stepping back from 0 with the keyboard goes through minus one, which is
 * 59.
 */
export function snapMinute(minute: number, step: number): number {
  const snapped = step <= 1 ? Math.round(minute) : Math.round(minute / step) * step
  return ((snapped % 60) + 60) % 60
}

/**
 * Where a finger landed on the clock face, given as an offset from the centre, becomes
 * which mark it was pointing at.
 *
 * The marks are numbered from the twelve o'clock position and go round clockwise, and the
 * nearest one wins. The offsets are the ones the screen uses, where going DOWN is
 * positive, which is why the vertical one is negated to measure the angle from the top.
 */
export function angleToIndex(dx: number, dy: number, segments: number): number {
  // The angle from twelve o'clock, positive going clockwise, then that same angle as a
  // fraction of a full turn.
  const angle = Math.atan2(dx, -dy)
  const turn = (angle / (2 * Math.PI) + 1) % 1
  return Math.round(turn * segments) % segments
}

/** How far from the centre a finger landed, as a fraction: nothing at the centre, one at the edge. */
export function distanceFraction(dx: number, dy: number, radius: number): number {
  return radius > 0 ? Math.hypot(dx, dy) / radius : 0
}

/**
 * How close to the centre a finger has to land for it to be aiming at the INNER ring of
 * numbers, the one holding the small hours of a 24-hour clock. It is the halfway mark
 * between the two rings of numerals.
 *
 * TRAP — the number is DERIVED from the dial's size and the size of a numeral, both of
 * which are decided in the stylesheet: a dial of 256px across and numerals of 48px put
 * the two rings' centres at 104px and 56px from the middle, whose halfway point is
 * 0.625 of the radius. Changing either size in the CSS without changing this leaves the
 * threshold between two rings it no longer separates, and a tap near the boundary quietly
 * sets the wrong hour.
 */
export const DIAL_INNER_THRESHOLD = 0.625

/**
 * Which hour a mark stands for, on a dial laid out as two rings: the outer one carries 12
 * then 1 to 11, the inner one carries midnight then 13 to 23. The first mark of each is
 * the one at the twelve o'clock position.
 */
export function dialIndexToHour24(index: number, ring: 'outer' | 'inner'): number {
  if (ring === 'outer') return index === 0 ? 12 : index
  return index === 0 ? 0 : index + 12
}

/**
 * The way back, which is what tells the hand where to point: midnight is the top of the
 * inner ring, noon the top of the outer one, and three in the afternoon the third mark of
 * the inner ring.
 */
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

/**
 * A time as a count of minutes since midnight, or nothing if it is not a time. It is what
 * gives a time its position in a list.
 */
export function minutesOf(time: string | null | undefined): number | null {
  const parts = parseTime(time)
  return parts ? parts.hour * 60 + parts.minute : null
}

/**
 * Every time of the day at a given interval, from midnight up to the last one before the
 * next.
 *
 * There is deliberately no earliest or latest here, because the time picker itself has
 * none: do not invent one.
 *
 * An interval that makes no sense — nothing, a fraction, more than an hour — falls back
 * to one an hour. The list has to stay FINITE even when the warning the component prints
 * about it was ignored, since an interval of zero would build times for ever.
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
 * What separates the hours from the minutes as a time is typed.
 *
 * Unlike a date's separator, this one is the SAME everywhere: every language writes a
 * time with a colon, and what varies between them is only whether the hours run to twelve
 * or to twenty-four.
 *
 * The grey template shown in an empty field lives in the dictionary instead, because
 * "hh:mm" is made of the initials of WORDS and those do change from one language to the
 * next — where the colon does not.
 */
export const TIME_SEPARATOR = ':'

/**
 * Lays a run of typed digits out as a time. The colon appears AS SOON AS the hour is
 * complete — typing "09" already gives "09:" — exactly as a date's separators do.
 */
export function formatTimeMask(digits: string): string {
  const all = digitsOf(digits).slice(0, 4)
  return all.length >= 2 ? `${all.slice(0, 2)}${TIME_SEPARATOR}${all.slice(2)}` : all
}

/**
 * Where the caret belongs so as to sit just after a given number of digits.
 *
 * It is a plain formula rather than a scan of the text, because a time's separator is
 * always in the same place — which is exactly what the date's equivalent cannot assume,
 * since the order and the width of its parts change from one language to the next.
 *
 * The flag says something was INSERTED, and the caret then steps over the colon into the
 * minutes. On a deletion it stays in FRONT of it, or the next press of the key would step
 * over the colon instead of erasing a digit, and the key would appear to do nothing.
 */
export function timeCaret(n: number, skipSeparator = false): number {
  if (n < 2) return n
  if (n === 2) return skipSeparator ? 3 : 2
  return Math.min(n + 1, 5)
}

/**
 * Writes a canonical time into the field, in whichever form is being SHOWN. On a 12-hour
 * clock the hour is brought back into the range 1 to 12: which half of the day it is
 * belongs to the pair of buttons beside the field, and never to the text itself.
 */
export function timeToMask(time: string | null | undefined, format: HourFormat): string {
  const parts = parseTime(time)
  if (!parts) return ''
  const hour = format === '12h' ? to12h(parts.hour).hour : parts.hour
  return formatTimeMask(pad2(hour) + pad2(parts.minute))
}

/**
 * Reads what has been typed back into a canonical time, or nothing at all when it is
 * incomplete, too long, or not a time anyone could point to.
 *
 * On a 12-hour clock the half of the day comes from the pair of buttons beside the field.
 * This is the ONE place where what was typed and that choice meet.
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
