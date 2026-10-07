/**
 * Two-level message namespaces permit nonrecursive partial merging. Parameterized messages are
 * typed functions so translations preserve their argument contracts.
 */
export interface Messages {
  /** Words several components share, so that they are translated once rather than five times. */
  common: {
    /** Said by the spinner, and by the fields and the search box while they are loading. */
    loading: string
    /** The cross that empties a field. */
    clear: string
    /** The cross that closes a dialog or a notification. */
    close: string
    /** The cross that removes a chip. */
    dismiss: string
    /**
     * The same cross when it has to say WHICH thing it removes: a value of a combobox, a
     * file of either file component. The name is the thing's own label.
     */
    remove: (name: string) => string
    /** The two buttons under the clock face. */
    cancel: string
    confirm: string
  }
  pagination: {
    label: string
    first: string
    previous: string
    next: string
    last: string
    page: (page: number) => string
  }
  tabs: { label: string; previous: string; next: string }
  breadcrumb: { label: string; ellipsis: string }
  sideNavigation: {
    /** What the navigation area is called. */
    label: string
  }
  link: {
    /**
     * Said after the text of a link that opens in a new tab. It starts with punctuation: a
     * leading space would be trimmed from the accessible name, gluing the words to the text.
     */
    newTab: string
  }
  combobox: {
    empty: string
    clear: string
  }
  select: {
    clear: string
  }
  commandPalette: {
    /** What the palette itself is called. */
    label: string
    /** What its search field is called. */
    searchLabel: string
    placeholder: string
    /** The search matched no command. */
    empty: string
    /** The key hints in the footer: the arrows, then Enter. Escape reuses `common.close`. */
    navigate: string
    choose: string
  }
  dataTable: {
    /** The empty table, when nothing is searched for. */
    empty: string
    /** The empty table, when a search found no row. */
    noResults: string
    loading: string
    searchLabel: string
    searchPlaceholder: string
    perPage: string
    /** The "rows per page" button, which shows both the wording and the number in force. */
    perPageValue: (label: string, value: number) => string
    selectAll: string
    /** The row number is the one a reader counts, starting at one: the caller adds it. */
    selectRow: (index: number) => string
    selection: (count: number) => string
    range: (range: { start: number; end: number; total: number }) => string
    /** What the pagination under a table is called. */
    pagination: string
  }
  toaster: { label: string }
  snackbar: {
    /**
     * What screen readers announce for the confirmation area itself, which is a landmark of the
     * page.
     */
    label: string
    /** The single action a snackbar offers, when the caller does not name it. */
    action: string
  }
  inputOTP: {
    label: string
    /** The box number is the one a reader counts, starting at one: the caller adds it. */
    slot: (index: number, total: number) => string
  }
  slider: {
    value: string
    start: string
    end: string
    rangeStart: (label: string) => string
    rangeEnd: (label: string) => string
  }
  /** The error both kinds of text field show when what was typed runs past the allowance. */
  field: { limitExceeded: (max: number) => string }
  progress: {
    /**
     * A percentage. English writes "50%" and French "50 %", with a non-breaking space
     * before the sign, which is exactly the kind of typographic habit this dictionary is
     * for.
     */
    percent: (percent: number) => string
    /**
     * What a progress indicator is called when the consumer gives it no name of its own.
     * An indicator takes no name from the text inside it, so without this it would have
     * none at all; a name the consumer writes wins.
     */
    label: string
  }
  meter: {
    /**
     * What a meter is called when the consumer gives it no label. A meter takes no name from the
     * text beside it, so without this it would have none at all.
     */
    label: string
  }
  /**
   * The keys of a keyboard shortcut, in words. Where a symbol exists it wins on screen, and the
   * word wins in what a screen reader says.
   */
  hotkeys: {
    /** How ⌘, the Command key on a Mac, is spoken. */
    command: string
    ctrl: string
    alt: string
    shift: string
    /** The same key as Command, outside a Mac: the Windows key. */
    windows: string
    /** The same key as Command on Linux: the Super key. */
    super: string
    enter: string
    escape: string
    space: string
    backspace: string
    delete: string
    tab: string
    up: string
    down: string
    left: string
    right: string
    /** What the shortcut is called, the combination arriving already spelled out: "Ctrl + K". */
    label: (keys: string) => string
  }
  colorPicker: {
    /** What the whole picker is called. */
    label: string
    /** The horizontal axis of the area. */
    saturation: string
    /** The vertical axis of the area. */
    brightness: string
    /**
     * Both axes of the area, read whichever of its two inputs has the focus, the percentages
     * already formatted for the locale.
     */
    areaValue: (saturation: string, brightness: string) => string
    hue: string
    /** The opacity track. */
    alpha: string
    /** The text field holding the colour as written. */
    value: string
    /** The menu choosing how that field writes the colour. */
    format: string
    /** The button that picks a colour from anywhere on the screen. */
    eyeDropper: string
    /** The group of preset colours. */
    swatches: string
  }
  colorInput: {
    clear: string
    /** The swatch at the start of the field, which opens the picker. */
    openPicker: string
    /** What the panel holding the picker is called. */
    pickerLabel: string
  }
  datePicker: {
    /** What the whole picker is called, header and grid together. */
    label: string
    previousMonth: string
    nextMonth: string
    previousYear: string
    nextYear: string
    monthPicker: string
    yearPicker: string
  }
  dateInput: {
    clear: string
    /** What the button at the end of the field is called: the one that opens the calendar. */
    openPicker: string
    /** What the panel holding the calendar is called. */
    pickerLabel: string
  }
  numberInput: {
    /** The button that adds one step to the value. */
    increment: string
    /** The button that takes one step off the value. */
    decrement: string
  }
  splitButton: {
    /** The button that opens the menu of the other actions. */
    menu: string
  }
  rating: {
    /** What the group of icons is called when it has no label. */
    label: string
    /** The choice that clears the rating. */
    empty: string
    /** One value out of the highest, both already formatted for the locale. */
    value: (value: string, max: string) => string
  }
  resizable: {
    /** What a panel is called when it has no label, which names the handle that resizes it. */
    panel: (position: number) => string
  }
  stepper: {
    /** What the list of steps is called. */
    label: string
    /** Said after the title of a step that is done. */
    completed: string
    /** Said after the title of a step that has an error. */
    error: string
  }
  treeView: {
    /** What the tree is called. */
    label: string
    /** Said after the label of a node whose children could not be loaded. */
    loadFailed: string
    /** Announced when the children of a node could not be loaded. */
    loadError: (label: string) => string
  }
  /** The clock itself. VTimeInput reads the half-day words from here too: there is one
      vocabulary for choosing a time, wherever the control that does it is rendered. */
  timePicker: {
    /** What the whole clock is called, the numerals and the face together. */
    label: string
    meridiem: string
    am: string
    pm: string
    selectHour: string
    selectMinutes: string
    /** Announced when the clock face moves between choosing the hour and the minutes. */
    choosingHour: string
    choosingMinutes: string
    /** What the clock face itself is called, which changes with the step. */
    hour: string
    minutes: string
    /** What the clock face announces as its value, rather than the bare number behind it. */
    hourValue: (hour: number) => string
    minutesValue: (minute: number) => string
  }
  timeInput: {
    clear: string
    /** What the button at the end of the field is called: the one that opens the clock. */
    openPicker: string
    /** What the panel holding the clock is called. */
    pickerLabel: string
    /**
     * What the AM/PM button inside the field is called, the half of the day it currently shows
     * included.
     */
    meridiemValue: (value: string) => string
    /** The grey template shown in an empty field, "hh:mm". */
    maskPlaceholder: string
    /** What the field says of a time the restrictions do not allow. */
    unavailable: string
  }
  fileInput: {
    /** What the button at the end of the field is called: the one that opens the file dialog. */
    openPicker: string
    clear: string
    /**
     * The WORD of the counter, and only that. The total size that follows is written out
     * by the browser, and the brackets around it belong to neither: punctuation everyone
     * shares.
     */
    files: (count: number) => string
    /** What an empty field says. */
    placeholder: string
  }
  filePicker: {
    /** The button that opens the file dialog. */
    browse: string
    /**
     * The word standing between "drop your files here" and that button. It is a WORD, so
     * it is translated, unlike the two rules on either side of it, which are drawn.
     */
    or: string
    /** What the list of chosen files is called. */
    list: string
  }
  /**
   * The carousel. Two of these entries are what a screen reader SAYS instead of the bare words
   * "region" and "group", so they are text a reader hears and therefore text that belongs here.
   */
  carousel: {
    /** What the carousel is called when the consumer gives it no name of its own. */
    label: string
    /** What the carousel IS, said in place of the word "region". Lower case, as a role name is. */
    roleDescription: string
    /** What one slide IS, said in place of its role name. Lower case, as a role name is. */
    slideRoleDescription: string
    /** What the scrolling area itself is called: it can be reached with the Tab key. */
    slides: string
    /** What a slide is called, and its dot with it. */
    slide: (index: number, total: number) => string
    previous: string
    next: string
    /** What the row of dots is called. */
    indicators: string
  }

  /** The calendar. */
  calendar: {
    /** What the calendar is called when the consumer gives it no name of its own. */
    label: string
    /** What the calendar IS, said in place of the word "region". Lower case, as a role name is. */
    roleDescription: string
    /** The button that comes back to the current day. */
    today: string
    /** What the view menu's button is called. */
    view: string
    viewDay: string
    view4Days: string
    viewWeek: string
    viewMonth: string
    viewYear: string
    /** The custom-length view, which names its own length. */
    viewCustom: (days: number) => string
    previousDay: string
    nextDay: string
    previousWeek: string
    nextWeek: string
    previousMonth: string
    nextMonth: string
    previousYear: string
    nextYear: string
    /** The two steps of the day-shaped views, whose length is the consumer's choice. */
    previousPeriod: string
    nextPeriod: string
    /** The label of the band above the grid. */
    allDay: string
    /**
     * What the month view says when a day holds more events than it can show. The number
     * is how many are left over, never the total.
     */
    moreEvents: (count: number) => string
    /** How a day in the month and year views offers to be opened on its own. */
    openDay: (day: string) => string
    /** What the card of a slot being drawn out is called, before it is anything else. */
    untitled: string
    /** What one event IS, said in place of the word "button". */
    eventRoleDescription: string
    /** How a card says it can be moved. It is read once, from a single shared node. */
    eventHint: string
    /** Said when a card is taken hold of, and when it is let go again. */
    grabbed: string
    dropped: string
    /** Said when a move is abandoned and the event goes back where it was. */
    reverted: string
    /** How an event's new place is announced, the range already written out. */
    movedTo: (title: string, when: string) => string
  }
}

/**
 * A dictionary given in PART: every section and every entry is optional. Anything left out
 * falls back to the dictionary already in place, and never to an empty string.
 */
export type MessagesInput = { [K in keyof Messages]?: Partial<Messages[K]> }
