import { SITE_URL } from '../../content/site'

/**
 * The crawl policy, which is to say: crawl everything, and here is the map.
 *
 * Nothing on this site is private and nothing is generated per visitor, so there is nothing to
 * disallow. What the file is really here for is the `Sitemap` line, which is the only way a
 * crawler that has not been told about the site in a search console finds the sitemap at all.
 *
 * It is a server route rather than a file in `public/` so that the origin is written once, in
 * `content/site.ts`, alongside the one the canonical URLs are built from. A static file would
 * hold a second copy of the domain, and the two would be free to disagree.
 *
 * It REPLACES the robots.txt GitHub Pages serves by default, which carries no directive at all:
 * it is a block of comments describing the content signals vocabulary, and it grants and
 * restricts nothing. Reserving any right it describes means writing the signal out here.
 */
export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''].join('\n')
})
