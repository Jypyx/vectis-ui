export default {
  title: 'Skeleton loader',
  lead: '<code>VSkeletonLoader</code> reserves space for loading content. It is decorative by default; mark the containing region with <code>aria-busy</code>.',
  examples: {
    shapes: {
      title: 'Shapes',
      text: 'Choose a <code>shape</code> for text, controls, pills, circles or surfaces. Override dimensions with <code>width</code> and <code>height</code>.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> and <code>compact</code> apply to control, pill and circle shapes.',
    },
    paragraph: {
      title: 'Paragraphs of text',
      text: '<code>lines</code> stacks placeholders. In the text shape, the last line is shorter.',
    },
    silhouettes: {
      title: 'The silhouette of a real component',
      text: 'Compose shapes to match the content that will replace them.',
    },
    animations: {
      title: 'Animations',
      text: 'Choose a wave, pulse or no animation. Reduced motion replaces the wave with a slower pulse.',
    },
    colour: {
      title: 'A colour of your own',
      text: '<code>color</code> sets a custom background colour.',
    },
    replacing: {
      title: 'Replacing the skeleton',
      text: 'Replace the skeleton with <code>v-if</code> when content is ready. Keep <code>aria-busy</code> on the containing region while loading.',
    },
    announcing: {
      title: 'Announcing the wait',
      text: 'Use <code>announce</code> or <code>label</code> to announce one loading indicator. Avoid announcing every skeleton in the same region.',
    },
  },
  api: {
    VSkeletonLoader: {
      props: {
        shape: 'Placeholder shape: text, control, pill, circle or surface.',
        size: 'Size for control, pill and circle shapes.',
        compact: 'Reduces the height of control-sized shapes.',
        width:
          'Width as pixels for numbers, otherwise a CSS length. Defaults to the available width.',
        height: 'Height as pixels for numbers, otherwise a CSS length. Overrides shape and size.',
        lines: 'Number of stacked placeholders. Text shapes shorten the last line.',
        animation: 'Wave, pulse or no animation.',
        color: 'Custom placeholder background colour.',
        announce: 'Announces loading to assistive technology. Off by default.',
        label:
          'Accessible loading text. Also enables announcement; defaults to the library dictionary.',
      },
    },
  },
}
