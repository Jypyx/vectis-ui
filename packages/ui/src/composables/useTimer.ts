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
 *
 * Inside `<KeepAlive>` a component is deactivated rather than unmounted: a pending delay is
 * held while it is away and armed again, in full, when it comes back. Cancelled on unmount
 * alone, it went on firing off screen, and a carousel kept turning on a page the reader had
 * left.
 */

import { onActivated, onBeforeUnmount, onDeactivated } from 'vue'

export function useTimer(): { start: (fn: () => void, delay: number) => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined
  let armed: { fn: () => void; delay: number } | undefined
  let held: typeof armed

  function cancel() {
    clearTimeout(timer)
    timer = undefined
    armed = undefined
    held = undefined
  }

  function start(fn: () => void, delay: number) {
    cancel()
    if (delay <= 0) return fn()
    armed = { fn, delay }
    timer = setTimeout(() => {
      timer = undefined
      armed = undefined
      fn()
    }, delay)
  }

  onBeforeUnmount(cancel)
  onDeactivated(() => {
    const pending = armed
    cancel()
    held = pending
  })
  onActivated(() => {
    if (held) start(held.fn, held.delay)
  })

  return { start, cancel }
}
