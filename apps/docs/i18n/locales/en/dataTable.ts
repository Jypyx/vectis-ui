export default {
  title: 'Data table',
  lead: '<code>VDataTable</code> displays rows with search, sorting, selection and pagination. Process data locally or use server mode to request each result set.',
  examples: {
    sorting: {
      title: 'Sorting',
      text: 'Mark columns <code>sortable</code>. Their headings cycle through ascending, descending and original order. Observe or set the sort with <code>v-model:sort</code>.',
    },
    search: {
      title: 'Search',
      text: '<code>searchable</code> adds a field searching declared columns without case or accent sensitivity. Control the query with <code>v-model:search</code>.',
    },
    pagination: {
      title: 'Pagination',
      text: 'Set <code>v-model:per-page</code> above 0 to enable pagination. <code>showRange</code> displays the visible row range.',
    },
    rowsPerPage: {
      title: 'Rows per page',
      text: '<code>perPageOptions</code> offers page sizes in the footer.',
    },
    selection: {
      title: 'Selection',
      text: '<code>selectable</code> adds row checkboxes and a page-wide checkbox. Provide a stable <code>rowKey</code>; <code>v-model:selected</code> contains those identifiers.',
    },
    toolbar: {
      title: 'Toolbar',
      text: 'The <code>title</code> slot replaces the toolbar title; search remains on the other side.',
    },
    customCells: {
      title: 'Custom cells',
      text: 'A slot matching a column key replaces its cells. It receives the row, raw value and column; sorting and search still use the raw value.',
    },
    customHeadings: {
      title: 'Custom headings',
      text: 'Use <code>head-</code> followed by a column key to customize its heading. Sortable headings contain a button: keep slot content non-interactive.',
    },
    variants: {
      title: 'Variants',
      text: '<code>flat</code> leaves the table unframed; <code>outlined</code> adds a card surface and border.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> reduces cell spacing and control height.',
    },
    striped: {
      title: 'Striped rows',
      text: '<code>striped</code> tints alternate rows.',
    },
    stickyHeader: {
      title: 'Sticky header',
      text: '<code>stickyHeader</code> keeps headings visible in a bounded scroll area. Set <code>height</code> or constrain the parent height.',
    },
    fullHeight: {
      title: 'Full height',
      text: '<code>height</code> bounds the whole component, including toolbar and footer. Numbers use pixels; strings use CSS lengths.',
    },
    serverSide: {
      title: 'Server side',
      text: '<code>serverSide</code> displays supplied rows without local search, sort or pagination. Listen to <code>update:params</code>, fetch the rows and provide <code>total</code>. <code>searchDebounce</code> delays search requests.',
    },
    virtual: {
      title: 'Long tables',
      text: '<code>virtual</code> renders only the rows near the visible part of the table, for tables of thousands of rows. Like <code>stickyHeader</code>, it needs a bounded height. Rows are measured as they render, and the heading checkbox still takes every row.',
    },
    infiniteScroll: {
      title: 'Infinite scroll',
      text: '<code>hasMore</code> emits <code>load-more</code> as the end of the rows comes into view. Append the next rows to <code>rows</code>; while <code>loading</code>, the rows already there stay on show.',
    },
    states: {
      title: 'Loading and empty',
      text: 'Loading takes precedence over empty results. Customize these states with <code>loadingText</code>, <code>emptyText</code> or their slots.',
    },
    fullTable: {
      title: 'A complete table',
      text: 'Combines search, sorting, selection, custom cells and pagination.',
    },
  },
  api: {
    VDataTable: {
      props: {
        columns: 'Columns in display order.',
        rows: 'Rows to display.',
        rowKey:
          'Stable row identifier field. Required for selection; otherwise row position is used.',
        caption: 'Table description announced by assistive technology.',
        variant: 'Unframed or outlined table.',
        loading: 'Displays loading content instead of rows.',
        loadingText: 'Visible loading text. Defaults to the dictionary.',
        emptyText:
          'Title of the <code>VEmptyState</code> shown for empty results. Defaults to the dictionary, which distinguishes no data from a search without results.',
        title: 'Toolbar title. Also names the table when no caption is provided.',
        searchable: 'Adds a toolbar search field.',
        searchPlaceholder: 'Search placeholder. Defaults to the dictionary.',
        searchLabel: 'Accessible search field name. Defaults to the dictionary.',
        searchDebounce: 'Server search delay in milliseconds. 0 requests immediately.',
        striped: 'Tints alternate rows.',
        stickyHeader: 'Keeps headings visible while scrolling. Requires a bounded height.',
        compact: 'Reduces cell spacing and control height.',
        height:
          'Whole component height. Numbers use pixels; strings use CSS lengths. Otherwise inherits a constrained parent height.',
        sortIcon: 'Icon of an unsorted sortable column.',
        sortAscIcon: 'Ascending sort icon.',
        sortDescIcon: 'Descending sort icon.',
        perPageOptions: 'Page sizes offered in the footer.',
        perPageText: 'Page-size control label. Defaults to the dictionary.',
        total: 'Total server row count for pagination and range display.',
        showRange: 'Displays the visible row range in the footer.',
        rangeText:
          'Function formatting <code>{ start, end, total }</code>. Defaults to the dictionary.',
        selectable: 'Adds row checkboxes and a visible-page checkbox.',
        selectAllLabel: 'Accessible page-selection name. Defaults to the dictionary.',
        selectionText:
          'Function formatting the selected count. Defaults to the dictionary; empty with no selection.',
        selectRowLabel:
          'Function naming each checkbox from its row and global zero-based index. Defaults to a row number.',
        serverSide:
          'Delegates search, sort and pagination to the server through <code>update:params</code>.',
        virtual:
          'Renders only the rows near the visible part of the table. Needs a bounded height; rows then carry <code>aria-rowindex</code>.',
        hasMore:
          'Emits <code>load-more</code> as the end of the rows comes into view. The rows stay on show while loading.',
        vModelSort:
          'Sort key and direction, or <code>null</code>. Changing sort preserves the page.',
        vModelPage:
          'Page number from 1. Search and page-size changes reset it to 1. Out-of-range values display the nearest page without rewriting the model.',
        vModelPerPage: 'Rows per page. Values above 0 enable pagination.',
        vModelSelected:
          'Selected <code>rowKey</code> identifiers, preserved across pages. The header checkbox covers the rows of the page shown, rendered or not.',
        vModelSearch:
          'Search query. Local search ignores case and accents; server mode reports it without filtering.',
      },
      events: {
        loadMore:
          'The end of the rows came into view while <code>hasMore</code> is set: append the next rows.',
        updateParams:
          'Server-mode query changes: search, sort, page and page size. Does not fire on mount or for unchanged values.',
      },
      slots: {
        title: 'Content replacing the toolbar title.',
        loading: 'Content replacing the loading spinner and text.',
        empty:
          'Empty-result content, replacing the default <code>VEmptyState</code>. Receives the current <code>search</code>.',
      },
    },
  },
}
