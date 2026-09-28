// @core
/**
 * One cancellable timeout. Nonpositive delays invoke the callback synchronously, so
 * self-rearming consumers must guard against zero-delay recursion.
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
