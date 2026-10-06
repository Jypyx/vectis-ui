/**
 * They are read straight out of the source instead, with `vue-component-meta`; the same engine
 * that fills Storybook's `<Controls>` table, so the two surfaces cannot disagree about what the
 * library offers. What is not generated is the DESCRIPTIONS: they are prose, they are
 * translated, and they live in `i18n/locales/{en,fr}/<page>.ts` beside the rest of the page's
 * words.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import { createChecker } from 'vue-component-meta'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const uiRoot = resolve(appRoot, '../../packages/ui')
const componentsDir = join(uiRoot, 'src/components')

/** One entry per component page, in the order `content/nav.ts` lists them. */
const PAGES: { slug: string; components: string[]; internals?: string[] }[] = [
  { slug: 'accordion', components: ['VAccordion', 'VAccordionItem'] },
  { slug: 'alert', components: ['VAlert'] },
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
  { slug: 'card', components: ['VCard'] },
  { slug: 'carousel', components: ['VCarousel', 'VCarouselItem'] },
  { slug: 'checkbox', components: ['VCheckbox'] },
  { slug: 'chip', components: ['VChip'] },
  { slug: 'color-input', components: ['VColorInput'] },
  { slug: 'color-picker', components: ['VColorPicker'] },
  {
    slug: 'combobox',
    components: ['VCombobox'],
    internals: ['VComboboxOption', 'VComboboxGroup', 'VComboboxSeparator'],
  },
  {
    slug: 'command-palette',
    components: ['VCommandPalette'],
    internals: ['VCommandPaletteItem'],
  },
  { slug: 'context-menu', components: ['VContextMenu'] },
  { slug: 'data-table', components: ['VDataTable'] },
  { slug: 'date-input', components: ['VDateInput'] },
  { slug: 'date-picker', components: ['VDatePicker'] },
  { slug: 'dialog', components: ['VDialog', 'VDialogAlert'] },
  { slug: 'drawer', components: ['VDrawer'] },
  { slug: 'empty-state', components: ['VEmptyState'] },
  { slug: 'field', components: ['VField'] },
  { slug: 'fieldset', components: ['VFieldset'] },
  { slug: 'file-input', components: ['VFileInput'] },
  { slug: 'file-picker', components: ['VFilePicker'] },
  { slug: 'hotkeys', components: ['VHotkeys'] },
  { slug: 'hover-card', components: ['VHoverCard'] },
  { slug: 'icon', components: ['VIcon'] },
  { slug: 'icon-button', components: ['VIconButton'] },
  { slug: 'input', components: ['VInput'] },
  { slug: 'input-group', components: ['VInputGroup'] },
  { slug: 'input-otp', components: ['VInputOTP'] },
  { slug: 'link', components: ['VLink'] },
  {
    slug: 'menu',
    components: ['VMenu', 'VMenuItem', 'VMenuGroup', 'VMenuSeparator'],
    internals: ['VMenuPanel'],
  },
  { slug: 'meter', components: ['VMeter'] },
  { slug: 'number-input', components: ['VNumberInput'] },
  { slug: 'pagination', components: ['VPagination'] },
  { slug: 'popover', components: ['VPopover'] },
  { slug: 'progress-circular', components: ['VProgressCircular'] },
  { slug: 'progress-linear', components: ['VProgressLinear'] },
  { slug: 'radio', components: ['VRadio'] },
  { slug: 'rating', components: ['VRating'] },
  { slug: 'resizable', components: ['VResizable', 'VResizablePanel'] },
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
  { slug: 'split-button', components: ['VSplitButton'] },
  { slug: 'stepper', components: ['VStepper'] },
  { slug: 'switch', components: ['VSwitch'] },
  { slug: 'tabs', components: ['VTabs', 'VTab', 'VTabPanel'] },
  { slug: 'textarea', components: ['VTextarea'] },
  { slug: 'time-input', components: ['VTimeInput'] },
  { slug: 'time-picker', components: ['VTimePicker'] },
  { slug: 'timeline', components: ['VTimeline', 'VTimelineItem'] },
  { slug: 'toast', components: ['VToaster'], internals: ['VToast'] },
  { slug: 'toggle', components: ['VToggle', 'VToggleItem'] },
  { slug: 'tooltip', components: ['VTooltip'] },
  { slug: 'tree-view', components: ['VTreeView'] },
  { slug: 'typography', components: ['VTypography'] },
]

/**
 * Override defaults the extractor cannot display meaningfully, including runtime fallbacks
 * whose props deliberately remain undefined.
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
 * The type as the documentation prints it, from the extractor's rendering of it. The extractor
 * adds `| undefined` to every optional prop, which says nothing the empty Default cell does not
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
 * Use source declaration order for union members; TypeScript's rendered union order is unstable
 * and can scramble size scales.
 */
function sourceType(declarations: { file: string; range: [number, number] }[], name: string) {
  const declaration = declarations[0]
  if (!declaration) return undefined
  const text = readFileSync(declaration.file, 'utf8')

  // Treat extractor ranges as hints and parse the surrounding declaration; generic SFC source
  // mappings can be offset by one character.
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
 * The default as the documentation prints it, or nothing when the prop has none. An icon
 * default arrives as the IMPORT ALIAS the component gave it; `closeIcon`, `swapVertIcon`; which
 * names nothing a reader can look up.
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

/** Parse complete type declarations with createSourceFile rather than slicing source ranges. */
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

/** The exported type declarations of one module, an SFC's `<script setup>` included. */
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
    // Private types belong to their module and can share a name with another component's
    // generic parameter, such as CommandPalette's internal Row and DataTable's row type.
    if (!node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue
    declared.push([node.name.text, withoutComments(node.getText(source))])
  }
  return declared
}

/** A declaration with its comments taken out. */
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
 * The values a prop accepts, when its type is a closed set of them. An alias pointing at an
 * alias is followed (`TimePickerFormat` is `HourFormat` is two words); anything that is not a
 * union of literals is a shape rather than a set, and it is printed under the Types heading
 * instead.
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

/** The types a page's tables name and do not answer in the cell. */
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

/** `--jsdoc <slug>` prints the library's own JSDoc for a page's entries, and writes nothing. */
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
  // The pair is documented once, as the binding a template actually writes, so the event is
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

  // A slot's type is the scope it hands out, which a consumer destructures. The extractor says
  // `any` for a slot that hands out nothing, where `{}` is what a reader reads.
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
 * Taken from the `control` group of the semantic tokens, minus the shared size scale
 * (`height-*`) and the border width: what is left is exactly the set named after a component.
 */
function tokensOf(files: string[]): { name: string; value: string }[] {
  const text = files.map((file) => readFileSync(file, 'utf8')).join('\n')
  return Object.entries(control)
    .filter(([key]) => !key.startsWith('height-') && key !== 'border-width')
    .filter(([key]) => text.includes(`--vectis-control-${key}`))
    .map(([key, token]) => ({ name: `--vectis-control-${key}`, value: cssValueOf(token.$value) }))
}

/**
 * A token value as the stylesheet carries it: an alias in braces (`{control.height.md}`)
 * becomes the `var()` it is generated as, which a reader overriding it will see in devtools,
 * rather than the source notation nothing in CSS understands.
 */
function cssValueOf(value: string): string {
  return value.replace(
    /\{([^}]+)\}/g,
    (_match, ref: string) => `var(--vectis-${ref.split('.').join('-')})`,
  )
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

/** The type blocks, each definition printed as a TEMPLATE LITERAL. */
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
