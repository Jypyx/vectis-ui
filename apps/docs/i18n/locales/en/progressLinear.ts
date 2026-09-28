export default {
  title: 'Progress linear',
  lead: '<code>VProgressLinear</code> displays task progress as a bar, or an animation when progress cannot be measured.',
  examples: {
    value: {
      title: 'Value',
      text: 'Set <code>value</code> and <code>max</code> to report progress. Values are clamped to the range.',
    },
    indeterminate: {
      title: 'Indeterminate',
      text: '<code>indeterminate</code> animates the bar without a percentage. The animation slows under reduced motion.',
    },
    tones: {
      title: 'Tones',
      text: '<code>tone</code> sets the semantic colour.',
    },
    customColors: {
      title: 'Custom colours',
      text: '<code>color</code> overrides the tone with a CSS colour.',
    },
    thickness: {
      title: 'Thickness',
      text: '<code>thickness</code> sets the stroke width in pixels. The bar fills its container’s width.',
    },
    shape: {
      title: 'Shape',
      text: '<code>shape</code> selects rounded or square stroke ends.',
    },
    customContent: {
      title: 'Content inside the bar',
      text: '<code>showValue</code> displays the percentage; <code>valuePosition</code> positions it. The default slot receives <code>value</code>, <code>max</code> and <code>percent</code>. It renders twice: use non-interactive content without side effects.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation="vertical"</code> fills from bottom to top. Set a height to control the bar’s length.',
    },
  },
  api: {
    VProgressLinear: {
      props: {
        label:
          'Accessible task name. Defaults to the dictionary; consumer ARIA naming attributes take precedence.',
        value: 'Progress value, clamped between 0 and <code>max</code>.',
        max: 'Value representing completion.',
        indeterminate: 'Animates without a measurable value. Ignores <code>value</code>.',
        tone: 'Colour tone.',
        color: 'Custom CSS colour overriding the tone.',
        thickness: 'Bar thickness in pixels. Increase it before displaying text inside.',
        shape: 'Rounded or square stroke ends.',
        showValue: 'Displays the percentage. Ignored in indeterminate mode.',
        valuePosition: 'Text position along the bar. Vertical start is the bottom.',
        orientation: 'Horizontal or vertical bar. Vertical progress fills from bottom to top.',
      },
      slots: {
        default:
          'Content replacing the percentage. Receives <code>value</code>, <code>max</code> and <code>percent</code>. Renders twice; keep content non-interactive and free of side effects.',
      },
    },
  },
}
