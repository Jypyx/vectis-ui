export default {
  title: 'Snackbar',
  lead: 'Call <code>snackbar()</code> to confirm an action through <code>VSnackbar</code>, with an optional follow-up button. A new message replaces the previous one.',
  examples: {
    tones: {
      title: 'Tones',
      text: 'Choose neutral or danger tone. Both use solid styling.',
    },
    withoutAction: {
      title: 'Without an action',
      text: 'Without an action, no button appears. Running an action dismisses the bar.',
    },
    icon: {
      title: 'With an icon',
      text: '<code>icon</code> adds an optional icon. The tone provides none by default.',
    },
    placements: {
      title: 'Placements',
      text: 'Choose bottom start, centre or end. Set the default on <code>VSnackbar</code> or override it per message.',
    },
    replacement: {
      title: 'One at a time',
      text: 'A new message replaces the visible one and restarts its timer.',
    },
    autoDismiss: {
      title: 'How long it stays',
      text: '<code>duration</code> sets the lifetime in milliseconds. The timer pauses while the pointer or keyboard focus is inside the bar.',
    },
    persistent: {
      title: 'Keeping it until it is taken away',
      text: '<code>duration: 0</code> keeps the bar open. Use the ID returned by <code>snackbar()</code> with <code>dismissSnackbar()</code> to close it.',
    },
  },
  api: {
    VSnackbar: {
      props: {
        placement: 'Default position along the bottom edge.',
        duration: 'Default lifetime in milliseconds. 0 disables automatic dismissal.',
        actionText: 'Default action text and accessible name. Defaults to the dictionary.',
        label: 'Accessible snackbar region name. Defaults to the dictionary.',
      },
    },
  },
}
