/**
 * Generates `content/api/<slug>.ts`: the props, events, slots and CSS variables every component
 * page's API section lists.
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
 * Defaults the extractor can only report as the expression that produced them.
 *
 * A reader wants the VALUE, and `EDGE_STEP_DELAY` tells them nothing they can act on. Keyed
 * `Component.prop`, and deliberately a table rather than a rule: each of these is a decision
 * about what the number MEANS, and the day one of them changes the build should not quietly
 * agree with a stale answer here. An entry pointing at a prop that no longer exists is reported.
 */
const DEFAULT_OVERRIDES: Record<string, string> = {
  'VCalendar.date': 'today',
  'VCalendar.edgeStepDelay': '800',
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

interface Row {
  name: string
  key?: string
  type: string
  default?: string
}

const row = (name: string, type: string, fallback?: string): Row => {
  const key = keyFor(name)
  return {
    name,
    ...(key === name ? {} : { key }),
    type,
    ...(fallback ? { default: fallback } : {}),
  }
}

const checker = createChecker(join(uiRoot, 'tsconfig.json'), {
  forceUseTs: true,
  printer: { newLine: 1 },
})

const index = indexComponents()
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
