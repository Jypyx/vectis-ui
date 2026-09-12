export default {
  title: 'Avatar group',
  lead: 'Avatars stacked into a row, each separated from the next by a ring in the page colour. Past a limit of your choosing, the rest are summed up as a single disc.',

  examples: {
    overflow: {
      title: 'Overflow',
      text: '<code>max</code> sets how many avatars are drawn before the rest are summed up as <code>+N</code> on a last disc.',
    },
    size: {
      title: 'Size on the group',
      text: '<code>size</code> on the group applies to every avatar inside, the overflow disc included. An avatar that sets a size of its own keeps it.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> on the group takes 4px off every avatar in the row.',
    },
    customOverflow: {
      title: 'Custom overflow',
      text: 'The <code>#overflow</code> slot replaces the <code>+N</code> disc and receives <code>count</code>, the number of avatars being hidden.',
    },
    tooltips: {
      title: 'With tooltips',
      text: 'Each avatar can be wrapped in a VTooltip. The trigger has to be focusable, hence <code>clickable</code> here.',
    },
  },

  api: {
    VAvatarGroup: {
      props: {
        max: 'How many avatars to show before the remaining ones are summed up as a single "+X" disc. Left out, or set to 0, every avatar is shown.',
        size: 'The size given to the avatars inside the group. An avatar that sets a size of its own keeps it.',
        compact:
          'Applies the reduced density to the avatars inside, on the same terms as the size.',
        ringColor:
          'The colour of the ring drawn around each disc. It defaults to the page background, which is what makes the ring read as a gap between two avatars.',
      },
      slots: {
        default: 'The VAvatars to stack.',
        overflow:
          'Replaces the "+X" disc standing for the avatars beyond <code>max</code>. It receives <code>count</code>, the number being hidden.',
      },
    },
  },
}
