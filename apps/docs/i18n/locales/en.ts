/**
 * The English catalogue — the base, and the SHAPE every other language is checked against.
 *
 * One module per page plus one for the chrome, composed here into the single object
 * `@nuxtjs/i18n` loads for the locale. Splitting it that way is what keeps a page's prose next
 * to nothing but itself: translating a page is opening two files, never scrolling through six
 * thousand words of someone else's.
 *
 * `DocsMessages` is exported for `fr.ts` to annotate itself with, and that annotation is the
 * whole of the parity guarantee — a missing key, a renamed one, or a string where the other
 * locale has an array fails `nuxt typecheck` rather than rendering the raw key on the page.
 *
 * TRAP — the default export must be `defineI18nLocale(…)` or a literal object, and never
 * `export default messages`. The module reads this file STATICALLY to build its locale loader,
 * and an identifier there is something it cannot follow: the build stops with "You need to
 * define 'export default' that will return the locale messages", which names the symptom and
 * not the cause. The macro form also lets the return type be annotated, which a bare literal
 * cannot be without an `as` that would hide the very drift this file exists to catch.
 */
import accessibility from './en/accessibility'
import accordion from './en/accordion'
import button from './en/button'
import chip from './en/chip'
import common from './en/common'
import cssClasses from './en/cssClasses'
import error from './en/error'
import fontFamily from './en/fontFamily'
import home from './en/home'
import i18n from './en/i18n'
import iconography from './en/iconography'
import input from './en/input'
import installation from './en/installation'
import jsHelpers from './en/jsHelpers'
import nav from './en/nav'
import sideNavigation from './en/sideNavigation'
import stub from './en/stub'
import switchPage from './en/switch'
import theming from './en/theming'

export interface DocsMessages {
  common: typeof common
  nav: typeof nav
  stub: typeof stub
  error: typeof error
  home: typeof home

  installation: typeof installation
  theming: typeof theming
  iconography: typeof iconography
  fontFamily: typeof fontFamily
  i18n: typeof i18n
  accessibility: typeof accessibility

  accordion: typeof accordion
  button: typeof button
  chip: typeof chip
  input: typeof input
  sideNavigation: typeof sideNavigation
  /* The import is `switchPage` because `switch` is a reserved word; the KEY is not, and the
     keypath a page writes is `switch.title` like every other. */
  switch: typeof switchPage

  jsHelpers: typeof jsHelpers
  cssClasses: typeof cssClasses
}

export default defineI18nLocale((): DocsMessages => ({
  common,
  nav,
  stub,
  error,
  home,

  installation,
  theming,
  iconography,
  fontFamily,
  i18n,
  accessibility,

  accordion,
  button,
  chip,
  input,
  sideNavigation,
  switch: switchPage,

  jsHelpers,
  cssClasses,
}))
