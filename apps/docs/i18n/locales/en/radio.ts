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
    hint: {
      title: 'Hint',
      text: '<code>label</code> writes the text beside the dot, and the default slot replaces it. <code>hint</code> adds a caption underneath, tied to the button through <code>aria-describedby</code>, which is the place to say what an option implies.',
    },
    readonly: {
      title: 'Read-only',
      text: '<code>readonly</code>, set on every button of the group, keeps the selection where it is. The component cancels the click, and the arrow keys are covered too, since the browser selects the next button through a click: the focus moves, the selection does not.',
    },
  },

  api: {
    VRadio: {
      props: {
        label: 'The text beside the dot, which names it. The default slot replaces it.',
        hint: 'A line of help under the label. It is tied to the radio button for assistive technology, so it is read out after the label rather than as part of it.',
        readonly:
          'Shows the selection without allowing it to be changed. The button can still be focused and is still submitted with its form; a click or an arrow key simply selects nothing. Set it on every button of the group.',
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
          "The label, when it needs more than the <code>label</code> prop's text. It is clickable.",
      },
    },
  },
}
