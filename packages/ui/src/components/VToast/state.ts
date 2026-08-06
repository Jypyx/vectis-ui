import { reactive } from 'vue'

import type { IconSource } from '../VIcon/types'

/**
 * The global notification queue. JS justified: no HTML primitive covers a
 * programmatic notification queue — the state lives at module level (the sonner
 * pattern) so `toast()` can be called ANYWHERE (a component, a store, an API
 * helper), with no provide/inject.
 *
 * SSR-safe by contract: `toast()` is only called client-side (handlers,
 * asynchronous API returns), never during server rendering — where module state
 * would be shared between requests. Only the mounted <VToaster> touches the DOM
 * (Popover API) and arms the auto-dismiss timers.
 */

export type ToastTone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning'

export type ToastPlacement =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface ToastOptions {
  /** Body of the notification. */
  message: string
  title?: string
  tone?: ToastTone
  /** `soft`: tinted background + border; `solid`: full colour. */
  variant?: 'soft' | 'solid'
  /**
   * An icon name or an explicit render; `false` = no icon; absent = the tone's
   * default icon.
   */
  icon?: IconSource | false
  /**
   * Display duration in ms; `0` = stays until manually dismissed; absent = the
   * VToaster's duration (5000 by default).
   */
  duration?: number
  /** Absent = the VToaster's placement (`bottom-right` by default). */
  placement?: ToastPlacement
  /** Displays the close cross. */
  closable?: boolean
  /**
   * Width (a CSS length); default `--vectis-control-size-toast-width`. Always bounded
   * by the viewport width minus the margins.
   */
  width?: string
}

/** A normalized toast in the queue (internal, rendered by <VToaster>). */
export interface ToastItem extends ToastOptions {
  id: number
  tone: ToastTone
  variant: 'soft' | 'solid'
  closable: boolean
}

/** The reactive queue, consumed by <VToaster> — not re-exported by index.ts. */
export const toasts = reactive<ToastItem[]>([])

let nextId = 0

/**
 * Adds a notification to the queue and returns its id (usable with `dismissToast`).
 * The defaults that depend on the VToaster (placement, duration) are resolved by it
 * — the single source of truth for its own props.
 */
export function toast(options: ToastOptions): number {
  const id = nextId++
  toasts.push({ tone: 'neutral', variant: 'soft', closable: true, ...options, id })
  return id
}

/** Removes a toast by id; with no argument, empties the whole queue. */
export function dismissToast(id?: number): void {
  if (id === undefined) {
    toasts.length = 0
    return
  }
  const index = toasts.findIndex((item) => item.id === id)
  if (index !== -1) toasts.splice(index, 1)
}
