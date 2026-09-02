export default {
  title: 'Menu',
  lead: 'A list of commands opened by a button. It carries the full ARIA menu pattern: roving focus, nested submenus, and the browser stacking the panels so that one dismissal closes the branch.',

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
        danger:
          'Marks the command as destructive, which colours it accordingly. Deleting something belongs here.',
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
