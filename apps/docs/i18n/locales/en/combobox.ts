export default {
  title: 'Combobox',
  lead: 'A field that searches a list and keeps what is chosen, one value or several. The options may be flat, grouped or separated, and they may arrive from a server as the reader types.',

  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: '<code>label</code> renders a descriptive text above the field, and <code>hint</code> renders a helper text below it.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Sets the field height to 32, 40, or 48 pixels. The <code>compact</code> prop reduces this height by 4px.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> makes the field unusable. <code>readonly</code> prevents changes but keeps the field focusable. <code>invalid</code> marks the field as having an error. <code>loading</code> displays a loading indicator. <code>emptyText</code> defines the message shown when there are no options. <code>clearable</code> adds an icon to clear the selection.',
    },
    placement: {
      title: 'Placement',
      text: 'Sets the preferred opening direction (above or below the field) for the options list panel.',
    },
    groups: {
      title: 'Groups and separators',
      text: 'The <code>options</code> prop accepts a flat list, or can be structured with named groups and separators.',
    },
    multiple: {
      title: 'Multiple selection',
      text: '<code>multiple</code> allows selecting several values, which are displayed as removable chips inside the field.',
    },
    textDisplay: {
      title: 'Values as text',
      text: '<code>display="text"</code> shows the chosen values as their labels joined by commas, on one line cut short with an ellipsis. The field keeps the height of an ordinary control, and under the focus the line leaves at least half of it to the search. A value is removed by unticking it in the list, with Backspace on an empty search, or with the <code>clearable</code> cross.',
    },
    maxValues: {
      title: 'Values shown while folded',
      text: '<code>max</code> keeps the first chosen values in view and sums the rest up as "+X", in chips or in text alike. It applies while the field is out of focus: focused, every value comes back so it can be seen and removed. <code>overflowText</code> rephrases the count, and the <code>#overflow</code> slot replaces it.',
    },
    fieldIcon: {
      title: 'Field icon',
      text: '<code>iconStart</code> displays an icon at the beginning of the field. <code>iconStartLabel</code> provides an accessible label if the icon is made interactive.',
    },
    icons: {
      title: 'Option icons',
      text: "An option's <code>icon</code> property displays an icon alongside its label in the dropdown list.",
    },
    asynchronous: {
      title: 'Asynchronous search',
      text: 'Disabling <code>filter</code> shows options exactly as provided by the source. <code>searchDebounce</code> sets the delay in milliseconds before emitting the search term.',
    },
    infiniteScroll: {
      title: 'Infinite scroll',
      text: '<code>hasMore</code> indicates that more pages are available, triggering a <code>load-more</code> event when the end of the list comes into view.',
    },
    customOption: {
      title: 'Custom options',
      text: 'The <code>#option</code> slot allows customizing the content and layout of an option row (e.g., adding a badge or a second line).',
    },
    customChip: {
      title: 'Custom chips',
      text: 'The <code>#chip</code> slot allows customizing the appearance of the selected value chips.',
    },
  },

  api: {
    VCombobox: {
      props: {
        options:
          'What the list offers. An entry may be an option, a named block of options, or a separator; a plain list of options remains perfectly valid.',
        multiple:
          'Allows several values to be chosen, which makes the value a list and shows what has been chosen inside the field, as chips or as text depending on <code>display</code>.',
        display:
          'How the chosen values are shown when several can be chosen: one dismissible chip each, or their labels joined by commas on a single line, cut short with an ellipsis. It changes nothing for a single value, which is always text.',
        max: 'How many chosen values to show before the rest are summed up as "+X", as chips or as text. It applies while the field is out of focus; focused, every value comes back so it can be seen and removed. Left out, or set to 0, every value is shown. It changes nothing without <code>multiple</code>.',
        overflowText:
          'Rephrases the "+X" standing for the values beyond <code>max</code>, "+5 products" for instance. It receives the number of values being hidden.',
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
        expandIcon:
          'The chevron at the end of the field, which turns as the list opens. Clicking it while the list is open closes the list. It is decoration all the same: the field itself opens the list and Escape closes it from the keyboard, so the chevron is hidden from screen readers and takes no label.',
        clearable: 'Offers a cross that empties both the selection and the search.',
        clearLabel:
          'What that cross does, in words. It falls back to the design system dictionary.',
        emptyText:
          'What the panel says when the search matches nothing. A screen reader hears it even when the <code>#empty</code> slot draws something else, so set both together.',
        filter:
          'How the list is narrowed as one types. Turning it off means the options already arrive filtered by their source and are shown exactly as they come. A rule of your own receives the query as it was typed, merely trimmed, not the accent-insensitive form used internally.',
        searchDebounce:
          'How long to wait before telling the source what is being searched for, in milliseconds. Zero tells it at once, which suits a source that is not a network request.',
        loading:
          'Says that something is being loaded. With no option yet, the whole panel says so; with options already listed, a spinner appears at the foot of the list, since what is loading is then the next page. Either way the field replaces its chevron with a spinner.',
        loadingText:
          'What is said while loading, and what the spinner is announced as. A screen reader hears it even when the <code>#loading</code> slot draws something else, so set both together.',
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
        clear: 'The clear cross emptied the selection and the search.',
        clickIconStart:
          'The start icon was clicked. Attaching this listener is what turns that icon into a real button, which then needs <code>iconStartLabel</code>.',
      },
      slots: {
        option:
          'What a row of the list shows, in place of the plain label: a subtitle, an avatar, a badge. It is told whether the row is the highlighted one and whether it is already chosen.',
        chip: 'Replaces the chip standing for one chosen value. It receives <code>remove</code>, without which the value could no longer be taken back, and the size and density worked out to sit inside the field, which cannot be guessed from outside. The option itself may be missing, if that value has never appeared among the options.',
        overflow:
          'Replaces the "+X" standing for the values beyond <code>max</code>. It receives <code>count</code>, the number of values being hidden, and the size and density of the chips inside the field, so that a chip of your own lines up with the others.',
        empty: 'What the panel shows when nothing matches. It receives the term that was searched.',
        loading: 'What the panel shows while loading its first options.',
        valueEnd:
          'Controls of your own inside the field, placed before the ones the field owns: the clear cross and the icon that opens the panel. Those two are the component own affordance, which is why there is no <code>end</code> slot here.',
        start:
          'Content at the start of the field, rendered after <code>iconStart</code> rather than in its place.',
      },
    },
  },
}
