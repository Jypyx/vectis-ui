// @core
/**
 * Pure, which makes any of it testable: jsdom lays no dial out, so what the face decides has to
 * be decidable from numbers alone.
 */
import { resolveMatcher } from '../../utils/matcher'
import { memo } from '../../utils/memo'
import { formatTime } from '../../utils/time'

/** Which values are ALLOWED: the list of them, or a rule answering for one. */
export type TimePickerAllowed = number[] | ((value: number) => boolean)

/**
 * The restrictions in force, resolved once: the matchers already turned into functions, and the
 * interval the minutes are reachable on carried alongside them, since whether an hour has
 * anything left in it depends on that too.
 */
export interface TimeLimits {
  /** The earliest time allowed, inclusive, as a canonical 24-hour `'HH:mm'`. */
  min?: string
  /** The latest time allowed, inclusive, in the same form. */
  max?: string
  /** Whether an hour, always the 24-hour one, is allowed. */
  hour: (hour: number) => boolean
  /** Whether a minute is allowed. */
  minute: (minute: number) => boolean
  /** The interval the minutes snap to, which makes one reachable at all. */
  step: number
}

/** The props both components declare, which is all this needs to resolve them. */
export interface TimeLimitProps {
  min?: string
  max?: string
  allowedHours?: TimePickerAllowed
  allowedMinutes?: TimePickerAllowed
  minuteStep: number
}

/** Allowing everything, which a restriction nobody wrote has to mean. */
const allowEverything = () => true

/** The props as the resolved form. */
export function resolveLimits(props: TimeLimitProps): TimeLimits {
  return {
    min: props.min,
    max: props.max,
    hour: props.allowedHours ? resolveMatcher(props.allowedHours) : allowEverything,
    minute: props.allowedMinutes ? resolveMatcher(props.allowedMinutes) : allowEverything,
    step: props.minuteStep,
  }
}

/**
 * The interval a `minuteStep` actually walks by. A step at or below one minute is every minute,
 * which `snapMinute` reads it as.
 */
export function minuteInterval(step: number): number {
  const size = Math.round(step)
  return size > 1 ? size : 1
}

const minuteGrids = new Map<number, readonly number[]>()

/**
 * The minutes an interval leaves reachable inside an hour, built once per step. The list is
 * shared: read-only.
 */
export function minuteGrid(step: number): readonly number[] {
  return memo(minuteGrids, step, () => {
    const interval = minuteInterval(step)
    const grid: number[] = []
    for (let minute = 0; minute < 60; minute += interval) grid.push(minute)
    return grid
  })
}

/**
 * The bounds are compared as STRINGS. That works only because a canonical time is zero-padded
 * and fixed-width, which makes '09:30' < '17:00' order the way the clock does; hand it a value
 * that never went through `formatTime` and the comparison is quietly wrong.
 */
export function isTimeAllowed(hour: number, minute: number, limits: TimeLimits): boolean {
  if (!limits.hour(hour) || !limits.minute(minute)) return false
  // Without a bound there is nothing to compare, and no string worth formatting.
  if (!limits.min && !limits.max) return true
  const time = formatTime(hour, minute)
  return (!limits.min || time >= limits.min) && (!limits.max || time <= limits.max)
}

/** The minutes of one hour that can be chosen, in order. */
export function allowedMinutesFor(hour: number, limits: TimeLimits): number[] {
  return minuteGrid(limits.step).filter((minute) => isTimeAllowed(hour, minute, limits))
}

/**
 * Whether an hour still holds a minute one could choose. An hour is closed only when
 * nothing at all is left in it: `min: '09:30'` leaves nine o'clock open and takes the
 * first half of it away from the minutes instead.
 */
export function isHourAllowed(hour: number, limits: TimeLimits): boolean {
  if (!limits.hour(hour)) return false
  return minuteGrid(limits.step).some((minute) => isTimeAllowed(hour, minute, limits))
}

/** The minute nearest the one asked for that the hour allows, `null` when it allows none. */
export function nearestAllowedMinute(
  hour: number,
  minute: number,
  limits: TimeLimits,
): number | null {
  let best: number | null = null
  let bestDistance = Number.POSITIVE_INFINITY
  for (const candidate of minuteGrid(limits.step)) {
    if (!isTimeAllowed(hour, candidate, limits)) continue
    const distance = Math.abs(candidate - minute)
    if (distance < bestDistance) {
      best = candidate
      bestDistance = distance
    }
  }
  return best
}

/**
 * The allowed time nearest the one asked for, as a canonical string, `null` when the
 * restrictions allow nothing at all.
 */
export function nearestAllowedTime(
  hour: number,
  minute: number,
  limits: TimeLimits,
): string | null {
  const target = hour * 60 + minute
  let best: string | null = null
  let bestDistance = Number.POSITIVE_INFINITY
  for (let candidate = 0; candidate < 24; candidate += 1) {
    if (!limits.hour(candidate)) continue
    for (const each of allowedMinutesFor(candidate, limits)) {
      const distance = Math.abs(candidate * 60 + each - target)
      if (distance < bestDistance) {
        best = formatTime(candidate, each)
        bestDistance = distance
      }
    }
  }
  return best
}

/**
 * Walking a cycle until a value is allowed: `at` produces the candidate `i` steps away,
 * counting from one, and `allowed` answers for it. It gives up after a full turn instead of
 * looping for ever, which a set of restrictions allowing nothing would do.
 */
export function firstAllowed(
  turn: number,
  at: (i: number) => number,
  allowed: (value: number) => boolean,
): number | null {
  for (let i = 1; i <= turn; i += 1) {
    const value = at(i)
    if (allowed(value)) return value
  }
  return null
}

/** What is wrong with a set of restrictions, in a sentence, or nothing at all. */
export function limitsProblem(limits: TimeLimits): string | null {
  if (limits.min && limits.max && limits.min > limits.max)
    return `min "${limits.min}" falls after max "${limits.max}", so no time can be chosen.`
  for (let hour = 0; hour < 24; hour += 1) if (isHourAllowed(hour, limits)) return null
  return 'min, max, allowedHours and allowedMinutes together leave no time that can be chosen.'
}
