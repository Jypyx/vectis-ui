export default {
  title: 'Tabs',
  lead: '<code>VTabs</code> selects a tab and optionally displays its panel. It also supports a tab bar without panels.',
  examples: {
    variants: {
      title: 'Variants and tones',
      text: '<code>flat</code> underlines the selected tab. <code>outline</code>, <code>elevated</code> and <code>filled</code> add a frame with a border, a shadow or a muted surface, and <code>inset</code> uses a recessed track. <code>tone</code> colours the selection.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Set <code>size</code> and <code>compact</code> on the group.',
    },
    tabContent: {
      title: 'What a tab holds',
      text: 'Use labels, icons or slots. Give icon-only tabs a <code>label</code> for their accessible name.',
    },
    panels: {
      title: 'Panels',
      text: 'Provide one matching panel per tab in <code>panels</code>, or omit this slot from the start. Hidden panels retain their state and form values. <code>lazy</code> delays mounting until the first opening.',
    },
    alignment: {
      title: 'Alignment',
      text: '<code>align</code> positions tabs when they do not fill the bar.',
    },
    fullWidth: {
      title: 'Filling the bar',
      text: '<code>fullWidth</code> gives tabs equal shares of the bar. Long labels truncate; scrolling is disabled.',
    },
    orientation: {
      title: 'Orientation',
      text: 'Vertical tabs appear beside their panels. Arrow key navigation follows the orientation.',
    },
    scrolling: {
      title: 'Scrolling',
      text: 'Overflowing tabs scroll by touch, trackpad or keyboard. Let the parent shrink with a zero minimum size.',
    },
    scrollButtons: {
      title: 'Scroll buttons',
      text: '<code>scrollButtons</code> adds controls at each end. It cannot be combined with <code>fullWidth</code>.',
    },
    customArrows: {
      title: 'Custom arrows',
      text: 'Customize scroll icons and their accessible labels with <code>prevIcon</code>, <code>nextIcon</code>, <code>prevLabel</code> and <code>nextLabel</code>.',
    },
    activation: {
      title: 'Selecting on arrival',
      text: 'Manual activation moves focus with arrows and selects with Enter or Space. Automatic activation selects on focus; use it when panels appear immediately.',
    },
    disabled: {
      title: 'Disabled tabs',
      text: 'Disabled tabs are skipped. Keep the model on an enabled tab. Disabling the group leaves the current panel visible.',
    },
  },
  api: {
    VTabs: {
      props: {
        variant:
          'Tab bar style: underlined, framed by a border, a shadow or a muted fill, or inset.',
        tone: 'Colour of the selected tab.',
        size: 'Component size.',
        compact: 'Reduces the control height without changing text or icons.',
        orientation: 'Horizontal or vertical tab navigation.',
        align: 'Tab alignment when the bar is not full.',
        fullWidth: 'Distributes tabs equally across the bar.',
        scrollButtons: 'Adds scroll controls. Incompatible with <code>fullWidth</code>.',
        prevIcon: 'Backward scroll icon. Defaults to the orientation’s arrow.',
        nextIcon: 'Forward scroll icon. Defaults to the orientation’s arrow.',
        prevLabel: 'Accessible backward scroll label. Defaults to the dictionary.',
        nextLabel: 'Accessible forward scroll label. Defaults to the dictionary.',
        activation: 'Manual selection with Enter/Space, or automatic selection on focus.',
        disabled: 'Disables all tabs and scroll controls; keeps the current panel visible.',
        label: 'Accessible name of the tab list. Defaults to the dictionary.',
        vModel: 'Selected tab value. Must refer to an existing, enabled tab for keyboard access.',
      },
      slots: {
        default: '<code>VTab</code> children.',
        panels: 'Matching <code>VTabPanel</code> children. Omit for a bar without panels.',
      },
    },
    VTab: {
      props: {
        value: 'Tab identifier matching its panel and the model value.',
        label: 'Visible label, replaced by the default slot. Also names icon-only tabs.',
        iconStart: 'Icon before the label.',
        iconEnd: 'Icon after the label.',
        iconFilled: 'Uses filled icons when supported.',
        disabled: 'Disables this tab; group disabling also applies.',
      },
      slots: {
        default: 'Content replacing the label.',
        start: 'Content replacing <code>iconStart</code>.',
        end: 'Content replacing <code>iconEnd</code>.',
      },
    },
    VTabPanel: {
      props: {
        value: 'Identifier of the tab displaying this panel.',
        lazy: 'Mounts content on first opening, then preserves it.',
      },
      slots: {
        default: 'Panel content.',
      },
    },
  },
}
