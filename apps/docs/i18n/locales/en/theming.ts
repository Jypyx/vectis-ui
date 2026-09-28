export default {
  title: 'Theming',
  lead: 'Select a light or dark theme with <code>data-theme</code>. Customise component styles by overriding the <code>--vectis-*</code> CSS variables.',
  switchHeading: 'Switch themes',
  switchBody:
    'Set <code>data-theme="dark"</code> on <code>&lt;html&gt;</code> for the dark theme. Use <code>data-theme="light"</code> for the light theme, which is also the default.',
  switchLight: 'Light',
  switchDark: 'Dark',
  switchScope:
    'Set <code>data-theme</code> on a container to theme one section. Nested containers can use a different theme.',
  switchColorScheme:
    'Each theme also sets <code>color-scheme</code>, which adapts native form controls and scrollbars.',
  switchSystem:
    'The library does not select a theme from the system preference. Read <code>prefers-color-scheme</code> in your application if needed. This example reads the preference once; apply it before first paint to avoid a theme flash.',
  tokensHeading: 'Customise colours and tokens',
  tokensBody: 'Design tokens are exposed as CSS variables at two levels:',
  tokensLevels: [
    '<strong>Primitives</strong>: Colour palettes and scales for spacing, typography, radii, shadows and motion.',
    '<strong>Semantic roles</strong>: Variables named by purpose, such as <code>--vectis-color-surface</code> or <code>--vectis-color-accent</code>. Use these to customise components.',
  ],
  tokensRoles:
    'Changing a semantic token updates the components that use it. The focus colour has its own token, <code>--vectis-focus-ring-color</code>. Check both text and focus contrast when changing your palette.',
  tokensOverride:
    'Override tokens on <code>:root</code> for the whole page, on a class for a section, or on <code>[data-theme="dark"]</code> for dark-theme values.',
  tokensDemoCaption:
    'This panel overrides the accent colours, focus colour and corner radii. Accent text has a separate value in the dark theme.',
  tokensOklch:
    'The built-in palettes use OKLCH. You can use other CSS colour formats for overrides. Check the resulting hover, pressed and tinted states, including those derived with <code>color-mix()</code>.',
  tokensPalettes:
    'Five palettes are included: <code>gray</code>, <code>indigo</code>, <code>red</code>, <code>green</code> and <code>amber</code>. To use a different palette, assign your colours to the semantic tokens.',
  tokensReferenceBefore: 'Token descriptions and default values for both themes are listed in',
  tokensReferenceAfter: '.',
  layersHeading: 'CSS layers',
  layersBody:
    'The library declares four layers, in order: <code>vectis.reset</code>, <code>vectis.tokens</code>, <code>vectis.components</code> and <code>vectis.utilities</code>. Write overrides outside these layers to take precedence over the library’s normal declarations.',
  layersTrap:
    'If your application uses layers, declare its override layer after the library’s layers. Avoid adding overrides to <code>vectis.components</code>, where selector specificity and source order still determine priority.',
  buildHeading: 'CSS build targets',
  buildBody:
    'Set your CSS build targets to the library’s supported browser versions. Older targets can cause the bundler to rewrite features such as <code>:dir()</code> and OKLCH colours.',
  buildDir:
    'For example, converting <code>:dir(rtl)</code> to language selectors breaks direction-based styles on a page with <code>dir="rtl"</code> and <code>lang="en"</code>. Check the production build as well as the development server.',
  buildFix:
    'Set <code>build.cssTarget</code> in Vite, or <code>vite.build.cssTarget</code> in Nuxt:',
}
