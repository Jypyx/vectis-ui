import type { VectisMessages } from './types'

/**
 * English — the base dictionary, always bundled. It is what any locale with no
 * registered dictionary falls back to, key by key.
 *
 * ⚠ These strings are asserted character for character by the unit tests, and
 * they are the accessible names the play functions query. Changing one means
 * changing its assertions.
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
    // The plural is a ternary — that is the whole plural engine of the DS.
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
    play: 'Start automatic slide show',
    pause: 'Stop automatic slide show',
    indicators: 'Choose slide to display',
  },
}
