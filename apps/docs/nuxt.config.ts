import { docRoutes } from './content/nav'
import { LOCALE_PREFIXES, SITE_URL } from './content/site'

/** Central base URL for asset and redirect paths. */
const BASE_URL = '/'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-16',
  devtools: { enabled: false },

  /*
   * Keep the flat app layout explicit; otherwise Nuxt can generate an empty site while
   * reporting success.
   */
  srcDir: '.',
  dir: { app: 'app' },

  modules: ['@nuxtjs/i18n'],

  /** Prerender both locales because a static host cannot negotiate language. */
  i18n: {
    locales: [
      { code: 'en', language: 'en-GB', file: 'en.ts', name: 'English' },
      { code: 'fr', language: 'fr-FR', file: 'fr.ts', name: 'Français' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    /* Match the served trailing-slash URLs to avoid GitHub Pages redirects. */
    trailingSlash: true,
    langDir: 'locales',
    // Use the pass-through compiler so technical punctuation such as @import remains literal
    // text.
    vueI18n: './i18n.config.ts',
    /*
     * Use URL-based locale selection; client language detection would replace shared deep links
     * after first paint.
     */
    detectBrowserLanguage: false,
    baseUrl: SITE_URL,
  },

  app: {
    baseURL: BASE_URL,
    head: {
      // Set lang in app.vue from the active locale; this static head is shared by both
      // languages.
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${BASE_URL}favicon.svg` }],
      script: [
        {
          // Resolve data-theme before first paint because library tokens do not follow
          // prefers-color-scheme automatically.
          innerHTML: `(function(){try{var t=localStorage.getItem('vectis-docs-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`,
          tagPosition: 'head',
        },
      ],
    },
  },

  nitro: {
    // Emit .nojekyll so GitHub Pages serves Nuxt's underscore-prefixed assets.
    preset: 'github-pages',
    prerender: {
      /** Prerender sequentially because the library locale is shared process-wide. */
      concurrency: 1,
      crawlLinks: true,
      // List navigation routes explicitly so missing crawler links cannot silently drop pages.
      routes: [
        '/',
        '/404.html',
        /* Explicitly prerender these server routes because no page links to them. */
        '/robots.txt',
        '/sitemap.xml',
        ...LOCALE_PREFIXES.flatMap((prefix) => [`${prefix}/`, ...docRoutes(prefix)]),
      ],
      /** Ignore doubled-locale paths produced by prerender crawling. */
      ignore: [
        ...LOCALE_PREFIXES.filter(Boolean).map((prefix) => `${prefix}${prefix}`),
        /*
         * Exclude demo-only destinations from crawling; their illustrative href values are not
         * site routes.
         */
        '/app',
      ],
    },
  },

  routeRules: {
    // Compose redirect targets with the base URL and locale because Nitro serializes them
    // verbatim.
    '/docs': { redirect: `${BASE_URL}docs/installation/` },
    '/fr/docs': { redirect: `${BASE_URL}fr/docs/installation/` },
  },

  css: [
    // Load the core layer statement before component sheets so their first encounter cannot pin
    // components below reset.
    'vectis-ui/styles.css',
    '~/assets/css/fonts.css',
    '~/assets/css/docs-layout.css',
  ],

  features: {
    /**
     * Serve shared CSS files for caching instead of repeating critical styles in every
     * prerendered page.
     */
    inlineStyles: false,
  },

  imports: {
    transform: {
      /**
       * Exclude workspace library dist from auto-import rewriting; its resolved path contains
       * no node_modules segment.
       */
      /*
       * Examples use explicit imports because their raw source is shown as copyable consumer
       * code.
       */
      exclude: [
        /[\\/]node_modules[\\/]/,
        /[\\/]packages[\\/]ui[\\/]dist[\\/]/,
        /[\\/]apps[\\/]docs[\\/]examples[\\/]/,
      ],
    },
  },

  vite: {
    build: {
      /*
       * Match the library CSS floor to preserve direction-based selectors; lowering dir to
       * language selectors breaks RTL with an English locale.
       */
      cssTarget: ['chrome134', 'edge134', 'safari26', 'firefox147'],
    },
    ssr: {
      // Bundle library modules for SSR because Node cannot load their CSS imports as external
      // modules.
      noExternal: ['vectis-ui'],
    },
    resolve: {
      // Deduplicate Vue so provide/inject uses one runtime across the library boundary.
      dedupe: ['vue'],
    },
  },

  typescript: {
    // `nuxt typecheck` only; the build does not need to pay for it twice.
    typeCheck: false,
  },
})
