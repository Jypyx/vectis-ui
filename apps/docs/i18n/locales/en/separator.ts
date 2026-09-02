export default {
  title: 'Separator',
  lead: 'A one pixel rule, rendered as an <code>&lt;hr&gt;</code>. It carries no spacing of its own: the gap around it belongs to the layout that holds it.',

  api: {
    VSeparator: {
      props: {
        orientation:
          'The direction the rule runs in: across by default, or down the page under <code>vertical</code>. A vertical rule needs a height to show. As a flex or grid item it takes the one of its line; in ordinary flow you have to set one.',
      },
    },
  },
}
