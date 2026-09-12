export default {
  title: 'Separator',
  lead: 'A one pixel rule, rendered as an <code>&lt;hr&gt;</code>. It carries no spacing of its own: the gap around it belongs to the layout that holds it.',

  examples: {
    orientation: {
      title: 'Orientation',
      text: '<code>orientation</code> draws the rule across the page or down it. An upright rule takes the full height of its flex or grid line on its own; in ordinary flow it collapses, so there a height is yours to give. The component carries no spacing either way.',
    },
    labelled: {
      title: 'A separator carrying a word',
      text: 'The component takes no content: a divider with a word in it is a heading with a rule on either side, so it is built rather than configured. The rule is <code>flex: none</code>, and a rule of your own is unlayered, so it wins over that.',
    },
  },

  api: {
    VSeparator: {
      props: {
        orientation:
          'The direction the rule runs in: across by default, or down the page under <code>vertical</code>. A vertical rule needs a height to show. As a flex or grid item it takes the one of its line; in ordinary flow you have to set one.',
      },
    },
  },
}
