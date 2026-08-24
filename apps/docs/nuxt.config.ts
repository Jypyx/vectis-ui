import { docRoutes } from './content/nav'

/**
 * A GitHub Pages PROJECT site is served from a subdirectory, never from the root. This is the
 * ONLY place that path is written: asset URLs are relative and Vite rewrites them, and the two
 * absolute URLs the build needs are composed from it below. Moving the site to a custom domain
 * is this one line.
 */
const BASE_URL = '/vectis-ui/'

/**
 * The locale segment the i18n strategy puts in front of a route.
 *
 * `prefix_except_default` means the default locale keeps the bare paths — every URL the site has
 * ever published stays valid — and the other language lives under its own segment. The empty
 * string for `en` is not a placeholder: it is what `docRoutes()` prepends, so one call covers
 * both locales with no branch.
 */
const LOCALE_PREFIXES = ['', '/fr']

/**
 * The Vectis UI documentation site.
 *
 * It is a STATIC site: `nuxt generate` prerenders every route, and the artefact is published
 * to GitHub Pages by the `pages` job in .github/workflows/ci.yml. Nothing here runs on a
 * server at request time, which is also what makes the site a real end-to-end test of the
 * library's SSR safety — a component reaching for `window` at setup would fail the build.
 */
export default defineNuxtConfig({
  compatibilityDate: '2026-08-16',
  devtools: { enabled: false },

  /*
   * Nuxt 4 resolves the application from an `app/` directory by default — `pages`,
   * `components`, `composables`, `plugins`, `assets`, `app.vue` and `error.vue` all live one
   * level down. This site keeps the flat layout, through the opt-out the upgrade guide
   * publishes for exactly that: `srcDir` back to the project root, and `dir.app` named so the
   * router-options slot keeps the meaning it had. Without BOTH lines Nuxt finds no `app/` and
   * builds a site with no pages at all — a successful build of nothing, not an error.
   *
   * Moving to the new layout is a separate change: it rewrites every `~/` specifier's meaning
   * and every path this repo's documentation names, and it buys nothing the flat layout does
   * not already do.
   */
  srcDir: '.',
  dir: { app: 'app' },

  modules: ['@nuxtjs/i18n'],

  /**
   * English and French, both PRERENDERED.
   *
   * The site is an artefact on GitHub Pages, so a language has to exist as a file: a
   * client-side swap after hydration would ship English HTML to a French reader, flash, and
   * be invisible to a crawler. Every `/fr/…` page below is therefore rendered at build time,
   * French words included.
   *
   * Version note: this is `@nuxtjs/i18n` 10, which is what Nuxt 4 requires — the module
   * depends on `@nuxt/kit` 4 and `vue-router` 5, so the two versions move together and
   * neither can be bumped alone.
   */
  i18n: {
    locales: [
      { code: 'en', language: 'en-GB', file: 'en.ts', name: 'English' },
      { code: 'fr', language: 'fr-FR', file: 'fr.ts', name: 'Français' },
    ],
    defaultLocale: 'en',
    // The default locale keeps the bare paths, so no URL this site has published ever breaks.
    strategy: 'prefix_except_default',
    langDir: 'locales',
    // Stated rather than left to the default filename: it carries the decision that messages are
    // plain text, without which `@import` in a sentence fails the build. See the file itself.
    vueI18n: './i18n.config.ts',
    /*
     * A prerendered artefact cannot negotiate a language. The cookie-driven redirect would run
     * on the client, after the English HTML has already painted, and it would hijack a deep
     * link one reader shared with another. The switcher in the header is the whole of the
     * choice, and it changes the URL — which is what makes the choice shareable.
     */
    detectBrowserLanguage: false,
    // Only used to make the `hreflang` alternates absolute; the path comes from `app.baseURL`.
    baseUrl: 'https://jypyx.github.io',
  },

  app: {
    baseURL: BASE_URL,
    head: {
      // `lang` is deliberately NOT set here: this block is serialized into the build, so a
      // literal would say `en` on every French page too. `app.vue` sets it from the active
      // locale instead, along with the `hreflang` alternates.
      //
      // `titleTemplate` lives in app.vue for the same reason — a string template would print
      // " · Vectis UI" on any page that sets no title of its own.
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${BASE_URL}favicon.svg` }],
      script: [
        {
          // Runs BEFORE first paint, which is the whole point: the design system's tokens
          // carry no `prefers-color-scheme` query at all (only [data-theme='light'] and
          // [data-theme='dark']), so the scheme has to be resolved in JS. Deferring it to
          // Vue would paint a light page first and flash.
          innerHTML: `(function(){try{var t=localStorage.getItem('vectis-docs-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`,
          tagPosition: 'head',
        },
      ],
    },
  },

  nitro: {
    // Emits .nojekyll alongside the site — without it GitHub Pages drops every path that
    // starts with an underscore, which is where Nuxt puts its build assets.
    preset: 'github-pages',
    prerender: {
      crawlLinks: true,
      // Belt as well as braces: the crawler follows the sidebar, but a slug that lost its
      // link would then vanish silently. The list comes from content/nav.ts, so a page
      // cannot be in the navigation and absent from the build — in either language.
      routes: [
        '/',
        '/404.html',
        ...LOCALE_PREFIXES.flatMap((prefix) => [`${prefix}/`, ...docRoutes(prefix)]),
      ],
      /**
       * Drop the doubled-locale paths the crawler invents, e.g. `/fr/fr/docs`.
       *
       * They come from nitro's own link following, not from the site: every internal `href`
       * here is absolute and carries the base URL (`/vectis-ui/fr/docs/installation`), and the
       * crawler resolves a handful of them against the current page's directory after stripping
       * that base — which turns an absolute link into a relative one and prepends `/fr/` a
       * second time. Verified: nothing in the generated HTML links to such a path, and removing
       * the `/fr/docs` redirect rule does not stop them, so the source is the crawler.
       *
       * What they cost is 16 kB of orphan page published for each, reachable only by typing it.
       * The list is DERIVED from the prefixes above so a third language needs no edit here.
       */
      ignore: LOCALE_PREFIXES.filter(Boolean).map((prefix) => `${prefix}${prefix}`),
    },
  },

  routeRules: {
    // The header points at the first page rather than at a section index. Under `generate`
    // this emits a real redirecting HTML file, so /docs is not a 404 for anyone who types it.
    //
    // The target carries the base URL, and must: nitro writes it into a `<meta http-equiv>`
    // verbatim, without prepending anything — so a bare `/docs/installation` would send a
    // GitHub Pages visitor to the root of the domain, which is not this site. The locale
    // segment is part of the target for the same reason: `/fr/docs` must land in French.
    '/docs': { redirect: `${BASE_URL}docs/installation` },
    '/fr/docs': { redirect: `${BASE_URL}fr/docs/installation` },
  },

  css: [
    // Order matters. styles.css carries the `@layer vectis.reset, vectis.tokens,
    // vectis.components, vectis.utilities;` statement, and a component sheet parsed before
    // it would pin its layer FIRST — under the reset — irreversibly.
    '@vectis/ui/styles.css',
    '~/assets/css/fonts.css',
    '~/assets/css/docs-layout.css',
  ],

  features: {
    /**
     * Ship the CSS as files, not as a `<style>` block in every page.
     *
     * Nuxt inlines critical CSS into the SSR'd HTML by default, which is the right trade for
     * an app with a handful of routes and the wrong one for fifty-three prerendered pages: the
     * same ~50 kB would be re-sent with each of them and never cached. Extracted, it is one
     * request that every later page hits in the cache — which is also exactly what the
     * Installation page tells a reader to do, so the site had better do it too.
     */
    inlineStyles: false,
  },

  imports: {
    transform: {
      /**
       * Keep Nuxt's auto-import rewriting off the library's own modules.
       *
       * `ssr.noExternal` below pulls `@vectis/ui` into the build, and a pnpm workspace link
       * resolves it to `packages/ui/dist/…` — a path with no `node_modules` in it, so the
       * default exclusion does not catch it. Nuxt then scans those files for bare
       * identifiers it can auto-import and injects `import { h } from 'vue'` on top of the
       * bundle's OWN minified `var h`, which fails the build with "Identifier h has already
       * been declared". Single-letter minified names make this a certainty, not a risk.
       */
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]packages[\\/]ui[\\/]dist[\\/]/],
    },
  },

  vite: {
    ssr: {
      // Every component module of the library carries `import './VX.css'`. Externalised, Node
      // cannot resolve that specifier and the prerender dies on the first component.
      noExternal: ['@vectis/ui'],
    },
    resolve: {
      // Two copies of Vue break provide/inject ACROSS the library boundary, with no error:
      // VAccordion, VToggle, VSideNavigation and VMenu all pass their context that way.
      dedupe: ['vue'],
    },
  },

  typescript: {
    // `nuxt typecheck` only; the build does not need to pay for it twice.
    typeCheck: false,
  },
})
