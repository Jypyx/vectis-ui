export default {
  title: 'Hover card',
  lead: '<code>VHoverCard</code> previews what a link leads to, such as a profile behind a mention, when the pointer or the keyboard focus rests on it. Its content may be interactive.',
  examples: {
    inText: {
      title: 'In running text',
      text: 'The trigger flows with the sentence. The card content mounts on first opening, so a trigger inside a paragraph still renders valid HTML on the server.',
    },
    delays: {
      title: 'Delays',
      text: '<code>openDelay</code> sets how long the trigger must be hovered or focused before the card opens. <code>closeDelay</code> keeps it while the pointer crosses the gap to the card.',
    },
    interactiveContent: {
      title: 'Interactive content',
      text: 'Keyboard focus opens the card after the delay and Tab moves into it. Escape closes it from anywhere and returns the focus to the trigger. Taps open nothing, so keep the same information at the trigger’s destination.',
    },
    loadOnOpen: {
      title: 'Loading on open',
      text: '<code>v-model:open</code> reports every opening, which is the moment to fetch the card’s data. Setting it opens or closes the card without delay.',
    },
  },
  api: {
    VHoverCard: {
      props: {
        placement: 'Preferred position; flips when space is insufficient.',
        openDelay: 'Hover or keyboard focus wait before opening, in milliseconds.',
        closeDelay:
          'Wait before closing once the pointer has left the trigger and the card, in milliseconds.',
        vModelOpen: 'Open state. Changes apply without delay.',
      },
      slots: {
        default:
          'Trigger, usually a link. Bind the supplied <code>triggerProps</code> to set <code>aria-details</code>.',
        content: 'Card content, mounted on first opening. May contain links and buttons.',
      },
    },
  },
}
