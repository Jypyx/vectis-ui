// @core
/**
 * What asks VCombobox for the next page as the reader reaches the end of the list.
 *
 * Nothing in CSS can report that an element has come into view, so this is code by
 * necessity: a marker is rendered at the foot of the panel and watched, with the panel
 * itself — the box that scrolls — as the frame it is watched within.
 *
 * The module lives in the component's folder rather than among the shared ones, for the
 * usual reason: a single consumer, so it does not qualify as shared code, and VCombobox
 * owns the contract. Promote it the day a second panel paginates.
 *
 * It should not be confused with the shared observer between VTabs and VCombobox that
 * was deliberately refused: VTabs watches two markers at the ends of a row to enable or
 * disable buttons, which has nothing in common with paging a list.
 */
import { watch, type Ref } from 'vue'

export interface InfiniteScrollOptions {
  /** The marker at the foot of the list. It is absent when there is nothing left to load. */
  sentinelEl: Ref<HTMLElement | null>
  /** Whether a page may be asked for right now: the panel open, more to come, none in flight. */
  canLoad: () => boolean
  /** How many options are loaded. Its growth is the signal that a page has arrived. */
  loadedCount: () => number
  /** Asks for the next page. */
  onLoadMore: () => void
}

export interface InfiniteScroll {
  /**
   * Releases the lock that stops two requests overlapping.
   *
   * It must be called wherever a page that was asked for can no longer arrive — when the
   * panel closes, above all. Without that, a request which failed would leave the paging
   * frozen for the rest of the session.
   */
  reset: () => void
}

export function useInfiniteScroll(options: InfiniteScrollOptions): InfiniteScroll {
  let observer: IntersectionObserver | null = null
  /*
   * A lock of our own, set the instant a page is asked for. The consumer's loading flag
   * cannot serve: they raise it when their request starts, which is at best a tick
   * later, and the gap between the two is wide enough for several requests to go out.
   */
  let pending = false

  function onIntersect(entries: IntersectionObserverEntry[]) {
    if (!entries.some((entry) => entry.isIntersecting)) return
    if (pending || !options.canLoad()) return
    pending = true
    options.onLoadMore()
  }

  watch(
    options.sentinelEl,
    (el, _previous, onCleanup) => {
      // @fallback
      // The observer does not exist in the unit-test environment, so its absence has to
      // be tolerated rather than assumed away; the behaviour is checked in a real
      // browser.
      if (!el || typeof IntersectionObserver === 'undefined') return
      // TRAP — the panel must be named as the frame the marker is watched within, and it
      // is found by its ARIA role, which is public API, rather than by an internal class.
      // Left unspecified, the frame would be the VIEWPORT — and since the panel floats
      // above the page, the marker would count as visible from the very first moment,
      // firing a burst of requests for every page at once.
      const root = el.closest('[role="listbox"]')
      if (!root) return
      observer = new IntersectionObserver(onIntersect, {
        root,
        // The next page is asked for half a panel before the marker is actually reached,
        // so the list is already growing by the time the reader gets there. It is
        // expressed as a proportion of the panel rather than as a number of pixels.
        rootMargin: '0px 0px 50% 0px',
      })
      observer.observe(el)
      onCleanup(() => {
        observer?.disconnect()
        observer = null
      })
    },
    { flush: 'post' },
  )

  // TRAP — an observer only reports a CROSSING. If the page that arrives is too short to
  // push the marker out of view, the marker stays visible without ever crossing anything
  // again, and the loading would stop dead at the second page. Watching it afresh after
  // each page forces a new answer.
  //
  // It also gives the stopping condition away for nothing: a source that returns no new
  // option leaves the count unchanged, this never runs, and the loop simply ends.
  watch(options.loadedCount, () => {
    pending = false
    const el = options.sentinelEl.value
    if (!observer || !el) return
    observer.unobserve(el)
    observer.observe(el)
  })

  return {
    reset: () => {
      pending = false
    },
  }
}
