export default {
  title: 'Typography',
  lead: 'A text element that carries one of the type roles. Each role is a complete recipe of tokens, so a heading, a label and a caption are named rather than described by hand.',

  examples: {
    variants: {
      title: 'Variants',
      text: 'Fourteen roles, each one a complete recipe rather than a size: the weight, the line height and, where the role calls for it, the letter spacing and a monospaced family all come with it. That is the point of naming them. A heading set by hand is four declarations that drift apart across a codebase, where <code>heading-3</code> is one word that means the same thing everywhere and follows a change to the tokens without being touched.',
    },
    tones: {
      title: 'Tones',
      text: 'The colour of the text, said as a meaning rather than as a value. <code>default</code> sets no colour at all, so the text inherits whatever surrounds it, and that is the one to reach for by default: it is what lets the same component sit inside a coloured toast or on an inverted surface without being told which. <code>on-inverse</code> is the exception that names its ground instead of its meaning, for text the inherited colour would not survive.',
    },
    tags: {
      title: 'The tag it renders',
      text: 'Each variant already renders a sensible tag, h1 to h4 for the headings, <code>p</code> for the body roles, <code>span</code> for the small ones. <code>as</code> is for the cases where the meaning and the look part ways: a section that is an <code>h2</code> in the document but should read at the size of an <code>h4</code>. The component has a single root and declares no attribute of its own, so everything else falls through to that tag, which is what makes a <code>label</code> variant rendered as a real <code>&lt;label for&gt;</code> a working pair rather than a resemblance.',
    },
    truncate: {
      title: 'Truncating to one line',
      text: 'One line, ended with an ellipsis. The element needs a width to be cut against: as a block or a flex item it takes its parent\u2019s, and with nothing to overflow there is nothing to cut, so the text simply stays whole. That is worth knowing before reaching for it, since the failure is silent, the text just carries on.',
    },
    paragraph: {
      title: 'A block of text',
      text: 'Several roles composed into one block, which is where the scale is actually judged: whether a standfirst sits one step above the body, whether an inline role disturbs the line it is in. The component carries no margin of its own, and that is deliberate rather than an omission: the space between two pieces of text belongs to the layout holding them, so a stack with no gap leaves them touching. A grid or a flex column with a gap is the usual answer, and it is what keeps the rhythm of a page one decision rather than fourteen.',
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
