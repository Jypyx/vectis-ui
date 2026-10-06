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
      text: 'The value is a percentage of the range by default. <code>formatOptions</code> formats the value itself for the current locale, and <code>valueText</code> replaces it with your own words. Screen readers read the same text.',
    },
    segments: {
      title: 'Segments',
      text: '<code>segments</code> splits the bar into equal parts. Colour alone does not tell the region apart: say it in <code>valueText</code> when it matters.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the thickness of the bar, 4, 8 or 12 pixels. The meter takes the whole width of its container.',
    },
    hiddenText: {
      title: 'Hidden text',
      text: '<code>hideLabel</code> and <code>hideValue</code> remove the text above the bar. Screen readers still hear the label and the value.',
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
        hideValue: 'Hides the value visually. Screen readers still read it.',
        tone: 'Colour of the fill. Chosen from the region when <code>low</code>, <code>high</code> or <code>optimum</code> is set, accent otherwise.',
        color: 'Custom CSS colour replacing the tone.',
        segments: 'Number of equal parts the bar is split into.',
        size: 'Thickness of the bar and size of the text.',
      },
    },
  },
}
