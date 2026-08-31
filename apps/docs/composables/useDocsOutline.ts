/**
 * "On this page" — the outline of the article being read, and the entry that lights up.
 *
 * The outline is HARVESTED from the rendered prose rather than kept as a second list beside
 * the page, so a heading and its entry cannot drift apart: adding an `<h2 id>` to a page is
 * the whole of adding it to the outline.
 *
 * That entry is also written into the address bar as a fragment, by the scroll as much as by
 * a click on the rail, so the page a reader reloads or shares reopens where they were.
 *
 * The active entry is the LAST heading whose top has passed under the sticky header, which
 * is the one the reader is actually inside. An IntersectionObserver is the wrong tool here
 * and not merely a heavier one: it reports a heading ENTERING THE VIEWPORT, which is a
 * different event from the section being read — scrolling down past a long section makes its
 * heading leave the viewport entirely while the reader is still in it.
 */
export interface OutlineEntry {
  id: string
  title: string
  level: 2 | 3
}

/** The 64px header plus a little breathing room — the twin of the `scroll-padding-block-start`
 *  docs-layout.css sets on the root, which is what makes a fragment the BROWSER scrolls to (a
 *  reload, a pasted link) land on the same line as one this file scrolls to. Move one, move both. */
const HEADER_LINE = 72

const HEADINGS = '.vd-prose > h2[id], .vd-prose > h3[id]'

export function useDocsOutline() {
  const outline = ref<OutlineEntry[]>([])
  const activeId = ref('')

  // jsdom and the server have no layout; everything below is client-only by construction.
  if (import.meta.server) {
    return { outline, activeId, jumpTo: () => {} }
  }

  let frame = 0

  function headings(): HTMLElement[] {
    return [...document.querySelectorAll<HTMLElement>(HEADINGS)]
  }

  function spy() {
    const nodes = headings()
    if (nodes.length === 0) {
      activeId.value = ''
      syncHash('')
      return
    }

    // The last heading whose top has passed under the header, and an empty string while the
    // reader is still above the first one — the two states the URL has to tell apart.
    let passed = ''
    for (const node of nodes) {
      if (node.getBoundingClientRect().top <= HEADER_LINE) passed = node.id
    }

    // At the very bottom the last section may be too short to reach the line on its own,
    // and the reader would then never see its entry highlighted at all.
    const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
    if (atEnd) passed = nodes[nodes.length - 1]!.id

    // The rail always lights an entry: at the top of the page, where nothing has been passed
    // yet, that is the first one. The ADDRESS BAR does not follow it there — a hash written
    // before the reader has reached the first section would send a reload straight to that
    // section instead of to the top of the page they had actually bookmarked.
    activeId.value = passed || nodes[0]!.id
    syncHash(passed)
  }

  function harvest() {
    outline.value = headings().map((node) => ({
      id: node.id,
      title: node.textContent ?? '',
      level: node.tagName === 'H3' ? 3 : 2,
    }))
    spy()
  }

  // Scroll fires far faster than a frame; coalescing to one rAF is what keeps the read of
  // every heading's rect off the critical path.
  function onScroll() {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      spy()
    })
  }

  /**
   * Writes the section being read into the address bar, so that reloading the page — or
   * pasting the URL somewhere — comes back to the same place rather than to the top.
   *
   * `history.replaceState` and deliberately NOT the router: `router.replace({ hash })` runs
   * Nuxt's scroll behaviour, which scrolls to the hash it was just given — fighting the very
   * scroll that produced it. REPLACE and not push, or reading one page down to its end would
   * bury the previous page under a dozen history entries and make the back button useless.
   */
  function syncHash(id: string) {
    const hash = id ? `#${id}` : ''
    if (hash === window.location.hash) return
    history.replaceState(history.state, '', `${location.pathname}${location.search}${hash}`)
  }

  function scrollToHeading(id: string, behavior: ScrollBehavior) {
    const target = document.getElementById(id)
    if (!target) return
    // `scrollIntoView` would park the heading under the sticky header. The offset is the
    // same line the spy uses, so the entry that lights up is the one just clicked.
    const top = target.getBoundingClientRect().top + window.scrollY - HEADER_LINE
    window.scrollTo({ top, behavior })
  }

  function jumpTo(id: string) {
    scrollToHeading(id, 'smooth')
    // The spy would write the same hash as the scroll settles. Writing it here too is what
    // leaves the right one behind when the reader interrupts that scroll halfway.
    syncHash(id)
  }

  const route = useRoute()

  onMounted(async () => {
    await nextTick()

    // A page opened ON a fragment. The browser has already jumped there and `scroll-padding`
    // kept the heading clear of the sticky header, but the prose above it may have grown in
    // the meantime — a webfont swapping in, a demo mounting. One re-alignment, without a
    // transition, is what makes the landing exact whatever happened during hydration.
    //
    // It is read BEFORE the harvest and not after: the spy that harvesting runs would clear a
    // hash it believes unreached, and this would then have nothing left to land on.
    const landing = decodeURIComponent(location.hash.slice(1))

    harvest()
    if (landing) scrollToHeading(landing, 'auto')

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
  })

  // A new page means a new set of headings. `flush: 'post'` plus a tick is what waits for
  // the outgoing page's DOM to have been replaced rather than harvesting it again.
  watch(
    () => route.fullPath,
    async () => {
      await nextTick()
      harvest()
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (frame) cancelAnimationFrame(frame)
  })

  return { outline, activeId, jumpTo }
}
