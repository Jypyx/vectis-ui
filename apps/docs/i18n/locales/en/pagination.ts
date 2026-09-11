export default {
  title: 'Pagination',
  lead: 'A row of page buttons. Every pill is a VButton, so nothing about their states is redefined here, and the row can shed pages as the space narrows without a breakpoint.',

  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: 'Every pill is a button, so nothing about hovering, focusing or disabling is written twice. The current page is always filled, whatever the variant says: what <code>itemVariant</code> paints is the OTHER pages and the controls, ghost by default or outlined. The tone is the colour the current page takes, the rest of the row staying neutral, and it offers the three a button offers: an intention rather than a state.',
    },
    detached: {
      title: 'Detached',
      text: 'The row is a segmented control by default, its buttons joined and only the two ends rounded. <code>detached</code> spaces them out and gives each its own corners, which is the same word in the same direction as VButtonGroup and VToggle.',
    },
    elevated: {
      title: 'Elevated',
      text: 'Raises the row off the page. Joined, the shadow belongs to the row rather than to each pill: the segments overlap by a pixel, so a shadow apiece would fall into every joint and fill the row with dark bands instead of lifting one object. Detached there are no joints, and every button carries its own.',
    },
    sizes: {
      title: 'Sizes',
      text: 'The five steps every control shares, 24 to 56 pixels, each with its <code>compact</code> pair 4px shorter. A pill is square at one digit and widens by itself past that, its minimum width deriving from the control height, so nothing is set per size.',
    },
    length: {
      title: 'Length',
      text: 'How many pages there are in all. It is one by default, which renders a single page, so the real count almost always has to be given. Every page is rendered unless <code>totalVisible</code> says how many slots to keep.',
    },
    totalVisible: {
      title: 'Total visible',
      text: 'How many slots the row renders, ellipses counted among them. That is what keeps the width CONSTANT: walk through the pages and nothing moves sideways, because the window around the current page shifts at the ends rather than shrinking. The first and last pages are always kept, and below five slots there would be nothing left to show around the current one, so five is the effective minimum.',
    },
    controls: {
      title: 'Previous and next',
      text: 'One prop rather than a boolean beside a union: you pick what the controls show, an icon, a word, or both, or leave them out entirely. The icons and the wording are yours, and a label is both the visible text and the accessible name, which is what keeps a control named once a narrow row hides its text and leaves only the glyph.',
    },
    unreachablePages: {
      title: 'Unreachable pages',
      text: 'Which pages cannot be reached, as a list when you know them or as a function when the rule is easier to write than to enumerate. It is a behaviour rather than a state: the previous and next controls step OVER those pages rather than stopping at one, and disable themselves only when there is nothing left to step to, which covers the ends of the row without a rule of their own.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> puts the whole row out of reach, greyed through the colour tokens like every other control. At either end of the range the matching control disables itself, there being nothing to step to, which is the same mechanism an unreachable page runs into.',
    },
    alignment: {
      title: 'Alignment',
      text: 'Where the row sits in the width it is given. It only says something in responsive mode, which is what makes the nav take the whole width available; outside it the row keeps an intrinsic width and sits wherever its parent puts it. That is also why a pagination in a table footer needs no <code>flex</code> of its own.',
    },
    responsive: {
      title: 'Narrow containers',
      text: "The row sheds pages as the space narrows, hiding the neighbours of the current page one step at a time while the first page, the last and the current one never go. It asks about its OWN width rather than the window's, so a pagination inside a narrow panel folds while the page around it stays wide, and the arrow keys skip whatever is hidden. It is off by default because it makes the nav take the full width available. No ellipsis is added to stand for a hidden neighbour: it is as wide as the pill it replaces.",
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
