/**
 * The tokens that name a ROLE rather than a value: the page's background, the colour of
 * ordinary text, the accent an application is built around, the pause before a tooltip
 * appears.
 *
 * These are the ONLY tokens a component ever mentions, and that is the whole point. A
 * component asks for the accent colour and never for a particular indigo, so an
 * application can change what the accent IS without a single component knowing.
 *
 * Almost every entry points at a step of a palette rather than stating a value, by naming
 * it in braces. The values written out here are the LIGHT theme; the dark theme restates
 * the same roles, pointing them elsewhere.
 */
import { color, dimension, fontFamily, fontWeight, type TokenGroup } from './types'

export const semantic = {
  color: {
    surface: color('{color.white}', 'The default page background'),
    'surface-muted': color('{color.neutral.100}', 'A muted background (secondary areas)'),
    'surface-raised': color('{color.white}', 'Raised surfaces: cards'),
    'surface-overlay': color('{color.white}', 'Floating surfaces: dialogs, popovers, menus'),
    'surface-sunken': color('{color.neutral.50}', 'Sunken surfaces: wells, code areas'),
    'surface-inverse': color('{color.neutral.900}', 'Inverted-contrast surfaces: tooltips'),
    'surface-skeleton': color(
      '{color.neutral.200}',
      'The background of the loading silhouettes (VSkeletonLoader); the highlight derives from it in CSS',
    ),

    'text-on-inverse': color('{color.white}', 'Text set on an inverted surface'),

    text: color('{color.neutral.900}'),
    'text-muted': color('{color.neutral.600}'),
    'text-subtle': color('{color.neutral.500}', 'Placeholders, disabled text'),
    'text-on-accent': color('{color.white}', 'Text set on an accent/danger/success background'),
    'text-on-warning': color(
      '{color.neutral.950}',
      'Text set on a solid warning background (amber too light for white)',
    ),

    border: color('{color.neutral.200}'),
    'border-strong': color('{color.neutral.300}', 'The borders of form controls'),

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
    'action-size-xs': dimension(
      '1rem',
      "The most compact inner buttons (removing VCombobox's tags)",
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
    'size-combobox-input-min': dimension('4rem', "The minimum width of VCombobox's input area"),
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
    'size-badge-h': dimension('1.25rem', 'The height of VBadge (the pill)'),
    'size-badge-dot': dimension('0.625rem', 'The diameter of VBadge in dot mode'),
    'size-avatar-ring': dimension('2px', 'The separating ring of stacked Avatars (VAvatarGroup)'),
    'size-calendar-cell': dimension('2.5rem', 'The side (height/width) of a VCalendar day cell'),
    'size-calendar-dot': dimension('0.25rem', 'The diameter of a VCalendar event dot'),
    'size-calendar-nav-min': dimension(
      '5.375rem',
      "The minimum width of VCalendar's month/year picker buttons (≈86px)",
    ),
    'size-tab-indicator': dimension(
      '2px',
      'The thickness of the active tab indicator (VTabs, flat/outlined)',
    ),
    'size-table-search': dimension('16rem', "The width of VDataTable's search field"),
    'size-timepicker-dial': dimension('16rem', "The diameter of VTimePicker's dial (the M3 spec)"),
    'size-timepicker-number': dimension(
      '3rem',
      "A numeral cell on VTimePicker's dial, and the hand's dot on a marker",
    ),
    'size-timepicker-center': dimension('0.5rem', "The centre dot of VTimePicker's dial"),
    'size-timepicker-hand': dimension('2px', "The thickness of the hand on VTimePicker's dial"),
    'size-timepicker-hand-minor': dimension(
      '1rem',
      "The dot of VTimePicker's hand on a minute off the 5-minute markers",
    ),
    'size-timepicker-cell-w': dimension(
      '6rem',
      "The width of an hour/minute picker in VTimePicker's panel (the height comes from the control scale)",
    ),
    'size-timepicker-list-max-block': dimension(
      '18rem',
      "The maximum height of VTimePicker's list panel (the scrolling area)",
    ),
    'size-upload-min-block': dimension(
      '10rem',
      "The minimum height of VFileUpload's drop zone — icon, two lines, separator and button",
    ),
    'size-upload-icon': dimension('2.5rem', "The large icon at the top of VFileUpload's drop zone"),
    'size-upload-thumb': dimension(
      '2.5rem',
      'The thumbnail square of a VFileUpload preview row (an image, or its type icon)',
    ),
  },
  icon: {
    'size-sm': dimension('1rem', '16px icons'),
    'size-md': dimension('1.25rem', '20px icons'),
    'size-lg': dimension('1.5rem', '24px icons'),
  },
} satisfies TokenGroup
