export default {
  title: 'Progress circular',
  lead: 'A ring that fills as something advances, or turns continuously when there is no figure to report. Its geometry is pure CSS, so changing its size recomputes nothing in JavaScript.',

  examples: {
    value: {
      title: 'Value',
      text: 'How far along it is, against a <code>max</code> that says what counts as finished. The other end is always zero, so a count of seven files out of twelve is written as it reads. Anything outside the range is brought back into it, which means a figure arriving from a server needs no clamping of your own.',
    },
    indeterminate: {
      title: 'Indeterminate',
      text: 'For a wait that cannot be measured: the ring turns and its arc grows and shrinks, the two on periods of their own so the movement never settles into a rhythm, and the value is ignored. Where a spinner is standing in for an icon rather than reporting on a task, VSpinner is the smaller thing to reach for.',
    },
    tones: {
      title: 'Tones',
      text: "What the progress means, as a colour. Five here rather than a button's three, because a ring reports a STATE rather than starting an action: a quota running out is a warning, a finished upload a success.",
    },
    customColors: {
      title: 'Custom colours',
      text: "A colour of your own replaces the tone, as a hex value, a CSS name or an <code>oklch()</code>. The unfilled ring's shade is derived from it against the theme, so one value is all you set and it stays right in dark mode.",
    },
    sizeAndThickness: {
      title: 'Size and thickness',
      text: 'The diameter and the ring, both always in pixels whether given as a number or as a numeric string, and independent of one another. The geometry is entirely CSS: the radius is derived from the two, so changing either recomputes nothing in JavaScript and a ring can be resized from a media query or a container query without the component hearing about it.',
    },
    shape: {
      title: 'Shape',
      text: 'Whether the ends of the drawn arc are rounded or cut square. It shows on a thick ring and is all but invisible on a thin one.',
    },
    customContent: {
      title: 'Content in the middle',
      text: "<code>showValue</code> writes the percentage in the hole of the ring, sized in proportion to the diameter so it stays readable at every size. The default slot replaces it with something of your own, a count, a shortened figure or an icon, and receives the value, the max and the percentage worked out from them. Unlike the bar, this content is rendered once and sits on the page background rather than over the ring, so it simply takes the page's own text colour.",
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
