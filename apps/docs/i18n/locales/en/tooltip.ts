export default {
  title: 'Tooltip',
  lead: 'A short description of the element under the pointer, or under keyboard focus. It is a description and never a container: nothing inside it can be interacted with.',

  examples: {
    placements: {
      title: 'Placements',
      text: 'Eight sides, four of them aligned to an edge of the trigger rather than centred on it, which is what keeps a tooltip from hanging off a wide control. The value names a preference and not a position: the browser moves the panel by itself when the side asked for has no room, so pick the one that reads best where the control usually sits and let the edge cases sort themselves out.',
    },
    edgeFlipping: {
      title: 'At the edge of the screen',
      text: 'With no room on the side it asked for, the panel takes the opposite one. It is pure CSS and costs no JavaScript, no measurement and no observer: the panel names its fallbacks and the browser does the rest. Scroll the buttons below up against the top and the bottom of the window to watch it happen.',
    },
    delay: {
      title: 'Opening and closing',
      text: 'The pointer has to rest on the trigger before the tooltip appears, 300ms by default, so passing over something on the way somewhere else opens nothing. A delay of 0 removes the wait entirely. Keyboard focus opens it at once instead, the intent not being in doubt there, and Escape closes it without taking the focus away. Pressing the trigger closes it too, which is what a button opening a panel needs: the pointer has not left and the focus may not have moved, so the tooltip would otherwise stand over what the click just opened.',
    },
    describing: {
      title: 'Describing, not naming',
      text: 'A tooltip sets <code>aria-describedby</code> on its trigger, and the trigger keeps its own accessible name. An icon button therefore still carries its <code>label</code>, and the tooltip is the visual confirmation of it rather than a replacement. The corollary is the rule to remember: a tap opens nothing, there being no hover on a touch screen and no room for a panel standing over what the tap just opened, so whatever the tooltip says has to exist somewhere else as well. It complements; it never carries anything on its own.',
    },
    richContent: {
      title: 'Rich content',
      text: 'The slot wins over the <code>text</code> prop when both are given, for a description that needs more than one run of text: a heading, a shortcut, an icon. It has to stay non-interactive. The tooltip closes as soon as the pointer leaves the trigger, so a link inside could never be reached, and the description is flattened to plain text for a screen reader anyway. Anything one can act on belongs in a panel that stays open, which is what VPopover and VMenu are for.',
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
