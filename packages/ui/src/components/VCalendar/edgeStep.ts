// @core
/**
 * Holding a dragged event against the side of the calendar to turn the page.
 *
 * Without it, moving a meeting to next week means dropping it, navigating, and picking it up
 * again — the drag can only ever reach what is already on screen. With it, resting against an
 * edge shows the previous or next period and the event carries on travelling.
 *
 * WHY IT WAITS. Paging the instant the pointer touched the edge would make the last day of the
 * week unaimable: you would have to approach it from above and stop dead, and the smallest
 * overshoot would throw you into the following week. The delay is what separates "I am aiming
 * at the edge column" from "I want to go further", and it is the only thing that does.
 *
 * It sits in VCalendar's own folder rather than in `composables/` because VCalendar owns the
 * contract and both of its consumers are inside this component — the same reasoning as
 * `VCombobox/infiniteScroll.ts`, which is likewise a Vue-using module living beside the thing
 * it belongs to.
 */
import { readonly, ref, type Ref } from 'vue'

import { useTimer } from '../../composables/useTimer'

/**
 * How long a dragged event rests against an edge before the calendar pages, in milliseconds.
 *
 * Long enough that aiming at the edge column never pages by accident, short enough that
 * deliberately holding there does not feel broken. It is a matter of feel rather than of
 * correctness, so it is tuned by eye and exposed as `edgeStepDelay` for anyone who disagrees
 * — which is also why no test pins the number itself.
 */
export const EDGE_STEP_DELAY = 800

/**
 * How wide the edge zone is, in pixels.
 *
 * TRAP — this number is the twin of `--vectis-control-size-calendar-edge`, the width of the
 * band the stylesheet lights up to show that paging is coming. They describe the same strip:
 * moving one without the other leaves the calendar paging from somewhere other than where it
 * said it would, with nothing anywhere to point at it. The same arrangement as
 * `DIAL_INNER_THRESHOLD` in `utils/time.ts`, and it carries the same warning at both ends.
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
 * binding it to zero — the reactive-prop-as-switch shape VCarousel's `autoplay` uses.
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
    // Staying on the SAME edge must leave the armed timer alone. Re-arming on every move
    // would mean a pointer trembling by a pixel never reached the delay at all, and the
    // calendar would simply never page for anyone with an unsteady hand.
    if (edge === pending.value) return

    cancel()
    if (edge === null) return

    /*
     * TRAP — the guard is what stops this recursing, not a convenience. `useTimer` runs a
     * delay of zero or less SYNCHRONOUSLY by design, and the callback below re-arms itself,
     * so arming at zero would call it again and again until the stack gave out. Refusing to
     * arm is also how a consumer switches paging off, so the two are one line.
     */
    const wait = delay()
    if (wait <= 0) return

    pending.value = edge

    const fire = () => {
      onStep(edge)
      // Re-armed, so holding against the edge keeps paging rather than stopping after one.
      timer.start(fire, wait)
    }
    timer.start(fire, wait)
  }

  return { watchEdge, cancel, pending: readonly(pending) }
}
