// @ssr @core
/**
 * A snackbar confirms the last action a reader took, which separates it from a notification
 * reporting a state: notifications stack, because two things can be true at once, whereas only
 * the last action is worth offering to undo. So there is at most one snackbar at a time, and
 * raising a new one replaces the one before it on the spot.
 */

import { shallowRef } from 'vue'

import type { IconSource } from '../VIcon/types'
import { isDev } from '../../utils/env'

/** What a confirmation can mean. */
export type SnackbarTone = 'neutral' | 'danger'

/** Where the bar appears. Along the bottom edge only, where it is out of the content's way. */
export type SnackbarPlacement = 'bottom-left' | 'bottom-center' | 'bottom-right'

/** Everything one can say when raising a confirmation. */
export interface SnackbarOptions {
  /** What the confirmation says. One short sentence: there is no title to frame it. */
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
  /** The word drawn on that action. It falls back to the design system dictionary ("Undo"). */
  actionText?: string
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
 */
export function snackbar(options: SnackbarOptions): number {
  // @devwarn
  // The queue is module state, shared by every request a server renders: raised there, it
  // would reach another reader's page and differ from what the browser hydrates.
  if (isDev && typeof document === 'undefined')
    console.warn(
      '[snackbar] called during a server render: call it from a handler or a lifecycle hook that runs in the browser.',
    )
  const id = nextId++
  current.value = { tone: 'neutral', ...options, id }
  return id
}

/**
 * Takes a confirmation away, by its id or, called with no argument, whichever one is showing.
 * Passing an id is not a formality: it is checked against the bar actually on screen, and a
 * stale one is ignored.
 */
export function dismissSnackbar(id?: number): void {
  if (id === undefined || current.value?.id === id) current.value = null
}
