export default {
  title: 'Progress linear',
  lead: 'A bar that fills as something advances, or animates continuously when there is no figure to report. It can be turned upright, and it can carry its own percentage inside it.',

  examples: {
    value: {
      title: 'Value',
      text: 'How far along it is, against a <code>max</code> that says what counts as finished. The other end is always zero, so a count of seven files out of twelve is written as it reads. Anything outside the range is brought back into it, which means a figure arriving from a server needs no clamping of your own.',
    },
    indeterminate: {
      title: 'Indeterminate',
      text: 'For a wait that cannot be measured: the bar animates continuously and the value is ignored, there being nothing to report. One bar crosses the track and is exactly flush with each edge at the extremes, so the loop is invisible and the track is never empty. Under reduced motion it is slowed rather than stopped, a motionless loader no longer saying the one thing it exists to say.',
    },
    tones: {
      title: 'Tones',
      text: "What the progress means, as a colour. Five here rather than a button's three, because a bar reports a STATE rather than starting an action: a quota running out is a warning, a finished upload a success.",
    },
    customColors: {
      title: 'Custom colours',
      text: "A colour of your own replaces the tone, as a hex value, a CSS name or an <code>oklch()</code>. The track's own shade is derived from it against the theme, so one value is all you set and it stays right in dark mode.",
    },
    thickness: {
      title: 'Thickness',
      text: "Always in pixels, whether given as a number or as a numeric string, and 4px unless you say otherwise. There is no length prop to go with it: the bar takes the width of whatever holds it, so how long it is stays the container's business.",
    },
    shape: {
      title: 'Shape',
      text: 'Whether the ends of the bar are rounded or cut square. It shows on a thick bar and is all but invisible on the default 4px one.',
    },
    customContent: {
      title: 'Content inside the bar',
      text: "<code>showValue</code> writes the percentage inside the bar and <code>valuePosition</code> says where along it that text sits. The default slot replaces the figure with something of your own, a count of files or a shortened number, and receives the value, the max and the percentage worked out from them. One thing to know before using it: the content is rendered TWICE, once over the empty track and once over the fill in a contrasting colour, each copy clipped at the fill's edge, so whatever it renders has to be free of side effects. The bar is 4px by default, so writing in it means giving it a thickness that can hold a line of text.",
    },
    orientation: {
      title: 'Orientation',
      text: 'Turned upright, the bar fills from the BOTTOM up: zero is anchored to the bottom edge, so it reads the way a gauge does. It then takes the height of whatever holds it, exactly as the horizontal one takes the width. The text copies stay horizontal, which is what stops a percentage being reordered into nonsense.',
    },
  },

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
