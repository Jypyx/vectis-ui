export default {
  title: 'Chip',
  lead: 'A small piece of information: a status, a tag, a filter that stays chosen. It shares its variant and tone table verbatim with VButton, and adds the two states a button does not have.',

  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: '<code>variant</code> offers three ways of painting the chip, <code>soft</code>, <code>solid</code> and <code>outline</code>, and <code>tone</code> five meanings.',
    },
    shapes: {
      title: 'Shapes',
      text: '<code>shape</code> chooses the silhouette: <code>chip</code> takes the corner radius of an interactive control, <code>pill</code> rounds the ends completely.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the height to 24 or 32 pixels, and <code>compact</code> takes 4px off it.',
    },
    customColors: {
      title: 'Custom colours',
      text: '<code>color</code> replaces the tone, every shade the chip needs being derived from it. It takes any CSS colour.',
    },
    icons: {
      title: 'With icons',
      text: '<code>iconStart</code> and <code>iconEnd</code> place an icon on either side of the label, and the <code>#start</code> and <code>#end</code> slots replace them. A chip with no label becomes square and has to be given a name.',
    },
    clickable: {
      title: 'Clickable and links',
      text: '<code>clickable</code> renders the chip as a button and <code>href</code> as a link. Given neither, it is plain text.',
    },
    selection: {
      title: 'Selection',
      text: '<code>selectable</code> turns the chip into a toggle bound to <code>v-model:selected</code>. <code>check</code> adds a tick before the label, in place of the start icon.',
    },
    dismissible: {
      title: 'Dismissible',
      text: '<code>dismissible</code> adds a second button that emits <code>dismiss</code>, taking the chip out of the list being yours to decide. <code>dismissIcon</code> and <code>dismissLabel</code> change its glyph and its words.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> greys the chip out through the colour tokens. A disabled link has its address dropped, which leaves it neither focusable nor followable.',
    },
  },

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
