export default {
  title: 'Button group',
  lead: 'Joins buttons into one segmented control: merged borders, rounded corners at the ends only. It is pure CSS, so each button keeps its own props.',

  api: {
    VButtonGroup: {
      props: {
        orientation:
          'The direction the buttons are joined in: a row by default, or a column under <code>vertical</code>.',
      },
      slots: {
        default: 'The VButtons and VIconButtons to join together.',
      },
    },
  },
}
