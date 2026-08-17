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
 */
import { computed, nextTick, ref, useId, watch } from 'vue'

import { formatDisplay as formatDate } from '../../utils/date'
import { clamp } from '../../utils/number'
import { formatDisplay as formatTimeDisplay, type HourFormat } from '../../utils/time'

import { useMessages } from '../../i18n/state'

import VCalendarEvent from './VCalendarEvent.vue'
import { calendarIntent } from './keyboard'
import { EDGE_BAND, useEdgeStep } from './edgeStep'
import {
  DRAG_THRESHOLD,
  eventsOnDay,
  inlineEdgeAt,
  isAllDayEvent,
  moveEventToDay,
  pointToMonthCell,
  pointWithin,
  timesOf,
  type MonthCell,
} from './layout'
import type { CalendarEvent, CalendarEventId, CalendarEventTimes } from './types'

export interface CalendarMonthProps<T> {
  /** The weeks, already padded to a fixed height and filtered to the visible weekdays. */
  weeks: MonthCell[][]
  events: T[]
  locale: string
  hourFormat: HourFormat
  today: string | null
  /** How many events a day shows before it starts counting the rest. */
  eventLimit: number
  /** Whether events can be moved from one day to another. */
  editable: boolean
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
  /** An empty part of a day was activated. */
  'cell-activate': [iso: string]
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
  event?(props: {
    event: E
    layout: 'block' | 'chip'
    timeText: string
    continuesBefore: boolean
    continuesAfter: boolean
  }): unknown
}>()

const m = useMessages()
const uid = useId()

const cellId = (iso: string) => `${uid}-m-${iso}`

/** The column headings, taken from the first week so they always match the columns drawn. */
const weekdayNames = computed(() =>
  (props.weeks[0] ?? []).map((cell) => formatDate(cell.iso, props.locale, { weekday: 'short' })),
)

const dayNumber = (iso: string) => formatDate(iso, props.locale, { day: 'numeric' })

const longDay = (iso: string) =>
  formatDate(iso, props.locale, { weekday: 'long', day: 'numeric', month: 'long' })

/* ------------------------------------------------------------------- the gesture */

/**
 * A chip being carried from one day to another, by pointer or by keyboard.
 *
 * A month has no hours, so there is one kind and no resize: only which day an event starts
 * on moves, and its length in days and its times come along untouched.
 */
interface Gesture {
  id: CalendarEventId
  /** Where the event was when the gesture began — every frame is computed from THIS. */
  origin: CalendarEventTimes
  /** What the chip shows right now. The model is not touched until the gesture ends. */
  preview: CalendarEventTimes
  pointerId: number | null
  originX: number
  originY: number
  /** Which square the pointer took hold in, so a long bar does not jump under it. */
  grabIndex: number
  /**
   * Where the pointer last was — needed because turning the month moves the squares under a
   * hand that is holding still, and the chip has to be worked out again against the new ones.
   */
  lastX: number
  lastY: number
  moved: boolean
  /**
   * Whether the pointer is off the month altogether — over the toolbar, or over the page beside
   * it. Letting go here abandons the gesture and writes nothing.
   *
   * A KEYBOARD grab can never set it: `onPointermove` is the only writer, and it returns on the
   * id mismatch before reaching that line — a grab's `pointerId` is null.
   */
  outside: boolean
}

const gesture = ref<Gesture | null>(null)
const grabbing = computed(() => gesture.value !== null && gesture.value.pointerId === null)
const gridEl = ref<HTMLElement | null>(null)
/** The view's own box, which a drag is measured against to know whether it has left it. */
const rootEl = ref<HTMLElement | null>(null)

/**
 * The id the faded echo of a dragged chip carries.
 *
 * It must DIFFER from the event's own, or the two would collide in the map the day grouping
 * keys by id. The original is recovered from it and handed to the card as `ghostOf`, because
 * the colour of an event is derived from its id — under a fresh one the echo would come out
 * a different colour from the chip it belongs to.
 */
const GHOST_PREFIX = '__vectis-calendar-ghost__'
const ghostIdOf = (id: CalendarEventId) => `${GHOST_PREFIX}${id}`
const originalIdOf = (id: CalendarEventId) => String(id).slice(GHOST_PREFIX.length)
const isGhostId = (id: CalendarEventId) => String(id).startsWith(GHOST_PREFIX)

/**
 * The events as the month should currently DRAW them — the model, with the one being carried
 * put wherever it now is. Running the preview through the same grouping as everything else is
 * what makes the day it leaves and the day it arrives at both redraw with no special case.
 */
const drawnEvents = computed<E[]>(() => {
  const state = gesture.value
  if (!state) return props.events

  const moving = props.events.map((item) =>
    item.id === state.id ? ({ ...item, ...state.preview } as E) : item,
  )

  /*
   * The faded echo of where the chip started, so the reader can see what they are moving it
   * FROM. Added only once the drag has travelled, or a click would flash a second chip in
   * the same day.
   *
   * Nothing has to be held out of a layout here, unlike the time grid: a month cell simply
   * stacks its chips, so the echo takes its own line in the day it came from and disturbs
   * nothing.
   */
  const original = state.moved ? props.events.find((item) => item.id === state.id) : undefined
  if (!original) return moving

  return [...moving, { ...original, ...state.origin, id: ghostIdOf(state.id) } as E]
})

/** Every day's events, worked out once rather than once per chip. */
const byDay = computed(() => {
  const map = new Map<string, E[]>()
  for (const week of props.weeks) {
    for (const cell of week) map.set(cell.iso, eventsOnDay(drawnEvents.value, cell.iso))
  }
  return map
})

const eventsById = computed(() => new Map(drawnEvents.value.map((item) => [item.id, item])))

const shownOf = (iso: string) => (byDay.value.get(iso) ?? []).slice(0, props.eventLimit)
const hiddenOf = (iso: string) =>
  Math.max(0, (byDay.value.get(iso) ?? []).length - props.eventLimit)

/**
 * A chip says when it happens only when that is not obvious: an all-day event has no time
 * to give, and the day it sits in already says which day it is.
 */
function timeTextOf(event: E): string {
  if (isAllDayEvent(event)) return ''
  return formatTimeDisplay(event.startTime, props.locale, props.hourFormat)
}

/** The flattened list of days, which is what the arrows travel along. */
const flat = computed(() => props.weeks.flat().map((cell) => cell.iso))

function moveFocusTo(iso: string) {
  focused.value = iso
  // @a11y — the model decides which cell is tabbable, so the focus can only follow once the
  // render that applied it has run.
  void nextTick(() => document.getElementById(cellId(iso))?.focus())
}

const tabbable = computed(() =>
  flat.value.includes(focused.value) ? focused.value : (flat.value[0] ?? null),
)

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

  // The step is irrelevant to a month, which has no hours: 1 keeps the table honest without
  // asking the calendar for a number this view never uses.
  const intent = calendarIntent(event.key, event.shiftKey, 'cell', 1, isRtl())
  if (!intent) return

  const iso = cell.dataset.iso!
  const index = flat.value.indexOf(iso)
  const columns = props.weeks[0]?.length ?? 1

  if (intent.kind === 'moveFocus') {
    /*
     * The same table serves both views, so its two axes are read differently here: a
     * sideways step is one day, and a vertical one is a whole week rather than an hour.
     * That is the only place the month reinterprets it, and it is why the table returns a
     * direction rather than a date.
     */
    const delta = intent.days !== 0 ? intent.days : Math.sign(intent.minutes) * columns
    const next = flat.value[clamp(index + delta, 0, flat.value.length - 1)]
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
    emit('cell-activate', iso)
  }
}

/* ------------------------------------------------------- the gesture, by pointer */

function isRtl(): boolean {
  const el = gridEl.value
  return el !== null && getComputedStyle(el).direction === 'rtl'
}

/** The grid as the pure geometry wants it: plain numbers, no element. */
function geometryOf(rect: DOMRect) {
  const rtl = isRtl()
  return {
    top: rect.top,
    height: rect.height,
    inlineStart: rtl ? rect.right : rect.left,
    inlineSize: rect.width,
    columns: props.weeks[0]?.length ?? 1,
    rows: props.weeks.length || 1,
  }
}

/** Which of the flattened squares a point falls on. */
function indexAt(x: number, y: number): number | null {
  const rect = gridEl.value?.getBoundingClientRect()
  if (!rect) return null
  const cell = pointToMonthCell({ x, y }, geometryOf(rect), isRtl())
  const columns = props.weeks[0]?.length ?? 1
  return cell.rowIndex * columns + cell.columnIndex
}

const edge = useEdgeStep(
  (direction) => emit('step', direction),
  () => props.edgeStepDelay,
)

/** Which edge is counting down, in words, for the stylesheet to light up. */
const edgeCue = computed(() =>
  edge.pending.value === -1 ? 'start' : edge.pending.value === 1 ? 'end' : undefined,
)

/*
 * Turning the month swaps every square out from under a live drag, and the chip's day is then
 * a different one — it would vanish until the next pointer move, which never comes if the hand
 * is holding still against the edge. Re-applying the last position once the new month is
 * rendered is what carries the chip across the boundary.
 */
watch(
  () => props.weeks,
  () => {
    const state = gesture.value
    if (state?.moved) applyPoint(state)
  },
  { flush: 'post' },
)

function onGridPointerdown(event: PointerEvent) {
  endLastGesture()
  if (gesture.value || !props.editable || event.button !== 0) return

  const card = (event.target as HTMLElement | null)?.closest<HTMLElement>('.v-calendar-event')
  if (!card) return
  const item = eventsById.value.get(cardIdOf(card))
  const index = indexAt(event.clientX, event.clientY)
  if (!item || index === null) return

  gesture.value = {
    id: item.id,
    origin: timesOf(item),
    preview: timesOf(item),
    pointerId: event.pointerId,
    originX: event.clientX,
    originY: event.clientY,
    grabIndex: index,
    lastX: event.clientX,
    lastY: event.clientY,
    moved: false,
    outside: false,
  }

  /*
   * @fallback — captured on the GRID rather than on the chip, because a chip is redrawn on
   * another day the moment the drag starts and a captured element that moves takes the
   * pointer with it. Wrapped because a pointer event fired by a TEST refers to no real
   * pointer and the call then throws; failing to capture only means the drag stops at the
   * edge, which no test is checking.
   */
  try {
    gridEl.value?.setPointerCapture(event.pointerId)
  } catch {
    /* a synthetic pointer: nothing to capture */
  }
}

/** The event a chip stands for, read back off the attribute the card publishes. */
function cardIdOf(card: HTMLElement): CalendarEventId {
  const raw = card.dataset.eventId ?? ''
  // An id may be a number and an attribute is always text; the map is keyed by the original.
  return eventsById.value.has(raw) ? raw : Number(raw)
}

function onPointermove(event: PointerEvent) {
  const state = gesture.value
  if (!state || state.pointerId !== event.pointerId) return

  state.lastX = event.clientX
  state.lastY = event.clientY

  if (
    !state.moved &&
    Math.abs(event.clientX - state.originX) < DRAG_THRESHOLD &&
    Math.abs(event.clientY - state.originY) < DRAG_THRESHOLD
  ) {
    return
  }

  state.moved = true
  state.outside = isPointerOutside(state)
  applyPoint(state)

  const rect = gridEl.value?.getBoundingClientRect()
  if (rect) edge.watchEdge(inlineEdgeAt(state.lastX, geometryOf(rect), EDGE_BAND, isRtl()))
}

/**
 * Whether the pointer has left the month's own box.
 *
 * Measured against the ROOT and not against `gridEl`, whose rect leaves out the row of weekday
 * names above it — the month's own version of the all-day band the time grid has to include, and
 * the same mistake to make. The rect goes in raw, never through `geometryOf`: containment has no
 * reading direction, where `inlineStart` is the right edge in a right-to-left page.
 *
 * Neither `applyPoint` nor the edge watch is gated on the result — see the twin of this function
 * in VCalendarTimeGrid.vue, which carries the reasoning for both.
 */
function isPointerOutside(state: Gesture): boolean {
  const rect = rootEl.value?.getBoundingClientRect()
  return rect ? !pointWithin({ x: state.lastX, y: state.lastY }, rect) : false
}

/**
 * Works out which day the chip now belongs to, from wherever the pointer last was.
 *
 * Separate from the handler because the month turning calls it too: the squares change under
 * a hand that has not moved, and the chip has to be placed against the new ones.
 */
function applyPoint(state: Gesture) {
  const index = indexAt(state.lastX, state.lastY)
  if (index === null) return

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
  if (target) state.preview = moveEventToDay(state.origin, target)
}

let justDragged = false

/**
 * Closes the books on whatever gesture came before, at the start of a new press — without which
 * the flag can be left standing and swallow a deliberate click on some chip, long after the drag
 * that raised it. The month cannot reach that on its own, having no gesture that runs without
 * `editable`; it is kept in step with the time grid, whose twin of this function carries the
 * reasoning, so the two cannot answer a press differently.
 */
function endLastGesture() {
  justDragged = false
}

function onPointerup(event: PointerEvent) {
  const state = gesture.value
  if (!state || state.pointerId !== event.pointerId) return
  gesture.value = null
  justDragged = state.moved
  edge.cancel()

  // Let go off the month altogether: nothing is written and the chip goes back where it was.
  // `justDragged` above still matters, and the two revert paths must stay apart — the twin of
  // this branch in VCalendarTimeGrid.vue carries the reasoning for both.
  if (state.outside) return

  if (!state.moved) return
  emit('event-drop', state.id, state.preview, 'move')
}

function onPointercancel() {
  // The gesture was taken away. Nothing is written: the chip goes back to where the model
  // still says it is.
  gesture.value = null
  edge.cancel()
}

function onCardClick(item: E) {
  // `pointerup` fires before `click`, so letting go at the end of a drag would ALSO open the
  // event — the consumer's editor over every chip the reader had just moved.
  if (justDragged) {
    justDragged = false
    return
  }
  emit('event-activate', item)
}

/* ------------------------------------------------------ the gesture, by keyboard */

function announceMoved(title: string, times: CalendarEventTimes) {
  emit('announce', m.value.calendar.movedTo(title, longDay(times.start)))
}

function refocusCard(id: CalendarEventId) {
  void nextTick(() => {
    /*
     * Walked rather than selected, for the reason spelled out at the twin of this function in
     * VCalendarTimeGrid.vue: a consumer's id may need escaping, and `CSS.escape` is unavailable
     * in jsdom — where the throw lands inside a `nextTick`, so it surfaces as an unhandled
     * rejection rather than as a failing test.
     */
    const cards = gridEl.value?.querySelectorAll<HTMLElement>('.v-calendar-event')
    Array.from(cards ?? [])
      .find((card) => card.dataset.eventId === String(id))
      ?.focus()
  })
}

/**
 * A chip answers a different table from the grid it sits in — that is what a grab mode IS.
 * Without it the month would offer a gesture the pointer alone could reach, which is the
 * WCAG 2.1.1 failure the time grid already avoids.
 */
function onCardKeydown(event: KeyboardEvent, card: HTMLElement) {
  const item = eventsById.value.get(cardIdOf(card))
  if (!item) return

  const held = grabbing.value && gesture.value?.id === item.id
  const intent = calendarIntent(event.key, event.shiftKey, held ? 'grabbed' : 'event', 1, isRtl())
  if (!intent) return

  if (!held) {
    if (intent.kind !== 'activate' || !props.editable) return
    // Enter is also how a button is pressed: without this the same keystroke would take hold
    // of the event and open it at once.
    event.preventDefault()
    gesture.value = {
      id: item.id,
      origin: timesOf(item),
      preview: timesOf(item),
      pointerId: null,
      originX: 0,
      originY: 0,
      grabIndex: 0,
      // There is no pointer to remember; the arrows work off the preview, not off a position.
      lastX: 0,
      lastY: 0,
      moved: false,
      outside: false,
    }
    emit('announce', m.value.calendar.grabbed)
    return
  }

  const state = gesture.value!
  event.preventDefault()

  // A month has no hours to stretch, so Shift with an arrow is simply not a gesture here.
  if (intent.kind === 'grabMove') {
    const days = flat.value
    const columns = props.weeks[0]?.length ?? 1
    // The same reinterpretation the cell arrows make: sideways is a day, vertical is a week.
    const delta = intent.days !== 0 ? intent.days : Math.sign(intent.minutes) * columns
    const from = days.indexOf(state.preview.start)
    const target = days[clamp(from + delta, 0, days.length - 1)]
    if (!target) return
    state.preview = moveEventToDay(state.preview, target)
    state.moved = true
    announceMoved(item.title, state.preview)
    refocusCard(state.id)
    return
  }

  if (intent.kind === 'activate') {
    gesture.value = null
    if (state.moved) emit('event-drop', state.id, state.preview, 'move')
    emit('announce', m.value.calendar.dropped)
    refocusCard(state.id)
    return
  }

  if (intent.kind === 'cancel') {
    gesture.value = null
    emit('announce', m.value.calendar.reverted)
    refocusCard(state.id)
  }
}

function focus() {
  if (tabbable.value) document.getElementById(cellId(tabbable.value))?.focus()
}

defineExpose({ focus, scrollToMinutes: () => {} })
</script>

<template>
  <div
    ref="rootEl"
    class="v-calendar-month"
    :data-outside="gesture?.outside ? '' : undefined"
    :style="{ '--calendar-columns': String(weekdayNames.length) }"
  >
    <div class="v-calendar-month-head" aria-hidden="true">
      <span v-for="name in weekdayNames" :key="name" class="v-calendar-month-weekday">
        {{ name }}
      </span>
    </div>

    <div
      ref="gridEl"
      class="v-calendar-month-grid"
      role="grid"
      :aria-label="label"
      :data-gesture="gesture ? '' : undefined"
      :data-edge="edgeCue"
      @keydown="onKeydown"
      @pointerdown="onGridPointerdown"
      @pointermove="onPointermove"
      @pointerup="onPointerup"
      @pointercancel="onPointercancel"
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
          class="v-calendar-month-cell"
          :data-iso="cell.iso"
          :data-adjacent="cell.adjacent ?? undefined"
          :data-today="cell.iso === today ? '' : undefined"
          :tabindex="tabbable === cell.iso ? 0 : -1"
          :aria-label="longDay(cell.iso)"
        >
          <button
            type="button"
            class="v-calendar-month-day"
            tabindex="-1"
            :aria-label="m.calendar.openDay(longDay(cell.iso))"
            @click="emit('day-activate', cell.iso)"
          >
            {{ dayNumber(cell.iso) }}
          </button>

          <VCalendarEvent
            v-for="item in shownOf(cell.iso)"
            :key="item.id"
            class="v-calendar-month-chip"
            :event="item"
            layout="chip"
            :time-text="timeTextOf(item)"
            :dragging="gesture?.id === item.id && gesture.pointerId !== null"
            :rejected="gesture?.id === item.id && gesture.outside"
            :grabbed="grabbing && gesture?.id === item.id"
            :hint-id="editable && !isGhostId(item.id) ? hintId : undefined"
            :ghost-of="isGhostId(item.id) ? originalIdOf(item.id) : undefined"
            @click="onCardClick(item)"
          >
            <template v-if="$slots.event" #default="slotProps">
              <slot name="event" v-bind="slotProps" />
            </template>
          </VCalendarEvent>

          <button
            v-if="hiddenOf(cell.iso) > 0"
            type="button"
            class="v-calendar-month-more"
            tabindex="-1"
            @click="emit('day-activate', cell.iso)"
          >
            {{ m.calendar.moreEvents(hiddenOf(cell.iso)) }}
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
    overflow: auto;
    block-size: 100%;
    min-block-size: 0;
    font-family: var(--vectis-text-family);
    color: var(--vectis-color-text);
  }

  /* A drag currently held off the month. Best-effort only, and never the signal — the twin rule
     in VCalendarTimeGrid.vue carries the reasoning. */
  .v-calendar-month[data-outside] {
    cursor: not-allowed;
  }

  .v-calendar-month-head,
  .v-calendar-month-week {
    display: grid;
    grid-template-columns: repeat(var(--calendar-columns), minmax(0, 1fr));
  }

  .v-calendar-month-head {
    position: sticky;
    inset-block-start: 0;
    z-index: 1;
    background: var(--vectis-color-surface);
    border-block-end: 1px solid var(--vectis-color-border);
  }

  .v-calendar-month-weekday {
    padding-block: var(--vectis-space-2);
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-overline-size);
    font-weight: var(--vectis-text-overline-weight);
    letter-spacing: var(--vectis-text-overline-tracking);
    text-align: center;
    text-transform: uppercase;
  }

  /* The strip that lights up while a drag rests against an edge, counting down to turn the
     month. Its width is `--vectis-control-size-calendar-edge`, whose twin is `EDGE_BAND` in
     `edgeStep.ts` — the JavaScript deciding where that countdown actually starts. */
  .v-calendar-month-grid[data-edge]::after {
    content: '';
    position: absolute;
    inset-block: 0;
    inline-size: var(--vectis-control-size-calendar-edge);
    background: var(--vectis-color-accent-surface);
    z-index: 1;
    pointer-events: none;
  }

  .v-calendar-month-grid[data-edge='start']::after {
    inset-inline-start: 0;
  }

  .v-calendar-month-grid[data-edge='end']::after {
    inset-inline-end: 0;
  }

  .v-calendar-month-grid {
    /* The strip above is placed against this box. */
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
    border-block-start: 1px solid var(--vectis-color-border);
    border-inline-start: 1px solid var(--vectis-color-border);
    cursor: pointer;
  }

  .v-calendar-month-cell:first-child {
    border-inline-start: none;
  }

  .v-calendar-month-cell:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    /* Inwards: the month scrolls, and an outward ring on a cell at the edge would be cropped. */
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
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
    /* A button carries a border from the browser, which around a round day number reads as a
       stray ring. It goes together with the background, and neither is optional. */
    border: none;
    border-radius: var(--vectis-radius-pill);
    background: none;
    color: inherit;
    font-family: inherit;
    font-size: var(--vectis-text-body-md-size);
    cursor: pointer;
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-calendar-month-day:hover {
    background: var(--vectis-color-surface-muted);
  }

  .v-calendar-month-day:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* Semibold here marks a state — which day is today — and is not a type role. */
  .v-calendar-month-cell[data-today] .v-calendar-month-day {
    background: var(--vectis-color-accent);
    color: var(--vectis-color-text-on-accent);
    font-weight: var(--vectis-font-weight-semibold);
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
    border: none;
    background: none;
    color: var(--vectis-color-text-muted);
    font-family: inherit;
    font-size: var(--vectis-text-caption-size);
    text-align: start;
    cursor: pointer;
  }

  .v-calendar-month-more:hover {
    color: var(--vectis-color-text);
    text-decoration: underline;
  }

  .v-calendar-month-more:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-calendar-month-day {
      transition: none;
    }
  }
}
</style>
