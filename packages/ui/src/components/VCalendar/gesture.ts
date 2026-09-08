/**
 * What the two grids' drag engines share, written once.
 *
 * VCalendarMonth and VCalendarTimeGrid both let an event be picked up, moved and dropped —
 * with a pointer and with the keyboard — and both had a full copy of the plumbing that goes
 * with it: the ghost the original leaves behind while it travels, the id read back off a
 * card, the focus handed back to that card once it lands, and the flag that stops the drop
 * from also reading as a click.
 *
 * What is NOT here is what genuinely differs, which is also why the two components exist
 * separately: turning a point into a cell (a day square on one side, a day and a minute on
 * the other) and working out the new times from it. Those stay with each grid, and the pure
 * half of them is already in `layout.ts`.
 *
 * It lives in the component's folder rather than in `composables/`, the `edgeStep.ts` and
 * `VCombobox/infiniteScroll.ts` arrangement: both consumers are inside this component, so it
 * fails the admission rule that folder keeps.
 */
import { nextTick } from 'vue'
import type { Ref } from 'vue'

import type { CalendarEventId } from './types'

/**
 * The prefix marking the copy an event leaves behind at its old place while it is being
 * dragged. It is written into the id rather than held beside it so that the ghost travels
 * through the same list, the same layout and the same `v-for` key as everything else.
 */
const GHOST_PREFIX = '__vectis-calendar-ghost__'

export const ghostIdOf = (id: CalendarEventId) => `${GHOST_PREFIX}${id}`
export const originalIdOf = (id: CalendarEventId) => String(id).slice(GHOST_PREFIX.length)
export const isGhostId = (id: CalendarEventId) => String(id).startsWith(GHOST_PREFIX)

/**
 * The id a card belongs to, read back off the DOM.
 *
 * An id may be a NUMBER and an attribute is always text, so a numeric one has to be turned
 * back into one — otherwise every card of a numerically-keyed calendar would look up as a
 * miss and nothing would drag. Which of the two it is, is settled by asking the map that
 * holds the originals rather than by guessing from the text.
 */
export function cardIdOf(card: HTMLElement, has: (id: CalendarEventId) => boolean) {
  const raw = card.dataset.eventId ?? ''
  return has(raw) ? raw : Number(raw)
}

/**
 * Hands the focus back to a card once it has landed somewhere else, which the re-render has
 * just taken it from.
 *
 * TRAP — the card is found by WALKING the cards rather than by building an attribute
 * selector. An id belongs to the consumer, so it may hold a quote or a backslash a selector
 * would need escaped, and `CSS.escape` cannot do that escaping here: jsdom defines no `CSS`
 * object at all, so the call threw on every keyboard grab, from inside a `nextTick` where
 * nothing could catch it — an unhandled rejection, which fails the run while every assertion
 * still passes. `menuInvoker` in VMenu/context.ts escapes by hand for the same reason;
 * comparing the attribute's own text sidesteps the question, `data-event-id` being written
 * as exactly `String(event.id)`.
 */
export function useCardFocus(container: Ref<HTMLElement | null>) {
  return function refocusCard(id: CalendarEventId) {
    void nextTick(() => {
      const cards = container.value?.querySelectorAll<HTMLElement>('.v-calendar-event')
      Array.from(cards ?? [])
        .find((card) => card.dataset.eventId === String(id))
        ?.focus()
    })
  }
}

/**
 * The flag that keeps a drop from also reading as a click.
 *
 * A pointer that moved past the threshold ends on a `click` the browser fires anyway, and
 * without this the card would be dropped AND opened. It is a plain `let` behind a function
 * rather than a ref: nothing renders from it, and a reactive one would re-render the grid at
 * the end of every gesture for no visible change.
 *
 * TRAP — `clear()` has to run on the cancel path too. Left STANDING, the flag swallows the
 * NEXT click on any card, which surfaces nowhere near the gesture that set it.
 */
export function useDragGuard() {
  let dragged = false
  return {
    /** Whether the gesture that just ended actually moved, and the flag is now cleared. */
    consume: () => {
      const was = dragged
      dragged = false
      return was
    },
    /** Records whether the gesture moved, which the click right after it will ask about. */
    set: (moved: boolean) => {
      dragged = moved
    },
    /** Forgets a gesture that never became a drag, or one that was taken away. */
    clear: () => {
      dragged = false
    },
  }
}

/**
 * Which edge a dragged event is currently resting against, as the attribute the sheet reads.
 * Both grids paint the cue the same way and both take it from the same source, so the mapping
 * from the edge step's own -1/1 to `start`/`end` belongs here rather than in each of them.
 */
export function edgeCueOf(pending: -1 | 1 | null) {
  return pending === -1 ? 'start' : pending === 1 ? 'end' : undefined
}

/**
 * Whether the pointer has left the grid, where a drop is refused.
 *
 * A rect of zero area answers NO rather than yes: jsdom lays nothing out and measures every
 * element at zero, so the strict reading would abandon every gesture a unit test makes.
 */
export function pointerOutside(
  state: GestureBase,
  rect: DOMRect | undefined,
  within: (p: { x: number; y: number }, box: DOMRect) => boolean,
) {
  return rect ? !within({ x: state.lastX, y: state.lastY }, rect) : false
}

/** The state every gesture carries, whatever each grid adds to it. */
export interface GestureBase {
  id: CalendarEventId
  pointerId: number | null
  originX: number
  originY: number
  /** Where the pointer last was, which a view that pages under a still hand has to re-read. */
  lastX: number
  lastY: number
  /** Whether it moved past the threshold, which is what separates a drag from a click. */
  moved: boolean
  /** Whether the pointer is currently outside the grid, where a drop is refused. */
  outside: boolean
}

/**
 * A gesture held by the KEYBOARD rather than by a pointer: grabbed with Enter, and waiting
 * for the arrows to move it. Both grids draw the card differently in that state, which is
 * what makes it worth a name.
 */
export const isGrabbed = (state: GestureBase | null) => state !== null && state.pointerId === null

/**
 * Whether the pointer has travelled far enough for the gesture to count as a drag rather
 * than as a press. Below the threshold nothing moves: a hand's tremor during a click would
 * otherwise register as a one-pixel drag and swallow the click that follows it.
 */
export function movedPast(state: GestureBase, x: number, y: number, threshold: number) {
  return Math.abs(x - state.originX) >= threshold || Math.abs(y - state.originY) >= threshold
}
