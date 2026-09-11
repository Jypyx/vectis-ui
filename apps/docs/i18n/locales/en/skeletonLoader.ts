export default {
  title: 'Skeleton loader',
  lead: 'The silhouette of content that has not arrived yet. It is pure CSS, and it is decorative by default: what announces the wait is the container around it, not a dozen competing silhouettes.',

  examples: {
    shapes: {
      title: 'Shapes',
      text: 'What the silhouette stands for. Each value sets a corner radius and a way of being sized at once: <code>text</code> follows the typography around it, <code>control</code> takes the height of a control, <code>pill</code> is that height with fully rounded ends, <code>circle</code> is that height in both dimensions, and <code>surface</code> is a card or an image with a height of its own. The component has no width of its own and fills what it is given, so the container is what decides how wide a silhouette runs. <code>width</code> names one where that is not enough, a number being read as pixels and anything else as a CSS length; <code>height</code> is read the same way and wins over both the shape and the size, for a silhouette no shape describes.',
    },
    sizes: {
      title: 'Sizes',
      text: 'The scale shared by every control, 24 to 56 pixels, with <code>compact</code> taking 4px off as it does everywhere else. An <code>md</code> skeleton is exactly as tall as an <code>md</code> button, which is what lets a silhouette hold the place of the control it stands in for rather than approximate it. It means nothing for <code>text</code>, which follows the typography around it, or for <code>surface</code>, which has a height of its own.',
    },
    paragraph: {
      title: 'Paragraphs of text',
      text: 'In the text shape a silhouette is one em tall and the gutter between two of them is the leading, so <code>lines</code> silhouettes occupy exactly that many lines of the typography around them: swapping them for the real text shifts nothing on the page. The last line is drawn shorter than the others, and that single detail is what reads as a paragraph rather than as a table.',
    },
    silhouettes: {
      title: 'The silhouette of a real component',
      text: 'What the shapes are for. A button is a <code>control</code> at the button size, given the width its label would have taken; an avatar is a <code>circle</code>, a chip a <code>pill</code>, a field two silhouettes since its label is a line of text and its box a control. Nothing here is measured: the component never looks at what it replaces, so a silhouette that matches is one you declared, which is also what keeps it correct before the real thing has ever been rendered.',
    },
    animations: {
      title: 'Animations',
      text: 'Both animations lighten the silhouette with the same highlight, derived from its own background: the wave sends it across, the pulse raises and lowers it in place. Neither fades the silhouette towards the page, which would lighten it in one theme and darken it in the other. <code>none</code> freezes it, which suits printing, a screenshot, or a parent that is already animating. Under <code>prefers-reduced-motion</code> the wave falls back to a slowed pulse rather than stopping, a translation being precisely what that preference is about.',
    },
    colour: {
      title: 'A colour of your own',
      text: 'The shipped grey reads as an absence on the page background, and as a hole on a surface that paints its own. <code>color</code> replaces it, and the highlight both animations use is derived from that colour by a lightness delta rather than mixed towards a target, so it stays right on an unusual ground and in either theme with nothing else to set.',
    },
    replacing: {
      title: 'Replacing the skeleton',
      text: 'There is no wrapper mode, and that is a decision rather than an omission: wrapping would invite the component to measure what it replaces, and the shape would still have to be declared. The idiom is a plain <code>v-if</code>, with <code>aria-busy</code> on the container. That attribute is what announces the wait for the whole zone, which is the other half of the skeleton being silent.',
    },
    announcing: {
      title: 'Announcing the wait',
      text: 'A skeleton is decorative by default and hidden from the accessibility tree: a page holds a dozen of them, and a dozen competing announcements are unreadable. One instance per zone speaks, through <code>announce</code>, or through <code>label</code>, which says what is announced and turns the announcement on by being given. Prefer something situated, "Loading the results", since a generic word is the reason the default is silence.',
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
