export default {
  title: 'Radio',
  lead: 'One choice among several. The group is native: every button sharing a <code>name</code> belongs to it, and the browser handles the exclusivity and the arrow keys.',

  examples: {
    labelPosition: {
      title: 'Label position',
      text: '<code>labelPosition</code> moves the label before the dot instead of after it.',
    },
    spread: {
      title: 'Spread',
      text: '<code>spread</code> takes the full width offered and pushes the label and the dot to opposite ends of the row.',
    },
    disabled: {
      title: 'Disabled',
      text: '<code>disabled</code> prevents the button from being picked and greys it out through the colour tokens. A button both selected and disabled keeps its dot.',
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
