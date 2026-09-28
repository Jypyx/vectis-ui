import { docRoutes } from '../../content/nav'
import { LOCALE_PREFIXES, SITE_URL } from '../../content/site'

/**
 * The sitemap, built from the same `content/nav.ts` the rail and the prerender list are built
 * from; so a page cannot be in the navigation, be published, and stay invisible to a crawler.
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
