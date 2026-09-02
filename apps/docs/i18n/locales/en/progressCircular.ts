export default {
  title: 'Progress circular',
  lead: 'A ring that fills as something advances, or turns continuously when there is no figure to report. Its geometry is pure CSS, so changing its size recomputes nothing in JavaScript.',

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
