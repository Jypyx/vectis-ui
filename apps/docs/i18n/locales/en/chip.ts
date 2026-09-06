export default {
  title: 'Chip',
  lead: 'A small piece of information: a status, a tag, a filter that stays chosen. It shares its variant and tone table verbatim with VButton, and adds the two states a button does not have.',

  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: 'Three variants across each row, five tones down the column. The variants are the ones every coloured component in the library shares: <code>soft</code> tints the background, <code>solid</code> fills it, <code>outline</code> keeps a border alone. The tones go two further than a button does, because a chip reports a state where a button expresses an intention, and <code>success</code> and <code>warning</code> are states.',
    },
    shapes: {
      title: 'Shapes',
      text: 'Two silhouettes. <code>chip</code>, the default, takes the same corner radius as every interactive control in the library, so it sits in a form beside a button and a field without standing out. <code>pill</code> rounds the ends completely, which reads better where the chips are the content rather than part of a control: a row of tags, a set of filters, a list of categories.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Two heights, 24 and 32 pixels, the bottom of the scale every control in the library shares. The second row is the same pair under <code>compact</code>: 4px come off the height and nothing else moves, so a chip goes on lining up with the text beside it. A field that renders chips of its own, a multiple combobox or a file input, already picks the step one below its own and needs none of this.',
    },
    customColors: {
      title: 'Custom colours',
      text: 'A <code>color</code> replaces the tone. Every shade the chip needs is derived from that one value, so the tinted background, the border, the text and the hover all follow it, in the light theme and in the dark one, with nothing to rebuild. It takes any CSS colour, which is what lets a chip carry a colour that comes from your data: a project, a label, a calendar. The one thing to check yourself is the contrast of the text on a <code>solid</code> chip.',
    },
    icons: {
      title: 'With icons',
      text: '<code>iconStart</code> and <code>iconEnd</code> take the same values as every icon prop in the library, and the <code>#start</code> and <code>#end</code> slots replace them when the content is not an icon at all, a status dot for instance. Leave the label out entirely and the chip becomes square, in which case it has to be given a name: it is an icon with nothing to read.',
    },
    clickable: {
      title: 'Clickable and links',
      text: 'A chip renders the element its job asks for. Given nothing it is plain text, with no hover and nothing to focus. <code>clickable</code> makes it a real button, and <code>href</code> a real link, so the keyboard, the focus ring and the browser context menu all come from the platform rather than from a click handler on a span.',
    },
    selection: {
      title: 'Selection',
      text: '<code>selectable</code> turns the chip into a toggle button bound to <code>v-model:selected</code>, and selecting one paints it as the solid rendering of its tone. That colour change is the whole signal in the first row. Add <code>check</code> and a tick appears before the label as well, which is worth doing wherever the tones are close together or the row is long. The tick replaces the start icon rather than joining it, so the width does not jump as the chip is selected.',
    },
    dismissible: {
      title: 'Dismissible',
      text: '<code>dismissible</code> adds a second button beside the first, never inside it, and pressing it emits <code>dismiss</code>. The chip is still there afterwards: taking it out of the list is the decision below, which is what lets the same event archive something, ask for a confirmation, or offer an undo instead. <code>dismissIcon</code> and <code>dismissLabel</code> change the glyph and the words it announces.',
    },
    states: {
      title: 'States',
      text: 'A disabled chip greys out through the colour tokens rather than through an opacity, so it keeps its contrast on every surface. It applies whatever the chip renders as, and the link is the case worth knowing: HTML has no <code>disabled</code> for a link, so the address is dropped instead, which leaves it neither focusable nor followable rather than merely greyed.',
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
