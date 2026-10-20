export default {
  title: 'Meter group',
  lead: '<code>VMeterGroup</code> shows how a total breaks down: several readings sharing one range, drawn as the parts of a single bar with a legend.',
  examples: {
    colours: {
      title: 'Colours',
      text: 'Each item takes a <code>tone</code> or a <code>color</code>. Without either, its hue is derived from its position, starting from the accent, and follows the theme. An <code>icon</code> replaces the legend swatch.',
    },
    values: {
      title: 'Values',
      text: '<code>showValue</code> writes the sum after the label. The sum and every amount are percentages of <code>max</code> by default; <code>formatOptions</code> formats them for the current locale, and <code>valueText</code> replaces the sum.',
    },
    overflow: {
      title: 'Overflow',
      text: 'When the amounts add up to more than <code>max</code>, the parts share the whole bar in proportion. The legend keeps their real amounts.',
    },
    slots: {
      title: 'Slots',
      text: 'The <code>value</code> slot replaces the sum. <code>item-leading</code>, <code>item-label</code> and <code>item-value</code> replace a legend row’s swatch, label and amount.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the thickness of the bar, from 2 to 20 pixels, on the same scale as <code>VMeter</code>. <code>hideLegend</code> hides the legend visually; screen readers still read it.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation="vertical"</code> fills from the bottom up and puts the legend beside the bar. Set a height to control the bar’s length.',
    },
  },
  api: {
    VMeterGroup: {
      props: {
        items: 'Parts, in the order they fill the bar.',
        max: 'Total the amounts are measured against. Parts share the bar in proportion when they exceed it.',
        label:
          'What is measured, shown above the bar and naming the group. Uses the dictionary by default; ARIA naming attributes take precedence.',
        hideLabel: 'Hides the label visually. Screen readers still read it.',
        showValue: 'Writes the sum of the amounts after the label.',
        valueText: 'Text replacing the formatted sum.',
        formatOptions:
          '<code>Intl.NumberFormat</code> options formatting the sum and every amount.',
        hideLegend: 'Hides the legend visually. Screen readers still read it.',
        size: 'Bar thickness.',
        orientation:
          'Horizontal or vertical bar. Vertical fills from bottom to top, the legend beside it.',
      },
      slots: {
        value:
          'Content replacing the sum. Receives <code>value</code>, <code>max</code> and <code>percent</code>.',
        itemLeading:
          'Decorative content replacing a row’s swatch or icon. Receives <code>item</code>, <code>index</code> and <code>percent</code>.',
        itemLabel:
          'Content replacing a row’s label. Receives <code>item</code>, <code>index</code> and <code>percent</code>.',
        itemValue:
          'Content replacing a row’s amount. Receives <code>item</code>, <code>index</code> and <code>percent</code>.',
      },
    },
  },
}
