// @core
/**
 * Observe a list's sentinel to request another page, for VCombobox and VVirtualList; retain
 * ownership of data fetching with the consumer.
 */
import { watch, type Ref } from 'vue'

export interface InfiniteScrollOptions {
  /** The marker at the foot of the list. It is absent when there is nothing left to load. */
  sentinelEl: Ref<HTMLElement | null>
  /**
   * The scrolling frame the marker is watched within. Left to the viewport, a marker inside a
   * panel floating above the page would count as visible from the very first moment, firing a
   * burst of requests for every page at once.
   */
  root: (sentinel: HTMLElement) => Element | null
  /** Whether a page may be asked for right now: the panel open, more to come, none in flight. */
  canLoad: () => boolean
  /**
   * The options loaded so far. A change in their NUMBER is the signal that a page has
   * arrived; a new array of the same length counts only after `restart`.
   */
  loaded: () => readonly unknown[]
  /** Asks for the next page. */
  onLoadMore: () => void
}

export interface InfiniteScroll {
  /** Releases the lock that stops two requests overlapping. */
  reset: () => void
  /**
   * Releases the lock and takes the next list handed over as an arrival, whatever its length.
   * For a new search: the page asked for under the old term never lands, and the new first page
   * may be exactly as long as the list it replaces.
   */
  restart: () => void
}

export function useInfiniteScroll(options: InfiniteScrollOptions): InfiniteScroll {
  let observer: IntersectionObserver | null = null
  /*
   * The consumer's loading flag cannot serve: they raise it when their request starts, which is
   * at best a tick later, and the gap between the two is wide enough for several requests to go
   * out.
   */
  let pending = false
  let rearm = false

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
      const root = options.root(el)
      if (!root) return
      observer = new IntersectionObserver(onIntersect, {
        root,
        // The next page is asked for half a frame before the marker is actually reached,
        // so the list is already growing by the time the reader gets there. It is
        // expressed as a proportion of the frame rather than as a number of pixels.
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

  // An observer only reports a CROSSING. If the page that arrives is too short to push the
  // marker out of view, the marker stays visible without ever crossing anything again, and the
  // loading would stop dead at the second page.
  watch(options.loaded, (list, previous) => {
    if (list.length === previous.length && !rearm) return
    rearm = false
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
    restart: () => {
      pending = false
      rearm = true
    },
  }
}
