/**
 * The home page.
 *
 * `heroTitle` carries its own `<br>` and its own accent `<span>`, because where a headline
 * breaks is a decision about the sentence, not about the layout — English breaks after
 * "library", French after "moderne", and neither can be derived from the other.
 */
export default {
  documentTitle: 'Native elegance for Vue 3',
  heroTitle: 'Native elegance,<br><span class="vd-hero-accent">without artificial bloat.</span>',
  heroBody:
    'Vectis UI is an ultra-lightweight suite of Vue 3 components driven by native CSS tokens. Zero overhead, zero dependencies, zero compromises.',
  heroCta: 'Install the library',

  /*
   * The six feature cards, and the section that holds them.
   *
   * Written in French first, unusually for this site — the wording was dictated in that language,
   * so the English below is a rewrite rather than the source the French is measured against.
   * Idiom over calque: "soupe de classes" is class soup, "guerres de sélecteurs" selector wars.
   */
  standardsHeading: "An architecture aligned with the web's own standards",
  standardsSubtitle:
    'Nuxt integration that needs no coaxing, and styling made simple by CSS layers. Everything is built for customisation you can predict, on top of semantic, accessible HTML.',

  nativeTitle: 'Zero dependencies, all native',
  nativeBody:
    'Built with no wrapper layer and no utility framework, so your markup never turns into class soup. What you ship stays light, readable and fast, and asks you to install nothing else.',
  standardTitle: 'At the front of the web platform',
  standardBody:
    'Draws on the newest native capabilities, such as the Popover API and CSS Anchor Positioning, for interfaces that perform on a minimum of JavaScript.',
  customizationTitle: 'Customisation without limits',
  customizationBody:
    'Bend the whole theme, and every component in it, to your brand in a moment. The entire visual configuration rests on native custom properties: CSS variables, and nothing more.',
  /*
   * `@layer` and `!important` are exactly what the pass-through message compiler exists for:
   * vue-i18n's own message language reads `@` as a linked reference and would throw at render,
   * which on a statically generated site means a page missing from the artefact.
   */
  overridesTitle: 'Overrides without friction',
  overridesBody:
    'No more selector wars, no more <code>!important</code>. CSS layers (<code>@layer</code>) give the architecture a strict hierarchy, and that is what makes overriding a single component entirely predictable.',
  ssrTitle: 'Ready for SSR and Nuxt',
  ssrBody:
    'Designed for modern architectures: every component is safe to render on the server, which is what keeps both search engines and first paint happy.',
  iconsTitle: 'Complete freedom of iconography',
  iconsBody:
    'Never locked into someone else’s icon set. The system is entirely agnostic and lets you plug in any icon font or library, off the shelf or your own.',

  /* Written in French first, like the cards above — the English is a rewrite, not a calque. */
  accessibilityHeading: 'Accessibility as a standard, not as an option.',
  accessibilitySubtitle:
    'Vectis UI is inclusive out of the box and ready for production. Built to meet what the web asks of an interface today, it holds to strict conformance while targeting the newest rendering engines.',

  /*
   * The three measures that replace what used to be an accordion of three claims. Only the
   * LABELS are here: the figures themselves (`0`, `4.5:1`, `3:1`) are digits and universal
   * punctuation, which the dictionary boundary leaves in the template — the rule VBadge's `99+`
   * and the `N/M` counter already follow.
   *
   * Each is a guarantee something MECHANICAL holds, which is the whole reason the band shows
   * measures rather than sentences: axe runs after every play function with `test: 'error'`, so
   * a violation fails the suite, and CI runs that suite once per theme on every push and pull
   * request. Nothing here drifts with the size of the library, so nothing here can rot the way
   * a component count would.
   */
  a11yViolationsLabel: 'axe violations',
  a11yViolationsNote: 'in both themes, on every run',
  a11yContrastLabel: 'text contrast',
  a11yContrastNote: 'the WCAG 2 AA floor',
  a11yFocusLabel: 'focus indicators',
  a11yFocusNote: 'visible on every control',

  /*
   * The three steps, shown in a mock editor window. Written in French first, like the two bands
   * above — the English is a rewrite rather than the source.
   *
   * TRAP — `stepXBody` is prose that ends up INSIDE a code block, as a comment above the sample.
   * That makes it the one place on this site where a code sample is localised, against the rule
   * that they stay English; the rule protects the agreement between a LIVE demo and its printed
   * snippet, and there is no demo here — the comment IS the prose, so leaving it in English on a
   * French page would be the actual defect. Keep these sentences SHORT: a long one turns into a
   * long monospaced line and opens a horizontal scrollbar on the block.
   */
  installHeading: 'Install, import, build',
  installSubtitle:
    'Add the dependency, load the global styles, and start using Vectis UI components with nothing else to configure.',
  installTabsLabel: 'Installation steps',

  stepInstallLabel: 'Installation',
  stepInstallBody: 'Add the package to your project with whichever manager you prefer.',
  stepStylesLabel: 'Style import',
  stepStylesBody: "Load the global styles in your application's entry point.",
  stepUseLabel: 'Usage',
  stepUseBody: 'Import the components you need straight into your views or components.',
}
