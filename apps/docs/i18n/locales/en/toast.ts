export default {
  title: 'Toast',
  lead: 'Notifications raised from anywhere in the code by calling <code>toast()</code>, and shown by a single VToaster mounted once. Several may stack, each with its own countdown.',

  examples: {
    variants: {
      title: 'Variants and tones',
      text: '<code>tone</code> says what the notification means, with five values, and decides which icon it takes when none is given. <code>variant</code> is how strongly that tone is painted, tinted or solid.',
    },
    contents: {
      title: 'Title and message',
      text: '<code>message</code> carries the notification, and <code>title</code> frames it in a few words when the message alone would not say what it is about.',
    },
    icons: {
      title: 'Icons',
      text: 'Left out, <code>icon</code> comes from the tone. Naming one replaces it, and passing <code>false</code> removes it altogether.',
    },
    width: {
      title: 'Width',
      text: "<code>width</code> takes any CSS length and replaces the card's own floor and ceiling. It is never allowed past the width of the viewport.",
    },
    placements: {
      title: 'Placements',
      text: "<code>placement</code> puts the notification in one of six corners, each with a stack of its own. Set on the VToaster it is the default for every notification; passed when one is raised it is that one's alone.",
    },
    stacking: {
      title: 'Stacking',
      text: 'Notifications stack rather than replace one another, each keeping a countdown of its own, so they go away as their own clocks run out.',
    },
    autoDismiss: {
      title: 'How long it stays',
      text: '<code>duration</code> is how long a notification stays, five seconds by default, and every one may ask for its own. The countdown holds while the pointer rests anywhere on the stack.',
    },
    persistent: {
      title: 'Persistent notifications',
      text: 'A <code>duration</code> of 0 disarms the countdown and the notification stays until it is dismissed. Leave the close cross on so there is a way out.',
    },
    dismissing: {
      title: 'Dismissing',
      text: '<code>closable</code> set to false takes the close cross away. <code>toast</code> hands back an id and <code>dismissToast</code> takes that notification away, or every one at once when called with no argument.',
    },
  },

  api: {
    VToaster: {
      props: {
        placement: 'Which corner notifications appear in, unless one of them asks for another.',
        duration:
          'How long a notification stays, in milliseconds, unless it asks for something else. A notification given 0 stays until it is dismissed.',
        closeLabel:
          'What the close cross does, in words. It falls back to the design system dictionary.',
        label:
          'What screen readers announce for the notification areas themselves, which are landmarks of the page. It falls back to the design system dictionary.',
      },
    },
  },
}
