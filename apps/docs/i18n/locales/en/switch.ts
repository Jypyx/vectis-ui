export default {
  title: 'Switch',
  lead: 'A setting that takes effect immediately. It is announced with <code>role="switch"</code>, so a screen reader says on or off rather than ticked — which is the whole reason it is not a checkbox.',

  choiceHeading: 'Switch, or checkbox',
  choiceBody:
    'A switch acts at once; a checkbox states an intention that a submit will carry out. If the change needs a Save button, it is a checkbox.',
  spread:
    '<code>spread</code> pushes the label and the switch to opposite ends — the usual shape for a settings list, where the switches then line up down one edge.',
  labelSlot:
    'The label is the DEFAULT SLOT rather than a prop, which is what lets it hold a link or a piece of emphasis; it sits inside the wrapping <code>&lt;label&gt;</code>, so clicking the words toggles the switch.',

  builtHeading: 'How it is built',
  built: [
    'A real <code>&lt;input type="checkbox"&gt;</code>, hidden with <code>opacity</code> and never with <code>display: none</code>, which would take the input out of the tab order and out of the form.',
    'The thumb carries <code>shadow-xs</code> — the only shadow in the forms group.',
    'The track is 40 × 20px from the control table, and there is deliberately no <code>size</code> prop: a switch is a fixed piece of chrome, not a control on the scale.',
    'Disabled greys out through the colour tokens rather than through opacity, so it stays legible on any surface.',
  ],

  apiHeading: 'API',
  apiSpread: '<code>boolean</code> — label and switch to opposite ends',
  apiBody:
    'The label is the <code>#default</code> slot. <code>name</code>, <code>required</code>, <code>value</code> and every other attribute fall through onto the hidden input, so the switch submits with the form like any checkbox.',
}
