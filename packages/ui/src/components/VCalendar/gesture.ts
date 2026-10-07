// @keyboard @a11y @core
/**
 * Share pointer and keyboard editing gestures across month and time-grid views; each view
 * supplies its own cell geometry.
 */
import { computed, nextTick, ref, watch } from 'vue'
import type { Ref } from 'vue'

import { isRtl as isElementRtl } from '../../utils/direction'

import { useMessages } from '../../i18n/state'

import { EDGE_BAND, useEdgeStep } from './edgeStep'
import { calendarIntent, type CalendarIntent } from './keyboard'
import { DRAG_THRESHOLD, inlineEdgeAt, pointWithin, type GridGeometry } from './layout'
import type { CalendarEvent, CalendarEventId, CalendarEventTimes } from './types'

/**
 * The prefix marking the copy an event leaves behind at its old place while it is being
 * dragged.
 */
const GHOST_PREFIX = '__vectis-calendar-ghost__'

/**
 * The id the ghost of a dragged event carries. It has to DIFFER from the event's own, or the
 * two would collide in every map the layout keys by id and only one would ever be drawn.
 */
const ghostIdOf = (id: CalendarEventId) => `${GHOST_PREFIX}${id}`
/** The dragged event's own id, read back off its ghost's. */
const originalIdOf = (id: CalendarEventId) => String(id).slice(GHOST_PREFIX.length)
const isGhostId = (id: CalendarEventId) => String(id).startsWith(GHOST_PREFIX)

/** The id a card belongs to, read back off the DOM. */
function cardIdOf(card: HTMLElement, has: (id: CalendarEventId) => boolean) {
  const raw = card.dataset.eventId ?? ''
  return has(raw) ? raw : Number(raw)
}

/**
 * `inlineStart` is the edge the first column starts at, which is the RIGHT one in a
 * right-to-left page.
 */
export function gridGeometryOf(rect: DOMRect, columns: number, rtl: boolean): GridGeometry {
  return {
    top: rect.top,
    height: rect.height,
    inlineStart: rtl ? rect.right : rect.left,
    inlineSize: rect.width,
    columns,
  }
}

/** The state every gesture carries, whatever each grid adds to it. */
export interface GestureBase {
  id: CalendarEventId
  /**
   * Where the event was when the gesture began. Every pointer frame is computed from this and
   * never from the frame before it, so a long drag cannot accumulate rounding drift.
   */
  origin: CalendarEventTimes
  /** What the card shows right now. The model is not touched until the gesture ends. */
  preview: CalendarEventTimes
  /** The pointer holding the gesture, or null for a keyboard grab. */
  pointerId: number | null
  originX: number
  originY: number
  /**
   * Where the pointer last was. Two things move the calendar UNDER a still pointer: paging at
   * an edge, and auto-scrolling. Each has to work out afresh what the pointer is now over.
   */
  lastX: number
  lastY: number
  /** Whether it moved past the threshold, which separates a drag from a click. */
  moved: boolean
  /**
   * Whether the pointer is off the calendar altogether: over the toolbar, or over the page
   * beside it. A KEYBOARD grab can never set it, and structurally rather than by a guard:
   * `onPointermove` is the only writer, and it returns on the id mismatch first: a grab's
   * `pointerId` is null, which no real pointer's id ever equals.
   */
  outside: boolean
  /**
   * The reading direction, read once when the gesture begins. It cannot change under a live
   * drag, and asking the document on every frame costs a style resolution each time.
   */
  rtl: boolean
}

/** What a grid hands over to start a gesture; the rest is filled in here. */
export type GestureInit<G extends GestureBase> = Omit<
  G,
  'preview' | 'lastX' | 'lastY' | 'moved' | 'outside' | 'rtl'
>

/**
 * A gesture held by the KEYBOARD rather than by a pointer: grabbed with Space, and waiting for
 * the arrows to move it.
 */
const isGrabbed = (state: GestureBase | null) => state !== null && state.pointerId === null

/** The two intents that move a grabbed event, which only a grid can turn into times. */
export type GrabStep = Extract<CalendarIntent, { kind: 'grabMove' | 'grabResize' }>

export interface CalendarGestureOptions<E extends CalendarEvent, G extends GestureBase> {
  /** Every event as it is currently drawn, the ghost's original among them. */
  events: () => readonly E[]
  /** The event drawn under an id, for the handlers. */
  eventOf: (id: CalendarEventId) => E | undefined
  rootEl: Ref<HTMLElement | null>
  /** The element the pointer is captured on once a press travels. */
  captureEl: Ref<HTMLElement | null>
  /** The box the cells occupy, which points and edges are read against. */
  measureEl: Ref<HTMLElement | null>
  /** How many columns that box is divided into. */
  columns: () => number
  /** Whether events may be moved at all. */
  editable: () => boolean
  /** The node every card points at to say how it can be moved. */
  hintId: () => string
  /** The step a grabbed event moves by, handed to the keyboard table. */
  slotMinutes: () => number
  edgeStepDelay: () => number
  /** Whatever the grid's cells are made of, so paging under a still pointer re-places the card. */
  layout: () => unknown
  /** Works out where the gesture's event belongs from the pointer's last position. */
  applyPoint: (state: G, rect: DOMRect) => void
  /** Called on every pointer move past the threshold, after the edge watch, with both rects. */
  onEdges?: (state: G, rootRect: DOMRect | undefined) => void
  /** Everything else a gesture leaves running, dropped on every path out of one. */
  onRelease?: () => void
  /**
   * A pointer gesture let go inside the calendar. Returns true when the grid has answered it
   * itself, such as a slot drawn out, and nothing is left to drop.
   */
  onLetGo?: (state: G) => boolean
  /** A gesture that moved, committed: the grid reports the new times. */
  onDrop: (state: G) => void
  /** What a keyboard grab of this event starts, or null when it cannot be grabbed. */
  grab: (item: E) => GestureInit<G> | null
  /** Applies one arrow step to a grabbed event. Returns false when the step means nothing here. */
  onGrabStep: (state: G, step: GrabStep, item: E) => boolean
  step: (direction: -1 | 1) => void
  announce: (message: string) => void
}

export function useCalendarGesture<E extends CalendarEvent, G extends GestureBase>(
  options: CalendarGestureOptions<E, G>,
) {
  const m = useMessages()
  const gesture = ref<G | null>(null) as Ref<G | null>

  /** True while a card is being held by the keyboard rather than dragged by a pointer. */
  const grabbing = computed(() => isGrabbed(gesture.value))

  const isRtl = () => isElementRtl(options.measureEl.value)

  /**
   * The echo of where the gestured event began, so the reader can see what they are moving it
   * FROM. A press that has not travelled yet produces none, or a click would flash a second
   * card over the first.
   */
  const ghostEvent = computed<E | null>(() => {
    const state = gesture.value
    if (!state?.moved) return null
    const original = options.events().find((event) => event.id === state.id)
    return original ? ({ ...original, ...state.origin, id: ghostIdOf(state.id) } as E) : null
  })

  /** A list with the gestured event moved to wherever it is now, plus its echo. */
  function withPreview(events: readonly E[]): E[] {
    const state = gesture.value
    if (!state) return [...events]
    const moving = events.map((event) =>
      event.id === state.id ? ({ ...event, ...state.preview } as E) : event,
    )
    return ghostEvent.value ? [...moving, ghostEvent.value] : moving
  }

  /**
   * Set click suppression on pointerup, not pointercancel; clear it before every press guard
   * and keyboard activation. Captured releases may never send their click to an event card.
   */
  let dragged = false

  /** Closes the books on the previous gesture. */
  function endLastGesture() {
    dragged = false
    if (grabbing.value) revertGrab()
  }

  /** Puts a keyboard grab back where it was taken from, writing nothing, and says so. */
  function revertGrab() {
    const state = gesture.value
    if (!state) return
    gesture.value = null
    options.announce(m.value.calendar.reverted)
    return state
  }

  /**
   * A keyboard grab ends when the focus moves on to something else, the toolbar or another
   * control.
   */
  function onFocusout(event: FocusEvent) {
    const state = gesture.value
    const next = event.relatedTarget as HTMLElement | null
    if (!grabbing.value || !state || !next) return
    const card = next.closest<HTMLElement>('.v-calendar-event')
    if (card && card.dataset.eventId === String(state.id)) return
    revertGrab()
  }

  /** Whether the gesture that just ended actually moved; asking lowers the flag. */
  function consumeDrag() {
    const was = dragged
    dragged = false
    return was
  }

  const edge = useEdgeStep(options.step, options.edgeStepDelay)

  /** Which edge is counting down, as the attribute the stylesheet reads. */
  const edgeCue = computed(() =>
    edge.pending.value === -1 ? 'start' : edge.pending.value === 1 ? 'end' : undefined,
  )

  function release() {
    edge.cancel()
    options.onRelease?.()
  }

  /** Starts a gesture. */
  function start(init: GestureInit<G>, rtl = isRtl()) {
    gesture.value = {
      ...init,
      preview: { ...init.origin },
      lastX: init.originX,
      lastY: init.originY,
      moved: false,
      outside: false,
      rtl,
    } as G
  }

  /**
   * Called when the press crosses the drag threshold, never at the press. The browser sends the
   * `click` that follows a captured `pointerup` to the CAPTURE element, so a press captured at
   * once reaches the scroller instead of the card or the cell under it: clicking an event would
   * open nothing and clicking an empty slot would report nothing, on every calendar whose
   * events can be moved or drawn.
   */
  function capture(pointerId: number) {
    // @fallback
    /*
     * Synthetic pointer events may not have a capturable pointer; allow the gesture to continue
     * within the element if capture fails.
     */
    try {
      options.captureEl.value?.setPointerCapture(pointerId)
    } catch {
      /* Synthetic pointers cannot be captured. */
    }
  }

  function reapply(state: G) {
    const rect = options.measureEl.value?.getBoundingClientRect()
    if (rect) options.applyPoint(state, rect)
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

    if (!state.moved) capture(event.pointerId)
    state.moved = true
    const rootRect = options.rootEl.value?.getBoundingClientRect()
    const rect = options.measureEl.value?.getBoundingClientRect()

    /*
     * Neither the placement nor the edge watch below is gated on it, and neither may become so.
     * The card must keep following the pointer while it is out, which makes coming back in
     * seamless, and paging must keep running, pushing past the edge being how one crosses into
     * the next period.
     */
    state.outside = rootRect ? !pointWithin({ x: state.lastX, y: state.lastY }, rootRect) : false

    if (!rect) return
    options.applyPoint(state, rect)
    edge.watchEdge(
      inlineEdgeAt(
        state.lastX,
        gridGeometryOf(rect, options.columns(), state.rtl),
        EDGE_BAND,
        state.rtl,
      ),
    )
    options.onEdges?.(state, rootRect)
  }

  function onPointerup(event: PointerEvent) {
    const state = gesture.value
    if (!state || state.pointerId !== event.pointerId) return
    gesture.value = null
    dragged = state.moved
    release()

    /*
     * Nothing is announced: the pointer says nothing on a SUCCESSFUL drop either; `grabbed`,
     * `dropped` and `reverted` belong to the keyboard grab, which has no pointer to show where
     * the event went.
     */
    if (state.outside) return
    if (options.onLetGo?.(state)) return
    // A press that never travelled is an ordinary click, which the button's own click event is
    // about to report. Writing anything here would move an event nobody dragged.
    if (state.moved) options.onDrop(state)
  }

  /*
   * The gesture was taken away; a system gesture, a context menu, the page starting to scroll.
   * Nothing is written and nothing is announced: the card goes back to where the model still
   * says it is.
   */
  function onPointercancel(event: PointerEvent) {
    // Another pointer's cancel, a second finger starting to pan, is not this gesture's. A
    // keyboard grab carries no pointer id, so no cancel can end it either.
    if (gesture.value?.pointerId !== event.pointerId) return
    abandon()
  }

  function abandon() {
    gesture.value = null
    release()
  }

  /*
   * Its `pointerup` then lands outside and never reaches the bindings, so without this the
   * gesture would outlive the press: a mouse keeps the same pointer id, and bringing it back
   * over the calendar with the button up would pick the event up and carry it. A captured
   * pointer never leaves, so a real drag is untouched.
   */
  function onPointerleave(event: PointerEvent) {
    const state = gesture.value
    if (!state || state.pointerId !== event.pointerId || state.moved) return
    abandon()
  }

  /*
   * Paging swaps the cells out from under a live drag, and the dragged event's day is then off
   * screen; the card would vanish until the next pointer move, which never comes if the hand is
   * holding still against the edge. Re-applying the last position once the new cells are
   * rendered is what keeps the card under the pointer across the boundary.
   */
  watch(
    options.layout,
    () => {
      const state = gesture.value
      if (state?.moved) reapply(state)
    },
    { flush: 'post' },
  )

  /**
   * The card is found by WALKING the cards rather than by building an attribute selector. An id
   * belongs to the consumer, so it may hold a quote or a backslash a selector would need
   * escaped, and `CSS.escape` cannot do that escaping here: jsdom defines no `CSS` object at
   * all, so the call threw on every keyboard grab, from inside a `nextTick` where nothing could
   * catch it; an unhandled rejection, which fails the run while every assertion still passes.
   */
  function refocusCard(id: CalendarEventId) {
    void nextTick(() => {
      // Searched from the view's root: the time grid's all-day bars sit in its sticky header,
      // outside the box the cells occupy.
      const cards = options.rootEl.value?.querySelectorAll<HTMLElement>('.v-calendar-event')
      Array.from(cards ?? [])
        .find((card) => card.dataset.eventId === String(id))
        ?.focus()
    })
  }

  /** Puts the focus on a cell by its id, once the render that made it tabbable has run. */
  function focusCell(id: string, deferred = false, focusOptions?: FocusOptions) {
    const move = () => document.getElementById(id)?.focus(focusOptions)
    if (deferred) void nextTick(move)
    else move()
  }

  /** The event a card stands for, read back off the attribute the card publishes. */
  const idOfCard = (card: HTMLElement) => cardIdOf(card, (id) => options.eventOf(id) !== undefined)

  /**
   * A card answers a different table from the grid it sits in; that is what a grab mode IS.
   * Without it the grid would offer a gesture the pointer alone could reach (WCAG 2.1.1).
   */
  function onCardKeydown(event: KeyboardEvent, card: HTMLElement) {
    // Whatever click follows is this key's, never the end of an earlier drag.
    dragged = false
    const item = options.eventOf(idOfCard(card))
    if (!item) return

    const held = grabbing.value && gesture.value?.id === item.id
    const state = held ? gesture.value! : null
    const intent = calendarIntent(
      event,
      held ? 'grabbed' : 'event',
      options.slotMinutes(),
      state?.rtl ?? isRtl(),
    )
    if (!intent) return

    if (!state) {
      // An event that cannot be moved keeps a button's ordinary behaviour: Space presses it,
      // which the card's click handler reports.
      const init = intent.kind === 'grab' ? options.grab(item) : null
      if (!init) return
      /*
       * Cancelling the keydown is what stops that press, so the keystroke that takes hold of
       * the event does not open it too: without it every attempt to move something would fire
       * the consumer's editor over it.
       */
      event.preventDefault()
      start(init)
      options.announce(m.value.calendar.grabbed)
      return
    }

    event.preventDefault()

    if (intent.kind === 'grabMove' || intent.kind === 'grabResize') {
      if (!options.onGrabStep(state, intent, item)) return
      state.moved = true
      refocusCard(state.id)
      return
    }

    if (intent.kind === 'activate') {
      gesture.value = null
      if (state.moved) options.onDrop(state)
      options.announce(m.value.calendar.dropped)
      refocusCard(state.id)
      return
    }

    if (intent.kind === 'cancel') {
      revertGrab()
      refocusCard(state.id)
    }
  }

  /**
   * The five things every card is told about the gesture, bound with `v-bind` so the two grids
   * cannot describe the same state in two different ways.
   */
  function cardState(id: CalendarEventId) {
    const state = gesture.value
    const mine = state !== null && state.id === id
    return {
      /*
       * Only once the press has travelled. A dragged card takes no pointer events, so marked at
       * the press it lets the release land on the cell beneath it: the click then goes to that
       * cell, and clicking an event reports an empty slot instead of opening it.
       */
      dragging: mine && state.pointerId !== null && state.moved,
      rejected: mine && state.outside,
      grabbed: mine && state.pointerId === null,
      hintId: options.editable() && !isGhostId(id) ? options.hintId() : undefined,
      ghostOf: isGhostId(id) ? originalIdOf(id) : undefined,
    }
  }

  return {
    gesture,
    grabbing,
    ghostEvent,
    withPreview,
    edgeCue,
    isRtl,
    start,
    reapply,
    release,
    endLastGesture,
    consumeDrag,
    onPointermove,
    onPointerup,
    onPointercancel,
    onPointerleave,
    onFocusout,
    onCardKeydown,
    refocusCard,
    focusCell,
    idOfCard,
    cardState,
  }
}
