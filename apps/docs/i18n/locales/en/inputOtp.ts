export default {
  title: 'Input OTP',
  lead: 'A code typed one character to a box: a one-time password, a licence key, a reference. Pasting fills the whole row, and the value is the characters alone, never the separators.',

  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: 'This is the one field in the library whose <code>label</code> renders nothing. It names the row for assistive technology and stops there, because a row of boxes takes its instructions from the page above it, written where they read best and in whatever type that page uses. <code>hint</code> is the text the reader actually sees, tied to the row so it is read out along with the label: where the code was sent, how long it lasts.',
    },
    sizes: {
      title: 'Sizes',
      text: "Three heights, 32, 40 and 48 pixels, each with its <code>compact</code> pair 4px shorter. The character inside is scaled a notch or two above the row's own step, a code being read one glyph at a time rather than as a word, and <code>compact</code> leaves it exactly where it was.",
    },
    length: {
      title: 'Length',
      text: 'How many boxes the code has, six by default. Four suits a PIN, eight a backup code. It is ignored the moment a <code>pattern</code> is given, the pattern already saying how many boxes there are.',
    },
    formats: {
      title: 'Formats',
      text: 'Which characters the code is made of. It filters what can be typed or pasted, and it is also what decides the keyboard a phone offers, a numeric code raising the number pad rather than the full keyboard. Outside a numeric code the value is forced to capitals, whichever case the reader typed, so what reaches your verification has one canonical form.',
    },
    pattern: {
      title: 'Pattern',
      text: 'The shape of the code, written out: every <code>#</code> is a box to fill and every other character is a literal drawn between the boxes. A literal is never typed and never enters the value, so a <code>GT-###</code> template still yields three characters. The pattern wins over <code>length</code>, which is then ignored.',
    },
    separators: {
      title: 'Separators',
      text: 'An icon can replace the literals a pattern draws. It replaces every one of them, so it suits a template whose separators are punctuation and nothing else. Keep it away from a pattern carrying a real prefix such as <code>GT-###</code>, where it would erase the two characters that say what the code is.',
    },
    pasting: {
      title: 'Pasting and autofill',
      text: 'A code pasted anywhere in the row is spread across every box, and the pattern\'s literals are consumed with it: a reference copied in its formatted form, <code>GT-4F2</code>, lands as the three characters it really is rather than being refused. The first box carries <code>autocomplete="one-time-code"</code>, so a code arriving from an SMS or a password manager is spread the same way, and anything the format refuses is dropped rather than stopping the paste.',
    },
    reading: {
      title: 'Reading the code',
      text: 'The value is one string of the characters alone, never the separators, and it is shorter than the row while the code is being typed. <code>complete</code> fires once every box is filled, carrying the finished code: that is the cue to verify it, rather than something to work out by measuring the value against the length yourself.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> puts the whole row out of reach, greyed through the colour tokens. <code>readonly</code> sits between that and nothing: the code is shown and frozen, while the boxes keep the focus and the code can still be selected and copied, which is what a reference someone has to quote elsewhere needs. <code>invalid</code> colours the boxes and tells assistive technology the code was refused.',
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
