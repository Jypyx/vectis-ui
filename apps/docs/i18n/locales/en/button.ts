export default {
  title: 'Button',
  lead: '<code>VButton</code> triggers an action or navigates to a URL when <code>href</code> is set.',
  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: 'Use <code>variant</code> for the visual style and <code>tone</code> for the action’s intent.',
    },
    elevated: {
      title: 'Elevated',
      text: '<code>elevated</code> adds a shadow. The <code>ghost</code> and <code>outline</code> variants also gain a background.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> adjusts the height, padding, text and icons.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> reduces the height without changing the padding, text or icons.',
    },
    fullWidth: {
      title: 'Full width',
      text: '<code>fullWidth</code> makes the button fill its parent’s width.',
    },
    icons: {
      title: 'With icons',
      text: 'Set <code>iconStart</code> or <code>iconEnd</code> to add icons. Use <code>#start</code> or <code>#end</code> for custom content.',
    },
    customIcons: {
      title: 'Custom icons',
      text: 'Both icon props accept an <code>IconSource</code>: a built-in icon, a name resolved by your application, SVG path data, a component or an image.',
    },
    link: {
      title: 'Link',
      text: '<code>href</code> renders a link. Navigation is blocked while the button is disabled or loading.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> prevents activation. <code>loading</code> also shows a spinner and sets <code>aria-busy</code>.',
    },
  },
  api: {
    VButton: {
      props: {
        variant:
          'Visual style: <code>solid</code> for a filled background, <code>soft</code> for a tinted background, <code>outline</code> for a border, or <code>ghost</code> for a transparent background until hover. <code>VButtonGroup</code> overrides this value.',
        tone: 'Action intent: <code>accent</code> for a primary action, <code>neutral</code> for a secondary action, or <code>danger</code> for a destructive action. Inherits from <code>VButtonGroup</code> when omitted; otherwise defaults to <code>accent</code>.',
        elevated:
          'Adds a shadow and, for <code>ghost</code> and <code>outline</code>, a background. <code>VButtonGroup</code> overrides this value.',
        size: 'Button size. <code>VButtonGroup</code> overrides this value.',
        compact:
          'Reduces the height without changing the padding, text or icons. <code>VButtonGroup</code> overrides this value.',
        fullWidth: 'Fills the parent’s width.',
        href: 'Link destination. Renders an <code>&lt;a&gt;</code> instead of a <code>&lt;button&gt;</code>. When disabled or loading, the link loses its destination and cannot receive focus or navigate.',
        type: 'Native button type. Ignored when <code>href</code> is set.',
        disabled: 'Prevents activation and removes the button from the tab order.',
        loading:
          'Disables the button, sets <code>aria-busy</code> and replaces <code>iconStart</code> or <code>#start</code> content with a spinner.',
        iconStart: 'Icon before the label. Replaced by the <code>#start</code> slot.',
        iconEnd: 'Icon after the label. Replaced by the <code>#end</code> slot.',
        iconFilled:
          'Requests filled versions of <code>iconStart</code> and <code>iconEnd</code>, where supported. Does not affect slot content.',
      },
      slots: {
        default: 'Button label.',
        start:
          'Content before the label, replacing <code>iconStart</code>. Hidden while loading. Add <code>aria-hidden="true"</code> to decorative content.',
        end: 'Content after the label, replacing <code>iconEnd</code>.',
      },
    },
  },
}
