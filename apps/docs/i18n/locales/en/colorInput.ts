export default {
  title: 'Colour input',
  lead: '<code>VColorInput</code> is a form field holding a colour. It can be typed in any format, and the swatch at its start opens <code>VColorPicker</code> in a panel.',
  examples: {
    formats: {
      title: 'Formats',
      text: 'The field accepts hex, <code>rgb()</code>, <code>hsl()</code> and <code>oklch()</code>. Enter or leaving the field rewrites the colour in <code>format</code>; anything else puts the field back as it was.',
    },
    alphaAndSwatches: {
      title: 'Opacity and swatches',
      text: '<code>alpha</code> and <code>swatches</code> are passed to the picker. The swatch in the field shows the opacity over a checkerboard.',
    },
    clearable: {
      title: 'Clearable',
      text: '<code>clearable</code> adds a cross that sets the value to <code>null</code>.',
    },
    validation: {
      title: 'Validation',
      text: 'VColorInput follows the field model: <code>error</code> replaces the hint and is announced. Attributes such as <code>name</code> and <code>required</code> go to the text field.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the height of the field to 32, 40 or 48 pixels.',
    },
    states: {
      title: 'Read-only and disabled',
      text: '<code>readonly</code> shows the colour without a picker. <code>disabled</code> blocks the field and the swatch.',
    },
  },
  api: {
    VColorInput: {
      props: {
        required: 'Adds an asterisk after the label and passes <code>required</code> to the field.',
        hideLabel: 'Hides the label visually while keeping it as the accessible name.',
        labelPosition: 'Places the label above the field or beside it.',
        format: 'How the value is written. The field accepts all four formats.',
        alpha: 'Adds an opacity track to the picker and writes the alpha below 1.',
        swatches: 'Preset colours offered in the picker.',
        hideEyeDropper: 'Hides the picker eyedropper button.',
        label:
          'Visible label. Without a visible name, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
        hint: 'Help text linked through <code>aria-describedby</code>.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code> and is announced when it appears.',
        placeholder: 'Placeholder shown when the field is empty.',
        size: 'Component size.',
        compact: 'Reduces the control height without changing text or icons.',
        disabled: 'Disables interaction.',
        readonly: 'Prevents typing and removes the picker. The field remains focusable.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        clearable: 'Adds a button that empties the value.',
        clearLabel: 'Accessible name of the clear button. Defaults to the library dictionary.',
        pickerLabel:
          'Accessible name of the swatch button that opens the picker. Defaults to the library dictionary.',
        placement: 'Preferred panel position relative to the field.',
        vModel:
          'Colour written in <code>format</code>, or <code>null</code> when the field is empty. Typed text updates it when the reader presses Enter or leaves the field.',
      },
      events: {
        clear: 'The value was cleared; the model is already reset.',
      },
      slots: {
        valueEnd: 'Content before the clear button.',
      },
    },
  },
}
