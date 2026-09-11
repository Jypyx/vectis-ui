export default {
  title: 'Data table',
  lead: 'Rows with searching, sorting, selection and pagination. It does all four itself over the rows it is given, or hands them to a server and simply reports what is being asked for.',

  examples: {
    sorting: {
      title: 'Sorting',
      text: 'A column marked <code>sortable</code> gets a heading that can be clicked, and the table orders the rows itself: ascending, then descending, then back to the order it was given. The ascending icon points down, the spreadsheet convention, since sorting A to Z reads downwards. The sort is a model, so a table can open on a column already sorted and what the reader clicks can be read back. Changing it leaves the reader on the page they were on.',
    },
    search: {
      title: 'Search',
      text: '<code>searchable</code> puts a field in the toolbar. Only the declared columns are searched, ignoring case and accents, so eclair finds Éclair and the reader never has to know where the diacritic went. The term is a model of its own, <code>v-model:search</code>, which is what lets the search be driven from elsewhere on the page. Searching sends the reader back to the first page: the page they were on says nothing about the rows that are left.',
    },
    pagination: {
      title: 'Pagination',
      text: 'Any page size above zero turns the pagination on, so passing one down is enough, bound or not. The page is clamped by derivation rather than written to, so a page past the last simply shows the last and rows disappearing under a search never leave the reader looking at nothing. <code>showRange</code> adds the count beside the nav, which is what tells the reader how much is left when the rows themselves cannot.',
    },
    rowsPerPage: {
      title: 'Rows per page',
      text: '<code>perPageOptions</code> adds a menu to the footer, letting the reader choose how many rows a page holds. Bind <code>v-model:per-page</code> to know what was chosen, or leave it and the table keeps it to itself. Changing the size sends the reader back to the first page, the one number that is still meaningful once the pages have been cut differently.',
    },
    selection: {
      title: 'Selection',
      text: 'A checkbox on every row, and one in the heading for the whole page. <code>rowKey</code> is required with it: what comes back are the identities that field gives, never the row objects, and without one a row is identified by its position, which sorting, filtering and paging all corrupt. A selection survives a change of page while the heading checkbox covers the visible page alone, which is why it can be indeterminate. Naming the row checkboxes from the row itself is worth the line: "Select row" tells a screen reader user nothing about which one.',
    },
    toolbar: {
      title: 'Toolbar',
      text: 'The <code>#header</code> slot replaces the <code>title</code> prop and takes the left of the toolbar, the search field keeping the right. Filters belong there, and the filtering itself stays yours: the table shows the rows it is given and narrows them further with its own search, so the two work on top of one another rather than against one another.',
    },
    customCells: {
      title: 'Custom cells',
      text: "A slot named after a column key replaces what that column's cells show, and receives the row, the raw value and the column. Searching and sorting still read the underlying value, so a formatted number sorts as a number and a status drawn as a chip is still found by the word it carries.",
    },
    customHeadings: {
      title: 'Custom headings',
      text: 'A slot named <code>head-</code> plus the column key replaces a heading. On a sortable column it renders inside the sort button, so keep it to text and decoration: a control there would be a control inside a control, which nothing in the accessibility tree can make sense of. The sort state is already carried by the heading itself.',
    },
    variants: {
      title: 'Variants',
      text: "Flat carries no decoration at all and sits on whatever surface it is placed on. Outlined makes the table a card, with a raised background, a border and rounded corners, and opens a gutter so the toolbar, the caption and the footer do not touch the frame. The heading takes the frame's own background, which is what keeps a sticky heading from showing a seam.",
    },
    compact: {
      title: 'Compact',
      text: 'One step tighter on every cell, and on everything the table renders with them: the search field, the page size menu and the pagination all take the shorter step, so the whole component stays one object rather than a dense table surrounded by roomy furniture.',
    },
    striped: {
      title: 'Striped rows',
      text: 'Tints every other row, which helps the eye follow a long line across the table. The space left under the last row stays bare: rows have no fixed height, so there is nothing to measure a continuing pattern against.',
    },
    stickyHeader: {
      title: 'Sticky header',
      text: "Keeps the column headings in place while the rows scroll under them. It needs a bounded scrolling area to work, either the <code>height</code> prop as below or a parent with a height of its own. The headings are painted on the table's own surface, so the rows pass behind them rather than through them.",
    },
    fullHeight: {
      title: 'Full height',
      text: "<code>height</code> bounds the whole component, toolbar and footer included, a number being read as pixels. Left out, the table takes its parent's height whenever the parent has one: only the rows stretch and scroll, the toolbar and the footer keeping their places whatever the page holds. A parent with no height of its own changes nothing, so this costs nothing where it is not wanted.",
    },
    responsive: {
      title: 'Narrow containers',
      text: "Too narrow to hold its columns, the table scrolls sideways, or turns each row into a card with its column headings repeated inside it. The threshold is the component's own width rather than the window's, measured by a container query, so a table in a narrow panel stacks while the page around it stays wide.",
    },
    serverSide: {
      title: 'Server side',
      text: "<code>serverSide</code> hands the searching, the sorting and the paging over: the rows are shown exactly as they arrive, and <code>update:params</code> reports every change of what is being asked for. Pass <code>total</code> so the pagination and the range can be right about rows the table never holds. Nothing is emitted when the table appears, the first page being the page's own business, which is what stops every table fetching twice. The search is delayed by <code>searchDebounce</code>, and the term and the return to the first page arrive as one emission rather than two.",
    },
    states: {
      title: 'Loading and empty',
      text: "<code>loading</code> shows a spinner in place of the rows, and it is answered before emptiness, so a table waiting for its rows never claims there are none. With nothing to show and nothing loading, <code>emptyText</code> is said instead, in the design system's own words unless you supply yours.",
    },
    fullTable: {
      title: 'A complete table',
      text: 'Everything at once: a title, a search, a selection, four sortable columns, cells of its own, and a footer carrying the selection count, the page size, the range and the pagination.',
    },
  },

  api: {
    VDataTable: {
      props: {
        columns: 'The columns to show, in order.',
        rows: 'The rows to show.',
        rowKey:
          'Which field identifies a row. Without it a row is identified by its position, which is enough for display but not for a selection: it must be given as soon as rows can be selected, or the selection follows the positions rather than the rows.',
        caption:
          'A sentence describing what the table holds. It is announced before the table itself, and is what tells a screen reader user whether it is worth exploring.',
        variant:
          'How the table is framed: nothing at all, or a card with a raised background, a border and rounded corners.',
        responsive:
          'What happens when the component is too narrow: the table scrolls sideways, or each row becomes a card with its column headings repeated inside it.',
        loading: 'Shows that the rows are being loaded.',
        emptyText:
          'What is said when there is no row to show. It falls back to the design system dictionary.',
        title:
          'A title above the table, on the left of its toolbar. It shadows the HTML attribute of the same name on the component itself, an accepted trade-off: a tooltip over a whole table would be of little use.',
        searchable: 'Adds a search field to the toolbar.',
        searchPlaceholder:
          'What that field says while empty. It falls back to the design system dictionary.',
        searchLabel:
          'What screen readers announce for the search field. It falls back to the design system dictionary.',
        searchDebounce:
          'When a server does the searching, how long to wait after a keystroke before asking it, in milliseconds. Zero asks at once.',
        striped: 'Tints every other row, which helps the eye follow a long line across the table.',
        stickyHeader:
          'Keeps the column headings in place while the rows scroll under them. It needs a bounded scrolling area to work: either the <code>height</code> prop, or a parent with a height of its own.',
        compact: 'Tightens the cells by one step, and everything the table renders with them.',
        height:
          "The height of the whole component, toolbar and pagination included: a number is read as pixels, anything else as a CSS length. Left out, the table takes its parent's height whenever the parent has one.",
        sortIcon: 'The heading icon of a column that can be sorted but currently is not.',
        sortAscIcon:
          'The icon of an ascending sort. It points down by default, the spreadsheet convention: sorting A to Z reads downwards.',
        sortDescIcon: 'The icon of a descending sort.',
        perPageOptions: 'The choices offered for how many rows a page holds.',
        perPageLabel: 'What that choice is called. It falls back to the design system dictionary.',
        total:
          'How many rows there are in all on the server. It is what lets the pagination and the range be right when the table only ever holds one page.',
        showRange: 'Shows which rows are being looked at, "1 to 10 of 42", in the footer.',
        rangeLabel: 'Rephrases that range. It falls back to the design system dictionary.',
        selectable: 'Adds a checkbox to every row, and one in the heading to take the whole page.',
        selectAllLabel:
          'What the heading checkbox is announced as. It falls back to the design system dictionary.',
        selectionLabel:
          'How the selection is summed up in the footer. It says nothing at all when nothing is selected, and falls back to the design system dictionary.',
        selectRowLabel:
          'What a row\'s checkbox is announced as. "Select row" tells a screen reader user nothing about which row, so this is worth supplying with something from the row itself. It falls back to the design system dictionary.',
        serverSide:
          'Hands the searching, the sorting and the paging over to a server: the rows are shown exactly as they arrive, and every change of what is being asked for is reported so the server can answer it.',
        vModelSort:
          'Which column the rows are sorted by, and in which direction. Nothing is sorted to begin with. It may be driven from outside or simply left to the table, which sets it as headers are clicked; changing it does not send the reader back to the first page.',
        vModelPage:
          'The page being shown, counted from 1. Searching or changing the page size sends it back to the first. It is clamped by derivation rather than written to, so a page beyond the last simply displays the last.',
        vModelPerPage:
          'How many rows a page holds. Any value above zero turns the pagination on, so passing one down without binding it is enough to enable it.',
        vModelSelected:
          'The selected rows, as the identities <code>rowKey</code> gives them, never the row objects themselves. Nothing is selected to begin with, and a selection survives a change of page: the header checkbox covers the visible page alone, which is why it can be indeterminate.',
        vModelSearch:
          'What is typed in the search field, empty to begin with. Only the declared columns are searched, accent- and case-insensitively; in server mode nothing is filtered here and the term is reported instead.',
      },
      events: {
        updateParams:
          'What the table is being asked for, in server mode: the search, the sort, the page and the page size. It fires on every change and never on mount.',
      },
      slots: {
        header: 'The left side of the toolbar, replacing the <code>title</code> prop.',
      },
    },
  },
}
