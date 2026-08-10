// @core
/**
 * The infinite-scroll plumbing of VCombobox's listbox.
 *
 * Justified JS: no CSS primitive signals reaching the end of a list. A sentinel
 * rendered at the foot of the panel is observed, the panel — the scroll container —
 * serving as the observer's `root`.
 *
 * It lives in VCombobox's folder rather than in `composables/`: one consumer, so it
 * fails the ≥2-consumers admission rule, and VCombobox is the owner of the contract
 * (`VIcon/resolver.ts` and `VHotkeys/platform.ts` set the precedent). Promote it the
 * day a second panel paginates — and note that this is NOT the deliberately-refused
 * "shared IntersectionObserver for VTabs and VCombobox": VTabs observes two edge
 * sentinels to toggle buttons, which shares nothing with paging a list.
 */
import { watch, type Ref } from 'vue'

export interface InfiniteScrollOptions {
  /** The sentinel at the foot of the list; `null` when there is no more to load. */
  sentinelEl: Ref<HTMLElement | null>
  /** May a page be requested right now? (panel open, more to come, not loading) */
  canLoad: () => boolean
  /** Grows when a page lands — the signal that a new evaluation is due. */
  loadedCount: () => number
  onLoadMore: () => void
}

export interface InfiniteScroll {
  /**
   * Releases the emission lock. To be called wherever a requested page can no longer
   * arrive — closing the panel — otherwise a failed request freezes the pagination
   * for good.
   */
  reset: () => void
}

export function useInfiniteScroll(options: InfiniteScrollOptions): InfiniteScroll {
  let observer: IntersectionObserver | null = null
  /*
   * A SYNCHRONOUS lock, on top of the consumer's `loading`: that prop is set
   * asynchronously (when the request returns), and the window between the emission
   * and that update would be enough to emit several times.
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
      // `IntersectionObserver` does not exist in jsdom (the same guard as the
      // `?.scrollIntoView?.()` in the component) — the behaviour is tested in the browser.
      if (!el || typeof IntersectionObserver === 'undefined') return
      // The panel is the scroll container, designated by its ARIA role (a public API)
      // rather than by an internal class of the listbox. Without it, `root: null` would
      // target the viewport: since the panel is in the top layer, the sentinel would
      // always appear visible there → a burst of load requests.
      const root = el.closest('[role="listbox"]')
      if (!root) return
      observer = new IntersectionObserver(onIntersect, {
        root,
        // preloads half a panel height before the bottom (no dimension literal: it is
        // relative to the root)
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

  // The callback only fires when the threshold is CROSSED: if the page received does
  // not fill the panel, the sentinel stays visible without ever re-triggering and the
  // loading would stop at the second page. It is re-observed on every page to force a
  // fresh evaluation — and if the source returned nothing (the same count), nothing
  // relaunches the loop: a free stopping condition.
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
