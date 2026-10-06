export default {
  title: 'Colour picker',
  lead: '<code>VColorPicker</code> chooses a colour with a saturation and brightness area, a hue track and a text field that accepts hex, <code>rgb()</code>, <code>hsl()</code> and <code>oklch()</code>. Its tracks are native ranges, so assistive technology adjusts each channel on its own.',
  examples: {
    formats: {
      title: 'Formats',
      text: '<code>format</code> decides how the value is written: <code>hex</code>, <code>rgb</code>, <code>hsl</code> or <code>oklch</code>. The menu beside the field changes only what the field shows. The picker works in sRGB and clips an <code>oklch()</code> colour outside it.',
    },
    alpha: {
      title: 'Opacity',
      text: '<code>alpha</code> adds an opacity track. The alpha is written into the value only below 1.',
    },
    swatches: {
      title: 'Swatches',
      text: '<code>swatches</code> offers preset colours as native radios. Give <code>{ color, label }</code> to name a swatch for screen readers.',
    },
  },
  api: {
    VColorPicker: {
      props: {
        format: 'How the value is written. The text field accepts all four formats.',
        alpha: 'Adds an opacity track and writes the alpha below 1.',
        swatches: 'Preset colours: a colour string or <code>{ color, label }</code>.',
        hideInput: 'Hides the text field and its format menu.',
        hideEyeDropper:
          'Hides the eyedropper button, otherwise shown where the browser supports the <code>EyeDropper</code> API.',
        disabled: 'Disables every control.',
        label: 'Accessible name of the picker. Defaults to the library dictionary.',
        name: 'Field name in form submissions, through a hidden input.',
        vModel: 'Colour written in <code>format</code>, or <code>null</code> before one is chosen.',
      },
    },
  },
}
