export default {
  title: 'Popover',
  lead: 'The plumbing every floating panel in the library is built on: the native popover element, its anchoring and its open state. It carries no role, no keyboard and no dismissal policy of its own, which stay with whatever uses it.',

  examples: {
    placements: {
      title: 'Placements',
      text: '<code>placement</code> offers twelve positions relative to the trigger, on either axis and aligned to either edge. It names a preference: the browser flips the panel to the opposite side when there is not enough room.',
    },
    interactiveContent: {
      title: 'Interactive content',
      text: 'A panel can hold real controls: light dismiss only fires on a click outside, and the focus is not trapped. The component provides no role, no keyboard and no dismissal policy.',
    },
    modes: {
      title: 'Modes',
      text: '<code>mode</code> set to <code>auto</code> hands the dismissal to the browser, where <code>manual</code> hands it back to you and means the panel has to offer a way out. <code>v-model:open</code> is fed from the DOM, and the exposed <code>show</code> and <code>close</code> are the route when the opening has to be synchronous.',
    },
    matchTrigger: {
      title: 'Match trigger',
      text: '<code>matchTrigger</code> stops the panel being narrower than whatever it is anchored to. It is a floor and not a clamp: content needing more room still gets it.',
    },
    anchor: {
      title: 'Anchoring to your own element',
      text: "<code>anchor</code> takes the name of an anchor you have set yourself, VPopover then rendering no wrapper of its own. It is the required route as soon as the trigger is a text input. Put the name on the element the panel should sit under, the field's own box rather than a wrapper that also holds a label, and confine it from an enclosing element.",
    },
  },

  api: {
    VPopover: {
      props: {
        id: 'The id of the panel, which the trigger points at. One is generated when none is given, so this is only needed to tie the panel to something outside the component.',
        placement:
          'Where the panel is placed relative to its trigger. The browser flips it to the opposite side by itself when there is not enough room.',
        mode: 'How the panel closes. <code>auto</code> lets the browser dismiss it on a click outside or on Escape, and stack it with other panels; <code>manual</code> leaves everything to you, which is what a panel with its own focus and dismissal rules needs.',
        anchor:
          "The name of an anchor you have set on your own control, written as a CSS dashed identifier such as <code>--tooltip-anchor</code>. Supplying it replaces the internal wrapper, which is the required route as soon as the trigger is a text input, where the browser's own <code>popovertarget</code> attribute is not allowed.",
        bare: "Strips the panel of the design system's surface: no background, no border, no shadow and no rounded corners. It is what a panel whose content brings its own asks for, as VDatePicker does.",
        matchTrigger:
          'Stops the panel being narrower than whatever it is anchored to. It is a floor, so a panel with a width of its own still grows past it rather than being clamped to the trigger, which is what a list of long labels under a short field wants.',
        vModelOpen:
          "Whether the panel is showing. It starts closed and is bidirectional, fed from the DOM: in <code>auto</code> mode the browser's own light dismiss writes back to it. Setting it opens and closes the panel; when the change has to be synchronous, use the exposed <code>show</code> and <code>close</code> instead, which is what VTooltip and the pickers do.",
      },
      slots: {
        trigger:
          'The element that opens the panel. Bind the <code>triggerProps</code> it receives onto a button of your own: that is what wires the two together.',
        default: 'What the panel contains.',
      },
    },
  },
}
