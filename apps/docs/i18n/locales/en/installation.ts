export default {
  title: 'Installation',
  lead: 'Install <code>vectis-ui</code> in your Vue 3 project and import its global stylesheet.',
  viteHeading: 'With Vite',
  viteBody: 'Install <code>vectis-ui</code> and its peer dependency, <code>vue</code>.',
  viteStyles:
    'Import <code>vectis-ui/styles.css</code> once in <code>main.ts</code>. It includes the CSS reset, design tokens and shared styles.',
  nuxtHeading: 'With Nuxt 3 or 4',
  nuxtBody: 'Install <code>vectis-ui</code>. Nuxt already provides Vue.',
  nuxtStyles:
    'Add the global stylesheet to the <code>css</code> array in <code>nuxt.config.ts</code>.',
  nuxtSsr: 'Components support server-side rendering.',
  cssHeading: 'Component CSS',
  cssBody:
    'Component styles load with their imports. You do not need to import a separate stylesheet for each component.',
}
