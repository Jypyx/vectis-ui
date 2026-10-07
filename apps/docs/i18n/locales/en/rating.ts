export default {
  title: 'Rating',
  lead: '<code>VRating</code> lets the reader give a rating out of a few icons. It is a group of native radios, so the arrow keys, form submission and <code>required</code> work as in any form.',
  examples: {
    clearable: {
      title: 'Clearable',
      text: '<code>clearable</code> lets the rating go back to <code>null</code>: click the current value again, or reach "No rating" with the arrow keys.',
    },
    readonly: {
      title: 'Read-only',
      text: '<code>readonly</code> shows the value as a single image named after it, such as "3.7 out of 5". A fractional value fills part of an icon.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the icons to 20, 24 or 32 pixels.',
    },
    tones: {
      title: 'Tones and icons',
      text: '<code>tone</code> colours the filled icons, and <code>color</code> replaces it with a colour of your own. <code>icon</code> replaces the star with any icon; the empty ones are drawn in outline and the filled ones with its filled form.',
    },
    validation: {
      title: 'Validation',
      text: 'VRating follows the field model: <code>error</code> replaces the hint and is announced, and <code>required</code> adds an asterisk and makes the browser require a choice.',
    },
  },
  api: {
    VRating: {
      props: {
        max: 'Number of icons, and highest value.',
        label: 'Legend of the group. Defaults to the library dictionary as an accessible name.',
        hideLabel: 'Hides the label visually while keeping it as the group name.',
        hint: 'Help text under the icons.',
        error: 'Error message replacing the hint. Announced when it appears or changes.',
        invalid: 'Sets <code>aria-invalid</code> and the error style without a message.',
        required: 'Requires a rating in a form and adds an asterisk.',
        name: 'Field name in form submissions.',
        clearable:
          'Lets the rating go back to none, by clicking the current value or with a "No rating" choice.',
        readonly: 'Shows the value as a single image. A fractional value fills part of an icon.',
        disabled: 'Disables the whole group.',
        size: 'Icon size.',
        tone: 'Colour of the filled icons.',
        color:
          'Custom colour of the filled icons (hex, CSS name or <code>oklch()</code>), replacing the tone. Check its contrast.',
        icon: 'Icon replacing the star.',
        vModel:
          'Rating from 1 to <code>max</code>, or <code>null</code>. May be fractional when read-only.',
      },
    },
  },
}
