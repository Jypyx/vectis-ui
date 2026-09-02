export default {
  title: 'Button',
  lead: 'The button that triggers an action, and the reference from which the tone and variant tables of every other coloured component are taken. It renders a native <code>&lt;button&gt;</code>, or an <code>&lt;a&gt;</code> as soon as it is given an <code>href</code>.',

  api: {
    VButton: {
      props: {
        variant:
          'How much visual weight the action carries: <code>solid</code> is filled with the tone, <code>soft</code> uses a tinted background, <code>outline</code> keeps only a border, and <code>ghost</code> shows nothing until it is hovered.',
        tone: 'What the action means: <code>accent</code> for the ordinary one, <code>neutral</code> for a secondary one, <code>danger</code> for one that destroys something. On a button a tone is an intention, which is why states such as success or warning are not offered here.',
        elevated:
          'Raises the button off the page with the shadow scale, whatever the variant. A ghost or outline button also gains a raised surface, because in the dark theme a shadow lying on the page background has nothing casting it.',
        size: 'The height of the button, taken from the size scale shared by every control: 24, 32, 40, 48 and 56 pixels.',
        compact:
          'Takes 4px off the height, leaving the padding, the text and the icons as they are.',
        href: 'Turns the button into an <code>&lt;a&gt;</code> pointing at this address. A disabled or loading link becomes inert: the address is dropped, so it can be neither focused nor followed.',
        type: 'The native type of the button. It is ignored as soon as <code>href</code> makes it a link.',
        disabled:
          'Makes the button unusable: it stops responding, leaves the tab order and greys out through the colour tokens rather than through opacity.',
        loading:
          'Shows a spinner, disables the button and announces it as busy. The spinner takes the place of the start icon, so the two are never shown side by side.',
        iconStart: 'An icon before the label. The <code>#start</code> slot replaces it.',
        iconEnd: 'An icon after the label. The <code>#end</code> slot replaces it.',
        iconFilled:
          "Renders both icons in their filled form, the font's <code>FILL</code> axis. It has no effect on the <code>#start</code> and <code>#end</code> slots, whose icons you build yourself.",
      },
      slots: {
        default: 'The label of the button.',
        start:
          'Content placed before the label, usually an icon. Mark it <code>aria-hidden</code> when it only repeats what the label already says.',
        end: 'Content placed after the label.',
      },
    },
  },
}
