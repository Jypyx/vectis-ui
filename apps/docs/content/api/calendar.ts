/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'

export default {
  components: [
    {
      name: 'VCalendar',
      props: [
        { name: 'views', type: 'CalendarView[]', default: "['day', '4days', 'week']" },
        { name: 'customDays', type: 'number', default: '4' },
        { name: 'weekdays', type: 'number[]' },
        { name: 'locale', type: 'string' },
        { name: 'format', type: 'HourFormat', values: "'12h' | '24h'" },
        { name: 'dayStart', type: 'number', default: '0' },
        { name: 'dayEnd', type: 'number', default: '24' },
        { name: 'slotDuration', type: 'number', default: '15' },
        { name: 'scrollTime', type: 'string', default: "'08:00'" },
        { name: 'hideCurrentTime', type: 'boolean', default: 'false' },
        { name: 'monthEventLimit', type: 'number', default: '3' },
        { name: 'readonly', type: 'boolean', default: 'false' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'creatable', type: 'boolean', default: 'false' },
        { name: 'edgeStepDelay', type: 'number', default: '800' },
        { name: 'noEdgeScroll', type: 'boolean', default: 'false' },
        { name: 'label', type: 'string' },
        { name: 'v-model:view', key: 'vModelView', type: 'CalendarView', values: "'day' | '4days' | 'week' | 'month' | 'year' | 'custom'", default: "'week'" },
        { name: 'v-model:date', key: 'vModelDate', type: 'string', default: 'today' },
        { name: 'v-model:events', key: 'vModelEvents', type: 'E[]', default: '[]' },
      ],
      events: [
        { name: 'event-activate', key: 'eventActivate', type: '[event: E]' },
        { name: 'slot-activate', key: 'slotActivate', type: '[slot: { date: string; time: string; }]' },
        { name: 'event-move', key: 'eventMove', type: '[event: E, previous: CalendarEventTimes]' },
        { name: 'event-resize', key: 'eventResize', type: '[event: E, previous: CalendarEventTimes]' },
        { name: 'event-create', key: 'eventCreate', type: '[event: CalendarEvent]' },
      ],
      slots: [
        { name: 'actions', type: '{}' },
        { name: 'event', type: "{ event: E; layout: 'block' | 'chip'; timeText: string; continuesBefore: boolean; continuesAfter: boolean; }" },
        { name: 'day-header', key: 'dayHeader', type: '{ iso: string; weekday: string; day: string; today: boolean; }' },
        { name: 'all-day-label', key: 'allDayLabel', type: '{}' },
      ],
    },
  ],
  types: [
    {
      name: 'CalendarEvent',
      definition: `export interface CalendarEvent {
  id: CalendarEventId
  title: string
  start: string
  end: string
  startTime: string
  endTime: string
  description?: string
  color?: string
  timezone?: string
  allDay?: boolean
}`,
    },
    {
      name: 'CalendarEventId',
      definition: `export type CalendarEventId = string | number`,
    },
    {
      name: 'CalendarEventTimes',
      definition: `export interface CalendarEventTimes {
  start: string
  end: string
  startTime: string
  endTime: string
}`,
    },
    {
      name: 'CalendarView',
      definition: `export type CalendarView = 'day' | '4days' | 'week' | 'month' | 'year' | 'custom'`,
    },
  ],
  cssVars: [
    { name: '--vectis-control-size-calendar-hour', value: '4rem' },
    { name: '--vectis-control-size-calendar-gutter', value: '4.5rem' },
    { name: '--vectis-control-size-calendar-tick', value: '0.375rem' },
    { name: '--vectis-control-size-calendar-edge', value: '3rem' },
    { name: '--vectis-control-size-calendar-day-min', value: '5rem' },
    { name: '--vectis-control-size-calendar-handle', value: '0.5rem' },
    { name: '--vectis-control-size-calendar-allday-lane', value: '1.5rem' },
    { name: '--vectis-control-size-calendar-allday-max', value: '7rem' },
    { name: '--vectis-control-size-calendar-now-dot', value: '0.625rem' },
    { name: '--vectis-control-size-calendar-month-cell', value: '8.5rem' },
    { name: '--vectis-control-size-calendar-year-cell', value: '1.5rem' },
  ],
} satisfies PageApi
