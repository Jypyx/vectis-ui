// @core
/**
 * A re-armable delay, cancelled on unmount.
 *
 * `start` always cancels the pending one, or a tooltip armed twice opens, closes and opens
 * again. The handle is a plain variable: nothing renders it, and making it reactive would
 * cost renders for nothing.
 *
 * TRAP — a delay of 0 runs the callback SYNCHRONOUSLY, where `setTimeout(fn, 0)` would not.
 * The library's convention is that zero disarms the deferral, which is what makes a debounce
 * of 0 immediate. Callers for whom 0 means "never" (VSnackbar's duration, VCarousel's
 * autoplay) must guard before calling, or the callback fires in the tick that armed it.
 */

import { onBeforeUnmount } from 'vue'

export function useTimer(): { start: (fn: () => void, delay: number) => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined

  function cancel() {
    clearTimeout(timer)
    timer = undefined
  }

  function start(fn: () => void, delay: number) {
    cancel()
    if (delay <= 0) fn()
    else timer = setTimeout(fn, delay)
  }

  onBeforeUnmount(cancel)

  return { start, cancel }
}
