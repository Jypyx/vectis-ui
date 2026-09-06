export default {
  title: 'Checkbox',
  lead: 'A choice that a submit will carry out, as opposed to a switch, which acts at once. It wraps a real <code>&lt;input type="checkbox"&gt;</code>, so it submits with the form.',

  examples: {
    labelPosition: {
      title: 'Label position',
      text: 'The label sits after the box by default, which is the reading order a form is expected to have. <code>labelPosition</code> moves it before, for a row that lines its labels up on the left. The whole component is one <code>&lt;label&gt;</code>, so the text is clickable either way, and the hidden input is taken out of the flow: reversing the row only ever swaps the box and the text.',
    },
    spread: {
      title: 'Spread',
      text: 'A settings list puts its label on one side of the line and its box on the other. <code>spread</code> does that: the row takes the full width it is offered and pushes the two apart, so it is the container that decides how far. Combined with <code>labelPosition</code> it also decides which end each of them goes to.',
    },
    indeterminate: {
      title: 'Indeterminate',
      text: 'A parent whose children are neither all ticked nor all unticked shows a dash. That is a third appearance and not a third value: the v-model still holds true or false, and <code>indeterminate</code> is a prop of its own, computed from the children. It exists only as a DOM property, with no HTML attribute a template could set, which is the one thing this component writes to the input by hand.',
    },
    disabled: {
      title: 'Disabled',
      text: 'A disabled checkbox cannot be ticked, the keyboard steps over it, and it greys out through the colour tokens rather than through an opacity, so the label keeps its contrast. It applies to all three appearances. Reach for it when the choice exists but is not available yet; a choice that never applies is better left out of the form.',
    },
  },

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
