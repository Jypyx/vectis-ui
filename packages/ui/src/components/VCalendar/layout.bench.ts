/**
 * The cost of VCalendar's layout maths, which is the DS's heaviest pure computation.
 *
 * WHY THESE FOUR. Every one of them runs on a render, and two of them run on every frame
 * of a drag — `VCalendarTimeGrid` rebuilds `placed` from `timedSegments` + `packDayColumn`
 * whenever the pointer moves, and `VCalendarMonth` rebuilds `byDay` the same way. So their
 * cost is not paid once when the view opens; it is paid at pointer rate.
 *
 * WHAT THE NUMBERS ARE FOR. `eventsOnDay` is measured the way `VCalendarMonth` actually
 * calls it — once per cell over the whole event list — because that shape, and not the
 * function alone, is what a bucketing pass would replace. The month case is therefore the
 * one to read before deciding whether that rewrite earns its complexity: it is quadratic in
 * principle, and the question is only where the event count makes that matter.
 *
 * The scales are deliberately spread. A calendar with 50 events is the ordinary case and
 * has to stay free; 2000 is a busy shared agenda, where an O(cells × events) pass either
 * disappears into the noise or dominates the frame. Reading only one of the two would tell
 * you nothing about the slope, which is the whole question.
 */
import { bench, describe } from 'vitest'

import {
  eventsByDay,
  eventsOnDay,
  monthWeeks,
  packAllDay,
  packDayColumn,
  timedSegments,
  windowOf,
} from './layout'
import type { CalendarEvent } from './types'

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]
const WINDOW = windowOf(0, 24)

/** A day offset applied to a fixed anchor, so every fixture is deterministic. */
function isoAt(dayOffset: number): string {
  const date = new Date(Date.UTC(2021, 10, 1))
  date.setUTCDate(date.getUTCDate() + dayOffset)
  return date.toISOString().slice(0, 10)
}

/**
 * A month's worth of events, spread over its days and its hours.
 *
 * Every seventh is all-day, which is what gives `packAllDay` something to stack and
 * `timedSegments` something to skip — a fixture of one kind only would measure half of
 * each function's real work. Nothing here is random: a benchmark that varies its input
 * between runs cannot be compared against its own previous number.
 */
function makeEvents(count: number): CalendarEvent[] {
  const events: CalendarEvent[] = []
  for (let i = 0; i < count; i++) {
    const day = isoAt(i % 30)
    const allDay = i % 7 === 0
    const hour = 6 + (i % 12)
    events.push({
      id: i,
      title: `Event ${i}`,
      start: day,
      // A tenth of the all-day events run over two days, so a span is exercised too.
      end: allDay && i % 70 === 0 ? isoAt((i % 30) + 1) : day,
      ...(allDay
        ? {}
        : {
            startTime: `${String(hour).padStart(2, '0')}:00`,
            endTime: `${String(hour + 1).padStart(2, '0')}:30`,
          }),
    } as CalendarEvent)
  }
  return events
}

const SCALES = [50, 200, 2000] as const

describe('monthWeeks', () => {
  // Independent of the event count: it is pure calendar arithmetic. It earns a place here
  // because VCalendarYear calls it 36 times per render (12 months × 3 call sites).
  bench('one month grid', () => {
    monthWeeks(isoAt(0), WEEKDAYS)
  })

  bench('a year of grids (the VCalendarYear render)', () => {
    for (let month = 0; month < 12; month++) monthWeeks(isoAt(month * 30), WEEKDAYS)
  })
})

for (const count of SCALES) {
  const events = makeEvents(count)
  const week = Array.from({ length: 7 }, (_, i) => isoAt(i))
  const monthCells = monthWeeks(isoAt(0), WEEKDAYS).flat()

  describe(`${count} events`, () => {
    /*
     * The month view's real workload, measured both ways.
     *
     * The naive shape is one `eventsOnDay` per cell, each filtering AND sorting the whole
     * list — `cells × events`, with 42 sorts. The second is what VCalendarMonth does. The two
     * stay side by side so the gap is a number anyone can re-run rather than a claim, and
     * both must produce the same order.
     */
    bench('byDay — eventsOnDay once per month cell (the naive shape)', () => {
      for (const cell of monthCells) eventsOnDay(events, cell.iso)
    })

    bench('byDay — eventsByDay, one pass', () => {
      eventsByDay(
        events,
        monthCells.map((cell) => cell.iso),
      )
    })

    bench('eventsOnDay — a single day', () => {
      eventsOnDay(events, isoAt(3))
    })

    // The time grid's two halves, both rebuilt on every pointermove during a drag.
    bench('timedSegments — a week', () => {
      timedSegments(events, week, WINDOW, 15)
    })

    bench('packAllDay — a week', () => {
      packAllDay(events, week)
    })

    bench('packDayColumn — one column', () => {
      packDayColumn(timedSegments(events, week, WINDOW, 15).filter((s) => s.dayIndex === 0))
    })
  })
}
