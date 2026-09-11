export default {
  title: 'Toggle',
  lead: 'A group of buttons driven by one value: a segmented control for one choice, or a set of filters for several. Every item is a VButton, so the tones and variants are the ones you already know.',

  examples: {
    variants: {
      title: 'Variants and tones',
      text: '<code>itemVariant</code> paints the items that are NOT chosen, transparent under <code>ghost</code> and outlined under <code>outline</code>. It is named for the items because that is what it paints, where VTabs and VDataTable use <code>variant</code> for the decoration of a frame. The tone colours the chosen item and nothing else, the rest staying neutral since only one of them is making a claim. Three tones, the three a button offers, since every item is one.',
    },
    selectedVariants: {
      title: 'How the selection is drawn',
      text: 'The other half of the same decision: <code>selectedVariant</code> is how the chosen item is painted in the group\u2019s tone, filled with <code>solid</code>, tinted with <code>soft</code>, or the colour of its text alone with <code>ghost</code>. Solid is the loudest and the safest default. Ghost is for a row that has to stay quiet, and it is the one to weigh: the difference then rests on the colour of the text, which is thinner evidence than a filled box.',
    },
    sizes: {
      title: 'Sizes',
      text: 'The scale shared by every control, 24 to 56 pixels, with <code>compact</code> taking 4px off. It is set once on the group and each item is a button of that size, so a toggle row and a button standing beside it line up rather than nearly lining up.',
    },
    itemContent: {
      title: 'What an item holds',
      text: 'A label, an icon at either end, or the default slot for anything a string cannot hold. An item reduced to its icon still has to say what it is: with no label there is no accessible name left, so give it one. The icon at the end is for what the item carries rather than what it is, which is also why the group\u2019s filled-icon setting never touches it.',
    },
    filledIcons: {
      title: 'Filled icons',
      text: 'The chosen item draws its icon in the filled form, a common way of reinforcing which one is in effect and one that does not rest on colour alone. It names the icon standing FOR the item, so only the one at the start is switched. Nothing happens to an icon with no filled form: the library ships a second drawing only where the fill really changes the geometry, which is under half of the icons it carries.',
    },
    detached: {
      title: 'Detached',
      text: 'Joined by default, the items melting into one segmented control, which is what says they are one choice. Detached leaves them as separate buttons with a gap between them, which suits a row of filters that happen to share a model more than it suits one exclusive answer.',
    },
    seamless: {
      title: 'Seamless',
      text: 'Joined, a line is drawn between two items and the row reads as a set of segments, each one a target. Seamless takes those lines out, and the row reads instead as one frame holding a highlight that moves. It has no effect under <code>detached</code>, where the items are separate buttons already.',
    },
    elevated: {
      title: 'Elevated',
      text: 'The row is raised off the page, on the terms of VButtonGroup\u2019s own prop: the shadow belongs to the row rather than to each item. Segments overlap by a pixel, so a shadow per item would fall on its neighbour and fill every joint with a dark band instead of lifting one object. The whole row rises together on hover for the same reason.',
    },
    orientation: {
      title: 'Orientation',
      text: 'Down the page instead of across. The joins move to the horizontal edges, the corners are carved at the top and the bottom of the column, and the arrow keys follow the axis. Detached works the same way round, the gap simply running the other direction.',
    },
    multiple: {
      title: 'Choosing several',
      text: 'Several items at once, which turns the exclusive choice into a set of filters and makes the value a list. Clicking a chosen item gives it up again. The array is never mutated in place: each change hands back a new one, which is what wakes a watcher bound to it. A null or scalar value passed in this mode is read as an empty selection rather than as an error.',
    },
    mandatory: {
      title: 'Keeping one selected',
      text: 'Clicking the chosen item normally gives it up and leaves nothing selected. <code>mandatory</code> refuses that last step, so a row that has an answer keeps one, and with several it is the last remaining item that cannot be given up. It is a guard and nothing more: it selects nothing on its own, and a group that starts empty stays empty until something is clicked.',
    },
    disabled: {
      title: 'Disabled',
      text: 'The whole group at once, where nothing responds and no item takes focus, or a single item, which stops responding and which the arrow keys step over as though it were not in the row. Both grey out through the colour tokens rather than through an opacity, so they keep their contrast against the page.',
    },
  },

  api: {
    VToggle: {
      props: {
        multiple: 'Allows several items to be chosen at once, which makes the value a list.',
        mandatory:
          'Refuses to let the last chosen item be given up, so that something is always selected once something has been. It is a guard and nothing more: it selects nothing on its own at the start.',
        detached:
          'Leaves the items as separate buttons with a gap between them. Left out, they are joined into one segmented control.',
        seamless:
          'Takes the lines out from between the joined items, so the row reads as one frame rather than as segments. It has no effect under <code>detached</code>, where the items are separate buttons already.',
        orientation: 'Whether the items run across the page or down it.',
        itemVariant:
          'How the unselected items are drawn. What the selected one takes is <code>selectedVariant</code>. It is named for the items because that is what it paints: on VTabs and VDataTable <code>variant</code> names the decoration of the frame instead.',
        selectedVariant:
          "How the selected item is drawn, in the group's tone: filled with <code>solid</code>, tinted with <code>soft</code>, or the colour of its text alone with <code>ghost</code>.",
        tone: 'The colour a selected item takes. The others stay neutral.',
        size: 'The height of the items, from the scale shared by every control.',
        compact: 'Takes 4px off the height of every item.',
        elevated:
          "Raises the row off the page, on the terms of VButtonGroup's own prop: the shadow belongs to the row rather than to each item, so the joints stay clear.",
        disabled: 'Makes the whole group unusable.',
        selectedIconFilled:
          "Draws the selected item's icon in its filled form, a common way of reinforcing that it is the one in effect.",
        label:
          'What screen readers announce for the group, "Text alignment", "Filters". It is strongly recommended: no default could say what a group of buttons is for.',
        vModel:
          'What is selected, and its shape follows <code>multiple</code>: a single value, or <code>null</code> where it starts, when one item may be chosen, and an array when several may. A null or scalar value passed in multiple mode is read as an empty selection. The array is never mutated in place. Re-clicking the selected item deselects it unless <code>mandatory</code> is set.',
      },
      slots: {
        default: 'The items of the group.',
      },
    },
    VToggleItem: {
      props: {
        value:
          "What choosing this item means. It is what the group's value holds when the item is selected, and it must be unique within the group.",
        label: 'The visible label. The default slot replaces it.',
        iconStart: 'An icon before the label.',
        iconEnd:
          'An icon after the label. It is not switched to its filled form by the group <code>selectedIconFilled</code>, which names the icon standing for the item rather than one trailing it.',
        disabled:
          'Makes this item unusable: it no longer responds, the arrow keys skip over it, and it greys out through the colour tokens.',
      },
      slots: {
        default: 'The content of the item, replacing the <code>label</code> prop.',
      },
    },
  },
}
