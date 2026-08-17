import { describe, expect, it } from 'vitest'

import {
  DRAG_THRESHOLD,
  advanceVisibleDays,
  blockEdgeAt,
  pointWithin,
  columnCount,
  daySpan,
  eventsOnDay,
  inlineEdgeAt,
  moveEventToDay,
  pointToMonthCell,
  floorToSlot,
  fractionOf,
  isAllDayEvent,
  isVisibleDay,
  minutesAt,
  monthWeeks,
  monthsOfYear,
  moveEvent,
  normalizeWeekdays,
  packAllDay,
  packDayColumn,
  pointToCell,
  resizeEvent,
  snapToSlot,
  snapToVisibleDay,
  stepAnchor,
  timeOf,
  timedSegments,
  visibleDays,
  visibleRange,
  windowOf,
} from './layout'
import type { CalendarEvent } from './types'

/*
 * Reference week: June 2026. The 8th is a Monday, so the 10th is a Wednesday and the 13th
 * and 14th are the weekend — the same grid VDatePicker's tests use, for the same reason:
 * a fixed week is what lets an expectation name a day rather than compute one.
 */
const WEDNESDAY = '2026-06-10'
const MONDAY = '2026-06-08'
const FRIDAY = '2026-06-12'

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
const WEEK_FROM_MONDAY = [1, 2, 3, 4, 5, 6, 0]
const WORKING_DAYS = [1, 2, 3, 4, 5]

/** A whole day, which is what every geometric test below is read against. */
const DAY = windowOf(0, 24)

/** Minutes since midnight, so a case can be written in the hours it means. */
const at = (hour: number, minute = 0) => hour * 60 + minute

function event(partial: Partial<CalendarEvent> & Pick<CalendarEvent, 'id'>): CalendarEvent {
  return {
    title: `Event ${partial.id}`,
    start: WEDNESDAY,
    end: WEDNESDAY,
    startTime: '09:00',
    endTime: '10:00',
    ...partial,
  }
}

describe('the time window', () => {
  it('turns hours into minutes since midnight', () => {
    expect(windowOf(8, 20)).toEqual({ start: 480, end: 1200 })
  })

  it('keeps at least one hour on screen, whatever it is given', () => {
    expect(windowOf(10, 10)).toEqual({ start: 600, end: 660 })
    expect(windowOf(23, 2)).toEqual({ start: 1380, end: 1440 })
  })

  it('never lets the window run past the end of the day', () => {
    expect(windowOf(0, 48).end).toBe(1440)
  })
})

describe('timeOf', () => {
  it('writes an ordinary time', () => {
    expect(timeOf(0)).toBe('00:00')
    expect(timeOf(at(9, 5))).toBe('09:05')
    expect(timeOf(at(23, 59))).toBe('23:59')
  })

  /*
   * The whole reason the helper clamps rather than rolling over. `24:00` is not a time the
   * design system's own guard accepts, and writing `00:00` on the next day would turn an
   * evening appointment into a two-day event, which the all-day band would then swallow.
   */
  it('holds midnight one minute short instead of rolling over to the next day', () => {
    expect(timeOf(1440)).toBe('23:59')
    expect(timeOf(5000)).toBe('23:59')
  })
})

describe('normalizeWeekdays', () => {
  it('rotates the seven days to the locale first day when given nothing', () => {
    expect(normalizeWeekdays(undefined, 1)).toEqual(WEEK_FROM_MONDAY)
    expect(normalizeWeekdays(undefined, 0)).toEqual(ALL_DAYS)
  })

  it('keeps the order it was given, which is what sets the first displayed day', () => {
    expect(normalizeWeekdays([3, 4, 5], 1)).toEqual([3, 4, 5])
  })

  it('drops duplicates and anything outside a week', () => {
    expect(normalizeWeekdays([1, 1, 9, -2, 2], 0)).toEqual([1, 2])
  })

  it('falls back to the locale week when nothing survives', () => {
    expect(normalizeWeekdays([12, -1], 1)).toEqual(WEEK_FROM_MONDAY)
  })
})

describe('walking the visible days', () => {
  it('knows which days are on show', () => {
    expect(isVisibleDay(FRIDAY, WORKING_DAYS)).toBe(true)
    expect(isVisibleDay('2026-06-13', WORKING_DAYS)).toBe(false)
  })

  it('snaps a hidden day forward to the next one on show', () => {
    expect(snapToVisibleDay('2026-06-13', WORKING_DAYS)).toBe('2026-06-15')
  })

  it('snaps backwards when asked to', () => {
    expect(snapToVisibleDay('2026-06-14', WORKING_DAYS, -1)).toBe(FRIDAY)
  })

  it('steps over the hidden days rather than counting them', () => {
    expect(advanceVisibleDays(FRIDAY, 1, WORKING_DAYS)).toBe('2026-06-15')
    expect(advanceVisibleDays(MONDAY, -1, WORKING_DAYS)).toBe('2026-06-05')
  })

  it('goes nowhere when asked for no days at all', () => {
    expect(advanceVisibleDays(FRIDAY, 0, WORKING_DAYS)).toBe(FRIDAY)
  })
})

describe('visibleDays', () => {
  it('gives one day in the day view', () => {
    expect(visibleDays(WEDNESDAY, 'day', ALL_DAYS, 4)).toEqual([WEDNESDAY])
  })

  it('runs forward over the visible days in the four-day view', () => {
    expect(visibleDays(FRIDAY, '4days', WORKING_DAYS, 4)).toEqual([
      FRIDAY,
      '2026-06-15',
      '2026-06-16',
      '2026-06-17',
    ])
  })

  it('shows the week the anchor falls in, starting on the first weekday given', () => {
    expect(visibleDays(WEDNESDAY, 'week', WEEK_FROM_MONDAY, 4)).toEqual([
      MONDAY,
      '2026-06-09',
      WEDNESDAY,
      '2026-06-11',
      FRIDAY,
      '2026-06-13',
      '2026-06-14',
    ])
  })

  it('drops the hidden days out of the week', () => {
    expect(visibleDays(WEDNESDAY, 'week', WORKING_DAYS, 4)).toEqual([
      MONDAY,
      '2026-06-09',
      WEDNESDAY,
      '2026-06-11',
      FRIDAY,
    ])
  })

  it('honours a custom length', () => {
    expect(visibleDays(WEDNESDAY, 'custom', ALL_DAYS, 3)).toEqual([WEDNESDAY, '2026-06-11', FRIDAY])
  })

  it('gives every visible day of the month in the month view', () => {
    const days = visibleDays(WEDNESDAY, 'month', WORKING_DAYS, 4)
    expect(days[0]).toBe('2026-06-01')
    expect(days.at(-1)).toBe('2026-06-30')
    expect(days).toHaveLength(22)
    expect(days).not.toContain('2026-06-13')
  })

  it('gives no day list at all for the year view, which shows months', () => {
    expect(visibleDays(WEDNESDAY, 'year', ALL_DAYS, 4)).toEqual([])
  })

  it('answers with nothing rather than throwing on a malformed anchor', () => {
    expect(visibleDays('nonsense', 'week', ALL_DAYS, 4)).toEqual([])
    expect(visibleDays(WEDNESDAY, 'week', [], 4)).toEqual([])
  })

  it('starts a day view on the next visible day when the anchor is hidden', () => {
    expect(visibleDays('2026-06-13', 'day', WORKING_DAYS, 4)).toEqual(['2026-06-15'])
  })
})

describe('stepAnchor', () => {
  /*
   * The sharpest bug this module can carry. Stepping by one CALENDAR day from a Friday in
   * a Monday-to-Friday calendar lands on a Saturday nothing draws, so the grid shows the
   * week it was already showing and the button looks broken with nothing to point at.
   */
  it('steps over the hidden days in the day view', () => {
    expect(stepAnchor(FRIDAY, 'day', 1, WORKING_DAYS, 4)).toBe('2026-06-15')
    expect(stepAnchor(MONDAY, 'day', -1, WORKING_DAYS, 4)).toBe('2026-06-05')
  })

  it('steps by a whole block in the four-day and custom views', () => {
    expect(stepAnchor(WEDNESDAY, '4days', 1, ALL_DAYS, 4)).toBe('2026-06-14')
    expect(stepAnchor(WEDNESDAY, 'custom', 1, ALL_DAYS, 3)).toBe('2026-06-13')
  })

  it('steps a week at a time in the week view', () => {
    expect(stepAnchor(WEDNESDAY, 'week', 1, ALL_DAYS, 4)).toBe('2026-06-17')
    expect(stepAnchor(WEDNESDAY, 'week', -1, ALL_DAYS, 4)).toBe('2026-06-03')
  })

  it('steps a month and a year in the views named after them', () => {
    expect(stepAnchor(WEDNESDAY, 'month', 1, ALL_DAYS, 4)).toBe('2026-07-10')
    expect(stepAnchor(WEDNESDAY, 'year', 1, ALL_DAYS, 4)).toBe('2027-06-10')
  })

  it('leaves a malformed anchor alone', () => {
    expect(stepAnchor('nonsense', 'week', 1, ALL_DAYS, 4)).toBe('nonsense')
  })
})

describe('visibleRange', () => {
  it('names the two ends of the days on show', () => {
    expect(visibleRange(WEDNESDAY, 'week', WORKING_DAYS, 4)).toEqual({
      start: MONDAY,
      end: FRIDAY,
    })
  })

  it('covers the whole year in the year view, which has no day list', () => {
    expect(visibleRange(WEDNESDAY, 'year', ALL_DAYS, 4)).toEqual({
      start: '2026-01-01',
      end: '2026-12-31',
    })
  })
})

describe('columnCount', () => {
  it.each([
    ['day', 1],
    ['4days', 4],
    ['week', 7],
    ['month', 7],
  ] as const)('%s shows %i columns', (view, expected) => {
    expect(columnCount(view, 4)).toBe(expected)
  })

  it('keeps a custom length within something a screen can hold', () => {
    expect(columnCount('custom', 0)).toBe(1)
    expect(columnCount('custom', 99)).toBe(31)
  })
})

describe('isAllDayEvent', () => {
  it('takes the flag at its word', () => {
    expect(isAllDayEvent(event({ id: 'a', allDay: true }))).toBe(true)
  })

  /*
   * Not a convenience: a card running from one day to the next cannot be drawn inside a
   * single column, so the band is the only place it can honestly go.
   */
  it('sends an event spanning two days to the band, flag or no flag', () => {
    expect(isAllDayEvent(event({ id: 'b', start: WEDNESDAY, end: FRIDAY }))).toBe(true)
  })

  it('leaves an ordinary appointment in the grid', () => {
    expect(isAllDayEvent(event({ id: 'c' }))).toBe(false)
  })
})

describe('timedSegments', () => {
  const days = [MONDAY, WEDNESDAY, FRIDAY]

  it('places an event in the column of its own day', () => {
    const [segment] = timedSegments([event({ id: 'a' })], days, DAY, 15)
    expect(segment).toMatchObject({ id: 'a', dayIndex: 1, start: at(9), end: at(10) })
  })

  it('ignores all-day events, which are the band business', () => {
    expect(timedSegments([event({ id: 'a', allDay: true })], days, DAY, 15)).toEqual([])
  })

  it('ignores an event whose day is not on show', () => {
    expect(
      timedSegments([event({ id: 'a', start: '2026-06-09', end: '2026-06-09' })], days, DAY, 15),
    ).toEqual([])
  })

  it('drops an event that falls entirely outside the window', () => {
    const window = windowOf(9, 17)
    const early = event({ id: 'a', startTime: '06:00', endTime: '07:00' })
    expect(timedSegments([early], days, window, 15)).toEqual([])
  })

  it('cuts an event down to the window and says which end it lost', () => {
    const window = windowOf(9, 17)
    const long = event({ id: 'a', startTime: '07:00', endTime: '19:00' })
    expect(timedSegments([long], days, window, 15)[0]).toMatchObject({
      start: at(9),
      end: at(17),
      clippedStart: true,
      clippedEnd: true,
    })
  })

  /*
   * The minimum is applied here rather than during packing on purpose: two events fifteen
   * minutes apart would otherwise be laid out as though they did not overlap, and then
   * drawn as though they did.
   */
  it('stretches a very short event to the smallest length that can be drawn', () => {
    const brief = event({ id: 'a', startTime: '09:00', endTime: '09:01' })
    expect(timedSegments([brief], days, DAY, 15)[0]).toMatchObject({ start: 540, end: 555 })
  })
})

describe('packDayColumn', () => {
  const seg = (id: string, start: number, end: number) => ({
    id,
    dayIndex: 0,
    start,
    end,
    clippedStart: false,
    clippedEnd: false,
  })

  const byId = (placed: ReturnType<typeof packDayColumn>) =>
    Object.fromEntries(placed.map((p) => [p.id, p]))

  it('gives a lone event the whole width', () => {
    expect(packDayColumn([seg('a', at(9), at(10))])[0]).toMatchObject({
      column: 0,
      span: 1,
      columns: 1,
    })
  })

  it('splits the width between two events at the same time', () => {
    const placed = byId(packDayColumn([seg('a', at(9), at(10)), seg('b', at(9), at(10))]))
    expect(placed.a).toMatchObject({ column: 0, columns: 2 })
    expect(placed.b).toMatchObject({ column: 1, columns: 2 })
  })

  /*
   * Overlap is strict, so one event ending exactly as the next begins is not a collision.
   * A loose comparison here would halve the width of every back-to-back day in a diary.
   */
  it('lets two events that merely touch share one column', () => {
    const placed = packDayColumn([seg('a', at(9), at(10)), seg('b', at(10), at(11))])
    expect(placed.every((p) => p.columns === 1 && p.column === 0)).toBe(true)
  })

  it('starts a new cluster once everything before it has finished', () => {
    const placed = byId(
      packDayColumn([seg('a', at(9), at(10)), seg('b', at(9), at(10)), seg('c', at(14), at(15))]),
    )
    expect(placed.a!.columns).toBe(2)
    // The lone afternoon meeting keeps the whole width: it is nobody's neighbour.
    expect(placed.c).toMatchObject({ column: 0, span: 1, columns: 1 })
  })

  it('lays out a staircase in two columns', () => {
    const placed = byId(
      packDayColumn([
        seg('a', at(9), at(10)),
        seg('b', at(9, 30), at(11)),
        seg('c', at(10), at(10, 30)),
      ]),
    )
    expect(placed.a).toMatchObject({ column: 0, columns: 2 })
    expect(placed.b).toMatchObject({ column: 1, columns: 2 })
    // `c` reuses the column `a` has just freed rather than opening a third.
    expect(placed.c).toMatchObject({ column: 0, columns: 2 })
  })

  it('lets an event grow into the room beside it when nothing is using it', () => {
    const placed = byId(
      packDayColumn([
        seg('a', at(9), at(21)),
        seg('b', at(9), at(10)),
        seg('c', at(9), at(9, 30)),
        seg('d', at(10, 20), at(11, 40)),
      ]),
    )
    expect(placed.a!.columns).toBe(3)
    // Nothing sits beside `d` for its whole length, so it takes two columns of the three.
    expect(placed.d).toMatchObject({ column: 1, span: 2, columns: 3 })
  })

  it('draws the same picture whatever order the events arrive in', () => {
    const input = [
      seg('a', at(9), at(10)),
      seg('b', at(9, 30), at(11)),
      seg('c', at(10), at(10, 30)),
    ]
    const forward = byId(packDayColumn(input))
    const backward = byId(packDayColumn([...input].reverse()))
    for (const id of ['a', 'b', 'c']) {
      expect(backward[id]).toEqual(forward[id])
    }
  })

  it('gives identical events a stable order rather than letting them swap', () => {
    const one = packDayColumn([seg('b', at(9), at(10)), seg('a', at(9), at(10))])
    const two = packDayColumn([seg('a', at(9), at(10)), seg('b', at(9), at(10))])
    expect(one.map((p) => p.id)).toEqual(two.map((p) => p.id))
  })

  it('handles an empty day', () => {
    expect(packDayColumn([])).toEqual([])
  })
})

describe('monthWeeks', () => {
  it('keeps six rows whatever the month, so the grid never changes height', () => {
    expect(monthWeeks(WEDNESDAY, WEEK_FROM_MONDAY)).toHaveLength(6)
    expect(monthWeeks('2026-02-01', WEEK_FROM_MONDAY)).toHaveLength(6)
  })

  it('pads with the neighbouring months and says which days those are', () => {
    const weeks = monthWeeks(WEDNESDAY, WEEK_FROM_MONDAY)
    expect(weeks[0]![0]).toEqual({ iso: '2026-06-01', adjacent: null })
    expect(weeks.at(-1)!.at(-1)!.adjacent).toBe('next')
  })

  it('narrows every row to the visible weekdays', () => {
    const weeks = monthWeeks(WEDNESDAY, WORKING_DAYS)
    expect(weeks.every((week) => week.length === 5)).toBe(true)
    expect(weeks.flat().some((cell) => cell.iso === '2026-06-13')).toBe(false)
  })

  it('answers with nothing rather than throwing on a malformed anchor', () => {
    expect(monthWeeks('nonsense', ALL_DAYS)).toEqual([])
    expect(monthWeeks(WEDNESDAY, [])).toEqual([])
  })
})

describe('monthsOfYear', () => {
  it('gives the first of each month', () => {
    const months = monthsOfYear(WEDNESDAY)
    expect(months).toHaveLength(12)
    expect(months[0]).toBe('2026-01-01')
    expect(months.at(-1)).toBe('2026-12-01')
  })

  it('answers with nothing on a malformed anchor', () => {
    expect(monthsOfYear('nonsense')).toEqual([])
  })
})

describe('eventsOnDay', () => {
  it('lists the all-day events first, then the rest by when they start', () => {
    const list = eventsOnDay(
      [
        event({ id: 'late', startTime: '16:00', endTime: '17:00' }),
        event({ id: 'early', startTime: '08:00', endTime: '09:00' }),
        event({ id: 'whole', allDay: true }),
      ],
      WEDNESDAY,
    )
    expect(list.map((e) => e.id)).toEqual(['whole', 'early', 'late'])
  })

  it('includes an event that merely passes through the day', () => {
    const spanning = event({ id: 'trip', start: MONDAY, end: FRIDAY })
    expect(eventsOnDay([spanning], WEDNESDAY).map((e) => e.id)).toEqual(['trip'])
  })

  it('leaves out an event that does not reach the day', () => {
    expect(eventsOnDay([event({ id: 'a' })], FRIDAY)).toEqual([])
  })
})

describe('packAllDay', () => {
  const days = [MONDAY, '2026-06-09', WEDNESDAY, '2026-06-11', FRIDAY]

  it('gives a one-day event a single column', () => {
    const [span] = packAllDay([event({ id: 'a', allDay: true })], days)
    expect(span).toMatchObject({ startIndex: 2, span: 1, lane: 0 })
  })

  it('stretches a bar across the days it covers', () => {
    const trip = event({ id: 'a', start: '2026-06-09', end: '2026-06-11' })
    expect(packAllDay([trip], days)[0]).toMatchObject({ startIndex: 1, span: 3 })
  })

  it('says when a bar reaches past the days on show', () => {
    const long = event({ id: 'a', start: '2026-06-01', end: '2026-06-30' })
    expect(packAllDay([long], days)[0]).toMatchObject({
      startIndex: 0,
      span: 5,
      continuesBefore: true,
      continuesAfter: true,
    })
  })

  it('leaves the timed events to the grid', () => {
    expect(packAllDay([event({ id: 'a' })], days)).toEqual([])
  })

  it('leaves out an event that touches none of the days on show', () => {
    const elsewhere = event({ id: 'a', start: '2026-07-01', end: '2026-07-02', allDay: true })
    expect(packAllDay([elsewhere], days)).toEqual([])
  })

  /*
   * A hidden weekday inside a range is simply not there, rather than a gap to account for:
   * the bar covers the run between the first and last day it actually shows on.
   */
  it('covers only the visible days of a range that crosses a hidden one', () => {
    const week = [MONDAY, '2026-06-09', WEDNESDAY, '2026-06-11', FRIDAY]
    const overWeekend = event({ id: 'a', start: FRIDAY, end: '2026-06-15' })
    expect(packAllDay([overWeekend], week)[0]).toMatchObject({ startIndex: 4, span: 1 })
  })

  it('stacks bars that overlap onto separate rows', () => {
    const spans = packAllDay(
      [
        event({ id: 'a', start: MONDAY, end: WEDNESDAY }),
        event({ id: 'b', start: '2026-06-09', end: FRIDAY }),
      ],
      days,
    )
    expect(spans.map((s) => s.lane).sort()).toEqual([0, 1])
  })

  it('puts two bars that do not meet on the same row', () => {
    const spans = packAllDay(
      [
        event({ id: 'a', start: MONDAY, end: '2026-06-09' }),
        event({ id: 'b', start: '2026-06-11', end: FRIDAY }),
      ],
      days,
    )
    expect(spans.every((s) => s.lane === 0)).toBe(true)
  })

  it('draws the same band whatever order the events arrive in', () => {
    const input = [
      event({ id: 'a', start: MONDAY, end: WEDNESDAY }),
      event({ id: 'b', start: '2026-06-09', end: FRIDAY }),
      event({ id: 'c', start: WEDNESDAY, end: FRIDAY }),
    ]
    const forward = packAllDay(input, days)
    const backward = packAllDay([...input].reverse(), days)
    expect(backward).toEqual(forward)
  })
})

describe('fractionOf', () => {
  it('reads a moment as a share of the window on show', () => {
    expect(fractionOf(at(12), DAY)).toBeCloseTo(0.5)
    expect(fractionOf(at(9), windowOf(9, 17))).toBe(0)
    expect(fractionOf(at(17), windowOf(9, 17))).toBe(1)
  })

  it('holds a moment outside the window at the edge', () => {
    expect(fractionOf(at(3), windowOf(9, 17))).toBe(0)
    expect(fractionOf(at(23), windowOf(9, 17))).toBe(1)
  })
})

describe('pointToCell', () => {
  const geometry = { top: 100, height: 480, inlineStart: 200, inlineSize: 700, columns: 7 }

  it('reads the column and the time under a point', () => {
    const cell = pointToCell({ x: 250, y: 340 }, geometry, DAY, false)
    expect(cell.columnIndex).toBe(0)
    expect(cell.minutes).toBeCloseTo(720)
  })

  it('counts the columns from the other edge in a right-to-left page', () => {
    const rtl = { ...geometry, inlineStart: 900 }
    expect(pointToCell({ x: 850, y: 100 }, rtl, DAY, true).columnIndex).toBe(0)
    expect(pointToCell({ x: 250, y: 100 }, rtl, DAY, true).columnIndex).toBe(6)
  })

  /*
   * What makes a drag that wanders off the component keep behaving: the nearest sensible
   * answer, never none.
   */
  it('brings a point outside the grid back to its edge', () => {
    expect(pointToCell({ x: -500, y: -500 }, geometry, DAY, false)).toEqual({
      columnIndex: 0,
      minutes: 0,
    })
    expect(pointToCell({ x: 5000, y: 5000 }, geometry, DAY, false)).toEqual({
      columnIndex: 6,
      minutes: 1440,
    })
  })

  it('survives a grid nothing has laid out yet', () => {
    const zero = { top: 0, height: 0, inlineStart: 0, inlineSize: 0, columns: 0 }
    expect(pointToCell({ x: 0, y: 0 }, zero, DAY, false)).toEqual({
      columnIndex: 0,
      minutes: 0,
    })
  })
})

describe('snapping', () => {
  it('rounds to the nearest step', () => {
    expect(snapToSlot(547, 15)).toBe(540)
    expect(snapToSlot(548, 15)).toBe(555)
  })

  it('rounds down to the step a new event begins in', () => {
    expect(floorToSlot(554, 15)).toBe(540)
    expect(floorToSlot(555, 15)).toBe(555)
  })

  it('does not divide by a step of nothing', () => {
    expect(snapToSlot(547, 0)).toBe(547)
    expect(floorToSlot(547, 0)).toBe(547)
  })
})

describe('moveEvent', () => {
  const origin = { start: WEDNESDAY, end: WEDNESDAY, startTime: '09:00', endTime: '10:30' }

  it('carries the event whole, keeping how long it lasts', () => {
    expect(moveEvent(origin, 1, 30, DAY)).toEqual({
      start: '2026-06-11',
      end: '2026-06-11',
      startTime: '09:30',
      endTime: '11:00',
    })
  })

  it('steps over the hidden days when it is given a week', () => {
    const friday = { ...origin, start: FRIDAY, end: FRIDAY }
    expect(moveEvent(friday, 1, 0, DAY, WORKING_DAYS).start).toBe('2026-06-15')
  })

  /*
   * Moving something must never change how long it is — that is the other gesture's job.
   * So an event pushed past the end of the window is held against it instead of being cut.
   */
  it('holds an event at the edge rather than shortening it', () => {
    const late = moveEvent(origin, 0, 10_000, DAY)
    expect(late.startTime).toBe('22:30')
    expect(late.endTime).toBe('23:59')
  })

  it('holds it at the top edge the same way', () => {
    expect(moveEvent(origin, 0, -10_000, DAY)).toMatchObject({
      startTime: '00:00',
      endTime: '01:30',
    })
  })
})

describe('daySpan', () => {
  it('is zero for an event that starts and ends the same day', () => {
    expect(
      daySpan({ start: WEDNESDAY, end: WEDNESDAY, startTime: '09:00', endTime: '10:00' }),
    ).toBe(0)
  })

  it('counts the days beyond the first', () => {
    expect(daySpan({ start: MONDAY, end: FRIDAY, startTime: '00:00', endTime: '23:59' })).toBe(4)
  })

  it('survives a month boundary', () => {
    expect(
      daySpan({ start: '2026-06-29', end: '2026-07-02', startTime: '00:00', endTime: '23:59' }),
    ).toBe(3)
  })

  it('answers zero rather than throwing on a malformed date', () => {
    expect(daySpan({ start: 'nonsense', end: FRIDAY, startTime: '00:00', endTime: '23:59' })).toBe(
      0,
    )
  })
})

describe('moveEventToDay', () => {
  /*
   * The whole reason this exists beside `moveEvent`: that one collapses `end` onto `start`,
   * so a three-day trip put through it would come out as one Tuesday.
   */
  it('keeps the length in days', () => {
    const trip = { start: MONDAY, end: '2026-06-10', startTime: '09:00', endTime: '17:00' }
    expect(moveEventToDay(trip, FRIDAY)).toEqual({
      start: FRIDAY,
      end: '2026-06-14',
      startTime: '09:00',
      endTime: '17:00',
    })
  })

  it('carries the times along untouched', () => {
    const one = { start: WEDNESDAY, end: WEDNESDAY, startTime: '08:15', endTime: '08:45' }
    expect(moveEventToDay(one, MONDAY)).toEqual({
      start: MONDAY,
      end: MONDAY,
      startTime: '08:15',
      endTime: '08:45',
    })
  })

  it('leaves the event alone when the target is not a date', () => {
    const one = { start: WEDNESDAY, end: WEDNESDAY, startTime: '09:00', endTime: '10:00' }
    expect(moveEventToDay(one, 'nonsense')).toBe(one)
  })
})

describe('pointToMonthCell', () => {
  const geometry = { top: 100, height: 600, inlineStart: 200, inlineSize: 700, columns: 7, rows: 6 }

  it('reads the column and the row under a point', () => {
    expect(pointToMonthCell({ x: 250, y: 150 }, geometry, false)).toEqual({
      columnIndex: 0,
      rowIndex: 0,
    })
    expect(pointToMonthCell({ x: 850, y: 650 }, geometry, false)).toEqual({
      columnIndex: 6,
      rowIndex: 5,
    })
  })

  it('counts the columns from the other edge in a right-to-left page', () => {
    const rtl = { ...geometry, inlineStart: 900 }
    expect(pointToMonthCell({ x: 850, y: 150 }, rtl, true).columnIndex).toBe(0)
    expect(pointToMonthCell({ x: 250, y: 150 }, rtl, true).columnIndex).toBe(6)
  })

  it('brings a point outside the grid back to its edge', () => {
    expect(pointToMonthCell({ x: -500, y: -500 }, geometry, false)).toEqual({
      columnIndex: 0,
      rowIndex: 0,
    })
    expect(pointToMonthCell({ x: 5000, y: 5000 }, geometry, false)).toEqual({
      columnIndex: 6,
      rowIndex: 5,
    })
  })

  it('survives a grid nothing has laid out yet', () => {
    const zero = { top: 0, height: 0, inlineStart: 0, inlineSize: 0, columns: 0, rows: 0 }
    expect(pointToMonthCell({ x: 0, y: 0 }, zero, false)).toEqual({ columnIndex: 0, rowIndex: 0 })
  })
})

describe('inlineEdgeAt', () => {
  const geometry = { inlineStart: 200, inlineSize: 700 }

  it('says nothing in the middle', () => {
    expect(inlineEdgeAt(550, geometry, 48, false)).toBeNull()
  })

  it('names the start edge going back and the end edge going on', () => {
    expect(inlineEdgeAt(210, geometry, 48, false)).toBe(-1)
    expect(inlineEdgeAt(890, geometry, 48, false)).toBe(1)
  })

  /*
   * A pointer dragged clean off the calendar is asking to keep going, not to stop — so past
   * the far side still counts as being against that edge.
   */
  it('keeps naming the edge past the end of the box', () => {
    expect(inlineEdgeAt(-500, geometry, 48, false)).toBe(-1)
    expect(inlineEdgeAt(5000, geometry, 48, false)).toBe(1)
  })

  // "Back" is the reading direction's start, so it swaps sides with the script.
  it('swaps the two edges in a right-to-left page', () => {
    const rtl = { inlineStart: 900, inlineSize: 700 }
    expect(inlineEdgeAt(890, rtl, 48, true)).toBe(-1)
    expect(inlineEdgeAt(210, rtl, 48, true)).toBe(1)
  })

  it('answers nothing at all when there is no band or no box', () => {
    expect(inlineEdgeAt(210, geometry, 0, false)).toBeNull()
    expect(inlineEdgeAt(210, { inlineStart: 0, inlineSize: 0 }, 48, false)).toBeNull()
  })
})

describe('blockEdgeAt', () => {
  const geometry = { top: 100, height: 600 }

  it('asks for nothing in the middle', () => {
    expect(blockEdgeAt(400, geometry, 48)).toBe(0)
  })

  /*
   * A fraction rather than a direction, so the scroll can speed up towards the edge: at a
   * constant speed nothing works — useful at the boundary is uncontrollable a few pixels in.
   */
  it('rises towards the edge rather than switching on flat', () => {
    const gentle = blockEdgeAt(136, geometry, 48)
    const hard = blockEdgeAt(104, geometry, 48)
    expect(gentle).toBeLessThan(0)
    expect(hard).toBeLessThan(gentle)
    expect(hard).toBeGreaterThanOrEqual(-1)
  })

  it('is negative at the top and positive at the bottom', () => {
    expect(blockEdgeAt(100, geometry, 48)).toBe(-1)
    expect(blockEdgeAt(700, geometry, 48)).toBe(1)
  })

  it('never asks for more than full speed, however far outside the box', () => {
    expect(blockEdgeAt(-5000, geometry, 48)).toBe(-1)
    expect(blockEdgeAt(5000, geometry, 48)).toBe(1)
  })

  it('asks for nothing when there is no band or no box', () => {
    expect(blockEdgeAt(100, geometry, 0)).toBe(0)
    expect(blockEdgeAt(100, { top: 0, height: 0 }, 48)).toBe(0)
  })
})

describe('pointWithin', () => {
  const box = { left: 200, top: 100, width: 700, height: 600 }

  it('is true anywhere inside', () => {
    expect(pointWithin({ x: 550, y: 400 }, box)).toBe(true)
  })

  // All four, deliberately: a test of one side passes an implementation that checks only that one.
  it('is false past any of the four sides', () => {
    expect(pointWithin({ x: 150, y: 400 }, box)).toBe(false)
    expect(pointWithin({ x: 950, y: 400 }, box)).toBe(false)
    expect(pointWithin({ x: 550, y: 50 }, box)).toBe(false)
    expect(pointWithin({ x: 550, y: 750 }, box)).toBe(false)
  })

  it('counts the edges as inside', () => {
    expect(pointWithin({ x: 200, y: 100 }, box)).toBe(true)
    expect(pointWithin({ x: 900, y: 700 }, box)).toBe(true)
  })

  /*
   * The degenerate case, and the one that decides the whole feature: with nothing measured there
   * is no outside to be on. jsdom lays nothing out, so taking a zero-size box literally would make
   * every drag in the component's tests read as released off the calendar — and in a browser it
   * would make a calendar in a hidden tab, or one on its first frame, refuse every drop.
   */
  it('contains everything when the box has not been laid out', () => {
    expect(pointWithin({ x: 5000, y: -5000 }, { left: 0, top: 0, width: 0, height: 0 })).toBe(true)
  })
})

describe('resizeEvent', () => {
  const origin = { start: WEDNESDAY, end: WEDNESDAY, startTime: '09:00', endTime: '10:00' }

  it('moves the end and leaves the start where it is', () => {
    expect(resizeEvent(origin, at(11, 30), 15, DAY)).toEqual({
      start: WEDNESDAY,
      end: WEDNESDAY,
      startTime: '09:00',
      endTime: '11:30',
    })
  })

  it('never lets the end cross the start', () => {
    expect(resizeEvent(origin, at(6), 15, DAY).endTime).toBe('09:15')
  })

  it('keeps the end inside the window', () => {
    expect(resizeEvent(origin, 5000, 15, DAY).endTime).toBe('23:59')
  })
})

describe('minutesAt', () => {
  it('reads a time, and falls back when there is none to read', () => {
    expect(minutesAt('09:30', 0)).toBe(570)
    expect(minutesAt(undefined, 42)).toBe(42)
    expect(minutesAt('nonsense', 42)).toBe(42)
  })
})

describe('DRAG_THRESHOLD', () => {
  // It is what keeps a click a click: without it the hand's tremor during a press would
  // register as a one-pixel drag, and every click would silently move its event.
  it('is a small but non-zero number of pixels', () => {
    expect(DRAG_THRESHOLD).toBeGreaterThan(0)
    expect(DRAG_THRESHOLD).toBeLessThan(10)
  })
})
