<script setup lang="ts" generic="E extends CalendarEvent">
// @a11y @keyboard @core
/**
 * The month view: the weeks stacked one under another, each day a square holding as many of
 * its events as will fit.
 *
 * It is internal to VCalendar and has no story of its own — its documentation lives with
 * the component that renders it. Like the time grid it computes nothing about dates: it is
 * handed the weeks already cut and filtered, and turns them into boxes.
 *
 * A day here is not a column of hours but a SUMMARY, so the events are drawn as chips in
 * the order the day would be read out — the all-day ones first, then the rest by when they
 * start — and a day with more than it can show says how many are left rather than silently
 * dropping them.
 *
 * The drag and the keyboard grab are `gesture.ts`'s. What stays here is what a square means:
 * the point under the pointer turned into a day, and a vertical step read as a whole week.
 */
import { computed, ref, useId } from 'vue'

import { formatDateDisplay } from '../../utils/date'
import { clamp } from '../../utils/number'
import { formatTimeDisplay } from '../../utils/time'

import { useMessages } from '../../i18n/state'

import VCalendarEvent from './VCalendarEvent.vue'
import { gridGeometryOf, useCalendarGesture, type GestureBase, type GrabStep } from './gesture'
import { calendarIntent } from './keyboard'
import {
  eventsByDay,
  isAllDayEvent,
  moveEventToDay,
  pointToMonthCell,
  sameTimes,
  timesOf,
  type MonthCell,
} from './layout'
import type {
  ActivatedCell,
  CalendarEvent,
  CalendarEventId,
  CalendarEventSlotProps,
  CalendarEventTimes,
  CalendarFormat,
} from './types'

export interface CalendarMonthProps<T> {
  /** The weeks, already padded to a fixed height and filtered to the visible weekdays. */
  weeks: MonthCell[][]
  events: T[]
  locale: string
  format: CalendarFormat
  today: string | null
  /** How many events a day shows before it starts counting the rest. */
  monthEventLimit: number
  /** Whether events can be moved from one day to another. */
  editable: boolean
  /** Whether the whole calendar is frozen, which also takes its cards out of the tab order. */
  disabled: boolean
  /** The node telling a reader how a chip can be moved, shared by every one of them. */
  hintId: string
  /** How long a drag rests against an edge before the month turns. Zero turns paging off. */
  edgeStepDelay: number
  label: string
}

const props = defineProps<CalendarMonthProps<E>>()

const emit = defineEmits<{
  /** A day was asked to be opened on its own. */
  'day-activate': [iso: string]
  /** An empty part of a day was activated. A month has no hours, so the time is left to the calendar. */
  'cell-activate': [cell: ActivatedCell]
  'event-activate': [event: E]
  /** An event was dropped on another day. A month has no hours, so it is only ever a move. */
  'event-drop': [id: CalendarEventId, times: CalendarEventTimes, kind: 'move']
  /** Something happened that a reader who cannot see the grid needs told. */
  announce: [message: string]
  step: [delta: -1 | 1]
}>()

/** Which day holds the tab stop. Only the date matters here; the hour is the grid's affair. */
const focused = defineModel<string>('focused', { required: true })

defineSlots<{
  event?(props: CalendarEventSlotProps<E>): unknown
}>()

const m = useMessages()
const uid = useId()

const cellId = (iso: string) => `${uid}-m-${iso}`

/** The flattened list of days: what the arrows travel along, and what the events are filed by. */
const flat = computed(() => props.weeks.flat().map((cell) => cell.iso))
const columnCount = computed(() => props.weeks[0]?.length ?? 1)

/** The column headings, taken from the first week so they always match the columns drawn. */
const weekdayNames = computed(() =>
  (props.weeks[0] ?? []).map((cell) =>
    formatDateDisplay(cell.iso, props.locale, { weekday: 'short' }),
  ),
)

/*
 * The two labels every square carries, worked out once per cell rather than once per USE.
 *
 * `longDay` is asked for twice in the template — the square's own `aria-label`, then the
 * name of the button that opens the day — so the 42 cells cost 126 `Intl` formats a render,
 * and a drag re-renders the whole grid each time it carries a chip onto another day. The map
 * depends on the weeks and the locale alone, so it survives every frame of a drag.
 */
const dayLabels = computed(() => {
  const map = new Map<string, { number: string; long: string }>()
  for (const iso of flat.value) {
    map.set(iso, {
      number: formatDateDisplay(iso, props.locale, { day: 'numeric' }),
      long: formatDateDisplay(iso, props.locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    })
  }
  return map
})

const dayNumber = (iso: string) => dayLabels.value.get(iso)?.number ?? ''

/*
 * A day outside the grid can reach this — the announcement after a move names the day the
 * event landed on, which may be the next month — so it falls back to formatting rather than
 * assuming the map holds it.
 */
const longDay = (iso: string) =>
  dayLabels.value.get(iso)?.long ??
  formatDateDisplay(iso, props.locale, { weekday: 'long', day: 'numeric', month: 'long' })

/**
 * A chip being carried from one day to another, by pointer or by keyboard.
 *
 * A month has no hours, so there is one kind and no resize: only which day an event starts
 * on moves, and its length in days and its times come along untouched.
 */
interface Gesture extends GestureBase {
  /** Which square the pointer took hold in, so a long bar does not jump under it. */
  grabIndex: number
}

const gridEl = ref<HTMLElement | null>(null)
/** The view's own box, which a drag is measured against to know whether it has left it. */
const rootEl = ref<HTMLElement | null>(null)

const {
  gesture,
  withPreview,
  edgeCue,
  isRtl,
  start,
  endLastGesture,
  consumeDrag,
  onPointermove,
  onPointerup,
  onPointercancel,
  onCardKeydown,
  focusCell,
  idOfCard,
  cardState,
} = useCalendarGesture<E, Gesture>({
  events: () => props.events,
  eventOf: (id): E | undefined => eventsById.value.get(id),
  // Measured against the ROOT and not against `gridEl`, whose rect leaves out the row of
  // weekday names above it.
  rootEl,
  // Captured on the GRID rather than on the chip, because a chip is redrawn on another day the
  // moment the drag starts and a captured element that moves takes the pointer with it.
  captureEl: gridEl,
  measureEl: gridEl,
  columns: () => columnCount.value,
  editable: () => props.editable,
  hintId: () => props.hintId,
  // The step is irrelevant to a month, which has no hours: 1 keeps the table honest without
  // asking the calendar for a number this view never uses.
  slotMinutes: () => 1,
  edgeStepDelay: () => props.edgeStepDelay,
  layout: () => props.weeks,
  applyPoint,
  onDrop: (state) => emit('event-drop', state.id, state.preview, 'move'),
  grab: (item) =>
    props.editable
      ? {
          id: item.id,
          origin: timesOf(item),
          pointerId: null,
          originX: 0,
          originY: 0,
          // There is no pointer to remember; the arrows work off the preview, not a position.
          grabIndex: 0,
        }
      : null,
  onGrabStep,
  step: (delta) => emit('step', delta),
  announce: (message) => emit('announce', message),
})

/**
 * The events as the month should currently DRAW them — the model, with the one being carried
 * put wherever it now is. Running the preview through the same grouping as everything else is
 * what makes the day it leaves and the day it arrives at both redraw with no special case.
 *
 * Nothing has to be held out of a layout for the echo, unlike the time grid: a month cell
 * simply stacks its chips, so the echo takes its own line in the day it came from and disturbs
 * nothing.
 */
const drawnEvents = computed<E[]>(() => (gesture.value ? withPreview(props.events) : props.events))

/** Every day's events, worked out once rather than once per chip. */
const byDay = computed(() => eventsByDay(drawnEvents.value, flat.value))

const eventsById = computed(
  () => new Map<CalendarEventId, E>(drawnEvents.value.map((item) => [item.id, item])),
)

/**
 * A chip says when it happens only when that is not obvious: an all-day event has no time
 * to give, and the day it sits in already says which day it is.
 *
 * Memoized by start time inside the computed, so a change of locale or hour format throws the
 * cache away whole — the twin in VCalendarTimeGrid.vue carries the trap that makes reading
 * the computed, and not a cache beside it, the only correct shape.
 */
const timeTextOf = computed(() => {
  const { locale, format } = props
  const cache = new Map<string, string>()
  return (event: E): string => {
    if (isAllDayEvent(event)) return ''
    let text = cache.get(event.startTime)
    if (text === undefined) {
      text = formatTimeDisplay(event.startTime, locale, format)
      cache.set(event.startTime, text)
    }
    return text
  }
})

/** One chip as the template draws it, its time already written out. */
interface Chip {
  event: E
  timeText: string
}

/**
 * What each square draws, and how many it had to leave out — one Map, built in a single pass.
 *
 * It is the `dayLabels` treatment. Written as template functions these returned a NEW array
 * per square per render, and since one of them is the source of a `v-for`, Vue rediffed all
 * 42 lists each time; each chip also formatted its own time. The map is rebuilt with `byDay`,
 * which a drag changes only when it carries its chip onto another day (`applyPoint` writes
 * nothing otherwise), and survives every other render.
 */
const dayEvents = computed(() => {
  const map = new Map<string, { shown: Chip[]; hidden: number }>()
  const textOf = timeTextOf.value
  const limit = props.monthEventLimit
  for (const [iso, all] of byDay.value) {
    const shown = all.length > limit ? all.slice(0, limit) : all
    map.set(iso, {
      shown: shown.map((event) => ({ event, timeText: textOf(event) })),
      hidden: Math.max(0, all.length - limit),
    })
  }
  return map
})

/** A square with nothing on it, shared rather than allocated per empty cell. */
const NO_EVENTS: { shown: Chip[]; hidden: number } = Object.freeze({ shown: [], hidden: 0 })
const dayEventsOf = (iso: string) => dayEvents.value.get(iso) ?? NO_EVENTS

function moveFocusTo(iso: string) {
  focused.value = iso
  // @a11y — the model decides which cell is tabbable, so the focus can only follow once the
  // render that applied it has run.
  focusCell(cellId(iso), true)
}

const tabbable = computed(() =>
  flat.value.includes(focused.value) ? focused.value : (flat.value[0] ?? null),
)

/**
 * The same table serves both views, so its two axes are read differently here: a sideways step
 * is one day, and a vertical one is a whole week rather than an hour. That is the only place the
 * month reinterprets it, and it is why the table returns a direction rather than a date.
 */
const dayStep = (days: number, minutes: number) =>
  days !== 0 ? days : Math.sign(minutes) * columnCount.value

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null

  // A chip answers its own table, delegated here on the same element as the pointer so the
  // two input paths cannot drift apart.
  const card = target?.closest<HTMLElement>('.v-calendar-event')
  if (card) {
    onCardKeydown(event, card)
    return
  }

  const cell = target?.closest<HTMLElement>('.v-calendar-month-cell')
  if (!cell) return

  const intent = calendarIntent(event.key, event.shiftKey, 'cell', 1, isRtl())
  if (!intent) return

  const iso = cell.dataset.iso!
  const index = flat.value.indexOf(iso)
  const columns = columnCount.value

  if (intent.kind === 'moveFocus') {
    const next =
      flat.value[clamp(index + dayStep(intent.days, intent.minutes), 0, flat.value.length - 1)]
    if (!next) return
    event.preventDefault()
    moveFocusTo(next)
    return
  }

  if (intent.kind === 'rowEdge') {
    const row = Math.floor(index / columns)
    const edge = intent.edge === 'start' ? row * columns : row * columns + columns - 1
    const next = flat.value[clamp(edge, 0, flat.value.length - 1)]
    if (!next) return
    event.preventDefault()
    moveFocusTo(next)
    return
  }

  if (intent.kind === 'period') {
    event.preventDefault()
    emit('step', intent.delta)
    return
  }

  if (intent.kind === 'activate') {
    event.preventDefault()
    emit('cell-activate', { date: iso, minutes: null })
  }
}

/** Which of the flattened squares a point falls on. */
function indexAt(x: number, y: number, rect: DOMRect, rtl: boolean): number {
  const cell = pointToMonthCell(
    { x, y },
    { ...gridGeometryOf(rect, columnCount.value, rtl), rows: props.weeks.length || 1 },
    rtl,
  )
  return cell.rowIndex * columnCount.value + cell.columnIndex
}

function onGridPointerdown(event: PointerEvent) {
  endLastGesture()
  if (gesture.value || !props.editable || event.button !== 0) return

  const card = (event.target as HTMLElement | null)?.closest<HTMLElement>('.v-calendar-event')
  const item = card ? eventsById.value.get(idOfCard(card)) : undefined
  const rect = gridEl.value?.getBoundingClientRect()
  if (!item || !rect) return
  const rtl = isRtl()

  start(
    {
      id: item.id,
      origin: timesOf(item),
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      grabIndex: indexAt(event.clientX, event.clientY, rect, rtl),
    },
    event,
    rtl,
  )
}

/**
 * Works out which day the chip now belongs to, from wherever the pointer last was.
 *
 * Separate from the handler because the month turning calls it too: the squares change under
 * a hand that has not moved, and the chip has to be placed against the new ones.
 */
function applyPoint(state: Gesture, rect: DOMRect) {
  const index = indexAt(state.lastX, state.lastY, rect, state.rtl)
  const last = lastApplied
  if (last?.state === state && last.weeks === props.weeks && last.index === index) return
  lastApplied = { state, weeks: props.weeks, index }

  /*
   * The target is the event's START shifted by however many squares the pointer has crossed,
   * not the square it is over — so a bar grabbed by its third day keeps its third day under
   * the finger. The days come out of the flattened grid, which is already filtered to the
   * weekdays on show, so a hidden weekend is not counted.
   */
  const days = flat.value
  const from = days.indexOf(state.origin.start)
  const target =
    days[
      clamp((from === -1 ? state.grabIndex : from) + index - state.grabIndex, 0, days.length - 1)
    ]
  if (!target) return
  /*
   * TRAP — written only when the day changes. The gesture is a deep ref, so an equal but new
   * preview would still re-bucket and re-sort every event and re-render all 42 squares.
   */
  const next = moveEventToDay(state.origin, target)
  if (!sameTimes(state.preview, next)) state.preview = next
}

/**
 * The square `applyPoint` last placed the chip from, so the many `pointermove`s that fire
 * inside one square return before any date arithmetic. The weeks belong to what the index
 * MEANS: the month turning under a still pointer reads as a new square at the same index.
 * A plain variable, since nothing renders it; the gesture's identity says a new press began.
 */
let lastApplied: { state: Gesture; weeks: MonthCell[][]; index: number } | null = null

/** One arrow press on a chip held by the keyboard: a day sideways, a week vertically. */
function onGrabStep(state: Gesture, step: GrabStep, item: E): boolean {
  // A month has no hours to stretch, so Shift with an arrow is simply not a gesture here.
  if (step.kind !== 'grabMove') return false
  const days = flat.value
  const from = days.indexOf(state.preview.start)
  const target = days[clamp(from + dayStep(step.days, step.minutes), 0, days.length - 1)]
  if (!target) return false
  state.preview = moveEventToDay(state.preview, target)
  emit('announce', m.value.calendar.movedTo(item.title, longDay(state.preview.start)))
  return true
}

function onCardClick(item: E) {
  // `pointerup` fires before `click`, so letting go at the end of a drag would ALSO open the
  // event — the consumer's editor over every chip the reader had just moved.
  if (consumeDrag()) return
  emit('event-activate', item)
}

/**
 * A click on the empty part of a day: the pointer's side of the Enter that activates a cell,
 * so a square drawn with a pointer cursor answers a click as it answers the key.
 *
 * The chips and the two buttons a square holds answer their own clicks, so a click that came
 * from one of them is theirs alone. And a click ending a drag is swallowed like the one a chip
 * would have received: the drop has already said what the gesture meant.
 */
function onGridClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('.v-calendar-event, button')) return
  const cell = target?.closest<HTMLElement>('.v-calendar-month-cell')
  if (!cell || consumeDrag()) return
  emit('cell-activate', { date: cell.dataset.iso!, minutes: null })
}

// The same two members VCalendarTimeGrid exposes, so VCalendar drives either view without
// asking which is on screen. A month has no hours, hence the empty `scrollToMinutes`.
defineExpose({
  /** Brings the focus onto the day the grid is currently pointing at. */
  focus: () => {
    if (tabbable.value) focusCell(cellId(tabbable.value))
  },
  /** Nothing to scroll to in a month view. */
  scrollToMinutes: () => {},
})
</script>

<template>
  <div
    ref="rootEl"
    class="v-calendar-month"
    :data-outside="gesture?.outside ? '' : undefined"
    :style="{ '--calendar-columns': String(weekdayNames.length) }"
  >
    <div class="v-calendar-month-head" aria-hidden="true">
      <span
        v-for="name in weekdayNames"
        :key="name"
        class="v-calendar-weekday v-calendar-month-weekday"
      >
        {{ name }}
      </span>
    </div>

    <div
      ref="gridEl"
      class="v-calendar-month-grid v-calendar-edge-cue"
      role="grid"
      :aria-label="label"
      :data-edge="edgeCue"
      @keydown="onKeydown"
      @pointerdown="onGridPointerdown"
      @pointermove="onPointermove"
      @pointerup="onPointerup"
      @pointercancel="onPointercancel"
      @click="onGridClick"
    >
      <div
        v-for="(week, row) in weeks"
        :key="week[0]?.iso ?? row"
        role="row"
        class="v-calendar-month-week"
      >
        <div
          v-for="cell in week"
          :id="cellId(cell.iso)"
          :key="cell.iso"
          role="gridcell"
          class="v-calendar-cell v-calendar-month-cell"
          :data-iso="cell.iso"
          :data-adjacent="cell.adjacent ?? undefined"
          :tabindex="tabbable === cell.iso ? 0 : -1"
          :aria-label="longDay(cell.iso)"
        >
          <button
            type="button"
            class="v-calendar-button v-calendar-month-day"
            :class="{ 'v-calendar-today': cell.iso === today }"
            tabindex="-1"
            :aria-label="m.calendar.openDay(longDay(cell.iso))"
            @click="emit('day-activate', cell.iso)"
          >
            {{ dayNumber(cell.iso) }}
          </button>

          <VCalendarEvent
            v-for="chip in dayEventsOf(cell.iso).shown"
            :key="chip.event.id"
            class="v-calendar-month-chip"
            :event="chip.event"
            layout="chip"
            :disabled="disabled"
            :time-text="chip.timeText"
            v-bind="cardState(chip.event.id)"
            @click="onCardClick(chip.event)"
          >
            <template v-if="$slots.event" #default="slotProps">
              <slot name="event" v-bind="slotProps" />
            </template>
          </VCalendarEvent>

          <button
            v-if="dayEventsOf(cell.iso).hidden > 0"
            type="button"
            class="v-calendar-button v-calendar-month-more"
            tabindex="-1"
            @click="emit('day-activate', cell.iso)"
          >
            {{ m.calendar.moreEvents(dayEventsOf(cell.iso).hidden) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-calendar-month {
    display: flex;
    flex-direction: column;
  }

  .v-calendar-month-head,
  .v-calendar-month-week {
    display: grid;
    grid-template-columns: repeat(var(--calendar-columns), minmax(0, 1fr));
  }

  /* 4, the time grid's header layer: a dragged chip (3) and the edge strip (2) pass under the
     sticky names as the month scrolls, rather than over them. */
  .v-calendar-month-head {
    position: sticky;
    inset-block-start: 0;
    z-index: 4;
    background: var(--vectis-color-surface);
    border-block-end: 1px solid var(--vectis-color-border);
  }

  .v-calendar-month-weekday {
    padding-block: var(--vectis-space-2);
    text-align: center;
  }

  .v-calendar-month-grid {
    /* The edge strip is placed against this box. */
    position: relative;
    display: flex;
    /* The rows share what height there is, so a month fills the box it was given instead of
       leaving a band of nothing under the last week. The floor keeps a day readable when
       that box is short. */
    flex: 1;
    flex-direction: column;
    min-block-size: 0;
  }

  .v-calendar-month-week {
    flex: 1;
    min-block-size: var(--vectis-control-size-calendar-month-cell);
  }

  .v-calendar-month-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
    padding: var(--vectis-space-1);
  }

  /* The days of the neighbouring months are kept — the grid is a fixed six rows, so the
     page never jumps — but pushed back, since they are context rather than content. */
  .v-calendar-month-cell[data-adjacent] {
    background: var(--vectis-color-surface-sunken);
    color: var(--vectis-color-text-subtle);
  }

  .v-calendar-month-day {
    align-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    inline-size: var(--vectis-control-height-sm);
    block-size: var(--vectis-control-height-sm);
    border-radius: var(--vectis-radius-pill);
    color: inherit;
    font-size: var(--vectis-text-body-md-size);
  }

  /* Disjoint from today rather than less specific: the two live in different sheets, where a
     tie would be settled by whichever one the consumer's bundler emitted last. */
  .v-calendar-month-day:hover:not(.v-calendar-today) {
    background: var(--vectis-color-surface-muted);
  }

  /*
   * A day in the month view is a summary, so a chip is capped at one lane however long the
   * event really is — an all-day bar and a two-hour meeting look the same here, and several
   * have to fit under the date.
   *
   * The height is SET AS A PROPERTY rather than as `block-size`. The chip rule in
   * VCalendarEvent's own sheet is (0,2,0) against this (0,1,0), so declaring the size
   * directly would lose — and matching its specificity would only hand the decision to
   * whichever sheet the consumer's bundler emitted last, which is the failure the library's
   * one-sheet-per-component rule exists to prevent.
   */
  .v-calendar-month-chip {
    --calendar-chip-height: var(--vectis-control-size-calendar-allday-lane);

    flex: none;
  }

  .v-calendar-month-more {
    flex: none;
    padding-inline: var(--vectis-space-1);
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-caption-size);
    text-align: start;
  }

  .v-calendar-month-more:hover {
    color: var(--vectis-color-text);
    text-decoration: underline;
  }
}
</style>
