export default {
  title: 'Skeleton loader',
  lead: 'The silhouette of content that has not arrived yet. It is pure CSS, and it is decorative by default: what announces the wait is the container around it, not a dozen competing silhouettes.',

  examples: {
    shapes: {
      title: 'Shapes',
      text: '<code>shape</code> sets a corner radius and a way of being sized at once: <code>text</code> follows the typography around it, <code>control</code> takes the height of a control, <code>pill</code> that height with fully rounded ends, <code>circle</code> that height in both dimensions, <code>surface</code> a card with a height of its own. <code>width</code> and <code>height</code> name their own, a number being read as pixels and anything else as a CSS length.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> takes the scale every control shares, 24 to 56 pixels, and <code>compact</code> takes 4px off it. It means nothing for <code>text</code> or for <code>surface</code>, which are sized otherwise.',
    },
    paragraph: {
      title: 'Paragraphs of text',
      text: '<code>lines</code> draws that many silhouettes, each one em tall with the leading as the gutter, so they occupy exactly that many lines of the typography around them. The last one is drawn shorter than the others.',
    },
    silhouettes: {
      title: 'The silhouette of a real component',
      text: 'Nothing here is measured: a silhouette that matches the component it stands in for is one you declared, shape by shape.',
    },
    animations: {
      title: 'Animations',
      text: '<code>animation</code> sends the highlight across the silhouette as a wave, or raises and lowers it in place as a pulse, and <code>none</code> freezes it. Under <code>prefers-reduced-motion</code> the wave falls back to a slowed pulse.',
    },
    colour: {
      title: 'A colour of your own',
      text: '<code>color</code> replaces the shipped grey, the highlight both animations use being derived from it by a lightness delta rather than mixed towards a target.',
    },
    replacing: {
      title: 'Replacing the skeleton',
      text: 'There is no wrapper mode: the idiom is a plain <code>v-if</code>, with <code>aria-busy</code> on the container, which is what announces the wait for the whole zone.',
    },
    announcing: {
      title: 'Announcing the wait',
      text: 'A skeleton is decorative and hidden from the accessibility tree by default. <code>announce</code> makes one instance speak, and <code>label</code> says what is announced and turns the announcement on by being given.',
    },
  },

  api: {
    VSkeletonLoader: {
      props: {
        shape:
          'What the silhouette stands for. Each value sets both a corner radius and a way of being sized: <code>text</code> follows the typography around it, <code>control</code> takes the height of a control of the given size, <code>pill</code> is that height with fully rounded ends, <code>circle</code> is that height in both dimensions, and <code>surface</code> is a card or an image with a height of its own.',
        size: 'The size on the scale shared by every control. It only means something for the shapes sized like a control: text follows the typography around it, and a surface has its own height.',
        compact: 'Takes 4px off the height, as everywhere else in the design system.',
        width:
          "The width: a number is read as pixels, and anything else as a CSS length of your own, <code>'100%'</code> or <code>'12ch'</code>. Left out, the silhouette takes all the width available.",
        height: 'The height, read the same way. It wins over the shape and the size.',
        lines:
          'How many silhouettes to stack. In the text shape the last one is drawn shorter than the others, and that single detail is what reads as a paragraph rather than as a table.',
        animation:
          'How the silhouette shows that something is happening. Turning it off freezes it, which suits printing, a screenshot, or a parent that is already animating.',
        color:
          "A background colour of your own, replacing the token. The wave's highlight is derived from it, so it stays correct with nothing else to set.",
        announce:
          'Announces the loading to screen readers. It is off by default, because a skeleton is decorative: a page holds a dozen of them, and a dozen competing announcements are unreadable. What should announce the wait is the container around them, marked as busy.',
        label:
          'What is announced, which also implies announcing. Prefer something situated, "Loading the results", since a generic word is the reason the default is silence. It falls back to the design system dictionary.',
      },
    },
  },
}
