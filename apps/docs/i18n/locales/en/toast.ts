export default {
  title: 'Toast',
  lead: 'Call <code>toast()</code> to display notifications through a single mounted <code>VToaster</code>. Notifications stack and dismiss independently.',
  examples: {
    variants: {
      title: 'Variants and tones',
      text: '<code>tone</code> sets the colour and default icon. <code>variant</code> selects soft or solid styling.',
    },
    contents: {
      title: 'Title and message',
      text: '<code>message</code> is the notification text. Add an optional <code>title</code>.',
    },
    icons: {
      title: 'Icons',
      text: 'Override the tone’s default <code>icon</code>, or set it to <code>false</code> to hide it.',
    },
    width: {
      title: 'Width',
      text: '<code>width</code> sets the card width within the viewport.',
    },
    placements: {
      title: 'Placements',
      text: 'Set the default <code>placement</code> on <code>VToaster</code> or override it per notification.',
    },
    stacking: {
      title: 'Stacking',
      text: 'Each notification keeps its own dismissal timer.',
    },
    autoDismiss: {
      title: 'How long it stays',
      text: '<code>duration</code> sets the lifetime in milliseconds. Timers pause while the pointer or keyboard focus is inside the stack.',
    },
    persistent: {
      title: 'Persistent notifications',
      text: '<code>duration: 0</code> keeps a notification open. Keep a close button or provide another dismissal action.',
    },
    dismissing: {
      title: 'Dismissing',
      text: '<code>toast()</code> returns an ID. Pass it to <code>dismissToast()</code> to close that notification, or omit it to close all. <code>hideClose</code> hides the close button.',
    },
  },
  api: {
    VToaster: {
      props: {
        placement: 'Default notification position.',
        duration: 'Default lifetime in milliseconds. 0 disables automatic dismissal.',
        closeLabel: 'Accessible close button name. Defaults to the dictionary.',
        label: 'Accessible notification region name. Defaults to the dictionary.',
      },
    },
  },
}
