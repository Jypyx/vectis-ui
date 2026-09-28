export default {
  title: 'Chip',
  lead: '<code>VChip</code> displays a tag, status or filter. It can be a button, link, selectable toggle or dismissible item.',
  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: 'Combine <code>variant</code> and <code>tone</code> to set the appearance.',
    },
    shapes: {
      title: 'Shapes',
      text: '<code>shape</code> selects rounded corners or a pill. Customize the chip radius with <code>--vectis-radius-chip</code>.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the chip size; <code>compact</code> reduces its height.',
    },
    customColors: {
      title: 'Custom colours',
      text: '<code>color</code> overrides the tone with a CSS colour. Check text contrast for solid chips.',
    },
    icons: {
      title: 'With icons',
      text: 'Use icon props or the <code>start</code> and <code>end</code> slots. Give icon-only interactive chips an accessible name.',
    },
    clickable: {
      title: 'Clickable and links',
      text: '<code>clickable</code> renders a button; <code>href</code> renders a link. Without either, the chip is plain content.',
    },
    selection: {
      title: 'Selection',
      text: 'Enable <code>selectable</code> and bind <code>v-model:selected</code>. <code>check</code> displays a tick instead of the start icon when selected.',
    },
    dismissible: {
      title: 'Dismissible',
      text: '<code>dismissible</code> adds a button emitting <code>dismiss</code>. Remove the chip yourself. Give each button a <code>dismissLabel</code> naming the item it removes.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> prevents interaction. Disabled links lose their destination and leave the tab order.',
    },
  },
  api: {
    VChip: {
      props: {
        variant: 'Visual style.',
        tone: 'Colour tone.',
        color: 'Custom CSS colour overriding the tone. Check text contrast for solid chips.',
        shape: 'Rounded corners or pill shape.',
        size: 'Component size.',
        compact: 'Reduces the control height without changing text or icons.',
        clickable: 'Renders a button without selection state.',
        href: 'Link destination.',
        selectable:
          'Renders a toggle button. Takes precedence over <code>href</code> and <code>clickable</code>.',
        check: 'Shows a tick when selected, replacing start content.',
        checkIcon: 'Selection tick icon. Not affected by <code>iconFilled</code>.',
        iconStart: 'Icon before the label. Replaced by the <code>start</code> slot.',
        iconEnd: 'Icon after the label. Replaced by the <code>end</code> slot.',
        iconFilled:
          'Uses filled start and end icons when supported. Does not affect slots, tick or dismissal icon.',
        dismissible: 'Adds a dismissal button. Does not remove the chip automatically.',
        dismissIcon: 'Dismissal button icon.',
        dismissLabel:
          'Accessible name of the dismissal button. Defaults to the library dictionary.',
        disabled: 'Disables interaction.',
        vModelSelected: 'Selection state when <code>selectable</code> is enabled.',
      },
      events: {
        dismiss: 'The dismissal button was activated. Remove the chip in response.',
      },
      slots: {
        default: 'Label content. May be omitted for an icon-only chip.',
        start: 'Content replacing <code>iconStart</code>.',
        end: 'Content replacing <code>iconEnd</code>.',
      },
    },
  },
}
