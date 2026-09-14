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
    hint: {
      title: 'Hint',
      text: '<code>label</code> writes the text beside the switch, and the default slot replaces it. <code>hint</code> adds a caption underneath, tied to the switch through <code>aria-describedby</code>, which is where a setting says what turning it on does.',
    },
    readonly: {
      title: 'Read-only',
      text: '<code>readonly</code> shows the setting without letting it change: a click or the Space key is cancelled. The switch stays focusable, is submitted with its form and is announced as read-only.',
    },
  },

  api: {
    VSwitch: {
      props: {
        label: 'The text beside the switch, which names it. The default slot replaces it.',
        hint: 'A line of help under the label. It is tied to the switch for assistive technology, so it is read out after the label rather than as part of it.',
        readonly:
          'Shows the setting without allowing it to be changed. The switch can still be focused, is announced as read-only and is still submitted with its form; a click or the Space key simply changes nothing.',
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
          "The label, when it needs more than the <code>label</code> prop's text, a link or a piece of emphasis. It sits inside the <code>&lt;label&gt;</code>, so clicking the words toggles the switch.",
      },
    },
  },
}
