export default {
  title: 'Toast',
  lead: 'Notifications raised from anywhere in the code by calling <code>toast()</code>, and shown by a single VToaster mounted once. Several may stack, each with its own countdown.',

  examples: {
    variants: {
      title: 'Variants and tones',
      text: 'The tone says what the notification means, and it also decides which icon it takes when none is given. There are five, against a snackbar\u2019s two, and the difference is the subject: a notification reports a STATE, and success and warning are states. The variant is how strongly that tone is painted, a tinted background with a border or the full colour. Solid reads from further away and is worth reserving for what must not be missed, since a page of solid notifications has nothing left to raise its voice with.',
    },
    contents: {
      title: 'Title and message',
      text: 'The message is the whole of it, and one sentence is usually enough. A title frames it when the message alone would not say what it is about, a failure naming the file it happened to, and it is a heading rather than a first sentence: a few words, no full stop. A notification arrives unannounced and interrupts, so it is read in one glance or not at all.',
    },
    icons: {
      title: 'Icons',
      text: 'Left out, the icon comes from the tone. That default is the right one most of the time: a notification is scanned before it is read, and the glyph is what carries the meaning at a glance. Name one and it replaces the tone\u2019s, for a notification whose subject is more specific than its meaning. Passing <code>false</code> removes it altogether, which is not the same as leaving it out.',
    },
    width: {
      title: 'Width',
      text: 'Left alone the card sits between a floor and a ceiling of its own, so a short message is not a sliver and a long one does not stretch across the page. Any CSS length replaces both. It is never allowed past the width of the viewport, margins included, so a value too large for a phone is ignored there rather than pushing the card off the screen.',
    },
    placements: {
      title: 'Placements',
      text: 'Six corners, each with a stack of its own, so notifications aimed at different ones never queue behind each other. The six containers exist at all times and cost nothing while they are empty. Set on the VToaster the placement is the default for every notification; passed when one is raised it is that one\u2019s alone.',
    },
    stacking: {
      title: 'Stacking',
      text: 'Notifications stack rather than replace one another, because two states can be true at the same time: a finished backup and a failed send are both worth reading. Each keeps a countdown of its own, so they go away as their own clocks run out rather than in the order they arrived. That is the whole difference from a snackbar, which confirms an action rather than reporting a state, and where only the last one is worth showing.',
    },
    autoDismiss: {
      title: 'How long it stays',
      text: 'Five seconds by default, and every notification may ask for its own. The countdown holds while the pointer rests anywhere on the stack, released when it leaves, so something that disappears on a clock can always be read to the end. Weigh the duration against the length of the message rather than setting one number everywhere: a title and two lines take longer to read than "Saved".',
    },
    persistent: {
      title: 'Persistent notifications',
      text: 'A duration of 0 disarms the countdown and the notification stays until it is dismissed. Reserve it for something the reader has to see, a failure they can act on or a state that is still going, and leave the close cross on so there is a way out.',
    },
    dismissing: {
      title: 'Dismissing',
      text: 'The close cross is on by default, and turning it off only makes sense on a notification that goes away on its own: with no countdown and no cross, nothing but code can remove it. <code>toast</code> hands back an id, and <code>dismissToast</code> takes that one away, which is what a notification reporting something still under way needs when it finishes. Called with no argument it clears every notification at once.',
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
