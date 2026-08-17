/**
 * "On this page" — the outline of the article being read, and the entry that lights up.
 *
 * The outline is HARVESTED from the rendered prose rather than kept as a second list beside
 * the page, so a heading and its entry cannot drift apart: adding an `<h2 id>` to a page is
 * the whole of adding it to the outline.
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

/** The 56px header plus a little breathing room. */
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
      return
    }

    let id = nodes[0]!.id
    for (const node of nodes) {
      if (node.getBoundingClientRect().top <= HEADER_LINE) id = node.id
    }

    // At the very bottom the last section may be too short to reach the line on its own,
    // and the reader would then never see its entry highlighted at all.
    const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
    if (atEnd) id = nodes[nodes.length - 1]!.id

    activeId.value = id
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

  function jumpTo(id: string) {
    const target = document.getElementById(id)
    if (!target) return
    // `scrollIntoView` would park the heading under the sticky header. The offset is the
    // same line the spy uses, so the entry that lights up is the one just clicked.
    const top = target.getBoundingClientRect().top + window.scrollY - HEADER_LINE
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const route = useRoute()

  onMounted(async () => {
    await nextTick()
    harvest()
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
