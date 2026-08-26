export default {
  title: 'Installation',
  lead: 'The library is pre-built as ESM and SSR-safe. Named imports are tree-shaken by Vite and Nitro; no <code>build.transpile</code> is required.',

  vueHeading: 'Vue 3',
  vueBody:
    "<code>styles.css</code> is the core: the reset, the tokens and the chrome shared by every component, 6.7 kB gzip. Each component's own CSS ships with the component and is pulled in by the import you already write.",

  nuxtHeading: 'Nuxt 3',
  nuxtBody:
    "This site is that configuration: it is a Nuxt 3 application, prerendered to static files, which is also what makes it an end-to-end test of the library's SSR safety — a component reaching for <code>window</code> outside a handler would fail the build rather than the visitor.",

  cssHeading: 'Component CSS',
  cssBody:
    'Component CSS travels with the component as a plain static import, which Vite, Nitro and webpack all turn into a render-blocking link — including for a lazily loaded route. Keep the client CSS extracted to a file and the question of a flash does not arise.',
  cssQuote:
    'A page importing a single VButton downloads 7.25 kB gzip of CSS — the core plus that one component’s sheet. The other fifty-five sheets are never requested.',

  getHeading: 'What you get',
  getBody:
    'Named exports only, so the bundler prunes what you do not use. The French dictionary is opt-in for the same reason: not importing it is enough to leave it out.',
}
