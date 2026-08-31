export default {
  title: 'Button',
  lead: 'The button that triggers an action, and the reference from which the tone and variant tables of every other coloured component are taken. It renders a native <code>&lt;button&gt;</code>, or an <code>&lt;a&gt;</code> as soon as it is given an <code>href</code>.',

  variantsHeading: 'Variants',
  variantsBody:
    'How much visual weight the action carries. VButton overrides not a single value of the shared tone table, which is why it serves as the reference.',
  variantsElevation:
    'Elevation is orthogonal to the variant, and a boolean rather than a fifth value: <code>elevated</code> applies the shadow scale to all four. An elevated ghost or outline button additionally gets a raised surface, because in dark mode a shadow lying on the page background has nothing casting it.',

  tonesHeading: 'Tones',
  tonesBody:
    'What the action MEANS. On a button a tone is an intention, which is why states such as success or warning are not offered here. Those belong to chips, badges and toasts.',
  tonesRule:
    'One rule governs filled controls: they carry white text. Everything else bends to keep that true. The neutral solid is a full text and surface inversion, and its hover mixes towards <code>surface</code> instead of away from it, since there is no darker neutral to reach for.',

  sizesHeading: 'Sizes',
  sizesBody:
    'The height comes from the control scale shared by every control: 24, 32, 40, 48 and 56px. <code>compact</code> takes 4px off, leaving the padding, the text and the icons as they are.',

  iconsHeading: 'Icons',
  iconsBody:
    '<code>iconStart</code> and <code>iconEnd</code> take an icon name or an explicit render, and the <code>#start</code> / <code>#end</code> slots take over when a name is not enough. VIconButton is the square sibling for an action with no label, and there the <code>label</code> prop is required rather than optional, since it is the only accessible name the control will ever have.',

  statesHeading: 'States',
  statesBody:
    'Disabled greys out through the colour tokens, never through opacity. Loading is the one exception, at <code>opacity: 0.5</code>. A disabled or loading LINK becomes inert: the address is dropped, so it can be neither focused nor followed, and <code>aria-disabled</code> tells assistive technology why.',
  statesCaption:
    'Click Deploy: the spinner replaces the START icon, and the button announces itself busy.',

  apiHeading: 'API',
  apiHref: '<code>string</code>: renders an <code>&lt;a&gt;</code>',
  apiIconFilled: '<code>boolean</code>: the FILL axis, where the icon has one',
  apiSlots:
    'Slots: <code>#default</code> for the label, <code>#start</code> and <code>#end</code> for anything an icon name cannot express. Native attributes are not redeclared, they fall through onto the button or the anchor.',

  iconButtonHeading: 'VIconButton',
  apiLabel: '<code>string</code>, <strong>required</strong>: the accessible name',
  apiIcon: '<code>IconSource</code>, or the default slot',
  iconButtonQuote:
    "The two defaults differ from VButton's on purpose: an icon-only control is chrome far more often than it is the primary action.",
}
