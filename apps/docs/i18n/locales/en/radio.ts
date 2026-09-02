export default {
  title: 'Radio',
  lead: 'One choice among several. The group is native: every button sharing a <code>name</code> belongs to it, and the browser handles the exclusivity and the arrow keys.',

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
