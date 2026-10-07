export default {
  title: 'Split button',
  lead: '<code>VSplitButton</code> joins a main action to a menu of related ones. The main action is a <code>VButton</code>; the button beside it opens a <code>VMenu</code>.',
  examples: {
    variants: {
      title: 'Variants and tones',
      text: '<code>variant</code>, <code>tone</code>, <code>size</code>, <code>compact</code> and <code>elevated</code> take the values of <code>VButton</code> and apply to both halves. A line always separates them.',
    },
    sizes: {
      title: 'Sizes',
      text: 'The menu button stays square at every size.',
    },
    states: {
      title: 'Loading and disabled',
      text: '<code>loading</code> puts the spinner in the main action and disables the menu button too, since an action is already under way. <code>disabled</code> turns off both halves.',
    },
    linkAndIcons: {
      title: 'Link and icons',
      text: '<code>href</code> turns the main action into a link. <code>iconStart</code> and <code>iconEnd</code> belong to the main action, and <code>menuIcon</code> replaces the chevron. <code>menuLabel</code> replaces the name screen readers hear for the menu button, "More options" by default.',
    },
    fullWidth: {
      title: 'Full width and menu placement',
      text: 'The menu is anchored to the whole control and lines up with its end by default. With <code>fullWidth</code>, the main action takes the room and the menu button stays square; <code>matchTrigger</code> keeps the menu at least as wide as the control.',
    },
  },
  api: {
    VSplitButton: {
      props: {
        label: 'Text of the main action.',
        variant: 'Visual weight of both halves.',
        tone: 'Colour of both halves.',
        size: 'Height of both halves, from the shared control scale.',
        compact: 'Takes 4px off the height.',
        elevated: 'Raises the control with a shadow.',
        fullWidth:
          'Fills the parent. The main action takes the room; the menu button stays square.',
        href: 'Turns the main action into a link, inert while disabled or loading.',
        type: 'Native type of the main button.',
        disabled: 'Disables both halves.',
        loading: 'Shows a spinner in the main action and disables the menu button.',
        iconStart: 'Icon before the label of the main action.',
        iconEnd: 'Icon after the label of the main action.',
        iconFilled: 'Renders the icons of the main action filled.',
        menuLabel: 'Accessible name of the menu button. "More options" by default.',
        menuIcon: 'Icon of the menu button.',
        placement: 'Menu position relative to the whole control; adjusts when space is short.',
        menuSize: 'Row height of the menu.',
        menuWidth: 'Menu width. Numbers use pixels; strings use CSS lengths or keywords.',
        matchTrigger: 'Keeps the menu at least as wide as the whole control.',
        vModelOpen: 'Open state of the menu.',
      },
      events: {
        click: 'The main action was activated.',
      },
      slots: {
        default:
          '<code>VMenuItem</code>, <code>VMenuGroup</code> and <code>VMenuSeparator</code> children.',
      },
    },
  },
}
