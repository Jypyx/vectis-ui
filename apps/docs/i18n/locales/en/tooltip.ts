export default {
  title: 'Tooltip',
  lead: 'A short description of the element under the pointer, or under keyboard focus. It is a description and never a container: nothing inside it can be interacted with.',

  examples: {
    placements: {
      title: 'Placements',
      text: '<code>placement</code> offers eight sides, four of them aligned to an edge of the trigger rather than centred on it. It names a preference: the browser moves the panel when the side asked for has no room.',
    },
    edgeFlipping: {
      title: 'At the edge of the screen',
      text: 'With no room on the side it asked for, the panel takes the opposite one. It is pure CSS, with no measurement and no observer.',
    },
    delay: {
      title: 'Opening and closing',
      text: '<code>delay</code> is how long the pointer has to rest on the trigger before the tooltip appears, 300ms by default, and 0 removes the wait. Keyboard focus opens it at once, Escape closes it without taking the focus away, and pressing the trigger closes it too.',
    },
    describing: {
      title: 'Describing, not naming',
      text: 'The tooltip sets <code>aria-describedby</code> on its trigger, which keeps its own accessible name: an icon button still carries its <code>label</code>. A tap opens nothing, so whatever the tooltip says has to exist somewhere else as well.',
    },
    richContent: {
      title: 'Rich content',
      text: 'The <code>#content</code> slot wins over the <code>text</code> prop when both are given. It has to stay non-interactive: the tooltip closes as soon as the pointer leaves the trigger, and the description is flattened to plain text for a screen reader.',
    },
  },

  api: {
    VTooltip: {
      props: {
        text: 'What the tooltip says. The <code>#content</code> slot replaces it when both are given.',
        placement:
          'Which side of the element the tooltip appears on. The browser flips it to the opposite side by itself when there is not enough room.',
        delay:
          'How long the pointer must rest on the element before the tooltip appears, in milliseconds. Keyboard focus opens it at once, the intent not being in doubt there, and a delay of 0 disables the wait entirely.',
      },
      slots: {
        default:
          'The element the tooltip describes. Bind the <code>triggerProps</code> it receives onto it, which is what ties the two together for assistive technology, and make sure it is something that can take focus, or keyboard users will never see the tooltip.',
        content:
          'Content richer than a plain string: formatting, a keyboard shortcut, an icon. It must stay non-interactive. The tooltip closes as soon as the pointer leaves the element, so a link or a button inside could never be reached, and the description is flattened to plain text for screen readers anyway. Content one can interact with belongs in a panel that stays open, such as VMenu.',
      },
    },
  },
}
