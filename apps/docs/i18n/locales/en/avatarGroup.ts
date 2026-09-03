export default {
  title: 'Avatar group',
  lead: 'Avatars stacked into a row, each separated from the next by a ring in the page colour. Past a limit of your choosing, the rest are summed up as a single disc.',

  examples: {
    overflow: {
      title: 'Overflow',
      text: "<code>max</code> is how many discs are drawn before the rest are summed up as one. The count comes from the avatars you passed, so nothing has to be told how many there are, and the last disc carries the remainder as <code>+N</code>. Left out, every avatar is shown. Every demo on this page sits on a raised card, hence the <code>ringColor</code> each one passes: over the page's own background the default is already right.",
    },
    size: {
      title: 'Size on the group',
      text: 'The group hands its <code>size</code> to every avatar inside, the overflow disc included, and the overlap follows: each disc bites into the one before it by a share of its own height, so a row scales with no number to adjust. An avatar that sets a size of its own keeps it, and its overlap follows that size instead.',
    },
    compact: {
      title: 'Compact',
      text: 'Same terms as the size: <code>compact</code> reaches every avatar in the row and takes 4px off each. The second row below is the first one with the prop set.',
    },
    customOverflow: {
      title: 'Custom overflow',
      text: 'The <code>#overflow</code> slot replaces the <code>+N</code> disc and receives <code>count</code>, the number of avatars being hidden. That is what lets the disc carry a colour of your own, become a button opening the full list, or say something other than a number. Give it an <code>alt</code> once it is interactive: <code>+2</code> on its own tells a screen reader nothing.',
    },
    tooltips: {
      title: 'With tooltips',
      text: 'A VTooltip can wrap each avatar, the overflow disc included. Two things follow from that. The trigger has to be able to take focus, so the avatars here are <code>clickable</code>; and the wrapper the tooltip inserts between the group and the avatar changes nothing about the row, the overlap being written against whatever the direct children of the group turn out to be.',
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
