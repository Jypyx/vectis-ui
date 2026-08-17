import { render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import { EDGE_BAND, EDGE_STEP_DELAY, useEdgeStep, type EdgeDirection } from './edgeStep'

/*
 * `useEdgeStep` calls `useTimer`, which registers `onBeforeUnmount` — so it has to run inside
 * a component instance or the timer is never cleaned up. The harness mounts a bare one and
 * hands the module back, which is also what lets the unmount test exist. Same shape as
 * `composables/useTimer.test.ts`.
 */
function harness(delay = () => EDGE_STEP_DELAY) {
  const steps: EdgeDirection[] = []
  let api!: ReturnType<typeof useEdgeStep>

  const wrapper = render(
    defineComponent({
      setup() {
        api = useEdgeStep((direction) => steps.push(direction), delay)
        return () => h('div')
      },
    }),
  )

  return { steps, api, unmount: wrapper.unmount }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('arming', () => {
  it('steps once the drag has rested long enough', () => {
    const { steps, api } = harness()
    api.watchEdge(1)
    expect(steps).toEqual([])

    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    expect(steps).toEqual([1])
  })

  /*
   * The whole reason there is a delay at all: paging the instant the pointer touched the edge
   * would make the last day of the week unaimable.
   */
  it('does nothing at all before the delay is up', () => {
    const { steps, api } = harness()
    api.watchEdge(-1)
    vi.advanceTimersByTime(EDGE_STEP_DELAY - 1)
    expect(steps).toEqual([])
  })

  it('keeps paging while the drag stays there', () => {
    const { steps, api } = harness()
    api.watchEdge(1)
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 3)
    expect(steps).toEqual([1, 1, 1])
  })

  it('carries the direction it was given', () => {
    const { steps, api } = harness()
    api.watchEdge(-1)
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    expect(steps).toEqual([-1])
  })
})

describe('leaving and changing edges', () => {
  it('drops what was armed when the drag returns to the middle', () => {
    const { steps, api } = harness()
    api.watchEdge(1)
    vi.advanceTimersByTime(EDGE_STEP_DELAY / 2)
    api.watchEdge(null)
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 2)
    expect(steps).toEqual([])
  })

  it('starts over when the drag crosses to the other edge', () => {
    const { steps, api } = harness()
    api.watchEdge(1)
    vi.advanceTimersByTime(EDGE_STEP_DELAY - 10)
    api.watchEdge(-1)
    vi.advanceTimersByTime(EDGE_STEP_DELAY - 10)
    expect(steps).toEqual([])

    vi.advanceTimersByTime(20)
    expect(steps).toEqual([-1])
  })

  /*
   * TRAP — re-arming on every move would mean a hand trembling by a pixel never reached the
   * delay, and the calendar would simply never page for anyone unsteady. Being told the same
   * edge again has to leave the running timer alone.
   */
  it('leaves the countdown alone when told the same edge again', () => {
    const { steps, api } = harness()
    api.watchEdge(1)
    for (let i = 0; i < 9; i++) {
      vi.advanceTimersByTime(100)
      api.watchEdge(1)
    }
    vi.advanceTimersByTime(100)
    expect(steps).toEqual([1])
  })

  it('can be dropped outright', () => {
    const { steps, api } = harness()
    api.watchEdge(1)
    api.cancel()
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 2)
    expect(steps).toEqual([])
  })
})

describe('what the stylesheet reads', () => {
  it('names the edge that is counting down, and forgets it on the way out', () => {
    const { api } = harness()
    expect(api.pending.value).toBeNull()

    api.watchEdge(1)
    expect(api.pending.value).toBe(1)

    api.watchEdge(null)
    expect(api.pending.value).toBeNull()
  })

  it('says nothing is pending when paging is switched off', () => {
    const { api } = harness(() => 0)
    api.watchEdge(1)
    expect(api.pending.value).toBeNull()
  })
})

describe('the delay', () => {
  /*
   * TRAP — `useTimer` runs a delay of zero or less SYNCHRONOUSLY, and the callback re-arms
   * itself, so arming at zero would recurse until the stack gave out. Refusing to arm is both
   * the guard and the consumer's off switch.
   */
  it('never arms at zero, which is what switches paging off', () => {
    const { steps, api } = harness(() => 0)
    api.watchEdge(1)
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 5)
    expect(steps).toEqual([])
  })

  it('never arms on a negative delay either', () => {
    const { steps, api } = harness(() => -100)
    api.watchEdge(-1)
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 5)
    expect(steps).toEqual([])
  })

  // A getter, so binding it to zero mid-drag stops the paging on the spot.
  it('is read at the moment the edge is reached, not once at the start', () => {
    let wait = 0
    const { steps, api } = harness(() => wait)

    api.watchEdge(1)
    vi.advanceTimersByTime(5000)
    expect(steps).toEqual([])

    wait = EDGE_STEP_DELAY
    api.watchEdge(null)
    api.watchEdge(1)
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    expect(steps).toEqual([1])
  })
})

describe('cleanup', () => {
  it('stops paging once the calendar has gone away', () => {
    const { steps, api, unmount } = harness()
    api.watchEdge(1)
    unmount()
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 3)
    expect(steps).toEqual([])
  })
})

describe('the edge band', () => {
  /*
   * The one constant here worth pinning, because it has a TWIN:
   * `--vectis-control-size-calendar-edge` is 3rem, which is 48px at a 16px root, and it is
   * what the stylesheet lights up. They describe the same strip, so drifting apart would mean
   * the calendar paged from somewhere other than where it said it would.
   *
   * The delay is deliberately not pinned: it is a matter of feel with nothing coupled to it,
   * and a test on it would only make retuning it look like a regression.
   */
  it('is the same strip the stylesheet paints', () => {
    expect(EDGE_BAND).toBe(48)
  })
})
