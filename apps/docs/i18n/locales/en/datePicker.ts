export default {
  title: 'Date picker',
  lead: 'An inline calendar grid. Every date it holds is a plain local-time <code>YYYY-MM-DD</code> string and never a <code>Date</code>, so a value cannot shift a day across time zones.',

  examples: {
    range: {
      title: 'Range',
      text: '<code>selection</code> set to <code>range</code> makes the value a start and an end, the span under the pointer being previewed between the two clicks.',
    },
    multiple: {
      title: 'Multiple dates',
      text: '<code>selection</code> set to <code>multiple</code> makes the value a list, a day already in it coming back out when it is clicked again.',
    },
    presets: {
      title: 'Presets',
      text: 'The <code>#footer</code> slot is a strip under the grid, for actions or for the dates a reader reaches for most. The buttons in it write the model like any other control.',
    },
    disabledDates: {
      title: 'Disabled dates',
      text: '<code>disabledDates</code> takes a list of days, or a function asked about one date at a time. A closed day stays visible, struck through, and reachable by keyboard.',
    },
    bounds: {
      title: 'Minimum and maximum',
      text: '<code>min</code> and <code>max</code> bound the navigation as well as the choice, in every view.',
    },
    events: {
      title: 'Event dots',
      text: '<code>events</code> draws up to three dots under a day. Each takes any CSS colour and a <code>label</code>, which is what assistive technology reads.',
    },
    adjacentDays: {
      title: 'Adjacent days',
      text: '<code>showAdjacentDays</code> fills the corners of the grid with the neighbouring months, greyed and inert. <code>selectAdjacentDays</code> makes them choosable as well, and picking one moves the calendar to its month.',
    },
    localization: {
      title: 'Localization',
      text: '<code>locale</code> decides the month and day names and the day the weeks start on, and takes precedence over the global locale. <code>firstDayOfWeek</code> overrides the day that locale would have chosen.',
    },
  },

  api: {
    VDatePicker: {
      props: {
        selection:
          'What the reader is picking: a single date, a period between two dates, or any number of separate dates. It determines the shape of the value.',
        locale:
          "A BCP 47 locale, which decides the month and day names and the first day of the week. It takes precedence over the design system's global locale and falls back to it, which is why it has no literal default.",
        firstDayOfWeek:
          'Forces the day the weeks start on, 0 for Sunday through 6 for Saturday. Left out, the locale decides.',
        min: 'The earliest selectable date, as an ISO string. Neither navigation nor selection goes back beyond it.',
        max: 'The latest selectable date, as an ISO string. Neither navigation nor selection goes past it.',
        disabledDates:
          'Dates that cannot be chosen, given as a list of ISO strings or as a function. They stay visible, struck through, and can still be reached with the keyboard.',
        showAdjacentDays:
          'Also fills the empty corners of the grid with the greyed days of the neighbouring months.',
        selectAdjacentDays:
          'Lets those neighbouring days be clicked, which moves the calendar to their month. A clickable day has to be visible, so this implies showing them.',
        events: 'The events to mark, as up to three coloured dots under the day they fall on.',
        disabled:
          'Makes the whole calendar unusable: no date can be chosen, no month reached, and everything greys out through the colour tokens.',
        readonly:
          'Shows what is selected without letting it be changed. The calendar can still be read and walked through, another month or another year, which is what separates it from <code>disabled</code>.',
        label:
          'The accessible name of the whole picker, its header and its grid together. A range shown as two calendars side by side needs one each, or a screen reader announces the same group twice. It falls back to the dictionary, and a consumer <code>aria-label</code> wins.',
        vModel:
          'What is selected, and its shape follows <code>selection</code>: an ISO string for a single date, a start and end pair for a period, an array for several. Nothing is selected to begin with.',
      },
      events: {
        select: 'A date was chosen, with the value as it now stands.',
      },
      slots: {
        day: 'Replaces the content of a day cell, to show a price or an availability under the number. It receives everything known about that day, including whether it belongs to the displayed month.',
        footer: 'The strip under the grid, for actions such as Close or Save, or for preset dates.',
      },
    },
  },
}
