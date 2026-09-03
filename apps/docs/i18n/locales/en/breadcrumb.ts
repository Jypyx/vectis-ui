export default {
  title: 'Breadcrumb',
  lead: 'The trail back up from the page being read. It is data-driven: one list of segments, and the current one is worked out from the address rather than marked by hand.',

  examples: {
    separator: {
      title: 'Custom separator',
      text: 'The chevron between two segments is the <code>separator</code> prop, and it takes any icon value. The first trail below passes one of the icons the library ships; the second passes an image through <code>{ src }</code>, which is the route for a mark no icon set has. Mind the difference: a drawn icon inherits the text colour and follows the theme, an image carries its own, so it has to be legible on both grounds.',
    },
    icons: {
      title: 'With icons',
      text: 'Each segment takes an <code>iconStart</code>, on the same terms as anywhere else in the library: one of the library icons, a name your icon set answers to, or an explicit render. Keep it to a mark that says something the label does not, since the label is what a screen reader reads out and the icon is decorative.',
    },
    truncated: {
      title: 'Truncation',
      text: 'Past <code>maxItems</code>, the trail keeps its first segment and its last two and folds everything between them behind an ellipsis, which opens a menu listing the hidden segments alone. Three is the effective floor: below that there is nothing left in the middle to fold. The current page is never among the hidden, being the last segment.',
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
