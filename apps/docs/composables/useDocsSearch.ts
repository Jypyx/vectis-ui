/** Share search state between the header trigger and the sibling dialog. */
import { allPages, type NavEntry } from '~/content/nav'

export interface SearchResult extends NavEntry {
  title: string
  /** The group the page belongs to, as the rail names it. */
  section: string
  to: string
}

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
        section: t(`nav.group.${page.section}`),
        to: localePath(`/docs/${page.slug}`),
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
