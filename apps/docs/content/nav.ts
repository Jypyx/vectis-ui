/**
 * The words live in the message catalogue under `nav.<slug>`, and `DocsSlug` below is what
 * keeps the two in step: the catalogue is typed as a record over that union, so adding an entry
 * here without translating it fails `nuxt typecheck` rather than printing a raw key in the
 * sidebar.
 */

export interface NavEntry {
  /** URL segment under /docs/, and the file name of the page component. */
  slug: string
}

export interface NavGroup {
  /** The key of the heading the rail puts above the group, under `nav.group`. */
  id: NavGroupId
  entries: NavEntry[]
}

/*
 * The literal `S` is what makes `DocsSlug` a union of the fifty slugs rather than plain
 * `string`; without the generic, TypeScript widens each one at the call site and the record
 * type below would accept anything.
 */
const entry = <S extends string>(slug: S) => ({ slug }) as const

/** Everything that is not a component: how to install, theme, translate and audit the library. */
export const intro = [
  entry('installation'),
  entry('theming'),
  entry('design-tokens'),
  entry('iconography'),
  entry('font-family'),
  entry('i18n'),
  entry('accessibility'),
] as const

/**
 * One entry per exported component FAMILY; a family being a component and the subcomponents
 * that only exist inside it (VTabs owns VTab and VTabPanel, VDialog owns VDialogAlert).
 */
export const components = [
  entry('accordion'),
  entry('alert'),
  entry('avatar'),
  entry('avatar-group'),
  entry('badge'),
  entry('breadcrumb'),
  entry('button'),
  entry('button-group'),
  entry('calendar'),
  entry('card'),
  entry('carousel'),
  entry('checkbox'),
  entry('chip'),
  entry('color-input'),
  entry('color-picker'),
  entry('combobox'),
  entry('command-palette'),
  entry('context-menu'),
  entry('data-table'),
  entry('date-input'),
  entry('date-picker'),
  entry('dialog'),
  entry('drawer'),
  entry('empty-state'),
  entry('field'),
  entry('fieldset'),
  entry('file-input'),
  entry('file-picker'),
  entry('hotkeys'),
  entry('hover-card'),
  entry('icon'),
  entry('icon-button'),
  entry('input'),
  entry('input-group'),
  entry('input-otp'),
  entry('link'),
  entry('menu'),
  entry('meter'),
  entry('number-input'),
  entry('pagination'),
  entry('popover'),
  entry('progress-circular'),
  entry('progress-linear'),
  entry('radio'),
  entry('rating'),
  entry('separator'),
  entry('side-navigation'),
  entry('skeleton-loader'),
  entry('slider'),
  entry('snackbar'),
  entry('spinner'),
  entry('split-button'),
  entry('stepper'),
  entry('switch'),
  entry('tabs'),
  entry('textarea'),
  entry('time-input'),
  entry('time-picker'),
  entry('timeline'),
  entry('toast'),
  entry('toggle'),
  entry('tooltip'),
  entry('tree-view'),
  entry('typography'),
] as const

/** What the package exports besides components: the functions, and the one CSS class. */
export const utils = [entry('js-helpers'), entry('css-classes')] as const

/** The key of a group's heading, under `nav.group` in the message catalogue. */
export type NavGroupId = 'intro' | 'components' | 'utils'

/** The rail's three shelves, in reading order. */
export const groups: NavGroup[] = [
  { id: 'intro', entries: [...intro] },
  { id: 'components', entries: [...components] },
  { id: 'utils', entries: [...utils] },
]

/** Every slug the documentation offers; the type the message catalogue is a record over. */
export type DocsSlug =
  | (typeof intro)[number]['slug']
  | (typeof components)[number]['slug']
  | (typeof utils)[number]['slug']

/** Every page, flattened, each carrying the group it came from; the search index. */
export const allPages: (NavEntry & { section: NavGroupId })[] = groups.flatMap((group) =>
  group.entries.map((page) => ({ ...page, section: group.id })),
)

/** Looks a slug up. Returns undefined for a slug that is not in the inventory at all. */
export function pageOf(slug: string): (NavEntry & { section: NavGroupId }) | undefined {
  return allPages.find((page) => page.slug === slug)
}

/**
 * The prerender route list, consumed by nuxt.config.ts and by the post-build check. `prefix` is
 * the locale segment the i18n strategy adds; empty for the default locale, `/fr` for the other.
 */
export function docRoutes(prefix = ''): string[] {
  return allPages.map((page) => `${prefix}/docs/${page.slug}`)
}
