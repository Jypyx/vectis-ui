export default {
  title: 'Separator',
  lead: '<code>VSeparator</code> renders a horizontal or vertical rule without margins.',
  examples: {
    orientation: {
      title: 'Orientation',
      text: 'Vertical separators stretch in flex or grid layouts. In normal flow, set their height explicitly.',
    },
    labelled: {
      title: 'A separator carrying a word',
      text: 'To add a label, place text between two separators in a flex layout.',
    },
  },
  api: {
    VSeparator: {
      props: {
        orientation:
          'Horizontal or vertical rule. A vertical rule needs a height or a flex/grid layout that stretches it.',
      },
    },
  },
}
