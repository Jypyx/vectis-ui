export default {
  title: 'Data table',
  lead: 'Rows with searching, sorting, selection and pagination. It does all four itself over the rows it is given, or hands them to a server and simply reports what is being asked for.',

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
