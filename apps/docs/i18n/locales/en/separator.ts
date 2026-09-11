export default {
  title: 'Separator',
  lead: 'A one pixel rule, rendered as an <code>&lt;hr&gt;</code>. It carries no spacing of its own: the gap around it belongs to the layout that holds it.',

  examples: {
    orientation: {
      title: 'Orientation',
      text: "Across the page by default, or down it. An upright rule comes with one thing worth knowing: an <code>&lt;hr&gt;</code> has no height of its own. As a flex or grid item it takes the full height of its line, whatever the container aligns its items to, and nothing has to be set. In ordinary flow it collapses to nothing instead, silently and with no error, so there a height is yours to give. The rule itself carries no spacing either way: what separates it from what it separates is the layout's own gap.",
    },
    labelled: {
      title: 'A separator carrying a word',
      text: 'The component takes no content, and a slot for one would be the wrong shape: a divider with a word in it is a heading with a rule on either side, so it is built rather than configured. Two rules told to grow, the word between them. The base rule is <code>flex: none</code>, which is what keeps it from stretching where it is not meant to, and a rule of your own is unlayered so it wins over that with no fight.',
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
