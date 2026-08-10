// @ssr @core — module-wide: every export below is @core unless tagged otherwise.
/**
 * PURE time utilities (VTimePicker, VTimePickerDial).
 *
 * Contract: the public API deals in `HH:mm` strings in **canonical 24 h** (the
 * VTimePicker v-model, whatever the 12 h / 24 h display). `Date` objects only
 * serve `Intl`, on REFERENCE instants in `timeZone: 'UTC'`, so the output never
 * depends on the machine's zone (SSR-safe).
 *
 * The dial geometry (pointer → sector/ring conversion) lives here as pure
 * functions: jsdom measures nothing (`getBoundingClientRect` returns zeroes), so
 * this is the only way to cover it in vitest.
 */
import { clamp } from './number'
import { digitsOf, pad2 } from './text'

export type HourFormat = '12h' | '24h'
export type Meridiem = 'AM' | 'PM'

export interface TimeParts {
  /** Canonical 24 h hour (0–23). */
  hour: number
  minute: number
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_RE.test(value)
}

export function parseTime(value: string | null | undefined): TimeParts | null {
  if (!isValidTime(value)) return null
  const [h, m] = value.split(':')
  return { hour: Number(h), minute: Number(m) }
}

export function formatTime(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`
}

/** 24 h → 12 h dial: 0 → {12, AM}, 12 → {12, PM}, 23 → {11, PM}. */
export function to12h(hour24: number): { hour: number; meridiem: Meridiem } {
  const meridiem: Meridiem = hour24 >= 12 ? 'PM' : 'AM'
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12
  return { hour, meridiem }
}

/** 12 h dial + meridiem → 24 h: (12, AM) → 0, (12, PM) → 12. */
export function to24h(hour12: number, meridiem: Meridiem): number {
  const base = hour12 % 12 // 12 → 0
  return meridiem === 'PM' ? base + 12 : base
}

// @fallback
/**
 * Hour cycle of the locale: `h11`/`h12` → 12 h (AM/PM), `h23`/`h24` → 24 h.
 * Falls back to 24 h if the locale is invalid.
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
 * One formatter per (locale, format) pair, kept for the lifetime of the module —
 * the `formatterFor` idiom of `utils/file.ts`.
 *
 * Constructing an `Intl.DateTimeFormat` costs one to two orders of magnitude more
 * than using it, and `timeList` formats ONE ENTRY AT A TIME: at `minuteStep: 1`
 * that is 1440 constructions per recompute (measured at ~82 ms, against ~2 ms
 * memoized). The pair is the whole key — `format` is forced below, so it does not
 * follow from the locale.
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
 * Localized display of the field ("19:05", "7:05 PM"). The `hourCycle` is forced
 * (h23/h12) so it follows the component's resolved `format`, not the locale's raw
 * preference.
 */
export function formatDisplay(time: string, locale: string, format: HourFormat): string {
  const parts = parseTime(time)
  if (!parts) return ''
  return displayFormatterFor(locale, format).format(Date.UTC(2021, 0, 1, parts.hour, parts.minute))
}

/** Clamps an integer to `[min, max]` (rounded first: input is free-form). */
export function clampInt(n: number, min: number, max: number): number {
  return clamp(Math.round(n), min, max)
}

/**
 * Rounds to the nearest multiple of `step`, normalized modulo 60
 * (58, step 5 → 0; −1, step 1 → 59 — the keyboard wrap goes through negatives).
 */
export function snapMinute(minute: number, step: number): number {
  const snapped = step <= 1 ? Math.round(minute) : Math.round(minute / step) * step
  return ((snapped % 60) + 60) % 60
}

/**
 * (dx, dy) relative to the dial centre (screen axes: y pointing DOWN) → a sector
 * index `0..segments-1`. Sector 0 at twelve o'clock, clockwise, rounded to the
 * nearest sector. `atan2(dx, -dy)` measures the angle from the top.
 */
export function angleToIndex(dx: number, dy: number, segments: number): number {
  const angle = Math.atan2(dx, -dy) // [-π, π], 0 = twelve o'clock, positive = clockwise
  const turn = (angle / (2 * Math.PI) + 1) % 1 // [0, 1)
  return Math.round(turn * segments) % segments
}

/** Distance to the centre, normalized by the radius (0 = centre, 1 = edge). */
export function distanceFraction(dx: number, dy: number, radius: number): number {
  return radius > 0 ? Math.hypot(dx, dy) / radius : 0
}

/**
 * Radius fraction below which a pointer targets the INNER ring (24 h): halfway
 * between the centres of the two numeral rings. Derived from the tokens
 * `--vectis-control-size-timepicker-dial` (16rem → R = 128px) and `-number`
 * (3rem → 48px): ((128 − 24) + (128 − 72)) / 2 / 128 = 0.625 — keep it in step
 * with the `--dial-radius` in VTimePickerDial.vue's CSS.
 */
export const DIAL_INNER_THRESHOLD = 0.625

/**
 * 24 h dial (M3/Android layout): outer ring `12, 1 … 11`, inner ring
 * `00, 13 … 23` (index 0 = the twelve o'clock position).
 */
export function dialIndexToHour24(index: number, ring: 'outer' | 'inner'): number {
  if (ring === 'outer') return index === 0 ? 12 : index
  return index === 0 ? 0 : index + 12
}

/** The inverse (hand position): 0 → {0, inner}, 12 → {0, outer}, 15 → {3, inner}. */
export function hour24ToDial(hour: number): { index: number; ring: 'outer' | 'inner' } {
  if (hour === 0) return { index: 0, ring: 'inner' }
  if (hour === 12) return { index: 0, ring: 'outer' }
  if (hour > 12) return { index: hour - 12, ring: 'inner' }
  return { index: hour, ring: 'outer' }
}

/* Time list (VTimePicker `mode="list"`). */

export interface TimeOption {
  /** Canonical 24 h `'HH:mm'` value — the v-model one. */
  value: string
  /** Localized label ("07:30", "7:30 AM"). */
  label: string
}

/** `'HH:mm'` → minutes since midnight, `null` if invalid (a list index). */
export function minutesOf(time: string | null | undefined): number | null {
  const parts = parseTime(time)
  return parts ? parts.hour * 60 + parts.minute : null
}

/**
 * The times of a day in `step`-minute increments, from `00:00` to the last one
 * before midnight. PURE: `formatDisplay` goes through a UTC reference instant. No
 * min/max bound — VTimePicker has none, do not invent one here. An invalid `step`
 * (≤ 0, non-integer, > 60) falls back to 60: the list must stay finite even if
 * the component's dev guard was ignored.
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
 * `HH:MM` input mask (VTimePicker `mode="input"`).
 *
 * The mask separator is UNIVERSAL, unlike VDatePicker's: a time reads "HH:MM" in
 * every locale — `Intl` only varies the hour cycle there, never the colon.
 *
 * The placeholder TEMPLATE lives in the dictionary instead
 * (`timePicker.maskPlaceholder`): `hh:mm` is made of the initials of WORDS, hence
 * translatable, where the `:` below is not.
 */
export const TIME_SEPARATOR = ':'

/**
 * Digit run → masked text. The `:` is placed AS SOON AS the hour is complete
 * ("09" → "09:"), like the date mask's separator.
 */
export function formatTimeMask(digits: string): string {
  const all = digitsOf(digits).slice(0, 4)
  return all.length >= 2 ? `${all.slice(0, 2)}${TIME_SEPARATOR}${all.slice(2)}` : all
}

/**
 * Caret position "just after the nth digit" within "HH:MM". A CLOSED form — the
 * separator is always in 3rd position, hence no equivalent of the date mask's
 * `caretAfterDigits`, which has to scan the text because its field order and
 * lengths vary with the locale. `skipSeparator` = insertion: the caret enters the
 * minutes; on deletion it stays before the `:`, otherwise the key never makes
 * progress.
 */
export function timeCaret(n: number, skipSeparator = false): number {
  if (n < 2) return n
  if (n === 2) return skipSeparator ? 3 : 2
  return Math.min(n + 1, 5)
}

/**
 * 24 h `'HH:mm'` → masked text OF THE DISPLAYED FORMAT. In 12 h the hour is
 * brought back to 1–12: the meridiem is carried by the VToggle next to the field,
 * never by the mask.
 */
export function timeToMask(time: string | null | undefined, format: HourFormat): string {
  const parts = parseTime(time)
  if (!parts) return ''
  const hour = format === '12h' ? to12h(parts.hour).hour : parts.hour
  return formatTimeMask(pad2(hour) + pad2(parts.minute))
}

/**
 * Masked text → canonical 24 h `'HH:mm'`, or `null` if the input is incomplete,
 * over-long or impossible. In 12 h, `meridiem` comes from the VToggle: this is
 * the ONLY place where the typed text and the meridiem meet.
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
