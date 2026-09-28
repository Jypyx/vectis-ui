export default {
  title: 'Icon button',
  lead: '<code>VIconButton</code> displays an icon for an action or link. Its required <code>label</code> provides the accessible name.',
  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: 'Uses the same variants and tones as <code>VButton</code>, with <code>ghost</code> and <code>neutral</code> as defaults.',
    },
    elevated: {
      title: 'Elevated',
      text: '<code>elevated</code> adds a shadow. The <code>ghost</code> and <code>outline</code> variants also gain a background.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> adjusts the button and icon. <code>compact</code> reduces the width and height equally.',
    },
    shapes: {
      title: 'Shapes',
      text: '<code>shape</code> sets a square or circular shape. Joined buttons in <code>VButtonGroup</code> keep straight edges between segments.',
    },
    icons: {
      title: 'Icons',
      text: 'Use <code>icon</code> or the default slot to supply an icon. <code>iconFilled</code> requests a filled version, where supported.',
    },
    link: {
      title: 'Link',
      text: '<code>href</code> renders a link. Navigation is blocked while the button is disabled or loading.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> prevents activation. <code>loading</code> also replaces the icon with a spinner and sets <code>aria-busy</code>.',
    },
  },
  api: {
    VIconButton: {
      props: {
        label:
          'Accessible name, applied as <code>aria-label</code>. Name the action, such as “Close” or “Next month”.',
        variant:
          'Visual style. Uses the same values as <code>VButton</code>. Overridden when <code>VButtonGroup</code> sets a variant.',
        tone: 'Action intent. When omitted, uses the group’s tone or <code>neutral</code> if the group has none.',
        elevated:
          'Adds a shadow and, for <code>ghost</code> and <code>outline</code>, a background. Overridden when the group sets <code>elevated</code>.',
        size: 'Button size. Overridden when the group sets <code>size</code>.',
        compact:
          'Reduces the width and height equally. Overridden when the group sets <code>compact</code>.',
        shape: 'Square or circular shape. The width and height remain equal.',
        href: 'Link destination. When disabled or loading, the link loses its destination and cannot receive focus or navigate.',
        type: 'Native button type. Ignored when <code>href</code> is set.',
        disabled: 'Prevents activation and removes the button from the tab order.',
        loading:
          'Disables the button, sets <code>aria-busy</code> and replaces the icon or default slot content with a spinner.',
        icon: 'Icon to display. Accepts an <code>IconSource</code>. Takes precedence over the default slot.',
        iconFilled:
          'Requests a filled version of <code>icon</code>, where supported. Does not affect slot content.',
      },
      slots: {
        default:
          'Icon content, used when <code>icon</code> is absent. Add <code>aria-hidden="true"</code> to decorative content.',
      },
    },
  },
}
