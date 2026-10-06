/** Default-export the locale macro so Nuxt can discover messages statically. */
import accessibility from './en/accessibility'
import accordion from './en/accordion'
import alert from './en/alert'
import avatar from './en/avatar'
import avatarGroup from './en/avatarGroup'
import badge from './en/badge'
import breadcrumb from './en/breadcrumb'
import button from './en/button'
import buttonGroup from './en/buttonGroup'
import calendar from './en/calendar'
import card from './en/card'
import carousel from './en/carousel'
import checkbox from './en/checkbox'
import chip from './en/chip'
import colorInput from './en/colorInput'
import colorPicker from './en/colorPicker'
import combobox from './en/combobox'
import commandPalette from './en/commandPalette'
import common from './en/common'
import contextMenu from './en/contextMenu'
import cssClasses from './en/cssClasses'
import dataTable from './en/dataTable'
import dateInput from './en/dateInput'
import datePicker from './en/datePicker'
import designTokens from './en/designTokens'
import dialog from './en/dialog'
import drawer from './en/drawer'
import emptyState from './en/emptyState'
import error from './en/error'
import field from './en/field'
import fieldset from './en/fieldset'
import fileInput from './en/fileInput'
import filePicker from './en/filePicker'
import fontFamily from './en/fontFamily'
import home from './en/home'
import hotkeys from './en/hotkeys'
import hoverCard from './en/hoverCard'
import i18n from './en/i18n'
import icon from './en/icon'
import iconButton from './en/iconButton'
import iconography from './en/iconography'
import input from './en/input'
import inputGroup from './en/inputGroup'
import inputOtp from './en/inputOtp'
import installation from './en/installation'
import jsHelpers from './en/jsHelpers'
import link from './en/link'
import menu from './en/menu'
import meter from './en/meter'
import nav from './en/nav'
import numberInput from './en/numberInput'
import pagination from './en/pagination'
import popover from './en/popover'
import progressCircular from './en/progressCircular'
import progressLinear from './en/progressLinear'
import radio from './en/radio'
import rating from './en/rating'
import separator from './en/separator'
import sideNavigation from './en/sideNavigation'
import skeletonLoader from './en/skeletonLoader'
import slider from './en/slider'
import snackbar from './en/snackbar'
import spinner from './en/spinner'
import splitButton from './en/splitButton'
import stepper from './en/stepper'
import switchPage from './en/switch'
import tabs from './en/tabs'
import textarea from './en/textarea'
import theming from './en/theming'
import timeInput from './en/timeInput'
import timePicker from './en/timePicker'
import timeline from './en/timeline'
import toast from './en/toast'
import toggle from './en/toggle'
import tooltip from './en/tooltip'
import treeView from './en/treeView'
import typography from './en/typography'

export interface DocsMessages {
  common: typeof common
  nav: typeof nav
  error: typeof error
  home: typeof home

  installation: typeof installation
  theming: typeof theming
  designTokens: typeof designTokens
  iconography: typeof iconography
  fontFamily: typeof fontFamily
  i18n: typeof i18n
  accessibility: typeof accessibility

  accordion: typeof accordion
  alert: typeof alert
  avatar: typeof avatar
  avatarGroup: typeof avatarGroup
  badge: typeof badge
  breadcrumb: typeof breadcrumb
  button: typeof button
  buttonGroup: typeof buttonGroup
  calendar: typeof calendar
  card: typeof card
  carousel: typeof carousel
  checkbox: typeof checkbox
  chip: typeof chip
  colorInput: typeof colorInput
  colorPicker: typeof colorPicker
  combobox: typeof combobox
  commandPalette: typeof commandPalette
  contextMenu: typeof contextMenu
  dataTable: typeof dataTable
  dateInput: typeof dateInput
  datePicker: typeof datePicker
  dialog: typeof dialog
  drawer: typeof drawer
  emptyState: typeof emptyState
  field: typeof field
  fieldset: typeof fieldset
  fileInput: typeof fileInput
  filePicker: typeof filePicker
  hotkeys: typeof hotkeys
  hoverCard: typeof hoverCard
  icon: typeof icon
  iconButton: typeof iconButton
  input: typeof input
  inputGroup: typeof inputGroup
  inputOtp: typeof inputOtp
  link: typeof link
  menu: typeof menu
  meter: typeof meter
  numberInput: typeof numberInput
  pagination: typeof pagination
  popover: typeof popover
  progressCircular: typeof progressCircular
  progressLinear: typeof progressLinear
  radio: typeof radio
  rating: typeof rating
  separator: typeof separator
  sideNavigation: typeof sideNavigation
  skeletonLoader: typeof skeletonLoader
  slider: typeof slider
  snackbar: typeof snackbar
  spinner: typeof spinner
  splitButton: typeof splitButton
  stepper: typeof stepper
  /*
   * The import is `switchPage` because `switch` is a reserved word; the key is not, and the
   * keypath a page writes is `switch.title` like every other.
   */
  switch: typeof switchPage
  tabs: typeof tabs
  textarea: typeof textarea
  timeInput: typeof timeInput
  timePicker: typeof timePicker
  timeline: typeof timeline
  toast: typeof toast
  toggle: typeof toggle
  tooltip: typeof tooltip
  treeView: typeof treeView
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
  designTokens,
  iconography,
  fontFamily,
  i18n,
  accessibility,

  accordion,
  alert,
  avatar,
  avatarGroup,
  badge,
  breadcrumb,
  button,
  buttonGroup,
  calendar,
  card,
  carousel,
  checkbox,
  chip,
  colorInput,
  colorPicker,
  combobox,
  commandPalette,
  contextMenu,
  dataTable,
  dateInput,
  datePicker,
  dialog,
  drawer,
  emptyState,
  field,
  fieldset,
  fileInput,
  filePicker,
  hotkeys,
  hoverCard,
  icon,
  iconButton,
  input,
  inputGroup,
  inputOtp,
  link,
  menu,
  meter,
  numberInput,
  pagination,
  popover,
  progressCircular,
  progressLinear,
  radio,
  rating,
  separator,
  sideNavigation,
  skeletonLoader,
  slider,
  snackbar,
  spinner,
  splitButton,
  stepper,
  switch: switchPage,
  tabs,
  textarea,
  timeInput,
  timePicker,
  timeline,
  toast,
  toggle,
  tooltip,
  treeView,
  typography,

  jsHelpers,
  cssClasses,
}))
