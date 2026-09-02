export default {
  title: 'Switch',
  lead: 'A setting that takes effect immediately. It is announced with <code>role="switch"</code>, so a screen reader says on or off rather than ticked, and that is the whole reason it is not a checkbox.',

  api: {
    VSwitch: {
      props: {
        labelPosition: 'Which side of the switch the label sits on.',
        spread:
          'Pushes the label and the switch to opposite ends of the line, so a column of settings lines its switches up down one edge.',
        disabled:
          'Makes the switch unusable. It greys out through the colour tokens rather than through opacity, so it stays legible on any surface.',
        vModel:
          'Whether the switch is on. It is bound to a real hidden <code>&lt;input type="checkbox"&gt;</code>, so the value submits with the form like any other field.',
      },
      slots: {
        default:
          'The label. It is a slot rather than a prop so that it can hold a link or a piece of emphasis, and it sits inside the wrapping <code>&lt;label&gt;</code>, so clicking the words toggles the switch.',
      },
    },
  },
}
