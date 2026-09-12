export default {
  title: 'Snackbar',
  lead: 'The confirmation of an action just taken, with one button to take it back. Only the last one is worth offering, so a new bar replaces the one showing rather than stacking under it.',

  examples: {
    tones: {
      title: 'Tones',
      text: '<code>tone</code> offers two values and no more: a confirmation says either that something worked or that it did not. Both are painted solid.',
    },
    withoutAction: {
      title: 'Without an action',
      text: 'Leave the action out and the bar carries no button at all. When there is one, running it always takes the bar away.',
    },
    icon: {
      title: 'With an icon',
      text: '<code>icon</code> is opt-in, and none is deduced from the tone.',
    },
    placements: {
      title: 'Placements',
      text: "<code>placement</code> puts the bar along the bottom edge, to the start, the centre or the end. Set on the VSnackbar it is the default for every bar; passed when one is raised it is that bar's alone.",
    },
    replacement: {
      title: 'One at a time',
      text: 'There is at most one bar: raising a second replaces the first on the spot, countdown restarted.',
    },
    autoDismiss: {
      title: 'How long it stays',
      text: '<code>duration</code> is how long the bar stays, four seconds by default. The countdown holds while the pointer rests on the bar and while the keyboard is inside it, and is released only when both are gone.',
    },
    persistent: {
      title: 'Keeping it until it is taken away',
      text: 'A <code>duration</code> of 0 disarms the countdown, so the bar stays until something replaces it or takes it away. <code>snackbar</code> hands back an id, and <code>dismissSnackbar</code> takes that bar away.',
    },
  },

  api: {
    VSnackbar: {
      props: {
        placement:
          'Which end of the bottom edge confirmations appear at, unless one of them asks for another.',
        duration:
          'How long a confirmation stays, in milliseconds, unless it asks for something else. A confirmation given 0 stays until it is replaced or taken away by hand.',
        actionLabel:
          'What the single action is called, when the confirmation does not name it. It falls back to the design system dictionary.',
        label:
          'What screen readers announce for the confirmation area itself, which is a landmark of the page. It falls back to the design system dictionary.',
      },
    },
  },
}
