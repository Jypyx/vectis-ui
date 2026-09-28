export default {
  title: 'Toggle',
  lead: '<code>VToggle</code> groups <code>VToggleItem</code> buttons to select one or more values through <code>v-model</code>.',
  examples: {
    variants: {
      title: 'Variants and tones',
      text: '<code>itemVariant</code> styles unselected items. <code>tone</code> applies to selected items; the others remain neutral.',
    },
    selectedVariants: {
      title: 'Selection style',
      text: '<code>selectedVariant</code> sets the selected style: <code>solid</code>, <code>soft</code> or <code>ghost</code>.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets every item’s size. <code>compact</code> reduces their height.',
    },
    itemContent: {
      title: 'Item content',
      text: 'Use <code>label</code> or the default slot for visible text, and <code>iconStart</code> or <code>iconEnd</code> for icons. Give icon-only items an <code>aria-label</code>.',
    },
    filledIcons: {
      title: 'Filled icons',
      text: '<code>selectedIconFilled</code> fills the selected item’s start icon. An item’s <code>iconFilled</code> fills both icons regardless of selection, where supported.',
    },
    detached: {
      title: 'Detached',
      text: '<code>detached</code> separates the items with a gap.',
    },
    seamless: {
      title: 'No dividers',
      text: '<code>seamless</code> removes inner dividers. Has no effect with <code>detached</code>.',
    },
    fullWidth: {
      title: 'Full width',
      text: '<code>fullWidth</code> fills the parent’s width. Horizontal groups give each item equal width.',
    },
    elevated: {
      title: 'Elevated',
      text: '<code>elevated</code> adds one shadow to a joined group, or a shadow to each item when detached.',
    },
    orientation: {
      title: 'Orientation and keyboard',
      text: '<code>orientation="vertical"</code> stacks the items. Arrows move focus along that axis; Home and End focus the first and last enabled items. Each enabled item remains a Tab stop. Space or Enter changes the selection.',
    },
    multiple: {
      title: 'Multiple selection',
      text: '<code>multiple</code> allows several selections and uses an array for <code>v-model</code>. Activate a selected item again to deselect it.',
    },
    mandatory: {
      title: 'Keep a selection',
      text: '<code>mandatory</code> prevents deselecting the last selected item. Set the initial selection through <code>v-model</code>.',
    },
    disabled: {
      title: 'Disabled',
      text: 'Disable the group or an individual item with <code>disabled</code>. Disabled items cannot receive focus and are skipped by arrow navigation.',
    },
  },
  api: {
    VToggle: {
      props: {
        multiple: 'Allows multiple selections. Use an array for <code>v-model</code>.',
        mandatory:
          'Prevents deselecting the last selected item. Does not select an initial value or prevent external changes to <code>v-model</code>.',
        detached: 'Separates the items with a gap.',
        seamless:
          'Removes inner dividers while preserving the outer border. Has no effect with <code>detached</code>.',
        orientation: 'Horizontal row or vertical column. Sets the arrow navigation direction.',
        fullWidth:
          'Fills the parent’s width. Horizontal items share equal widths but may overflow if their content is too wide.',
        itemVariant:
          'Visual style of unselected items: <code>ghost</code> or <code>outline</code>.',
        selectedVariant:
          'Visual style of selected items: <code>solid</code>, <code>soft</code> or <code>ghost</code>.',
        tone: 'Tone of selected items. Unselected items remain neutral.',
        size: 'Size of all items.',
        compact: 'Reduces item height.',
        elevated: 'Adds a group shadow, or individual shadows with <code>detached</code>.',
        disabled: 'Disables all items and removes them from the tab order.',
        selectedIconFilled:
          'Requests a filled start icon for selected items, where supported. Does not affect end icons or slot content.',
        label:
          'Accessible group name. Provide this or an <code>aria-label</code> or <code>aria-labelledby</code>.',
        vModel:
          'Selected value: a string, number or <code>null</code> for single selection; an array for multiple selection. In multiple mode, a scalar or <code>null</code> is treated as an empty selection. Activating a selected item deselects it unless <code>mandatory</code> prevents it.',
      },
      slots: {
        default: 'The <code>VToggleItem</code> components in the group.',
      },
    },
    VToggleItem: {
      props: {
        value:
          'Value written to the group’s <code>v-model</code>. Must be unique within the group.',
        label:
          'Visible text, replaced by the default slot. For icon-only items, use <code>aria-label</code>.',
        iconStart: 'Icon before the label, replaced by the <code>#start</code> slot.',
        iconEnd: 'Icon after the label, replaced by the <code>#end</code> slot.',
        iconFilled:
          'Requests filled versions of both icons regardless of selection, where supported. Does not affect slot content.',
        disabled: 'Disables this item and removes it from Tab and arrow navigation.',
      },
      slots: {
        default: 'Visible content, replacing <code>label</code>.',
        start: 'Content before the label, replacing <code>iconStart</code>.',
        end: 'Content after the label, replacing <code>iconEnd</code>.',
      },
    },
  },
}
