export default {
  title: 'Progress linear',
  lead: 'A bar that fills as something advances, or animates continuously when there is no figure to report. It can be turned upright, and it can carry its own percentage inside it.',

  api: {
    VProgressLinear: {
      props: {
        value: 'How far along it is. Anything outside the range is brought back into it.',
        max: 'What counts as finished. The other end is always zero.',
        indeterminate:
          'Says that the progress cannot be measured: the bar animates continuously and the value is ignored. It is what to use while waiting for a server that reports no percentage.',
        tone: 'What the progress means, expressed as a colour.',
        color:
          "A colour of your own, as hex, a CSS name or <code>oklch()</code>, which replaces the tone. The track's own shade is derived from it against the theme, so it follows both.",
        thickness:
          "How thick the bar is, always in pixels: <code>12</code> and <code>'12'</code> both give 12px. It is 4px by default, so showing text inside the bar needs an explicit thickness.",
        shape: 'Whether the ends of the bar are rounded or square.',
        showValue:
          'Writes the percentage inside the bar. It is ignored while the progress is unmeasurable, there being no figure to write.',
        valuePosition:
          'Where that text sits along the bar. On a vertical bar the start is the zero end, hence the bottom.',
        orientation: 'Turns the bar upright, filling from the bottom up.',
      },
      slots: {
        default:
          "What to write inside the bar instead of the percentage. It is rendered twice, once over the empty track and once over the filled part in a contrasting colour, each copy cut at the fill's edge, so whatever it renders must be free of side effects.",
      },
    },
  },
}
