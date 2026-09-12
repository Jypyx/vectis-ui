export default {
  title: 'Menu',
  lead: 'A list of commands opened by a button. It carries the full ARIA menu pattern: roving focus, nested submenus, and the browser stacking the panels so that one dismissal closes the branch.',

  examples: {
    menuItems: {
      title: 'Menu items',
      text: 'A row carries a label, an icon at either end, and a <code>tone</code>: <code>danger</code> for what destroys something, <code>neutral</code> for everything else. <code>disabled</code> stops it responding and the arrow keys step over it, and <code>href</code> turns it into a real link. VMenuSeparator draws a rule between two runs of commands.',
    },
    sublabels: {
      title: 'Sublabels',
      text: '<code>sublabel</code> adds a second line under the label, for what the command does that its name does not say, or for the shortcut that triggers it.',
    },
    selection: {
      title: 'Selection',
      text: '<code>selected</code> marks the row currently in effect, colouring it and announcing it as the current choice. Choosing a row still closes the panel.',
    },
    groups: {
      title: 'Groups',
      text: 'VMenuGroup is a named block of commands. Its label is a heading: nothing happens when it is clicked and the arrow keys never stop on it.',
    },
    submenus: {
      title: 'Submenus',
      text: 'A row given a <code>#submenu</code> slot opens a panel of its own, and those panels may nest as deep as needed. Hovering the row opens it after a short delay, and the right and left arrows enter and leave it.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the row height to 32, 40 or 48 pixels, and <code>compact</code> takes 4px off it. It is set once on the menu, submenus reading it from there.',
    },
    width: {
      title: 'Width',
      text: "<code>width</code> replaces the panel's own floor and ceiling with any CSS length or keyword. <code>matchTrigger</code> replaces the floor alone, so the panel can no longer be narrower than the button that opened it. Both apply to the menu itself, submenus keeping the default.",
    },
    placement: {
      title: 'Placement',
      text: '<code>placement</code> names the preferred opening direction of the panel, above or below the trigger.',
    },
    open: {
      title: 'Knowing whether it is open',
      text: '<code>v-model:open</code> is fed by the panel as well as read from it: a click outside, Escape or choosing a command all write back to it. A menu opened from code still anchors itself to its trigger.',
    },
  },

  api: {
    VMenu: {
      props: {
        placement:
          'Where the panel opens relative to its trigger. The browser moves it to another side by itself when there is not enough room.',
        size: 'How tall the rows are: 32, 40 or 48 pixels. Submenus inherit it, so it is set once on the menu as a whole.',
        compact: 'Takes 4px off the height of every row, submenus included.',
        width:
          'A width for the panel, given as any CSS length or keyword, <code>16rem</code> or <code>max-content</code>. It applies to the menu itself; submenus keep the default width.',
        matchTrigger:
          'Stops the panel from being narrower than the button that opened it, while leaving it free to grow wider for its content. Submenus are unaffected.',
        vModelOpen:
          "Whether the menu is showing. It starts closed and is fed by the panel, so the browser's own dismissal, a click outside, Escape, or choosing a command, writes back to it.",
      },
      slots: {
        trigger:
          'The button that opens the menu. Bind the <code>triggerProps</code> it receives onto it: that is what wires the two together.',
        default: 'The contents of the menu: VMenuItem, VMenuGroup and VMenuSeparator.',
      },
    },
    VMenuItem: {
      props: {
        label: 'What the command says. The default slot replaces it.',
        sublabel: 'A second line under the label, for a shortcut or a short explanation.',
        iconStart: 'An icon before the label. The <code>#start</code> slot replaces it.',
        iconEnd: 'An icon after the label. The <code>#end</code> slot replaces it.',
        selected:
          'Marks this item as the one currently in effect, the chosen sort order or the active view. It is coloured and announced as such.',
        tone: 'What the command means, in colour. <code>danger</code> marks it destructive, which is where deleting something belongs, and <code>neutral</code>, the default, covers every other command.',
        disabled: 'Makes the item unusable: it no longer responds and the arrows skip over it.',
        href: 'Turns the item into a link pointing at this address, for a menu that navigates rather than acts.',
      },
      events: {
        select: 'The command was chosen, by click or by keyboard. The menu closes on its own.',
      },
      slots: {
        default: 'The label, replacing the <code>label</code> prop.',
        sublabel: 'The second line, replacing the <code>sublabel</code> prop.',
        start: 'Free content before the label, which takes the place of <code>iconStart</code>.',
        end: 'Free content after the label, which takes the place of <code>iconEnd</code>.',
        submenu:
          'The contents of a submenu: items, groups and separators, this component included, so menus may nest as deep as needed.',
      },
    },
    VMenuGroup: {
      props: {
        label: 'The name of the section. It is a heading, not a command: nothing happens on click.',
      },
      slots: {
        default: 'The commands belonging to this section.',
      },
    },
  },
}
