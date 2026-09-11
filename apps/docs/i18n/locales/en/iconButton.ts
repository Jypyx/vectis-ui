export default {
  title: 'Icon button',
  lead: 'A square button carrying an icon and no label. It is VButton underneath, with two defaults of its own and a required name, since the picture is all a screen reader would otherwise get.',

  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: 'The same four variants and three tones as VButton, with two defaults of its own: <code>ghost</code> rather than <code>solid</code>, and <code>neutral</code> rather than <code>accent</code>. An icon-only button is nearly always chrome around the content, a close cross or a menu, so the quiet pair is what it should look like before anything is asked of it. Tones are intentions rather than states, which is why there are three and not five: success and warning belong to what reports a state, never to what starts an action.',
    },
    elevated: {
      title: 'Elevated',
      text: 'A shadow under the button, orthogonal to the variant rather than a fifth value of it, so any of the four can be raised. Ghost and outline also gain a raised surface, without which the shadow would have nothing casting it in the dark theme.',
    },
    sizes: {
      title: 'Sizes',
      text: 'The five steps every control in the library shares, 24 to 56 pixels, and the button is square at each: the width reads the same height the scale sets, so one rule covers the whole scale. <code>compact</code> takes 4px off, and off both sides, so the box stays square. The icon follows the step without being told, a control setting the size of whatever is drawn inside it.',
    },
    shapes: {
      title: 'Shapes',
      text: 'Square, carrying the corner radius every control shares, or circular. The box is square either way and only the corners change, which is why the prop names the silhouette rather than a radius: a value called "rounded" would stop being true the day a consumer sets that radius to zero, where "square" only becomes truer. It lives here and not on VButton, since a full radius says something only about a box that is already square. Inside a VButtonGroup the row\'s own corner rules win and a circular segment keeps square seams, which is what keeps the row reading as one object.',
    },
    icons: {
      title: 'Icons',
      text: 'The <code>icon</code> prop takes everything an icon prop in the library takes: one of its own icons, a bare name for your resolver, or an explicit render. <code>iconFilled</code> asks for the filled form, which is how a state is marked. The default slot is the way to an icon the prop cannot express, a VIcon you configure yourself or an inline SVG, and whatever goes there stays decorative: the button is already named by its label.',
    },
    link: {
      title: 'As a link',
      text: '<code>href</code> is not a prop of this component. It falls through to the VButton underneath, which renders an anchor instead of a button, and every other anchor attribute travels the same way. A disabled link keeps its place and loses its destination: the href is removed and the clicks are dropped, since nothing in HTML disables an anchor.',
    },
    states: {
      title: 'States',
      text: "Disabled is greyed through the colour tokens rather than with an opacity, so the button keeps its shape against every background. Loading puts a spinner where the icon was and disables the button while it turns, which is what stops the same action being asked for twice. The spinner takes the icon's own box, so the square does not change size as it appears.",
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
