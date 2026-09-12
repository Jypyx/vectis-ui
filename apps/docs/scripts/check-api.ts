/**
 * Post-build guard: every row of every API table has a description in both languages, and every
 * type those rows name is answered somewhere on the page.
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

/**
 * The capitalised names a type cell may carry without the page defining them.
 *
 * Three kinds, and none of them is the library's to explain: a type the platform or Vue declares
 * (`File`, `MouseEvent`, `ButtonHTMLAttributes`), a utility TypeScript ships (`Partial`, `Record`,
 * and `Intl` with the options bag it namespaces), and the GENERIC PARAMETER of a generic component
 * — `Row` is whatever a VDataTable was given, `E` whatever a VCalendar's events are, so the one
 * honest definition is the consumer's own.
 *
 * Deliberately a table and not a rule: it is what makes the check below fail on a type the
 * library really does declare but the generator failed to find — a declaration moved to a folder
 * the scan does not walk would otherwise print on the site as a name with no answer anywhere.
 */
const EXTERNALS = new Set([
  'ButtonHTMLAttributes',
  'DateTimeFormatOptions',
  'E',
  'File',
  'Intl',
  'KeyboardEvent',
  'MouseEvent',
  'Partial',
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

/**
 * Every type a page's tables name is answered, and every answer is asked for.
 *
 * The Types section has two halves that drift in opposite directions, and neither drift shows on
 * the page as an error. A name with no definition and no expanded values prints as a word the
 * reader cannot look up, which is the whole state this section exists to end; a definition nothing
 * points at is a block that outlived the prop it was extracted for.
 */
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

  // A definition can be there for another definition rather than for a cell: `IconSource` is what
  // brings `BuiltinIcon` along, and no table ever names it. Its OWN name is skipped, which every
  // declaration contains and which would make the test below vacuous.
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
