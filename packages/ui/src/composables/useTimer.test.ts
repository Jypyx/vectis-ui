import { render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { KeepAlive, defineComponent, h, nextTick, ref } from 'vue'

import { useTimer } from './useTimer'

/**
 * Three invariants, and the last two are the ones a plain `setTimeout` gets wrong:
 * `start()` re-arms rather than stacking, and a delay ≤ 0 runs SYNCHRONOUSLY — the
 * DS convention that 0 disarms the deferral (a synchronous debounce, a persistent
 * toast). `setTimeout(…, 0)` would defer, which is exactly what callers must not get.
 */
function mountTimer() {
  let api!: ReturnType<typeof useTimer>
  const wrapper = render(
    defineComponent({
      setup() {
        api = useTimer()
        return () => h('div')
      },
    }),
  )
  return { api, unmount: wrapper.unmount }
}

describe('useTimer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('runs the callback after the delay', () => {
    const { api } = mountTimer()
    const fn = vi.fn()

    api.start(fn, 150)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(150)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('runs SYNCHRONOUSLY at a delay of 0 — no tick at all', () => {
    const { api } = mountTimer()
    const fn = vi.fn()

    api.start(fn, 0)
    // No advanceTimersByTime: a deferred call would fail here.
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('re-arming cancels the previous timer instead of stacking', () => {
    const { api } = mountTimer()
    const first = vi.fn()
    const second = vi.fn()

    api.start(first, 100)
    api.start(second, 100)
    vi.advanceTimersByTime(200)

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('cancel() disarms a pending timer', () => {
    const { api } = mountTimer()
    const fn = vi.fn()

    api.start(fn, 100)
    api.cancel()
    vi.advanceTimersByTime(500)
    expect(fn).not.toHaveBeenCalled()
  })

  it('unmounting cancels — the callback never runs on a dead component', () => {
    const { api, unmount } = mountTimer()
    const fn = vi.fn()

    api.start(fn, 100)
    unmount()
    vi.advanceTimersByTime(500)
    expect(fn).not.toHaveBeenCalled()
  })
})

/*
 * A component kept alive is deactivated rather than unmounted, so a timer cancelled on
 * unmount alone went on firing off screen: a carousel kept rotating on a page the reader had
 * left. It is held while the component is away, and armed again when it comes back.
 */
describe('useTimer inside KeepAlive', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('holds a pending delay while deactivated, and resumes it when shown again', async () => {
    const fired = vi.fn()
    const shown = ref(true)
    const Timed = {
      setup() {
        useTimer().start(fired, 1000)
        return () => h('div')
      },
    }
    render({ setup: () => () => h(KeepAlive, null, shown.value ? [h(Timed)] : []) })

    shown.value = false
    await nextTick()
    vi.advanceTimersByTime(5000)
    expect(fired).not.toHaveBeenCalled()

    shown.value = true
    await nextTick()
    vi.advanceTimersByTime(1000)
    expect(fired).toHaveBeenCalledTimes(1)
  })
})
