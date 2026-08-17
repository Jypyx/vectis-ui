/**
 * The Ctrl/⌘+K search over the documentation's own table of contents.
 *
 * It indexes page TITLES and slugs, and nothing else — no full-text index, no build step, no
 * dependency. That is a deliberate ceiling rather than a first draft: the thing a reader
 * reaches for the shortcut to do is jump to a component they can already name.
 *
 * The open state is shared, because the trigger lives in the header and the dialog is a
 * sibling of it in the layout.
 */
import { allPages, type NavEntry } from '~/content/nav'

export interface SearchResult extends NavEntry {
  /** The group, plus a warning where the page is a stub — better said than discovered. */
  section: string
  to: string
}

/**
 * Accent-insensitive comparison, so "Localisation" answers to "localisation" and a French
 * reader typing "française" still finds a page spelled without the accent. Decomposing to
 * NFD is what separates a letter from its marks; `\p{Diacritic}` then drops the marks alone.
 *
 * The library has exactly this helper in `utils/text.ts`, but its internals are explicitly
 * NOT public API, so the site carries its own three lines rather than reaching past the
 * entry point.
 */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function useDocsSearch() {
  const open = useState('docs-search-open', () => false)
  const query = useState('docs-search-query', () => '')

  const results = computed<SearchResult[]>(() => {
    const needle = normalize(query.value.trim())
    return allPages
      .filter(
        (page) =>
          !needle ||
          normalize(page.title).includes(needle) ||
          normalize(page.slug).includes(needle),
      )
      .slice(0, 40)
      .map((page) => ({
        ...page,
        section: page.written ? page.section : `${page.section} · not written yet`,
        to: `/docs/${page.slug}`,
      }))
  })

  function openSearch() {
    query.value = ''
    open.value = true
  }

  function closeSearch() {
    open.value = false
  }

  return { open, query, results, openSearch, closeSearch }
}
