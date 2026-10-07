export default {
  title: 'Tooltip',
  lead: '<code>VTooltip</code> displays a short description on hover or focus. Its content must remain non-interactive.',
  examples: {
    placements: {
      title: 'Placements',
      text: '<code>placement</code> sets the preferred tooltip position.',
    },
    edgeFlipping: {
      title: 'At the edge of the screen',
      text: 'The tooltip moves to the opposite side when space is insufficient.',
    },
    delay: {
      title: 'Opening and closing',
      text: '<code>openDelay</code> sets the hover wait in milliseconds, <code>closeDelay</code> how long the tooltip stays once the pointer leaves. Focus opens immediately; Escape or trigger activation closes without moving focus.',
    },
    describing: {
      title: 'Describing, not naming',
      text: 'The tooltip uses <code>aria-describedby</code>; the trigger still needs its own accessible name. Taps do not open it, so keep essential information available elsewhere.',
    },
    richContent: {
      title: 'Rich content',
      text: '<code>content</code> overrides <code>text</code>. Use formatting or decorative icons, without interactive controls.',
    },
  },
  api: {
    VTooltip: {
      props: {
        text: 'Tooltip description. Replaced by the <code>content</code> slot.',
        placement: 'Preferred position; flips when space is insufficient.',
        openDelay: 'Hover delay in milliseconds; 0 removes the wait. Focus opens immediately.',
        closeDelay:
          'Milliseconds the tooltip stays once the pointer has left the trigger and the tooltip.',
      },
      slots: {
        default: 'Focusable trigger. Bind the supplied <code>triggerProps</code>.',
        content:
          'Non-interactive description replacing <code>text</code>. Assistive technology reads it as plain text.',
      },
    },
  },
}
