<script setup lang="ts" generic="E extends CalendarEvent">
// @a11y @keyboard @core
/**
 * The time grid: a column per day on show, an hour per row, the events drawn over it.
 * Internal to VCalendar, whose documentation covers it. It computes nothing about dates or
 * overlaps — it is handed the days and the already-placed segments and turns them into boxes.
 *
 * WHY 168 REAL CELLS rather than one repeating gradient. A background is forced to `Canvas`
 * under Windows forced-colors and the ruling would vanish, where a border is forced to
 * `CanvasText` and survives (the VSeparator argument); and the ARIA grid pattern needs real
 * cells to move focus between, which is also what makes the scrolling region Tab-reachable.
 *
 * WHY THE CARDS SIT INSIDE THE CELLS, when one overlay layer would be simpler CSS. An
 * absolutely positioned element leaves its parent's box for LAYOUT while staying inside it
 * in the document, hence in the accessibility tree. In an overlay they would sit outside the
 * grid entirely, breaking the reading order and failing `aria-required-children`.
 *
 * The day names are NOT column headers: they stay in view above the scrolling area, which
 * puts them outside the grid. Every cell names its own day in full instead ("Wednesday 10
 * June, 09:00"), so nothing is lost to a reader who never sees that row.
 *
 * The drag and the keyboard grab are `gesture.ts`'s. What stays here is what a moment of the
 * day means: the point under the pointer turned into a slot, and the four kinds of gesture a
 * time grid offers.
 */
import { computed, onBeforeUnmount, ref, useId } from 'vue'

import { formatDateDisplay } from '../../utils/date'
import { clamp } from '../../utils/number'
import { formatTimeDisplay } from '../../utils/time'

import { useMessages } from '../../i18n/state'

import VCalendarEvent from './VCalendarEvent.vue'
import { EDGE_BAND } from './edgeStep'
import {
  gridGeometryOf,
  useCalendarGesture,
  type GestureBase,
  type GestureInit,
  type GrabStep,
} from './gesture'
import { calendarIntent } from './keyboard'
import {
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
  blockEdgeAt,
  floorToSlot,
  fractionOf,
  isAllDayEvent,
  minutesAt,
  moveEventToDay,
  packAllDay,
  packDayColumn,
  pointToCell,
  sameTimes,
  snapToSlot,
  spansMidnight,
  timeOf,
  timedSegments,
  timesOf,
  type AllDaySpan,
  type PlacedSegment,
  type SegmentPart,
  type TimeWindow,
} from './layout'
import { drawnSlot, moveTimedEvent, resizeTimedEvent, roundToSlot } from './timeGrid'
import type {
  ActivatedCell,
  CalendarEvent,
  CalendarEventId,
  CalendarEventSlotProps,
  CalendarEventTimes,
  CalendarFormat,
} from './types'

/** Where the keyboard focus is in the grid, as a day and a moment in it. */
export interface FocusedCell {
  iso: string
  minutes: number
}

export interface CalendarTimeGridProps<T> {
  days: string[]
  events: T[]
  timeWindow: TimeWindow
  slotDuration: number
  locale: string
  format: CalendarFormat
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
  /** Whether the whole calendar is frozen, which also takes its cards out of the tab order. */
  disabled: boolean
  /** Whether an empty stretch of a day can be drawn out, and reported as a new event's times. */
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

const props = defineProps<CalendarTimeGridProps<E>>()

const emit = defineEmits<{
  /** An empty part of the grid was activated, at this day and this moment. */
  'cell-activate': [cell: ActivatedCell]
  /** A card was clicked or activated. */
  'event-activate': [event: E]
  /** An event was dropped somewhere else, or stretched to a new end. */
  'event-drop': [id: CalendarEventId, times: CalendarEventTimes, kind: 'move' | 'resize']
  /** An empty stretch of a day was drawn out, and is offered as a new event's times. */
  'slot-create': [times: CalendarEventTimes]
  /** Something happened that a reader who cannot see the grid needs told. */
  announce: [message: string]
  /** A page key asked for the previous or next period, which only the calendar can do. */
  step: [delta: -1 | 1]
}>()

/** Which cell holds the tab stop. The calendar owns it, so the toolbar can move it too. */
const focused = defineModel<FocusedCell>('focused', { required: true })

defineSlots<{
  event?(props: CalendarEventSlotProps<E>): unknown
  'day-header'?(props: { iso: string; weekday: string; dayText: string; today: boolean }): unknown
  'all-day-label'?(): unknown
}>()

const m = useMessages()
const uid = useId()

/** The hour each row stands for, as minutes since midnight. */
const hours = computed(() => {
  const rows: number[] = []
  const { start, end } = props.timeWindow
  for (let at = start; at < end; at += MINUTES_PER_HOUR) rows.push(at)
  return rows
})

/**
 * The id a stretch of empty grid carries while it is being drawn out. It never leaves this
 * component: on release the calendar is handed the times alone, and the card is gone.
 */
const DRAFT_ID = '__vectis-calendar-draft__'

/**
 * A gesture under way, whether it came from a pointer or from the keyboard.
 *
 * `move-days` is the whole-day one: an all-day bar dragged along the band above the grid. It
 * is a kind of its own rather than a flag on `move` because the two answer different
 * questions — one asks what MOMENT the pointer is over, the other only what day — and because
 * a bar spanning three days must keep spanning three when it lands.
 */
interface Gesture extends GestureBase {
  kind: 'move' | 'move-days' | 'resize' | 'create'
  /**
   * How far the arrows have taken a KEYBOARD grab from its origin: days along the days on
   * show, and minutes moved (the start) and stretched (the end). Every step is worked out from
   * the origin with these, as every pointer frame is, and never from the step before it: held
   * against the end of the day a step is written 23:59, and building on that would take a
   * minute off the event at each press.
   */
  keyDays?: number
  keyStart?: number
  keyEnd?: number
  /**
   * How far after the event's start the pointer took hold, in minutes, so the card does not
   * jump under it. Counted across midnight: an event running from 22:00 taken by its morning
   * card at 01:00 is held three hours in.
   */
  grabOffset: number
  grabColumn: number
  /**
   * The share of its column each of the dragged event's boxes had when the gesture began, filed
   * by which piece of the event it was — and nothing else.
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
   * At most one of the two is ever set — a timed event is one or two segments, an all-day one a
   * bar.
   */
  ghostColumns: Partial<
    Record<SegmentPart, Pick<PlacedSegment, 'column' | 'span' | 'columns'>>
  > | null
  ghostLane: number | null
}

const rootEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLElement | null>(null)
const columnsEl = ref<HTMLElement | null>(null)

const {
  gesture,
  ghostEvent,
  withPreview,
  edgeCue,
  isRtl,
  start,
  reapply,
  endLastGesture,
  consumeDrag,
  onPointermove,
  onPointerup,
  onPointercancel,
  onPointerleave,
  onFocusout,
  onCardKeydown,
  focusCell,
  idOfCard,
  cardState,
} = useCalendarGesture<E, Gesture>({
  events: () => props.events,
  eventOf: (id): E | undefined => eventOf(id),
  rootEl,
  // The SCROLLER, not the columns box: the all-day band sits in the sticky header, and this is
  // the only element that contains both it and the canvas.
  captureEl: rootEl,
  measureEl: columnsEl,
  columns: () => props.days.length,
  editable: () => props.editable,
  hintId: () => props.hintId,
  slotMinutes: () => props.slotDuration,
  edgeStepDelay: () => props.edgeStepDelay,
  layout: () => props.days,
  applyPoint,
  // Scrolling is measured against the SCROLLER, which is what actually moves; paging, in the
  // composable, against the columns the days occupy.
  onEdges: (state, scroller) =>
    setScrollSpeed(
      props.autoScroll && scroller ? blockEdgeAt(state.lastY, scroller, EDGE_BAND) : 0,
    ),
  onRelease: stopScrolling,
  onLetGo: (state) => {
    if (state.kind !== 'create') return false
    // A press that never travelled drew nothing: its click reports the cell instead.
    if (state.moved) emit('slot-create', state.preview)
    return true
  },
  onDrop: (state) =>
    emit('event-drop', state.id, state.preview, state.kind === 'resize' ? 'resize' : 'move'),
  // An all-day bar is taken by whole days, the pointer's own gesture on the band.
  grab: (item) =>
    props.editable
      ? initFor({
          kind: isAllDayEvent(item) ? 'move-days' : 'move',
          id: item.id,
          origin: timesOf(item),
          pointerId: null,
          originX: 0,
          originY: 0,
          grabOffset: 0,
          grabColumn: 0,
        })
      : null,
  onGrabStep,
  step: (delta) => emit('step', delta),
  announce: (message) => emit('announce', message),
})

/**
 * Where the echo goes, worked out afresh on every render rather than remembered.
 *
 * The two helpers are the SAME ones every other box goes through, run on a list of one — so
 * the echo answers to the days on show exactly as an ordinary event does, and in particular
 * is dropped when its day is not among them. That is what makes it leave with its week when
 * a drag held at an edge pages the view, rather than squatting a column of the new week.
 * It is also what keeps the two kinds mutually exclusive by construction rather than by
 * chance: `timedSegments` passes over an all-day event and `packAllDay` over a timed one.
 *
 * Only the packing captured at the start of the gesture is put back on top — see
 * `ghostColumns` above for why that one part must NOT be recomputed. It is matched by PIECE
 * rather than by position, since paging can leave the morning of an overnight echo on show
 * without its evening.
 */
const NO_GHOSTS: readonly PlacedSegment[] = Object.freeze([])

/*
 * TRAP — the "no echo" answer is ONE shared array. A bar dragged along the band recomputes this
 * on every slot; a fresh `[]` each time is a new value, which would wake `placed` and re-pack
 * every column for a gesture that never touches them.
 */
const ghostSegments = computed<readonly PlacedSegment[]>(() => {
  const state = gesture.value
  const event = ghostEvent.value
  const packing = state?.ghostColumns
  if (!event || !packing) return NO_GHOSTS
  return timedSegments([event], props.days, props.timeWindow, props.slotDuration).flatMap(
    (segment) => {
      const columns = packing[segment.part]
      return columns ? [{ ...segment, ...columns }] : []
    },
  )
})

const ghostSpan = computed<AllDaySpan | null>(() => {
  const state = gesture.value
  const event = ghostEvent.value
  if (!event || state?.ghostLane == null) return null
  const [span] = packAllDay([event], props.days)
  return span ? { ...span, lane: state.ghostLane } : null
})

/*
 * The model split in two, once per change to it: the timed events the columns draw, and the
 * all-day ones the band above them draws. The split is what lets a gesture rebuild only its
 * own half — see `drawnTimed`.
 */
const timedEvents = computed(() => props.events.filter((event) => !isAllDayEvent(event)))
const allDayEvents = computed(() => props.events.filter((event) => isAllDayEvent(event)))

/**
 * The timed events as the columns should currently DRAW them — which is the model, with the
 * one being gestured at moved to wherever it is now.
 *
 * Running the preview through the same packing as everything else is what makes the other
 * events reflow live around the one being dragged, with no special case anywhere: the layout
 * does not know a gesture is happening, only that an event is somewhere.
 *
 * TRAP — the half a gesture belongs to is decided by its KIND and never by looking at the
 * preview. `move-days` is the only gesture that starts on the band, and the three others only
 * start on a timed card or an empty cell (both press handlers and the keyboard grab refuse an
 * all-day event), so the two lists below can each return their untouched half as the SAME
 * array. A computed whose value keeps its identity wakes nothing downstream: that is the whole
 * of why a timed drag does not re-pack the band, and a bar dragged along the band does not
 * re-pack seven columns. Reading `state.preview` in the wrong half would silently undo it.
 */
const drawnTimed = computed<E[]>(() => {
  const state = gesture.value
  if (!state || state.kind === 'move-days') return timedEvents.value

  if (state.kind === 'create') {
    // Nothing is drawn until the press travels, so a plain click on a cell flashes no card.
    if (!state.moved) return timedEvents.value
    const draft = {
      id: DRAFT_ID,
      title: m.value.calendar.untitled,
      ...state.preview,
      // A draft carries exactly the fields `CalendarEvent` declares, and a consumer's own
      // type may require more. It exists while the pointer is down and never reaches the
      // model, which is what makes the cast safe.
    } as unknown as E
    return [...timedEvents.value, draft]
  }

  return withPreview(timedEvents.value)
})

/** The all-day bars as the band should currently draw them — see `drawnTimed`. */
const drawnAllDay = computed<E[]>(() =>
  gesture.value?.kind === 'move-days' ? withPreview(allDayEvents.value) : allDayEvents.value,
)

const timedById = computed(
  () => new Map<CalendarEventId, E>(drawnTimed.value.map((event) => [event.id, event])),
)
const allDayById = computed(
  () => new Map<CalendarEventId, E>(drawnAllDay.value.map((event) => [event.id, event])),
)

/** Any event on show, as it is currently drawn. For the handlers; the template reads a half. */
const eventOf = (id: CalendarEventId): E | undefined =>
  timedById.value.get(id) ?? allDayById.value.get(id)

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
    ghost ? drawnAllDay.value.filter((event) => event.id !== ghost.id) : drawnAllDay.value,
    props.days,
  )
  return ghost ? [...spans, ghost] : spans
})
const allDayLanes = computed(() =>
  allDay.value.reduce((most, span) => Math.max(most, span.lane + 1), 0),
)

/** The row a moment of the window is drawn in, held inside the grid. */
const rowOf = (minutes: number) =>
  clamp(
    Math.floor((minutes - props.timeWindow.start) / MINUTES_PER_HOUR),
    0,
    hours.value.length - 1,
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
  if (props.now < props.timeWindow.start || props.now > props.timeWindow.end) return null
  return {
    day: dayIndex,
    // Clamped so the line at the very end of the window still has a cell to live in.
    row: rowOf(props.now),
    fraction: fractionOf(props.now, props.timeWindow),
  }
})

/**
 * The placed boxes, day by day. `packDayColumn` works on one column at a time, so the
 * segments are split before it sees them: events on different days never compete for width,
 * and packing them together would make a busy Monday narrow a quiet Tuesday.
 */
const placed = computed(() => {
  const segments = timedSegments(drawnTimed.value, props.days, props.timeWindow, props.slotDuration)
  const ghosts = ghostSegments.value
  // Read off the echo's own boxes, never off `ghostEvent`, which changes with every slot of a
  // bar's drag and would wake this for the band's gesture too.
  const ghostId = ghosts[0]?.id

  const byDay = new Map<number, typeof segments>()
  for (const segment of segments) {
    /*
     * The echo is held OUT of the packing and put back below with the width and column it had
     * when the drag began. Packed with the rest, it would share its column with the card
     * being dragged the moment the two overlapped — so the card under the pointer would halve
     * in width and then grow back as it moved away, which reads as the drag going wrong.
     */
    if (ghostId !== undefined && segment.id === ghostId) continue
    const list = byDay.get(segment.dayIndex)
    if (list) list.push(segment)
    else byDay.set(segment.dayIndex, [segment])
  }

  const real = [...byDay.values()].flatMap((list) => packDayColumn(list))
  return ghosts.length > 0 ? [...real, ...ghosts] : real
})

const cellId = (iso: string, minutes: number) => `${uid}-c-${iso}-${minutes}`

/*
 * Every label the grid writes, derived once per day and once per hour rather than once per
 * CELL — the shape `byCell` below uses, for the same reason.
 *
 * The grid renders `hours × days` cells, 24 × 7 by default, and a drag re-renders the whole
 * template every time it carries its event into another slot. Read straight from
 * `formatDateDisplay` in the template that would be 168 `cellLabel` calls per such frame, each
 * doing a `parseISO`, a `JSON.stringify` for the formatter cache key and two `Intl` formats —
 * none of which depends on the pointer. These two maps, of 7 and 24 entries, recompute when the
 * locale, the days or the window change and never because a card moved.
 *
 * Both are keyed by exactly what the template walks, `days` and `hours`, so every lookup is
 * a hit and none of them needs a formatting fallback.
 */
const dayLabels = computed(() => {
  const map = new Map<string, { short: string; number: string; full: string }>()
  for (const iso of props.days) {
    map.set(iso, {
      short: formatDateDisplay(iso, props.locale, { weekday: 'short' }),
      number: formatDateDisplay(iso, props.locale, { day: 'numeric' }),
      full: formatDateDisplay(iso, props.locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    })
  }
  return map
})

const hourLabels = computed(() => {
  const map = new Map<number, string>()
  for (const minutes of hours.value)
    map.set(minutes, formatTimeDisplay(timeOf(minutes), props.locale, props.format))
  return map
})

const hourLabel = (minutes: number) => hourLabels.value.get(minutes) ?? ''
const dayName = (iso: string) => dayLabels.value.get(iso)?.short ?? ''
const dayNumber = (iso: string) => dayLabels.value.get(iso)?.number ?? ''

/**
 * The cells, row by row, with everything about them that no gesture can change: the id the
 * focus is moved by, the name a reader hears, and the number `byCell` files cards under.
 *
 * The labels' argument carried one step further. Written in the template, each of the 168
 * cells built its id and its label on every render, and a `${day}:${row}` string twice more,
 * once to look its cards up and once to ask whether the current-time line was in it. Here that
 * is paid when the days, the window or the locale change, and a render only reads it.
 */
const gridRows = computed(() => {
  const columns = props.days.length
  return hours.value.map((minutes, row) => ({
    minutes,
    cells: props.days.map((iso, day) => ({
      iso,
      day,
      row,
      key: row * columns + day,
      id: cellId(iso, minutes),
      // The day in full, then the hour.
      label: `${dayLabels.value.get(iso)?.full ?? iso}, ${hourLabel(minutes)}`,
    })),
  }))
})

/**
 * An event's times, written out for the reader. The time zone is appended as an annotation
 * and never applied: the card's place in the grid comes from the local times given, which
 * is the whole of the design system's position on the matter.
 *
 * Memoized by the three fields the text is made of, because `byCell` asks for every card each
 * time a drag changes slot and all but one of them still say what they said before: two `Intl`
 * formats per card otherwise. The cache lives INSIDE the computed, so a change of locale or
 * hour format throws it away whole.
 *
 * TRAP — what a dependant reads has to be this computed, never a cache held beside it. A hit
 * reads no prop, so a computed that only ever hit would track neither the locale nor the hour
 * format, and would go on printing the old ones after either changed.
 */
const timeTextOf = computed(() => {
  const { locale, format } = props
  const cache = new Map<string, string>()
  return (event: CalendarEvent): string => {
    const key = `${event.startTime}|${event.endTime}|${event.timezone ?? ''}`
    let text = cache.get(key)
    if (text === undefined) {
      const start = formatTimeDisplay(event.startTime, locale, format)
      const end = formatTimeDisplay(event.endTime, locale, format)
      const range = `${start} – ${end}`
      text = event.timezone ? `${range} (${event.timezone})` : range
      cache.set(key, text)
    }
    return text
  }
})

/** One card as the template draws it, with its event and its box already worked out. */
interface Card {
  segment: PlacedSegment
  event: E
  timeText: string
  style: Record<string, string>
}

/**
 * The cards, filed under the cell their start falls in. Grouping once here is what keeps
 * the template from asking every cell to search the whole list — a hundred and sixty-eight
 * searches per render otherwise.
 *
 * Each card also carries what the template would otherwise work out per card per render: its
 * event, its time text and its style object. A render the layout did not cause — the edge cue
 * lighting up, the pointer leaving the calendar, the tab stop moving — rebuilds none of it.
 */
const byCell = computed(() => {
  const map = new Map<number, Card[]>()
  const columns = props.days.length
  const events = timedById.value
  const textOf = timeTextOf.value
  for (const segment of placed.value) {
    // A placement always has an event behind it. Skipping rather than asserting turns a
    // mismatch between the two into one missing card instead of a grid that fails to render.
    const event = events.get(segment.id)
    if (!event) continue
    const key = rowOf(segment.start) * columns + segment.dayIndex
    const card: Card = {
      segment,
      event,
      timeText: textOf(event),
      style: {
        '--calendar-day-index': String(segment.dayIndex),
        '--calendar-block-start-fraction': String(fractionOf(segment.start, props.timeWindow)),
        '--calendar-block-end-fraction': String(fractionOf(segment.end, props.timeWindow)),
        '--calendar-block-column': String(segment.column),
        '--calendar-block-span': String(segment.span),
        '--calendar-block-columns': String(segment.columns),
      },
    }
    const list = map.get(key)
    if (list) list.push(card)
    else map.set(key, [card])
  }
  return map
})

/** An hour with nothing in it, shared rather than allocated per empty cell. */
const NO_CARDS: readonly Card[] = Object.freeze([])
const cardsAt = (key: number) => byCell.value.get(key) ?? NO_CARDS

const isFocused = (iso: string, minutes: number) =>
  focused.value.iso === iso && focused.value.minutes === minutes

/**
 * Which cell holds the tab stop: the focused one, rounded to its row — or, when that cell is
 * not on screen (after a view change, or before anything has been focused at all), the first
 * cell. Without the fallback no cell would carry `tabindex="0"`, the grid would drop out of the
 * tab order, and the scrolling region would have nothing reachable inside it, which is an
 * accessibility failure and not merely an inconvenience.
 */
const tabbable = computed<FocusedCell | null>(() => {
  const current = focused.value
  const { start, end } = props.timeWindow
  if (props.days.includes(current.iso)) {
    const rounded =
      Math.floor((current.minutes - start) / MINUTES_PER_HOUR) * MINUTES_PER_HOUR + start
    if (rounded >= start && rounded < end) return { iso: current.iso, minutes: rounded }
  }
  const iso = props.days[0]
  return iso ? { iso, minutes: start } : null
})

const isTabStop = (iso: string, minutes: number) =>
  tabbable.value?.iso === iso && tabbable.value.minutes === minutes

function moveFocusTo(iso: string, minutes: number) {
  focused.value = { iso, minutes }
  // @a11y — the model is what decides which cell is tabbable, so the DOM focus can only be
  // moved once the render that applied it has run.
  focusCell(cellId(iso, minutes), true)
}

/** A day, then a start and an end: where a reader is told an event now is. */
function timesText(times: CalendarEventTimes) {
  const start = formatTimeDisplay(times.startTime, props.locale, props.format)
  const end = formatTimeDisplay(times.endTime, props.locale, props.format)
  const day = formatDateDisplay(times.start, props.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return `${day}, ${start} – ${end}`
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

  const intent = calendarIntent(event, 'cell', props.slotDuration, isRtl())
  if (!intent) return

  const iso = cell.dataset.iso!
  const minutes = Number(cell.dataset.minutes)
  const index = props.days.indexOf(iso)

  if (intent.kind === 'moveFocus') {
    const day = props.days[clamp(index + intent.days, 0, props.days.length - 1)]!
    const at = clamp(
      minutes + intent.minutes,
      props.timeWindow.start,
      props.timeWindow.end - MINUTES_PER_HOUR,
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

  /*
   * Enter reports the cell, `creatable` or not. That is the keyboard's route to a new event
   * (WCAG 2.1.1): the cell carries a day and an hour, and how long the event lasts is a question
   * for the consumer's own form, where the pointer answers it by how far it was drawn.
   */
  // A time grid has no day to open; Shift and Enter report the cell, as Enter does.
  if (intent.kind === 'activate' || intent.kind === 'openDay') {
    event.preventDefault()
    emit('cell-activate', { date: iso, minutes })
  }
}

/**
 * A gesture's opening state, with the echo's shape read off the layout as it stands.
 *
 * TRAP — read BEFORE the gesture is set. Both are derived from the drawn events, which the
 * gesture immediately starts rewriting — a line later and they would already describe the
 * preview rather than the place it came from. Which of the two answers is also what says
 * whether this is a timed card or an all-day bar, and therefore which of the echo's two shapes
 * the gesture has to carry.
 */
function initFor(
  init: Omit<GestureInit<Gesture>, 'ghostColumns' | 'ghostLane'>,
): GestureInit<Gesture> {
  const segments = placed.value.filter((item) => item.id === init.id)
  const span = allDay.value.find((item) => item.id === init.id)
  return {
    ...init,
    ghostColumns:
      segments.length > 0
        ? Object.fromEntries(
            segments.map((segment) => [
              segment.part,
              { column: segment.column, span: segment.span, columns: segment.columns },
            ]),
          )
        : null,
    ghostLane: span ? span.lane : null,
  }
}

/** The slot under a point, read against the measured columns box. */
const pointAt = (x: number, y: number, rect: DOMRect, rtl: boolean) =>
  pointToCell({ x, y }, gridGeometryOf(rect, props.days.length, rtl), props.timeWindow, rtl)

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
  const rect = columnsEl.value?.getBoundingClientRect()
  if (!target || !rect) return
  const rtl = isRtl()
  const point = pointAt(event.clientX, event.clientY, rect, rtl)

  const card = target.closest<HTMLElement>('.v-calendar-event')
  if (card) {
    if (!props.editable) return
    const item = eventOf(idOfCard(card))
    if (!item || isAllDayEvent(item)) return

    const resizing = target.closest('[data-calendar-handle]') !== null
    // The morning card of an overnight event is held from the evening before, so the offset
    // carries the day between the two.
    const pressedMorning = spansMidnight(item) && props.days[point.columnIndex] === item.end
    start(
      initFor({
        kind: resizing ? 'resize' : 'move',
        id: item.id,
        origin: timesOf(item),
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        grabOffset: resizing
          ? 0
          : (pressedMorning ? MINUTES_PER_DAY : 0) +
            point.minutes -
            minutesAt(item.startTime, props.timeWindow.start),
        grabColumn: point.columnIndex,
      }),
      rtl,
    )
    return
  }

  if (!props.creatable || !target.closest('.v-calendar-cell')) return
  const iso = props.days[point.columnIndex]
  if (!iso) return

  /*
   * The pressed slot is where the drawing is anchored — rounded DOWN, never to the nearest,
   * because a press at 09:07 means "the nine o'clock slot" and not the quarter past. Nothing is
   * drawn and nothing is reported until the press travels: a press that stays still is a click,
   * and reports its cell like any other.
   */
  const from = floorToSlot(point.minutes, props.slotDuration)
  start(
    initFor({
      kind: 'create',
      id: DRAFT_ID,
      origin: {
        start: iso,
        end: iso,
        startTime: timeOf(from),
        endTime: timeOf(Math.min(from + props.slotDuration, props.timeWindow.end)),
      },
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      grabOffset: 0,
      grabColumn: point.columnIndex,
    }),
    rtl,
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
/**
 * The band's bars answer the same card table as the grid's cards. They sit in the sticky
 * header, outside the grid whose keydown the cards reach, so the band delegates on its own.
 */
function onBandKeydown(event: KeyboardEvent) {
  const card = (event.target as HTMLElement | null)?.closest<HTMLElement>('.v-calendar-event')
  if (card) onCardKeydown(event, card)
}

function onBandPointerdown(event: PointerEvent) {
  endLastGesture()
  if (gesture.value || !props.editable || event.button !== 0) return

  const card = (event.target as HTMLElement | null)?.closest<HTMLElement>('.v-calendar-event')
  const item = card ? eventOf(idOfCard(card)) : undefined
  const rect = columnsEl.value?.getBoundingClientRect()
  if (!item || !rect) return
  const rtl = isRtl()

  start(
    initFor({
      kind: 'move-days',
      id: item.id,
      origin: timesOf(item),
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      grabOffset: 0,
      grabColumn: pointAt(event.clientX, event.clientY, rect, rtl).columnIndex,
    }),
    rtl,
  )
}

/**
 * One arrow press on an all-day bar held by the keyboard: a whole day sideways along the days
 * on show, nothing else, since a bar has no hours to move through or to stretch.
 */
function onBarStep(state: Gesture, step: GrabStep, item: E): boolean {
  if (step.kind !== 'grabMove' || step.days === 0) return false
  const keyDays = (state.keyDays ?? 0) + step.days
  const base = props.days.indexOf(state.origin.start)
  const column = clamp(base + keyDays, Math.min(base, 0), props.days.length - 1)
  const next = column < 0 ? state.origin : moveEventToDay(state.origin, props.days[column]!)
  if (sameTimes(next, state.preview)) return false
  state.keyDays = keyDays
  state.preview = next
  emit('announce', m.value.calendar.movedTo(item.title, timesText(state.preview)))
  return true
}

/**
 * Works out where the dragged event now belongs, from wherever the pointer last was.
 *
 * It is separate from the handler because THREE things call it: the pointer moving, the view
 * paging out from under a still pointer, and the grid scrolling under one. The last two would
 * otherwise leave the card behind on a day or an hour that is no longer where the pointer is.
 */
function applyPoint(state: Gesture, rect: DOMRect) {
  const point = pointAt(state.lastX, state.lastY, rect, state.rtl)
  const crossMidnight = spansMidnight(state.origin)

  /*
   * The slot the pointer is over, reduced to the two numbers the preview is computed from. A bar
   * reads only the column and a drawn slot only the minute; a stretch reads the column too when
   * its event runs past midnight, whose end may sit on either of two days. A move's start is
   * rounded without being held inside the day, since an overnight event's may leave it.
   */
  const column =
    state.kind === 'create' || (state.kind === 'resize' && !crossMidnight) ? 0 : point.columnIndex
  const minutes =
    state.kind === 'move-days'
      ? 0
      : state.kind === 'move'
        ? roundToSlot(point.minutes - state.grabOffset, props.slotDuration)
        : state.kind === 'create'
          ? floorToSlot(point.minutes, props.slotDuration)
          : snapToSlot(point.minutes, props.slotDuration)
  if (isLastApplied(state, column, minutes)) return

  if (state.kind === 'create') {
    const anchor = minutesAt(state.origin.startTime, props.timeWindow.start)
    setPreview(
      state,
      drawnSlot(state.origin.start, anchor, minutes, props.slotDuration, props.timeWindow),
    )
    return
  }

  if (state.kind === 'resize') {
    const endDay = props.days[column] ?? state.origin.end
    setPreview(
      state,
      resizeTimedEvent(
        state.origin,
        endDay,
        minutes,
        props.slotDuration,
        props.timeWindow,
        crossMidnight,
      ),
    )
    return
  }

  if (state.kind === 'move-days') {
    /*
     * The target is the bar's START shifted by however many columns the pointer has crossed,
     * not the column the pointer is over: grab a Monday-to-Wednesday bar by its Tuesday and the
     * pointer stays on its Tuesday. The day is read out of the list of days on show — never from
     * date arithmetic on how many columns were crossed, which would count the days the calendar
     * is hiding and land the event on a Saturday nobody can see. A bar keeps its length in days.
     */
    const target = clamp(
      originColumn(state) + (column - state.grabColumn),
      0,
      props.days.length - 1,
    )
    const iso = props.days[target]
    if (iso) setPreview(state, moveEventToDay(state.origin, iso))
    return
  }

  /*
   * A timed card is placed from the column the pointer is over, and its start from the pointer
   * less the offset it was taken hold at. For an overnight event taken by its morning that start
   * lands on the day before the pointer's column, which `moveTimedEvent` works out.
   */
  const iso = props.days[column]
  if (!iso) return
  setPreview(state, moveTimedEvent(state.origin, iso, minutes, props.timeWindow, crossMidnight))
}

/**
 * The slot `applyPoint` last worked a preview out for.
 *
 * `pointermove` fires many times per slot, and so does the auto-scroll frame. Every one of
 * them that lands on the slot already shown returns here, before any date arithmetic. The
 * days, the window and the step are part of what the slot MEANS, so a change to any of them
 * (paging under a still pointer, most of all) reads as a new slot even at the same indices.
 * It is a plain variable rather than a field of the gesture: nothing renders it, and the
 * gesture's own identity is what says a new press has begun.
 */
let lastApplied: {
  state: Gesture
  days: readonly string[]
  timeWindow: TimeWindow
  step: number
  column: number
  minutes: number
} | null = null

function isLastApplied(state: Gesture, column: number, minutes: number): boolean {
  const last = lastApplied
  if (
    last?.state === state &&
    last.days === props.days &&
    last.timeWindow === props.timeWindow &&
    last.step === props.slotDuration &&
    last.column === column &&
    last.minutes === minutes
  ) {
    return true
  }
  lastApplied = {
    state,
    days: props.days,
    timeWindow: props.timeWindow,
    step: props.slotDuration,
    column,
    minutes,
  }
  return false
}

/**
 * Writes the preview only when it says something new.
 *
 * TRAP — the comparison is the whole point, not a nicety. The gesture is a deep ref, so any
 * assignment to `preview`, an equal object included, wakes the drawn events, the packing of
 * every column and a render of all 168 cells. Two positions inside one slot, or two slots that
 * clamp to the same times against the end of the window, must cost nothing.
 */
function setPreview(state: Gesture, next: CalendarEventTimes) {
  if (!sameTimes(state.preview, next)) state.preview = next
}

/**
 * Which column the bar being moved started in.
 *
 * The fallback is what makes the formula above general rather than a special case. The two
 * differ when a bar is grabbed by its middle, which is what keeps a three-day one from jumping.
 * And when the origin day is not on screen at all — a bar that began before this range, or one
 * whose view has been paged out from under the drag — falling back to the grab column makes the
 * offset zero, so the bar lands under the pointer instead of nowhere.
 */
function originColumn(state: Gesture): number {
  const index = props.days.indexOf(state.origin.start)
  return index === -1 ? state.grabColumn : index
}

/**
 * One arrow press on a card held by the keyboard.
 *
 * The arrows accumulate the way a reader expects, three presses of Down moving three slots, but
 * what accumulates is the DISTANCE (`keyDays`, `keyStart`, `keyEnd`) and the event is worked
 * out from its origin each time, as the pointer's is every frame. Applied to the preview instead,
 * a step held against the end of the day built on its 23:59 and the event came back shorter
 * and off the slot grid.
 */
function onGrabStep(state: Gesture, step: GrabStep, item: E): boolean {
  const { origin } = state
  if (state.kind === 'move-days') return onBarStep(state, step, item)
  // Whether the event may cross midnight is read off where it was taken from, as the pointer's is.
  const crossMidnight = spansMidnight(origin)
  let keyDays = state.keyDays ?? 0
  let keyStart = state.keyStart ?? 0
  let keyEnd = state.keyEnd ?? 0
  if (step.kind === 'grabResize') keyEnd += step.minutes
  else {
    keyDays += step.days
    keyStart += step.minutes
  }

  /*
   * Sideways is a step along the days ON SHOW, exactly as the pointer's is: date arithmetic
   * would count the days the calendar is hiding. An overnight event may have been taken by its
   * morning card with its start on a day off show (index -1): it can then go right, never
   * further left than where it already is.
   */
  const base = props.days.indexOf(origin.start)
  const column = clamp(base + keyDays, Math.min(base, 0), props.days.length - 1)
  const day = column < 0 || keyDays === 0 ? origin.start : props.days[column]!
  const moved = moveTimedEvent(
    origin,
    day,
    minutesAt(origin.startTime, props.timeWindow.start) + keyStart,
    props.timeWindow,
    crossMidnight,
  )
  const next =
    keyEnd === 0
      ? moved
      : resizeTimedEvent(
          moved,
          moved.end,
          minutesAt(moved.endTime, props.timeWindow.end) + keyEnd,
          props.slotDuration,
          props.timeWindow,
          crossMidnight,
        )

  // Held against an edge, the press goes nowhere: nothing to announce, nothing to drop, and
  // nothing kept either, so the next press the other way moves at once.
  if (sameTimes(next, state.preview)) return false
  state.keyDays = keyDays
  state.keyStart = keyStart
  state.keyEnd = keyEnd
  state.preview = next
  emit('announce', m.value.calendar.movedTo(item.title, timesText(state.preview)))
  return true
}

/**
 * How many pixels a frame the grid scrolls at full tilt.
 *
 * At sixty frames a second that is roughly eight hundred a second, which crosses a whole
 * twenty-four-hour day in about two — fast enough to be worth doing, slow enough to stop on.
 */
const AUTO_SCROLL_SPEED = 14

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
  reapply(state)
  scrollFrame = requestAnimationFrame(scrollStep)
}

function stopScrolling() {
  if (scrollFrame !== null) cancelAnimationFrame(scrollFrame)
  scrollFrame = null
  scrollSpeed = 0
}

onBeforeUnmount(stopScrolling)

function onCardClick(id: CalendarEventId) {
  // `pointerup` fires before `click`, so letting go at the end of a drag would ALSO open the
  // event — the consumer's editor over every card the reader had just moved.
  if (consumeDrag()) return
  const item = eventOf(id)
  if (item && id !== DRAFT_ID) emit('event-activate', item)
}

/**
 * A click on an empty part of a day, reported as the cell it landed in.
 *
 * A click that ENDS a drag is not one: drawing a slot out, or dropping a card, lets go over a
 * cell, and the browser follows with a click there. Reporting it would hand the consumer a
 * cell nobody chose, on top of the slot or the move they did.
 */
function onGridClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('.v-calendar-event')) return
  if (consumeDrag()) return
  const cell = target?.closest<HTMLElement>('.v-calendar-cell')
  if (!cell) return
  emit('cell-activate', { date: cell.dataset.iso!, minutes: Number(cell.dataset.minutes) })
}

/**
 * The cursor a gesture holds for as long as it lasts, whatever the pointer passes over.
 *
 * A captured pointer's cursor is resolved against the capture target, the scroller, and a
 * dragged card takes no pointer events at all, so the resize strip's own `ns-resize` is lost the
 * instant the press begins. Naming the gesture on the scroller is what keeps it. A drawn slot
 * takes its cursor only once it travels, so a click on a cell does not flash one.
 */
const gestureCursor = computed(() => {
  const state = gesture.value
  if (!state || state.pointerId === null) return undefined
  if (state.kind === 'resize') return 'resize'
  if (state.kind === 'create' && state.moved) return 'create'
  return undefined
})

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
  root.scrollTop = ((minutes - props.timeWindow.start) / MINUTES_PER_HOUR) * rowHeight
}

// The contract VCalendar drives every view through, so its toolbar need not know which one
// is on screen. VCalendarMonth answers the same two, its `scrollToMinutes` being a no-op.
defineExpose({
  /** Brings the focus onto the cell the grid is currently pointing at. */
  focus: (options?: FocusOptions) => {
    const cell = tabbable.value
    if (cell) focusCell(cellId(cell.iso, cell.minutes), false, options)
  },
  /** Scrolls the grid so a given moment of the day sits at the top of the visible area. */
  scrollToMinutes,
})
</script>

<template>
  <div
    ref="rootEl"
    class="v-calendar-time-grid"
    :data-outside="gesture?.outside ? '' : undefined"
    :data-gesture="gestureCursor"
    :style="{ '--calendar-columns': String(days.length) }"
    @pointermove="onPointermove"
    @pointerup="onPointerup"
    @pointercancel="onPointercancel"
    @pointerleave="onPointerleave"
    @focusout="onFocusout"
  >
    <div class="v-calendar-head">
      <div class="v-calendar-head-gutter" />
      <div v-for="iso in days" :key="iso" class="v-calendar-head-day">
        <slot
          name="day-header"
          :iso="iso"
          :weekday="dayName(iso)"
          :day-text="dayNumber(iso)"
          :today="iso === today"
        >
          <span class="v-calendar-weekday">{{ dayName(iso) }}</span>
          <span class="v-calendar-head-number" :class="{ 'v-calendar-today': iso === today }">
            {{ dayNumber(iso) }}
          </span>
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
          @keydown="onBandKeydown"
        >
          <VCalendarEvent
            v-for="span in allDay"
            :key="span.id"
            class="v-calendar-bar"
            :event="allDayById.get(span.id)!"
            layout="chip"
            :disabled="disabled"
            :continues-before="span.continuesBefore"
            :continues-after="span.continuesAfter"
            v-bind="cardState(span.id)"
            :style="{
              '--calendar-day-index': String(span.startIndex),
              '--calendar-bar-span': String(span.span),
              '--calendar-bar-lane': String(span.lane),
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
        class="v-calendar-columns v-calendar-edge-cue"
        role="grid"
        :aria-label="label"
        :data-edge="edgeCue"
        @keydown="onKeydown"
        @click="onGridClick"
        @pointerdown="onGridPointerdown"
      >
        <div v-for="gridRow in gridRows" :key="gridRow.minutes" role="row" class="v-calendar-row">
          <div
            v-for="cell in gridRow.cells"
            :id="cell.id"
            :key="cell.iso"
            role="gridcell"
            class="v-calendar-cell"
            :data-iso="cell.iso"
            :data-minutes="gridRow.minutes"
            :data-today="cell.iso === today ? '' : undefined"
            :tabindex="isTabStop(cell.iso, gridRow.minutes) ? 0 : -1"
            :aria-label="cell.label"
            :aria-selected="isFocused(cell.iso, gridRow.minutes) ? true : undefined"
          >
            <VCalendarEvent
              v-for="card in cardsAt(cell.key)"
              :key="card.segment.id"
              class="v-calendar-block"
              :event="card.event"
              layout="block"
              :disabled="disabled"
              :time-text="card.timeText"
              :continues-before="card.segment.clippedStart"
              :continues-after="card.segment.clippedEnd"
              :resizable="editable && card.segment.id !== DRAFT_ID && card.segment.part !== 'head'"
              v-bind="cardState(card.segment.id)"
              :style="card.style"
              @click="onCardClick(card.segment.id)"
            >
              <template v-if="$slots.event" #default="slotProps">
                <slot name="event" v-bind="slotProps" />
              </template>
            </VCalendarEvent>

            <!-- The line is drawn INSIDE the cell holding the current hour, never as a
                 direct child of the grid or of a row: a `grid` owns only rows and a row only
                 cells, so an extra box at either level fails `aria-required-children`. -->
            <div
              v-if="nowMark && nowMark.day === cell.day && nowMark.row === cell.row"
              class="v-calendar-now"
              aria-hidden="true"
              :style="{
                '--calendar-day-index': String(nowMark.day),
                '--calendar-now-fraction': String(nowMark.fraction),
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
  .v-calendar-time-grid {
    /*
     * The one scrolling box — its scrolling itself is `.v-calendar-view`'s, in VCalendar's
     * sheet. The day names are sticky INSIDE it rather than in a container of their own, which
     * is what keeps them aligned with the columns for free: a separate header would have to be
     * told how far the body had scrolled sideways, and told again every time the column widths
     * changed.
     */
    --calendar-hour: var(--vectis-control-size-calendar-hour);
    --calendar-gutter: var(--vectis-control-size-calendar-gutter);
    /*
     * The day columns, written once for the three boxes that lay them out: the header and the
     * canvas behind the hour gutter, the all-day band and the columns box without it. The three
     * must resolve to identical tracks — a bar is dropped by reading the pointer against the
     * COLUMNS' geometry — so one definition is what keeps them from drifting apart.
     *
     * It is declared on the element that also carries `--calendar-columns` inline, where the
     * inner `var()` is resolved before the value is inherited: declared any higher, it would
     * be frozen at whatever column count that ancestor saw, which is none.
     */
    --calendar-tracks: repeat(
      var(--calendar-columns),
      minmax(var(--vectis-control-size-calendar-day-min), 1fr)
    );
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
  }

  /*
   * The cursor of a gesture under way — see `gestureCursor`. It is set on every descendant as
   * well as on the scroller, because an engine that resolves the cursor from what is under the
   * pointer rather than from the capture target would otherwise show the `pointer` of whichever
   * card the gesture passes over.
   *
   * `:not([data-outside])` keeps it off a gesture held outside the calendar, whose `not-allowed`
   * lives in VCalendar's sheet at (0,2,0): at equal weight the two would be arbitrated by the
   * order the consumer's bundler put the sheets in.
   */
  .v-calendar-time-grid[data-gesture='resize']:not([data-outside]),
  .v-calendar-time-grid[data-gesture='resize']:not([data-outside]) * {
    cursor: ns-resize;
  }

  .v-calendar-time-grid[data-gesture='create']:not([data-outside]),
  .v-calendar-time-grid[data-gesture='create']:not([data-outside]) * {
    cursor: move;
  }

  .v-calendar-head,
  .v-calendar-canvas {
    display: grid;
    grid-template-columns: var(--calendar-gutter) var(--calendar-tracks);
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
   *      .v-calendar-edge-cue       the edge strip, in VCalendar's sheet
   *   3  [data-dragging] / [data-grabbed]   a card being moved, over the line
   *   4  .v-calendar-head           the sticky day names, over everything
   *
   * Neither `.v-calendar-time-grid` nor `.v-calendar-columns` establishes a stacking context —
   * both are `relative` with no `z-index` — so all four compete at the root, and any TIE is
   * broken by document order. That is what put the current-time line over the header while
   * both sat at 2: the line is further down the template. The header has to sit above the
   * dragged card as well, which is why it is 4 and not 3. The month view's header takes the
   * same 4, for the same reason.
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

  /* Today is marked on the number alone, the way a calendar marks a date rather than a
     column — the `.v-calendar-today` paint, in VCalendar's sheet. */
  .v-calendar-head-number {
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--vectis-control-height-sm);
    block-size: var(--vectis-control-height-sm);
    border-radius: var(--vectis-radius-pill);
    font-size: var(--vectis-text-body-lg-size);
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
    grid-template-columns: var(--calendar-tracks);
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
    grid-column: calc(var(--calendar-day-index) + 1) / span var(--calendar-bar-span);
    grid-row: calc(var(--calendar-bar-lane) + 1);
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
    /* The containing block every card and the edge strip are placed against. The rows below
       are `display: contents`, so the cells themselves are this grid's items. */
    position: relative;
    display: grid;
    grid-column: 2 / -1;
    /*
     * The canvas's own tracks, deliberately restated rather than borrowed with `subgrid`. This
     * box spans exactly the canvas columns it repeats, and both sides divide the same width by
     * the same rule, so the two resolve identically — which makes subgrid a second mechanism
     * buying nothing, the conclusion the library's own audit of it reached.
     */
    grid-template-columns: var(--calendar-tracks);
    grid-auto-rows: var(--calendar-hour);
  }

  .v-calendar-row {
    /* The row exists for the accessibility tree and must not exist for the layout: a real
       box here would make the cells its children instead of the grid's, and every column
       would collapse. */
    display: contents;
  }

  .v-calendar-cell[data-today] {
    background: var(--vectis-color-accent-surface);
  }

  /*
   * A card is positioned against the whole columns box, not against its cell — which is why
   * the horizontal formula carries the day index. Being a child of the cell is what keeps
   * it in the accessibility tree in the right place; being placed against the grid is what
   * lets it be any length at all.
   *
   * TRAP — the height is the event's own length and NOTHING ELSE. No `max()` against a floor
   * token here: the minimum is already applied where it belongs, `timedSegments` stretching
   * every segment to at least `slotDuration` BEFORE the overlap packing sees it, so what is
   * drawn and what the packing believes are the same box. A second floor in CSS can only
   * disagree with the first — the packing cannot read a stylesheet — and the symptom is two
   * cards packed side by side and then drawn on top of each other.
   *
   * A card is therefore never taller than its slot. Fitting the text into a short one is the
   * stylesheet's problem, and VCalendarEvent solves it by asking how tall the card came out.
   *
   * TRAP — compounded with `.v-calendar-event`, which sets `position: relative` on the same
   * element from its own sheet: at an equal (0,1,0) the winner was whichever of the two sheets
   * the consumer's bundler put last, and every card of the grid fell into normal flow.
   */
  .v-calendar-event.v-calendar-block {
    position: absolute;
    inset-block-start: calc(var(--calendar-block-start-fraction) * 100%);
    block-size: calc(
      (var(--calendar-block-end-fraction) - var(--calendar-block-start-fraction)) * 100%
    );
    inset-inline-start: calc(
      (var(--calendar-day-index) + var(--calendar-block-column) / var(--calendar-block-columns)) /
        var(--calendar-columns) * 100%
    );
    inline-size: calc(
      var(--calendar-block-span) / var(--calendar-block-columns) / var(--calendar-columns) * 100% -
        var(--vectis-control-size-calendar-gap)
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
    inset-block-start: calc(var(--calendar-now-fraction) * 100%);
    inset-inline-start: calc(var(--calendar-day-index) / var(--calendar-columns) * 100%);
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

  /* The line is a border, which forced colors keeps; the dot at its start is a background,
     which it would flatten to Canvas. */
  @media (forced-colors: active) {
    .v-calendar-now::before {
      forced-color-adjust: none;
      background: CanvasText;
    }
  }
}
</style>
