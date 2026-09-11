export default {
  title: 'Menu',
  lead: 'A list of commands opened by a button. It carries the full ARIA menu pattern: roving focus, nested submenus, and the browser stacking the panels so that one dismissal closes the branch.',

  examples: {
    menuItems: {
      title: 'Menu items',
      text: 'A row carries a label, an icon at either end, and what it means. That last one is a <code>tone</code> rather than a boolean of its own, the same word on the same prop as a button: <code>danger</code> for what destroys something, <code>neutral</code> for everything else. There is no accent here, a menu having no primary command among its rows. A disabled row stops responding and the arrow keys step over it, and <code>href</code> turns a row into a real link, which is what a menu that navigates rather than acts should be made of: it can then be middle-clicked and its address copied. VMenuSeparator draws a rule between two runs of commands.',
    },
    sublabels: {
      title: 'Sublabels',
      text: 'A second line under the label, for what the command does that its name does not already say, or for the shortcut that triggers it. The row grows to hold both and the icon stays centred on the pair rather than on the first line.',
    },
    selection: {
      title: 'Selection',
      text: '<code>selected</code> marks the row currently in effect, the sort order being used or the view being shown. It colours the row and announces it as the current choice, so a tick beside it is decoration rather than the information itself: a screen reader is told either way. A menu is still a list of commands, not a set of checkboxes, so choosing one closes the panel.',
    },
    groups: {
      title: 'Groups',
      text: 'A named block of commands. The label is a heading and not a command: nothing happens when it is clicked and the arrow keys never stop on it. It takes the same height as a row, which is what keeps the vertical rhythm of the list even when a heading interrupts it. Separators and groups mix freely, a separator being a rule where a group is a name.',
    },
    submenus: {
      title: 'Submenus',
      text: 'A row given a <code>#submenu</code> slot opens a panel of its own, and those panels may nest as deep as needed. Hovering the row opens it after a short delay, long enough that passing over on the way somewhere else opens nothing. From the keyboard the right arrow enters the submenu and the left arrow or Escape goes back one level. The browser stacks the panels, so a click outside closes the whole branch at once and moving to a sibling closes the one that was open.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Three row heights, 32, 40 and 48 pixels, each with its <code>compact</code> pair 4px shorter. It is set once on the menu as a whole: the panel carries the size and every row reads it from there, submenus included, so a nested panel cannot drift out of step with its parent.',
    },
    width: {
      title: 'Width',
      text: 'Left alone, the panel sits between a floor and a ceiling of its own, which is what stops a menu of short commands from being a sliver and one long label from stretching it across the page. <code>width</code> replaces both with any CSS length or keyword, <code>max-content</code> shrinking it to its longest row. <code>matchTrigger</code> replaces the floor instead: the panel can no longer be narrower than the button that opened it, while staying free to grow for a longer row. Both apply to the menu itself, submenus keeping the default.',
    },
    placement: {
      title: 'Placement',
      text: 'Where the panel opens relative to its trigger. Only the block axis is offered, above or below, since a list of commands opening beside its button would leave the reader looking in the wrong place. It names a preference rather than a position: a browser short of room below flips the panel above on its own, so the value only decides which side is tried first.',
    },
    open: {
      title: 'Knowing whether it is open',
      text: 'The model is fed by the panel rather than only read by it: a click outside, Escape, or choosing a command all write back to it, so nothing has to be reset by hand. Reading it is the common use, for a trigger that changes while its menu is out or a page that has to know. Writing to it is rarer and worth being honest about: closing from code covers the ordinary case of an action that finishes elsewhere, while opening from code only really suits a keyboard shortcut or a guided tour, a menu otherwise belonging to the button that opens it. A menu opened from code anchors itself to that button all the same.',
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
