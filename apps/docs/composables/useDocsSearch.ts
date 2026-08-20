/**
 * The Ctrl/⌘+K search over the documentation's own table of contents.
 *
 * It indexes page TITLES and slugs, and nothing else — no full-text index, no build step, no
 * dependency. That is a deliberate ceiling rather than a first draft: the thing a reader
 * reaches for the shortcut to do is jump to a component they can already name.
 *
 * The titles come from the message catalogue, so the index is in the reader's language, and the
 * slug stays searchable in both — an English reader's muscle memory for `side-navigation` finds
 * the page on the French site too.
 *
 * The open state is shared, because the trigger lives in the header and the dialog is a
 * sibling of it in the layout.
 */
import { allPages, type NavEntry, type NavGroupId } from '~/content/nav'

export interface SearchResult extends NavEntry {
  title: string
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

  const { t } = useI18n()
  const localePath = useLocalePath()

  const results = computed<SearchResult[]>(() => {
    const needle = normalize(query.value.trim())
    return allPages
      .map((page) => ({ page, title: t(`nav.${page.slug}`) }))
      .filter(
        ({ page, title }) =>
          !needle || normalize(title).includes(needle) || normalize(page.slug).includes(needle),
      )
      .slice(0, 40)
      .map(({ page, title }) => ({
        ...page,
        title,
        section: sectionLabel(page.section, page.written),
        to: localePath(`/docs/${page.slug}`),
      }))
  })

  /*
   * The stub warning is appended rather than built into the group name, because it is a state
   * of the page and not a place in the table of contents — the same group holds written pages
   * beside it. The separator is a middle dot in both languages; only the words change.
   */
  function sectionLabel(section: NavGroupId, written: boolean): string {
    const group = t(`nav.group.${section}`)
    return written ? group : `${group} · ${t('common.search.notWritten')}`
  }

  function openSearch() {
    query.value = ''
    open.value = true
  }

  function closeSearch() {
    open.value = false
  }

  return { open, query, results, openSearch, closeSearch }
}
