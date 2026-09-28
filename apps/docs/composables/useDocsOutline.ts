/** Read headings from the article DOM so the outline follows the rendered, localized content. */
export interface OutlineEntry {
  id: string
  title: string
  level: 2 | 3
}

/** Keep this offset aligned with scroll-padding-block-start in docs-layout.css. */
const HEADER_LINE = 72

const HEADINGS = '.vd-prose > h2[id], .vd-prose > h3[id]'

export function useDocsOutline() {
  const outline = ref<OutlineEntry[]>([])
  const activeId = ref('')

  // Jsdom and the server have no layout; everything below is client-only by construction.
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

    // An empty fragment distinguishes the top of the page from the first section.
    let passed = ''
    for (const node of nodes) {
      if (node.getBoundingClientRect().top <= HEADER_LINE) passed = node.id
    }

    // At the very bottom the last section may be too short to reach the line on its own,
    // and the reader would then never see its entry highlighted at all.
    const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
    if (atEnd) passed = nodes[nodes.length - 1]!.id

    // Highlight the first entry above all headings, but leave the URL fragment empty so reloads
    // stay at the page top.
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

    // Realign the initial fragment after hydration when fonts or component mounts can shift
    // heading positions.
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
