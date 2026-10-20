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
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the thickness of the bar, from 2 to 20 pixels, on the same scale as <code>VMeter</code>. The bar fills its container’s width.',
    },
    shape: {
      title: 'Shape',
      text: '<code>shape</code> selects rounded or square stroke ends.',
    },
    customContent: {
      title: 'Value position',
      text: '<code>showValue</code> displays the percentage. <code>valuePosition</code> writes it after the label or inside the bar, which needs <code>size="xl"</code>. The default slot receives <code>value</code>, <code>max</code> and <code>percent</code>. Inside the bar it renders twice: use non-interactive content without side effects.',
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
          'Label above the bar, which also names it. Defaults to the dictionary as an accessible name; consumer ARIA naming attributes take precedence.',
        hideLabel: 'Hides the label visually while keeping it as the bar name.',
        value: 'Progress value, clamped between 0 and <code>max</code>.',
        max: 'Value representing completion.',
        indeterminate: 'Animates without a measurable value. Ignores <code>value</code>.',
        tone: 'Colour tone.',
        color: 'Custom CSS colour overriding the tone.',
        size: 'Bar thickness. Only <code>xl</code> holds the value inside the bar.',
        shape: 'Rounded or square stroke ends.',
        showValue: 'Displays the percentage. Ignored in indeterminate mode.',
        valuePosition:
          'Text position: after the label, or along the bar. Vertical start is the bottom.',
        orientation: 'Horizontal or vertical bar. Vertical progress fills from bottom to top.',
      },
      slots: {
        default:
          'Content replacing the percentage. Receives <code>value</code>, <code>max</code> and <code>percent</code>. Renders twice inside the bar; keep content non-interactive and free of side effects.',
      },
    },
  },
}
