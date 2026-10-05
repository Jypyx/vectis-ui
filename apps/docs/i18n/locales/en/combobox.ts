export default {
  title: 'Combobox',
  lead: '<code>VCombobox</code> searches a list and selects one or more values. Options can be grouped, separated or loaded asynchronously.',
  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: 'Use <code>label</code> to name the field and <code>hint</code> for help text.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> adjusts the field and option rows. <code>compact</code> reduces the field height.',
    },
    states: {
      title: 'States',
      text: 'Use <code>disabled</code>, <code>readonly</code> and <code>invalid</code> for field states, <code>loading</code> during requests, and <code>clearable</code> to clear the selection.',
    },
    placement: {
      title: 'Placement',
      text: '<code>placement</code> sets the preferred panel position. The browser can adjust it to available space.',
    },
    groups: {
      title: 'Groups and separators',
      text: '<code>options</code> accepts options, named groups and separators.',
    },
    multiple: {
      title: 'Multiple selection',
      text: '<code>multiple</code> uses an array for the selection and displays removable chips.',
    },
    textDisplay: {
      title: 'Values as text',
      text: '<code>display="text"</code> joins selected labels on one line. Deselect options in the list, or remove the last value with Backspace when the search is empty.',
    },
    maxValues: {
      title: 'Visible selection limit',
      text: '<code>max</code> limits visible values while the field is unfocused. Focus reveals all values. Customize the hidden count with <code>overflowText</code> or <code>#overflow</code>.',
    },
    fieldIcon: {
      title: 'Field icon',
      text: '<code>iconStart</code> adds a leading icon. <code>hideExpandIcon</code> hides the chevron; focus still opens the list.',
    },
    icons: {
      title: 'Option icons',
      text: 'Set an option’s <code>icon</code> to display it beside the label.',
    },
    asynchronous: {
      title: 'Asynchronous search',
      text: 'Set <code>:filter="false"</code> for server-filtered options. <code>searchDebounce</code> delays search events.',
    },
    infiniteScroll: {
      title: 'Infinite scroll',
      text: '<code>hasMore</code> enables <code>load-more</code> when the list end becomes visible. Append the next page to <code>options</code>.',
    },
    customOption: {
      title: 'Custom options',
      text: 'Use <code>#option</code> to customize option content.',
    },
    customChip: {
      title: 'Custom chips',
      text: 'Use <code>#chip</code> to customize selected chips and connect their remove action.',
    },
  },
  api: {
    VCombobox: {
      props: {
        options: 'Options, named groups or separators. Each option has a value and label.',
        multiple: 'Allows multiple selection. Use an array for <code>v-model</code>.',
        display:
          'Multiple-selection display: removable chips or comma-separated text. Single selection always uses text.',
        max: 'Visible selection count while unfocused. Focus shows all values. Omitted or zero shows all values. Applies only with <code>multiple</code>.',
        overflowText:
          'Formats the count of values hidden by <code>max</code>. Receives the hidden count.',
        label:
          'Visible label. Without a visible name, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code>, is linked through <code>aria-describedby</code> and is announced when it appears.',
        hint: 'Help text linked through <code>aria-describedby</code>.',
        size: 'Field and option size. The field inherits a size set by <code>VInputGroup</code>.',
        compact: 'Reduces the control height without changing text or icons.',
        placeholder: 'Placeholder shown when the field is empty.',
        disabled: 'Disables interaction.',
        readonly:
          'Prevents typing and selection changes. Keeps focus and copying available; hides clear actions and prevents opening the list.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        iconStart:
          'Leading icon before selected values. A <code>@click:icon-start</code> listener makes it a button requiring <code>iconStartLabel</code>.',
        iconStartLabel: 'Accessible name of the start icon button.',
        expandIcon:
          'Decorative chevron. Clicking it closes an open list; focus on the field opens the list.',
        hideExpandIcon:
          'Hides the chevron. Focus still opens the list and loading still shows a spinner.',
        clearable: 'Adds an action to clear both selection and search.',
        clearLabel: 'Accessible name of the clear button. Defaults to the library dictionary.',
        emptyText:
          'Empty-state text announced to screen readers. Keep it consistent with custom <code>#empty</code> content.',
        filter:
          'Built-in accent-insensitive filtering, disabled filtering, or a custom function receiving the option and trimmed query.',
        searchDebounce:
          'Delay in milliseconds before emitting a typed search. Zero emits immediately.',
        loading:
          'Shows a field spinner and a panel loading state: full panel with no options, or list footer with existing options.',
        loadingText:
          'Loading text announced to screen readers. Keep it consistent with custom <code>#loading</code> content.',
        hasMore: 'Enables requests for another page when the list end becomes visible.',
        placement: 'Preferred panel position relative to the field.',
        vModel:
          'Selected string or number, or an array with <code>multiple</code>. Defaults to an empty string.',
      },
      events: {
        search:
          'Emits the search term after <code>searchDebounce</code>, or immediately on opening. Consecutive duplicate terms are skipped.',
        loadMore: 'Requests the next page when the list end becomes visible.',
        clear: 'Emitted after clearing selection and search.',
        clickIconStart: 'Emitted when the start icon button is activated.',
      },
      slots: {
        option: 'Option content. Receives the option, index, active state and selected state.',
        chip: 'Selected chip. Receives value, label, optional option, <code>remove</code>, size and compact state. Connect the remove action.',
        overflow:
          'Hidden selection count. Receives <code>count</code>, chip size and compact state.',
        empty: 'Empty-state content. Receives the search query; also set <code>emptyText</code>.',
        loading: 'Initial loading content. Also set <code>loadingText</code>.',
        valueEnd: 'Content before the clear action and expand icon.',
        start: 'Content after <code>iconStart</code>, without replacing it.',
      },
    },
  },
}
