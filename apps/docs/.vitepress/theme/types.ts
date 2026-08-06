/**
 * The docs theme's own config shape.
 *
 * It is not the default theme's: `themeConfig.sidebar` there is resolved by `useSidebar`,
 * which vitepress does not export, so a custom theme reading that shape would be
 * reimplementing a private helper against a schema it does not own. This is a small,
 * explicit structure the theme reads directly.
 *
 * It is serialised into the `@siteData` virtual module, so every value here must be
 * plain JSON — no functions, no component references; icons travel as names.
 */

/** A destination in the navbar or the sidebar. */
export interface DocsNavItem {
  text: string
  /**
   * Site-relative, without `base` and without an extension: `/guide/installation`, `/`
   * for the home page. This is the SAME spelling `useActiveLink()` produces, which is
   * what makes the active-item comparison a plain string equality.
   */
  link: string
}

/** A labelled block of sidebar entries — rendered as a `VSideNavigationGroup`. */
export interface DocsSidebarSection {
  label: string
  items: DocsNavItem[]
}

export interface DocsThemeConfig {
  nav: DocsNavItem[]
  /**
   * Keyed by top-level section prefix (`/guide/`, `/components/`). The theme picks the
   * entry whose key prefixes the current page, so a page outside every section (the home
   * page) simply gets no sidebar.
   */
  sidebar: Record<string, DocsSidebarSection[]>
  /** The repository the "GitHub" navbar entry points at. */
  repository: string
  /** Where the Storybook build is served from, relative to `base`. */
  storybook: string
  /**
   * Read by vitepress's `localSearchPlugin`, not by this theme: the plugin is inert
   * unless the provider is `local`, and it is what builds the `@localSearchIndex` module
   * `DocsSearch.vue` queries. Declared here only so `defineConfigWithTheme` accepts it.
   */
  search: {
    provider: 'local'
    options?: { miniSearch?: { options?: { storeFields?: string[] } } }
  }
}
