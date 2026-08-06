import { defineConfigWithTheme } from 'vitepress'

import { nav, sidebar } from './nav'
import type { DocsThemeConfig } from './theme/types'

/*
 * Theme resolution before the first paint.
 *
 * The design system is 100% attribute-driven: `tokens.css` declares exactly `:root`,
 * `[data-theme='light']` and `[data-theme='dark']`, and holds no `prefers-color-scheme`
 * query at all — so resolving "system" is the HOST's job (`.storybook/preview.ts` is the
 * reference implementation, and this is the same resolution, character for character, as
 * `theme/composables/useDocsTheme.ts`).
 *
 * Without this script a prerendered page paints light before the store mounts. The
 * `try`/`catch` is load-bearing rather than defensive: `localStorage` throws outright in
 * a partitioned third-party context, and an uncaught error here would leave `<html>` with
 * no `data-theme` at all — which the DS reads as `:root`, i.e. light. The catch therefore
 * writes the same value the failure would have produced, explicitly.
 */
const PREPAINT = `(()=>{try{var s=localStorage.getItem('vectis-theme-appearance')||'system';var d=s==='dark'||(s!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()`

export default defineConfigWithTheme<DocsThemeConfig>({
  title: 'Vectis UI',
  description: 'A Vue 3 design system — HTML/CSS first, token-driven, Nuxt 3 (SSR) ready.',
  lang: 'en-US',

  // GitHub Pages PROJECT site. Every internal href goes through `withBase()`.
  base: '/vectis-ui/',
  cleanUrls: true,

  /*
   * VitePress toggles a `.dark` CLASS; the design system reads a `data-theme` ATTRIBUTE.
   * Keeping both would put two theme signals on `<html>` at once, kept in step only by a
   * watcher — and any path that writes one without the other splits the page in half.
   * `false` stops VitePress injecting its own appearance script, leaving exactly ONE
   * signal in the document: `html[data-theme]`, which the tokens, the Shiki flip and
   * every docs rule key on.
   */
  appearance: false,

  lastUpdated: true,
  // No favicon link: there is no artwork to point it at yet, and a dead `<link rel=icon>`
  // is a 404 on every page. Drop a `public/favicon.svg` in and add the entry back.
  head: [['script', {}, PREPAINT]],

  markdown: {
    // Dual theme: Shiki writes the light colour inline and the dark one into
    // `--shiki-dark` custom properties. Flipping them is the theme's job (styles/code.css)
    // since the default theme's stylesheet, which normally does it, is never loaded.
    /*
     * `github-dark-default`, not `github-dark`: the latter's comment grey (#6A737D) is
     * calibrated for GitHub's own #24292e background, and against this site's
     * `--vectis-color-surface-sunken` — oklch(11%…) in dark — it measures 3.99:1, an AA
     * failure axe reports. The current GitHub dark palette clears it at 6.2:1. Any change
     * to the code-block background has to be re-checked against the same pair.
     */
    theme: { light: 'github-light', dark: 'github-dark-default' },
    /*
     * Opting in is required, and the failure is silent: `headersPlugin` is registered
     * only `if (options.headers)`, so without this `page.headers` is an empty array on
     * every page and `DocsOutline` renders nothing at all. The default theme sets it
     * itself, which is exactly why a custom theme has to.
     */
    headers: { level: [2, 3] },
  },

  /*
   * Our own shape, not the default theme's: `themeConfig.sidebar` there is resolved by
   * `useSidebar`, which vitepress does not export. It is serialised into `@siteData`, so
   * it may hold plain JSON only.
   */
  themeConfig: {
    nav,
    sidebar,
    repository: 'https://github.com/Jypyx/vectis-ui',
    storybook: '/storybook/',

    /*
     * This enables the INDEX, not a UI: `localSearchPlugin` returns an inert plugin
     * unless the provider is `local`, and the `@localSearchIndex` virtual module it
     * serves is what `DocsSearch.vue` queries. The default theme's search box is never
     * loaded — this theme does not import it.
     *
     * `storeFields` is widened by one field. The plugin indexes `title`, `titles` and
     * `text` but stores only the first two, so without this a result carries no excerpt.
     * The object is spread over the plugin's own, so naming the other two back is
     * required, not redundant.
     */
    search: {
      provider: 'local',
      options: {
        miniSearch: { options: { storeFields: ['title', 'titles', 'text'] } },
      },
    },
  },

  vite: {
    /*
     * The library is consumed as `dist`, exactly as an npm consumer does. Its component
     * modules each carry an `import './VX.css'`, which Node cannot resolve on its own:
     * `noExternal` hands `@vectis/ui` to Vite's SSR pipeline, which is what makes those
     * imports resolvable during the prerender.
     */
    ssr: { noExternal: ['@vectis/ui'] },
    /*
     * vitepress depends on its own `vue`. Two copies would break every `provide`/`inject`
     * crossing the DS boundary (VSideNavigation's `sideNavigationKey`, VIcon's context)
     * with no error message at all — the symptom is a sidebar rendering flat.
     */
    resolve: { dedupe: ['vue'] },
  },
})
