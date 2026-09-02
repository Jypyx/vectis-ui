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
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { allPages, docRoutes } from '../content/nav'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(appRoot, '.output', 'public')

/** Nuxt writes `/a/b` as `a/b/index.html`, and the site root as `index.html`. */
const fileFor = (route: string) =>
  join(outDir, route === '/' ? 'index.html' : join(route, 'index.html'))

/**
 * The locale segments, mirroring `LOCALE_PREFIXES` in nuxt.config.ts.
 *
 * They are written out twice rather than shared, and deliberately: this script must be able to
 * fail when the config and the navigation disagree, which it cannot do if it derives its
 * expectations from the very file it is checking.
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

console.log(`check-prerender: ${routes.length} routes rendered, .nojekyll present`)
