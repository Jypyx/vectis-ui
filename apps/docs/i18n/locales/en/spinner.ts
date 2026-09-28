export default {
  title: 'Spinner',
  lead: '<code>VSpinner</code> indicates an ongoing operation and fits in an icon-sized space.',
  examples: {
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the box size in pixels. Defaults to <code>1em</code>.',
    },
    colour: {
      title: 'Colour',
      text: 'The spinner uses <code>currentcolor</code> and inherits the text colour.',
    },
    icon: {
      title: 'In place of an icon',
      text: 'Use the same <code>size</code> as an icon to replace it with a spinner.',
    },
  },
  api: {
    VSpinner: {
      props: {
        size: 'Box size in pixels, as a number or numeric string. Defaults to <code>1em</code>.',
        label: 'Accessible loading text. Defaults to the library dictionary.',
      },
    },
  },
}
