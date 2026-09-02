export default {
  title: 'Avatar group',
  lead: 'Avatars stacked into a row, each separated from the next by a ring in the page colour. Past a limit of your choosing, the rest are summed up as a single disc.',

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
