export default {
  title: 'Date picker',
  lead: 'An inline calendar grid. Every date it holds is a plain local-time <code>YYYY-MM-DD</code> string and never a <code>Date</code>, so a value cannot shift a day across time zones.',

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
