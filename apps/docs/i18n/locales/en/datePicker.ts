export default {
  title: 'Date picker',
  lead: 'An inline calendar grid. Every date it holds is a plain local-time <code>YYYY-MM-DD</code> string and never a <code>Date</code>, so a value cannot shift a day across time zones.',

  examples: {
    range: {
      title: 'Range',
      text: 'The value becomes a start and an end. The first click sets one, the second sets the other, and between them the span under the pointer is previewed so the reader sees what they are about to take. Clicking a day before the start begins again from there rather than producing a period that runs backwards.',
    },
    multiple: {
      title: 'Multiple dates',
      text: 'The value becomes a list, and a day already in it comes back out when it is clicked again. The array is never mutated in place, so a watcher on the model fires as it should. Nothing bounds the count: a calendar with forty days selected is legible, and whether that is sensible is the form to decide.',
    },
    presets: {
      title: 'Presets',
      text: 'The <code>#footer</code> slot is a strip under the grid, for actions or for the dates a reader reaches for most often. It receives nothing, being simply a place to render into: the buttons below write the model like any other control would. The clock is read inside the handler and never at setup, the server having no way to know what day it is where the reader stands.',
    },
    disabledDates: {
      title: 'Disabled dates',
      text: 'Given a list, the named days cannot be chosen. Given a function, it is asked about one date at a time, which is what turns a rule such as "no weekends" into a line rather than an enumeration. Either way a closed day stays visible and struck through, and the keyboard still reaches it: a reader arrowing across the grid is never silently jumped over a day, and the calendar says why by drawing it rather than by hiding it.',
    },
    bounds: {
      title: 'Minimum and maximum',
      text: '<code>min</code> and <code>max</code> bound the navigation as well as the choice, so the arrows stop at the edge instead of wandering into months holding nothing that can be taken. Days outside the bounds are drawn like the closed ones, and the month and year views are bounded in the same way.',
    },
    events: {
      title: 'Event dots',
      text: 'Up to three dots under a day, to say something is happening there. The colour is any CSS colour, so a token keeps it in step with both themes, and a dot given none takes the accent. Give each one a <code>label</code>: assistive technology reads that, the dot itself carrying nothing anyone can hear.',
    },
    adjacentDays: {
      title: 'Adjacent days',
      text: 'A month rarely starts on the first column, so the corners of the grid are empty by default. <code>showAdjacentDays</code> fills them with the neighbouring months, greyed and inert, which is what keeps the weeks reading as whole weeks. <code>selectAdjacentDays</code> makes them choosable as well, and picking one moves the calendar to its month, so it implies showing them.',
    },
    localization: {
      title: 'Localization',
      text: 'The tag decides the month and day names and the day the weeks start on, all of it derived from <code>Intl</code> rather than tabulated here. <code>locale</code> takes precedence over the global one and falls back to it when left out, so a single calendar can differ from the rest of the page. <code>firstDayOfWeek</code> overrides the day the locale would have chosen, for a domain that starts its weeks somewhere else.',
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
