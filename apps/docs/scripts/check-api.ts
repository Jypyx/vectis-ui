/**
 * Post-build guard: every row of every API table has a description in both languages, and every
 * type those rows name is answered somewhere on the page. A component page's API section is
 * built from two halves that nothing else holds together.
 */
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import type { ComponentApi, PageApi } from '../content/api/types'

import { keyOf } from '../content/api/types'
import { allPages } from '../content/nav'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const load = async (file: string) =>
  (await import(pathToFileURL(file).href)) as { default: unknown }

/** The catalogue module a slug's words live in: `side-navigation` → `sideNavigation`. */
function moduleOf(slug: string): string {
  return slug.replace(/-(.)/g, (_, letter: string) => letter.toUpperCase())
}

/** The three kinds of row a component contributes, in the order the page shows them. */
const KINDS = ['props', 'events', 'slots'] as const

/** The capitalised names a type cell may carry without the page defining them. */
const EXTERNALS = new Set([
  'ButtonHTMLAttributes',
  'DateTimeFormatOptions',
  'E',
  'File',
  'Intl',
  'KeyboardEvent',
  'MouseEvent',
  'NumberFormatOptions',
  'Partial',
  'Promise',
  'Record',
  'Row',
])

/** Every capitalised identifier a printed type mentions, which is every type it is written in. */
function namesIn(type: string): string[] {
  return [...new Set(type.match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? [])]
}

type Descriptions = Record<string, Record<string, Record<string, unknown>>>

const problems: string[] = []

/** Everything the catalogue says about one component, or nothing when it says nothing. */
function describedBy(catalogue: Descriptions, component: ComponentApi, kind: string) {
  return (catalogue[component.name]?.[kind] ?? {}) as Record<string, unknown>
}

/** Every type a page's tables name is answered, and every answer is asked for. */
function checkTypes(slug: string, api: PageApi) {
  const defined = new Map((api.types ?? []).map((one) => [one.name, one.definition]))
  const wanted = new Set<string>()

  for (const component of api.components) {
    for (const kind of KINDS) {
      for (const entry of component[kind] ?? []) {
        for (const name of namesIn(entry.type)) {
          wanted.add(name)
          if (defined.has(name)) continue
          if (entry.values !== undefined && entry.type === name) continue
          if (EXTERNALS.has(name)) continue
          problems.push(
            `${slug}: ${component.name}.${kind}.${keyOf(entry)} is typed ${name}, which the page ` +
              'neither expands nor defines — regenerate, or declare it external in check-api.ts',
          )
        }
      }
    }
  }

  // A definition can be there for another definition rather than for a cell: `IconSource` is
  // what brings `BuiltinIcon` along, and no table ever names it. Its own name is skipped, which
  // every declaration contains and which would make the test below vacuous.
  for (const [name, definition] of defined) {
    for (const inner of namesIn(definition)) if (inner !== name) wanted.add(inner)
  }

  for (const name of defined.keys()) {
    if (!wanted.has(name)) problems.push(`${slug}: the definition of ${name} is named nowhere`)
  }
}

async function checkPage(slug: string) {
  const apiFile = join(appRoot, 'content/api', `${slug}.ts`)
  if (!existsSync(apiFile)) {
    problems.push(`${slug}: no content/api/${slug}.ts — run pnpm --filter vectis-docs api`)
    return
  }

  const api = (await load(apiFile)).default as PageApi

  // Generated against generated, so it is checked once rather than once per language: a type and
  // its definition are the same fact in both.
  checkTypes(slug, api)

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
