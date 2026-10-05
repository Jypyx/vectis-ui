export default {
  title: 'Drawer',
  lead: '<code>VDrawer</code> opens a native modal panel against one edge of the viewport, and slides it in and out.',
  examples: {
    sides: {
      title: 'Sides',
      text: '<code>side</code> picks the edge. <code>start</code> and <code>end</code> follow the writing direction.',
    },
    size: {
      title: 'Size',
      text: '<code>size</code> sets the width of a drawer on a side, or the height of one at the top or bottom. <code>extent</code> replaces it with any CSS length. A strip of the page always stays uncovered.',
    },
    navigation: {
      title: 'Navigation',
      text: 'The body scrolls while the header and footer stay visible. Close the drawer when an item is selected.',
    },
  },
  api: {
    VDrawer: {
      props: {
        title:
          'Drawer title and accessible name. Ignored when the <code>header</code> slot is provided.',
        subtitle: 'Supporting text below the title.',
        side: 'Edge the drawer comes from. <code>start</code> and <code>end</code> follow the writing direction.',
        size: 'Width on a side, height at the top or bottom.',
        extent: 'Replaces <code>size</code>: pixels for numbers, otherwise a CSS length.',
        hideClose: 'Hides the close button.',
        persistentBackdrop: 'Prevents outside clicks from closing the drawer.',
        persistentEscape:
          'Prevents Escape dismissal only with <code>persistentBackdrop</code>. Otherwise both dismissal routes stay enabled.',
        closeLabel: 'Accessible close button name. Defaults to the dictionary.',
        vModelOpen: 'Drawer open state. Native dismissal updates the model.',
      },
      slots: {
        default: 'Scrollable drawer body.',
        header:
          'Custom header. Provide <code>aria-label</code> or <code>aria-labelledby</code> to name the drawer.',
        headerActions: 'Header controls before the close button.',
        footer: 'Drawer actions.',
        trigger: 'Opening control. Bind the supplied <code>triggerProps</code>.',
      },
    },
  },
}
