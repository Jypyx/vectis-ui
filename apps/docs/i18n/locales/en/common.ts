/**
 * The site's chrome: the header, the search panel, the outline, the code blocks and the tables.
 *
 * Everything here is a label rather than prose, so it is a plain string and never carries
 * markup. `DocsProse` is for paragraphs, `t()` for the words on a control.
 */
export default {
  header: {
    /**
     * Names the `<nav>` holding Home and Documentation, so a screen reader can tell the two
     * navs apart.
     */
    mainNav: 'Main',
    home: 'Home',
    docs: 'Documentation',
    getStarted: 'Get started',
    openNavigation: 'Open the navigation',
    toLight: 'Switch to the light theme',
    toDark: 'Switch to the dark theme',
    changeLanguage: 'Change the language',
  },
  search: {
    open: 'Search',
    label: 'Search the documentation',
    placeholder: 'Search pages and components',
    empty: 'No result',
  },
  outline: 'On this page',
  sidebar: 'Documentation',
  /* The heading of the section every component page opens on, above its API. It is the same
     word on all forty-four, so it lives here rather than in each page's own catalogue. */
  usage: 'Usage',
  code: {
    copy: 'Copy the code',
    copied: 'Copied to the clipboard',
    /** Names the toggle an install command carries in its header, in DocsInstall. */
    packageManager: 'Package manager',
  },
  /* The two words on the toggle every live example carries, and the name of the toggle itself,
     which is the only thing a screen reader has to tell the two buttons apart from the page. */
  example: {
    label: 'What the example shows',
    preview: 'Preview',
    code: 'Code',
  },
  /* The headings of a component page's API section. They are the same on all forty-four, so
     they live here rather than in each page's own catalogue. */
  api: {
    heading: 'API',
    props: 'Props',
    events: 'Events',
    slots: 'Slots',
    cssVariables: 'CSS variables',
  },
  table: {
    prop: 'Prop',
    type: 'Type',
    default: 'Default',
    event: 'Event',
    slot: 'Slot',
    class: 'Class',
    effect: 'Effect',
    helper: 'Helper',
    signature: 'Signature',
    token: 'Token',
    value: 'Value',
    /* What a Default cell says for a prop that has none. A word rather than a dash: a screen
       reader announces punctuation as punctuation, or skips it entirely. */
    noDefault: 'none',
  },
  /*
   * The site's footer.
   *
   * TRAP: the two anchors are written INTO the message, hrefs and all, which duplicates the two
   * URLs across the locales. Both alternatives are worse. Splitting the sentence around the
   * product names would leave "Built with" and "and" as translation units, exactly what
   * DocsProse's own header calls untranslatable; and parameterising the message is impossible,
   * the site's pass-through messageCompiler having removed `{…}` interpolation on purpose.
   *
   * The heart beside it is NOT here: a symbol made of no words stays in the template, the rule
   * that keeps `99+` and `+N` out of the library's own dictionary.
   */
  footer: {
    licence: 'MIT licensed, © 2026 Jypyx',
    builtWith:
      'Built with <a href="https://github.com/Jypyx/vectis-ui" target="_blank" rel="noreferrer">Vectis UI</a> and <a href="https://nuxt.com" target="_blank" rel="noreferrer">Nuxt</a>',
  },
}
