// @ssr @core — module-wide: every export below is @core unless tagged otherwise.
/**
 * What the CLOCK and the FIELD need of the time domain: the AM/PM arithmetic, the dial's
 * geometry, the typing mask and the list of times. VTimePicker and VTimeInput are its only
 * consumers; `./time` holds what VCalendar reads as well, and this is kept apart so that
 * no calendar pays for a dial it never draws.
 *
 * The dial's geometry lives here rather than in the component for a practical reason: jsdom
 * lays nothing out and measures every element at zero, so a calculation kept inside the
 * component is untestable.
 */
import { digitsOf, pad2 } from './text'
import { formatTime, parseTime, formatTimeDisplay } from './time'
import type { HourFormat, Meridiem } from './time'

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

/**
 * The same hour moved into the other half of the day, or left where it is: 9 with PM gives
 * 21, and 21 with PM stays 21. It is what an AM/PM control does to the hour it qualifies.
 */
export function hourWithMeridiem(hour24: number, meridiem: Meridiem): number {
  return to24h(to12h(hour24).hour, meridiem)
}

/**
 * A canonical time moved into a half of the day, its minutes untouched, or `null` when it is
 * not a time at all: `'09:30'` with PM gives `'21:30'`.
 */
export function withMeridiem(time: string | null | undefined, meridiem: Meridiem): string | null {
  const parts = parseTime(time)
  return parts ? formatTime(hourWithMeridiem(parts.hour, meridiem), parts.minute) : null
}

/**
 * Snaps a minute to the nearest allowed step and wraps it back inside the hour.
 *
 * Both ends need the wrap: 58 snapped to five-minute steps lands on 60, which is 0, and
 * stepping back from 0 with the keyboard passes through -1, which is 59.
 */
export function snapMinute(minute: number, step: number): number {
  // A step is whole minutes: 7.5 divides 60, and wrote `09:7.5` into the model.
  const size = Math.round(step)
  const snapped = size <= 1 ? Math.round(minute) : Math.round(minute / size) * size
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
 * How close to the centre a pointer lands on NOTHING. At the very centre there is no angle
 * at all (`atan2(0, 0)` answers half a turn, which would set six o'clock), and the centre dot
 * drawn there is not a numeral.
 *
 * TRAP — derived from the same tokens as the threshold above: the inner ring's numerals
 * start 32px from the middle (56px less half a 48px numeral), 0.25 of the radius, so the
 * dead zone stops short of them. Grow it past 0.25 and the inner small hours lose their
 * inner half to it.
 */
export const DIAL_DEAD_ZONE = 0.2

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

/**
 * Every time of the day at a given interval, midnight to the last one before the next.
 *
 * It knows nothing of the restrictions: VTimeInput filters the rows it offers, so the list
 * itself stays one table per step and locale.
 *
 * A nonsensical step — zero, a fraction, more than an hour — falls back to hourly, so the
 * list stays FINITE even when the component's warning about it was ignored.
 */
export function timeList(step: number, locale: string, format: HourFormat): TimeOption[] {
  const safe = Number.isInteger(step) && step >= 1 && step <= 60 ? step : 60
  const out: TimeOption[] = []
  for (let m = 0; m < 24 * 60; m += safe) {
    const value = formatTime(Math.floor(m / 60), m % 60)
    out.push({ value, label: formatTimeDisplay(value, locale, format) })
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
