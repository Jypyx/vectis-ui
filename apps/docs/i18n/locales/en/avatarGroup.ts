export default {
  title: 'Avatar group',
  lead: '<code>VAvatarGroup</code> overlaps avatars in a row and can group excess avatars into a count.',
  examples: {
    overflow: {
      title: 'Overflow',
      text: '<code>max</code> limits visible avatars. The remaining count appears as <code>+N</code>.',
    },
    size: {
      title: 'Size on the group',
      text: 'The group’s <code>size</code> applies unless an avatar sets its own.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> reduces every avatar’s diameter.',
    },
    customOverflow: {
      title: 'Custom overflow',
      text: 'The <code>overflow</code> slot receives the hidden avatar <code>count</code>.',
    },
    tooltips: {
      title: 'With tooltips',
      text: 'Make tooltip avatars focusable with <code>clickable</code> or a link.',
    },
  },
  api: {
    VAvatarGroup: {
      props: {
        max: 'Maximum visible avatars before the count. Omitted or 0 shows all avatars.',
        size: 'Default avatar size; individual avatars can override it.',
        compact: 'Reduces every avatar’s diameter; children cannot opt out.',
        ringColor: 'Ring colour between avatars. Defaults to the page background.',
        label:
          'Accessible group name. Consumer <code>aria-label</code> or <code>aria-labelledby</code> takes precedence.',
      },
      slots: {
        default: 'Avatars to group.',
        overflow: 'Content replacing the overflow count. Receives <code>count</code>.',
      },
    },
  },
}
