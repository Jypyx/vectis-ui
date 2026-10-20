export default {
  title: 'Meter',
  lead: '<code>VMeter</code> shows a reading within a known range, such as disk usage, a battery level or the strength of a password. Its colour can say whether the reading is good, average or poor.',
  examples: {
    regions: {
      title: 'Regions',
      text: '<code>low</code>, <code>high</code> and <code>optimum</code> follow the rules of the native <code>&lt;meter&gt;</code>. The part of the range holding <code>optimum</code> is good and painted in success, the part next to it is average in warning, and the far part is poor in danger. Without any of the three, the meter is in the accent colour.',
    },
    tones: {
      title: 'Tones',
      text: '<code>tone</code> fixes the colour whatever the region. <code>color</code> takes a colour of your own, and the track is derived from it.',
    },
    valueText: {
      title: 'Value',
      text: '<code>showValue</code> writes the value after the label. It is a percentage of the range by default. <code>formatOptions</code> formats the value itself for the current locale, and <code>valueText</code> replaces it with your own words. Screen readers read the same text, written or not.',
    },
    valuePosition: {
      title: 'Value position',
      text: '<code>valuePosition</code> writes the value inside the bar, at its start, centre or end, as in <code>VProgressLinear</code>. Only <code>size="xl"</code> is thick enough to hold it.',
    },
    segments: {
      title: 'Segments',
      text: '<code>segments</code> splits the bar into equal parts. Colour alone does not tell the region apart: say it in <code>valueText</code> when it matters.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the thickness of the bar, from 2 to 20 pixels, on the same scale as <code>VProgressLinear</code>. The meter takes the whole width of its container.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation="vertical"</code> fills from the bottom up, segments and text inside the bar included. Set a height to control the bar’s length.',
    },
    hiddenText: {
      title: 'Hidden text',
      text: 'Without <code>showValue</code>, the value is not written, and <code>hideLabel</code> hides the label. Screen readers still hear both.',
    },
  },
  api: {
    VMeter: {
      props: {
        value: 'Reading, brought back into the range.',
        min: 'Lower bound of the range.',
        max: 'Upper bound of the range.',
        low: 'Upper end of the low part of the range.',
        high: 'Lower end of the high part of the range.',
        optimum:
          'Best value. Its part of the range is good, the next one average and the far one poor.',
        label:
          'What is measured, shown above the bar and naming it. Uses the dictionary by default; ARIA naming attributes take precedence.',
        hideLabel: 'Hides the label visually. Screen readers still read it.',
        valueText: 'Text replacing the formatted value, on screen and for screen readers.',
        formatOptions: '<code>Intl.NumberFormat</code> options formatting the value itself.',
        showValue: 'Writes the value. Screen readers read it either way.',
        valuePosition:
          'Value position: after the label, or inside the bar. Vertical start is the bottom.',
        tone: 'Colour of the fill. Chosen from the region when <code>low</code>, <code>high</code> or <code>optimum</code> is set, accent otherwise.',
        color: 'Custom CSS colour replacing the tone.',
        segments: 'Number of equal parts the bar is split into.',
        size: 'Bar thickness. Only <code>xl</code> holds the value inside the bar.',
        orientation: 'Horizontal or vertical bar. Vertical fills from bottom to top.',
      },
    },
  },
}
