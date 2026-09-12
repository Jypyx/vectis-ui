export default {
  title: 'Switch',
  lead: 'A setting that takes effect immediately. It is announced with <code>role="switch"</code>, so a screen reader says on or off rather than ticked, and that is the whole reason it is not a checkbox.',

  examples: {
    labelPosition: {
      title: 'Label position',
      text: '<code>labelPosition</code> moves the label before the switch instead of after it.',
    },
    spread: {
      title: 'Spread',
      text: '<code>spread</code> takes the full width offered and pushes the label and the switch to opposite ends of the row.',
    },
    disabled: {
      title: 'Disabled',
      text: '<code>disabled</code> prevents the switch from being flicked and greys it out through the colour tokens, on as well as off. The keyboard steps over it.',
    },
  },

  api: {
    VSwitch: {
      props: {
        labelPosition: 'Which side of the switch the label sits on.',
        spread:
          'Pushes the label and the switch to opposite ends of the line, so a column of settings lines its switches up down one edge.',
        disabled:
          'Makes the switch unusable. It greys out through the colour tokens rather than through opacity, so it stays legible on any surface.',
        invalid:
          'Marks the field as invalid, which rings the track and tells assistive technology so. Use it for a rule the browser cannot check by itself; native validity is already handled without it.',
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
