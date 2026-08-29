/**
 * Every word the design system can say to a reader, gathered in one place. This is what a
 * translator works from, and what a consumer overrides to change a turn of phrase.
 *
 * It is arranged in exactly TWO levels: a section, then an entry. An entry is finished
 * text, or — when something has to be slotted into it — a small function that builds the
 * sentence.
 *
 * There is deliberately no template language and no rules engine for plurals. A message
 * that takes a value IS a function, written by hand, and its arguments are the contract: a
 * translation that forgets one does not compile. A plural is a choice between two forms
 * written inside that function.
 *
 * Two levels is not an aesthetic choice. It is what allows a handful of replacement words
 * to be laid over a dictionary without descending into it, and therefore what makes it
 * impossible to mistake one of those functions for something to be taken apart.
 *
 * Three kinds of text are deliberately absent. Anything the browser already knows how to
 * say in any language: the names of months and days, the order of the parts of a date,
 * whether hours run to twelve or twenty-four. Anything made only of digits and
 * punctuation everyone shares — "99+", "+3", a "3/8" counter, the colon in a time.
 * And the warnings the library prints for the developer, which are not translated at all.
 */
export interface VectisMessages {
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
    /** The two buttons under the clock face. */
    cancel: string
    confirm: string
  }
  pagination: {
    label: string
    previous: string
    next: string
    page: (page: number) => string
    /** The ellipsis standing in for the pages that are not shown. It is decorative, and never spoken. */
    hiddenPages: string
  }
  tabs: { label: string; previous: string; next: string }
  breadcrumb: { label: string; ellipsis: string }
  sideNavigation: {
    /**
     * What the navigation area is called. It is the component's only piece of text: the
     * labels are written by the consumer, and whether a branch is open or closed is
     * something the browser announces on its own.
     */
    label: string
  }
  combobox: {
    empty: string
    clear: string
    remove: (label: string) => string
  }
  dataTable: {
    empty: string
    loading: string
    searchLabel: string
    searchPlaceholder: string
    perPage: string
    /** The "rows per page" button, which shows both the wording and the number in force. */
    perPageValue: (label: string, value: number) => string
    selectAll: string
    /** The row number is the one a reader counts, starting at one — the caller adds it. */
    selectRow: (index: number) => string
    selection: (count: number) => string
    range: (range: { start: number; end: number; total: number }) => string
    /**
     * What the pagination under a table is called. It is deliberately not the same as the
     * name a standalone pagination takes: a page holding both would otherwise offer a
     * screen reader two navigation areas under one name, with no way to tell them apart.
     */
    pagination: string
  }
  toaster: { label: string }
  snackbar: {
    /**
     * What screen readers announce for the confirmation area itself, which is a landmark
     * of the page. It is deliberately not the notifications' name: a page holding both
     * would otherwise offer two areas under one word, with no way to tell them apart.
     */
    label: string
    /**
     * The single action a snackbar offers, when the caller does not name it. It means
     * taking back what was just done — not cancelling a form, which is `common.cancel`
     * and is a different word in several languages.
     */
    action: string
  }
  inputOTP: {
    label: string
    /** The box number is the one a reader counts, starting at one — the caller adds it. */
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
  /**
   * The keys of a keyboard shortcut, in WORDS. The symbols themselves — ⌘ ⌃ ⌥ ⇧ ↵ ⌫ ⌦ ⇥
   * ↑ ↓ ← → — are not here: they are engraved on the hardware and the same in every
   * language, so they live with the component.
   *
   * Every entry below is the SPOKEN form. Where a symbol exists it wins on screen, and
   * the word wins in what a screen reader says.
   */
  hotkeys: {
    /** How ⌘, the Command key on a Mac, is spoken. */
    command: string
    ctrl: string
    alt: string
    shift: string
    /** The same key as Command, outside a Mac: the Windows key. */
    windows: string
    /** And the same key again on Linux. */
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
  datePicker: {
    previousMonth: string
    nextMonth: string
    previousYear: string
    nextYear: string
    monthPicker: string
    yearPicker: string
  }
  dateInput: { clear: string; open: string; label: string }
  /** The clock itself. VTimeInput reads the half-day words from here too: there is one
      vocabulary for choosing a time, wherever the control that does it is rendered. */
  timePicker: {
    meridiem: string
    am: string
    pm: string
    selectHour: string
    selectMinute: string
    /** Announced when the clock face moves from choosing an hour to choosing a minute. */
    hourStep: string
    minuteStep: string
    /** What the clock face itself is called, which changes with the step. */
    hour: string
    minutes: string
    /** What the clock face announces as its value, rather than the bare number behind it. */
    hoursValue: (hour: number) => string
    minutesValue: (minute: number) => string
  }
  timeInput: {
    clear: string
    openList: string
    openPicker: string
    listLabel: string
    /** What the panel holding the clock is called. */
    pickerLabel: string
    /**
     * The grey template shown in an empty field, "hh:mm". It is translatable because those
     * letters are the initials of WORDS — unlike the colon between them, which is the same
     * everywhere and lives with the time helpers.
     */
    maskPlaceholder: string
  }
  fileInput: {
    /** What the button at the end of the field is called — the one that opens the file dialog. */
    attach: string
    clear: string
    /** What the cross on a file's chip is called. */
    remove: (name: string) => string
    /**
     * The WORD of the counter, and only that. The total size that follows is written out
     * by the browser, and the brackets around it belong to neither — punctuation everyone
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
     * it is translated — unlike the two rules on either side of it, which are drawn.
     */
    or: string
    /** What the cross beside a chosen file is called. */
    remove: (name: string) => string
    /** What the list of chosen files is called. */
    list: string
  }
  /**
   * The carousel. Two of these entries are what a screen reader SAYS instead of the bare
   * words "region" and "group", so they are text a reader hears and therefore text that
   * belongs here. It is worth being deliberate about them: a role description left in
   * English is the one accessibility string that goes wrong with no visible symptom
   * whatsoever.
   */
  carousel: {
    /** What the carousel is called when the consumer gives it no name of its own. */
    label: string
    /** What the carousel IS, said in place of the word "region". Lower case, as a role name is. */
    roleDescription: string
    /** And the same for one slide. */
    slideRoleDescription: string
    /** What the scrolling area itself is called — it can be reached with the Tab key. */
    slides: string
    /**
     * What a slide is called, and its dot with it. The number is the one a reader counts,
     * starting at one — the caller adds it. It carries the WORD "of", which is why it is
     * here where the table's bare "3/8" counter is not.
     */
    slide: (index: number, total: number) => string
    previous: string
    next: string
    /** What the row of dots is called. */
    indicators: string
  }

  /**
   * The calendar. Two groups of words that read very differently: the toolbar, which a
   * reader SEES, and everything from `eventRoleDescription` down, which only a screen
   * reader ever says — the same caution as the carousel's role description applies, since
   * an untranslated one goes wrong with no visible symptom at all.
   *
   * The navigation labels are per view rather than one word plus a unit: "Previous" needs
   * to say what it steps over, and building "Previous " + "week" out of two fragments is
   * the kind of sentence assembly that survives English and nothing else.
   */
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
    /**
     * The name a newly created event is given. The number is the one a reader counts,
     * starting at one — it carries no unit, so a language that writes it differently can.
     */
    newEvent: (index: number) => string
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
 * A dictionary given in PART: every section and every entry is optional. Anything left
 * out falls back to the dictionary already in place, and never to an empty string.
 *
 * The optionality stops at the entries and does not descend into them, so a message that
 * takes a value stays a whole function. Making it recursive would allow one of those
 * functions to be described as a partial object, which is to say as nothing at all.
 */
export type VectisMessagesInput = { [K in keyof VectisMessages]?: Partial<VectisMessages[K]> }
