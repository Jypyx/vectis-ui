/**
 * Shared calendar contracts live outside the parent SFC to avoid cycles between it and its
 * views.
 */

import type { HourFormat } from '../../utils/time'

/** What identifies one event, and what the move and resize events refer back to. */
export type CalendarEventId = string | number

/** One entry in the calendar. */
export interface CalendarEvent {
  /** What identifies this event. */
  id: CalendarEventId
  /** What the event is called. It is the accessible name of its card. */
  title: string
  /** The day it starts on. */
  start: string
  /** The day it ends on: the same day as `start` for an ordinary appointment. */
  end: string
  /** When it starts on that day. */
  startTime: string
  /** When it ends. */
  endTime: string
  /** A second line under the title, shown where the card is tall enough to hold one. */
  description?: string
  /**
   * Any CSS colour. Left out, one is derived from the id, so the same event is always drawn the
   * same way.
   */
  color?: string
  /**
   * The name of a time zone, shown beside the times as an annotation: "09:00 – 10:00
   * (Europe/Paris)".
   */
  timezone?: string
  /** Keeps the event in the band above the grid rather than in a day's column. */
  allDay?: boolean
}

/**
 * Which period the calendar is showing. `custom` is the general case and `4days` a
 * preset on the same machinery: they differ only in where the number of days comes from.
 */
export type CalendarView = 'day' | '4days' | 'week' | 'month' | 'year' | 'custom'

/** Whether times are written on a twelve or a twenty-four hour clock. */
export type CalendarFormat = HourFormat

/** How the view is set off from the page: nothing, a border, a shadow, or a muted fill. */
export type CalendarVariant = 'flat' | 'outline' | 'elevated' | 'filled'

/**
 * The shape an event's card takes: a block, which fills the box the calendar gives it and
 * can show a second line, or a chip, one line high in a row of others.
 */
export type CalendarEventLayout = 'block' | 'chip'

/**
 * Where an event sits in time, and nothing else. The move and resize events carry one of
 * these as the "before" value, so a consumer can undo a drag without keeping a copy of
 * the whole event.
 */
export interface CalendarEventTimes {
  start: string
  end: string
  startTime: string
  endTime: string
}

/** An empty part of the grid that was activated: its day, and the time it stands for. */
export interface CalendarCell {
  date: string
  time: string
}

/**
 * What the `#event` slot receives: the event, how its card is drawn, and what is happening
 * to it right now.
 */
export interface CalendarEventSlotProps<E extends CalendarEvent = CalendarEvent> {
  event: E
  /** The shape the card takes. */
  layout: CalendarEventLayout
  /** The event's times, already written out for the reader. Empty for an all-day chip. */
  timeText: string
  /** Whether the event carries on before or after what is on show. */
  continuesBefore: boolean
  continuesAfter: boolean
  /** Whether the card is being dragged with a pointer right now. */
  dragging: boolean
  /** Whether the card has been taken hold of with the keyboard. */
  grabbed: boolean
}

/**
 * The cell one of the internal grids reports as activated. A month has no hours, so its
 * `minutes` is null and VCalendar supplies the time, which is the one place it is decided.
 */
export interface ActivatedCell {
  date: string
  minutes: number | null
}
