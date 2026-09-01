export default {
  title: 'Installation',
  lead: 'Vectis UI is distributed as a single npm package. Its integration into a Vue 3 project always comes down to two steps: installing the package and importing the stylesheet. The guides below show you how to apply these two steps depending on your setup.',

  viteHeading: 'With Vite',
  viteBody:
    'Vectis UI integrates into any Vue 3 application, whether generated with <code>create-vue</code> or another Vite project. Since Vue is a peer dependency, it is not directly included in our package. This avoids conflicts by ensuring there is always only a single instance of Vue in your final project.',
  viteStyles:
    "Next, import the global stylesheet once at your application's entry point (e.g., <code>main.ts</code>). The <code>styles.css</code> file includes the CSS reset, design tokens, and common base styles (only 4.33 kB gzipped). Component-specific styles are automatically loaded when they are imported.",

  nuxtHeading: 'With Nuxt 3 or 4',
  nuxtBody:
    'Since Nuxt already includes Vue, you only need to add the Vectis UI package to your project.',
  nuxtStyles:
    "Declare the stylesheet directly in <code>nuxt.config.ts</code> rather than importing it in a JavaScript file. Nuxt can then inject it into the page's <code>&lt;head&gt;</code> during server-side rendering (SSR), avoiding asynchronous loading and any visual flash (FOUC).",
  nuxtSsr:
    "No additional configuration is required. Distributed natively in ESM format, the package does not require any <code>build.transpile</code> option. All components are fully SSR-compatible: they only access browser objects (<code>window</code>, <code>document</code>) within <code>onMounted</code> or event handlers. Additionally, they use Vue's <code>useId()</code> composable to ensure identifier consistency between the server and the client.",

  cssHeading: 'Component CSS',
  cssBody:
    "Each component's CSS is directly linked to it via a static import. Tools like Vite, Nitro, or Webpack automatically transform it into a priority stylesheet, ensuring correct style rendering even for on-demand loaded routes (lazy loading).",
}
