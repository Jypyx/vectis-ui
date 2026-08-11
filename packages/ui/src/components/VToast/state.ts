import { reactive } from 'vue'

import type { IconSource } from '../VIcon/types'

// @ssr @core
/**
 * The queue of notifications waiting to be shown. Nothing in HTML covers this, so it
 * is code by necessity.
 *
 * The queue is held at module level rather than inside a component, and that is the
 * whole point: `toast()` can then be called from ANYWHERE — a component, a store, an
 * error handler in an API layer — without anything having to be passed down to it.
 * The price is a contract to respect: since module state is shared by every request a
 * server handles, `toast()` must only ever be called in the browser, from a handler or
 * when a request comes back, and never while a page is being rendered on the server.
 *
 * The only thing that touches the DOM, and the only thing that arms the timers, is the
 * mounted VToaster.
 */

export type ToastTone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning'

export type ToastPlacement =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

/** Everything one can say when raising a notification. */
export interface ToastOptions {
  /** What the notification says. */
  message: string
  /** A short heading above the message, when the message alone needs framing. */
  title?: string
  /** What the notification means, expressed as a colour, and which icon it takes by default. */
  tone?: ToastTone
  /** How strongly it is painted: a tinted background with a border, or the full colour. */
  variant?: 'soft' | 'solid'
  /**
   * The icon to show. Left out, the tone brings its own; `false` removes it
   * altogether.
   */
  icon?: IconSource | false
  /**
   * How long it stays, in milliseconds. Setting it to 0 keeps it until it is
   * dismissed by hand, and leaving it out takes the duration set on the VToaster.
   */
  duration?: number
  /** Which corner it appears in. Left out, it takes the one set on the VToaster. */
  placement?: ToastPlacement
  /** Shows the close cross. */
  closable?: boolean
  /**
   * How wide it is, as a CSS length. It is never allowed past the width of the
   * viewport, margins included.
   */
  width?: string
}

/**
 * A notification once it is in the queue, with the choices the caller left out filled
 * in and an id of its own. Internal: it is what VToaster renders.
 */
export interface ToastItem extends ToastOptions {
  id: number
  tone: ToastTone
  variant: 'soft' | 'solid'
  closable: boolean
}

/** The queue itself. It is internal, read only by VToaster, and not public API. */
export const toasts = reactive<ToastItem[]>([])

let nextId = 0

/**
 * Raises a notification, and hands back an id that `dismissToast` can use to take it
 * away again before its time.
 *
 * The two defaults that belong to the VToaster — where notifications appear and how
 * long they stay — are deliberately NOT resolved here: they are read when the
 * notification is rendered, so the toaster remains the single source of truth for its
 * own settings.
 */
export function toast(options: ToastOptions): number {
  const id = nextId++
  toasts.push({ tone: 'neutral', variant: 'soft', closable: true, ...options, id })
  return id
}

/**
 * Takes a notification away by its id, or clears every one of them when called with
 * no argument.
 */
export function dismissToast(id?: number): void {
  if (id === undefined) {
    toasts.length = 0
    return
  }
  const index = toasts.findIndex((item) => item.id === id)
  if (index !== -1) toasts.splice(index, 1)
}
