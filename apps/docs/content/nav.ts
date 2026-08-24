/**
 * The documentation's table of contents, and the ONE list of it.
 *
 * Four consumers read this file: the sidebar rail, the search index, `nuxt.config.ts` — which
 * turns it into the prerender route list — and the post-build check that every one of those
 * routes really produced a file. Keeping them on one source is what makes it impossible to add
 * a page to the navigation and forget to build it, or to build a page nobody can reach.
 *
 * `written` marks a page that has real content. A slug that is listed but not written renders
 * the stub page, which says so plainly — the inventory stays honest about the shape of the
 * library instead of hiding the components nobody has documented yet.
 *
 * There is deliberately NO title here. Titles are language, and this file is read by two NODE
 * contexts (`nuxt.config.ts` and `scripts/check-prerender.ts`) where no vue-i18n exists; they
 * only ever needed the slugs. The words live in the message catalogue under `nav.<slug>`, and
 * `DocsSlug` below is what keeps the two in step: the catalogue is typed as a record over that
 * union, so adding an entry here without translating it fails `nuxt typecheck` rather than
 * printing a raw key in the sidebar.
 */

export interface NavEntry {
  /** URL segment under /docs/, and the file name of the page component when written. */
  slug: string
  /** False renders the stub page rather than a page of its own. */
  written: boolean
}

export interface NavGroup {
  /** The key of the heading the rail puts above the group, under `nav.group`. */
  id: NavGroupId
  entries: NavEntry[]
}

/*
 * The literal `S` is what makes `DocsSlug` a union of the fifty slugs rather than plain
 * `string` — without the generic, TypeScript widens each one at the call site and the record
 * type below would accept anything.
 */
const entry = <S extends string>(slug: S, written = false) => ({ slug, written }) as const

/** Everything that is not a component: how to install, theme, translate and audit the library. */
export const intro = [
  entry('installation', true),
  entry('theming', true),
  entry('iconography', true),
  entry('font-family', true),
  entry('i18n', true),
  entry('accessibility', true),
] as const

/**
 * One entry per exported component FAMILY — a family being a component and the subcomponents
 * that only exist inside it (VTabs owns VTab and VTabPanel, VDialog owns VDialogAlert).
 * Alphabetical, because a reader looking for one knows its name and not its category.
 */
export const components = [
  entry('accordion', true),
  entry('avatar'),
  entry('avatar-group'),
  entry('badge'),
  entry('breadcrumb'),
  entry('button', true),
  entry('button-group'),
  entry('carousel'),
  entry('checkbox'),
  entry('chip', true),
  entry('combobox'),
  entry('data-table'),
  entry('date-input'),
  entry('date-picker'),
  entry('dialog'),
  entry('file-input'),
  entry('file-picker'),
  entry('hotkeys'),
  entry('icon'),
  entry('icon-button'),
  entry('input', true),
  entry('input-otp'),
  entry('menu'),
  entry('pagination'),
  entry('popover'),
  entry('progress-circular'),
  entry('progress-linear'),
  entry('radio'),
  entry('separator'),
  entry('side-navigation', true),
  entry('skeleton-loader'),
  entry('slider'),
  entry('snackbar'),
  entry('spinner'),
  entry('switch', true),
  entry('tabs'),
  entry('textarea'),
  entry('time-input'),
  entry('time-picker'),
  entry('toast'),
  entry('toggle'),
  entry('tooltip'),
  entry('typography'),
] as const

/** What the package exports besides components: the functions, and the one CSS class. */
export const utils = [entry('js-helpers', true), entry('css-classes', true)] as const

/** The key of a group's heading, under `nav.group` in the message catalogue. */
export type NavGroupId = 'intro' | 'components' | 'utils'

/** The rail's three shelves, in reading order. */
export const groups: NavGroup[] = [
  { id: 'intro', entries: [...intro] },
  { id: 'components', entries: [...components] },
  { id: 'utils', entries: [...utils] },
]

/** Every slug the documentation offers — the type the message catalogue is a record over. */
export type DocsSlug =
  | (typeof intro)[number]['slug']
  | (typeof components)[number]['slug']
  | (typeof utils)[number]['slug']

/** Every page, flattened, each carrying the group it came from — the search index. */
export const allPages: (NavEntry & { section: NavGroupId })[] = groups.flatMap((group) =>
  group.entries.map((page) => ({ ...page, section: group.id })),
)

/** Looks a slug up. Returns undefined for a slug that is not in the inventory at all. */
export function pageOf(slug: string): (NavEntry & { section: NavGroupId }) | undefined {
  return allPages.find((page) => page.slug === slug)
}

/**
 * The prerender route list, consumed by nuxt.config.ts and by the post-build check.
 *
 * `prefix` is the locale segment the i18n strategy adds — empty for the default locale, `/fr`
 * for the other. Passing it here rather than mapping the result at each call site is what keeps
 * the two consumers producing the SAME list: a route built one way in the config and another
 * way in the check would let a missing page pass unnoticed, which is the one thing this file
 * exists to prevent.
 */
export function docRoutes(prefix = ''): string[] {
  return allPages.map((page) => `${prefix}/docs/${page.slug}`)
}
