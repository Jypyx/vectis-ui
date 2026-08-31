export default {
  title: 'Installation',
  lead: 'Vectis UI is published as a single npm package, and it goes into any Vue 3 project the same way: add the package, load one stylesheet. The two routes below are those same two steps, written for the setup you already have.',

  viteHeading: 'Using Vite',
  viteBody:
    'A Vue 3 application, whether made with <code>create-vue</code> or any other Vite project. Vue is a peer dependency rather than something the library carries inside it, so it is installed alongside and there is only ever one copy of it in your application.',
  viteStyles:
    "Then load the core stylesheet once, where the application starts. <code>styles.css</code> is the reset, the tokens and the chrome every component shares, 4.33 kB gzip. Each component's own CSS travels with the component and arrives through the import you already write.",

  nuxtHeading: 'Using Nuxt 3 or 4',
  nuxtBody: 'Nuxt brings Vue with it, so the library is the only thing to add.',
  nuxtStyles:
    'The stylesheet is declared in the configuration rather than imported from a file, which is what puts it in the <code>&lt;head&gt;</code> of the server-rendered page instead of in a chunk the browser fetches once it is already showing the page.',
  nuxtSsr:
    "Nothing else is needed. The package is pre-built ESM, so there is no <code>build.transpile</code> entry to write, and every component is safe to render on the server: none of them reads <code>window</code> or <code>document</code> outside a handler or <code>onMounted</code>, and the ids they generate come from Vue's own <code>useId()</code>, so the server and the browser agree on them. This site is the demonstration rather than the promise. It is a Nuxt 4 application prerendered to static files, where a component reaching for the DOM too early would fail the build instead of the visitor.",

  cssHeading: 'Component CSS',
  cssBody:
    'Component CSS travels with the component as a plain static import, which Vite, Nitro and webpack all turn into a render-blocking link, including for a lazily loaded route.',
}
