export default {
  title: 'Radio',
  lead: 'One choice among several. The group is native: every button sharing a <code>name</code> belongs to it, and the browser handles the exclusivity and the arrow keys.',

  examples: {
    labelPosition: {
      title: 'Label position',
      text: 'The label sits after the dot by default, which is the reading order a form is expected to have. <code>labelPosition</code> moves it before, for a column that lines its labels up on the left. The whole component is one <code>&lt;label&gt;</code>, so the text is clickable either way, and the native input is taken out of the flow: reversing the row only ever swaps the dot and the text. The two rows below differ so that the two positions can be compared side by side; a real group picks one side and keeps it for every button.',
    },
    spread: {
      title: 'Spread',
      text: 'A settings panel puts its label on one side of the line and its control on the other. <code>spread</code> does that: the row takes the full width it is offered and pushes the two apart, so it is the container that decides how far. Combined with <code>labelPosition</code> it also decides which end each of them goes to.',
    },
    disabled: {
      title: 'Disabled',
      text: 'A disabled button cannot be picked, and it greys out through the colour tokens rather than through an opacity, so the label keeps its contrast. The exclusivity and the arrow keys belong to the browser, which steps over a disabled button on its own with nothing here to help it. A button that is selected and disabled at once keeps its dot: that is how a choice already made but no longer offered reads, and it stays in the group rather than disappearing from it.',
    },
  },

  api: {
    VRadio: {
      props: {
        value:
          "What choosing this button means. The group's v-model holds the value of the selected button, so this is what it becomes when this one is picked.",
        labelPosition: 'Which side of the dot the label sits on.',
        spread:
          'Pushes the label and the dot to opposite ends of the line, the row taking the full width available.',
        invalid:
          'Marks the field as invalid, which colours the dot and tells assistive technology so. It is for a rule the browser cannot check by itself.',
        disabled: 'Makes this choice unusable, greyed out through the colour tokens.',
        vModel:
          'The value selected in the group, shared by every radio carrying the same <code>name</code>. It is empty until one is chosen, and a radio is selected when it matches its own <code>value</code>.',
      },
      slots: {
        default:
          'The label. It is clickable, the whole component being wrapped in a <code>&lt;label&gt;</code>.',
      },
    },
  },
}
