import { onBeforeUnmount } from 'vue'

// @core
/**
 * A re-armable `setTimeout`, cancelled on unmount.
 *
 * Three rules:
 * - the handle lives in a NON-reactive `let`: nobody renders it, and making it a
 *   `ref` would trigger renders for nothing;
 * - `start()` always cancels the previous one, otherwise two timers run;
 * - cancelled on unmount, otherwise the callback runs on a dead component.
 *
 * `start()` with a delay ≤ 0 runs **synchronously**: `setTimeout(…, 0)` is not,
 * and the DS convention is that 0 disarms the deferral (synchronous debounce,
 * persistent toast).
 */
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
