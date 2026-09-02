export default {
  title: 'Pagination',
  lead: 'A row of page buttons. Every pill is a VButton, so nothing about their states is redefined here, and the row can shed pages as the space narrows without a breakpoint.',

  api: {
    VPagination: {
      props: {
        length:
          'How many pages there are in all. It is 1 by default, which renders a single page: the real count almost always has to be given.',
        totalVisible:
          'How many slots to render, ellipses counted among them, so the row keeps exactly the same width whichever page is current. Below five there would be nothing left to show around the current page, so five is the effective minimum. Left out, every page is rendered.',
        attached: 'Joins every button into one segmented control.',
        variant:
          'How the pages other than the current one, and the controls, are drawn. The current page is always filled, whatever this says.',
        tone: 'The colour the current page takes. The other pages and the controls stay neutral.',
        size: 'The height of the buttons, from the scale shared by every control.',
        compact: 'Takes 4px off the height of every button.',
        align:
          'Where the row sits in the space it is given. It only matters in responsive mode, where the row takes the whole width available.',
        showControls: 'Shows the previous and next buttons on either side of the pages.',
        controlsDisplay: 'Whether those controls show an icon, their label, or both.',
        prevIcon: 'The icon of the previous control.',
        nextIcon: 'The icon of the next control.',
        prevLabel:
          'The wording of the previous control, used both as its visible text and as what screen readers announce. It falls back to the design system dictionary.',
        nextLabel:
          'The wording of the next control, used both as its visible text and as what screen readers announce. It falls back to the design system dictionary.',
        disabled: 'Makes the whole component unusable.',
        disabledPages:
          'Which pages cannot be reached, as a list or as a function. The previous and next controls step over them rather than stopping at one.',
        responsive:
          'Lets the row shed pages as the space narrows, by asking about its own width. It is off by default, because it makes the row take the full width available.',
        label:
          'What screen readers announce for the navigation itself. It falls back to the design system dictionary.',
        pageLabel:
          'How a page is announced. A pill shows a bare number, which alone means nothing to a screen reader: this is what turns it into "Page 3". It falls back to the design system dictionary.',
        vModel: 'The page being shown, counted from 1. It starts on the first.',
      },
    },
  },
}
