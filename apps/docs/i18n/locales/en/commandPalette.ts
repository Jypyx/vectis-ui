export default {
  title: 'Command palette',
  lead: '<code>VCommandPalette</code> opens a search field over a list of commands in a native modal dialog. Type to narrow the list, use the arrows to move and Enter to run a command. The <code>shortcut</code> prop opens it from anywhere in the page.',
  examples: {
    groups: {
      title: 'Groups',
      text: 'Pass commands, named groups and separators in <code>items</code>. <code>keywords</code> are matched without being shown, and the <code>shortcut</code> of a command is displayed only.',
    },
    links: {
      title: 'Links',
      text: 'A command with <code>href</code> is a link: Enter follows it, and a modified click opens it in a new tab. With a router, call <code>event.preventDefault()</code> in <code>select</code> and navigate yourself.',
    },
    asyncSearch: {
      title: 'Asynchronous search',
      text: 'Set <code>filter</code> to <code>false</code> and load the commands on <code>search</code>, which is debounced. <code>loading</code> shows a spinner in the field.',
    },
    recent: {
      title: 'Recent commands',
      text: 'The palette keeps no history. Record choices from <code>select</code> and add a group of recent commands while <code>v-model:query</code> is empty.',
    },
  },
  api: {
    VCommandPalette: {
      props: {
        items: 'Commands, named groups and separators.',
        shortcut:
          'Page-wide shortcut that toggles the palette, such as <code>mod+k</code>. Ignored while typing in another field. Adds <code>aria-keyshortcuts</code> to the trigger.',
        filter:
          'Built-in accent-insensitive filtering on labels and keywords, disabled filtering, or a custom function receiving the command and trimmed query.',
        searchDebounce:
          'Delay in milliseconds before emitting a typed search. Zero emits immediately.',
        loading: 'Shows a field spinner, and a loading row while no command is available.',
        loadingText:
          'Loading text announced to screen readers. Keep it consistent with custom <code>#loading</code> content.',
        emptyText:
          'Title of the default <code>VEmptyState</code>, also announced to screen readers. Keep it consistent with custom <code>#empty</code> content.',
        placeholder: 'Placeholder of the search field. Defaults to the library dictionary.',
        label: 'Accessible name of the palette and its list. Defaults to the library dictionary.',
        searchLabel: 'Accessible name of the search field. Defaults to the library dictionary.',
        hideFooter: 'Hides the footer listing the keys.',
        width: 'Palette width: pixels for numbers, otherwise a CSS length.',
        vModelOpen: 'Palette open state. Native dismissal updates the model.',
        vModelQuery: 'Search text. Emptied when the palette closes.',
      },
      events: {
        select:
          'Emitted with the command and the click event when a command is chosen. The palette then closes unless the command has <code>keepOpen</code>.',
        search:
          'Emits the search term after <code>searchDebounce</code>, or immediately on opening. Consecutive duplicate terms are skipped.',
      },
      slots: {
        trigger: 'Opening control. Bind the supplied <code>triggerProps</code>.',
        item: 'Label and description of a row. Receives the command and its active state.',
        empty: 'Empty-state content. Receives the search query; also set <code>emptyText</code>.',
        loading: 'Loading content. Also set <code>loadingText</code>.',
        footer: 'Replaces the footer listing the keys.',
      },
    },
  },
}
