export default {
  title: 'Popover',
  lead: 'The plumbing every floating panel in the library is built on: the native popover element, its anchoring and its open state. It carries no role, no keyboard and no dismissal policy of its own, which stay with whatever uses it.',

  api: {
    VPopover: {
      props: {
        id: 'The id of the panel, which the trigger points at. One is generated when none is given, so this is only needed to tie the panel to something outside the component.',
        placement:
          'Where the panel is placed relative to its trigger. The browser flips it to the opposite side by itself when there is not enough room.',
        mode: 'How the panel closes. <code>auto</code> lets the browser dismiss it on a click outside or on Escape, and stack it with other panels; <code>manual</code> leaves everything to you, which is what a panel with its own focus and dismissal rules needs.',
        anchor:
          "The name of an anchor you have set on your own control, written as a CSS dashed identifier such as <code>--tooltip-anchor</code>. Supplying it replaces the internal wrapper, which is the required route as soon as the trigger is a text input, where the browser's own <code>popovertarget</code> attribute is not allowed.",
        surface:
          'Gives the panel the look of a surface: background, border, shadow and rounded corners. Turn it off for a panel that brings its own, as VDatePicker does.',
        vModelOpen:
          "Whether the panel is showing. It starts closed and is bidirectional, fed from the DOM: in <code>auto</code> mode the browser's own light dismiss writes back to it. Setting it opens and closes the panel; when the change has to be synchronous, use the exposed <code>show</code> and <code>hide</code> instead, which is what VTooltip and the pickers do.",
      },
      slots: {
        trigger:
          'The element that opens the panel. Bind the <code>triggerProps</code> it receives onto a button of your own: that is what wires the two together.',
        default: 'What the panel contains.',
      },
    },
  },
}
