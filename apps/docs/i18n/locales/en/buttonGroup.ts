export default {
  title: 'Button group',
  lead: 'Joins buttons into one segmented control: merged borders, rounded corners at the ends only. The row is one object, so it is the group that carries the variant, the tone, the size and the density, and every button inside picks them up.',

  api: {
    VButtonGroup: {
      props: {
        orientation:
          'The direction the buttons are joined in: a row by default, or a column under <code>vertical</code>.',
        variant:
          "How much visual weight every segment carries, on VButton's own values: <code>solid</code>, <code>outline</code>, <code>ghost</code> or <code>soft</code>. It wins over the variant a button inside was given, a segment of another silhouette no longer reading as part of the row. Left out, each button keeps its own.",
        tone: 'The colour the segments take, among <code>accent</code>, <code>neutral</code> and <code>danger</code>. This one is a fallback rather than an order: a button that names a tone of its own keeps it, which is what lets a single destructive action stand out in the row.',
        size: 'The height of the segments, from the size scale shared by every control: <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> or <code>xl</code>. It wins over the size a button inside was given. Left out, each button keeps its own.',
        compact:
          'Takes 4px off the height of every segment. It wins over the value a button inside was given. Left out, each button keeps its own.',
        elevated:
          "Raises the row off the page with the shadow scale, on the terms of VButton's own prop. The shadow is the row's and not each segment's, which is what keeps the joints clear: three overlapping shadows would draw a dark band down each of them. It wins over the value a button inside was given. Left out, each button keeps its own.",
      },
      slots: {
        default: 'The VButtons and VIconButtons to join together.',
      },
    },
  },
}
