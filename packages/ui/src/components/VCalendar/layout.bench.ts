/**
 * The cost of VCalendar's layout maths, which is the DS's heaviest pure computation.
 *
 * WHY THESE FOUR. Every one of them runs on a render, and two of them run again during a
 * drag — `VCalendarTimeGrid` rebuilds `placed` from `timedSegments` + `packDayColumn` each
 * time a timed card changes slot (`packAllDay` only when a bar changes day), and
 * `VCalendarMonth` rebuilds `byDay` each time a chip changes day. So their cost is not paid
 * once when the view opens; it is paid at the rate a hand crosses slots.
 *
 * WHAT THE NUMBERS ARE FOR. The month case sets `eventsByDay` beside the shape it replaced —
 * one filter and one sort per cell over the whole event list, written out below since nothing
 * ships it — so the gap stays a number anyone can re-run rather than a claim.
 *
 * The scales are deliberately spread. A calendar with 50 events is the ordinary case and
 * has to stay free; 2000 is a busy shared agenda, where an O(cells × events) pass either
 * disappears into the noise or dominates the frame. Reading only one of the two would tell
 * you nothing about the slope, which is the whole question.
 */
import { bench, describe } from 'vitest'

import {
  coversDay,
  eventsByDay,
  isAllDayEvent,
  minutesAt,
  monthWeeks,
  packAllDay,
  packDayColumn,
  timedSegments,
  windowOf,
} from './layout'
import type { CalendarEvent } from './types'

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]

/** The naive reading of a day: filter the whole list, sort it, derive every key per comparison. */
function eventsOnDay(events: readonly CalendarEvent[], iso: string): CalendarEvent[] {
  return events
    .filter((event) => coversDay(event, iso))
    .sort(
      (a, b) =>
        (isAllDayEvent(a) ? 0 : 1) - (isAllDayEvent(b) ? 0 : 1) ||
        minutesAt(a.startTime, 0) - minutesAt(b.startTime, 0) ||
        (String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0),
    )
}
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
     * The naive shape is one filter per cell, each filtering AND sorting the whole list —
     * `cells × events`, with 42 sorts. The second is what VCalendarMonth does.
     */
    bench('byDay — a filter and a sort per month cell (the naive shape)', () => {
      for (const cell of monthCells) eventsOnDay(events, cell.iso)
    })

    bench('byDay — eventsByDay, one pass', () => {
      eventsByDay(
        events,
        monthCells.map((cell) => cell.iso),
      )
    })

    bench('eventsByDay — a single day', () => {
      eventsByDay(events, [isoAt(3)])
    })

    // The time grid's two halves, each rebuilt when a drag of its own kind changes slot.
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
