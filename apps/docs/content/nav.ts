/**
 * The documentation's table of contents, and the ONE list of it.
 *
 * Three consumers read this file: the sidebar rail, the search index, and `nuxt.config.ts`,
 * which turns it into the prerender route list. Keeping them on one source is what makes it
 * impossible to add a page to the navigation and forget to build it, or to build a page
 * nobody can reach.
 *
 * `written` marks a page that has real content. A slug that is listed but not written renders
 * the stub page, which says so plainly — the inventory stays honest about the shape of the
 * library instead of hiding the components nobody has documented yet.
 */

export interface NavEntry {
  /** URL segment under /docs/, and the file name of the page component when written. */
  slug: string
  /** What the sidebar, the search result and the browser tab show. */
  title: string
  /** False renders the stub page rather than a page of its own. */
  written: boolean
}

export interface NavGroup {
  /** The heading the rail puts above the group. */
  label: string
  entries: NavEntry[]
}

const entry = (slug: string, title: string, written = false): NavEntry => ({ slug, title, written })

/** Everything that is not a component: how to install, theme, translate and audit the library. */
export const intro: NavEntry[] = [
  entry('installation', 'Installation', true),
  entry('theming', 'Theming', true),
  entry('iconography', 'Iconography', true),
  entry('font-family', 'Font family', true),
  entry('i18n', 'Localisation (i18n)', true),
  entry('accessibility', 'Accessibility', true),
]

/**
 * One entry per exported component FAMILY — a family being a component and the subcomponents
 * that only exist inside it (VTabs owns VTab and VTabPanel, VDialog owns VDialogAlert).
 * Alphabetical, because a reader looking for one knows its name and not its category.
 */
export const components: NavEntry[] = [
  entry('accordion', 'Accordion', true),
  entry('avatar', 'Avatar'),
  entry('avatar-group', 'Avatar group'),
  entry('badge', 'Badge'),
  entry('breadcrumb', 'Breadcrumb'),
  entry('button', 'Button', true),
  entry('button-group', 'Button group'),
  entry('calendar', 'Calendar'),
  entry('carousel', 'Carousel'),
  entry('checkbox', 'Checkbox'),
  entry('chip', 'Chip', true),
  entry('combobox', 'Combobox'),
  entry('data-table', 'Data table'),
  entry('date-picker', 'Date picker'),
  entry('dialog', 'Dialog'),
  entry('file-picker', 'File picker'),
  entry('file-upload', 'File upload'),
  entry('hotkeys', 'Hotkeys'),
  entry('icon', 'Icon'),
  entry('icon-button', 'Icon button'),
  entry('input', 'Input', true),
  entry('input-otp', 'Input OTP'),
  entry('menu', 'Menu'),
  entry('pagination', 'Pagination'),
  entry('popover', 'Popover'),
  entry('progress-circular', 'Progress circular'),
  entry('progress-linear', 'Progress linear'),
  entry('radio', 'Radio'),
  entry('separator', 'Separator'),
  entry('side-navigation', 'Side navigation', true),
  entry('skeleton-loader', 'Skeleton loader'),
  entry('slider', 'Slider'),
  entry('spinner', 'Spinner'),
  entry('switch', 'Switch', true),
  entry('tabs', 'Tabs'),
  entry('textarea', 'Textarea'),
  entry('time-picker', 'Time picker'),
  entry('toast', 'Toast'),
  entry('toggle', 'Toggle'),
  entry('tooltip', 'Tooltip'),
  entry('typography', 'Typography'),
]

/** What the package exports besides components: the functions, and the one CSS class. */
export const utils: NavEntry[] = [
  entry('js-helpers', 'JavaScript helpers', true),
  entry('css-classes', 'CSS helper classes', true),
]

/** The rail's three shelves, in reading order. */
export const groups: NavGroup[] = [
  { label: 'Introduction', entries: intro },
  { label: 'Components', entries: components },
  { label: 'Utilities', entries: utils },
]

/** Every page, flattened, each carrying the group it came from — the search index. */
export const allPages: (NavEntry & { section: string })[] = groups.flatMap((group) =>
  group.entries.map((page) => ({ ...page, section: group.label })),
)

/** Looks a slug up. Returns undefined for a slug that is not in the inventory at all. */
export function pageOf(slug: string): (NavEntry & { section: string }) | undefined {
  return allPages.find((page) => page.slug === slug)
}

/** The prerender route list, consumed by nuxt.config.ts. */
export function docRoutes(): string[] {
  return allPages.map((page) => `/docs/${page.slug}`)
}
