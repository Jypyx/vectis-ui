// @core
/**
 * Where a timed event lands when a time grid's gesture lets go of it: moved, stretched, or drawn
 * out of an empty slot.
 *
 * It is `layout.ts`'s arithmetic, pure and tested over plain numbers the same way, and it sits in
 * a module of its own for the size gate alone. The month and year views import `layout.ts` too,
 * and a module is weighed whole in every closure that reaches it: kept there, these functions
 * were paid for by two views that never move an event by the minute (the `VTimePicker/limits.ts`
 * argument).
 */
import { addDays } from '../../utils/date'
import { clamp } from '../../utils/number'

import {
  MINUTES_PER_DAY,
  daySpan,
  durationOf,
  floorToSlot,
  minutesAt,
  timeOf,
  type TimeWindow,
} from './layout'
import type { CalendarEventTimes } from './types'

/**
 * Rounds a moment to the nearest step WITHOUT holding it inside the day, for a start that a
 * move may push past either midnight.
 */
export function roundToSlot(minutes: number, step: number): number {
  const size = step > 0 ? step : 1
  return Math.round(minutes / size) * size
}

/**
 * Where an event lands when it is dragged or nudged along its day: it keeps its length and
 * moves by `minuteDelta`. Which DAY it lands on is the caller's to set, read from the days on
 * show rather than counted here, so a hidden weekday is never landed on.
 *
 * An event pushed past the end of the window is held against it rather than having its tail
 * cut off: moving something must never change how long it is, which is the other gesture's
 * job.
 */
export function moveEvent(
  origin: CalendarEventTimes,
  minuteDelta: number,
  timeWindow: TimeWindow,
): CalendarEventTimes {
  const startMinutes = minutesAt(origin.startTime, timeWindow.start)
  const endMinutes = Math.max(minutesAt(origin.endTime, startMinutes), startMinutes + 1)
  const duration = endMinutes - startMinutes

  const nextStart = clamp(
    startMinutes + minuteDelta,
    timeWindow.start,
    Math.max(timeWindow.start, timeWindow.end - duration),
  )

  return {
    start: origin.start,
    end: origin.start,
    startTime: timeOf(nextStart),
    endTime: timeOf(nextStart + duration),
  }
}

/**
 * Where the end of an event lands when its bottom edge is dragged. It can never cross the
 * start: the shortest an event may become is one step.
 */
export function resizeEvent(
  origin: CalendarEventTimes,
  endMinutes: number,
  minDuration: number,
  timeWindow: TimeWindow,
): CalendarEventTimes {
  const startMinutes = minutesAt(origin.startTime, timeWindow.start)
  const floor = Math.max(minDuration, 1)
  const end = clamp(endMinutes, startMinutes + floor, timeWindow.end)

  return {
    start: origin.start,
    end: origin.start,
    startTime: timeOf(startMinutes),
    endTime: timeOf(end),
  }
}

/**
 * Where a timed event lands when it is dragged or nudged: it starts at `startMinutes` counted
 * from the midnight that begins `day`, and keeps its length.
 *
 * `crossMidnight` says which of two rules applies, and it is read off the event as the gesture
 * FOUND it rather than off the times being written. An event that ran past midnight when it was
 * taken hold of may go on doing so, or come back inside one day, or cross again: its start may
 * be pushed into the day before or after `day`, and its end lands wherever its length takes it.
 * Any other event is `moveEvent`'s, held inside `day`, so a drag never turns an ordinary
 * appointment into an overnight one by accident.
 */
export function moveTimedEvent(
  times: CalendarEventTimes,
  day: string,
  startMinutes: number,
  timeWindow: TimeWindow,
  crossMidnight: boolean,
): CalendarEventTimes {
  if (!crossMidnight) {
    const from = minutesAt(times.startTime, timeWindow.start)
    return { ...moveEvent(times, startMinutes - from, timeWindow), start: day, end: day }
  }

  const duration = clamp(durationOf(times), 1, MINUTES_PER_DAY - 1)
  const dayShift = Math.floor(startMinutes / MINUTES_PER_DAY)
  const wanted = startMinutes - dayShift * MINUTES_PER_DAY
  /*
   * The start is held inside the window only when it was taken from inside it. An overnight
   * event may begin after the window closes (a 22:00 shift on a calendar showing 08:00 to
   * 20:00, whose morning card alone is drawn): pulled into the window, its start jumped hours
   * and left the slot grid at the first nudge. Left where it was asked to go, it cannot
   * vanish either, since moving it later lengthens its morning and moving it earlier brings
   * its evening into view.
   */
  const from = minutesAt(times.startTime, timeWindow.start)
  const start =
    from >= timeWindow.start && from < timeWindow.end
      ? clamp(wanted, timeWindow.start, timeWindow.end - 1)
      : wanted
  const startDay = addDays(day, dayShift)
  const end = start + duration
  return {
    start: startDay,
    end: end >= MINUTES_PER_DAY ? addDays(startDay, 1) : startDay,
    startTime: timeOf(start),
    endTime: timeOf(end % MINUTES_PER_DAY),
  }
}

/**
 * Where a timed event's end lands when it is dragged or nudged: `endMinutes` counted from the
 * midnight that begins `endDay`.
 *
 * With `crossMidnight` false this is `resizeEvent`, and `endDay` is ignored. With it true: an
 * event that ran past midnight when the gesture began: the end may sit on the event's first
 * day or on the next one, whichever `endDay` names (anything else is held to the nearer of the
 * two), and it stays at least `minDuration` after the start and short of a whole day after it,
 * so the event never turns into a bar under the pointer.
 */
export function resizeTimedEvent(
  times: CalendarEventTimes,
  endDay: string,
  endMinutes: number,
  minDuration: number,
  timeWindow: TimeWindow,
  crossMidnight: boolean,
): CalendarEventTimes {
  if (!crossMidnight) return resizeEvent(times, endMinutes, minDuration, timeWindow)

  const startMinutes = minutesAt(times.startTime, timeWindow.start)
  // `daySpan` already reads a day before the start as zero.
  const dayOffset = Math.min(daySpan({ ...times, end: endDay }), 1)
  const end = clamp(
    dayOffset * MINUTES_PER_DAY + endMinutes,
    startMinutes + Math.max(minDuration, 1),
    startMinutes + MINUTES_PER_DAY - 1,
  )

  // Back inside the first day, the end obeys the window like any other; the `timeOf` clamp
  // then writes midnight as 23:59 of that day rather than 00:00 of the next.
  if (end <= MINUTES_PER_DAY) {
    return {
      start: times.start,
      end: times.start,
      startTime: timeOf(startMinutes),
      // The window caps the end, never below the shortest length: a start after the window
      // closes would otherwise be given an end before it.
      endTime: timeOf(
        Math.max(Math.min(end, timeWindow.end), startMinutes + Math.max(minDuration, 1)),
      ),
    }
  }
  return {
    start: times.start,
    end: addDays(times.start, 1),
    startTime: timeOf(startMinutes),
    endTime: timeOf(end - MINUTES_PER_DAY),
  }
}

/**
 * The stretch of a day drawn out by a press at `anchor` and a pointer now at `pointer`, both in
 * minutes since midnight.
 *
 * It covers every slot from the one pressed to the one under the pointer, both included, so it
 * reads the same whichever way the pointer went: down from 10:00 to 11:10 is 10:00–11:15, up
 * from 10:00 to 9:10 is 9:00–10:15. The pressed slot is never given up, which is what keeps the
 * box from flipping over as the pointer crosses its own starting point.
 */
export function drawnSlot(
  day: string,
  anchor: number,
  pointer: number,
  step: number,
  timeWindow: TimeWindow,
): CalendarEventTimes {
  const size = step > 0 ? step : 1
  const from = floorToSlot(anchor, size)
  const at = floorToSlot(pointer, size)
  const start = Math.max(timeWindow.start, Math.min(from, at))
  const end = clamp(Math.max(from, at) + size, start + 1, timeWindow.end)
  return { start: day, end: day, startTime: timeOf(start), endTime: timeOf(end) }
}
