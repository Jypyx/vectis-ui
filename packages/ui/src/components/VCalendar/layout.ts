// @core
/**
 * Everything VCalendar has to work out rather than render: which days a view shows, where
 * an event's box goes, how a day's width is shared between events happening at once, and
 * what point on the screen corresponds to what moment in the day.
 *
 * It sits in VCalendar's own folder rather than in `utils/` because it has exactly one
 * consumer, which fails the admission rule for shared code, and because VCalendar owns
 * the contract (the same reasoning as `VDatePicker/keyboard.ts` and
 * `VHotkeys/platform.ts`).
 *
 * Being pure is not tidiness here, it is the only way any of this is testable. The test
 * environment lays nothing out — every element it renders measures zero — so a function
 * that took an Element could never be checked. NOTHING below receives one: the single
 * `getBoundingClientRect()` in the whole component builds the plain `GridGeometry` struct
 * that `pointToCell` takes, and every consequence of that measurement is an ordinary unit
 * test over numbers.
 *
 * Times are handled throughout as MINUTES SINCE MIDNIGHT, converted at the edges from the
 * `HH:mm` strings the public API speaks. That is what lets the arithmetic be plain
 * addition instead of a string dance at every step.
 */
import {
  addDays,
  addMonths,
  buildMonthGrid,
  compareISO,
  daysInMonth,
  formatISO,
  isoOf,
  parseISO,
} from '../../utils/date'
import { clamp } from '../../utils/number'
import { pad2 } from '../../utils/text'
import { minutesOf } from '../../utils/time'

import type { MonthCell } from '../../utils/date'
import type { CalendarEvent, CalendarEventId, CalendarEventTimes, CalendarView } from './types'

/** How many minutes a day holds. The upper bound of every time computed here. */
const MINUTES_PER_DAY = 24 * 60

const DAYS_PER_WEEK = 7

/**
 * A day in milliseconds, for counting the days between two dates.
 *
 * It is safe here because both ends come from `parseISO`, which builds LOCAL midnights: the
 * difference between two of them is a whole number of days everywhere except across a
 * daylight-saving boundary, and `Math.round` absorbs the hour that gains or loses there.
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * How far the pointer must travel before a press becomes a drag rather than a click.
 *
 * It is what keeps click-to-create and click-to-open alive: a press that never moves this
 * far writes nothing on release and is handled as a plain activation. Without it, the
 * hand's natural tremor during a click would register as a one-pixel drag and every click
 * would silently move its event.
 */
export const DRAG_THRESHOLD = 3

/**
 * The last tie-break of every ordering below: a stable total order over event ids.
 *
 * TRAP — this must NOT be `localeCompare`. An id is an opaque key, never user-facing text,
 * so there is nothing here to collate; and `localeCompare` with no locale resolves against
 * the RUNTIME's default, which differs between Node and the browser. The three orderings it
 * settles all decide rendered markup — `packDayColumn` assigns columns, `packAllDay`
 * assigns lanes, `eventsOnDay` sets the order chips are listed in — so a divergent order is
 * a hydration mismatch, silent in dev and visible only as a card in the wrong place. It is
 * the same hazard `VDataTable` avoids by passing its locale explicitly.
 *
 * Comparing by code point is also allocation-free, which matters because all three run on
 * every frame of a drag.
 */
function compareId(a: CalendarEventId, b: CalendarEventId): number {
  const left = String(a)
  const right = String(b)
  return left < right ? -1 : left > right ? 1 : 0
}

/** The slice of the day a calendar is showing, as minutes since midnight. */
export interface TimeWindow {
  start: number
  end: number
}

/** Turns the `dayStart`/`dayEnd` props, given in hours, into the window the rest works in. */
export function windowOf(startHour: number, endHour: number): TimeWindow {
  const start = clamp(Math.round(startHour * 60), 0, MINUTES_PER_DAY)
  const end = clamp(Math.round(endHour * 60), start + 60, MINUTES_PER_DAY)
  return { start, end }
}

/**
 * Minutes since midnight back into an `HH:mm` string.
 *
 * TRAP — the value is held one minute short of midnight rather than allowed to reach it.
 * A day's last moment is 1440 in this arithmetic, but `24:00` is not a time any of the
 * design system's helpers accept (`isValidTime` rejects it), and the alternative — writing
 * `00:00` on the following day — would turn an ordinary evening appointment into a
 * two-day event and send it to the all-day band. One minute is invisible at every zoom
 * this component offers; a card in the wrong place is not.
 */
export function timeOf(minutes: number): string {
  const held = clamp(Math.round(minutes), 0, MINUTES_PER_DAY - 1)
  return `${pad2(Math.floor(held / 60))}:${pad2(held % 60)}`
}

/** An `HH:mm` string into minutes since midnight; `fallback` when it is not one. */
export function minutesAt(time: string | undefined, fallback: number): number {
  return minutesOf(time) ?? fallback
}

/**
 * The weekdays a calendar shows, in reading order.
 *
 * The array does double duty, which is why there is no separate "first day of week" prop:
 * it says which days are VISIBLE — `[1,2,3,4,5]` hides the weekend everywhere — and its
 * first entry is the day a week starts on. Given nothing, the seven days rotated to the
 * locale's own first day.
 */
export function normalizeWeekdays(
  weekdays: readonly number[] | undefined,
  firstDayOfWeek: number,
): number[] {
  const seen = new Set<number>()
  const kept: number[] = []
  for (const day of weekdays ?? []) {
    const value = Math.trunc(day)
    if (value >= 0 && value <= 6 && !seen.has(value)) {
      seen.add(value)
      kept.push(value)
    }
  }
  if (kept.length > 0) return kept
  const first = ((Math.trunc(firstDayOfWeek) % 7) + 7) % 7
  return Array.from({ length: DAYS_PER_WEEK }, (_, i) => (first + i) % 7)
}

/** Whether a date falls on one of the visible weekdays. */
export function isVisibleDay(iso: string, weekdays: readonly number[]): boolean {
  const date = parseISO(iso)
  return date !== null && weekdays.includes(date.getDay())
}

/**
 * The first visible day at or after `iso` (or at or before it, going backwards).
 *
 * The loop is bounded at seven because a non-empty weekday list always contains one of any
 * seven consecutive days — the bound is a guard against an empty list, never a real limit.
 */
export function snapToVisibleDay(
  iso: string,
  weekdays: readonly number[],
  direction: -1 | 1 = 1,
): string {
  if (weekdays.length === 0) return iso
  let current = iso
  for (let i = 0; i < DAYS_PER_WEEK; i++) {
    if (isVisibleDay(current, weekdays)) return current
    current = addDays(current, direction)
  }
  return iso
}

/** Moves `count` VISIBLE days from `iso`, skipping over the hidden ones. */
export function advanceVisibleDays(
  iso: string,
  count: number,
  weekdays: readonly number[],
): string {
  if (count === 0 || weekdays.length === 0) return iso
  const direction = count > 0 ? 1 : -1
  let current = iso
  let remaining = Math.abs(count)
  // Bounded so a malformed weekday list can never spin: at worst one visible day costs
  // seven calendar days, so this is the same walk with its worst case written down.
  let guard = Math.abs(count) * DAYS_PER_WEEK + DAYS_PER_WEEK
  while (remaining > 0 && guard-- > 0) {
    current = addDays(current, direction)
    if (isVisibleDay(current, weekdays)) remaining--
  }
  return current
}

/** How many day columns a view shows, before the visible-weekday filter applies. */
export function columnCount(view: CalendarView, customDays: number): number {
  if (view === 'day') return 1
  if (view === '4days') return 4
  if (view === 'custom') return clamp(Math.trunc(customDays), 1, 31)
  return DAYS_PER_WEEK
}

/**
 * The days a view shows, in reading order.
 *
 * `day`, `4days` and `custom` run forward from the anchor over the visible days alone, so
 * a four-day view of a Monday-to-Friday calendar shows four WORKING days rather than four
 * calendar ones. `week` shows the week the anchor falls in, starting on `weekdays[0]`.
 * `month` returns every day of the anchor's month that is visible — the grid that renders
 * them cuts them back into weeks itself.
 *
 * `year` returns an empty list on purpose: that view is twelve month names, not a row of
 * days, and giving it a 365-entry list nothing reads would be an invitation to read it.
 */
export function visibleDays(
  anchor: string,
  view: CalendarView,
  weekdays: readonly number[],
  customDays: number,
): string[] {
  if (weekdays.length === 0 || parseISO(anchor) === null) return []
  if (view === 'year') return []

  if (view === 'month') {
    const date = parseISO(anchor)!
    const year = date.getFullYear()
    const month0 = date.getMonth()
    const days: string[] = []
    for (let day = 1; day <= daysInMonth(year, month0); day++) {
      const iso = isoOf(year, month0, day)
      if (isVisibleDay(iso, weekdays)) days.push(iso)
    }
    return days
  }

  if (view === 'week') {
    const date = parseISO(anchor)!
    const offset = (date.getDay() - weekdays[0]! + DAYS_PER_WEEK) % DAYS_PER_WEEK
    const weekStart = addDays(anchor, -offset)
    const days: string[] = []
    for (let i = 0; i < DAYS_PER_WEEK; i++) {
      const iso = addDays(weekStart, i)
      if (isVisibleDay(iso, weekdays)) days.push(iso)
    }
    return days
  }

  const total = columnCount(view, customDays)
  const days: string[] = [snapToVisibleDay(anchor, weekdays)]
  for (let i = 1; i < total; i++) days.push(advanceVisibleDays(days[i - 1]!, 1, weekdays))
  return days
}

/**
 * Where Previous and Next land.
 *
 * TRAP — the day-shaped views step over VISIBLE days, not calendar ones. Stepping by one
 * calendar day from a Friday in a Monday-to-Friday calendar would land on a Saturday the
 * grid does not draw; the view would then show the same week it already showed, and the
 * button would look broken with nothing in the console to say why.
 */
export function stepAnchor(
  anchor: string,
  view: CalendarView,
  direction: -1 | 1,
  weekdays: readonly number[],
  customDays: number,
): string {
  if (parseISO(anchor) === null) return anchor
  if (view === 'month') return addMonths(anchor, direction)
  if (view === 'year') return addMonths(anchor, direction * 12)
  if (view === 'week') return snapToVisibleDay(addDays(anchor, direction * DAYS_PER_WEEK), weekdays)
  return advanceVisibleDays(anchor, direction * columnCount(view, customDays), weekdays)
}

/** The first and last day a view covers, which is what names it in the toolbar. */
export function visibleRange(
  anchor: string,
  view: CalendarView,
  weekdays: readonly number[],
  customDays: number,
): { start: string; end: string } {
  if (view === 'year') {
    const date = parseISO(anchor)
    const year = date?.getFullYear() ?? new Date().getFullYear()
    return { start: isoOf(year, 0, 1), end: isoOf(year, 11, 31) }
  }
  const days = visibleDays(anchor, view, weekdays, customDays)
  if (days.length === 0) return { start: anchor, end: anchor }
  return { start: days[0]!, end: days[days.length - 1]! }
}

/**
 * Whether an event belongs in the band above the grid rather than in a day's column.
 *
 * The second clause is not a convenience: an event running from one day to the next cannot
 * be drawn inside a single column, so the band — where it becomes a bar with its times in
 * its label — is the only place it can honestly go.
 */
export function isAllDayEvent(event: CalendarEvent): boolean {
  return event.allDay === true || compareISO(event.start, event.end) !== 0
}

/** One event's box in one day column, in minutes since midnight. */
export interface EventSegment {
  id: CalendarEventId
  /** Which of the visible columns it belongs to. */
  dayIndex: number
  start: number
  end: number
  /** Whether the window cut it off, so the card can show that it carries on past the edge. */
  clippedStart: boolean
  clippedEnd: boolean
}

/**
 * Cuts the timed events into the boxes the day columns draw. All-day events produce none —
 * they are the band's business — and so does an event whose day is not on show or whose
 * hours fall entirely outside the window.
 *
 * `minDuration` is applied HERE, by stretching the end, so that `packDayColumn` below sees
 * ordinary intervals and can stay a plain interval algorithm. Were the minimum applied
 * during packing instead, two events fifteen minutes apart would be laid out as though
 * they did not overlap and then drawn as though they did.
 */
export function timedSegments(
  events: readonly CalendarEvent[],
  days: readonly string[],
  window: TimeWindow,
  minDuration: number,
): EventSegment[] {
  const index = new Map(days.map((iso, i) => [iso, i]))
  const segments: EventSegment[] = []

  for (const event of events) {
    if (isAllDayEvent(event)) continue
    const dayIndex = index.get(event.start)
    if (dayIndex === undefined) continue

    const rawStart = minutesAt(event.startTime, window.start)
    const rawEnd = Math.max(minutesAt(event.endTime, rawStart + minDuration), rawStart + 1)
    if (rawEnd <= window.start || rawStart >= window.end) continue

    const start = clamp(rawStart, window.start, window.end - 1)
    const end = clamp(Math.max(rawEnd, start + minDuration), start + 1, window.end)
    segments.push({
      id: event.id,
      dayIndex,
      start,
      end,
      clippedStart: rawStart < window.start,
      clippedEnd: rawEnd > window.end,
    })
  }

  return segments
}

/** A segment once it knows how much of its column's width it gets. */
export interface PlacedSegment extends EventSegment {
  /** Which column of its cluster it sits in, counted from zero. */
  column: number
  /** How many columns it takes up — more than one when the room beside it is free. */
  span: number
  /** How many columns its cluster has. It is what both of the above are read against. */
  columns: number
}

/**
 * Shares one day's width out between the events happening at the same time.
 *
 * Three passes. First the segments are cut into CLUSTERS — runs joined by overlap, where an
 * event starting after everything before it has finished begins a new one. That is what
 * stops a crowded morning from squeezing a lone afternoon meeting into a sliver. Then,
 * inside a cluster, each event takes the first column whose last occupant has already
 * ended, which is the ordinary greedy colouring of an interval graph and uses as few
 * columns as the cluster can be drawn in. Finally each event grows sideways for as long as
 * nothing in the next column overlaps it, so a single event never leaves a gap it could
 * have filled.
 *
 * The order is fixed — by start, then longest first, then by id — so the same list always
 * produces the same picture. Without the id to break the last tie, two events at the same
 * time for the same length would swap places whenever the array was re-sorted, and the
 * whole day would appear to shuffle for no reason.
 *
 * Overlap is strictly `a.start < b.end && b.start < a.end`, so events that merely touch —
 * one ending exactly as the next begins — share a column instead of splitting the width.
 */
export function packDayColumn(segments: readonly EventSegment[]): PlacedSegment[] {
  const sorted = [...segments].sort(
    (a, b) => a.start - b.start || b.end - b.start - (a.end - a.start) || compareId(a.id, b.id),
  )

  const placed: PlacedSegment[] = []
  let cluster: PlacedSegment[] = []
  let columnEnds: number[] = []
  let clusterEnd = -Infinity

  const flush = () => {
    const columns = columnEnds.length
    for (const item of cluster) {
      let span = 1
      while (
        item.column + span < columns &&
        !cluster.some(
          (other) =>
            other.column === item.column + span && other.start < item.end && item.start < other.end,
        )
      ) {
        span++
      }
      item.span = span
      item.columns = columns
    }
    placed.push(...cluster)
    cluster = []
    columnEnds = []
    clusterEnd = -Infinity
  }

  for (const segment of sorted) {
    if (segment.start >= clusterEnd && cluster.length > 0) flush()

    let column = columnEnds.findIndex((end) => end <= segment.start)
    if (column === -1) {
      column = columnEnds.length
      columnEnds.push(segment.end)
    } else {
      columnEnds[column] = segment.end
    }

    cluster.push({ ...segment, column, span: 1, columns: 1 })
    clusterEnd = Math.max(clusterEnd, segment.end)
  }
  if (cluster.length > 0) flush()

  return placed
}

/**
 * One square of the month view: a day, and whether it belongs to the month on show.
 *
 * It is `utils/date`'s own type, re-exported rather than restated: `monthWeeks` below builds
 * its cells by calling `buildMonthGrid` from that module, so a second declaration here could
 * only ever drift away from the shape it is actually handed. The re-export keeps
 * `import { type MonthCell } from './layout'` working for the two views that read it.
 */
export type { MonthCell }

/**
 * The month view, cut into weeks.
 *
 * It keeps the fixed six rows `buildMonthGrid` produces — padded with the neighbouring
 * months — so the grid is the same height whichever month is on show and the page does not
 * jump as one steps through the year. Each row is then filtered down to the visible
 * weekdays, which is what makes a Monday-to-Friday month five columns wide rather than
 * seven with two blanks.
 */
export function monthWeeks(anchor: string, weekdays: readonly number[]): MonthCell[][] {
  const date = parseISO(anchor)
  if (!date || weekdays.length === 0) return []

  const cells = buildMonthGrid(date.getFullYear(), date.getMonth(), weekdays[0]!)
  const weeks: MonthCell[][] = []
  for (let i = 0; i < cells.length; i += DAYS_PER_WEEK) {
    const week = cells
      .slice(i, i + DAYS_PER_WEEK)
      .filter((cell) => isVisibleDay(cell.iso, weekdays))
    if (week.length > 0) weeks.push(week)
  }
  return weeks
}

/** The first day of each month of the anchor's year, which is what the year view lays out. */
export function monthsOfYear(anchor: string): string[] {
  const date = parseISO(anchor)
  if (!date) return []
  const year = date.getFullYear()
  return Array.from({ length: 12 }, (_, month0) => isoOf(year, month0, 1))
}

/** Whether an event covers a given day at all, all-day or timed. */
export function coversDay(event: CalendarEvent, iso: string): boolean {
  return compareISO(iso, event.start) >= 0 && compareISO(iso, event.end) <= 0
}

/**
 * The events falling on one day, in the order a summary should list them: the all-day ones
 * first, since they frame the day rather than sit inside it, then the rest by when they
 * start. The last tie is broken by id so the list cannot reshuffle for no reason.
 */
export function eventsOnDay<T extends CalendarEvent>(events: readonly T[], iso: string): T[] {
  return events.filter((event) => coversDay(event, iso)).sort(compareForDay)
}

/** The order `eventsOnDay` and `eventsByDay` both list a day in — see `eventsOnDay`. */
function compareForDay(a: CalendarEvent, b: CalendarEvent): number {
  const allDayA = isAllDayEvent(a) ? 0 : 1
  const allDayB = isAllDayEvent(b) ? 0 : 1
  return (
    allDayA - allDayB ||
    minutesAt(a.startTime, 0) - minutesAt(b.startTime, 0) ||
    compareId(a.id, b.id)
  )
}

/**
 * Every visible day's events at once, in one pass over the list.
 *
 * WHY THIS EXISTS RATHER THAN A LOOP OVER `eventsOnDay`. The month view needs all 42 squares
 * filled, and asking `eventsOnDay` once per square walks the whole event list 42 times and
 * sorts it 42 times — `cells × events`, with a sort each. Measured on the bench: 7.8 ms per
 * render at 2000 events, and the month view re-renders on every `pointermove` of a drag, so
 * that is roughly half a frame spent rebuilding lists no gesture changed.
 *
 * Here each event is placed once, into the days it actually covers, and each day is sorted
 * once — `events × span + cells × k log k`. The walk is bounded to the grid on both ends, so
 * an event running from last year costs its visible part and nothing more.
 *
 * The ORDER is identical to `eventsOnDay`'s, because both sort with `compareForDay`. That
 * matters: it is the order chips are listed in, so a difference would be visible.
 */
export function eventsByDay<T extends CalendarEvent>(
  events: readonly T[],
  days: readonly string[],
): Map<string, T[]> {
  const buckets = new Map<string, Ranked<T>[]>()
  for (const iso of days) buckets.set(iso, [])
  if (days.length === 0) return new Map()

  // The grid's own bounds. `days` is in order, so its ends bound every walk below — which
  // is what keeps a long-running event from being walked outside the month on show.
  const first = days[0]!
  const last = days[days.length - 1]!

  for (const event of events) {
    const from = compareISO(event.start, first) > 0 ? event.start : first
    const to = compareISO(event.end, last) < 0 ? event.end : last
    if (compareISO(from, to) > 0) continue

    /*
     * Decorate-sort-undecorate, for the classic reason: the sort key is derived ONCE per
     * event rather than once per comparison, which is where the time in this function goes.
     * `compareForDay` calls `minutesAt`, which re-parses an `HH:mm` string on every ask, and
     * a 42-square month holding 2000 events sorts some 17 000 pairs. Measured at 9.97 ms
     * against 4.19 ms with the key hoisted.
     */
    const ranked: Ranked<T> = {
      event,
      allDay: isAllDayEvent(event) ? 0 : 1,
      minutes: minutesAt(event.startTime, 0),
      id: String(event.id),
    }

    for (let iso = from; compareISO(iso, to) <= 0; iso = addDays(iso, 1)) {
      // A day the weekday filter hides has no bucket, so it is simply skipped: that is what
      // makes a Monday-to-Friday month cost nothing for the weekends it does not show.
      buckets.get(iso)?.push(ranked)
    }
  }

  const byDay = new Map<string, T[]>()
  for (const [iso, list] of buckets) {
    list.sort(compareRanked)
    byDay.set(
      iso,
      list.map((item) => item.event),
    )
  }
  return byDay
}

/** An event with its sort key already worked out — see `eventsByDay`. */
interface Ranked<T> {
  event: T
  allDay: number
  minutes: number
  id: string
}

/** `compareForDay`, reading keys that are already computed rather than deriving them. */
function compareRanked<T>(a: Ranked<T>, b: Ranked<T>): number {
  return a.allDay - b.allDay || a.minutes - b.minutes || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}

/** One bar in the all-day band: the columns it covers, and the row it sits on. */
export interface AllDaySpan {
  id: CalendarEventId
  /** The first visible column it covers. */
  startIndex: number
  /** How many visible columns it covers, at least one. */
  span: number
  /** Whether it reaches beyond the days on show, on either side. */
  continuesBefore: boolean
  continuesAfter: boolean
  /** Which row of the band it sits on. */
  lane: number
}

/**
 * Stacks the all-day bars into as few rows as they fit in.
 *
 * A bar covers the run from the FIRST to the LAST visible day it touches, which is what
 * makes a hidden weekday in the middle of a range simply not there rather than a gap to
 * account for: an event running Friday to Monday in a Monday-to-Friday calendar shows as
 * one day on the Friday and one on the following Monday, because those are the two days it
 * actually covers on screen.
 *
 * The rows are the same greedy pass the day columns use — each bar takes the first row
 * whose last bar has already ended — and the ordering is fixed, longest first at equal
 * starts, so the band cannot reshuffle when the array is re-sorted.
 */
export function packAllDay(
  events: readonly CalendarEvent[],
  days: readonly string[],
): AllDaySpan[] {
  const spans: AllDaySpan[] = []

  for (const event of events) {
    if (!isAllDayEvent(event)) continue

    let first = -1
    let last = -1
    for (let i = 0; i < days.length; i++) {
      if (coversDay(event, days[i]!)) {
        if (first === -1) first = i
        last = i
      }
    }
    if (first === -1) continue

    spans.push({
      id: event.id,
      startIndex: first,
      span: last - first + 1,
      continuesBefore: compareISO(event.start, days[first]!) < 0,
      continuesAfter: compareISO(event.end, days[last]!) > 0,
      lane: 0,
    })
  }

  spans.sort((a, b) => a.startIndex - b.startIndex || b.span - a.span || compareId(a.id, b.id))

  const laneEnds: number[] = []
  for (const span of spans) {
    let lane = laneEnds.findIndex((end) => end < span.startIndex)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(0)
    }
    laneEnds[lane] = span.startIndex + span.span - 1
    span.lane = lane
  }

  return spans
}

/** Where a moment sits in the visible window, as a unitless fraction the stylesheet scales. */
export function fractionOf(minutes: number, window: TimeWindow): number {
  const span = window.end - window.start
  return span > 0 ? clamp((minutes - window.start) / span, 0, 1) : 0
}

/** The measurements of the grid a pointer is being read against, in viewport coordinates. */
export interface GridGeometry {
  top: number
  height: number
  /** The edge the first column starts at: the left one normally, the right one in RTL. */
  inlineStart: number
  inlineSize: number
  columns: number
}

/**
 * Turns a point on the screen into a point on the calendar: which day column it fell in,
 * and what moment that height stands for.
 *
 * Both answers are brought back inside the grid, so a pointer dragged past an edge keeps
 * producing the nearest sensible value rather than none — which is what makes a drag that
 * wanders off the component behave as the user expects instead of stopping dead.
 */
export function pointToCell(
  point: { x: number; y: number },
  geometry: GridGeometry,
  window: TimeWindow,
  rtl: boolean,
): { columnIndex: number; minutes: number } {
  const columns = Math.max(1, geometry.columns)
  const columnSize = geometry.inlineSize / columns
  const offset = rtl ? geometry.inlineStart - point.x : point.x - geometry.inlineStart
  const columnIndex = clamp(columnSize > 0 ? Math.floor(offset / columnSize) : 0, 0, columns - 1)

  const fraction = geometry.height > 0 ? (point.y - geometry.top) / geometry.height : 0
  const minutes = clamp(
    window.start + fraction * (window.end - window.start),
    window.start,
    window.end,
  )

  return { columnIndex, minutes }
}

/** Rounds a moment to the nearest step the calendar allows. */
export function snapToSlot(minutes: number, step: number): number {
  const size = step > 0 ? step : 1
  return clamp(Math.round(minutes / size) * size, 0, MINUTES_PER_DAY)
}

/** Rounds a moment DOWN to the step containing it — where a new event begins. */
export function floorToSlot(minutes: number, step: number): number {
  const size = step > 0 ? step : 1
  return clamp(Math.floor(minutes / size) * size, 0, MINUTES_PER_DAY)
}

/**
 * Where an event lands when it is dragged or nudged: it keeps its length and moves by whole
 * days and whole steps.
 *
 * An event pushed past the end of the window is held against it rather than having its tail
 * cut off — moving something must never change how long it is, which is the other gesture's
 * job.
 */
export function moveEvent(
  origin: CalendarEventTimes,
  dayDelta: number,
  minuteDelta: number,
  window: TimeWindow,
  weekdays?: readonly number[],
): CalendarEventTimes {
  const startMinutes = minutesAt(origin.startTime, window.start)
  const endMinutes = Math.max(minutesAt(origin.endTime, startMinutes), startMinutes + 1)
  const duration = endMinutes - startMinutes

  const start =
    weekdays && weekdays.length > 0
      ? advanceVisibleDays(origin.start, dayDelta, weekdays)
      : addDays(origin.start, dayDelta)

  const nextStart = clamp(
    startMinutes + minuteDelta,
    window.start,
    Math.max(window.start, window.end - duration),
  )

  return {
    start,
    end: start,
    startTime: timeOf(nextStart),
    endTime: timeOf(nextStart + duration),
  }
}

/**
 * Where the end of an event lands when its bottom edge is dragged. It can never cross the
 * start: the shortest an event may become is one step, which is also the length a new one
 * is created at.
 */
export function resizeEvent(
  origin: CalendarEventTimes,
  endMinutes: number,
  minDuration: number,
  window: TimeWindow,
): CalendarEventTimes {
  const startMinutes = minutesAt(origin.startTime, window.start)
  const floor = Math.max(minDuration, 1)
  const end = clamp(endMinutes, startMinutes + floor, window.end)

  return {
    start: origin.start,
    end: origin.start,
    startTime: timeOf(startMinutes),
    endTime: timeOf(end),
  }
}

/**
 * How many whole days an event covers beyond its first — zero for one that starts and ends
 * on the same day, two for a trip from Monday to Wednesday.
 */
export function daySpan(times: CalendarEventTimes): number {
  const start = parseISO(times.start)
  const end = parseISO(times.end)
  if (!start || !end) return 0
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY))
}

/**
 * Moves an event to another day, KEEPING its length in days as well as its times.
 *
 * This is the counterpart of `moveEvent`, and the two must not be confused: that one is for
 * a timed move INSIDE a single day and deliberately collapses `end` onto `start`, so putting
 * a three-day trip through it would silently squash it into one Tuesday. This one is for the
 * whole-day gestures — an all-day bar dragged along the band, a chip dragged across a month —
 * where the times are carried along untouched and only the dates move.
 */
export function moveEventToDay(origin: CalendarEventTimes, target: string): CalendarEventTimes {
  if (parseISO(target) === null) return origin
  return {
    start: target,
    end: addDays(target, daySpan(origin)),
    startTime: origin.startTime,
    endTime: origin.endTime,
  }
}

/** The measurements of a month grid — the same struct, with rows where a time window was. */
export interface MonthGeometry {
  top: number
  height: number
  inlineStart: number
  inlineSize: number
  columns: number
  rows: number
}

/**
 * Turns a point on the screen into a square of the month.
 *
 * The block axis is a ROW here rather than a moment, which is the whole difference from
 * `pointToCell` — the inline half is the same arithmetic, RTL flip included. It is sound
 * because every week of a month is drawn the same height: the rows share what space there is
 * and a day too full for its box clips rather than growing.
 */
export function pointToMonthCell(
  point: { x: number; y: number },
  geometry: MonthGeometry,
  rtl: boolean,
): { columnIndex: number; rowIndex: number } {
  const columns = Math.max(1, geometry.columns)
  const rows = Math.max(1, geometry.rows)

  const columnSize = geometry.inlineSize / columns
  const offset = rtl ? geometry.inlineStart - point.x : point.x - geometry.inlineStart
  const columnIndex = clamp(columnSize > 0 ? Math.floor(offset / columnSize) : 0, 0, columns - 1)

  const rowSize = geometry.height / rows
  const rowIndex = clamp(
    rowSize > 0 ? Math.floor((point.y - geometry.top) / rowSize) : 0,
    0,
    rows - 1,
  )

  return { columnIndex, rowIndex }
}

/**
 * Which inline edge a point is resting against, as a direction to page in: -1 for the start
 * edge, 1 for the end one, nothing in between.
 *
 * It answers in READING order, so the start edge is the left one normally and the right one
 * in a right-to-left page — which is what makes "hold at the edge to go back" mean the same
 * thing in both.
 */
export function inlineEdgeAt(
  x: number,
  geometry: { inlineStart: number; inlineSize: number },
  band: number,
  rtl: boolean,
): -1 | 1 | null {
  if (band <= 0 || geometry.inlineSize <= 0) return null
  const offset = rtl ? geometry.inlineStart - x : x - geometry.inlineStart
  // Past the far side of the box counts as being against that edge: a pointer dragged clean
  // off the calendar is asking to keep going, not to stop.
  if (offset < band) return -1
  if (offset > geometry.inlineSize - band) return 1
  return null
}

/**
 * How hard a point near the top or bottom of a box is asking it to scroll: -1 at the very
 * top, 1 at the very bottom, 0 anywhere in the middle.
 *
 * A FRACTION and not a direction, so the speed can rise as the pointer nears the edge. At a
 * constant speed there is no setting that works: fast enough to be useful at the boundary is
 * uncontrollable a few pixels in, and gentle enough to be controllable never gets anywhere.
 */
export function blockEdgeAt(
  y: number,
  geometry: { top: number; height: number },
  band: number,
): number {
  if (band <= 0 || geometry.height <= 0) return 0
  const fromTop = y - geometry.top
  const fromBottom = geometry.top + geometry.height - y
  if (fromTop < band) return -clamp((band - fromTop) / band, 0, 1)
  if (fromBottom < band) return clamp((band - fromBottom) / band, 0, 1)
  return 0
}

/**
 * Whether a point falls inside a box — how a drag decides, on release, whether it is over the
 * calendar at all or over the toolbar, or over the page beside it.
 *
 * It takes the box as the browser MEASURED it, and never the `GridGeometry` the rest of this file
 * works in. Containment is a physical question with no reading direction, where `inlineStart` is
 * the box's RIGHT edge in a right-to-left page: bracketing with it would walk off the far side of
 * the screen and make every right-to-left drop read as outside. `columns` says nothing about
 * whether a point is in a box either, so asking for a `GridGeometry` would ask every caller to
 * build a thing this needs no part of.
 *
 * The edges COUNT as inside: a rect is a pair of floats on a screen that may be scaled by a
 * fraction, and an exclusive boundary would refuse a drop that looked, and was, on target.
 *
 * TRAP — a box that measures nothing contains EVERYTHING. That is the same answer `inlineEdgeAt`
 * and `blockEdgeAt` give a box of no size, and for the same reason: with no measurement there is
 * no outside to be on. Take a zero-size box literally instead and the calendar refuses every drop
 * wherever nothing has been laid out — in a hidden tab, before the first frame, and in jsdom,
 * which measures nothing at all and where all but a handful of the drag tests would go red at
 * once.
 */
export function pointWithin(
  point: { x: number; y: number },
  box: { left: number; top: number; width: number; height: number },
): boolean {
  if (box.width <= 0 || box.height <= 0) return true
  return (
    point.x >= box.left &&
    point.x <= box.left + box.width &&
    point.y >= box.top &&
    point.y <= box.top + box.height
  )
}

/** The times of an event, as the shape the move and resize events carry. */
export function timesOf(event: CalendarEvent): CalendarEventTimes {
  return {
    start: event.start,
    end: event.end,
    startTime: event.startTime,
    endTime: event.endTime,
  }
}

/** Today, as the calendar reads it. Kept here so the component has one place to call. */
export function todayISO(): string {
  return formatISO(new Date())
}
