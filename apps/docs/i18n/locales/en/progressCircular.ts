export default {
  title: 'Progress circular',
  lead: 'A ring that fills as something advances, or turns continuously when there is no figure to report. Its geometry is pure CSS, so changing its size recomputes nothing in JavaScript.',

  examples: {
    value: {
      title: 'Value',
      text: '<code>value</code> is how far along it is, against a <code>max</code> that says what counts as finished. Anything outside the range is brought back into it.',
    },
    indeterminate: {
      title: 'Indeterminate',
      text: '<code>indeterminate</code> is for a wait that cannot be measured: the ring turns and the value is ignored. Where a spinner stands in for an icon rather than reporting on a task, VSpinner is the smaller thing to reach for.',
    },
    tones: {
      title: 'Tones',
      text: "<code>tone</code> says what the progress means, as a colour. There are five rather than a button's three, a ring reporting a state rather than starting an action.",
    },
    customColors: {
      title: 'Custom colours',
      text: "<code>color</code> replaces the tone, as a hex value, a CSS name or an <code>oklch()</code>. The unfilled ring's shade is derived from it against the theme.",
    },
    sizeAndThickness: {
      title: 'Size and thickness',
      text: '<code>size</code> and <code>thickness</code> are the diameter and the ring, both always in pixels whether given as a number or a numeric string, and independent of one another.',
    },
    shape: {
      title: 'Shape',
      text: '<code>shape</code> says whether the ends of the drawn arc are rounded or cut square. It shows on a thick ring and is all but invisible on a thin one.',
    },
    customContent: {
      title: 'Content in the middle',
      text: '<code>showValue</code> writes the percentage in the hole of the ring, sized in proportion to the diameter. The default slot replaces it with content of your own and receives the value, the max and the percentage worked out from them.',
    },
  },

  api: {
    VProgressCircular: {
      props: {
        value: 'How far along it is. Anything outside the range is brought back into it.',
        max: 'What counts as finished. The other end is always zero.',
        indeterminate:
          'Says that the progress cannot be measured: the ring turns continuously and the value is ignored.',
        tone: 'What the progress means, expressed as a colour.',
        color:
          "A colour of your own, as hex, a CSS name or <code>oklch()</code>, which replaces the tone. The unfilled ring's shade is derived from it against the theme, so it follows both.",
        size: "The diameter, always in pixels: <code>96</code> and <code>'96'</code> both give 96px.",
        thickness:
          "How thick the ring is, always in pixels: <code>8</code> and <code>'8'</code> both give 8px.",
        shape: 'Whether the ends of the drawn arc are rounded or cut square.',
        showValue:
          'Writes the percentage in the middle of the ring. It is ignored while the progress is unmeasurable, there being no figure to write.',
      },
      slots: {
        default:
          'What to put in the middle of the ring instead of the percentage: a count of files, an icon, a shortened figure.',
      },
    },
  },
}
