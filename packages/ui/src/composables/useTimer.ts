import { onBeforeUnmount } from 'vue'

// @core
/**
 * A delay one can re-arm, and which cancels itself when the component goes away.
 *
 * Three things are true of it, and each is there to prevent a specific bug. The handle is
 * held in a plain variable rather than a reactive one, because nothing renders it and
 * making it reactive would cause renders for nothing. Starting a delay always cancels the
 * one before it, or two would run at once — a tooltip armed twice opens, closes and opens
 * again. And it is cancelled before the component is torn down, or the callback would run
 * against a component that no longer exists.
 *
 * A delay of zero runs the callback SYNCHRONOUSLY, which a zero timeout does not: the
 * design system's convention is that zero means no deferral at all. That is what makes a
 * debounce of zero immediate, and a notification given no duration permanent.
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
