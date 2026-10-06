// @core
/**
 * Render only the rows near the viewport of a scroll container, for VVirtualList and the virtual
 * mode of VCombobox. A row's size starts as an estimate and becomes its measured height once it
 * renders, remembered under its key, so rows may differ in height. The consumer renders
 * `segments`: the rows to draw, and spacers standing for the runs of rows left out.
 */
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  type ComponentPublicInstance,
  type ComputedRef,
  type Ref,
} from 'vue'

export interface VirtualListOptions {
  /** The element that scrolls. Null disables the windowing: every row up to `initialCount`. */
  scrollEl: Readonly<Ref<HTMLElement | null>>
  /** How many rows there are. */
  count: () => number
  /** A stable identity for a row, under which its measured size is remembered. */
  key: (index: number) => unknown
  /** The height assumed for a row not measured yet, in pixels. */
  itemSize: () => number
  /** How many rows to render beyond each edge of the viewport. */
  overscan: () => number
  /** How many rows to render before the container is measured: on the server and at hydration. */
  initialCount: () => number
  /** Rows kept rendered wherever the scroll is: the active option, the row holding the focus. */
  pinned?: () => readonly number[]
}

/** A row to render, or a block of empty space standing for the rows left out. */
export type VirtualSegment =
  { type: 'row'; index: number } | { type: 'spacer'; key: string; size: number }

export interface VirtualList {
  /** What to render, in order. */
  segments: ComputedRef<VirtualSegment[]>
  /** The template ref of a rendered row: `:ref="(el) => measure(el, index)"`. */
  measure: (target: Element | ComponentPublicInstance | null, index: number) => void
  /** Scrolls the container until the row is in view, rendering it first if it is not. */
  scrollToIndex: (index: number, align?: ScrollLogicalPosition) => Promise<void>
}

export function useVirtualList(options: VirtualListOptions): VirtualList {
  // Sizes are kept outside reactivity, a row measured once per render would otherwise trigger
  // one recomputation of the offsets each; `version` publishes a batch of them at once.
  const sizes = new Map<unknown, number>()
  const version = ref(0)
  const scrollTop = ref(0)
  const viewport = ref(0)
  const padStart = ref(0)
  // The space a flex or grid container puts between two rows. A spacer is a sibling too and
  // gets one, so it is taken off the spacer. A group nested in the container is expected to
  // space its own rows the same way, as VCombobox's groups do.
  const gap = ref(0)
  const measuring = ref(false)

  // Each row's pitch is its height plus the gap after it: the offset of row `i` is the sum of
  // the pitches before it, and the last offset is the height of the whole list plus one gap.
  const offsets = computed(() => {
    void version.value
    const n = options.count()
    const pitch = options.itemSize() + gap.value
    const out = new Float64Array(n + 1)
    for (let i = 0; i < n; i++) {
      const size = sizes.size > 0 ? sizes.get(options.key(i)) : undefined
      out[i + 1] = out[i]! + (size ?? pitch)
    }
    return out
  })

  /** The row under a position in the list, clamped to the rows that exist. */
  function indexAt(position: number) {
    const o = offsets.value
    let low = 0
    let high = o.length - 2
    while (low < high) {
      const mid = (low + high + 1) >> 1
      if (o[mid]! <= position) low = mid
      else high = mid - 1
    }
    return Math.max(0, low)
  }

  // Two numbers rather than one object: a computed object is new on every scroll event, and
  // the segments would then be rebuilt even when the window has not moved by a row.
  const start = computed(() => {
    if (!measuring.value) return 0
    return Math.max(0, indexAt(scrollTop.value - padStart.value) - options.overscan())
  })
  const end = computed(() => {
    const n = options.count()
    if (!measuring.value) return Math.min(n, options.initialCount())
    const last = indexAt(scrollTop.value - padStart.value + viewport.value)
    return Math.min(n, last + 1 + options.overscan())
  })

  const segments = computed<VirtualSegment[]>(() => {
    const n = options.count()
    const o = offsets.value
    const from = start.value
    const to = end.value
    const pinned = [...new Set(options.pinned?.() ?? [])]
      .filter((i) => i >= 0 && i < n && (i < from || i >= to))
      .sort((a, b) => a - b)
    const indexes = pinned.filter((i) => i < from)
    for (let i = from; i < to; i++) indexes.push(i)
    indexes.push(...pinned.filter((i) => i >= to))

    const out: VirtualSegment[] = []
    let next = 0
    for (const i of indexes) {
      if (i > next) out.push(spacer(next, o[i]! - o[next]!))
      out.push({ type: 'row', index: i })
      next = i + 1
    }
    if (next < n) out.push(spacer(next, o[n]! - o[next]!))
    return out
  })

  function spacer(from: number, span: number): VirtualSegment {
    return { type: 'spacer', key: `spacer:${from}`, size: Math.max(0, span - gap.value) }
  }

  const observed = new Set<HTMLElement>()
  const indexOf = new WeakMap<Element, number>()
  let observer: ResizeObserver | undefined

  function measure(target: Element | ComponentPublicInstance | null, index: number) {
    const el = target && '$el' in target ? target.$el : target
    if (!(el instanceof HTMLElement)) return
    indexOf.set(el, index)
    if (observed.has(el)) return
    observed.add(el)
    observer?.observe(el)
  }

  /** Records a row's height. Returns how much it moved the rows below it. */
  function record(el: Element, height: number) {
    const index = indexOf.get(el)
    if (index === undefined || index >= options.count()) return 0
    const key = options.key(index)
    const pitch = height + gap.value
    const previous = sizes.get(key) ?? options.itemSize() + gap.value
    // Sub-pixel rounding differs from one reading to the next and would never settle.
    if (Math.abs(pitch - previous) < 0.5) return 0
    sizes.set(key, pitch)
    return pitch - previous
  }

  function readContainer(el: HTMLElement) {
    const style = getComputedStyle(el)
    viewport.value = el.clientHeight
    padStart.value = parseFloat(style.paddingTop) || 0
    gap.value = parseFloat(style.rowGap) || 0
  }

  // @core
  // A row above the viewport that turns out taller or shorter than assumed pushes everything
  // in view by the difference. The scroll position follows it, so what the reader is looking at
  // stays put; the browser's own scroll anchoring is turned off by the consumer's stylesheet
  // (`overflow-anchor: none`), or both corrections would apply.
  function onResize(entries: ResizeObserverEntry[]) {
    const el = options.scrollEl.value
    if (!el) return
    const o = offsets.value
    const top = el.scrollTop - padStart.value
    let shift = 0
    let changed = false
    for (const entry of entries) {
      if (entry.target === el) {
        readContainer(el)
        continue
      }
      if (!entry.target.isConnected) continue
      const index = indexOf.get(entry.target)
      const delta = record(entry.target, entry.borderBoxSize[0]?.blockSize ?? 0)
      if (delta === 0) continue
      changed = true
      if (index !== undefined && o[index]! < top) shift += delta
    }
    if (changed) version.value++
    if (shift !== 0) {
      el.scrollTop += shift
      scrollTop.value = el.scrollTop
    }
  }

  /**
   * Reads every rendered row at once, without moving the scroll: used before an explicit
   * alignment, which already places the rows by their real boxes. The observer reports the same
   * heights afterwards and finds nothing left to correct.
   */
  function measureNow(container: HTMLElement) {
    const scale = scaleOf(container)
    let changed = false
    for (const el of observed) {
      if (el.isConnected && record(el, el.getBoundingClientRect().height / scale) !== 0) {
        changed = true
      }
    }
    if (changed) version.value++
  }

  /**
   * How much a transform scales the container, as a panel's entry animation does: boxes read
   * from the page are scaled, scroll positions and the observer's sizes are not.
   */
  function scaleOf(container: HTMLElement) {
    const height = container.offsetHeight
    return height > 0 ? container.getBoundingClientRect().height / height || 1 : 1
  }

  function elementAt(index: number) {
    for (const el of observed) if (el.isConnected && indexOf.get(el) === index) return el
    return undefined
  }

  const onScroll = (event: Event) => {
    scrollTop.value = (event.currentTarget as HTMLElement).scrollTop
  }

  watch(
    options.scrollEl,
    (el, _previous, onCleanup) => {
      measuring.value = !!el
      if (!el) return
      readContainer(el)
      scrollTop.value = el.scrollTop
      el.addEventListener('scroll', onScroll, { passive: true })
      // @fallback
      // jsdom has no ResizeObserver: the rows keep their estimated size there, and the
      // measuring is checked in a real browser.
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(onResize)
        observer.observe(el)
        for (const row of observed) observer.observe(row)
      }
      onCleanup(() => {
        el.removeEventListener('scroll', onScroll)
        observer?.disconnect()
        observer = undefined
      })
    },
    { flush: 'post', immediate: true },
  )

  // A row that leaves the window is dropped from the observer: the observer would otherwise keep
  // every row ever rendered alive, detached, for as long as the list lives.
  watch(
    segments,
    () => {
      for (const el of observed) {
        if (el.isConnected) continue
        observer?.unobserve(el)
        observed.delete(el)
      }
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => observed.clear())

  async function scrollToIndex(index: number, align: ScrollLogicalPosition = 'nearest') {
    const el = options.scrollEl.value
    if (!el || index < 0 || index >= options.count()) return
    if (!elementAt(index)) {
      // Placed by the offsets known so far, which renders the row; the real boxes then settle
      // the exact position below.
      const atStart = offsets.value[index]!
      const atEnd = offsets.value[index + 1]! - el.clientHeight
      let target = atStart
      if (align === 'end') target = atEnd
      else if (align === 'center') target = (atStart + atEnd) / 2
      else if (align === 'nearest' && atStart >= el.scrollTop - padStart.value) target = atEnd
      el.scrollTop = padStart.value + target
      scrollTop.value = el.scrollTop
      await nextTick()
    }
    const row = elementAt(index)
    if (!row) return
    measureNow(el)
    alignTo(el, row, align)
  }

  function alignTo(el: HTMLElement, row: HTMLElement, align: ScrollLogicalPosition) {
    const style = getComputedStyle(el)
    const padTop = parseFloat(style.paddingTop) || 0
    const padBottom = parseFloat(style.paddingBottom) || 0
    const scale = scaleOf(el)
    const box = el.getBoundingClientRect()
    const rect = row.getBoundingClientRect()
    const top = (rect.top - box.top) / scale - el.clientTop + el.scrollTop
    const height = rect.height / scale
    const bottom = top + height
    const view = el.clientHeight
    let next = el.scrollTop
    if (align === 'start') next = top - padTop
    else if (align === 'end') next = bottom - view + padBottom
    else if (align === 'center') next = top + height / 2 - view / 2
    else if (top - padTop < el.scrollTop) next = top - padTop
    else if (bottom + padBottom > el.scrollTop + view) next = bottom - view + padBottom
    el.scrollTop = next
    scrollTop.value = el.scrollTop
  }

  return { segments, measure, scrollToIndex }
}
