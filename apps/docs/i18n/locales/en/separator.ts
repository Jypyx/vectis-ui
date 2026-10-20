export default {
  title: 'Separator',
  lead: '<code>VSeparator</code> renders a horizontal or vertical rule without margins.',
  examples: {
    orientation: {
      title: 'Orientation',
      text: 'Vertical separators stretch in flex or grid layouts. In normal flow, set their height explicitly.',
    },
    labelled: {
      title: 'Label and icon',
      text: 'Set <code>label</code>, <code>icon</code> or the default slot, and place them with <code>contentPosition</code>. The label also becomes the separator’s accessible name.',
    },
    variants: {
      title: 'Variants, size and colour',
      text: '<code>variant</code> strokes the rule solid, dashed or dotted, and <code>size</code> sets its thickness. <code>color</code> paints the strokes only; the label keeps the muted text colour.',
    },
  },
  api: {
    VSeparator: {
      props: {
        orientation:
          'Horizontal or vertical rule. A vertical rule needs a height or a flex/grid layout that stretches it.',
        variant: 'How the rule is stroked: solid, dashed or dotted.',
        size: 'The thickness of the rule: 1px, 2px or 4px. A thicker rule marks a stronger break and makes dots legible.',
        color: 'A CSS colour for the rule. The label and icon keep the muted text colour.',
        label: 'Visible text breaking the rule, also used as the accessible name.',
        icon: 'An icon breaking the rule, before the label.',
        contentPosition: 'Where the label and icon sit along the rule.',
      },
      slots: {
        default:
          'Rich content breaking the rule, in place of the label. Name it with <code>aria-label</code> when its words matter.',
      },
    },
  },
}
