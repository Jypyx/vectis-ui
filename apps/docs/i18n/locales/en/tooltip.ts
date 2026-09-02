export default {
  title: 'Tooltip',
  lead: 'A short description of the element under the pointer, or under keyboard focus. It is a description and never a container: nothing inside it can be interacted with.',

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
