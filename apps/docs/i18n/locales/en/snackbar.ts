export default {
  title: 'Snackbar',
  lead: 'The confirmation of an action just taken, with one button to take it back. Only the last one is worth offering, so a new bar replaces the one showing rather than stacking under it.',

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
