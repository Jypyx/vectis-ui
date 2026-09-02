/**
 * Post-build guard: every row of every API table has a description, in both languages.
 *
 * A component page's API section is built from two halves that nothing else holds together. The
 * structure — names, types, defaults — is generated from the library source by `build-api.ts`.
 * The descriptions are prose, written and translated by hand in `i18n/locales/{en,fr}/`. Add a
 * prop to the library, regenerate, and the row appears on the site with `switch.api.VSwitch.
 * props.spread` printed where its sentence should be: vue-i18n renders a missing key as the key.
 *
 * This walks the two halves against each other and fails on either kind of drift — a row with no
 * description, and a description for a row that no longer exists.
 *
 * It runs at `postbuild`, beside `check-prerender.ts`, and reports every mismatch at once rather
 * than the first: a batch of six pages is meant to be fixed in one pass.
 */
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import type { ComponentApi, PageApi } from '../content/api/types'

import { keyOf } from '../content/api/types'
import { allPages } from '../content/nav'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/* An absolute Windows path is not a URL the ESM loader accepts: `c:` reads as a protocol. */
const load = async (file: string) =>
  (await import(pathToFileURL(file).href)) as { default: unknown }

/** The catalogue module a slug's words live in: `side-navigation` → `sideNavigation`. */
function moduleOf(slug: string): string {
  return slug.replace(/-(.)/g, (_, letter: string) => letter.toUpperCase())
}

/** The three kinds of row a component contributes, in the order the page shows them. */
const KINDS = ['props', 'events', 'slots'] as const

type Descriptions = Record<string, Record<string, Record<string, unknown>>>

const problems: string[] = []

/** Everything the catalogue says about one component, or nothing when it says nothing. */
function describedBy(catalogue: Descriptions, component: ComponentApi, kind: string) {
  return (catalogue[component.name]?.[kind] ?? {}) as Record<string, unknown>
}

async function checkPage(slug: string) {
  const apiFile = join(appRoot, 'content/api', `${slug}.ts`)
  if (!existsSync(apiFile)) {
    problems.push(`${slug}: no content/api/${slug}.ts — run pnpm --filter vectis-docs api`)
    return
  }

  const api = (await load(apiFile)).default as PageApi

  for (const locale of ['en', 'fr'] as const) {
    const file = join(appRoot, 'i18n/locales', locale, `${moduleOf(slug)}.ts`)
    if (!existsSync(file)) {
      problems.push(`${slug}: no i18n/locales/${locale}/${moduleOf(slug)}.ts`)
      continue
    }

    const page = (await load(file)).default as { api?: Descriptions }
    const catalogue = page.api ?? {}

    for (const component of api.components) {
      for (const kind of KINDS) {
        const entries = component[kind] ?? []
        const described = describedBy(catalogue, component, kind)

        for (const entry of entries) {
          const key = keyOf(entry)
          const text = described[key]
          if (typeof text !== 'string' || text.trim() === '') {
            problems.push(`${locale}: ${slug}.api.${component.name}.${kind}.${key} is missing`)
          }
        }

        const known = new Set(entries.map(keyOf))
        for (const key of Object.keys(described)) {
          if (!known.has(key)) {
            problems.push(
              `${locale}: ${slug}.api.${component.name}.${kind}.${key} describes nothing — ` +
                'the entry is gone from the library',
            )
          }
        }
      }

      // A component the catalogue knows about but the library no longer exposes: the same drift,
      // one level up, and the loop above cannot see it because it walks the generated side.
      for (const name of Object.keys(catalogue)) {
        if (!api.components.some((one) => one.name === name)) {
          problems.push(
            `${locale}: ${slug}.api.${name} describes a component the page does not show`,
          )
        }
      }
    }
  }
}

const componentPages = allPages.filter((page) => page.section === 'components')

for (const page of componentPages) await checkPage(page.slug)

if (problems.length > 0) {
  console.error(`check-api: ${problems.length} mismatch(es) between the API and the catalogues:`)
  for (const problem of [...new Set(problems)].sort()) console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`check-api: ${componentPages.length} component page(s) described in both languages`)
