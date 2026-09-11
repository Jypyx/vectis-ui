export default {
  title: 'Popover',
  lead: 'The plumbing every floating panel in the library is built on: the native popover element, its anchoring and its open state. It carries no role, no keyboard and no dismissal policy of its own, which stay with whatever uses it.',

  examples: {
    placements: {
      title: 'Placements',
      text: 'Twelve positions relative to the trigger, on either axis and aligned to either edge. The value names a preference rather than a position: the browser flips the panel to the opposite side by itself when there is not enough room on the one asked for, which is why nothing here needs measuring or a fallback list of your own.',
    },
    interactiveContent: {
      title: 'Interactive content',
      text: 'A panel can hold real controls. Light dismiss only fires on a click OUTSIDE, so everything inside goes on working, and the focus is not trapped, a popover being no dialog: the reader can tab straight out of it, which is what a dismissible panel should do. What the component does NOT provide is a role, a keyboard or a dismissal policy. A panel that behaves like a menu is VMenu, one that describes an element is VTooltip, and one that lists options is VCombobox; this is what all three are built on.',
    },
    modes: {
      title: 'Modes',
      text: '<code>auto</code> hands the dismissal to the browser: a click outside or Escape closes the panel, and several of them stack so one dismissal closes the branch. <code>manual</code> hands it back to you, which is what a panel with focus and dismissal rules of its own needs, and it means the panel has to offer a way out. The open state is a model fed from the DOM, so a panel the browser dismissed reports it rather than leaving you to reset a flag. Setting that model costs a tick; when the opening has to be synchronous, because a focus move or a timer is armed on the assumption the panel is already there, the exposed <code>show</code> and <code>close</code> are the route.',
    },
    matchTrigger: {
      title: 'Match trigger',
      text: 'Stops the panel being narrower than whatever it is anchored to, which is what a short list under a wide button wants. It is a FLOOR and not a clamp: content needing more room still gets it, so a list of long labels under a short field grows past the field rather than being squeezed into its width.',
    },
    anchor: {
      title: 'Anchoring to your own element',
      text: "Given the name of an anchor you have set yourself, VPopover renders no wrapper of its own and positions the panel against whatever carries that name. It is the required route as soon as the trigger is a text input, where the browser's <code>popovertarget</code> attribute is not allowed at all, and it is how the combobox and the two pickers anchor their panels. Two rules come with it. The name goes on the element you want the panel to sit under, the field's own box rather than a wrapper that also holds a label, or the panel opens a label's height away from it. And an enclosing element must CONFINE that name: a shown popover moves to the top layer and is resolved against the whole document, so without the confinement every panel on the page would attach to the last element that named the anchor.",
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
