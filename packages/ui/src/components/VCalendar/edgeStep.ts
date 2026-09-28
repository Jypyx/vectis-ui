// @core
/** Page while a drag rests at a view edge, allowing moves beyond the currently visible period. */
import { readonly, ref, type Ref } from 'vue'

import { useTimer } from '../../composables/useTimer'

/** How long a dragged event rests against an edge before the calendar pages, in milliseconds. */
export const EDGE_STEP_DELAY = 800

/**
 * This number is the twin of `--vectis-control-size-calendar-edge`, the width of the band the
 * stylesheet lights up to show that paging is coming. They describe the same strip: moving one
 * without the other leaves the calendar paging from somewhere other than where it said it
 * would, with nothing anywhere to point at it.
 */
export const EDGE_BAND = 48

/** Which way the calendar is being asked to go: back a period, or on to the next. */
export type EdgeDirection = -1 | 1

export interface EdgeStep {
  /**
   * Told on every pointer move which edge the drag is now against, or nothing when it is
   * back in the middle.
   */
  watchEdge(edge: EdgeDirection | null): void
  /** Drops whatever is armed, without stepping. */
  cancel(): void
  /** The edge currently counting down, for the stylesheet to show. */
  pending: Readonly<Ref<EdgeDirection | null>>
}

/**
 * `delay` is a getter rather than a number so a consumer can turn paging off mid-drag by
 * binding it to zero: the reactive-prop-as-switch shape VCarousel's `autoplay` uses.
 */
export function useEdgeStep(
  onStep: (direction: EdgeDirection) => void,
  delay: () => number,
): EdgeStep {
  const timer = useTimer()
  const pending = ref<EdgeDirection | null>(null)

  function cancel() {
    timer.cancel()
    pending.value = null
  }

  function watchEdge(edge: EdgeDirection | null) {
    // Staying on the same edge must leave the armed timer alone. Re-arming on every move would
    // mean a pointer trembling by a pixel never reached the delay at all, and the calendar
    // would simply never page for anyone with an unsteady hand.
    if (edge === pending.value) return

    cancel()
    if (edge === null) return

    /*
     * The guard is what stops this recursing, not a convenience. `useTimer` runs a delay of
     * zero or less synchronously by design, and the callback below re-arms itself, so arming at
     * zero would call it again and again until the stack gave out.
     */
    const wait = delay()
    if (wait <= 0) return

    pending.value = edge

    const fire = () => {
      // The delay is asked again on every step: bound to zero while the drag is held against
      // the edge, paging stops before the next page rather than after it.
      const next = delay()
      if (next <= 0) {
        pending.value = null
        return
      }
      onStep(edge)
      timer.start(fire, next)
    }
    timer.start(fire, wait)
  }

  return { watchEdge, cancel, pending: readonly(pending) }
}
