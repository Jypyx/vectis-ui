export default {
  title: 'Breadcrumb',
  lead: '<code>VBreadcrumb</code> displays a navigation trail from an item array and marks the current page using its URL.',
  examples: {
    separator: {
      title: 'Custom separator',
      text: '<code>separatorIcon</code> replaces the separator between segments.',
    },
    icons: {
      title: 'With icons',
      text: 'Each item can include a decorative <code>icon</code> beside its label.',
    },
    truncated: {
      title: 'Truncation',
      text: 'Beyond <code>maxItems</code>, the trail keeps the first and last two items. An ellipsis menu lists the hidden items.',
    },
  },
  api: {
    VBreadcrumb: {
      props: {
        items: 'Trail items, from the root to the current level.',
        label: 'Accessible navigation name. Defaults to the dictionary.',
        currentPath:
          'URL used to identify the current item. Trailing slashes, query strings and hashes are ignored.',
        separatorIcon: 'Separator icon. Mirrors in right-to-left layouts.',
        maxItems: 'Truncation threshold, with an effective minimum of 3.',
        ellipsisLabel: 'Accessible ellipsis menu name. Defaults to the dictionary.',
      },
    },
  },
}
