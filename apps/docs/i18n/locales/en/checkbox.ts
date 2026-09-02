export default {
  title: 'Checkbox',
  lead: 'A choice that a submit will carry out, as opposed to a switch, which acts at once. It wraps a real <code>&lt;input type="checkbox"&gt;</code>, so it submits with the form.',

  api: {
    VCheckbox: {
      props: {
        indeterminate:
          'Shows the box as partially checked, a dash instead of a tick. This is what a parent checkbox looks like when some of its children are ticked and others are not. It is a state of its own, not a value the v-model can hold.',
        labelPosition: 'Which side of the box the label sits on.',
        spread:
          'Pushes the label and the box to opposite ends of the line, the row taking the full width available. This is the usual shape for a list of settings.',
        invalid:
          'Marks the field as invalid, which colours the box and tells assistive technology so. Use it for a rule the browser cannot check by itself; native validity is already handled without it.',
        disabled: 'Makes the checkbox unusable, greyed out through the colour tokens.',
        vModel:
          'Whether the box is ticked. It starts unticked, and the dash is a third appearance rather than a third value: that one is <code>indeterminate</code>.',
      },
      slots: {
        default:
          'The label. It is clickable, the whole component being wrapped in a <code>&lt;label&gt;</code>.',
      },
    },
  },
}
