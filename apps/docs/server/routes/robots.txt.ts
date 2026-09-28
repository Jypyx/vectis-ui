import { SITE_URL } from '../../content/site'

/**
 * The crawl policy, which is to say: crawl everything, and here is the map. It REPLACES the
 * robots.txt GitHub Pages serves by default, which carries no directive at all: it is a block
 * of comments describing the content signals vocabulary, and it grants and restricts nothing.
 */
export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''].join('\n')
})
