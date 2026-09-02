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
 * TRAP — the default export must be the `defineI18nLocale` macro or a literal object, and
 * never `export default messages`. The module reads this file STATICALLY to build its locale
 * loader, and an identifier there is something it cannot follow: the build stops with "You need
 * to define 'export default' that will return the locale messages", which names the symptom and
 * not the cause. The macro form also lets the return type be annotated, which a bare literal
 * cannot be without an `as` that would hide the very drift this file exists to catch.
 *
 * TRAP — that macro's name must not be followed by a parenthesis ANYWHERE in this file except
 * in the call itself, and a comment is not an exception. The module unwraps the macro with a
 * regular expression — the name, optional space, then everything up to a closing parenthesis —
 * run over the whole file once the types are stripped. It is greedy and it cannot tell a
 * comment from code, so it takes the FIRST name it finds to the LAST `)` in the file: a
 * mention written in prose swallows the real call's opening parenthesis and one of its closing
 * ones, and the build dies with "Expected `,` or `)`" pointing at the last line of the object,
 * nowhere near the sentence that caused it. Naming the macro without its parentheses, as the
 * paragraph above does, is the whole of the fix.
 */
import accessibility from './en/accessibility'
import accordion from './en/accordion'
import avatar from './en/avatar'
import avatarGroup from './en/avatarGroup'
import badge from './en/badge'
import breadcrumb from './en/breadcrumb'
import button from './en/button'
import buttonGroup from './en/buttonGroup'
import calendar from './en/calendar'
import carousel from './en/carousel'
import checkbox from './en/checkbox'
import chip from './en/chip'
import combobox from './en/combobox'
import common from './en/common'
import cssClasses from './en/cssClasses'
import dataTable from './en/dataTable'
import dateInput from './en/dateInput'
import datePicker from './en/datePicker'
import dialog from './en/dialog'
import error from './en/error'
import fileInput from './en/fileInput'
import filePicker from './en/filePicker'
import fontFamily from './en/fontFamily'
import home from './en/home'
import hotkeys from './en/hotkeys'
import i18n from './en/i18n'
import icon from './en/icon'
import iconButton from './en/iconButton'
import iconography from './en/iconography'
import input from './en/input'
import inputOtp from './en/inputOtp'
import installation from './en/installation'
import jsHelpers from './en/jsHelpers'
import menu from './en/menu'
import nav from './en/nav'
import pagination from './en/pagination'
import popover from './en/popover'
import progressCircular from './en/progressCircular'
import progressLinear from './en/progressLinear'
import radio from './en/radio'
import separator from './en/separator'
import sideNavigation from './en/sideNavigation'
import skeletonLoader from './en/skeletonLoader'
import slider from './en/slider'
import snackbar from './en/snackbar'
import spinner from './en/spinner'
import switchPage from './en/switch'
import tabs from './en/tabs'
import textarea from './en/textarea'
import theming from './en/theming'
import timeInput from './en/timeInput'
import timePicker from './en/timePicker'
import toast from './en/toast'
import toggle from './en/toggle'
import tooltip from './en/tooltip'
import typography from './en/typography'

export interface DocsMessages {
  common: typeof common
  nav: typeof nav
  error: typeof error
  home: typeof home

  installation: typeof installation
  theming: typeof theming
  iconography: typeof iconography
  fontFamily: typeof fontFamily
  i18n: typeof i18n
  accessibility: typeof accessibility

  accordion: typeof accordion
  avatar: typeof avatar
  avatarGroup: typeof avatarGroup
  badge: typeof badge
  breadcrumb: typeof breadcrumb
  button: typeof button
  buttonGroup: typeof buttonGroup
  calendar: typeof calendar
  carousel: typeof carousel
  checkbox: typeof checkbox
  chip: typeof chip
  combobox: typeof combobox
  dataTable: typeof dataTable
  dateInput: typeof dateInput
  datePicker: typeof datePicker
  dialog: typeof dialog
  fileInput: typeof fileInput
  filePicker: typeof filePicker
  hotkeys: typeof hotkeys
  icon: typeof icon
  iconButton: typeof iconButton
  input: typeof input
  inputOtp: typeof inputOtp
  menu: typeof menu
  pagination: typeof pagination
  popover: typeof popover
  progressCircular: typeof progressCircular
  progressLinear: typeof progressLinear
  radio: typeof radio
  separator: typeof separator
  sideNavigation: typeof sideNavigation
  skeletonLoader: typeof skeletonLoader
  slider: typeof slider
  snackbar: typeof snackbar
  spinner: typeof spinner
  /* The import is `switchPage` because `switch` is a reserved word; the KEY is not, and the
     keypath a page writes is `switch.title` like every other. */
  switch: typeof switchPage
  tabs: typeof tabs
  textarea: typeof textarea
  timeInput: typeof timeInput
  timePicker: typeof timePicker
  toast: typeof toast
  toggle: typeof toggle
  tooltip: typeof tooltip
  typography: typeof typography

  jsHelpers: typeof jsHelpers
  cssClasses: typeof cssClasses
}

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
