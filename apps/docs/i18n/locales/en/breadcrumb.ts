export default {
  title: 'Breadcrumb',
  lead: 'The trail back up from the page being read. It is data-driven: one list of segments, and the current one is worked out from the address rather than marked by hand.',

  examples: {
    separator: {
      title: 'Custom separator',
      text: '<code>separator</code> replaces the chevron drawn between two segments, and takes any icon value.',
    },
    icons: {
      title: 'With icons',
      text: 'Each segment takes an <code>iconStart</code>, decorative beside the label a screen reader reads.',
    },
    truncated: {
      title: 'Truncation',
      text: 'Past <code>maxItems</code>, the trail keeps its first segment and its last two, and folds the rest behind an ellipsis opening a menu of the hidden segments.',
    },
  },

  api: {
    VBreadcrumb: {
      props: {
        items: 'The segments of the trail, ordered from the most general down to the deepest.',
        label:
          'The name screen readers announce for this navigation. It falls back to the design system dictionary, in the current language.',
        currentPath:
          'The address of the page being displayed. The segment whose <code>href</code> matches it is the current one; a trailing slash on either side makes no difference.',
        separator: 'The icon drawn between two segments.',
        maxItems:
          'The length past which the trail folds: only the first segment, an ellipsis button and the last two remain, the button opening a menu that lists the hidden segments alone. Below 3 there would be nothing left to fold, so 3 is the effective minimum.',
        ellipsisLabel:
          'The name screen readers announce for the ellipsis button. It falls back to the design system dictionary.',
      },
    },
  },
}
