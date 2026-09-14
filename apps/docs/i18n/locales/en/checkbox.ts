export default {
  title: 'Checkbox',
  lead: 'A choice that a submit will carry out, as opposed to a switch, which acts at once. It wraps a real <code>&lt;input type="checkbox"&gt;</code>, so it submits with the form.',

  examples: {
    labelPosition: {
      title: 'Label position',
      text: '<code>labelPosition</code> moves the label before the box instead of after it.',
    },
    spread: {
      title: 'Spread',
      text: '<code>spread</code> takes the full width offered and pushes the label and the box to opposite ends of the row.',
    },
    indeterminate: {
      title: 'Indeterminate',
      text: '<code>indeterminate</code> shows a dash instead of a tick. It is an appearance of its own: the v-model still holds true or false.',
    },
    disabled: {
      title: 'Disabled',
      text: '<code>disabled</code> prevents the box from being ticked and greys it out through the colour tokens. The keyboard steps over it.',
    },
    hint: {
      title: 'Hint',
      text: '<code>label</code> writes the text beside the box, and the default slot replaces it when the label needs more than text. <code>hint</code> adds a caption underneath, tied to the box through <code>aria-describedby</code> and kept outside the <code>&lt;label&gt;</code>, so it is announced as a description rather than as part of the name.',
    },
    readonly: {
      title: 'Read-only',
      text: '<code>readonly</code> shows the state without letting it change. The native attribute does nothing on a checkbox, so the component cancels the click, which covers Space as well. The box stays focusable, is submitted with its form and is announced as read-only.',
    },
  },

  api: {
    VCheckbox: {
      props: {
        label: 'The text beside the box, which names it. The default slot replaces it.',
        hint: 'A line of help under the label. It is tied to the checkbox for assistive technology, so it is read out after the label rather than as part of it.',
        readonly:
          'Shows the state without allowing it to be changed. The checkbox can still be focused, is announced as read-only and is still submitted with its form; a click or the Space key simply changes nothing.',
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
          "The label, when it needs more than the <code>label</code> prop's text. It is clickable.",
      },
    },
  },
}
