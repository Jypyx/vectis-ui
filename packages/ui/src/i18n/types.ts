/**
 * The DS dictionary. Depth EXACTLY 2: `namespace.key`, where the value is a
 * leaf — a string, or a typed function for a parameterized message.
 *
 * No plural engine, no ICU, no interpolator: a parameterized entry IS a
 * TypeScript function. The typing of its arguments is the contract (a
 * translation that forgets a parameter does not compile), and a plural rule is
 * written with a ternary — see `dataTable.selection`.
 *
 * Depth 2 is not decorative: it is what makes merging partial overrides
 * non-recursive (`state.ts`), hence incapable by construction of descending
 * into a FUNCTION value as if it were an object.
 *
 * What is deliberately NOT here:
 * - whatever `Intl` already derives from the locale tag (month and day names,
 *   date field order, date separator, hour cycle);
 * - whatever is made only of digits and universal punctuation (VBadge's `99+`,
 *   VAvatarGroup's `+N`, the `N/M` counter, the `:` of a time);
 * - DEVELOPER messages (`[Component] …`), which are not translated.
 */
export interface VectisMessages {
  /** Words shared by several components — a single place to translate. */
  common: {
    /** VSpinner, `loadingLabel` of VInput/VTextarea, `loadingText` of VCombobox. */
    loading: string
    /** `clearLabel` of VInput and VTextarea. */
    clear: string
    /** `closeLabel` of VDialog and VToaster. */
    close: string
    /** `dismissLabel` of VChip. */
    dismiss: string
    /** VTimePicker dial footer. */
    cancel: string
    /** VTimePicker dial footer. */
    confirm: string
  }
  pagination: {
    label: string
    previous: string
    next: string
    page: (page: number) => string
    /** Hidden-pages ellipsis — a decorative element (`aria-hidden`). */
    hiddenPages: string
  }
  tabs: { label: string; previous: string; next: string }
  breadcrumb: { label: string; ellipsis: string }
  sideNavigation: {
    /**
     * Accessible name of the `<nav>`. The component's only string: the labels
     * come from the slots, and the expanded/collapsed state is carried by
     * `<details>`.
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
    /** "Rows per page" menu button: label + current value. */
    perPageValue: (label: string, value: number) => string
    selectAll: string
    /** `index` is the HUMAN index (1-based): the caller passes `index + 1`. */
    selectRow: (index: number) => string
    selection: (count: number) => string
    range: (range: { start: number; end: number; total: number }) => string
  }
  toaster: { label: string }
  inputOTP: {
    label: string
    /** `index` is the HUMAN index (1-based): the caller passes `slotIndex + 1`. */
    slot: (index: number, total: number) => string
  }
  slider: {
    value: string
    start: string
    end: string
    rangeStart: (label: string) => string
    rangeEnd: (label: string) => string
  }
  /** Shared by VInput and VTextarea through `composables/useTextLimit`. */
  field: { limitExceeded: (max: number) => string }
  progress: {
    /** `50%` in English, `50 %` in French (NON-BREAKING space before the sign). */
    percent: (percent: number) => string
  }
  /**
   * VHotkeys. WORDS only: the GLYPHS (⌘ ⌃ ⌥ ⇧ ↵ ⌫ ⌦ ⇥ ↑ ↓ ← →) stay in
   * `VHotkeys/platform.ts` — engraved on the hardware, identical in every
   * language, exactly like VBadge's `99+`. Each key here is the SPOKEN form:
   * where a glyph exists it wins on screen, never in the accessible name.
   */
  hotkeys: {
    /** Spoken form of ⌘ — the macOS Command key. */
    command: string
    ctrl: string
    alt: string
    shift: string
    /** The `meta` key outside macOS: the Windows key. */
    windows: string
    /** The `meta` key on Linux. */
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
    /** Accessible name; `keys` is the combination already spelled in WORDS ("Ctrl + K"). */
    label: (keys: string) => string
  }
  calendar: {
    previousMonth: string
    nextMonth: string
    previousYear: string
    nextYear: string
    monthPicker: string
    yearPicker: string
  }
  datePicker: { clear: string; open: string; label: string }
  timePicker: {
    clear: string
    openList: string
    openDial: string
    listLabel: string
    dialLabel: string
    meridiem: string
    am: string
    pm: string
    selectHour: string
    selectMinute: string
    /** Live region: the step currently being selected. */
    hourStep: string
    minuteStep: string
    /** Accessible name of the dial, per step. */
    hour: string
    minutes: string
    /** `aria-valuetext` of the dial. */
    hoursValue: (hour: number) => string
    minutesValue: (minute: number) => string
    /**
     * Template of the masked field (`hh:mm`). Translatable because `h` and `m`
     * are the initials of WORDS — unlike the universal `:`, which stays in
     * `utils/time.ts`.
     */
    maskPlaceholder: string
  }
}

/**
 * PARTIAL override: namespaces and keys are optional. Whatever you do not write
 * falls back to the base dictionary — never to an empty string (the same
 * contract as the partial mappings of `setIconResolver`).
 *
 * `Partial<VectisMessages[K]>` does NOT descend into the values: a function
 * stays a whole function. A recursive `DeepPartial<T>` would turn
 * `(n: number) => string` into `{}`.
 */
export type VectisMessagesInput = { [K in keyof VectisMessages]?: Partial<VectisMessages[K]> }
