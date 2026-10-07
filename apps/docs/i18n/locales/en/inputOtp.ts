export default {
  title: 'Input OTP',
  lead: '<code>VInputOTP</code> edits a code one character per box. Its <code>v-model</code> contains the characters without separators.',
  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: '<code>label</code> displays a label above the boxes and names the group. <code>hint</code> displays help below them.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets box dimensions. <code>compact</code> reduces them without changing text or icons.',
    },
    length: {
      title: 'Length',
      text: '<code>length</code> sets the box count. A <code>pattern</code> containing <code>#</code> takes precedence.',
    },
    formats: {
      title: 'Formats',
      text: '<code>format</code> accepts numeric, alphabetic or alphanumeric input. Letters are converted to uppercase.',
    },
    pattern: {
      title: 'Pattern',
      text: 'Each <code>#</code> creates a box. Other characters are displayed separators excluded from the value.',
    },
    separators: {
      title: 'Separators',
      text: '<code>separatorIcon</code> replaces every literal in the pattern. Use it when separators contain no meaningful text.',
    },
    pasting: {
      title: 'Pasting and autofill',
      text: 'Paste a full code into any box. The first box uses <code>autocomplete="one-time-code"</code> for autofill.',
    },
    reading: {
      title: 'Reading the code',
      text: 'Characters fill consecutive boxes. Deleting a character shifts following characters left. <code>complete</code> emits the completed code when it changes.',
    },
    form: {
      title: 'In a form',
      text: 'Pass <code>name</code>, <code>form</code> and <code>required</code> for native form handling. Partial codes fail validation; an empty code is allowed without <code>required</code>.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> prevents interaction. <code>readonly</code> preserves focus and copying. <code>invalid</code> marks the code as rejected.',
    },
  },
  api: {
    VInputOTP: {
      props: {
        length: 'Box count, overridden by a <code>pattern</code> containing <code>#</code>.',
        format: 'Allowed characters: digits, uppercase letters or both. Filters typing and paste.',
        pattern:
          'Code layout. <code>#</code> creates a box; other characters are displayed literals. Without <code>#</code>, falls back to <code>length</code>.',
        separatorIcon: 'Icon replacing every pattern literal, including any text prefix.',
        size: 'Box size.',
        compact: 'Reduces box dimensions without changing text or icons.',
        disabled: 'Disables interaction.',
        readonly: 'Prevents user changes while keeping the field focusable.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        label:
          'Label above the boxes, linked through <code>aria-labelledby</code>. Without it, the group is named by <code>aria-label</code> or the library dictionary.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code>, is linked through <code>aria-describedby</code> and is announced when it appears.',
        hint: 'Help text linked through <code>aria-describedby</code>.',
        vModel: 'Code string without separators. Defaults to an empty string.',
      },
      events: {
        complete: 'Emits a changed, complete code. Re-entering the same code does not emit again.',
      },
    },
  },
}
