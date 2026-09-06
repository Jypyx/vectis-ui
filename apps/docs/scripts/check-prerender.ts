/**
 * Post-build guard: every route the navigation offers must exist as a file in the artefact.
 *
 * A static site has exactly one silent failure mode — a route that never rendered. Nothing
 * errors: the build succeeds, the link is in the sidebar, and the visitor gets GitHub Pages'
 * own 404. This walks the same `content/nav.ts` the sidebar and the prerender list are built
 * from, so the three cannot disagree without the build going red.
 *
 * It also checks `.nojekyll`, without which GitHub Pages silently drops every path beginning
 * with an underscore — which is where Nuxt puts its build assets, so the site would load
 * with no CSS and no JavaScript at all.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { allPages, docRoutes } from '../content/nav'
import { SITE_URL } from '../content/site'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(appRoot, '.output', 'public')

/** Nuxt writes `/a/b` as `a/b/index.html`, and the site root as `index.html`. */
const fileFor = (route: string) =>
  join(outDir, route === '/' ? 'index.html' : join(route, 'index.html'))

/**
 * The locale segments, mirroring `LOCALE_PREFIXES` in content/site.ts.
 *
 * The list is written out again rather than imported from `content/site.ts`, and deliberately:
 * this script must be able to fail when the configuration and the navigation disagree, which it
 * cannot do if it derives its expectations from the very files it is checking.
 */
const LOCALE_PREFIXES = ['', '/fr']

const routes = LOCALE_PREFIXES.flatMap((prefix) => [
  `${prefix}/`,
  `${prefix}/docs`,
  ...docRoutes(prefix),
])
const missing = routes.filter((route) => !existsSync(fileFor(route)))

if (!existsSync(outDir)) {
  console.error(`check-prerender: ${outDir} does not exist — did the build run?`)
  process.exit(1)
}

if (!existsSync(join(outDir, '.nojekyll'))) {
  console.error(
    'check-prerender: .nojekyll is missing — GitHub Pages would drop every _nuxt/ asset.\n' +
      "  Expected from nitro's `github-pages` preset.",
  )
  process.exit(1)
}

/*
 * Every slug in the inventory must have a page file of its own. There is no stub route to fall
 * back on any more, so a slug without one is a 404 the crawler would report as a missing route
 * — but only if it happened to be linked. Checking the files directly says which one, and why.
 */
const pageless = allPages.filter(
  (page) => !existsSync(join(appRoot, 'pages', 'docs', `${page.slug}.vue`)),
)

if (pageless.length > 0) {
  console.error(`check-prerender: ${pageless.length} slug(s) in content/nav.ts have no page file:`)
  for (const page of pageless) console.error(`  ${page.slug} → pages/docs/${page.slug}.vue`)
  process.exit(1)
}

if (missing.length > 0) {
  console.error(`check-prerender: ${missing.length} route(s) in content/nav.ts were not rendered:`)
  for (const route of missing) console.error(`  ${route}`)
  process.exit(1)
}

/*
 * The two SEO files, and what the sitemap says.
 *
 * Both are server routes, so both are RENDERED rather than copied: a route dropped from the
 * prerender list leaves no file and nothing else complains, and a sitemap that lost a page is
 * a page a crawler is never told about. Comparing the URLs it lists against the navigation is
 * the same guard the routes above get, applied to the file that advertises them.
 *
 * The origin comes from the same constant the route builds its URLs from, so this cannot catch
 * a wrong domain. What it catches is drift between the sitemap and the inventory, which is the
 * failure that actually happens.
 */
const seoFiles = ['robots.txt', 'sitemap.xml'].filter((file) => !existsSync(join(outDir, file)))

if (seoFiles.length > 0) {
  console.error(`check-prerender: ${seoFiles.join(' and ')} missing from the artefact.`)
  console.error('  Expected from server/routes/, named in nitro.prerender.routes.')
  process.exit(1)
}

const sitemapUrls = new Set(
  LOCALE_PREFIXES.flatMap((prefix) => [
    `${SITE_URL}${prefix}/`,
    ...docRoutes(prefix).map((route) => `${SITE_URL}${route}/`),
  ]),
)

// A lookbehind and a negated class, rather than a capture group: the match IS the URL, so
// nothing has to be indexed out of it and the set cannot take in an undefined. `[^<]+` stops
// at the closing tag on its own.
const listed = new Set(
  readFileSync(join(outDir, 'sitemap.xml'), 'utf8').match(/(?<=<loc>)[^<]+/g) ?? [],
)

const unlisted = [...sitemapUrls].filter((url) => !listed.has(url))
const strays = [...listed].filter((url) => !sitemapUrls.has(url))

if (unlisted.length > 0 || strays.length > 0) {
  console.error('check-prerender: sitemap.xml does not match content/nav.ts:')
  for (const url of unlisted) console.error(`  missing  ${url}`)
  for (const url of strays) console.error(`  unknown  ${url}`)
  process.exit(1)
}

console.log(
  `check-prerender: ${routes.length} routes rendered, ${sitemapUrls.size} in sitemap.xml, ` +
    'robots.txt and .nojekyll present',
)
