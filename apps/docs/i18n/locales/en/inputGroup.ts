export default {
  title: 'Input group',
  lead: 'Joins two or more form controls into a single object: a country code against a phone number, a search field against its button. The shared borders melt into one line and only the two ends of the row stay rounded.',

  examples: {
    naming: {
      title: 'Naming the row and its segments',
      text: 'The group renders one label and one hint for the whole row, and names itself with them. Each segment then needs a name of its own, which is what <code>aria-label</code> is for. A segment that brings its own <code>label</code> is pushed a line out of the row, so the component warns about it in development.',
    },
    widths: {
      title: 'Widths',
      text: 'Every segment holding a field takes an equal share of the row, and everything else keeps its natural width: a button is measured by its label. Proportions are set on the segment itself, with a class or an inline <code>flex</code>. A consumer rule is unlayered, so it wins over the share the group hands out.',
    },
    search: {
      title: 'A field and its button',
      text: 'A <code>solid</code> or <code>soft</code> button covers the shared edge with its own background, which is what an attached action should look like. An <code>outline</code> button in <code>tone="neutral"</code> draws the same border colour as the fields, so the outline runs unbroken around the whole row. A <code>ghost</code> button has no frame at all and floats out of the box, so it is the one variant to avoid here. A magnifier inside the field is a different thing and not a segment: that is <code>iconEnd</code> with a <code>click:icon-end</code> listener on the field itself.',
    },
    sizes: {
      title: 'Size and density',
      text: 'The height and the density are set on the row and travel to every segment. They are the shape of the control, so the row wins over what a segment asks for itself: a segment of another height stops lining up with its neighbours and the merged border no longer reads as one object.',
    },
    states: {
      title: 'States',
      text: 'A group with none of the three shape props set leaves every segment exactly as it was, which is what makes a bare group a purely visual wrapper. <code>disabled</code> adds instead of replacing, so a segment switched off on its own stays off under a row that says nothing. A field in error keeps its red edge against its neighbour, and a focused field is raised above both so its ring is drawn whole.',
    },
    panels: {
      title: 'Fields that open a panel',
      text: 'A combobox panel is measured against its own segment, so a narrow code field opens a narrow list. A time field in 12 hour form carries an AM/PM control beside it, and inside a group the two become one segment. The buttons a panel contains are not segments of the row and keep the size their own component gave them, so the navigation of a calendar stays small in a large row.',
    },
    scope: {
      title: 'What a group does not join',
      text: 'A textarea is not a segment. Its bordered box is a different element, so it is left entirely alone rather than half painted, and no sensible row joins a multi line box to a single line one. A row is a line of single line controls: a segment that grows, such as a combobox holding several values, becomes taller than its neighbours and the merged border then only covers the top of it.',
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
