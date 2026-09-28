export default {
  title: 'Button group',
  lead: '<code>VButtonGroup</code> groups related actions and shares layout and appearance settings across <code>VButton</code> and <code>VIconButton</code>.',
  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: 'The group’s <code>variant</code> overrides each button’s variant. Its <code>tone</code> applies only to buttons without their own tone.',
    },
    toneOverride: {
      title: 'Individual tones',
      text: 'Set a button’s <code>tone</code> to override the group’s tone, for example to mark a destructive action.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation="vertical"</code> stacks the buttons in a column.',
    },
    detached: {
      title: 'Detached',
      text: '<code>detached</code> separates the buttons while preserving the group’s appearance settings.',
    },
    seamless: {
      title: 'No dividers',
      text: '<code>seamless</code> removes inner dividers and preserves the outer border. Has no effect with <code>detached</code>.',
    },
    elevated: {
      title: 'Elevated',
      text: '<code>elevated</code> adds one shadow to a joined group, or a shadow to each button when detached.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the size of every button, overriding individual sizes.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> reduces each button’s height.',
    },
    fullWidth: {
      title: 'Full width',
      text: '<code>fullWidth</code> fills the parent’s width. Horizontal groups give each button equal width.',
    },
    icons: {
      title: 'With icons',
      text: 'Use <code>iconStart</code> and <code>iconEnd</code> on buttons, or <code>VIconButton</code> with a required <code>label</code>.',
    },
    link: {
      title: 'Links',
      text: 'Set <code>href</code> on a button to render a link. Disabled or loading links cannot navigate.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> disables every button. Set <code>loading</code> on individual buttons.',
    },
  },
  api: {
    VButtonGroup: {
      props: {
        orientation: 'Horizontal row or vertical column.',
        detached:
          'Separates the buttons with a gap. Each keeps its own corners and borders; group appearance settings still apply.',
        seamless:
          'Removes inner dividers while preserving the outer border. Has no effect with <code>detached</code>.',
        fullWidth:
          'Fills the parent’s width. Horizontal buttons share equal widths but may overflow if their content is too wide.',
        variant:
          'Visual style for all buttons. Overrides individual variants; when omitted, each button keeps its own.',
        tone: 'Fallback tone for buttons without their own <code>tone</code>.',
        size: 'Size for all buttons. Overrides individual sizes; when omitted, each button keeps its own.',
        compact:
          'Reduces button height. Overrides individual values, including when set to <code>false</code>; when omitted, each button keeps its own.',
        elevated:
          'Adds a group shadow, or individual shadows with <code>detached</code>. Overrides individual values, including when set to <code>false</code>; when omitted, each button keeps its own.',
        disabled:
          'Disables all buttons. Setting it to <code>false</code> does not enable individually disabled buttons.',
        label:
          'Accessible group name, such as “Text formatting”. Consumer <code>aria-label</code> or <code>aria-labelledby</code> takes precedence.',
      },
      slots: {
        default: 'The <code>VButton</code> and <code>VIconButton</code> components to group.',
      },
    },
  },
}
