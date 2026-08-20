/**
 * The home page.
 *
 * `heroTitle` carries its own `<br>` and its own accent `<span>`, because where a headline
 * breaks is a decision about the sentence, not about the layout — English breaks after
 * "library", French after "moderne", and neither can be derived from the other.
 */
export default {
  documentTitle: 'A modern UI library for HTML and CSS lovers',
  heroTitle: 'A modern UI library<br><span class="vd-hero-accent">for HTML and CSS lovers</span>',
  heroBody:
    'Vectis UI is a component library built on the latest HTML and CSS features, with no compromises and no need for external plugins.',
  heroCta: 'Install the library',

  whyHeading: 'Why it exists',
  whyBody:
    'Three decisions carry the whole library. Each one is stated with its reason, because a rule without a reason is a rule nobody can apply to the next case.',

  htmlFirstTitle: 'HTML and CSS first',
  htmlFirstBody:
    'Accordions are <code>&lt;details&gt;</code>, menus and tooltips rest on the top layer with no positioning library, forms report validity through <code>:user-invalid</code>. Where behavioural JavaScript exists, a comment in the file justifies it.',
  tokensTitle: 'One typed token source',
  tokensBody:
    'Primitives in OKLCH, then semantic roles — and a component may only name the second. A raw hex in component CSS is treated as a missing token, which is what lets an application repoint the accent without a component knowing.',
  overridesTitle: 'Overrides without a fight',
  overridesBody:
    'The CSS lives in four layers, and any non-layered consumer style wins automatically. That is the intended override mechanism, not a loophole: overriding a component never calls for a specificity war.',

  installHeading: 'Three lines to install',
  installBody:
    'The package is pre-built as ESM and SSR-safe. Named imports are tree-shaken by Vite and Nitro, so no <code>build.transpile</code> entry is required.',
  installCta: 'Read the installation guide',

  statFamilies: 'component families',
  statPalettes: 'OKLCH palettes, five wired to roles',
  /* A figure and not a caption, but the UNIT is a word and the decimal mark a convention, so
     it belongs here: 6.7 kB in English, 6,7 ko in French. The other three figures are bare
     numbers and stay in the template. */
  statCssValue: '6.7 kB',
  statCss: 'gzip, the core stylesheet',
  statDeps: 'runtime dependencies beyond Vue',

  a11yHeading: 'Accessibility, guaranteed',
  a11yPoints: [
    'The ARIA menu pattern: roving focus, focus returned to the trigger.',
    '<code>role="switch"</code> on VSwitch, announced as on or off rather than ticked.',
    'Tooltips linked by <code>aria-describedby</code> and dismissible with Escape.',
    '<code>prefers-reduced-motion</code> honoured in every component: transitions stop, loops slow down.',
  ],

  supportHeading: 'Browser support',
  supportBody:
    'Chrome and Edge 125+, Safari 26+. Baseline with no compromise: the Popover API, <code>&lt;dialog&gt;</code>, <code>:has()</code>, <code>color-mix()</code>, <code>@layer</code>.',
  supportFirefox:
    'CSS anchor positioning is not stable on Firefox, and there is deliberately no JavaScript fallback: panels open there, they are simply not anchored to their trigger.',
}
