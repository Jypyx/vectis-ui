export default {
  title: 'Combobox',
  lead: 'A field that searches a list and keeps what is chosen, one value or several. The options may be flat, grouped or separated, and they may arrive from a server as the reader types.',

  api: {
    VCombobox: {
      props: {
        options:
          'What the list offers. An entry may be an option, a named block of options, or a separator; a plain list of options remains perfectly valid.',
        multiple:
          'Allows several values to be chosen, which makes the value a list and shows what has been chosen as chips inside the field.',
        size: 'The height of the field: 32, 40 or 48 pixels. The panel and its rows follow it.',
        compact: 'Takes 4px off the height, as everywhere else in the design system.',
        placeholder: 'What the field says while nothing is chosen and nothing has been typed.',
        disabled: 'Makes the field unusable, greyed out through the colour tokens.',
        invalid: 'Marks the field as invalid, for a rule of your own.',
        clearable: 'Offers a cross that empties both the selection and the search.',
        emptyText: 'What the panel says when the search matches nothing.',
        filter:
          'How the list is narrowed as one types. Turning it off means the options already arrive filtered by their source and are shown exactly as they come. A rule of your own receives the query as it was typed, merely trimmed, not the accent-insensitive form used internally.',
        searchDebounce:
          'How long to wait before telling the source what is being searched for, in milliseconds. Zero tells it at once, which suits a source that is not a network request.',
        loading:
          'Says that something is being loaded. With no option yet, the whole panel says so; with options already listed, a spinner appears at the foot of the list, since what is loading is then the next page. Either way the field replaces its chevron with a spinner.',
        loadingText: 'What is said while loading, and what the spinner is announced as.',
        hasMore:
          'Says that there are more pages to come, which is what makes the component ask for the next one as the end of the list comes into view.',
        vModel:
          "The chosen option's value, or the list of them when <code>multiple</code> is set. It is an empty string to begin with, and the array is never mutated in place.",
      },
      events: {
        search:
          'What is being searched for, to be sent to the source. It is delayed by <code>searchDebounce</code> while typing, and emitted at once when the panel opens so that a first page can be loaded. The same term is never emitted twice in a row.',
        loadMore: 'The end of the list has come into view: send the next page.',
      },
      slots: {
        option:
          'What a row of the list shows, in place of the plain label: a subtitle, an avatar, a badge. It is told whether the row is the highlighted one and whether it is already chosen.',
        chip: 'Replaces the chip standing for one chosen value. It receives <code>remove</code>, without which the value could no longer be taken back, and the size and density worked out to sit inside the field, which cannot be guessed from outside. The option itself may be missing, if that value has never appeared among the options.',
        empty: 'What the panel shows when nothing matches. It receives the term that was searched.',
        loading: 'What the panel shows while loading its first options.',
      },
    },
  },
}
