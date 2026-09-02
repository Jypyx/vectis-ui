export default {
  title: 'Icon button',
  lead: 'A square button carrying an icon and no label. It is VButton underneath, with two defaults of its own and a required name, since the picture is all a screen reader would otherwise get.',

  api: {
    VIconButton: {
      props: {
        label:
          'What the button does, in words. It becomes the <code>aria-label</code> and is the only thing a screen reader has to go on, so it names the action, "Close", "Next month", rather than the picture.',
        variant: 'How much visual weight the button carries, on the VButton scale.',
        tone: 'What the action means, in colour. An icon-only button is usually chrome, which is why it starts neutral where VButton starts accent.',
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
