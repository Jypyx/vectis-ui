export default {
  title: 'Spinner',
  lead: 'A turning ring that says something is happening. It occupies an icon box and paints an icon amount of ink, so it drops into a button or a line of text in place of a glyph.',

  examples: {
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> is a number of pixels, and it names the box the spinner occupies rather than the diameter of the ring. Left out, the box measures 1em and follows the text around it.',
    },
    colour: {
      title: 'Colour',
      text: 'There is no colour prop: the ring is painted in <code>currentcolor</code>, so it takes the colour of the text it sits in.',
    },
    icon: {
      title: 'In place of an icon',
      text: "The box is an icon's box, so a VIcon and a VSpinner given the same size are interchangeable. That is what lets VButton, VInput, VTextarea and VCombobox draw one at the size of the glyph it replaces.",
    },
  },

  api: {
    VSpinner: {
      props: {
        size: "A size in pixels, understood exactly as VIcon's: it is the box the spinner occupies, not the diameter of the ring, which is drawn slightly smaller inside it. Left out, the box measures 1em and follows the size of the text around it, which is how the spinner stays proportionate inside a button without being told anything.",
        label:
          'What screen readers announce while it turns. It falls back to the design system dictionary, in the current language.',
      },
    },
  },
}
