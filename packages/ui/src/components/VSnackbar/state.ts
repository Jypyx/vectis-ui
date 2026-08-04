import { shallowRef } from 'vue'

import type { IconSource } from '../VIcon/types'

// @ssr @core
/**
 * The confirmation bar waiting to be shown. Nothing in HTML covers this, so it is code
 * by necessity.
 *
 * A snackbar confirms an action the reader has just taken and offers, most of the time,
 * to take it back — "Message deleted — Undo". That is what separates it from a
 * notification, which reports a state: a notification stacks, because two things can be
 * true at once, whereas only the LAST action a reader took is worth offering to undo.
 * So there is at most one snackbar at a time, and raising a new one replaces the one
 * before it on the spot.
 *
 * Which is why this is a single value rather than a queue. It is a `shallowRef` and not
 * a `reactive` object: the bar is replaced whole, never edited in place. That is what
 * makes the watcher in VSnackbar exact — it fires when and only when the bar really
 * changes, so the countdown is re-armed exactly then, and none of the bookkeeping the
 * VToaster needs to time several notifications at once has to exist here.
 *
 * The state is held at module level rather than inside a component, and that is the
 * whole point: `snackbar()` can then be called from ANYWHERE — a component, a store, the
 * handler that just deleted something — without anything having to be passed down to it.
 * The price is a contract to respect: since module state is shared by every request a
 * server handles, `snackbar()` must only ever be called in the browser, from a handler
 * or when a request comes back, and never while a page is being rendered on the server.
 *
 * The only thing that touches the DOM, and the only thing that arms the countdown, is
 * the mounted VSnackbar.
 */

/**
 * What a confirmation can mean. There are two, and deliberately no more: a snackbar
 * says either "done" or "that did not work". Success, warning and the accent are
 * STATES, which is a notification's subject — reporting one here would blur the line
 * the two components exist to draw.
 */
export type SnackbarTone = 'neutral' | 'danger'

/** Where the bar appears. Along the bottom edge only, where it is out of the content's way. */
export type SnackbarPlacement = 'bottom-left' | 'bottom-center' | 'bottom-right'

/** Everything one can say when raising a confirmation. */
export interface SnackbarOptions {
  /** What the confirmation says. One short sentence — there is no title to frame it. */
  message: string
  /** What it means, expressed as a colour: the plain inversion, or the failure colour. */
  tone?: SnackbarTone
  /**
   * An icon before the message. There is none by default, and none is deduced from the
   * tone: a confirmation is read, not scanned.
   */
  icon?: IconSource
  /**
   * How long it stays, in milliseconds. Setting it to 0 keeps it until it is replaced or
   * taken away by hand, and leaving it out takes the duration set on the VSnackbar.
   */
  duration?: number
  /** Which end of the bottom edge it appears at. Left out, it takes the one set on the VSnackbar. */
  placement?: SnackbarPlacement
  /**
   * What the single action does. Left out, the bar carries no button at all. Running it
   * always takes the bar away, so nothing has to be dismissed by hand afterwards.
   */
  action?: () => void
  /** What that action is called. It falls back to the design system dictionary ("Undo"). */
  actionLabel?: string
}

/**
 * A confirmation once it is showing, with the choices the caller left out filled in and
 * an id of its own. Internal: it is what VSnackbar renders.
 */
export interface SnackbarItem extends SnackbarOptions {
  id: number
  tone: SnackbarTone
}

/** The bar currently showing, if any. Internal, read only by VSnackbar, and not public API. */
export const current = shallowRef<SnackbarItem | null>(null)

let nextId = 0

/**
 * Raises a confirmation, replacing whatever was showing, and hands back an id that
 * `dismissSnackbar` can use to take it away again before its time.
 *
 * The two defaults that belong to the VSnackbar — where the bar appears and how long it
 * stays — are deliberately NOT resolved here: they are read when the bar is rendered, so
 * the component remains the single source of truth for its own settings.
 */
export function snackbar(options: SnackbarOptions): number {
  const id = nextId++
  current.value = { tone: 'neutral', ...options, id }
  return id
}

/**
 * Takes a confirmation away, by its id or — called with no argument — whichever one is
 * showing.
 *
 * Passing an id is not a formality: it is checked against the bar actually on screen, and
 * a stale one is ignored. Without that test a countdown or a handler arriving late would
 * close the bar that has just REPLACED the one it was about, and the reader would watch a
 * fresh confirmation vanish in a fraction of its time.
 */
export function dismissSnackbar(id?: number): void {
  if (id === undefined || current.value?.id === id) current.value = null
}
