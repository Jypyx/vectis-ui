export default {
  title: 'Combobox',
  lead: 'A field that searches a list and keeps what is chosen, one value or several. The options may be flat, grouped or separated, and they may arrive from a server as the reader types.',

  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: 'A <code>label</code> is rendered above the field and a <code>hint</code> below it, both tied to it so a screen reader reads them with it. The panel is anchored to the field itself rather than to the component, which also holds those two: it opens against the field and covers the hint while it is open, instead of starting a hint lower down. Typing narrows the list on the label, ignoring accents, so reunion finds Réunion and the reader never has to know where the diacritic went.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Three heights, 32, 40 and 48 pixels, each with its <code>compact</code> pair 4px shorter. The panel takes the size the field was given, so the rows, their icons and their padding follow with nothing else to set. The chips of a multiple field sit one step below the field, and the field forces its search input to their height, which is what stops the row growing the moment it takes focus.',
    },
    states: {
      title: 'States',
      text: 'A disabled field cannot be reached at all, and an invalid one is for a rule the browser cannot check by itself. <code>readonly</code> sits between the two: the choice is shown but frozen, so nothing can be typed, the list never opens and the chips lose their crosses, while the field keeps its normal contrast, takes the focus and can be copied from. <code>loading</code> with no option yet says so across the whole panel, and the chevron becomes a spinner; with options already listed it moves to the foot of the list, since what is loading is then the next page. A panel with nothing to show says <code>emptyText</code> rather than opening empty, and <code>clearable</code> adds a cross that empties the selection and the search together.',
    },
    placement: {
      title: 'Placement',
      text: 'Where the list opens relative to the field. The panel is anchored in CSS, so this names a preference rather than a position: a browser short of room below already flips the panel above on its own, and the value only decides which side is tried first. Only the block axis is offered, since a list opening beside a text field would leave the reader looking in the wrong place. The two alignments are visible below because the options are wider than the fields, the panel being at least as wide as what it is anchored to and free to take more.',
    },
    groups: {
      title: 'Groups and separators',
      text: 'An entry of <code>options</code> is an option, a named block of them, or a separator, and the three mix freely. Filtering keeps that structure honest: a group none of whose options survive disappears with its name, and a separator left stranded at either end, or against another one, is dropped. Keyboard navigation stays flat all the same, so the arrow keys walk the rows in the order they are read and never stop on a heading.',
    },
    multiple: {
      title: 'Multiple selection',
      text: 'The value becomes a list and each chosen option shows as a chip inside the field, removable one at a time. Out of focus the search input folds away so the chips alone are left, with no empty strip beside them, and it comes back the moment the field is focused. The array is never mutated in place, so a watcher on the model fires as it should.',
    },
    fieldIcon: {
      title: 'Field icon',
      text: '<code>iconStart</code> puts an icon inside the field, at the start, and it is rendered before whatever else fills that zone. That is what lets it survive the chips of a multiple field instead of being replaced by them. It is decorative until a <code>@click:icon-start</code> listener is attached, which turns it into a real button and makes <code>iconStartLabel</code> necessary. The end of the field belongs to the component: the chevron, the spinner that takes its place while loading, and the clear cross to their left.',
    },
    icons: {
      title: 'Option icons',
      text: "An option's <code>icon</code> is drawn in the slot the row provides, so it is aligned and spaced like every other row's, which an icon put in the option slot would not be, that content being rendered inside the label. It takes the same values as every icon prop in the library. A row given no icon starts straight at its label rather than reserving a blank column for one.",
    },
    asynchronous: {
      title: 'Asynchronous search',
      text: 'Turn <code>filter</code> off and the options are shown exactly as their source hands them over. <code>search</code> carries the term, delayed by <code>searchDebounce</code> while typing and sent at once when the panel opens so a first page can load. The same term is never emitted twice in a row, so reopening the panel repeats no request. Answers can still arrive out of order, which the token below is for: a slow reply to an old keystroke must not overwrite a fresh one.',
    },
    infiniteScroll: {
      title: 'Infinite scroll',
      text: '<code>hasMore</code> puts a sentinel at the foot of the panel, and <code>load-more</code> fires as it comes into view. The next-page spinner appears in the same place, leaving the options already loaded where they are. Each page is asked for once: the sentinel cannot come back into view until the page being awaited has landed and pushed it down.',
    },
    customOption: {
      title: 'Custom options',
      text: 'The <code>#option</code> slot replaces the label of a row with content of your own, a second line or a badge, and receives the option along with whether the row is highlighted and whether it is already chosen. It is rendered inside the label, so the row keeps the alignment, the padding and the selection tick the panel gives it. For an icon alone, the icon field of the option is the better route.',
    },
    customChip: {
      title: 'Custom chips',
      text: 'The <code>#chip</code> slot replaces the chip standing for one chosen value. Three of the things it receives are what keep it usable: <code>remove</code>, without which the value could no longer be taken back, and <code>size</code> and <code>compact</code>, the step the field worked out for its chips, which nothing outside the component can guess. The option may be missing, if that value has never appeared among the options, which is why the icon below is read through an optional chain.',
    },
  },

  api: {
    VCombobox: {
      props: {
        options:
          'What the list offers. An entry may be an option, a named block of options, or a separator; a plain list of options remains perfectly valid.',
        multiple:
          'Allows several values to be chosen, which makes the value a list and shows what has been chosen as chips inside the field.',
        label: 'The label above the field, tied to it so that clicking it focuses the field.',
        hint: 'A line of help under the field, read out along with the label.',
        size: 'The height of the field: 32, 40 or 48 pixels. The panel and its rows follow it.',
        compact: 'Takes 4px off the height, as everywhere else in the design system.',
        placeholder: 'What the field says while nothing is chosen and nothing has been typed.',
        disabled: 'Makes the field unusable, greyed out through the colour tokens.',
        readonly:
          'Shows what has been chosen without letting it be changed: nothing can be typed, the list never opens, the chips lose their crosses and no clear cross is offered. The field keeps the focus and can be copied from, which is what separates it from <code>disabled</code>.',
        invalid: 'Marks the field as invalid, for a rule of your own.',
        iconStart:
          'An icon inside the field, at the start. It is rendered before the chips rather than in their place. Decorative until a <code>@click:icon-start</code> listener turns it into a button.',
        iconStartLabel: 'What the start icon does, in words, once it is clickable.',
        clearable: 'Offers a cross that empties both the selection and the search.',
        clearLabel:
          'What that cross does, in words. It falls back to the design system dictionary.',
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
        placement:
          'Where the list opens relative to the field. The panel is anchored in CSS, so this names a preference: a browser short of room already falls back on its own.',
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
