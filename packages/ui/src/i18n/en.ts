import type { VectisMessages } from './types'

/**
 * English, the dictionary the library always carries. Any language with no dictionary of
 * its own falls back to this one, entry by entry, so nothing is ever left unsaid.
 *
 * Take care changing anything here: these words are checked letter for letter by the
 * tests, and they are the names the browser tests reach for when they look a control up.
 * Changing one means changing what expects it.
 */
export const en: VectisMessages = {
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
    perPageValue: (label, value) => `${label}: ${value}`,
    selectAll: 'Select all',
    selectRow: (index) => `Select row ${index}`,
    // The plural is chosen right here, in the message itself. That one line is the whole
    // of the design system's handling of plurals, and it is meant to be.
    selection: (count) => `${count} item${count === 1 ? '' : 's'} selected`,
    range: ({ start, end, total }) => `${start}–${end} of ${total}`,
    pagination: 'Table pagination',
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
  progress: { percent: (percent) => `${percent}%`, label: 'Progress' },
  hotkeys: {
    command: 'Command',
    ctrl: 'Ctrl',
    alt: 'Alt',
    shift: 'Shift',
    windows: 'Win',
    super: 'Super',
    enter: 'Enter',
    escape: 'Esc',
    space: 'Space',
    backspace: 'Backspace',
    delete: 'Del',
    tab: 'Tab',
    up: 'Up arrow',
    down: 'Down arrow',
    left: 'Left arrow',
    right: 'Right arrow',
    label: (keys) => `Keyboard shortcut: ${keys}`,
  },
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
  filePicker: {
    attach: 'Choose files',
    clear: 'Clear files',
    remove: (name) => `Remove ${name}`,
    files: (count) => `${count} file${count === 1 ? '' : 's'}`,
    placeholder: 'No file selected',
  },
  fileUpload: {
    browse: 'Browse files',
    or: 'or',
    remove: (name) => `Remove ${name}`,
    list: 'Selected files',
  },
  carousel: {
    label: 'Carousel',
    roleDescription: 'carousel',
    slideRoleDescription: 'slide',
    slides: 'Slides',
    slide: (index, total) => `${index} of ${total}`,
    previous: 'Previous slide',
    next: 'Next slide',
    indicators: 'Choose slide to display',
  },
}
