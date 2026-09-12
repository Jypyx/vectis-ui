export default {
  title: 'Icon button',
  lead: 'A square button carrying an icon and no label. It is VButton underneath, with two defaults of its own and a required name, since the picture is all a screen reader would otherwise get.',

  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: 'The same four <code>variant</code>s and three <code>tone</code>s as VButton, with two defaults of its own: <code>ghost</code> rather than <code>solid</code>, and <code>neutral</code> rather than <code>accent</code>.',
    },
    elevated: {
      title: 'Elevated',
      text: '<code>elevated</code> applies the shadow scale to whichever variant is in use. Ghost and outline also gain a raised surface.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the box, square at each of the five steps from 24 to 56 pixels. <code>compact</code> takes 4px off both sides, so the box stays square.',
    },
    shapes: {
      title: 'Shapes',
      text: "<code>shape</code> chooses the silhouette, square or circular. Inside a VButtonGroup the row's own corner rules win and a circular segment keeps square seams.",
    },
    icons: {
      title: 'Icons',
      text: '<code>icon</code> takes any icon value and <code>iconFilled</code> asks for its filled form. The default slot is the way to an icon the prop cannot express, and stays decorative: the button is named by its <code>label</code>.',
    },
    link: {
      title: 'As a link',
      text: '<code>href</code> falls through to the VButton underneath, which renders an anchor. A disabled link keeps its place and loses its destination.',
    },
    states: {
      title: 'States',
      text: "<code>disabled</code> greys the button out through the colour tokens. <code>loading</code> puts a spinner in the icon's own box and disables the button while it turns.",
    },
  },

  api: {
    VIconButton: {
      props: {
        label:
          'What the button does, in words. It becomes the <code>aria-label</code> and is the only thing a screen reader has to go on, so it names the action, "Close", "Next month", rather than the picture.',
        variant:
          'How much visual weight the button carries, on the VButton scale. Inside a VButtonGroup the group decides it.',
        tone: "What the action means, in colour. An icon-only button is usually chrome, which is why it starts neutral where VButton starts accent. Left out inside a VButtonGroup it takes the group's tone.",
        elevated: 'Raises the button with a shadow, and a raised surface on ghost and outline.',
        size: 'The size of the square, taken from the scale shared by every control.',
        compact: 'Takes 4px off both sides of the square, which stays square.',
        shape:
          'The silhouette: a square carrying the corner radius every control shares, or a circle. The box itself is square either way, only the corners change.',
        type: 'The native type of the button. It is ignored as soon as <code>href</code> makes it a link.',
        disabled: 'Makes the button unusable, greyed out through the colour tokens.',
        loading: 'Replaces the icon with a spinner and disables the button while it turns.',
        icon: 'The icon to show. The default slot is the way to supply one this prop cannot express.',
        iconFilled: "Renders the icon in its filled form, the font's <code>FILL</code> axis.",
      },
      slots: {
        default:
          'The icon, when the <code>icon</code> prop cannot express it: a VIcon, or an inline SVG marked <code>aria-hidden</code>, the button being already named by its label.',
      },
    },
  },
}
