/**
 * The tokens naming a ROLE rather than a value: the page background, ordinary text, the
 * accent an application is built around, the pause before a tooltip.
 *
 * These are the ONLY tokens a component mentions, and that is the whole point — a component
 * asks for the accent and never for a particular indigo, so an application can change what
 * the accent IS without any component knowing.
 *
 * Almost every entry ALIASES a palette step in braces rather than stating a value. What is
 * written here is the LIGHT theme; `themes/dark.ts` repoints the same roles.
 */
import { color, dimension, duration, fontFamily, fontWeight, type TokenGroup } from './types'

export const semantic = {
  color: {
    surface: color('{color.white}', 'The default page background'),
    'surface-muted': color('{color.gray.100}', 'A muted background (secondary areas)'),
    'surface-raised': color('{color.white}', 'Raised surfaces: cards'),
    'surface-overlay': color('{color.white}', 'Floating surfaces: dialogs, popovers, menus'),
    'surface-sunken': color('{color.gray.50}', 'Sunken surfaces: wells, code areas'),
    'surface-inverse': color('{color.gray.900}', 'Inverted-contrast surfaces: tooltips'),
    'surface-skeleton': color(
      '{color.gray.200}',
      'The background of the loading silhouettes (VSkeletonLoader); the highlight derives from it in CSS',
    ),

    'text-on-inverse': color('{color.white}', 'Text set on an inverted surface'),

    text: color('{color.gray.900}'),
    'text-muted': color('{color.gray.600}'),
    'text-subtle': color('{color.gray.500}', 'Placeholders, disabled text'),
    'text-on-accent': color('{color.white}', 'Text set on an accent/danger/success background'),
    'text-on-warning': color(
      '{color.gray.950}',
      'Text set on a solid warning background (amber too light for white)',
    ),

    border: color('{color.gray.200}'),
    'border-strong': color('{color.gray.300}', 'The borders of form controls'),

    accent: color('{color.indigo.600}'),
    'accent-hover': color('{color.indigo.700}'),
    'accent-active': color('{color.indigo.800}'),
    'accent-surface': color('{color.indigo.50}', 'A tinted accent background (badges, selections)'),
    'accent-border': color('{color.indigo.200}'),
    'accent-text': color('{color.indigo.700}', 'Accent text on a neutral or tinted background'),

    danger: color('{color.red.600}'),
    'danger-hover': color('{color.red.700}'),
    'danger-active': color('{color.red.800}'),
    'danger-surface': color('{color.red.50}'),
    'danger-border': color('{color.red.200}'),
    'danger-text': color('{color.red.700}'),

    /*
     * Green starts one step darker than the other colours. White text on a filled button
     * only becomes readable enough from green 700 onwards — green 600 falls well short of
     * the threshold. Darkening the colour rather than darkening the text is what keeps one
     * simple rule true: a filled control carries white text.
     *
     * The one exception is the warning colour, since no step of an amber is ever dark
     * enough for white, which is why it alone declares a text colour of its own.
     */
    success: color('{color.green.700}'),
    'success-hover': color('{color.green.800}'),
    'success-active': color('{color.green.900}'),
    'success-surface': color('{color.green.50}'),
    'success-border': color('{color.green.200}'),
    'success-text': color('{color.green.800}'),

    warning: color('{color.amber.600}'),
    'warning-hover': color('{color.amber.700}'),
    'warning-active': color('{color.amber.800}'),
    'warning-surface': color('{color.amber.50}'),
    'warning-border': color('{color.amber.200}'),
    'warning-text': color('{color.amber.900}'),

    backdrop: color('oklch(0% 0 0 / 0.45)', 'The veil behind modal dialogs'),

    /*
     * The four colours of a calendar event that names none of its own.
     *
     * These are the one place in the design system where a colour is DATA rather than a
     * role: which hue an event takes is derived from its id (see `VCalendar/color.ts`),
     * and it arrives here through `--vectis-calendar-event-hue`, a per-instance input the
     * component sets on each card. That is why they are written out rather than aliased to
     * a palette — there is no palette to point at, only a wheel.
     *
     * WHAT MAKES THEM READABLE, and what must not be changed casually. Only the HUE
     * varies; the lightness and the chroma below are fixed, and in OKLCH lightness is
     * perceptual — so the distance between the text at L 0.40 and the card at L 0.95 is
     * the same perceived distance at every hue, which is what turns "an arbitrary colour"
     * into a contrast ratio that can be relied on. Moving either number moves the contrast
     * of every event in the calendar at once. The same pair is restated in `themes/dark.ts`
     * with the roles swapped end for end.
     *
     * A custom property substitutes at the point it is USED, not where it is declared, so
     * the hue each card sets is what these resolve against — the trick `VSkeletonLoader`
     * uses for its highlight.
     */
    'event-surface': color(
      'oklch(0.95 0.045 var(--vectis-calendar-event-hue, 265))',
      'The face of a calendar event that carries no colour of its own',
    ),
    'event-border': color(
      'oklch(0.85 0.08 var(--vectis-calendar-event-hue, 265))',
      'The edge of that event, and the bar marking its leading side',
    ),
    'event-text': color(
      'oklch(0.4 0.11 var(--vectis-calendar-event-hue, 265))',
      'The title written on that face',
    ),
  },
  /**
   * The typography, described by role rather than by measurement: a heading, a subtitle,
   * a caption, a piece of code.
   *
   * Each role is a COMPLETE recipe — a size, a weight, the space between lines, and where
   * it matters the space between letters. Asking for a role therefore settles every one of
   * those at once, and two pieces of text in the same role cannot drift apart. It is what
   * the typography component renders, and what the components' own stylesheets ask for.
   */
  text: {
    family: fontFamily('{font.family.sans}', 'The font of all the design system text'),
    'family-heading': fontFamily(
      '{font.family.display}',
      'The font of the display and heading roles; identical to the running font until it is overridden',
    ),
    'family-code': fontFamily(
      '{font.family.mono}',
      'The font of code content (the code variant, VInputOTP)',
    ),
    display: {
      size: dimension('{font.size.5xl}'),
      weight: fontWeight('{font.weight.bold}'),
      leading: dimension('{font.leading.none}'),
      tracking: dimension('{font.tracking.tight}'),
    },
    'heading-1': {
      size: dimension('{font.size.4xl}'),
      weight: fontWeight('{font.weight.bold}'),
      leading: dimension('{font.leading.tight}'),
      tracking: dimension('{font.tracking.tight}'),
    },
    'heading-2': {
      size: dimension('{font.size.2xl}'),
      weight: fontWeight('{font.weight.semibold}'),
      leading: dimension('{font.leading.tight}'),
      tracking: dimension('{font.tracking.tight}'),
    },
    'heading-3': {
      size: dimension('{font.size.lg}'),
      weight: fontWeight('{font.weight.semibold}'),
      leading: dimension('{font.leading.snug}'),
    },
    'heading-4': {
      size: dimension('{font.size.md}'),
      weight: fontWeight('{font.weight.semibold}'),
      leading: dimension('{font.leading.snug}'),
    },
    subtitle: {
      size: dimension('{font.size.sm}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.normal}'),
    },
    /**
     * The introduction that opens a page or a section, one step above the running text.
     *
     * It shares `body-lg`'s generous leading rather than taking a tighter one: a lead is read
     * as prose, not as a heading, and the two therefore sit in the same column without the
     * rhythm changing under the reader between the first paragraph and the second.
     */
    'body-xl': {
      size: dimension('{font.size.lg}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.relaxed}'),
    },
    'body-lg': {
      size: dimension('{font.size.md}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.relaxed}'),
    },
    'body-md': {
      size: dimension('{font.size.sm}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.normal}'),
    },
    'body-sm': {
      size: dimension('{font.size.xs}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.normal}'),
    },
    label: {
      size: dimension('{font.size.sm}'),
      weight: fontWeight('{font.weight.medium}'),
      leading: dimension('{font.leading.snug}'),
    },
    caption: {
      size: dimension('{font.size.xs}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.snug}'),
    },
    overline: {
      size: dimension('{font.size.xs}'),
      weight: fontWeight('{font.weight.medium}'),
      leading: dimension('{font.leading.snug}'),
      tracking: dimension('{font.tracking.wide}'),
    },
    code: {
      size: dimension('{font.size.sm}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.normal}'),
    },
    /*
     * A role of a different sort: the label of a control — a button, a chip, a badge. It
     * deliberately carries no SIZE, because a control's text size comes from the size it
     * was given, and this recipe only settles the weight and the space between lines.
     */
    control: {
      weight: fontWeight('{font.weight.medium}'),
      leading: dimension('{font.leading.none}'),
    },
  },
  radius: {
    interactive: dimension('{radius.md}', 'Buttons, inputs, controls'),
    surface: dimension('{radius.lg}', 'Cards, alerts'),
    overlay: dimension('{radius.xl}', 'Dialogs, popovers, menus'),
    pill: dimension('{radius.full}'),
  },
  /**
   * How long a change takes, described by what it is: the immediate feedback of a control
   * under the pointer, the ordinary pace of the design system, a deliberately slower move.
   *
   * These three are what a `transition` reaches for. Motion does not vary from one theme to
   * the next, so unlike the colours they are stated once and never restated.
   */
  duration: {
    fast: duration('{duration.150}', 'Colour and border changes on hover, focus, press'),
    base: duration('{duration.200}', 'The default: a panel opening, a value moving'),
    slow: duration('{duration.300}', 'Movements large enough to be followed by the eye'),
  },
  focus: {
    'ring-color': color('{color.indigo.500}'),
    'ring-width': dimension('2px'),
    'ring-offset': dimension('2px'),
  },
  control: {
    'height-xs': dimension('1.5rem'),
    'height-sm': dimension('2rem'),
    'height-md': dimension('2.5rem'),
    'height-lg': dimension('3rem'),
    'height-xl': dimension('3.5rem'),
    'border-width': dimension('2px', 'The border of checkable controls (VCheckbox, VRadio)'),
    'size-check': dimension('1.25rem', 'The box of checkable controls (VCheckbox, VRadio)'),
    'size-check-mark': dimension('0.875rem', "VCheckbox's SVG tick"),
    'size-check-dot': dimension('0.5rem', "VRadio's inner dot"),
    'size-switch-w': dimension('2.5rem', "The width of VSwitch's track"),
    'size-switch-h': dimension('1.25rem', "The height of VSwitch's track"),
    'action-size-sm': dimension(
      '1.25rem',
      'The inner buttons of sm input fields (clear, a clickable icon)',
    ),
    'action-size-md': dimension(
      '1.5rem',
      'The inner buttons of md input fields (clear, a clickable icon)',
    ),
    'action-size-lg': dimension(
      '1.75rem',
      'The inner buttons of lg input fields (clear, a clickable icon)',
    ),
    'size-slider-track': dimension('0.375rem', "The thickness of VSlider's track"),
    'size-slider-thumb': dimension('1.25rem', "The diameter of VSlider's thumb"),
    'size-slider-length': dimension('10rem', 'The default length of a vertical VSlider'),
    'size-slider-field': dimension('5rem', "The width of VSlider's number fields"),
    'size-carousel-block': dimension(
      '24rem',
      "The default block size of VCarousel's viewport. Load-bearing in the vertical orientation: a percentage flex-basis has no definite reference on the block axis, and every slide would collapse onto its content without it",
    ),
    'size-carousel-indicator': dimension(
      '0.625rem',
      'The diameter of a VCarousel indicator dot (its hit area comes from --vectis-control-height-xs)',
    ),
    'size-carousel-indicator-active': dimension(
      '1.25rem',
      'The main-axis size of the ACTIVE VCarousel indicator, which stretches from a dot into a pill',
    ),
    'size-combobox-list-max-block': dimension(
      '18rem',
      "The maximum height of VCombobox's list panel (the scrolling area)",
    ),
    'size-menu-min': dimension('11rem', "The minimum width of VMenu's panel"),
    'size-menu-max': dimension('20rem', "The maximum width of VMenu's panel"),
    'size-progress-linear-thickness': dimension(
      '0.25rem',
      "The default thickness of VProgressLinear's bar (4px)",
    ),
    'size-progress-linear-length': dimension(
      '10rem',
      'The default length of a vertical VProgressLinear (overridable through `height`)',
    ),
    'size-progress-circular-diameter': dimension(
      '3rem',
      'The default diameter of VProgressCircular',
    ),
    'size-progress-circular-thickness': dimension(
      '0.25rem',
      'The default stroke thickness of VProgressCircular (4px)',
    ),
    'size-skeleton-surface': dimension(
      '6rem',
      'The default height of a surface-shaped VSkeletonLoader — a card, an image (96px)',
    ),
    'size-toast-width': dimension('22rem', 'The default width of a toast'),
    'size-snackbar-min': dimension('18rem', 'The minimum width of a snackbar (288px)'),
    'size-snackbar-max': dimension('36rem', 'The maximum width of a snackbar (576px)'),
    'size-badge-h': dimension('1.25rem', 'The height of VBadge (the pill)'),
    'size-badge-dot': dimension('0.625rem', 'The diameter of VBadge in dot mode'),
    'size-badge-ring': dimension('2px', 'The detaching ring of a bordered VBadge'),
    'size-avatar-ring': dimension('2px', 'The separating ring of stacked Avatars (VAvatarGroup)'),
    'size-date-picker-cell': dimension(
      '2.5rem',
      'The side (height/width) of a VDatePicker day cell',
    ),
    'size-date-picker-dot': dimension('0.25rem', 'The diameter of a VDatePicker event dot'),
    'size-date-picker-nav-min': dimension(
      '5.375rem',
      "The minimum width of VDatePicker's month/year picker buttons (≈86px)",
    ),
    'size-tab-indicator': dimension(
      '2px',
      'The thickness of the active tab indicator (VTabs, flat/outlined)',
    ),
    'size-table-search': dimension('16rem', "The width of VDataTable's search field"),
    'size-time-picker-dial': dimension(
      '16rem',
      "The diameter of VTimePicker's clock face (the M3 spec)",
    ),
    'size-time-picker-number': dimension(
      '3rem',
      "A numeral cell on VTimePicker's face, and the hand's dot on a marker",
    ),
    'size-time-picker-center': dimension('0.5rem', "The centre dot of VTimePicker's face"),
    'size-time-picker-hand': dimension('2px', "The thickness of the hand on VTimePicker's face"),
    'size-time-picker-hand-minor': dimension(
      '1rem',
      "The dot of VTimePicker's hand on a minute off the 5-minute markers",
    ),
    'size-time-input-list-max-block': dimension(
      '18rem',
      "The maximum height of VTimeInput's list panel (the scrolling area)",
    ),
    'size-file-picker-min-block': dimension(
      '10rem',
      "The minimum height of VFilePicker's drop zone — icon, two lines, separator and button",
    ),
    'size-file-picker-icon': dimension(
      '2.5rem',
      "The large icon at the top of VFilePicker's drop zone",
    ),
    'size-file-picker-thumb': dimension(
      '2.5rem',
      'The thumbnail square of a VFilePicker preview row (an image, or its type icon)',
    ),
    /*
     * A card is exactly as tall as its event is long — there is deliberately no floor — so
     * this value alone decides how much room the shortest event gets. At 4rem an hour, a
     * quarter of one is 16px, which holds a line of the title once its leading is tightened;
     * VCalendarEvent does that by measuring the card rather than by counting minutes. Lower
     * it much and the shortest events stop being readable at all.
     */
    'size-calendar-hour': dimension('4rem', "The height of one hour in VCalendar's time grid"),
    'size-calendar-gutter': dimension(
      '4.5rem',
      "The column of hour labels beside VCalendar's time grid, wide enough for a 12-hour clock's '12:00 AM' on one line",
    ),
    'size-calendar-tick': dimension(
      '0.375rem',
      "How far an hour's rule runs back into VCalendar's gutter, tying the label to its line",
    ),
    /*
     * TRAP — the twin of `EDGE_BAND` in `VCalendar/edgeStep.ts`, which is the same strip
     * measured in JavaScript. This value is what the reader SEES light up; that one is where
     * the calendar actually starts counting down to turn the page. Move one alone and the
     * calendar pages from somewhere other than where it said it would, with nothing to point
     * at it.
     */
    'size-calendar-edge': dimension(
      '3rem',
      'The strip at the side of VCalendar that pages the view when a dragged event rests on it',
    ),
    'size-calendar-day-min': dimension(
      '5rem',
      'The width a VCalendar day column may not go below, past which the grid scrolls',
    ),
    'size-calendar-handle': dimension(
      '0.5rem',
      "The strip along a VCalendar card's bottom edge that its end is dragged by",
    ),
    'size-calendar-allday-lane': dimension('1.5rem', "One lane of VCalendar's all-day band"),
    'size-calendar-allday-max': dimension(
      '7rem',
      'The height past which that band scrolls instead of growing',
    ),
    'size-calendar-now-dot': dimension('0.625rem', "The dot on VCalendar's current-time line"),
    /*
     * Sized so the default `monthEventLimit` of three chips AND the "+N more" line beneath
     * them fit without being clipped: 136px, less the padding, the border and the 32px day
     * button, leaves 85px against 76px of chips and a 14px more-line. Shrinking it silently
     * costs the third chip, since the cell clips rather than scrolls.
     */
    'size-calendar-month-cell': dimension(
      '8.5rem',
      "The minimum height of a day in VCalendar's month view",
    ),
    'size-calendar-year-cell': dimension(
      '1.5rem',
      "The side of a day square in the mini-months of VCalendar's year view",
    ),
  },
  icon: {
    'size-sm': dimension('1rem', '16px icons'),
    'size-md': dimension('1.25rem', '20px icons'),
    'size-lg': dimension('1.5rem', '24px icons'),
  },
} satisfies TokenGroup
