export default {
  title: 'Toggle',
  lead: 'A group of buttons driven by one value: a segmented control for one choice, or a set of filters for several. Every item is a VButton, so the tones and variants are the ones you already know.',

  examples: {
    variants: {
      title: 'Variants and tones',
      text: '<code>itemVariant</code> paints the items that are not chosen, transparent under <code>ghost</code> and outlined under <code>outline</code>. <code>tone</code> colours the chosen item and nothing else, with the three values a button offers.',
    },
    selectedVariants: {
      title: 'How the selection is drawn',
      text: "<code>selectedVariant</code> is how the chosen item is painted in the group's tone: filled with <code>solid</code>, tinted with <code>soft</code>, or the colour of its text alone with <code>ghost</code>.",
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> takes the scale every control shares, 24 to 56 pixels, and <code>compact</code> takes 4px off it. It is set once on the group.',
    },
    itemContent: {
      title: 'What an item holds',
      text: 'An item takes a label, an icon at either end, or the default slot for what a string cannot hold. An item reduced to its icon still needs a <code>label</code>, which is then its accessible name.',
    },
    filledIcons: {
      title: 'Filled icons',
      text: "<code>selectedIconFilled</code> draws the chosen item's start icon in its filled form. Nothing happens to an icon that has no filled drawing.",
    },
    detached: {
      title: 'Detached',
      text: '<code>detached</code> leaves the items as separate buttons with a gap between them, instead of joining them into one segmented control.',
    },
    seamless: {
      title: 'Seamless',
      text: '<code>seamless</code> takes out the lines drawn between two items, so the row reads as one frame holding a highlight that moves. It has no effect under <code>detached</code>.',
    },
    elevated: {
      title: 'Elevated',
      text: '<code>elevated</code> raises the row off the page, the shadow belonging to the row rather than to each item.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation</code> set to <code>vertical</code> stacks the items down the page, the joins and the arrow keys following the axis.',
    },
    multiple: {
      title: 'Choosing several',
      text: '<code>multiple</code> lets several items be chosen at once, which makes the value a list. Clicking a chosen item gives it up again, and the array is never mutated in place.',
    },
    mandatory: {
      title: 'Keeping one selected',
      text: '<code>mandatory</code> refuses to give up the last chosen item. It is a guard and nothing more: it selects nothing on its own.',
    },
    disabled: {
      title: 'Disabled',
      text: '<code>disabled</code> applies to the whole group, where nothing responds and no item takes focus, or to a single item, which the arrow keys then step over. Both grey out through the colour tokens.',
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
