/**
 * Semantic roles alias primitives; components depend on these roles so applications can theme
 * without rewriting component CSS.
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
      "The background of VSkeletonLoader's silhouettes, from which its highlight is derived",
    ),

    'text-on-inverse': color('{color.white}', 'Text set on an inverted surface'),

    text: color('{color.gray.900}', 'The running text of the interface'),
    'text-muted': color(
      '{color.gray.600}',
      'Secondary text: hints, captions, descriptions, start icons',
    ),
    'text-subtle': color('{color.gray.500}', 'Placeholders, disabled text'),
    'text-on-accent': color('{color.white}', 'Text set on an accent/danger/success background'),
    'text-on-warning': color(
      '{color.gray.950}',
      'Text set on a solid warning background (amber too light for white)',
    ),

    border: color('{color.gray.200}', 'Dividers, and the frames of cards, tables and panels'),
    'border-strong': color('{color.gray.300}', 'The borders of form controls'),

    accent: color(
      '{color.indigo.600}',
      'The brand color: solid buttons, checked controls, the selected item',
    ),
    'accent-hover': color('{color.indigo.700}', 'The accent color under the pointer'),
    'accent-active': color('{color.indigo.800}', 'The accent color while pressed'),
    'accent-surface': color('{color.indigo.50}', 'A tinted accent background (badges, selections)'),
    'accent-border': color(
      '{color.indigo.200}',
      'The border of a tinted accent element, matching the accent surface',
    ),
    'accent-text': color('{color.indigo.700}', 'Accent text on a neutral or tinted background'),

    danger: color('{color.red.600}', 'Destructive actions and errors: solid buttons, error states'),
    'danger-hover': color('{color.red.700}', 'The danger color under the pointer'),
    'danger-active': color('{color.red.800}', 'The danger color while pressed'),
    'danger-surface': color(
      '{color.red.50}',
      'A tinted danger background (soft buttons and chips, a destructive menu item)',
    ),
    'danger-border': color(
      '{color.red.200}',
      'The border of a tinted danger element, matching the danger surface',
    ),
    'danger-text': color(
      '{color.red.700}',
      'Danger text on a neutral or tinted background: error messages, a destructive menu item',
    ),

    /* Green filled surfaces need step 700 to contrast with white text. */
    success: color('{color.green.700}', 'A positive outcome: solid chips, badges, notifications'),
    'success-hover': color('{color.green.800}', 'The success color under the pointer'),
    'success-active': color('{color.green.900}', 'The success color while pressed'),
    'success-surface': color(
      '{color.green.50}',
      'A tinted success background (soft chips, badges, notifications)',
    ),
    'success-border': color(
      '{color.green.200}',
      'The border of a tinted success element, matching the success surface',
    ),
    'success-text': color('{color.green.800}', 'Success text on a neutral or tinted background'),

    warning: color(
      '{color.amber.600}',
      'A situation that calls for attention: solid chips, badges, notifications',
    ),
    'warning-hover': color('{color.amber.700}', 'The warning color under the pointer'),
    'warning-active': color('{color.amber.800}', 'The warning color while pressed'),
    'warning-surface': color(
      '{color.amber.50}',
      'A tinted warning background (soft chips, badges, notifications)',
    ),
    'warning-border': color(
      '{color.amber.200}',
      'The border of a tinted warning element, matching the warning surface',
    ),
    'warning-text': color('{color.amber.900}', 'Warning text on a neutral or tinted background'),

    backdrop: color('oklch(0% 0 0 / 0.45)', 'The veil behind modal dialogs'),

    /*
     * Keep event colours literal: root-declared var aliases resolve their hue before cards can
     * supply per-event hues.
     */
    'event-surface': color(
      'oklch(0.95 0.045 265)',
      'The face of a calendar event that carries no color of its own',
    ),
    'event-border': color(
      'oklch(0.85 0.08 265)',
      'The edge of that calendar event, and the bar marking its leading side',
    ),
    'event-text': color('oklch(0.4 0.11 265)', 'The title of that calendar event'),
  },
  text: {
    family: fontFamily('{font.family.sans}', 'The running font of every component'),
    'family-heading': fontFamily(
      '{font.family.display}',
      'The font of the display and heading roles, the running font until it is overridden',
    ),
    'family-code': fontFamily(
      '{font.family.mono}',
      'The font of code content (the code role, VInputOTP)',
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
    /* Choice text uses label dimensions at regular weight to remain distinct from field labels. */
    choice: {
      size: dimension('{font.size.sm}'),
      weight: fontWeight('{font.weight.regular}'),
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
    /* Control size comes from --control-font-size; this recipe supplies weight and leading only. */
    control: {
      weight: fontWeight('{font.weight.medium}'),
      leading: dimension('{font.leading.none}'),
    },
  },
  radius: {
    interactive: dimension('{radius.md}', 'Buttons, inputs, controls'),
    surface: dimension('{radius.lg}', 'Cards, alerts'),
    overlay: dimension('{radius.xl}', 'Dialogs, popovers, menus'),
    pill: dimension('{radius.full}', 'Full rounding: switches, badges, pill-shaped chips'),
    chip: dimension(
      '{radius.interactive}',
      'Chips with shape="chip", which follow the interactive radius by default',
    ),
  },
  /** Semantic transition durations are theme-independent. */
  duration: {
    fast: duration('{duration.150}', 'Color and border changes on hover, focus and press'),
    base: duration('{duration.200}', 'The default: a panel opening, a value moving'),
    slow: duration('{duration.300}', 'Movements large enough to be followed by the eye'),
  },
  focus: {
    'ring-color': color(
      '{color.indigo.500}',
      'The keyboard focus ring, which has to stand out against the page',
    ),
    'ring-width': dimension('2px', 'The thickness of the focus ring'),
    'ring-offset': dimension('2px', 'The gap between a control and its focus ring'),
  },
  control: {
    'height-xs': dimension(
      '1.5rem',
      'The height of every control at size="xs" (24px), 4px less when compact',
    ),
    'height-sm': dimension(
      '2rem',
      'The height of every control at size="sm" (32px), 4px less when compact',
    ),
    'height-md': dimension(
      '2.5rem',
      'The height of every control at size="md" (40px), 4px less when compact',
    ),
    'height-lg': dimension(
      '3rem',
      'The height of every control at size="lg" (48px), 4px less when compact',
    ),
    'height-xl': dimension(
      '3.5rem',
      'The height of every control at size="xl" (56px), 4px less when compact',
    ),
    'border-width': dimension('2px', 'The border of checkable controls (VCheckbox, VRadio)'),
    'size-check': dimension('1.25rem', 'The box of checkable controls (VCheckbox, VRadio)'),
    'size-check-mark': dimension('0.875rem', "The tick inside VCheckbox's box"),
    'size-check-dot': dimension('0.5rem', "The dot inside VRadio's circle"),
    'size-switch-w': dimension('2.5rem', "The width of VSwitch's track"),
    'size-switch-h': dimension('1.25rem', "The height of VSwitch's track"),
    'size-switch-pad': dimension(
      '0.125rem',
      "The gap between VSwitch's thumb and the edge of its track",
    ),
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
      "The default block size of VCarousel's viewport, which a vertical carousel needs to lay its slides out",
    ),
    'size-carousel-indicator': dimension(
      '0.625rem',
      'The diameter of a VCarousel indicator dot (its hit area comes from --vectis-control-height-xs)',
    ),
    'size-carousel-indicator-active': dimension(
      '1.25rem',
      'The length of the active VCarousel indicator, which stretches from a dot into a pill',
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
      'The default length of a vertical VProgressLinear, which a height set on the bar replaces',
    ),
    'size-meter-thickness-sm': dimension('0.25rem', 'The thickness of a small VMeter (4px)'),
    'size-meter-thickness-md': dimension('0.5rem', 'The thickness of a medium VMeter (8px)'),
    'size-meter-thickness-lg': dimension('0.75rem', 'The thickness of a large VMeter (12px)'),
    'size-meter-segment-gap': dimension('0.125rem', 'The gap between two VMeter segments (2px)'),
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
      'The default height of a surface-shaped VSkeletonLoader: a card, an image (96px)',
    ),
    'size-toast-width': dimension('22rem', 'The default width of a toast'),
    'size-tooltip-max': dimension('18rem', 'The widest a tooltip grows before it wraps (288px)'),
    'size-hover-card-max': dimension('20rem', 'The widest a VHoverCard grows (320px)'),
    'size-dialog-width': dimension(
      '25rem',
      'The default width of VDialog and VDialogAlert (400px), when no `width` is given',
    ),
    'size-stepper-indicator': dimension(
      '2rem',
      'The diameter of the circle holding a VStepper step number (32px)',
    ),
    'size-stepper-connector-min': dimension(
      '1.5rem',
      'The shortest a horizontal VStepper connector gets between two steps (24px)',
    ),
    'size-rating-sm': dimension('1.25rem', 'The icon of a small VRating (20px)'),
    'size-rating-md': dimension('1.5rem', 'The icon of a medium VRating (24px)'),
    'size-rating-lg': dimension('2rem', 'The icon of a large VRating (32px)'),
    'size-drawer-sm': dimension(
      '20rem',
      'The width of a small VDrawer on a side, or the height of one at the top or bottom (320px)',
    ),
    'size-drawer-md': dimension(
      '25rem',
      'The width of a medium VDrawer on a side, or the height of one at the top or bottom (400px)',
    ),
    'size-drawer-lg': dimension(
      '35rem',
      'The width of a large VDrawer on a side, or the height of one at the top or bottom (560px)',
    ),
    'size-snackbar-min': dimension('18rem', 'The minimum width of a snackbar (288px)'),
    'size-snackbar-max': dimension('36rem', 'The maximum width of a snackbar (576px)'),
    'size-card-media': dimension(
      '12rem',
      'The width a horizontal VCard gives its media before the content wraps under it (192px)',
    ),
    'size-card-body-min': dimension(
      '16rem',
      'The narrowest content of a horizontal VCard: below it, the media moves above the content',
    ),
    'size-empty-state-media-sm': dimension(
      '2.5rem',
      'The diameter of the icon badge of a small VEmptyState (40px)',
    ),
    'size-empty-state-media-md': dimension(
      '3rem',
      'The diameter of the icon badge of a medium VEmptyState (48px)',
    ),
    'size-empty-state-media-lg': dimension(
      '4rem',
      'The diameter of the icon badge of a large VEmptyState (64px)',
    ),
    'size-empty-state-text-max': dimension(
      '28rem',
      'The widest the title and description of a VEmptyState run before they wrap (448px)',
    ),
    'size-field-label': dimension(
      '10rem',
      'The width of a VField label placed beside its control, before the control wraps under it (160px)',
    ),
    'size-field-control-min': dimension(
      '16rem',
      'The narrowest control of a VField with a side label: below it, the label moves above the control',
    ),
    'size-badge-h': dimension('1.25rem', 'The height of a VBadge pill'),
    'size-badge-dot': dimension('0.625rem', 'The diameter of VBadge in dot mode'),
    'size-badge-ring': dimension('2px', 'The detaching ring of a bordered VBadge'),
    'size-avatar-ring': dimension('2px', 'The ring separating stacked avatars (VAvatarGroup)'),
    'size-date-picker-cell': dimension('2.5rem', 'The side of a VDatePicker day cell'),
    'size-date-picker-day': dimension(
      '{control.height.md}',
      'The diameter of the disc a VDatePicker day is drawn on; the cell grows to hold it',
    ),
    'size-date-picker-dot': dimension('0.25rem', 'The diameter of a VDatePicker event dot'),
    'size-date-picker-nav-min': dimension(
      '5.375rem',
      "The minimum width of VDatePicker's month/year picker buttons (about 86px)",
    ),
    'size-tab-indicator': dimension(
      '2px',
      'The thickness of the active tab indicator (VTabs, flat/outlined)',
    ),
    'size-table-search': dimension('16rem', "The width of VDataTable's search field"),
    'size-time-picker-dial': dimension('16rem', "The diameter of VTimePicker's clock face"),
    'size-time-picker-number': dimension(
      '3rem',
      "A numeral cell on VTimePicker's face, and the hand's dot on a marker",
    ),
    'size-time-picker-center': dimension('0.5rem', "The center dot of VTimePicker's face"),
    'size-time-picker-hand': dimension('2px', "The thickness of the hand on VTimePicker's face"),
    'size-time-picker-hand-minor': dimension(
      '1rem',
      "The dot of VTimePicker's hand on a minute off the 5-minute markers",
    ),
    'size-file-picker-min-block': dimension(
      '10rem',
      "The minimum height of VFilePicker's drop zone: icon, two lines, separator and button",
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
     * This hour height must leave room for a readable title in short events; cards have no
     * minimum height.
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
     * Keep this visual edge-strip width aligned with EDGE_BAND in VCalendar/edgeStep.ts so
     * paging starts where the highlight appears.
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
      "The height past which VCalendar's all-day band scrolls instead of growing",
    ),
    'size-calendar-now-dot': dimension('0.625rem', "The dot on VCalendar's current-time line"),
    'size-calendar-event-edge': dimension(
      '3px',
      'The width of the coloured leading edge of a VCalendar event',
    ),
    'size-calendar-gap': dimension(
      '0.125rem',
      'The gap VCalendar keeps between two events, side by side in a day or stacked in a month',
    ),
    'size-calendar-grip': dimension(
      '1rem',
      "The length of the grip drawn on a VCalendar card's resize strip",
    ),
    'size-calendar-grip-thickness': dimension(
      '2px',
      "The thickness of that grip, which is also its distance from the card's bottom edge",
    ),
    'size-calendar-year-month': dimension(
      '13rem',
      "The narrowest a mini-month of VCalendar's year view gets before the year reflows",
    ),
    /*
     * Keep enough cell height for monthEventLimit chips and the overflow line; clipped cells do
     * not scroll to reveal hidden rows.
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
    'size-sm': dimension('1rem', 'The icon size of xs controls (16px)'),
    'size-md': dimension('1.25rem', 'The icon size of sm and md controls (20px)'),
    'size-lg': dimension('1.5rem', 'The icon size of lg and xl controls (24px)'),
  },
} satisfies TokenGroup
