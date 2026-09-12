/**
 * Generates `content/api/<slug>.ts`: the props, events, slots, named types and CSS variables every
 * component page's API section lists.
 *
 * A name, a type and a default are facts about the library, not prose, and forty-four pages
 * transcribing them by hand is forty-four pages that rot the day a default changes. They are
 * read straight out of the source instead, with `vue-component-meta` — the same engine that
 * fills Storybook's `<Controls>` table, so the two surfaces cannot disagree about what the
 * library offers.
 *
 * What is NOT generated is the DESCRIPTIONS: they are prose, they are translated, and they live
 * in `i18n/locales/{en,fr}/<page>.ts` beside the rest of the page's words. `check-api.ts` runs
 * at postbuild and fails when the two halves drift apart.
 *
 * Run with `pnpm --filter vectis-docs api` — on demand, NOT in a build hook. It type-checks the
 * whole library to answer, which is far too slow for every build, and the answer only moves when
 * the library's API does. The generated files are committed.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import { createChecker } from 'vue-component-meta'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const uiRoot = resolve(appRoot, '../../packages/ui')
const componentsDir = join(uiRoot, 'src/components')

/**
 * One entry per component page, in the order `content/nav.ts` lists them.
 *
 * `components` are the ones the page documents, the family's head first: they are the tables it
 * shows, and their order is the order it shows them in. It is written out rather than derived
 * from the folder because a folder is not a page — VAvatar and VAvatarGroup share one folder and
 * have a page each, VTabs owns three components and has one.
 *
 * `internals` are the SFCs a family renders but never exports. They document nothing, and they
 * are named here for one reason: the CSS variables scan below reads them too, since a family's
 * measurements are just as often consumed by an internal panel as by its head.
 */
const PAGES: { slug: string; components: string[]; internals?: string[] }[] = [
  { slug: 'accordion', components: ['VAccordion', 'VAccordionItem'] },
  { slug: 'avatar', components: ['VAvatar'] },
  { slug: 'avatar-group', components: ['VAvatarGroup'] },
  { slug: 'badge', components: ['VBadge'] },
  { slug: 'breadcrumb', components: ['VBreadcrumb'] },
  { slug: 'button', components: ['VButton'] },
  { slug: 'button-group', components: ['VButtonGroup'] },
  {
    slug: 'calendar',
    components: ['VCalendar'],
    internals: ['VCalendarMonth', 'VCalendarTimeGrid', 'VCalendarYear', 'VCalendarEvent'],
  },
  { slug: 'carousel', components: ['VCarousel', 'VCarouselItem'] },
  { slug: 'checkbox', components: ['VCheckbox'] },
  { slug: 'chip', components: ['VChip'] },
  {
    slug: 'combobox',
    components: ['VCombobox'],
    internals: ['VComboboxOption', 'VComboboxGroup', 'VComboboxSeparator'],
  },
  { slug: 'data-table', components: ['VDataTable'] },
  { slug: 'date-input', components: ['VDateInput'] },
  { slug: 'date-picker', components: ['VDatePicker'] },
  { slug: 'dialog', components: ['VDialog', 'VDialogAlert'] },
  { slug: 'file-input', components: ['VFileInput'] },
  { slug: 'file-picker', components: ['VFilePicker'] },
  { slug: 'hotkeys', components: ['VHotkeys'] },
  { slug: 'icon', components: ['VIcon'] },
  { slug: 'icon-button', components: ['VIconButton'] },
  { slug: 'input', components: ['VInput'] },
  { slug: 'input-group', components: ['VInputGroup'] },
  { slug: 'input-otp', components: ['VInputOTP'] },
  {
    slug: 'menu',
    components: ['VMenu', 'VMenuItem', 'VMenuGroup', 'VMenuSeparator'],
    internals: ['VMenuPanel'],
  },
  { slug: 'pagination', components: ['VPagination'] },
  { slug: 'popover', components: ['VPopover'] },
  { slug: 'progress-circular', components: ['VProgressCircular'] },
  { slug: 'progress-linear', components: ['VProgressLinear'] },
  { slug: 'radio', components: ['VRadio'] },
  { slug: 'separator', components: ['VSeparator'] },
  {
    slug: 'side-navigation',
    components: [
      'VSideNavigation',
      'VSideNavigationItem',
      'VSideNavigationGroup',
      'VSideNavigationSeparator',
    ],
  },
  { slug: 'skeleton-loader', components: ['VSkeletonLoader'] },
  { slug: 'slider', components: ['VSlider'] },
  { slug: 'snackbar', components: ['VSnackbar'] },
  { slug: 'spinner', components: ['VSpinner'] },
  { slug: 'switch', components: ['VSwitch'] },
  { slug: 'tabs', components: ['VTabs', 'VTab', 'VTabPanel'] },
  { slug: 'textarea', components: ['VTextarea'] },
  { slug: 'time-input', components: ['VTimeInput'] },
  { slug: 'time-picker', components: ['VTimePicker'] },
  { slug: 'toast', components: ['VToaster'], internals: ['VToast'] },
  { slug: 'toggle', components: ['VToggle', 'VToggleItem'] },
  { slug: 'tooltip', components: ['VTooltip'] },
  { slug: 'typography', components: ['VTypography'] },
]

/**
 * Defaults the extractor cannot print as the value a reader would act on.
 *
 * Three cases land here. A default computed from a constant is reported as the expression that
 * produced it, and `EDGE_STEP_DELAY` tells nobody anything; and a prop whose default is left
 * `undefined` so that "not given" stays distinguishable is reported as having none at all,
 * where the component does have a last resort and applies it (VButton's `tone`, which falls
 * back to `accent` once its group has had its say); and a Boolean prop absent from its
 * withDefaults, which Vue casts to `false` while the extractor sees nothing at all.
 *
 * What stays OUT is a fallback that is not a value: a label taken from the message dictionary,
 * a format or a first day of week derived from the locale, an id generated at mount, a width the
 * CSS decides. Those cells stay empty and their DESCRIPTION says where the value comes from, a
 * cell being read as something one could type.
 *
 * Keyed `Component.prop`, and deliberately a table rather than a rule: each of these is a
 * decision about what the value MEANS, and the day one of them changes the build should not
 * quietly agree with a stale answer here. An entry pointing at a prop that no longer exists is
 * reported.
 */
const DEFAULT_OVERRIDES: Record<string, string> = {
  'VAvatar.size': "'md'",
  'VAvatarGroup.size': "'md'",
  'VButton.tone': "'accent'",
  'VCalendar.date': 'today',
  'VCalendar.edgeStepDelay': '800',
  'VDateInput.displayFormat': "{ day: 'numeric', month: 'short', year: 'numeric' }",
  'VDateInput.mode': "'input'",
  'VIconButton.tone': "'neutral'",
  'VTimeInput.mode': "'input'",
}

/** Builds an index of every SFC in the library by its bare name, so no path table is needed. */
function indexComponents(): Map<string, string> {
  const index = new Map<string, string>()
  for (const folder of readdirSync(componentsDir)) {
    const dir = join(componentsDir, folder)
    if (!statSync(dir).isDirectory()) continue
    for (const file of readdirSync(dir)) {
      if (file.endsWith('.vue')) index.set(file.slice(0, -'.vue'.length), join(dir, file))
    }
  }
  return index
}

/**
 * The type as the documentation prints it, from the extractor's rendering of it.
 *
 * Two changes, both of them about matching the source a reader would write. The extractor adds
 * `| undefined` to every optional prop, which says nothing the empty Default cell does not
 * already say; and it prints string literals in double quotes, where the library and every code
 * sample on the site use single ones.
 */
function printType(type: string, required: boolean): string {
  let text = type.replace(/\s+/g, ' ').trim()
  if (!required) {
    text = text
      .replace(/^undefined \| /, '')
      .replace(/ \| undefined$/, '')
      .trim()
  }
  return text.replace(/"([^"]*)"/g, "'$1'")
}

/**
 * The type as the SOURCE writes it, which is the one to print whenever it can be had.
 *
 * TRAP — the extractor's `type` string is TypeScript's own rendering of the type, and a union
 * comes back in TypeScript's internal order rather than the author's: VButton's
 * `'xs' | 'sm' | 'md' | 'lg' | 'xl'` is handed over as `'md' | 'xs' | 'sm' | 'lg' | 'xl'`,
 * `withDefaults` having created the `'md'` literal first. A size scale printed out of order is
 * a documentation bug a reader cannot tell from a real one, and the order is not even stable
 * across TypeScript versions, so the committed file would churn on an upgrade.
 *
 * Slicing the declaration out of the source sidesteps all of it. A `defineModel` prop has no
 * declaration to slice, which is why the extractor's rendering stays as the fallback: those
 * types are a single term and have no order to lose.
 */
function sourceType(declarations: { file: string; range: [number, number] }[], name: string) {
  const declaration = declarations[0]
  if (!declaration) return undefined
  const text = readFileSync(declaration.file, 'utf8')

  // TRAP — the range is a HINT, never a boundary. On a generic SFC the mapping back from the
  // virtual code Volar type-checks lands one character to the LEFT, so slicing it clips the last
  // character of the type: VDataTable's IconSource comes out as IconSourc, which is not a type
  // anyone would notice was wrong. Anchoring on the property's own name inside a generous window
  // and reading to the end of its line is what makes the read independent of where the range falls.
  const window = text.slice(Math.max(0, declaration.range[0] - 8), declaration.range[1] + 200)
  const signature = new RegExp(`(?:^|[\\s;{])${name}\\??\\s*:\\s*([^\\n]*?)\\s*;?\\s*$`, 'm')
  const type = signature.exec(window)?.[1]?.trim()
  if (!type) return undefined

  // A declaration written over several lines would be read down to its first newline and come out
  // as a fragment. Unbalanced delimiters are what that always looks like, so the extractor's own
  // rendering takes over rather than half a type being printed.
  return balanced(type) ? type : undefined
}

/** Whether every bracket the type opens is closed again, and its quotes come in pairs. */
function balanced(type: string): boolean {
  const count = (pattern: RegExp) => (type.match(pattern) ?? []).length
  return (
    count(/\(/g) === count(/\)/g) &&
    count(/\[/g) === count(/\]/g) &&
    count(/\{/g) === count(/\}/g) &&
    count(/'/g) % 2 === 0
  )
}

/**
 * The default as the documentation prints it, or nothing when the prop has none.
 *
 * An icon default arrives as the IMPORT ALIAS the component gave it — `closeIcon`, `swapVertIcon`
 * — which names nothing a reader can look up. The alias is resolved back through the SFC's own
 * import so the cell says `close` and `swap_vert`, the names the icon registry answers to. Doing
 * it from the import rather than from a table here is what keeps it right when an icon changes.
 */
function printDefault(
  value: string | undefined,
  override: string | undefined,
  source: string,
): string | undefined {
  if (override !== undefined) return override
  if (value === undefined) return undefined
  const text = value.replace(/\s+/g, ' ').trim()
  if (text === '' || text === 'undefined') return undefined
  if (/^[A-Za-z_$][\w$]*$/.test(text)) {
    const alias = new RegExp(`\\b([a-z0-9_]+) as ${text}\\b`).exec(source)
    if (alias) return alias[1]!
  }
  return text.replace(/"([^"]*)"/g, "'$1'")
}

/** `load-more` → `loadMore`, `v-model:open` → `vModelOpen`: a name a keypath can carry. */
function keyFor(name: string): string {
  const parts = name.split(/[-:]/).filter(Boolean)
  return parts
    .map((part, index) => (index === 0 ? part : part[0]!.toUpperCase() + part.slice(1)))
    .join('')
}

/**
 * Every type alias and interface the library declares, printed as the source writes it.
 *
 * The tables name a hundred-odd types and used to say nothing about them, which left a reader
 * holding `ButtonVariant` with no way to learn that it is four words. A declaration is a fact
 * about the library, like a name or a default, so it is read out of the source too.
 *
 * PARSED, never sliced: a declaration spans as many lines as it likes, and `sourceType`'s own
 * TRAP above is what slicing looks like when it goes wrong. `createSourceFile` is a parse and not
 * a type-check, so the whole library costs a few milliseconds.
 *
 * Local types are indexed alongside the exported ones. `MenuTriggerProps` is not importable, but
 * it is the shape of what a slot hands out, and a reader binding that object needs to see it.
 *
 * Ambiguity is recorded rather than resolved, and refused only if a page ever asks for it: two
 * declarations of one name would have the page print whichever file happened to be read last.
 * VCalendarMonth and VCalendarTimeGrid each keep a local `Gesture` of their own shape, and
 * neither reaches a table, so the collision is a fact about the library and not a problem to
 * report — what would be one is a TABLE naming a type that could be either.
 */
const ambiguous = new Set<string>()

function indexTypes(): Map<string, string> {
  const declarations = new Map<string, string>()

  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) {
        visit(path)
        continue
      }
      if (/\.(test|stories)\.ts$/.test(entry)) continue
      if (!entry.endsWith('.ts') && !entry.endsWith('.vue')) continue
      for (const [name, text] of typesIn(path)) {
        const known = declarations.get(name)
        if (known !== undefined && known !== text) ambiguous.add(name)
        declarations.set(name, text)
      }
    }
  }

  visit(join(uiRoot, 'src'))
  return declarations
}

/** The type declarations of one module, an SFC's `<script setup>` included. */
function typesIn(file: string): [string, string][] {
  const text = readFileSync(file, 'utf8')

  // An SFC's types live in its script block; handing the parser a template and a stylesheet as
  // well would make a syntax error of every component in the library.
  const script = file.endsWith('.vue')
    ? /<script\b[^>]*>([\s\S]*?)<\/script>/.exec(text)?.[1]
    : text
  if (script === undefined) return []

  const source = ts.createSourceFile(file, script, ts.ScriptTarget.Latest, true)
  const declared: [string, string][] = []
  for (const node of source.statements) {
    if (!ts.isTypeAliasDeclaration(node) && !ts.isInterfaceDeclaration(node)) continue
    declared.push([node.name.text, withoutComments(node.getText(source))])
  }
  return declared
}

/**
 * A declaration with its comments taken out.
 *
 * The library's JSDoc is addressed to an integrator reading an IDE hover: it is English only, and
 * it carries the em dashes the site's prose rules forbid. What a field MEANS is the page's own
 * prose to write; what the declaration is asked for here is its shape.
 *
 * It strips a comment wherever the two markers appear, a string literal included. No type in the
 * library carries either inside a string, and a type that did would be printed with a hole in it
 * rather than silently wrong.
 */
function withoutComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .filter((line) => line !== '')
    .join('\n')
}

/**
 * The values a prop accepts, when its type is a closed set of them.
 *
 * That set is the whole of what a reader wants from `ButtonVariant`, and it is short enough to
 * print in the cell beside the name, which is where the question gets asked. An alias pointing at
 * an alias is followed (`TimePickerFormat` is `HourFormat` is two words); anything that is not a
 * union of literals is a SHAPE rather than a set, and it is printed under the Types heading
 * instead. No threshold on the length: the five placement unions are twelve words and the reader
 * wants all twelve, so the cell wraps them.
 */
function literalValuesOf(name: string, seen = new Set<string>()): string | undefined {
  if (seen.has(name)) return undefined
  seen.add(name)

  const declaration = types.get(name)
  if (declaration === undefined) return undefined
  const body = /^(?:export )?type \w+\s*=\s*([\s\S]*)$/.exec(declaration)?.[1]
  if (body === undefined) return undefined

  // Splitting on `|` is only sound on a flat union. A delimiter of any kind means the type is a
  // function, an object or an array, none of which is a list of values.
  const text = body.replace(/\s+/g, ' ').trim()
  if (/[(){}[\]<>]/.test(text)) return undefined

  const members = text
    .replace(/^\|\s*/, '')
    .split('|')
    .map((member) => member.trim())
  if (members.every((member) => /^('[^']*'|-?\d+|true|false|null)$/.test(member))) {
    return members.join(' | ')
  }

  // A one-member union is an alias for another name, which may itself be a set.
  const alias = members.length === 1 ? members[0]! : undefined
  return alias !== undefined && /^[A-Z]\w*$/.test(alias) ? literalValuesOf(alias, seen) : undefined
}

/** The library types a printed type mentions. A name it does not declare is someone else's. */
function namesIn(text: string): string[] {
  const found = text.match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? []
  return [...new Set(found)].filter((name) => types.has(name))
}

interface Row {
  name: string
  key?: string
  type: string
  values?: string
  default?: string
}

interface TypeEntry {
  name: string
  definition: string
}

const row = (name: string, type: string, fallback?: string): Row => {
  const key = keyFor(name)
  const values = /^[A-Z][A-Za-z0-9]*$/.test(type) ? literalValuesOf(type) : undefined
  return {
    name,
    ...(key === name ? {} : { key }),
    type,
    ...(values ? { values } : {}),
    ...(fallback ? { default: fallback } : {}),
  }
}

/**
 * The types a page's tables name and do not answer in the cell.
 *
 * A name standing as the WHOLE of a cell whose values were expanded there is answered already;
 * every other mention is a shape the reader has to be shown, `CalendarView[]` included — which is
 * why the test is on the mention and not on the name.
 */
function typesOf(components: { props?: Row[]; events?: Row[]; slots?: Row[] }[]): TypeEntry[] {
  const needed = new Set<string>()
  for (const component of components) {
    const entries = [
      ...(component.props ?? []),
      ...(component.events ?? []),
      ...(component.slots ?? []),
    ]
    for (const entry of entries) {
      for (const name of namesIn(entry.type)) {
        if (entry.values !== undefined && entry.type === name) continue
        needed.add(name)
      }
    }
  }

  // Closed over the definitions themselves, so a reader following a link never lands on a shape
  // written in terms they cannot see either (`IconSource` brings `BuiltinIcon` and `IconRender`).
  // One pass suffices: a Set's iterator visits what the loop adds to it.
  for (const name of needed) for (const inner of namesIn(types.get(name)!)) needed.add(inner)

  const clashing = [...needed].filter((name) => ambiguous.has(name))
  if (clashing.length > 0) {
    throw new Error(
      `build-api: a table names ${clashing.join(', ')}, which the library declares more than once`,
    )
  }

  return [...needed].sort().map((name) => ({ name, definition: types.get(name)! }))
}

const checker = createChecker(join(uiRoot, 'tsconfig.json'), {
  forceUseTs: true,
  printer: { newLine: 1 },
})

const index = indexComponents()
const types = indexTypes()
const usedOverrides = new Set<string>()

/**
 * `--jsdoc <slug>` prints the library's own JSDoc for a page's entries, and writes nothing.
 *
 * It is a WRITING AID and never an output: that prose is addressed to an integrator reading an
 * IDE hover, it follows the library's comment style, and it is full of the em dashes the site's
 * prose rules forbid. What it saves is opening five SFCs to find what a prop is for; every line
 * of it is then rewritten, in English and in French, into the catalogue.
 */
const jsdocFor = process.argv.includes('--jsdoc')
  ? process.argv[process.argv.indexOf('--jsdoc') + 1]
  : undefined

/** The props, events and slots of one component, models folded back into the props. */
function apiOf(component: string) {
  const file = index.get(component)
  if (!file) throw new Error(`build-api: no SFC named ${component}.vue under src/components`)
  const meta = checker.getComponentMeta(file)
  const source = readFileSync(file, 'utf8')

  // Every `update:x` an emit carries is one half of a `defineModel`; the prop `x` is the other.
  // The pair is documented ONCE, as the binding a template actually writes, so the event is
  // dropped and the prop is renamed.
  const modelled = new Set(
    meta.events
      .map((event) => event.name)
      .filter((name) => name.startsWith('update:'))
      .map((name) => name.slice('update:'.length))
      .filter((name) => meta.props.some((prop) => !prop.global && prop.name === name)),
  )

  const props = meta.props
    .filter((prop) => !prop.global)
    .map((prop) => {
      const key = `${component}.${prop.name}`
      if (key in DEFAULT_OVERRIDES) usedOverrides.add(key)
      const name = modelled.has(prop.name)
        ? prop.name === 'modelValue'
          ? 'v-model'
          : `v-model:${prop.name}`
        : prop.name
      const type =
        sourceType(prop.getDeclarations(), prop.name) ?? printType(prop.type, prop.required)
      return row(name, type, printDefault(prop.default, DEFAULT_OVERRIDES[key], source))
    })

  const events = meta.events
    .filter((event) => !modelled.has(event.name.replace(/^update:/, '')))
    .map((event) => row(event.name, printType(event.type, true)))

  // A slot's type is the scope it hands out, which is what a consumer destructures. The
  // extractor says `any` for a slot that hands out nothing, where `{}` is what a reader reads.
  const slots = meta.slots.map((slot) =>
    row(slot.name, slot.type === 'any' ? '{}' : printType(slot.type, true)),
  )

  return {
    name: component,
    ...(props.length ? { props } : {}),
    ...(events.length ? { events } : {}),
    ...(slots.length ? { slots } : {}),
  }
}

const tokens = JSON.parse(readFileSync(join(uiRoot, 'src/tokens/tokens.json'), 'utf8')) as {
  semantic: { control: Record<string, { $value: string }> }
}
const control = tokens.semantic.control

/**
 * The `--vectis-*` tokens a family is measured in.
 *
 * Taken from the `control` group of the semantic tokens, minus the shared size scale
 * (`height-*`) and the border width: what is left is exactly the set named after a component.
 * Membership is then read off the family's own stylesheets rather than declared in a table
 * here, so a token that stops being used stops being documented on the same commit.
 */
function tokensOf(files: string[]): { name: string; value: string }[] {
  const text = files.map((file) => readFileSync(file, 'utf8')).join('\n')
  return Object.entries(control)
    .filter(([key]) => !key.startsWith('height-') && key !== 'border-width')
    .filter(([key]) => text.includes(`--vectis-control-${key}`))
    .map(([key, token]) => ({ name: `--vectis-control-${key}`, value: token.$value }))
}

const HEADER = `/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs api  ·  Source: scripts/build-api.ts
 */
import type { PageApi } from './types'
`

/** Prettier's own quoting rule: single quotes, unless the value already carries one. */
function lit(value: string): string {
  return value.includes("'")
    ? `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    : `'${value.replace(/\\/g, '\\\\')}'`
}

/** One row per line: a table of six hundred entries is read down a column, not across one. */
function printRow(entry: object, indent: string): string {
  const fields = Object.entries(entry)
    .filter(([, value]) => value !== undefined)
    .map(([field, value]) => `${field}: ${lit(String(value))}`)
  return `${indent}{ ${fields.join(', ')} },`
}

/**
 * The type blocks, each definition printed as a TEMPLATE LITERAL.
 *
 * An interface is several lines and a single-quoted string cannot hold a newline, so the
 * alternative is a file full of `\n` escapes: the generated source would no longer be the thing
 * the page renders, which is exactly what makes these files readable. Prettier leaves the content
 * of a template literal alone, so the indentation printed here is the indentation shown.
 */
function printTypes(entries: TypeEntry[], indent: string): string {
  const quote = (definition: string) =>
    definition.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
  return [
    `${indent}types: [`,
    ...entries.flatMap((entry) => [
      `${indent}  {`,
      `${indent}    name: ${lit(entry.name)},`,
      `${indent}    definition: \`${quote(entry.definition)}\`,`,
      `${indent}  },`,
    ]),
    `${indent}],`,
  ].join('\n')
}

function printList(name: string, entries: object[], indent: string) {
  return [
    `${indent}${name}: [`,
    ...entries.map((entry) => printRow(entry, `${indent}  `)),
    `${indent}],`,
  ].join('\n')
}

if (jsdocFor) {
  const page = PAGES.find((one) => one.slug === jsdocFor)
  if (!page) throw new Error(`build-api: no page named ${jsdocFor}`)
  for (const component of page.components) {
    const meta = checker.getComponentMeta(index.get(component)!)
    console.log(`
===== ${component}`)
    for (const prop of meta.props.filter((one) => !one.global)) {
      console.log(`prop ${prop.name}: ${prop.description.replace(/\s+/g, ' ')}`)
    }
    for (const event of meta.events) {
      console.log(`event ${event.name}: ${event.description.replace(/\s+/g, ' ')}`)
    }
    for (const slot of meta.slots) {
      console.log(`slot ${slot.name}: ${slot.description.replace(/\s+/g, ' ')}`)
    }
  }
  process.exit(0)
}

let rows = 0

for (const page of PAGES) {
  const components = page.components.map(apiOf)
  const files = [...page.components, ...(page.internals ?? [])].map((name) => index.get(name)!)
  const cssVars = tokensOf(files)
  const named = typesOf(components)

  rows += components.reduce(
    (total, one) =>
      total + (one.props?.length ?? 0) + (one.events?.length ?? 0) + (one.slots?.length ?? 0),
    0,
  )

  const blocks = [
    'export default {',
    '  components: [',
    ...components.flatMap((one) => [
      '    {',
      `      name: ${lit(one.name)},`,
      ...(one.props ? [printList('props', one.props, '      ')] : []),
      ...(one.events ? [printList('events', one.events, '      ')] : []),
      ...(one.slots ? [printList('slots', one.slots, '      ')] : []),
      '    },',
    ]),
    '  ],',
    ...(named.length ? [printTypes(named, '  ')] : []),
    ...(cssVars.length ? [printList('cssVars', cssVars, '  ')] : []),
    '} satisfies PageApi',
  ]
  const ts = `${HEADER}\n${blocks.join('\n')}\n`
  writeFileSync(join(appRoot, 'content/api', `${page.slug}.ts`), ts, 'utf8')
}

const stale = Object.keys(DEFAULT_OVERRIDES).filter((key) => !usedOverrides.has(key))
if (stale.length > 0) {
  console.error(
    `build-api: DEFAULT_OVERRIDES points at props that no longer exist: ${stale.join(', ')}`,
  )
  process.exit(1)
}

console.log(`api: ${PAGES.length} pages, ${rows} documented entries → content/api/`)
