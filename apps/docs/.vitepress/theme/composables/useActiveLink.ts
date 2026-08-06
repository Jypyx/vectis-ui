import { useData, withBase } from 'vitepress'
import { computed, type ComputedRef } from 'vue'

/**
 * The canonical key of the page being rendered, in the SAME spelling as `nav.ts`'s
 * `link` fields: `/guide/installation` for a page, `/guide/` for a section index, `/`
 * for the home page.
 *
 * Derived from `page.relativePath` and NOT from `useRoute().path`: `relativePath` is
 * always the source file's path (`guide/installation.md`), so it carries no `base`, no
 * `cleanUrls` variant, no `.html` — the server and the client compute the identical
 * string, and no normalisation can drift when one of those config options changes.
 * Peeling them off `route.path` instead is what typically breaks a deep link: the first
 * client-side `route.path` still carries `base`, so the sidebar highlights nothing on a
 * directly-loaded page.
 *
 * A section index keeps its TRAILING SLASH, and that is not cosmetic: vitepress's client
 * maps a path back to its source file by appending `index` to a path ending in `/`, so
 * `/guide` would be looked up as `guide.md` and 404 inside the SPA.
 */
export function useActiveLink(): ComputedRef<string> {
  const { page } = useData()
  return computed(
    () => '/' + page.value.relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1'),
  )
}

/**
 * The one place a `link` from `nav.ts` becomes an href: it applies `base`, and the
 * `.html` that `cleanUrls: false` would owe us. A section index needs neither — a
 * directory URL is served by its `index.html` under both settings. Reading
 * `site.cleanUrls` rather than hard-coding the current value means flipping that config
 * option needs no change here.
 */
export function useDocsHref(): (link: string) => string {
  const { site } = useData()
  return (link: string) =>
    withBase(site.value.cleanUrls || link.endsWith('/') ? link : `${link}.html`)
}
