export default {
  title: 'Progress circular',
  lead: '<code>VProgressCircular</code> displays task progress as a ring, or an animation when progress cannot be measured.',
  examples: {
    value: {
      title: 'Value',
      text: 'Set <code>value</code> and <code>max</code> to report progress. Values are clamped to the range.',
    },
    indeterminate: {
      title: 'Indeterminate',
      text: '<code>indeterminate</code> animates the ring without a percentage. Use <code>VSpinner</code> for an icon-sized loading indicator.',
    },
    tones: {
      title: 'Tones',
      text: '<code>tone</code> sets the semantic colour.',
    },
    customColors: {
      title: 'Custom colours',
      text: '<code>color</code> overrides the tone with a CSS colour.',
    },
    sizeAndThickness: {
      title: 'Size and thickness',
      text: '<code>size</code> sets the diameter and <code>thickness</code> sets the stroke width, both in pixels.',
    },
    shape: {
      title: 'Shape',
      text: '<code>shape</code> selects rounded or square stroke ends.',
    },
    customContent: {
      title: 'Content in the middle',
      text: '<code>showValue</code> displays the percentage at the centre. The default slot replaces it and receives <code>value</code>, <code>max</code> and <code>percent</code>.',
    },
  },
  api: {
    VProgressCircular: {
      props: {
        label:
          'Accessible task name. Defaults to the dictionary; consumer ARIA naming attributes take precedence.',
        value: 'Progress value, clamped between 0 and <code>max</code>.',
        max: 'Value representing completion.',
        indeterminate: 'Animates without a measurable value. Ignores <code>value</code>.',
        tone: 'Colour tone.',
        color: 'Custom CSS colour overriding the tone.',
        size: 'Ring diameter in pixels, as a number or numeric string.',
        thickness: 'Stroke thickness in pixels, as a number or numeric string.',
        shape: 'Rounded or square stroke ends.',
        showValue: 'Displays the percentage. Ignored in indeterminate mode.',
      },
      slots: {
        default:
          'Centre content replacing the percentage. Receives <code>value</code>, <code>max</code> and <code>percent</code>.',
      },
    },
  },
}
