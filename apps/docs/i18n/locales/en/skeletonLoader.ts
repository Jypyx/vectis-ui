export default {
  title: 'Skeleton loader',
  lead: 'The silhouette of content that has not arrived yet. It is pure CSS, and it is decorative by default: what announces the wait is the container around it, not a dozen competing silhouettes.',

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
