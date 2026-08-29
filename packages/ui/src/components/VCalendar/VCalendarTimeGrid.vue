<script setup lang="ts" generic="E extends CalendarEvent">
// @a11y @keyboard @core
/**
 * The time grid: a column per day on show, an hour per row, and the events drawn over it.
 *
 * It is internal to VCalendar and has no story of its own — its documentation lives with
 * the component that renders it. It computes nothing about dates or overlaps: it is handed
 * the days and the already-placed segments, and its whole job is to turn them into boxes.
 *
 * WHY EVERY CELL EXISTS. Twenty-four rows times seven days is a hundred and sixty-eight
 * elements, where the rules between the hours could have been one repeating gradient. Two
 * things pay for them. A background is forced to `Canvas` under Windows forced-colors and
 * the ruling would vanish, where a border is forced to `CanvasText` and survives — the
 * argument VSeparator and the VIcon registry both make. And the ARIA "grid" pattern needs
 * real cells to move a focus between, which is what gives the keyboard somewhere to be and
 * what satisfies the rule that a scrolling region must hold something reachable by Tab.
 *
 * WHY THE CARDS SIT INSIDE THE CELLS. An event is placed absolutely against the whole
 * columns box, so putting the cards in one overlay layer would have been simpler CSS. They
 * are instead children of the cell their start falls in, because an absolutely positioned
 * element leaves its parent's box for LAYOUT while staying inside it in the document — and
 * therefore in the accessibility tree. In an overlay they would sit outside the grid
 * entirely, which breaks the reading order and fails `aria-required-children` the moment
 * anything tries to put them back.
 *
 * The day names are NOT marked up as column headers. They live above the scrolling area so
 * that they can stay in view, which puts them outside the grid; instead every cell names
 * its own day in full ("Wednesday 10 June, 09:00"), so nothing is lost to a reader who
 * never sees the row at all.
 */
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

import { formatDisplay as formatDate } from '../../utils/date'
import { isRtl as isElementRtl } from '../../utils/direction'
import { clamp } from '../../utils/number'
import { formatDisplay as formatTimeDisplay, type HourFormat } from '../../utils/time'

import { useMessages } from '../../i18n/state'

import VCalendarEvent from './VCalendarEvent.vue'
import {
  DRAG_THRESHOLD,
  blockEdgeAt,
  floorToSlot,
  fractionOf,
  inlineEdgeAt,
  isAllDayEvent,
  minutesAt,
  moveEvent,
  moveEventToDay,
  packAllDay,
  packDayColumn,
  pointToCell,
  pointWithin,
  resizeEvent,
  snapToSlot,
  timeOf,
  timedSegments,
  timesOf,
  type AllDaySpan,
  type PlacedSegment,
  type TimeWindow,
} from './layout'
import { calendarIntent } from './keyboard'
import { EDGE_BAND, useEdgeStep } from './edgeStep'
import type { CalendarEvent, CalendarEventId, CalendarEventTimes } from './types'

/** Where the keyboard focus is in the grid, as a day and a moment in it. */
export interface FocusedCell {
  iso: string
  minutes: number
}

export interface TimeGridProps<T> {
  days: string[]
  events: T[]
  window: TimeWindow
  slotDuration: number
  locale: string
  hourFormat: HourFormat
  /** Today's date, or nothing on the server, where it cannot be known. */
  today: string | null
  /**
   * The time it is now, in minutes since midnight — again nothing on the server. It is
   * passed in rather than read here so that one clock drives every view, and so that a
   * calendar showing no time grid still costs no timer.
   */
  now: number | null
  /** Whether events can be moved and stretched. */
  editable: boolean
  /** Whether an empty part of the grid makes an event when it is taken up. */
  creatable: boolean
  /** The node telling a reader how a card can be moved, shared by every card. */
  hintId: string
  /** How long a drag rests against an edge before the view pages. Zero turns paging off. */
  edgeStepDelay: number
  /** Whether dragging near the top or bottom scrolls the grid. */
  autoScroll: boolean
  /** What the grid as a whole is called — the range it is showing. */
  label: string
}

const props = defineProps<TimeGridProps<E>>()

const emit = defineEmits<{
  /** An empty part of the grid was activated, at this day and this moment. */
  'cell-activate': [iso: string, minutes: number]
  /** A card was clicked or activated. */
  'event-activate': [event: E]
  /** An event was dropped somewhere else, or stretched to a new end. */
  'event-drop': [id: CalendarEventId, times: CalendarEventTimes, kind: 'move' | 'resize']
  /** An empty stretch of a day was drawn out, and is asking to become an event. */
  'slot-create': [times: CalendarEventTimes]
  /** Something happened that a reader who cannot see the grid needs told. */
  announce: [message: string]
  /** A page key asked for the previous or next period, which only the calendar can do. */
  step: [delta: -1 | 1]
}>()

/** Which cell holds the tab stop. The calendar owns it, so the toolbar can move it too. */
const focused = defineModel<FocusedCell>('focused', { required: true })

defineSlots<{
  event?(props: {
    event: E
    layout: 'block' | 'chip'
    timeText: string
    continuesBefore: boolean
    continuesAfter: boolean
    dragging: boolean
    grabbed: boolean
  }): unknown
  'day-header'?(props: { iso: string; weekday: string; day: string; today: boolean }): unknown
  'all-day-label'?(): unknown
}>()

const m = useMessages()
const uid = useId()

const MINUTES_PER_HOUR = 60

/** The hour each row stands for, as minutes since midnight. */
const hours = computed(() => {
  const rows: number[] = []
  for (let at = props.window.start; at < props.window.end; at += MINUTES_PER_HOUR) rows.push(at)
  return rows
})

/**
 * The id a stretch of empty grid carries while it is being drawn out. It never leaves this
 * component: on release the calendar is handed the times alone and mints an id of its own.
 */
const DRAFT_ID = '__vectis-calendar-draft__'

/**
 * The id the faded echo of a dragged event carries.
 *
 * It has to DIFFER from the event's own, or the two would collide in every map the layout
 * keys by id and only one of them would ever be drawn. The original is recovered from it —
 * and handed to the card as `ghostOf` — because the colour of an event is derived from its
 * id, so an echo under a fresh id would come out a different colour from the card it belongs
 * to. `hueOf` reads a number and its digits as the same event, so the string form is enough.
 */
const GHOST_PREFIX = '__vectis-calendar-ghost__'
const ghostIdOf = (id: CalendarEventId) => `${GHOST_PREFIX}${id}`
const originalIdOf = (id: CalendarEventId) => String(id).slice(GHOST_PREFIX.length)
const isGhostId = (id: CalendarEventId) => String(id).startsWith(GHOST_PREFIX)

/**
 * A gesture under way, whether it came from a pointer or from the keyboard.
 *
 * `move-days` is the whole-day one: an all-day bar dragged along the band above the grid. It
 * is a kind of its own rather than a flag on `move` because the two answer different
 * questions — one asks what MOMENT the pointer is over, the other only what day — and because
 * a bar spanning three days must keep spanning three when it lands.
 */
interface Gesture {
  kind: 'move' | 'move-days' | 'resize' | 'create'
  id: CalendarEventId
  /**
   * Where the event was when the gesture began. Every frame is computed from THIS and never
   * from the frame before it, so a long drag cannot accumulate rounding drift.
   */
  origin: CalendarEventTimes
  /** What the card shows right now. The model is not touched until the gesture ends. */
  preview: CalendarEventTimes
  pointerId: number | null
  originX: number
  originY: number
  /** How far into the card the pointer took hold, so the card does not jump under it. */
  grabOffset: number
  grabColumn: number
  /**
   * Where the pointer last was.
   *
   * Kept because two things move the calendar UNDER a still pointer — paging at an edge, and
   * auto-scrolling — and each has to work out afresh what the pointer is now over. Without it
   * a hand held motionless at an edge would page the view and leave the card behind on a day
   * that is no longer on screen.
   */
  lastX: number
  lastY: number
  /**
   * The share of its column the dragged card had when the gesture began — and nothing else.
   *
   * That much is recorded because the echo must not take part in the overlap layout: were it
   * packed alongside the card being dragged, the two would share the width of their column
   * the moment they overlapped, and the card under the pointer would halve in width and then
   * grow back as it moved away.
   *
   * WHERE the echo goes is deliberately NOT recorded, and is recomputed on every render from
   * the origin times against the days currently on show. Holding at an edge pages the view
   * under a live drag, and both of these boxes are described by INDEX into `props.days`: a
   * `dayIndex` captured in one week names a different date in the next, so a frozen box would
   * follow the column rather than the day — an event dragged out of Tuesday the 9th leaving
   * its echo on Tuesday the 2nd, instead of leaving with the week it belonged to.
   *
   * Exactly one of the two is ever set — a timed event is a segment, an all-day one a bar.
   */
  ghostColumn: Pick<PlacedSegment, 'column' | 'span' | 'columns'> | null
  ghostLane: number | null
  /** Whether the pointer has travelled far enough for this to be a drag and not a click. */
  moved: boolean
  /**
   * Whether the pointer is off the calendar altogether — over the toolbar, or over the page
   * beside it. Letting go here abandons the gesture whole and writes nothing.
   *
   * A KEYBOARD grab can never set it, and structurally rather than by a guard: `onPointermove`
   * is the only thing that writes it, and it returns on the id mismatch before reaching that
   * line — a grab's `pointerId` is null, which no real pointer's id ever equals.
   */
  outside: boolean
}

const gesture = ref<Gesture | null>(null)

/** True while a card is being held by the keyboard rather than dragged by a pointer. */
const grabbing = computed(() => gesture.value !== null && gesture.value.pointerId === null)

/**
 * The event the echo stands for: the one being dragged, back where the drag began.
 *
 * ONE predicate, read by the three places that have to agree — the event list, the packing
 * and the band. They were briefly allowed to disagree, and the failure was immediate and
 * total: a placement with no event behind it, and every card in the grid failing to render.
 * A press that has not travelled yet produces none, or a click would flash a second card
 * over the first.
 */
const ghostEvent = computed<E | null>(() => {
  const state = gesture.value
  if (!state?.moved) return null
  const original = props.events.find((event) => event.id === state.id)
  return original ? ({ ...original, ...state.origin, id: ghostIdOf(state.id) } as E) : null
})

/**
 * Where the echo goes, worked out afresh on every render rather than remembered.
 *
 * The two helpers are the SAME ones every other box goes through, run on a list of one — so
 * the echo answers to the days on show exactly as an ordinary event does, and in particular
 * is dropped when its day is not among them. That is what makes it leave with its week when
 * a drag held at an edge pages the view, instead of staying on the column it used to occupy.
 * It is also what keeps the two kinds mutually exclusive by construction rather than by
 * chance: `timedSegments` passes over an all-day event and `packAllDay` over a timed one.
 *
 * Only the packing captured at the start of the gesture is put back on top — see
 * `ghostColumn` above for why that one part must NOT be recomputed.
 */
const ghostSegment = computed<PlacedSegment | null>(() => {
  const state = gesture.value
  const event = ghostEvent.value
  if (!event || !state?.ghostColumn) return null
  const [segment] = timedSegments([event], props.days, props.window, props.slotDuration)
  return segment ? { ...segment, ...state.ghostColumn } : null
})

const ghostSpan = computed<AllDaySpan | null>(() => {
  const state = gesture.value
  const event = ghostEvent.value
  if (!event || state?.ghostLane == null) return null
  const [span] = packAllDay([event], props.days)
  return span ? { ...span, lane: state.ghostLane } : null
})

/**
 * The events as the grid should currently DRAW them — which is the model, with the one being
 * gestured at moved to wherever it is now.
 *
 * Running the preview through the same packing as everything else is what makes the other
 * events reflow live around the one being dragged, with no special case anywhere: the layout
 * does not know a gesture is happening, only that an event is somewhere.
 */
const drawnEvents = computed<E[]>(() => {
  const state = gesture.value
  if (!state) return props.events

  if (state.kind === 'create') {
    const draft = {
      id: DRAFT_ID,
      title: m.value.calendar.newEvent(props.events.length + 1),
      ...state.preview,
      // A draft carries exactly the fields `CalendarEvent` declares, and a consumer's own
      // type may require more. It exists for one render and never reaches the model, which
      // is what makes the cast safe — the calendar mints the real event on release.
    } as unknown as E
    return [...props.events, draft]
  }

  const moving = props.events.map((event) =>
    event.id === state.id ? ({ ...event, ...state.preview } as E) : event,
  )

  /*
   * The echo of where it started. It is listed here whether or not it has a box to draw on,
   * because this is what `eventsById` is built from and the template reads a card's event
   * back out of that map. An echo whose day the view has paged past simply produces no
   * placement below — which is what happens to any ordinary event on a day that is off show.
   */
  return ghostEvent.value ? [...moving, ghostEvent.value] : moving
})

const eventsById = computed(() => new Map(drawnEvents.value.map((event) => [event.id, event])))

/**
 * The bars above the grid, and how many rows they need between them.
 *
 * The echo is taken OUT of the packing and put back with the position it had when the drag
 * began. Left in, it would compete for lanes with the bar being dragged, and both would jump
 * a row whenever they happened to overlap.
 */
const allDay = computed(() => {
  const ghost = ghostSpan.value
  const spans = packAllDay(
    ghost ? drawnEvents.value.filter((event) => event.id !== ghost.id) : drawnEvents.value,
    props.days,
  )
  return ghost ? [...spans, ghost] : spans
})
const allDayLanes = computed(() =>
  allDay.value.reduce((most, span) => Math.max(most, span.lane + 1), 0),
)

/**
 * Where the current-time line goes, or nothing when it has no business being drawn: on the
 * server, on a range that does not include today, or at an hour the window has cropped
 * away.
 */
const nowMark = computed(() => {
  if (props.now === null || props.today === null) return null
  const dayIndex = props.days.indexOf(props.today)
  if (dayIndex === -1) return null
  if (props.now < props.window.start || props.now > props.window.end) return null
  const row = Math.floor((props.now - props.window.start) / MINUTES_PER_HOUR)
  return {
    dayIndex,
    // Clamped so the line at the very end of the window still has a cell to live in.
    cell: `${dayIndex}:${clamp(row, 0, hours.value.length - 1)}`,
    fraction: fractionOf(props.now, props.window),
  }
})

/**
 * The placed boxes, day by day. `packDayColumn` works on one column at a time, so the
 * segments are split before it sees them: events on different days never compete for width,
 * and packing them together would make a busy Monday narrow a quiet Tuesday.
 */
const placed = computed(() => {
  const segments = timedSegments(drawnEvents.value, props.days, props.window, props.slotDuration)
  const ghost = ghostSegment.value

  const byDay = new Map<number, typeof segments>()
  for (const segment of segments) {
    /*
     * The echo is held OUT of the packing and put back below with the width and column it had
     * when the drag began. Packed with the rest, it would share its column with the card
     * being dragged the moment the two overlapped — so the card under the pointer would halve
     * in width and then grow back as it moved away, which reads as the drag going wrong.
     */
    if (ghost && segment.id === ghost.id) continue
    const list = byDay.get(segment.dayIndex)
    if (list) list.push(segment)
    else byDay.set(segment.dayIndex, [segment])
  }

  const real = [...byDay.values()].flatMap((list) => packDayColumn(list))
  return ghost ? [...real, ghost] : real
})

/**
 * The cards, filed under the cell their start falls in. Grouping once here is what keeps
 * the template from asking every cell to search the whole list — a hundred and sixty-eight
 * searches per render otherwise.
 */
const byCell = computed(() => {
  const map = new Map<string, PlacedSegment[]>()
  for (const segment of placed.value) {
    const row = Math.floor((segment.start - props.window.start) / MINUTES_PER_HOUR)
    const key = `${segment.dayIndex}:${clamp(row, 0, hours.value.length - 1)}`
    const list = map.get(key)
    if (list) list.push(segment)
    else map.set(key, [segment])
  }
  return map
})

const cellId = (iso: string, minutes: number) => `${uid}-c-${iso}-${minutes}`

/*
 * Every label the grid writes, worked out once per day and once per hour instead of once
 * per CELL — the shape `byCell` above already uses, and for the same reason.
 *
 * The grid renders `hours × days` cells, 24 × 7 by default. Reading these straight from
 * `formatDate` in the template meant 168 `cellLabel` calls per render, each doing a
 * `parseISO`, a `JSON.stringify` to build the formatter's cache key and two `Intl` formats,
 * plus `dayName`/`dayNumber` twice per column (slot props, then the fallback content). None
 * of it depends on the pointer — yet `applyPoint` assigns a new `state.preview` on every
 * `pointermove`, so the whole template re-renders at pointer rate and all of it was
 * recomputed on every frame of a drag.
 *
 * Two maps of 7 and 24 entries replace that: they recompute when the locale, the days or
 * the window change, and never because a card moved.
 */
const dayLabels = computed(() => {
  const map = new Map<string, { short: string; number: string; full: string }>()
  for (const iso of props.days) {
    map.set(iso, {
      short: formatDate(iso, props.locale, { weekday: 'short' }),
      number: formatDate(iso, props.locale, { day: 'numeric' }),
      full: formatDate(iso, props.locale, { weekday: 'long', day: 'numeric', month: 'long' }),
    })
  }
  return map
})

const hourLabels = computed(() => {
  const map = new Map<number, string>()
  for (const minutes of hours.value)
    map.set(minutes, formatTimeDisplay(timeOf(minutes), props.locale, props.hourFormat))
  return map
})

/*
 * The hour gutter and the drag readout both ask for an hour that is not always one of the
 * rows — a preview lands between them — so this falls back to formatting rather than
 * assuming the map holds every minute.
 */
const hourLabel = (minutes: number) =>
  hourLabels.value.get(minutes) ??
  formatTimeDisplay(timeOf(minutes), props.locale, props.hourFormat)

const dayName = (iso: string, weekday: 'short' | 'long') =>
  weekday === 'short'
    ? (dayLabels.value.get(iso)?.short ?? formatDate(iso, props.locale, { weekday }))
    : formatDate(iso, props.locale, { weekday })

const dayNumber = (iso: string) =>
  dayLabels.value.get(iso)?.number ?? formatDate(iso, props.locale, { day: 'numeric' })

/** What one cell is called: the day in full, then the hour. */
const cellLabel = (iso: string, minutes: number) =>
  `${dayLabels.value.get(iso)?.full ?? iso}, ${hourLabel(minutes)}`

/**
 * An event's times, written out for the reader. The time zone is appended as an annotation
 * and never applied: the card's place in the grid comes from the local times given, which
 * is the whole of the design system's position on the matter.
 */
function timeTextOf(event: E): string {
  const start = formatTimeDisplay(event.startTime, props.locale, props.hourFormat)
  const end = formatTimeDisplay(event.endTime, props.locale, props.hourFormat)
  const range = `${start} – ${end}`
  return event.timezone ? `${range} (${event.timezone})` : range
}

function styleFor(segment: PlacedSegment) {
  return {
    '--event-start': String(fractionOf(segment.start, props.window)),
    '--event-end': String(fractionOf(segment.end, props.window)),
    '--event-day': String(segment.dayIndex),
    '--event-column': String(segment.column),
    '--event-span': String(segment.span),
    '--event-columns': String(segment.columns),
  }
}

const isFocused = (iso: string, minutes: number) =>
  focused.value.iso === iso && focused.value.minutes === minutes

/**
 * Where the tab stop goes when the focused cell is not one of the cells on screen — after
 * a view change, or before anything has been focused at all. Without it no cell would carry
 * `tabindex="0"`, the grid would drop out of the tab order, and the scrolling region would
 * have nothing reachable inside it, which is an accessibility failure and not merely an
 * inconvenience.
 */
const fallbackCell = computed(() => {
  const iso = props.days[0]
  if (!iso) return null
  return { iso, minutes: props.window.start }
})

const tabbable = computed<FocusedCell | null>(() => {
  const current = focused.value
  if (props.days.includes(current.iso)) {
    const rounded =
      Math.floor((current.minutes - props.window.start) / MINUTES_PER_HOUR) * MINUTES_PER_HOUR +
      props.window.start
    if (rounded >= props.window.start && rounded < props.window.end) {
      return { iso: current.iso, minutes: rounded }
    }
  }
  return fallbackCell.value
})

const isTabStop = (iso: string, minutes: number) =>
  tabbable.value?.iso === iso && tabbable.value.minutes === minutes

function moveFocusTo(iso: string, minutes: number) {
  focused.value = { iso, minutes }
  // @a11y — the model is what decides which cell is tabbable, so the DOM focus can only be
  // moved once the render that applied it has run.
  void nextTick(() => document.getElementById(cellId(iso, minutes))?.focus())
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null

  // A card answers a different table from the grid it sits in — that is what a grab mode IS.
  // Delegated here, on the same element as the pointer, so the two never drift apart.
  const card = target?.closest<HTMLElement>('.v-calendar-event')
  if (card) {
    onCardKeydown(event, card)
    return
  }

  const cell = target?.closest<HTMLElement>('.v-calendar-cell')
  if (!cell) return

  const intent = calendarIntent(event.key, event.shiftKey, 'cell', props.slotDuration, isRtl())
  if (!intent) return

  const iso = cell.dataset.iso!
  const minutes = Number(cell.dataset.minutes)
  const index = props.days.indexOf(iso)

  if (intent.kind === 'moveFocus') {
    const day = props.days[clamp(index + intent.days, 0, props.days.length - 1)]!
    const at = clamp(
      minutes + intent.minutes,
      props.window.start,
      props.window.end - MINUTES_PER_HOUR,
    )
    event.preventDefault()
    moveFocusTo(day, at)
    return
  }

  if (intent.kind === 'rowEdge') {
    const day = intent.edge === 'start' ? props.days[0] : props.days.at(-1)
    if (!day) return
    event.preventDefault()
    moveFocusTo(day, minutes)
    return
  }

  if (intent.kind === 'period') {
    event.preventDefault()
    emit('step', intent.delta)
    return
  }

  if (intent.kind === 'activate') {
    event.preventDefault()
    emit('cell-activate', iso, minutes)
  }
}

/* ------------------------------------------------------------------ the gestures */

/**
 * Starts a gesture, from whichever of the three ways one can begin.
 *
 * Every entry point funnels through here, so the rules that make a gesture safe — one at a
 * time, the origin captured once, the pointer taken hold of on the GRID — are written once
 * rather than three times.
 */
function begin(
  state: Omit<
    Gesture,
    'preview' | 'moved' | 'outside' | 'lastX' | 'lastY' | 'ghostColumn' | 'ghostLane'
  >,
  event?: PointerEvent,
) {
  /*
   * Read BEFORE the gesture is set. Both are derived from `drawnEvents`, which the gesture
   * immediately starts rewriting — a line later and they would already describe the preview
   * rather than the place it came from. Which of the two answers is also what says whether
   * this is a timed card or an all-day bar, and therefore which of the echo's two shapes the
   * gesture has to carry.
   */
  const segment = placed.value.find((item) => item.id === state.id)
  const span = allDay.value.find((item) => item.id === state.id)

  gesture.value = {
    ...state,
    preview: { ...state.origin },
    lastX: state.originX,
    lastY: state.originY,
    ghostColumn: segment
      ? { column: segment.column, span: segment.span, columns: segment.columns }
      : null,
    ghostLane: span ? span.lane : null,
    moved: false,
    outside: false,
  }

  if (!event) return
  /*
   * @fallback — capturing the pointer on the COLUMNS box, and not on the card, is what makes
   * one set of move and up handlers serve all three gestures and what keeps a drag alive
   * when the pointer wanders off the grid: capture retargets every later pointer event back
   * to the captured element, so the bindings in the template are the whole of it — no
   * document listener, no release, nothing to tear down on unmount.
   *
   * It is wrapped because a pointer event fired by a TEST refers to no real pointer, and the
   * call then throws. Failing to capture merely means the drag stops at the edge, which no
   * test is checking.
   */
  try {
    // The SCROLLER, not the columns box: the all-day band sits in the sticky header, and this
    // is the only element that contains both it and the canvas. Capture retargets every later
    // pointer event here, which is why one set of move and up bindings serves all four kinds.
    rootEl.value?.setPointerCapture(event.pointerId)
  } catch {
    /* a synthetic pointer: nothing to capture */
  }
}

/**
 * Every press on the grid, dispatched by WHAT it landed on.
 *
 * One delegated handler rather than a listener per card and per strip. That is not only
 * fewer bindings on a grid that may hold a hundred: it is what removes the question of
 * which listener runs first. Three handlers stacked on nested elements would each have to
 * guard against the others, and `stopPropagation` would make the answer depend on the order
 * they happened to be bound in. Here the target is examined once and the gesture chosen
 * once, so the strip inside a card and the card inside a cell cannot disagree.
 */
function onGridPointerdown(event: PointerEvent) {
  endLastGesture()
  // Left button only: a right-click is opening a context menu, not starting a drag.
  if (gesture.value || event.button !== 0) return

  const target = event.target as HTMLElement | null
  if (!target) return
  const rect = columnsEl.value?.getBoundingClientRect()
  if (!rect) return

  const point = pointToCell(
    { x: event.clientX, y: event.clientY },
    geometryOf(rect),
    props.window,
    isRtl(),
  )

  const card = target.closest<HTMLElement>('.v-calendar-event')
  if (card) {
    if (!props.editable) return
    const item = eventsById.value.get(cardIdOf(card))
    if (!item || isAllDayEvent(item)) return

    const resizing = target.closest('[data-calendar-handle]') !== null
    begin(
      {
        kind: resizing ? 'resize' : 'move',
        id: item.id,
        origin: timesOf(item),
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        // Where inside the card the pointer took hold, so it does not jump under the finger.
        grabOffset: resizing ? 0 : point.minutes - minutesAt(item.startTime, props.window.start),
        grabColumn: point.columnIndex,
      },
      event,
    )
    return
  }

  if (!props.creatable || !target.closest('.v-calendar-cell')) return
  const iso = props.days[point.columnIndex]
  if (!iso) return

  /*
   * A new event begins at the top of the slot the pointer went down in — rounded DOWN, never
   * to the nearest — because a press at 09:07 means "the nine o'clock slot" and not the
   * quarter past. It is one slot long to begin with, so a press that never moves creates
   * exactly the short event a click is meant to create, and a press that travels stretches
   * its end instead. One path serves both, and a click is simply the drag that stayed still.
   */
  const start = floorToSlot(point.minutes, props.slotDuration)
  begin(
    {
      kind: 'create',
      id: DRAFT_ID,
      origin: {
        start: iso,
        end: iso,
        startTime: timeOf(start),
        endTime: timeOf(Math.min(start + props.slotDuration, props.window.end)),
      },
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      grabOffset: 0,
      grabColumn: point.columnIndex,
    },
    event,
  )
}

/**
 * A press on the band of all-day bars above the grid.
 *
 * It has a handler of its own rather than joining the delegated one below it, because the
 * band is not inside `.v-calendar-columns` — it lives in the sticky header, which is the one
 * part of the calendar that scroll does not carry. Everything after the press IS shared: the
 * capture, the move, the release, all of them on the scroller both boxes sit in.
 */
function onBandPointerdown(event: PointerEvent) {
  endLastGesture()
  if (gesture.value || !props.editable || event.button !== 0) return

  const card = (event.target as HTMLElement | null)?.closest<HTMLElement>('.v-calendar-event')
  if (!card) return
  const item = eventsById.value.get(cardIdOf(card))
  if (!item) return

  const rect = columnsEl.value?.getBoundingClientRect()
  if (!rect) return
  const point = pointToCell(
    { x: event.clientX, y: event.clientY },
    geometryOf(rect),
    props.window,
    isRtl(),
  )

  begin(
    {
      kind: 'move-days',
      id: item.id,
      origin: timesOf(item),
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      grabOffset: 0,
      grabColumn: point.columnIndex,
    },
    event,
  )
}

/** The event a card stands for, read back off the attribute the card publishes. */
function cardIdOf(card: HTMLElement): CalendarEventId {
  const raw = card.dataset.eventId ?? ''
  /*
   * An id may be a number, and an attribute is always text. The map is keyed by the ORIGINAL
   * value, so a numeric id has to be turned back into one — otherwise every card belonging
   * to a numerically-keyed calendar would look up as a miss and nothing would drag.
   */
  return eventsById.value.has(raw) ? raw : Number(raw)
}

function onPointermove(event: PointerEvent) {
  const state = gesture.value
  if (!state || state.pointerId !== event.pointerId) return

  state.lastX = event.clientX
  state.lastY = event.clientY

  // Below the threshold nothing has happened yet. That is what keeps a click a click: the
  // hand's tremor during a press would otherwise register as a one-pixel drag.
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
  watchEdges(state)
}

/**
 * Whether the pointer has left the calendar's own box.
 *
 * The box is the WHOLE view — the scroller, the element carrying `.v-calendar-view` — and
 * deliberately not `.v-calendar-columns`, whose rect excludes the sticky day names, the all-day
 * band and the hour gutter: a bar dropped on the band is an ordinary thing to do, and measured
 * against the columns it would read as dropped off the calendar and silently revert.
 *
 * The rect goes in RAW and never through `geometryOf`, whose `inlineStart` is the box's RIGHT
 * edge in a right-to-left page: containment has no reading direction, and flipping the axis here
 * would answer a question nobody asked — every right-to-left drop would read as outside.
 *
 * It is called from `onPointermove` ALONE, and not from `applyPoint`. That function has three
 * callers, and the other two — the view paging, and the auto-scroll frame — move the days and
 * the scroll position under a pointer that has not moved at all: they cannot change this answer,
 * and asking them to recompute it would force a layout on every animation frame.
 *
 * TRAP — neither `applyPoint` nor `watchEdges` is gated on the result, and neither may become
 * so. The card must keep following the pointer while it is out (that is what makes coming back
 * in seamless), and paging must keep running (pushing past the edge is how one crosses into the
 * next week). Being outside decides what happens on RELEASE, and nothing else.
 */
function isPointerOutside(state: Gesture): boolean {
  const rect = rootEl.value?.getBoundingClientRect()
  return rect ? !pointWithin({ x: state.lastX, y: state.lastY }, rect) : false
}

/**
 * Works out where the dragged event now belongs, from wherever the pointer last was.
 *
 * It is separate from the handler because THREE things call it: the pointer moving, the view
 * paging out from under a still pointer, and the grid scrolling under one. The last two would
 * otherwise leave the card behind on a day or an hour that is no longer where the pointer is.
 */
function applyPoint(state: Gesture) {
  const rect = columnsEl.value?.getBoundingClientRect()
  if (!rect) return
  // Measuring here is safe: this runs from a handler or a frame, hence in a browser, never
  // in a render.
  const point = pointToCell(
    { x: state.lastX, y: state.lastY },
    geometryOf(rect),
    props.window,
    isRtl(),
  )

  if (state.kind === 'move-days') {
    /*
     * A bar keeps its length in days, so the target is its START shifted by however many
     * columns the pointer has crossed — not the column the pointer is over. Grab a
     * Monday-to-Wednesday bar by its Tuesday and the pointer stays on its Tuesday.
     */
    const column = clamp(
      originColumn(state) + (point.columnIndex - state.grabColumn),
      0,
      props.days.length - 1,
    )
    const iso = props.days[column]
    if (iso) state.preview = moveEventToDay(state.origin, iso)
    return
  }

  if (state.kind === 'move') {
    /*
     * The day comes from the COLUMN the pointer is over, read out of the list of days on
     * show — never from date arithmetic on how many columns were crossed, which would count
     * the days the calendar is hiding and land the event on a Saturday nobody can see.
     */
    const column = clamp(
      originColumn(state) + (point.columnIndex - state.grabColumn),
      0,
      props.days.length - 1,
    )
    const iso = props.days[column]!
    const start = snapToSlot(point.minutes - state.grabOffset, props.slotDuration)
    const delta = start - minutesAt(state.origin.startTime, props.window.start)
    state.preview = { ...moveEvent(state.origin, 0, delta, props.window), start: iso, end: iso }
    return
  }

  state.preview = resizeEvent(
    state.origin,
    snapToSlot(point.minutes, props.slotDuration),
    props.slotDuration,
    props.window,
  )
}

/* ------------------------------------------------------- crossing the boundaries */

/**
 * How many pixels a frame the grid scrolls at full tilt.
 *
 * At sixty frames a second that is roughly eight hundred a second, which crosses a whole
 * twenty-four-hour day in about two — fast enough to be worth doing, slow enough to stop on.
 */
const AUTO_SCROLL_SPEED = 14

const edge = useEdgeStep(
  (direction) => emit('step', direction),
  () => props.edgeStepDelay,
)

/** Which edge is counting down, in words, for the stylesheet to light up. */
const edgeCue = computed(() =>
  edge.pending.value === -1 ? 'start' : edge.pending.value === 1 ? 'end' : undefined,
)

/** Tells the two boundary mechanisms where the pointer now is. */
function watchEdges(state: Gesture) {
  const columns = columnsEl.value?.getBoundingClientRect()
  const scroller = rootEl.value?.getBoundingClientRect()
  if (!columns || !scroller) return

  // Paging is measured against the COLUMNS, which is what the days occupy; scrolling against
  // the SCROLLER, which is what actually moves.
  edge.watchEdge(inlineEdgeAt(state.lastX, geometryOf(columns), EDGE_BAND, isRtl()))
  setScrollSpeed(props.autoScroll ? blockEdgeAt(state.lastY, scroller, EDGE_BAND) : 0)
}

/*
 * The design system's only `requestAnimationFrame` loop, and it earns that: a pointer held
 * still fires no events at all, so nothing else can drive continuous motion. Everything else
 * that moves here is either a transition or a timer.
 */
let scrollFrame: number | null = null
let scrollSpeed = 0

function setScrollSpeed(speed: number) {
  scrollSpeed = speed
  if (speed === 0) {
    stopScrolling()
    return
  }
  scrollFrame ??= requestAnimationFrame(scrollStep)
}

function scrollStep() {
  scrollFrame = null
  const root = rootEl.value
  const state = gesture.value
  if (!root || !state || scrollSpeed === 0) return

  root.scrollTop += scrollSpeed * AUTO_SCROLL_SPEED
  // The hours have moved under a pointer that has not, so what it is over has changed.
  applyPoint(state)
  scrollFrame = requestAnimationFrame(scrollStep)
}

function stopScrolling() {
  if (scrollFrame !== null) cancelAnimationFrame(scrollFrame)
  scrollFrame = null
  scrollSpeed = 0
}

/** Everything a gesture leaves running, dropped on every path out of one. */
function releaseBoundaries() {
  edge.cancel()
  stopScrolling()
}

onBeforeUnmount(stopScrolling)

/*
 * Paging swaps the days out from under a live drag, and the dragged event's day is then off
 * screen — the card would vanish until the next pointer move, which never comes if the hand
 * is holding still against the edge. Re-applying the last position as soon as the new days
 * are rendered is what keeps the card under the pointer across the boundary.
 */
watch(
  () => props.days,
  () => {
    const state = gesture.value
    if (state?.moved) applyPoint(state)
  },
  { flush: 'post' },
)

/**
 * Which column the event being moved started in.
 *
 * The fallback is what makes the formula above general rather than a special case. For a
 * TIMED card these two are necessarily equal — you grab a card, and a card lives inside its
 * own column — so the offset is zero and the event simply follows the pointer. For a BAR they
 * differ, which is what keeps a three-day one from jumping when grabbed by its middle. And
 * when the origin day is not on screen at all — a bar that began before this range, or an
 * event whose view has been paged out from under the drag — falling back to the grab column
 * makes the offset zero again, so the event lands under the pointer instead of nowhere.
 */
function originColumn(state: Gesture): number {
  const index = props.days.indexOf(state.origin.start)
  return index === -1 ? state.grabColumn : index
}

/**
 * Whether the press that is about to become a click was a drag.
 *
 * A plain `let`, since nothing renders it: `pointerup` always fires before `click`, so this
 * is written on the way out of the gesture and read by the click that immediately follows.
 * Without it, letting go of a card at the end of a drag would ALSO open it — the consumer's
 * editor would appear over every event the reader had just moved.
 */
let justDragged = false

/**
 * Closes the books on whatever gesture came before, at the start of a new press.
 *
 * TRAP — without this the flag can be left STANDING, and what it then breaks surfaces nowhere
 * near its cause. It is lowered by the click that reads it, and that click only reaches
 * `onCardClick` when it lands on a card: draw a new event and the press began on a CELL, so the
 * click goes there and the flag stays raised.
 *
 * What normally hides that is `onPointerup` overwriting the flag with its own `moved` — so the
 * next press heals it, and only a press that starts NO gesture does not. Which is a real
 * configuration and not a curiosity: a calendar that lets events be drawn but not moved
 * (`creatable` without `editable`) reaches it every time. The reader clicks an event to open it,
 * nothing happens, they click again and it works.
 *
 * Clearing it HERE makes the flag incapable of outliving its own interaction, and the ordering
 * is the whole argument: the click this exists to swallow follows its own `pointerup` with no
 * press in between, so it is still protected — while any LATER click on a card is necessarily
 * preceded by a press on that card, which arrives here first.
 *
 * It runs before every guard in the three handlers that call it, deliberately: a press that
 * starts no gesture at all is still the start of a new interaction, and those are precisely the
 * cases this is for.
 */
function endLastGesture() {
  justDragged = false
}

function onPointerup(event: PointerEvent) {
  const state = gesture.value
  if (!state || state.pointerId !== event.pointerId) return
  gesture.value = null
  justDragged = state.moved
  releaseBoundaries()

  /*
   * Let go with the pointer off the calendar and the gesture is abandoned whole: no move, no new
   * length, and no new event either. The card goes back to where the model still says it is,
   * which is where the echo has been showing all along. It is the hand's version of the Escape
   * the keyboard grab already has — a gesture that ends somewhere it cannot mean anything must
   * mean nothing.
   *
   * TRAP — `justDragged` above is what still has to happen, and it is the ONE thing the cancel
   * path deliberately does not do: `pointerup` fires before `click`, so without it an abandoned
   * drag would end by OPENING the very event it has just refused to move. Which is also why
   * this branch and `onPointercancel` must NOT be factored into one helper. They differ by
   * exactly that line and it is correct in both directions — no click follows a cancel, so a
   * `true` left behind there would swallow the next genuine one instead.
   *
   * Nothing is announced. The pointer says nothing on a SUCCESSFUL drop either: `grabbed`,
   * `dropped` and `reverted` belong to the keyboard grab, which has no pointer to show where the
   * event went. A revert that spoke would be the only thing the pointer ever said.
   */
  if (state.outside) return

  if (state.kind === 'create') {
    emit('slot-create', state.preview)
    return
  }

  // A press that never travelled is an ordinary click, which the button's own click event is
  // about to report. Writing anything here would move an event nobody dragged.
  if (!state.moved) return

  emit('event-drop', state.id, state.preview, state.kind === 'resize' ? 'resize' : 'move')
}

function onCardClick(id: CalendarEventId) {
  if (justDragged) {
    justDragged = false
    return
  }
  const item = eventsById.value.get(id)
  if (item && id !== DRAFT_ID) emit('event-activate', item)
}

/**
 * A click on an empty part of a day, for a calendar that does NOT make events itself.
 *
 * When it does, the press has already become a `create` gesture and reported itself on
 * release; saying it again here would report the same click twice. So this path exists only
 * for a consumer who turned creation off to run their own form — they still get told where
 * the reader pointed, which is the whole point of turning it off rather than ignoring it.
 */
function onGridClick(event: MouseEvent) {
  if (props.creatable) return
  const target = event.target as HTMLElement | null
  if (target?.closest('.v-calendar-event')) return
  const cell = target?.closest<HTMLElement>('.v-calendar-cell')
  if (!cell) return
  emit('cell-activate', cell.dataset.iso!, Number(cell.dataset.minutes))
}

function onPointercancel() {
  /*
   * The gesture was taken away — a system gesture, a context menu, the page starting to
   * scroll. Nothing is written and nothing is announced: the card simply goes back to where
   * the model still says it is.
   */
  gesture.value = null
  releaseBoundaries()
}

/* ------------------------------------------------------------ the keyboard's version */

function announceTimes(title: string, times: CalendarEventTimes) {
  const start = formatTimeDisplay(times.startTime, props.locale, props.hourFormat)
  const end = formatTimeDisplay(times.endTime, props.locale, props.hourFormat)
  const day = formatDate(times.start, props.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  emit('announce', m.value.calendar.movedTo(title, `${day}, ${start} – ${end}`))
}

/** Puts the focus back on a card that has just been redrawn somewhere else. */
function refocusCard(id: CalendarEventId) {
  void nextTick(() => {
    /*
     * The card is found by WALKING the cards rather than by building an attribute selector.
     * An id belongs to the consumer, so it may hold a quote or a backslash that a selector
     * would need escaped — and `CSS.escape` cannot do that escaping here: jsdom defines no
     * `CSS` object at all, so the call threw on every keyboard grab, from inside a `nextTick`
     * where nothing could catch it (an unhandled rejection, which fails the run while every
     * assertion still passes). `menuInvoker` in VMenu/context.ts escapes by hand for the same
     * reason; comparing the attribute's own text sidesteps the question entirely, since
     * `data-event-id` is written as exactly `String(event.id)`.
     */
    const cards = columnsEl.value?.querySelectorAll<HTMLElement>('.v-calendar-event')
    Array.from(cards ?? [])
      .find((card) => card.dataset.eventId === String(id))
      ?.focus()
  })
}

function onCardKeydown(event: KeyboardEvent, card: HTMLElement) {
  const item = eventsById.value.get(cardIdOf(card))
  if (!item) return

  const held = grabbing.value && gesture.value?.id === item.id
  const intent = calendarIntent(
    event.key,
    event.shiftKey,
    held ? 'grabbed' : 'event',
    props.slotDuration,
    isRtl(),
  )
  if (!intent) return

  if (!held) {
    if (intent.kind !== 'activate') return
    // An event that cannot be moved keeps a button's ordinary behaviour: Enter opens it,
    // which the click handler below already reports.
    if (!props.editable || isAllDayEvent(item)) return
    /*
     * Enter and Space are ALSO how a button is pressed. Without this the same keystroke
     * would take hold of the event and open it at once, and every attempt to move something
     * would fire the consumer's editor over the top of it.
     */
    event.preventDefault()
    begin({
      kind: 'move',
      id: item.id,
      origin: timesOf(item),
      pointerId: null,
      originX: 0,
      originY: 0,
      grabOffset: 0,
      grabColumn: 0,
    })
    emit('announce', m.value.calendar.grabbed)
    return
  }

  const state = gesture.value!
  event.preventDefault()

  if (intent.kind === 'grabResize') {
    /*
     * Each step is applied to the PREVIEW rather than to the origin, so the arrows accumulate
     * the way a reader expects — three presses of Down move three slots, not one. That is the
     * opposite of the pointer, which recomputes from the origin every frame because it always
     * knows where it is; the keyboard only knows how far it has just asked to go.
     */
    state.preview = resizeEvent(
      state.preview,
      minutesAt(state.preview.endTime, props.window.end) + intent.minutes,
      props.slotDuration,
      props.window,
    )
    state.moved = true
    announceTimes(item.title, state.preview)
    refocusCard(state.id)
    return
  }

  if (intent.kind === 'grabMove') {
    // Sideways is a step along the days ON SHOW, exactly as the pointer's is: date
    // arithmetic would count the days the calendar is hiding.
    const column = clamp(
      props.days.indexOf(state.preview.start) + intent.days,
      0,
      props.days.length - 1,
    )
    const iso = props.days[column] ?? state.preview.start
    state.preview = {
      ...moveEvent(state.preview, 0, intent.minutes, props.window),
      start: iso,
      end: iso,
    }
    state.moved = true
    announceTimes(item.title, state.preview)
    refocusCard(state.id)
    return
  }

  if (intent.kind === 'activate') {
    gesture.value = null
    if (state.moved) {
      emit('event-drop', state.id, state.preview, state.kind === 'resize' ? 'resize' : 'move')
    }
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

/* ---------------------------------------------------------------------- measurement */

const rootEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLElement | null>(null)
const columnsEl = ref<HTMLElement | null>(null)

/** The columns box as the pure geometry wants it: plain numbers, no element. */
function geometryOf(rect: DOMRect) {
  const rtl = isRtl()
  return {
    top: rect.top,
    height: rect.height,
    // The edge the first column starts at, which is the other one in a right-to-left page.
    inlineStart: rtl ? rect.right : rect.left,
    inlineSize: rect.width,
    columns: props.days.length,
  }
}

const isRtl = () => isElementRtl(columnsEl.value)

/**
 * Brings a moment of the day to the top of the visible area.
 *
 * The row height is measured rather than read from the token, because the token is a length
 * a consumer may override and the browser is the only thing that knows what it came to. It
 * is a handler-time read, never a render-time one, and it degrades to doing nothing where
 * nothing has been laid out — which is exactly what the test environment wants.
 */
function scrollToMinutes(minutes: number) {
  const root = rootEl.value
  const canvas = canvasEl.value
  if (!root || !canvas || hours.value.length === 0) return
  const rowHeight = canvas.offsetHeight / hours.value.length
  if (rowHeight <= 0) return
  root.scrollTop = ((minutes - props.window.start) / MINUTES_PER_HOUR) * rowHeight
}

/** Puts the focus on whichever cell currently holds the tab stop. */
function focus() {
  const cell = tabbable.value
  if (cell) document.getElementById(cellId(cell.iso, cell.minutes))?.focus()
}

defineExpose({ focus, scrollToMinutes })
</script>

<template>
  <div
    ref="rootEl"
    class="v-calendar-grid"
    :data-outside="gesture?.outside ? '' : undefined"
    :style="{ '--calendar-columns': String(days.length) }"
    @pointermove="onPointermove"
    @pointerup="onPointerup"
    @pointercancel="onPointercancel"
  >
    <div class="v-calendar-head">
      <div class="v-calendar-head-gutter" />
      <div
        v-for="iso in days"
        :key="iso"
        class="v-calendar-head-day"
        :data-today="iso === today ? '' : undefined"
      >
        <slot
          name="day-header"
          :iso="iso"
          :weekday="dayName(iso, 'short')"
          :day="dayNumber(iso)"
          :today="iso === today"
        >
          <span class="v-calendar-head-weekday">{{ dayName(iso, 'short') }}</span>
          <span class="v-calendar-head-number">{{ dayNumber(iso) }}</span>
        </slot>
      </div>

      <!-- The band of all-day bars, kept INSIDE the header so that the whole of it is one
           sticky box: two boxes would each need to know how tall the other was. -->
      <template v-if="allDay.length > 0">
        <div class="v-calendar-allday-label">
          <slot name="all-day-label">{{ m.calendar.allDay }}</slot>
        </div>
        <div
          class="v-calendar-allday"
          role="group"
          :aria-label="m.calendar.allDay"
          :style="{ '--calendar-lanes': String(allDayLanes) }"
          @pointerdown="onBandPointerdown"
        >
          <VCalendarEvent
            v-for="span in allDay"
            :key="span.id"
            class="v-calendar-bar"
            :event="eventsById.get(span.id)!"
            layout="chip"
            :continues-before="span.continuesBefore"
            :continues-after="span.continuesAfter"
            :dragging="gesture?.id === span.id && gesture.pointerId !== null"
            :rejected="gesture?.id === span.id && gesture.outside"
            :grabbed="grabbing && gesture?.id === span.id"
            :hint-id="editable && !isGhostId(span.id) ? hintId : undefined"
            :ghost-of="isGhostId(span.id) ? originalIdOf(span.id) : undefined"
            :style="{
              '--event-day': String(span.startIndex),
              '--event-span': String(span.span),
              '--event-lane': String(span.lane),
            }"
            @click="onCardClick(span.id)"
          >
            <template v-if="$slots.event" #default="slotProps">
              <slot name="event" v-bind="slotProps" />
            </template>
          </VCalendarEvent>
        </div>
      </template>
    </div>

    <div ref="canvasEl" class="v-calendar-canvas">
      <div class="v-calendar-hours" aria-hidden="true">
        <span v-for="minutes in hours" :key="minutes" class="v-calendar-hour">
          {{ hourLabel(minutes) }}
        </span>
      </div>

      <div
        ref="columnsEl"
        class="v-calendar-columns"
        role="grid"
        :aria-label="label"
        :data-gesture="gesture?.kind"
        :data-edge="edgeCue"
        @keydown="onKeydown"
        @click="onGridClick"
        @pointerdown="onGridPointerdown"
      >
        <div v-for="(minutes, row) in hours" :key="minutes" role="row" class="v-calendar-row">
          <div
            v-for="(iso, day) in days"
            :id="cellId(iso, minutes)"
            :key="iso"
            role="gridcell"
            class="v-calendar-cell"
            :data-iso="iso"
            :data-minutes="minutes"
            :data-today="iso === today ? '' : undefined"
            :tabindex="isTabStop(iso, minutes) ? 0 : -1"
            :aria-label="cellLabel(iso, minutes)"
            :aria-selected="isFocused(iso, minutes) ? true : undefined"
          >
            <VCalendarEvent
              v-for="segment in byCell.get(`${day}:${row}`) ?? []"
              :key="segment.id"
              class="v-calendar-block"
              :event="eventsById.get(segment.id)!"
              layout="block"
              :time-text="timeTextOf(eventsById.get(segment.id)!)"
              :continues-before="segment.clippedStart"
              :continues-after="segment.clippedEnd"
              :resizable="editable && segment.id !== DRAFT_ID"
              :dragging="gesture?.id === segment.id && gesture.pointerId !== null"
              :rejected="gesture?.id === segment.id && gesture.outside"
              :grabbed="grabbing && gesture?.id === segment.id"
              :hint-id="editable && !isGhostId(segment.id) ? hintId : undefined"
              :ghost-of="isGhostId(segment.id) ? originalIdOf(segment.id) : undefined"
              :style="styleFor(segment)"
              @click="onCardClick(segment.id)"
            >
              <template v-if="$slots.event" #default="slotProps">
                <slot name="event" v-bind="slotProps" />
              </template>
            </VCalendarEvent>

            <!-- The line is drawn INSIDE the cell holding the current hour, never as a
                 direct child of the grid or of a row: a `grid` owns only rows and a row only
                 cells, so an extra box at either level fails `aria-required-children`. -->
            <div
              v-if="nowMark && nowMark.cell === `${day}:${row}`"
              class="v-calendar-now"
              aria-hidden="true"
              :style="{
                '--event-day': String(nowMark.dayIndex),
                '--calendar-now': String(nowMark.fraction),
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-calendar-grid {
    /*
     * The one scrolling box. The day names are sticky INSIDE it rather than in a container
     * of their own, which is what keeps them aligned with the columns for free: a separate
     * header would have to be told how far the body had scrolled sideways, and told again
     * every time the column widths changed.
     */
    --calendar-hour: var(--vectis-control-size-calendar-hour);
    --calendar-gutter: var(--vectis-control-size-calendar-gutter);
    /*
     * Half a line of an hour label. It is used TWICE and in opposite directions — the label
     * is pulled up by it so it straddles its rule, and the tick is pushed back down by it so
     * it lands on that same rule. One number, so the two cannot drift apart; two literals
     * would misalign the moment the caption's leading changed, with nothing to point at it.
     */
    --calendar-hour-lift: calc(
      var(--vectis-text-caption-size) * var(--vectis-text-caption-leading) / 2
    );

    position: relative;
    overflow: auto;
    block-size: 100%;
    min-block-size: 0;
    font-family: var(--vectis-text-family);
    color: var(--vectis-color-text);
  }

  /*
   * A drag currently held off the calendar. `not-allowed` is the word the library already uses
   * for "you cannot do this", on every disabled control.
   *
   * BEST-EFFORT, and never the signal: while a pointer is captured the cursor is resolved
   * against the capture target rather than against whatever sits under the pointer, and engines
   * differ on it. What carries the message is the card's own paint, which is why this is a
   * second cue and not the first.
   */
  .v-calendar-grid[data-outside] {
    cursor: not-allowed;
  }

  .v-calendar-head,
  .v-calendar-canvas {
    display: grid;
    grid-template-columns: var(--calendar-gutter) repeat(
        var(--calendar-columns),
        minmax(var(--vectis-control-size-calendar-day-min), 1fr)
      );
    /*
     * The tracks have a floor, so on a narrow screen they add up to more than the box and
     * the calendar scrolls sideways. Without this the BOX would stay the width of the
     * scroller while the tracks spilled out of it: the sticky day names would paint their
     * background only as far as the original width, and the columns would run out from
     * under them halfway across. `min-content` on a grid is the sum of its track minimums,
     * which is exactly the width wanted here.
     */
    min-inline-size: min-content;
  }

  /*
   * THE STACKING ORDER OF THE WHOLE GRID, in one place because it is decided in four:
   *
   *   1  .v-calendar-block          an event card
   *   2  .v-calendar-now            the current-time line, over every card
   *   3  [data-dragging] / [data-grabbed]   a card being moved, over the line
   *   4  .v-calendar-head           the sticky day names, over everything
   *
   * Neither `.v-calendar-grid` nor `.v-calendar-columns` establishes a stacking context —
   * both are `relative` with no `z-index` — so all four compete at the root, and any TIE is
   * broken by document order. That is what put the current-time line over the header while
   * both sat at 2: the line is further down the template. The header has to sit above the
   * dragged card as well, which is why it is 4 and not 3.
   */
  .v-calendar-head {
    position: sticky;
    inset-block-start: 0;
    z-index: 4;
    background: var(--vectis-color-surface);
    border-block-end: 1px solid var(--vectis-color-border);
  }

  .v-calendar-head-gutter {
    /* The corner above the hour labels. It is empty, and it is here so the day names line
       up with their columns rather than starting at the edge of the box. */
    border-inline-end: 1px solid var(--vectis-color-border);
  }

  .v-calendar-head-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--vectis-space-1);
    padding-block: var(--vectis-space-2);
    padding-inline: var(--vectis-space-1);
  }

  .v-calendar-head-weekday {
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-overline-size);
    font-weight: var(--vectis-text-overline-weight);
    letter-spacing: var(--vectis-text-overline-tracking);
    text-transform: uppercase;
  }

  .v-calendar-head-number {
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--vectis-control-height-sm);
    block-size: var(--vectis-control-height-sm);
    border-radius: var(--vectis-radius-pill);
    font-size: var(--vectis-text-body-lg-size);
  }

  /* Today is marked on the number alone, the way a calendar marks a date rather than a
     column. Semibold here is state emphasis, not a type role. */
  .v-calendar-head-day[data-today] .v-calendar-head-number {
    background: var(--vectis-color-accent);
    color: var(--vectis-color-text-on-accent);
    font-weight: var(--vectis-font-weight-semibold);
  }

  .v-calendar-allday-label {
    display: flex;
    align-items: start;
    justify-content: end;
    padding-block-start: var(--vectis-space-1);
    padding-inline-end: var(--vectis-space-2);
    border-block-start: 1px solid var(--vectis-color-border);
    border-inline-end: 1px solid var(--vectis-color-border);
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
  }

  .v-calendar-allday {
    /*
     * The band's two axes are DISCRETE — a day, and a row — where the time grid's vertical
     * axis is continuous. That is why the bars are placed with real grid lines here and
     * with fractions there: forcing one mechanism onto both would cost a translation in
     * each direction and buy nothing.
     */
    display: grid;
    grid-column: 2 / -1;
    grid-template-columns: repeat(
      var(--calendar-columns),
      minmax(var(--vectis-control-size-calendar-day-min), 1fr)
    );
    grid-template-rows: repeat(
      var(--calendar-lanes),
      var(--vectis-control-size-calendar-allday-lane)
    );
    gap: 1px;
    overflow-y: auto;
    max-block-size: var(--vectis-control-size-calendar-allday-max);
    padding-block: var(--vectis-space-1);
    /*
     * No inline padding, deliberately. The band's tracks have to line up with the canvas's
     * exactly, because dragging a bar reads the pointer against the CANVAS geometry — the two
     * boxes span the same grid columns, so one measurement serves both. A few pixels of
     * padding here would put the last column out by that much, and a bar dropped on the right
     * edge would land a day early.
     */
    border-block-start: 1px solid var(--vectis-color-border);
  }

  .v-calendar-bar {
    grid-column: calc(var(--event-day) + 1) / span var(--event-span);
    grid-row: calc(var(--event-lane) + 1);
    min-inline-size: 0;
  }

  .v-calendar-hours {
    display: grid;
    grid-auto-rows: var(--calendar-hour);
    border-inline-end: 1px solid var(--vectis-color-border);
  }

  /*
   * The label names the hour its row BEGINS at, and it is drawn ON that rule rather than
   * under it: `align-self: start` shrinks the span from its 4rem row down to its one line,
   * and the negative margin then straddles it across the rule above.
   */
  .v-calendar-hour {
    position: relative;
    align-self: start;
    margin-block-start: calc(-1 * var(--calendar-hour-lift));
    padding-inline-end: var(--vectis-space-2);
    color: var(--vectis-color-text-muted);
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
    text-align: end;
  }

  /* The rule carried a little way back into the gutter, so the eye joins the label to the
     line it names. A border and not a background: Windows forced-colors flattens a
     background to Canvas and the tick would vanish, where a border keeps a colour — the
     argument VSeparator and the icon registry both make. */
  .v-calendar-hour::before {
    content: '';
    position: absolute;
    inset-block-start: var(--calendar-hour-lift);
    inset-inline-end: 0;
    inline-size: var(--vectis-control-size-calendar-tick);
    border-block-start: 1px solid var(--vectis-color-border);
  }

  /*
   * The first hour has no rule of its own: the sticky header already draws a border along
   * that edge, and a second one under it reads as a thick smudge. Its label goes with it,
   * since half of it would sit above the top of the canvas anyway — the cost you accepted,
   * paid in one label a reader can work out from the one below.
   *
   * `visibility` carries the tick away too, being inherited, so the pseudo-element needs no
   * rule of its own here.
   *
   * TRAP — HIDDEN and not removed. The span has to go on occupying its grid row: `display:
   * none` would take the row with it and shift every hour below up by one.
   */
  .v-calendar-hour:first-child {
    visibility: hidden;
  }

  .v-calendar-row:first-child .v-calendar-cell {
    border-block-start: none;
  }

  .v-calendar-columns {
    /* The containing block every card is placed against. The rows below are `display:
       contents`, so the cells themselves are this grid's items. */
    position: relative;
    display: grid;
    grid-column: 2 / -1;
    /*
     * The same track recipe as the canvas above, deliberately restated rather than borrowed
     * with `subgrid`. This box spans exactly the canvas columns it repeats, and both sides
     * divide the same width by the same rule, so the two resolve identically — which makes
     * subgrid a second mechanism buying nothing, the conclusion the library's own audit of
     * it reached.
     */
    grid-template-columns: repeat(
      var(--calendar-columns),
      minmax(var(--vectis-control-size-calendar-day-min), 1fr)
    );
    grid-auto-rows: var(--calendar-hour);
  }

  /*
   * The strip that lights up when a drag is resting against an edge, counting down to turn
   * the page. It is what stops the paging being a surprise.
   *
   * Drawn INSIDE the columns box rather than on the scroller, because a scroller's absolutely
   * positioned child is placed against its content and scrolls away with it — here the box is
   * as tall as the whole day, so the strip is visible wherever the reader happens to be. An
   * absolutely positioned pseudo-element is not a grid item, so it disturbs no column.
   *
   * Its width is `--vectis-control-size-calendar-edge`, whose twin is `EDGE_BAND` in
   * `edgeStep.ts` — the JavaScript that decides where the countdown actually starts. Neither
   * may move without the other.
   */
  .v-calendar-columns[data-edge]::after {
    content: '';
    position: absolute;
    inset-block: 0;
    inline-size: var(--vectis-control-size-calendar-edge);
    background: var(--vectis-color-accent-surface);
    z-index: 2;
    pointer-events: none;
  }

  .v-calendar-columns[data-edge='start']::after {
    inset-inline-start: 0;
  }

  .v-calendar-columns[data-edge='end']::after {
    inset-inline-end: 0;
  }

  .v-calendar-row {
    /* The row exists for the accessibility tree and must not exist for the layout: a real
       box here would make the cells its children instead of the grid's, and every column
       would collapse. */
    display: contents;
  }

  .v-calendar-cell {
    border-block-start: 1px solid var(--vectis-color-border);
    border-inline-start: 1px solid var(--vectis-color-border);
    cursor: pointer;
  }

  .v-calendar-cell:first-child {
    border-inline-start: none;
  }

  .v-calendar-cell:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    /* Drawn inwards: the grid is a scrolling box, and an outward ring on a cell at the edge
       would be cropped by it. */
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  .v-calendar-cell[data-today] {
    background: var(--vectis-color-accent-surface);
  }

  /*
   * A card is positioned against the whole columns box, not against its cell — which is why
   * the horizontal formula carries the day index. Being a child of the cell is what keeps
   * it in the accessibility tree in the right place; being placed against the grid is what
   * lets it be any length at all.
   */
  /*
   * TRAP — the height is the event's own length and NOTHING ELSE. There used to be a `max()`
   * against a floor token here, and it is what made a quarter of an hour spill over the slot
   * below it.
   *
   * The floor it was providing is already applied where it belongs: `timedSegments` stretches
   * every segment to at least `slotDuration` BEFORE the overlap packing sees it, so what is
   * drawn and what the packing believes are the same box. A second floor in CSS could only
   * ever disagree with the first — the packing cannot see a stylesheet — which is exactly how
   * two cards came to be laid out side by side and then drawn on top of each other.
   *
   * So a card is never taller than its slot, whatever `slotDuration` is set to. Making the
   * text fit inside a slot that short is the stylesheet's problem, and VCalendarEvent solves
   * it by asking how tall the card actually came out.
   */
  .v-calendar-block {
    position: absolute;
    inset-block-start: calc(var(--event-start) * 100%);
    block-size: calc((var(--event-end) - var(--event-start)) * 100%);
    inset-inline-start: calc(
      (var(--event-day) + var(--event-column) / var(--event-columns)) / var(--calendar-columns) *
        100%
    );
    inline-size: calc(
      var(--event-span) / var(--event-columns) / var(--calendar-columns) * 100% - 2px
    );
    z-index: 1;
  }

  /*
   * The current-time line, placed the same way a card is — against the whole columns box,
   * so its formula carries the day index too. It is `aria-hidden`: it is a second rendering
   * of something the cell labels and the day marked as today already say, and announcing
   * "current time" from the middle of a grid would interrupt without informing.
   */
  .v-calendar-now {
    position: absolute;
    inset-block-start: calc(var(--calendar-now) * 100%);
    inset-inline-start: calc(var(--event-day) / var(--calendar-columns) * 100%);
    inline-size: calc(100% / var(--calendar-columns));
    border-block-start: 1px solid var(--vectis-color-danger);
    /* Above the cards: it is the one thing that must stay readable over a full day. */
    z-index: 2;
    pointer-events: none;
  }

  .v-calendar-now::before {
    content: '';
    position: absolute;
    inset-inline-start: 0;
    inline-size: var(--vectis-control-size-calendar-now-dot);
    block-size: var(--vectis-control-size-calendar-now-dot);
    /* Half its own size upwards and backwards, so the dot is centred ON the line's start
       rather than hanging below it. */
    margin-block-start: calc(var(--vectis-control-size-calendar-now-dot) / -2);
    margin-inline-start: calc(var(--vectis-control-size-calendar-now-dot) / -2);
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-danger);
  }
}
</style>
