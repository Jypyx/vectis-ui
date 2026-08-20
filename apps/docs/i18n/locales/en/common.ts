/**
 * The site's chrome: the header, the search panel, the outline, the code blocks and the tables.
 *
 * Everything here is a label rather than prose, so it is a plain string and never carries
 * markup — `DocsProse` is for paragraphs, `t()` for the words on a control.
 */
export default {
  header: {
    /** Names the `<nav>` holding Home and Docs, so a screen reader can tell the two navs apart. */
    mainNav: 'Main',
    home: 'Home',
    docs: 'Docs',
    getStarted: 'Get started',
    openNavigation: 'Open the navigation',
    colourScheme: 'Colour scheme',
    light: 'Light',
    dark: 'Dark',
    toLight: 'Switch to the light theme',
    toDark: 'Switch to the dark theme',
    language: 'Language',
  },
  search: {
    open: 'Search',
    label: 'Search the documentation',
    placeholder: 'Search pages and components',
    empty: 'No result',
    scope: 'Titles of pages and components',
    /** Appended to a stub's section in the result list — better said than discovered. */
    notWritten: 'not written yet',
  },
  outline: 'On this page',
  sidebar: 'Documentation',
  code: {
    copy: 'Copy the code',
    copied: 'Copied to the clipboard',
  },
  table: {
    prop: 'Prop',
    type: 'Type',
    default: 'Default',
    class: 'Class',
    effect: 'Effect',
    helper: 'Helper',
    signature: 'Signature',
    token: 'Token',
    value: 'Value',
  },
}
