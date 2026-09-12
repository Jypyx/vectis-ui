export default {
  title: 'Typography',
  lead: 'A text element that carries one of the type roles. Each role is a complete recipe of tokens, so a heading, a label and a caption are named rather than described by hand.',

  examples: {
    variants: {
      title: 'Variants',
      text: '<code>variant</code> offers fourteen roles, each one a complete recipe rather than a size: the weight, the line height and, where the role calls for it, the letter spacing and a monospaced family come with it.',
    },
    tones: {
      title: 'Tones',
      text: '<code>tone</code> is the colour of the text, said as a meaning. <code>default</code> sets no colour at all, so the text inherits whatever surrounds it, and <code>on-inverse</code> names its ground instead, for text the inherited colour would not survive.',
    },
    tags: {
      title: 'The tag it renders',
      text: 'Each variant already renders a sensible tag, h1 to h4 for the headings and <code>p</code> or <code>span</code> for the rest. <code>as</code> is for the cases where the meaning and the look part ways, and everything else falls through to that tag.',
    },
    truncate: {
      title: 'Truncating to one line',
      text: '<code>truncate</code> keeps the text to one line, ended with an ellipsis. The element needs a width to be cut against, and with nothing to overflow the text simply stays whole.',
    },
    paragraph: {
      title: 'A block of text',
      text: 'The component carries no margin of its own: the space between two pieces of text belongs to the layout holding them, usually a grid or a flex column with a gap.',
    },
  },

  api: {
    VTypography: {
      props: {
        variant:
          'The role the text plays, which selects a complete recipe of typographic tokens: size, weight, line height and, where the role calls for it, letter spacing and a monospaced family.',
        as: 'The HTML tag to render. Each variant already has a sensible default (h1 to h4, p, span, code), so this is for the cases where the meaning and the look differ: a subtitle that is really an <code>h2</code>, or a label attached to a field.',
        tone: 'The colour of the text. <code>default</code> sets none at all, so the text inherits from whatever surrounds it, which is what lets the same component sit on an inverted surface or inside a coloured toast.',
        truncate:
          'Cuts the text to one line and ends it with an ellipsis. The element needs a width to be cut against, as a block or a flex item; otherwise there is nothing to overflow and the text stays whole.',
      },
      slots: {
        default: 'The text.',
      },
    },
  },
}
