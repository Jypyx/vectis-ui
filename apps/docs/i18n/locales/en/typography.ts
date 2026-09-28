export default {
  title: 'Typography',
  lead: '<code>VTypography</code> applies a typography role to a text element.',
  examples: {
    variants: {
      title: 'Variants',
      text: '<code>variant</code> sets the font size, weight, line height and other typography settings for the chosen role.',
    },
    tones: {
      title: 'Tones',
      text: '<code>tone</code> sets a semantic text colour. <code>default</code> inherits the surrounding colour.',
    },
    tags: {
      title: 'The tag it renders',
      text: 'Variants provide default HTML tags. Use <code>as</code> when the document structure requires a different tag.',
    },
    truncate: {
      title: 'Truncating to one line',
      text: '<code>truncate</code> adds a single-line ellipsis. Give the element a constrained width.',
    },
    paragraph: {
      title: 'A block of text',
      text: 'The component adds no margins. Set spacing in the parent layout.',
    },
  },
  api: {
    VTypography: {
      props: {
        variant: 'Typography role, including font size, weight and line height.',
        as: 'HTML tag. Overrides the variant’s default tag.',
        tone: 'Semantic text colour. <code>default</code> inherits the surrounding colour.',
        truncate: 'Single-line ellipsis. Requires a constrained width.',
      },
      slots: {
        default: 'Text content.',
      },
    },
  },
}
