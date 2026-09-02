export default {
  title: 'Typography',
  lead: 'A text element that carries one of the type roles. Each role is a complete recipe of tokens, so a heading, a label and a caption are named rather than described by hand.',

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
