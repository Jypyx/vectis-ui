/**
 * Le catalogue français.
 *
 * Le type de retour est ANNOTÉ plutôt qu'inféré : c'est cette annotation qui fait échouer
 * `nuxt typecheck` sur une clé manquante ou renommée, au lieu de laisser la clé brute
 * s'afficher dans la page. `DocsMessages` est un `import type`, donc effacé à la compilation —
 * le catalogue anglais n'entre pas dans le lot français.
 *
 * Les deux pièges de `en.ts` valent ici aussi : l'export par défaut doit rester le macro
 * `defineI18nLocale`, et son nom ne doit jamais être suivi d'une parenthèse ailleurs que dans
 * l'appel lui-même — un commentaire compris, sous peine d'une erreur de syntaxe à la
 * compilation qui désigne la dernière ligne de l'objet et non la phrase fautive.
 */
import accessibility from './fr/accessibility'
import accordion from './fr/accordion'
import avatar from './fr/avatar'
import avatarGroup from './fr/avatarGroup'
import badge from './fr/badge'
import breadcrumb from './fr/breadcrumb'
import button from './fr/button'
import buttonGroup from './fr/buttonGroup'
import calendar from './fr/calendar'
import carousel from './fr/carousel'
import checkbox from './fr/checkbox'
import chip from './fr/chip'
import combobox from './fr/combobox'
import common from './fr/common'
import cssClasses from './fr/cssClasses'
import dataTable from './fr/dataTable'
import dateInput from './fr/dateInput'
import datePicker from './fr/datePicker'
import dialog from './fr/dialog'
import error from './fr/error'
import fileInput from './fr/fileInput'
import filePicker from './fr/filePicker'
import fontFamily from './fr/fontFamily'
import home from './fr/home'
import hotkeys from './fr/hotkeys'
import i18n from './fr/i18n'
import icon from './fr/icon'
import iconButton from './fr/iconButton'
import iconography from './fr/iconography'
import input from './fr/input'
import inputOtp from './fr/inputOtp'
import installation from './fr/installation'
import jsHelpers from './fr/jsHelpers'
import menu from './fr/menu'
import nav from './fr/nav'
import pagination from './fr/pagination'
import popover from './fr/popover'
import progressCircular from './fr/progressCircular'
import progressLinear from './fr/progressLinear'
import radio from './fr/radio'
import separator from './fr/separator'
import sideNavigation from './fr/sideNavigation'
import skeletonLoader from './fr/skeletonLoader'
import slider from './fr/slider'
import snackbar from './fr/snackbar'
import spinner from './fr/spinner'
import switchPage from './fr/switch'
import tabs from './fr/tabs'
import textarea from './fr/textarea'
import theming from './fr/theming'
import timeInput from './fr/timeInput'
import timePicker from './fr/timePicker'
import toast from './fr/toast'
import toggle from './fr/toggle'
import tooltip from './fr/tooltip'
import typography from './fr/typography'

import type { DocsMessages } from './en'

export default defineI18nLocale((): DocsMessages => ({
  common,
  nav,
  error,
  home,

  installation,
  theming,
  iconography,
  fontFamily,
  i18n,
  accessibility,

  accordion,
  avatar,
  avatarGroup,
  badge,
  breadcrumb,
  button,
  buttonGroup,
  calendar,
  carousel,
  checkbox,
  chip,
  combobox,
  dataTable,
  dateInput,
  datePicker,
  dialog,
  fileInput,
  filePicker,
  hotkeys,
  icon,
  iconButton,
  input,
  inputOtp,
  menu,
  pagination,
  popover,
  progressCircular,
  progressLinear,
  radio,
  separator,
  sideNavigation,
  skeletonLoader,
  slider,
  snackbar,
  spinner,
  switch: switchPage,
  tabs,
  textarea,
  timeInput,
  timePicker,
  toast,
  toggle,
  tooltip,
  typography,

  jsHelpers,
  cssClasses,
}))
