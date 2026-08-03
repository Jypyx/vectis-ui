import type { DsMessages } from './types'

/**
 * Anglais. **Opt-in** : ce module n'est atteint que si vous l'importez, donc
 * élagué du bundle des projets qui ne s'en servent pas (`preserveModules` +
 * `sideEffects: ["**\/*.css"]`).
 *
 * L'activer et ajouter une langue que le DS ne fournit pas sont le MÊME geste —
 * il n'y a pas deux catégories de dictionnaires :
 *
 *     import { en, registerMessages, setLocale } from '@vectis/ui'
 *     registerMessages('en', en)
 *     setLocale('en-GB')
 */
export const en: DsMessages = {
  common: {
    loading: 'Loading…',
    clear: 'Clear',
    close: 'Close',
    dismiss: 'Remove',
    cancel: 'Cancel',
    confirm: 'OK',
  },
  pagination: {
    label: 'Pagination',
    previous: 'Previous page',
    next: 'Next page',
    page: (page) => `Page ${page}`,
    hiddenPages: 'Hidden pages',
  },
  tabs: {
    label: 'Tabs',
    previous: 'Previous tabs',
    next: 'Next tabs',
  },
  breadcrumb: {
    label: 'Breadcrumb',
    ellipsis: 'Show intermediate pages',
  },
  sideNavigation: { label: 'Navigation' },
  combobox: {
    empty: 'No results',
    clear: 'Clear selection',
    remove: (label) => `Remove ${label}`,
  },
  dataTable: {
    empty: 'No data',
    loading: 'Loading data…',
    searchLabel: 'Search the table',
    searchPlaceholder: 'Search…',
    perPage: 'Rows per page',
    // Pas d'espace avant le deux-points, contrairement au français.
    perPageValue: (label, value) => `${label}: ${value}`,
    selectAll: 'Select all',
    selectRow: (index) => `Select row ${index}`,
    // Le pluriel est un ternaire — c'est tout le moteur de pluriel du DS.
    selection: (count) => `${count} item${count === 1 ? '' : 's'} selected`,
    range: ({ start, end, total }) => `${start}–${end} of ${total}`,
  },
  toaster: { label: 'Notifications' },
  inputOTP: {
    label: 'Verification code',
    slot: (index, total) => `Character ${index} of ${total}`,
  },
  slider: {
    value: 'Value',
    start: 'Start',
    end: 'End',
    rangeStart: (label) => `${label} (start)`,
    rangeEnd: (label) => `${label} (end)`,
  },
  field: {
    limitExceeded: (max) => `Exceeds the limit of ${max} characters`,
  },
  // Aucun espace avant le signe, contrairement au français.
  progress: { percent: (percent) => `${percent}%` },
  calendar: {
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    monthPicker: 'Choose month',
    yearPicker: 'Choose year',
  },
  datePicker: {
    clear: 'Clear date',
    open: 'Open calendar',
    label: 'Choose a date',
  },
  timePicker: {
    clear: 'Clear time',
    openList: 'Open the list of times',
    openDial: 'Open time picker',
    listLabel: 'Available times',
    dialLabel: 'Choose a time',
    meridiem: 'AM or PM',
    am: 'AM',
    pm: 'PM',
    selectHour: 'Select hour',
    selectMinute: 'Select minutes',
    hourStep: 'Selecting the hour',
    minuteStep: 'Selecting the minutes',
    hour: 'Hour',
    minutes: 'Minutes',
    hoursValue: (hour) => `${hour} o'clock`,
    minutesValue: (minute) => `${minute} minutes`,
    maskPlaceholder: 'hh:mm',
  },
}
