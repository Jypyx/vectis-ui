export default {
  title: 'Switch',
  lead: 'A setting that takes effect immediately. It is announced with <code>role="switch"</code>, so a screen reader says on or off rather than ticked, and that is the whole reason it is not a checkbox.',

  examples: {
    labelPosition: {
      title: 'Label position',
      text: 'The label sits after the switch by default. <code>labelPosition</code> moves it before, which is what a row of settings usually wants: the words on one side, the control on the other. The whole component is a single <code>&lt;label&gt;</code>, so the text flicks the switch either way, and the hidden input is out of the flow, so reversing the row only ever swaps the track and the words.',
    },
    spread: {
      title: 'Spread',
      text: 'A settings panel puts the wording at one end of the line and the control at the other, so a column of switches lines up down one edge whatever the length of each label. <code>spread</code> is what does that: the row takes the full width it is offered and pushes the two apart, which leaves the distance to the container. <code>labelPosition</code> still decides which end each of them goes to.',
    },
    disabled: {
      title: 'Disabled',
      text: 'A disabled switch cannot be flicked and the keyboard steps over it, on as well as off: the state stays readable, since what a setting is currently worth matters even when it cannot be changed. It greys out through the colour tokens rather than through an opacity, so the label keeps its contrast on any surface. Reach for it when a setting exists but is not available yet; one that never applies is better left out of the panel.',
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
