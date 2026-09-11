export default {
  title: 'Snackbar',
  lead: 'The confirmation of an action just taken, with one button to take it back. Only the last one is worth offering, so a new bar replaces the one showing rather than stacking under it.',

  examples: {
    tones: {
      title: 'Tones',
      text: 'Two, and deliberately no more: a confirmation says either "done" or "that did not work". Both are painted solid, <code>neutral</code> being the design system\u2019s canonical inversion, dark on a light theme and light on a dark one. Success, warning and the accent are states rather than outcomes, and reporting a state is a notification\u2019s job, so they are not offered here.',
    },
    withoutAction: {
      title: 'Without an action',
      text: 'Leave the action out and the bar carries no button at all: a plain statement of what just happened, which takes itself away on its own. That is the right shape whenever there is nothing to take back, a saved setting or a sent message. When there is, the button is the whole point of the component, and running it always takes the bar away, so nothing has to be dismissed afterwards.',
    },
    icon: {
      title: 'With an icon',
      text: 'Opt-in, and none is deduced from the tone. A confirmation is read rather than scanned, unlike a notification that arrives unannounced, so the words carry it and an icon only ever adds to them.',
    },
    placements: {
      title: 'Placements',
      text: 'Along the bottom edge and nowhere else: a confirmation belongs out of the content\u2019s way and near what the reader was just doing, which is the other reason it is not a notification. Set on the VSnackbar the placement is the default for every bar; passed when one is raised it is that bar\u2019s alone.',
    },
    replacement: {
      title: 'One at a time',
      text: 'There is at most one bar, and raising a second replaces the first on the spot, countdown restarted. Everything else about the component follows from that: no stack to manage, no close cross since a bar that tidies itself must not ask the reader to, and a single value rather than a queue holding it. Two states can be true at once, which is why notifications stack; only the last action a reader took is worth offering to undo.',
    },
    autoDismiss: {
      title: 'How long it stays',
      text: 'Four seconds by default, shorter than a notification\u2019s, because the reader already knows what the bar says: they just did it. The countdown holds while the pointer rests on the bar and while the keyboard is inside it, released only when both are gone, so an action being reached for is never taken away mid-reach. Set the duration on the VSnackbar for every bar, or when raising one for that bar alone.',
    },
    persistent: {
      title: 'Keeping it until it is taken away',
      text: 'A duration of 0 disarms the countdown, and the bar then stays until something replaces it or takes it away. Reserve it for a confirmation the reader has to act on, and give it a way out: <code>snackbar</code> hands back an id, and <code>dismissSnackbar</code> takes that bar away. Passing the id is not a formality, it is checked against the bar actually on screen, so a handler arriving late cannot close the confirmation that has just replaced its own.',
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
