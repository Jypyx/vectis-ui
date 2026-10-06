/** Annotate the return type to catch missing or renamed French messages. */
import accessibility from './fr/accessibility'
import accordion from './fr/accordion'
import alert from './fr/alert'
import avatar from './fr/avatar'
import avatarGroup from './fr/avatarGroup'
import badge from './fr/badge'
import breadcrumb from './fr/breadcrumb'
import button from './fr/button'
import buttonGroup from './fr/buttonGroup'
import calendar from './fr/calendar'
import card from './fr/card'
import carousel from './fr/carousel'
import checkbox from './fr/checkbox'
import chip from './fr/chip'
import combobox from './fr/combobox'
import common from './fr/common'
import contextMenu from './fr/contextMenu'
import cssClasses from './fr/cssClasses'
import dataTable from './fr/dataTable'
import dateInput from './fr/dateInput'
import datePicker from './fr/datePicker'
import designTokens from './fr/designTokens'
import dialog from './fr/dialog'
import drawer from './fr/drawer'
import emptyState from './fr/emptyState'
import error from './fr/error'
import field from './fr/field'
import fieldset from './fr/fieldset'
import fileInput from './fr/fileInput'
import filePicker from './fr/filePicker'
import fontFamily from './fr/fontFamily'
import home from './fr/home'
import hotkeys from './fr/hotkeys'
import hoverCard from './fr/hoverCard'
import i18n from './fr/i18n'
import icon from './fr/icon'
import iconButton from './fr/iconButton'
import iconography from './fr/iconography'
import input from './fr/input'
import inputGroup from './fr/inputGroup'
import inputOtp from './fr/inputOtp'
import installation from './fr/installation'
import jsHelpers from './fr/jsHelpers'
import link from './fr/link'
import menu from './fr/menu'
import meter from './fr/meter'
import nav from './fr/nav'
import numberInput from './fr/numberInput'
import pagination from './fr/pagination'
import popover from './fr/popover'
import progressCircular from './fr/progressCircular'
import progressLinear from './fr/progressLinear'
import radio from './fr/radio'
import rating from './fr/rating'
import separator from './fr/separator'
import sideNavigation from './fr/sideNavigation'
import skeletonLoader from './fr/skeletonLoader'
import slider from './fr/slider'
import snackbar from './fr/snackbar'
import spinner from './fr/spinner'
import stepper from './fr/stepper'
import switchPage from './fr/switch'
import tabs from './fr/tabs'
import textarea from './fr/textarea'
import theming from './fr/theming'
import timeInput from './fr/timeInput'
import timePicker from './fr/timePicker'
import toast from './fr/toast'
import toggle from './fr/toggle'
import tooltip from './fr/tooltip'
import treeView from './fr/treeView'
import typography from './fr/typography'

import type { DocsMessages } from './en'

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
  combobox,
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
  stepper,
  switch: switchPage,
  tabs,
  textarea,
  timeInput,
  timePicker,
  toast,
  toggle,
  tooltip,
  treeView,
  typography,

  jsHelpers,
  cssClasses,
}))
