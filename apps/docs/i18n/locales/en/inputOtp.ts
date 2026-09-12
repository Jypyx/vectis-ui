export default {
  title: 'Input OTP',
  lead: 'A code typed one character to a box: a one-time password, a licence key, a reference. Pasting fills the whole row, and the value is the characters alone, never the separators.',

  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: '<code>label</code> renders nothing here: it names the row for assistive technology. <code>hint</code> is the text the reader sees, tied to the row so it is read out along with the label.',
    },
    sizes: {
      title: 'Sizes',
      text: "<code>size</code> sets the height to 32, 40 or 48 pixels, and <code>compact</code> takes 4px off it. The character inside is scaled a notch or two above the row's own step.",
    },
    length: {
      title: 'Length',
      text: '<code>length</code> is how many boxes the code has, six by default. It is ignored the moment a <code>pattern</code> is given.',
    },
    formats: {
      title: 'Formats',
      text: '<code>format</code> decides which characters the code is made of, filtering what can be typed or pasted and choosing the keyboard a phone offers. Outside a numeric code the value is forced to capitals.',
    },
    pattern: {
      title: 'Pattern',
      text: '<code>pattern</code> writes the shape of the code out: every <code>#</code> is a box to fill and every other character a literal drawn between the boxes, never typed and never part of the value. It wins over <code>length</code>.',
    },
    separators: {
      title: 'Separators',
      text: '<code>separatorIcon</code> replaces the literals a pattern draws, every one of them, so it suits a template whose separators are punctuation and nothing else.',
    },
    pasting: {
      title: 'Pasting and autofill',
      text: 'A code pasted anywhere in the row is spread across every box, the pattern\'s literals consumed with it. The first box carries <code>autocomplete="one-time-code"</code>, so a code arriving from an SMS or a password manager is spread the same way.',
    },
    reading: {
      title: 'Reading the code',
      text: 'The value is one string of the characters alone, never the separators. <code>complete</code> fires once every box is filled, carrying the finished code.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> puts the whole row out of reach, greyed through the colour tokens. <code>readonly</code> shows the code frozen while the boxes keep the focus and can be copied from. <code>invalid</code> colours the boxes and tells assistive technology the code was refused.',
    },
  },

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
        readonly:
          'Shows the code without letting it be changed. The boxes keep their focus and the code can still be selected and copied, which is what separates it from <code>disabled</code>.',
        invalid:
          'Marks the code as wrong, which colours the boxes and tells assistive technology so.',
        label:
          'What screen readers announce for the row as a whole. It falls back to the design system dictionary.',
        hint: 'A line of help under the boxes, where the code was sent or how long it lasts. It is tied to the row for assistive technology, so it is read out along with the label. Unlike <code>label</code>, which names the row without rendering anything, this is text the reader sees.',
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
