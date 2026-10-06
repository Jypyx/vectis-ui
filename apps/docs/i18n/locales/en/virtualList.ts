export default {
  title: 'Virtual list',
  lead: '<code>VVirtualList</code> renders only the rows near its viewport, for lists too long to render whole. It is its own scroll container: give it a <code>height</code>, or a bounded height in your own CSS.',
  examples: {
    variableHeights: {
      title: 'Rows of different heights',
      text: '<code>itemSize</code> is only the height assumed for rows not rendered yet. Each row is measured once and remembered under its <code>itemKey</code>; set it when rows can be inserted, removed or reordered.',
    },
    scrollToIndex: {
      title: 'Scrolling to a row',
      text: 'The <code>scrollToIndex(index, align)</code> method renders the row if needed and brings it into view: at the <code>start</code>, <code>center</code> or <code>end</code>, or with the smallest movement by default.',
    },
    infiniteScroll: {
      title: 'Infinite scroll',
      text: '<code>hasMore</code> emits <code>load-more</code> as the end of the list comes into view. Append the next rows to <code>items</code>; <code>loading</code> ends the list with a loading row meanwhile.',
    },
    focusableRows: {
      title: 'Focusable rows',
      text: 'The list has the <code>list</code> role and takes the focus, so the keyboard scrolls it. The row holding the focus stays rendered while the list scrolls away. When every row holds a control, <code>tabindex="-1"</code> removes the list’s own tab stop. Find-in-page only reaches rendered rows: offer a search for long lists.',
    },
  },
  api: {
    VVirtualList: {
      props: {
        items: 'Every row of the list. Only those near the viewport are rendered.',
        itemKey:
          'Field identifying a row, under which its measured height is remembered. Defaults to the row position.',
        itemSize: 'Height assumed for a row not rendered yet, in pixels. Only an estimate.',
        overscan: 'Rows rendered beyond each edge of the viewport.',
        initialCount: 'Rows rendered on the server and until hydration.',
        height: 'Height of the list: pixels or any CSS length.',
        label: 'Accessible name of the list.',
        loading: 'Ends the list with a loading row and marks it <code>aria-busy</code>.',
        loadingText: 'Text of the loading row. Defaults to the library dictionary.',
        hasMore:
          'Emits <code>load-more</code> as the end of the list comes into view. The total is then announced as unknown.',
      },
      events: {
        loadMore: 'The end of the list came into view: append the next rows.',
      },
      slots: {
        default: 'One row. Receives <code>item</code> and <code>index</code>.',
        loading: 'Content replacing the spinner and the text of the loading row.',
      },
    },
  },
}
