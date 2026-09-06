import { docRoutes } from '../../content/nav'
import { LOCALE_PREFIXES, SITE_URL } from '../../content/site'

/**
 * The sitemap, built from the same `content/nav.ts` the rail and the prerender list are built
 * from — so a page cannot be in the navigation, be published, and stay invisible to a crawler.
 *
 * It is a SERVER ROUTE and not a file in `public/` because it has to be derived rather than
 * typed out: a hand-written list of a hundred and eight URLs is a list that goes stale on the
 * next page. Nitro prerenders it like any other route, so the artefact GitHub Pages publishes
 * holds a plain `sitemap.xml`; nothing runs at request time. `scripts/check-prerender.ts` then
 * checks that what it holds is every route the navigation offers.
 *
 * Every URL carries a TRAILING SLASH, and that is not cosmetic: the site is published as
 * `<route>/index.html`, so GitHub Pages answers the slashless form with a 301 to this one. A
 * sitemap is a list of addresses a crawler should fetch, and an address that redirects is one
 * it has to be told twice about. It is the form the canonical, the `hreflang` alternates and
 * every internal href carry as well, which `i18n.trailingSlash` in nuxt.config.ts is what
 * settles — so the three cannot name the same page differently.
 */
export default defineEventHandler((event) => {
  const paths = LOCALE_PREFIXES.flatMap((prefix) => [
    `${prefix}/`,
    ...docRoutes(prefix).map((route) => `${route}/`),
  ])

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  // The paths are slugs and locale segments, so none of them can carry a character XML would
  // need escaped. Anything that could would have to be escaped here.
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n')
})
