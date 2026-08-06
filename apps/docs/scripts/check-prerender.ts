/**
 * Asserts the SSG output, on the artefact rather than the source — the docs' counterpart
 * of `packages/ui/scripts/check-css-split.ts`, wired at `postbuild` for the same reason.
 *
 * What it guards is the claim this whole site rests on: that the design system renders on
 * the SERVER. Every failure mode below is silent in a browser, because hydration repairs
 * it a moment later — a reader sees a correct page, and only a view-source or a
 * JavaScript-disabled visit would reveal that the first paint carried nothing.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(appRoot, '.vitepress/dist')

interface Assertion {
  what: string
  holds: (html: string) => boolean
}

/** A guide page: it has a sidebar, an outline, and the full navbar. */
const PAGE = 'guide/installation.html'

const ASSERTIONS: Assertion[] = [
  {
    what: 'the sidebar is rendered by the DS component, not injected on hydration',
    holds: (html) => html.includes('class="v-side-nav') && html.includes('aria-current="page"'),
  },
  {
    what: 'the active sidebar entry is an <a>, so the router can intercept it',
    holds: (html) => /<a[^>]*class="v-side-nav-action"[^>]*aria-current="page"/.test(html),
  },
  {
    what: 'the search field is a prerendered VCombobox',
    holds: (html) => html.includes('role="combobox"') && html.includes('class="v-input'),
  },
  {
    what: 'the theme switch is a prerendered VToggle with its three segments',
    holds: (html) => (html.match(/class="v-toggle-item/g) ?? []).length === 3,
  },
  {
    /*
     * Position within <head> is not the point — a synchronous script runs before any
     * paint wherever it sits — but being in <head> at all is: moved to <body> it would
     * run after the first paint and the dark theme would flash light.
     */
    what: 'the pre-paint theme script is in <head>',
    holds: (html) => html.slice(0, html.indexOf('</head>')).includes('vectis-theme-appearance'),
  },
  {
    what: 'Shiki emitted its dual-theme custom properties for the dark flip to act on',
    holds: (html) => html.includes('--shiki-dark:'),
  },
  {
    what: 'the navbar entries are DS buttons',
    holds: (html) => html.includes('class="v-button'),
  },
  {
    what: 'the partial icon resolver ran on the server (a docs-only name resolved to SVG)',
    holds: (html) => /data-icon="menu"[^>]*>.*?<svg/s.test(html),
  },
  {
    what: 'the built-in registry still answers alongside it (a DS-only name resolved)',
    holds: (html) => html.includes('data-icon="expand_more"'),
  },
  {
    what: 'the on-page outline is rendered',
    holds: (html) => html.includes('aria-label="On this page"'),
  },
  {
    // `withBase()` is the single writer of internal hrefs; one bypass and the link 404s
    // on the Pages sub-path while working perfectly in local preview.
    what: 'every internal href carries the base',
    holds: (html) =>
      html.includes('href="/vectis-ui/') &&
      !/href="\/(guide|components)\//.test(html) &&
      !/href="\/storybook\//.test(html),
  },
]

const file = resolve(distDir, PAGE)
let html: string
try {
  html = readFileSync(file, 'utf8')
} catch {
  console.error(`check-prerender: ${PAGE} is missing from .vitepress/dist — did the build run?`)
  process.exit(1)
}

const failures = ASSERTIONS.filter((assertion) => !assertion.holds(html))

if (failures.length > 0) {
  console.error(`check-prerender: ${failures.length} assertion(s) failed on ${PAGE}`)
  for (const failure of failures) console.error(`  · ${failure.what}`)
  process.exit(1)
}

console.log(`prerender OK — ${ASSERTIONS.length} assertions on ${PAGE}.`)
