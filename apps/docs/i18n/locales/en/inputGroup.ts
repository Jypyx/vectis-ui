export default {
  title: 'Input group',
  lead: 'Joins two or more form controls into a single object: a country code against a phone number, a search field against its button. The shared borders melt into one line and only the two ends of the row stay rounded.',

  examples: {
    multipleInputs: {
      title: 'Several fields in one row',
      text: 'A row takes as many segments as needed. Every segment holding a field takes an equal share of what is left, the others keeping their natural width.',
    },
    naming: {
      title: 'Naming the row and its segments',
      text: 'The group renders one <code>label</code> and one <code>hint</code> for the whole row. Each segment then needs an <code>aria-label</code> of its own, and one bringing its own <code>label</code> is warned about in development.',
    },
    widths: {
      title: 'Widths',
      text: 'Proportions are set on the segment itself, with a class or an inline <code>flex</code>. A consumer rule is unlayered, so it wins over the share the group hands out.',
    },
    withButton: {
      title: 'A field and its button',
      text: 'A <code>solid</code> or <code>soft</code> button covers the shared edge with its own background, and an <code>outline</code> button in <code>tone="neutral"</code> draws the same border colour as the fields. A <code>ghost</code> button has no frame at all, so it is the one variant to avoid here.',
    },
    sizes: {
      title: 'Size and density',
      text: '<code>size</code> and <code>compact</code> are set on the row and travel to every segment, winning over what a segment asks for itself.',
    },
    states: {
      title: 'States',
      text: 'A group with none of the shape props set leaves every segment exactly as it was. <code>disabled</code> adds up instead of replacing, so a segment switched off on its own stays off under a row that says nothing.',
    },
    pickers: {
      title: 'Two fields that open a panel',
      text: "Each panel is anchored to its own field's box, so it opens under the segment it belongs to rather than under the group. The buttons a panel contains are not segments of the row and keep the size their own component gave them.",
    },
  },

  api: {
    VInputGroup: {
      props: {
        label:
          'The label above the row, rendered once for all of its segments and used as the accessible name of the group. A segment carrying one of its own is pushed out of line, so name each of them with <code>aria-label</code> instead.',
        hint: 'A line of help under the row, tied to the group so assistive technology reads it out along with the label.',
        size: 'The height every segment takes, whatever it names for itself: a row of controls of two heights stops reading as one object. Left out, each segment keeps its own.',
        compact:
          'Takes 4px off the height of every segment, the way <code>compact</code> does on a lone field.',
        disabled:
          'Makes the whole row unusable. It adds to what each segment says rather than replacing it: a segment disabled on its own stays disabled under a row that says nothing.',
      },
      slots: {
        default: 'The fields and buttons to join. Each one is a segment of the row.',
      },
    },
  },
}
