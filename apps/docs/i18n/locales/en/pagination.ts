export default {
  title: 'Pagination',
  lead: 'A row of page buttons. Every pill is a VButton, so nothing about their states is redefined here, and the row can shed pages as the space narrows without a breakpoint.',

  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: '<code>itemVariant</code> paints the pages that are not current and the controls, ghost by default or outlined. <code>tone</code> is the colour the current page takes, the rest of the row staying neutral.',
    },
    detached: {
      title: 'Detached',
      text: '<code>detached</code> spaces the buttons out and gives each its own corners, instead of joining them into a segmented control.',
    },
    elevated: {
      title: 'Elevated',
      text: '<code>elevated</code> raises the row off the page. Joined, the shadow belongs to the row; detached, every button carries its own.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the height, from 24 to 56 pixels, and <code>compact</code> takes 4px off it. A pill is square at one digit and widens by itself past that.',
    },
    length: {
      title: 'Length',
      text: '<code>length</code> is how many pages there are in all, one by default. Every page is rendered unless <code>totalVisible</code> says how many slots to keep.',
    },
    totalVisible: {
      title: 'Total visible',
      text: '<code>totalVisible</code> is how many slots the row renders, ellipses counted among them, which is what keeps its width constant. The first and last pages are always kept, and five is the effective minimum.',
    },
    controls: {
      title: 'Previous and next',
      text: '<code>controls</code> decides what the previous and next buttons show: an icon, a word, both, or nothing at all. Their icons and their wording are yours, a label being both the visible text and the accessible name.',
    },
    unreachablePages: {
      title: 'Unreachable pages',
      text: '<code>disabledPages</code> takes a list of pages, or a function when the rule is easier to write than to enumerate. The previous and next controls step over those pages and disable themselves only when there is nothing left to step to.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> puts the whole row out of reach, greyed through the colour tokens. At either end of the range the matching control disables itself.',
    },
    alignment: {
      title: 'Alignment',
      text: '<code>align</code> says where the row sits in the width it is given. It only says something in responsive mode, which is what makes the nav take the whole width available.',
    },
    responsive: {
      title: 'Narrow containers',
      text: "<code>responsive</code> sheds pages as the space narrows, hiding the neighbours of the current page one step at a time while the first page, the last and the current one never go. It measures its own width rather than the window's.",
    },
  },

  api: {
    VPagination: {
      props: {
        length:
          'How many pages there are in all. It is 1 by default, which renders a single page: the real count almost always has to be given.',
        totalVisible:
          'How many slots to render, ellipses counted among them, so the row keeps exactly the same width whichever page is current. Below five there would be nothing left to show around the current page, so five is the effective minimum. Left out, every page is rendered.',
        detached:
          'Separates the buttons instead of joining them into one segmented control. It is the word VButtonGroup and VToggle use for the same question, in the same direction.',
        itemVariant:
          'How the pages other than the current one, and the controls, are drawn. The current page is always filled, whatever this says. It is named for the items because that is what it paints: on VTabs and VDataTable <code>variant</code> names the decoration of the frame instead.',
        tone: 'The colour the current page takes. The other pages and the controls stay neutral.',
        size: 'The height of the buttons, from the scale shared by every control.',
        compact: 'Takes 4px off the height of every button.',
        elevated:
          'Raises the row off the page. Joined, the shadow belongs to the row rather than to each pill, which is what stops it falling into the joints; detached, every button carries its own.',
        align:
          'Where the row sits in the space it is given. It only matters in responsive mode, where the row takes the whole width available.',
        controls:
          'The previous and next buttons on either side of the pages: what they show, or <code>false</code> to leave them out. One prop rather than two, the shape VFilePicker <code>preview</code> and VCarousel <code>controls</code> already use.',
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
