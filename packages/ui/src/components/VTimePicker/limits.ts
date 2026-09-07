// @core
/**
 * Which times a clock may offer: the two bounds and the two rules, plus everything a
 * component has to derive from them — whether an hour still holds anything, which minute
 * to fall back on, where a key lands next.
 *
 * It sits in this folder rather than in `utils/time.ts` for the reasons `../VTimeInput/search.ts`
 * gives for its own neighbour: that module is in the import closure of every VCalendar
 * component through `VCalendar/layout`, so a rule only a time picker consults would be
 * weighed on every calendar that restricts nothing. VTimePicker owns the contract and
 * VTimeInput reads it, the `VIcon/iconProps` arrangement.
 *
 * Pure, which is what makes any of it testable: jsdom lays no dial out, so what the face
 * decides has to be decidable from numbers alone.
 */
import { resolveMatcher } from '../../utils/matcher'
import { formatTime } from '../../utils/time'

/** Which values are allowed: the list of them, or a rule answering for one. */
export type TimeMatcher = number[] | ((value: number) => boolean)

/**
 * The restrictions in force, resolved ONCE — the matchers already turned into functions,
 * and the interval the minutes are reachable on carried alongside them, since whether an
 * hour has anything left in it depends on that too.
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
  /** The interval the minutes snap to, which is what makes one reachable at all. */
  step: number
}

/** The props both components declare, which is all this needs to resolve them. */
export interface TimeLimitProps {
  min?: string
  max?: string
  allowedHours?: TimeMatcher
  allowedMinutes?: TimeMatcher
  minuteStep: number
}

/** Allowing everything, which is what a restriction nobody wrote has to mean. */
const allowEverything = () => true

/**
 * The props as the resolved form. Call it inside a `computed`: the matchers become
 * functions here, an allowed LIST becoming a `Set` on the way, so no lookup rescans it.
 *
 * `resolveMatcher` answers "is this one of them", which is exactly what an allowed list
 * asks of it — but a prop that is ABSENT has to allow everything, where the helper's own
 * empty case answers no. That inversion is the one thing it cannot be left to do.
 */
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
 * The minutes an interval leaves reachable inside an hour. A step at or below one minute
 * is every minute, which is what `snapMinute` reads it as.
 */
function minuteGrid(step: number): number[] {
  const interval = step > 1 ? step : 1
  const grid: number[] = []
  for (let minute = 0; minute < 60; minute += interval) grid.push(minute)
  return grid
}

/**
 * Whether the restrictions allow a time.
 *
 * TRAP — the bounds are compared as STRINGS. That works only because a canonical time is
 * zero-padded and fixed-width, which makes '09:30' < '17:00' order the way the clock does;
 * hand it a value that never went through `formatTime` and the comparison is quietly wrong.
 */
export function isTimeAllowed(hour: number, minute: number, limits: TimeLimits): boolean {
  if (!limits.hour(hour) || !limits.minute(minute)) return false
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

/**
 * The minute nearest the one asked for that the hour allows, `null` when it allows none.
 * A tie goes to the earlier of the two: choosing an hour must not walk the clock past a
 * time the reader could have meant.
 */
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
 * restrictions allow nothing at all. It is what a panel opens on when the field is empty:
 * the current time, pulled to something the reader is actually able to confirm.
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
 * counting from one, and `allowed` answers for it. It gives up after a full turn instead
 * of looping for ever, which is what a set of restrictions allowing nothing would do.
 *
 * This is what makes a key SKIP: with nothing restricted the first candidate answers, so
 * the walk costs one call and lands exactly where a plain step would have.
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

/**
 * What is wrong with a set of restrictions, in a sentence, or nothing at all. Both
 * components print it under their own name: the mistake is the consumer's either way, and
 * only they know which of the two they wrote.
 */
export function limitsProblem(limits: TimeLimits): string | null {
  if (limits.min && limits.max && limits.min > limits.max)
    return `min "${limits.min}" falls after max "${limits.max}", so no time can be chosen.`
  for (let hour = 0; hour < 24; hour += 1) if (isHourAllowed(hour, limits)) return null
  return 'min, max, allowedHours and allowedMinutes together leave no time that can be chosen.'
}
