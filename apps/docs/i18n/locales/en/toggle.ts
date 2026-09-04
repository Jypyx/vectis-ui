export default {
  title: 'Toggle',
  lead: 'A group of buttons driven by one value: a segmented control for one choice, or a set of filters for several. Every item is a VButton, so the tones and variants are the ones you already know.',

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
        variant:
          'How the unselected items are drawn. What the selected one takes is <code>selectedVariant</code>.',
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
        icon: 'An icon before the label.',
        disabled:
          'Makes this item unusable: it no longer responds, the arrow keys skip over it, and it greys out through the colour tokens.',
      },
      slots: {
        default: 'The content of the item, replacing the <code>label</code> prop.',
      },
    },
  },
}
