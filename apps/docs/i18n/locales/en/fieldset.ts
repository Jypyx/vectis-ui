export default {
  title: 'Fieldset',
  lead: '<code>VFieldset</code> groups related controls in a native <code>&lt;fieldset&gt;</code> named by its legend, with a hint and an error message.',
  examples: {
    horizontal: {
      title: 'Horizontal',
      text: '<code>orientation="horizontal"</code> lays the controls out in a wrapping row.',
    },
    error: {
      title: 'Error and required',
      text: '<code>error</code> replaces the hint, describes the group and is announced when it appears. A group cannot carry <code>aria-invalid</code>: bind the slot’s <code>invalid</code> and <code>required</code> on the controls.',
    },
    hiddenLegend: {
      title: 'Hidden legend',
      text: '<code>hideLegend</code> hides the legend visually. It still names the group for screen readers.',
    },
  },
  api: {
    VFieldset: {
      props: {
        legend: 'Legend naming the group.',
        hint: 'Help text below the group, linked through <code>aria-describedby</code>.',
        error:
          'Error message shown in place of the hint, linked through <code>aria-describedby</code> and announced when it appears. Sets the slot’s <code>invalid</code>.',
        required: 'Adds an asterisk after the legend and sets the slot’s <code>required</code>.',
        hideLegend: 'Hides the legend visually while keeping it as the group name.',
        orientation: 'Lays the controls out in a column or a wrapping row.',
      },
      slots: {
        default: 'The controls. Bind <code>invalid</code> and <code>required</code> on them.',
      },
    },
  },
}
