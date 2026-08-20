/**
 * Le catalogue français.
 *
 * Le type de retour est ANNOTÉ plutôt qu'inféré : c'est cette annotation qui fait échouer
 * `nuxt typecheck` sur une clé manquante ou renommée, au lieu de laisser la clé brute
 * s'afficher dans la page. `DocsMessages` est un `import type`, donc effacé à la compilation —
 * le catalogue anglais n'entre pas dans le lot français.
 *
 * Le piège de `en.ts` vaut ici aussi : l'export par défaut doit rester `defineI18nLocale(…)`.
 */
import accessibility from './fr/accessibility'
import accordion from './fr/accordion'
import button from './fr/button'
import chip from './fr/chip'
import common from './fr/common'
import cssClasses from './fr/cssClasses'
import error from './fr/error'
import fontFamily from './fr/fontFamily'
import home from './fr/home'
import i18n from './fr/i18n'
import iconography from './fr/iconography'
import input from './fr/input'
import installation from './fr/installation'
import jsHelpers from './fr/jsHelpers'
import nav from './fr/nav'
import sideNavigation from './fr/sideNavigation'
import stub from './fr/stub'
import switchPage from './fr/switch'
import theming from './fr/theming'

import type { DocsMessages } from './en'

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
