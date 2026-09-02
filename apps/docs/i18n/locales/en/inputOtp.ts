export default {
  title: 'Input OTP',
  lead: 'A code typed one character to a box: a one-time password, a licence key, a reference. Pasting fills the whole row, and the value is the characters alone, never the separators.',

  api: {
    VInputOTP: {
      props: {
        length:
          'How many boxes the code has. It is ignored as soon as a <code>pattern</code> is given.',
        format:
          'Which characters the code is made of. It filters what can be typed or pasted, and decides which keyboard a phone offers.',
        pattern:
          "The shape of the code: each <code>#</code> is a box to fill, and every other character is a separator shown between the boxes without ever being part of the value, <code>'GT-###'</code> or <code>'###.###.###'</code>. It wins over <code>length</code>.",
        separatorIcon:
          "An icon drawn in place of every separator of the pattern. It suits a template whose separators are purely decorative, <code>'###-###'</code>, and not one carrying meaningful text such as <code>'GT-###'</code>, which the icon would erase.",
        size: 'The size of the boxes: 32, 40 or 48 pixels.',
        compact: 'Takes 4px off the boxes, leaving the text and the icons as they are.',
        disabled: 'Makes every box unusable, greyed out through the colour tokens.',
        invalid:
          'Marks the code as wrong, which colours the boxes and tells assistive technology so.',
        label:
          'What screen readers announce for the row as a whole. It falls back to the design system dictionary.',
        vModel:
          'The code as one string, without the separators: a <code>GT-###</code> template still yields three characters. It is empty to begin with, and shorter than the full length while it is being typed.',
      },
      events: {
        complete:
          'Every box has been filled, with the finished code. This is the cue to verify it.',
      },
    },
  },
}
