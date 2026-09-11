export default {
  title: 'Spinner',
  lead: 'A turning ring that says something is happening. It occupies an icon box and paints an icon amount of ink, so it drops into a button or a line of text in place of a glyph.',

  examples: {
    sizes: {
      title: 'Sizes',
      text: 'Left alone the box measures 1em, so the spinner follows the text around it: a container that sets a font size sizes it without being told anything, which is how it stays proportionate inside a button whatever that button\u2019s size. <code>size</code> is a number of pixels for the cases that need one, and what it names is the BOX the spinner occupies rather than the diameter of the ring, which is drawn a little smaller inside it.',
    },
    colour: {
      title: 'Colour',
      text: 'There is no colour prop. The ring is painted in <code>currentcolor</code>, so it takes the colour of the text it sits in: set <code>color</code> on the spinner or on anything above it and the ring follows, which is also what makes it come out right on a solid button with no one having to say so.',
    },
    icon: {
      title: 'In place of an icon',
      text: 'A spinner almost always stands in for an icon, so it is built to the same measurements: the box is an icon\u2019s box, and the ink inside it spans the same fraction of that box as a Material Symbols glyph does. A VIcon and a VSpinner given the same size are therefore interchangeable, box for box, and swapping one for the other shifts nothing on the line. It is also what lets a control draw its own: VButton, VInput, VTextarea and VCombobox set the icon size and get a spinner the size of the glyph it replaces, with no ratio of their own to keep in step.',
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
