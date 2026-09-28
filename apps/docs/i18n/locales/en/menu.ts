export default {
  title: 'Menu',
  lead: '<code>VMenu</code> displays commands in a floating panel with keyboard navigation and nested submenus.',
  examples: {
    menuItems: {
      title: 'Menu items',
      text: 'Use <code>VMenuItem</code> for commands or links and <code>VMenuSeparator</code> between sets. Disabled items are skipped by arrow navigation.',
    },
    sublabels: {
      title: 'Sublabels',
      text: '<code>sublabel</code> adds a second line for help text or a shortcut.',
    },
    selection: {
      title: 'Selection',
      text: '<code>selected</code> marks the current choice. Choosing a command still closes the menu.',
    },
    groups: {
      title: 'Groups',
      text: '<code>VMenuGroup</code> labels a set of commands. Its heading is non-interactive.',
    },
    submenus: {
      title: 'Submenus',
      text: 'The <code>submenu</code> slot adds nested commands. Hover opens the submenu after a delay; left and right arrows enter and leave it.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Set <code>size</code> and <code>compact</code> on the menu; submenus inherit them.',
    },
    width: {
      title: 'Width',
      text: '<code>width</code> fixes the main panel width. <code>matchTrigger</code> sets its minimum width to the trigger width. Submenus keep their default width.',
    },
    placement: {
      title: 'Placement',
      text: '<code>placement</code> sets the preferred panel position.',
    },
    open: {
      title: 'Knowing whether it is open',
      text: '<code>v-model:open</code> tracks opening and dismissal by outside click, Escape or command selection.',
    },
  },
  api: {
    VMenu: {
      props: {
        placement: 'Preferred panel position; adjusts when space is insufficient.',
        size: 'Row size inherited by submenus.',
        compact: 'Reduces row height, including submenus.',
        width: 'Main panel width. Numbers use pixels; strings use CSS lengths or keywords.',
        matchTrigger: 'Minimum main panel width matches the trigger. Does not affect submenus.',
        vModelOpen: 'Open state synchronized with outside clicks, Escape and command selection.',
      },
      slots: {
        trigger: 'Opening button. Bind the supplied <code>triggerProps</code>.',
        default:
          '<code>VMenuItem</code>, <code>VMenuGroup</code> and <code>VMenuSeparator</code> children.',
      },
    },
    VMenuItem: {
      props: {
        label: 'Command label, replaced by the default slot.',
        sublabel: 'Second line below the label.',
        iconStart: 'Icon before the label. Replaced by <code>start</code>.',
        iconEnd: 'Icon after the label. Replaced by <code>end</code>.',
        selected: 'Highlights and announces the current choice.',
        tone: 'Neutral or danger; use danger for destructive commands.',
        disabled: 'Disables the command and skips it during arrow navigation.',
        href: 'Link destination.',
      },
      events: {
        select: 'The command was activated by click or keyboard. Closes the menu.',
      },
      slots: {
        default: 'Content replacing the label.',
        sublabel: 'Content replacing the second line.',
        start: 'Content replacing <code>iconStart</code>.',
        end: 'Content replacing <code>iconEnd</code>.',
        submenu: 'Nested menu items, groups and separators.',
      },
    },
    VMenuGroup: {
      props: {
        label: 'Group name. Provide this prop or its slot.',
      },
      slots: {
        default: 'Group commands.',
        label: 'Content replacing the group name.',
      },
    },
  },
}
