import { docRoutes } from './content/nav'

/**
 * A GitHub Pages PROJECT site is served from a subdirectory, never from the root. This is the
 * ONLY place that path is written: asset URLs are relative and Vite rewrites them, and the two
 * absolute URLs the build needs are composed from it below. Moving the site to a custom domain
 * is this one line.
 */
const BASE_URL = '/vectis-ui/'

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

  app: {
    baseURL: BASE_URL,
    head: {
      htmlAttrs: { lang: 'en' },
      // `titleTemplate` lives in app.vue, not here: this block is serialized into the build,
      // so it can only hold plain data — and a string template would print " · Vectis UI"
      // on any page that sets no title of its own.
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
      // cannot be in the navigation and absent from the build.
      routes: ['/', '/configurator', '/404.html', ...docRoutes()],
    },
  },

  routeRules: {
    // The header points at the first page rather than at a section index. Under `generate`
    // this emits a real redirecting HTML file, so /docs is not a 404 for anyone who types it.
    //
    // The target carries the base URL, and must: nitro writes it into a `<meta http-equiv>`
    // verbatim, without prepending anything — so a bare `/docs/installation` would send a
    // GitHub Pages visitor to the root of the domain, which is not this site.
    '/docs': { redirect: `${BASE_URL}docs/installation` },
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
     * an app with a handful of routes and the wrong one for fifty-two prerendered pages: the
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
