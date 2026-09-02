export default {
  title: 'Chip',
  lead: 'A small piece of information: a status, a tag, a filter that stays chosen. It shares its variant and tone table verbatim with VButton, and adds the two states a button does not have.',

  api: {
    VChip: {
      props: {
        variant:
          'How strongly the chip is painted: a tinted background, the full colour, or a border alone.',
        tone: 'What the chip means, expressed as a colour. A chip may report a state where a button may not, which is why it offers five rather than three.',
        color:
          'A colour of your own, as hex, a CSS name or <code>oklch()</code>, which replaces the tone. Every shade it needs is derived from that one colour, so it follows both themes with nothing to rebuild. Only the contrast of the text on a fully coloured chip is yours to check.',
        shape: 'The silhouette: softly rounded corners, or a full pill.',
        size: 'The height of the chip.',
        compact:
          'Takes 4px off the height, leaving the padding, the text and the icons as they are.',
        clickable: 'Makes the chip a button that reacts to clicks, without holding a state.',
        href: 'Where the chip leads, which makes it a link.',
        selectable:
          'Makes the chip something that stays chosen. It takes precedence over <code>href</code> and <code>clickable</code>.',
        check:
          'Shows a tick before the label while the chip is selected. It replaces whatever start icon was given, so the two are never shown together.',
        iconStart: 'An icon before the label. The <code>#start</code> slot replaces it.',
        iconEnd: 'An icon after the label. The <code>#end</code> slot replaces it.',
        dismissible:
          'Adds a button that asks for the chip to be removed. It only emits that request: taking the chip away is your decision.',
        dismissIcon: 'The icon of that removal button.',
        dismissLabel:
          'What the removal button does, in words. It falls back to the design system dictionary.',
        disabled: 'Makes the chip unusable, greyed out through the colour tokens.',
        vModelSelected:
          'Whether the chip is selected, which is also what makes it selectable at all: binding it turns the chip into a toggle button and takes precedence over <code>href</code> and <code>clickable</code>.',
      },
      events: {
        dismiss:
          'The removal button was pressed. The chip is still on screen: removing it is yours to do.',
      },
      slots: {
        default: 'The label. It may be left out entirely, which gives a chip made of icons alone.',
        start: 'Content before the label, which takes the place of <code>iconStart</code>.',
        end: 'Content after the label, which takes the place of <code>iconEnd</code>.',
      },
    },
  },
}
