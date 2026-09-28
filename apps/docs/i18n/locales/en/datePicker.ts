export default {
  title: 'Date picker',
  lead: '<code>VDatePicker</code> is an inline calendar for a date, a range or several dates. Values are local dates in <code>YYYY-MM-DD</code> format.',
  examples: {
    range: {
      title: 'Range',
      text: 'Select the start and end of the range in two steps. The model is <code>{ start, end }</code>; either bound can be <code>null</code> while the range is incomplete.',
    },
    multiple: {
      title: 'Multiple dates',
      text: 'Select dates to add them to the ISO date array; select them again to remove them.',
    },
    presets: {
      title: 'Presets',
      text: 'Place preset date buttons in <code>footer</code> and update the model from them.',
    },
    disabledDates: {
      title: 'Disabled dates',
      text: '<code>disabledDates</code> accepts ISO dates or a predicate. Unavailable days remain visible and reachable with the keyboard.',
    },
    bounds: {
      title: 'Minimum and maximum',
      text: '<code>min</code> and <code>max</code> restrict both selection and calendar navigation.',
    },
    events: {
      title: 'Event dots',
      text: 'Mark events with coloured dots. Their labels are included in the day’s accessible name.',
    },
    adjacentDays: {
      title: 'Adjacent days',
      text: 'Show neighbouring days with <code>showAdjacentDays</code>. Enable their selection with <code>selectAdjacentDays</code>.',
    },
    localization: {
      title: 'Localization',
      text: '<code>locale</code> sets month names and week start. <code>firstDayOfWeek</code> overrides the week start.',
    },
  },
  api: {
    VDatePicker: {
      props: {
        selection: 'Selection mode: one date, a range or several dates.',
        locale: 'BCP 47 locale for date display and week start. Overrides the global locale.',
        firstDayOfWeek: 'First weekday, from 0 (Sunday) to 6 (Saturday). Defaults to the locale.',
        min: 'Earliest selectable date, in <code>YYYY-MM-DD</code> format. Also limits navigation.',
        max: 'Latest selectable date, in <code>YYYY-MM-DD</code> format. Also limits navigation.',
        disabledDates:
          'Unavailable dates: an array of ISO strings or a predicate. Days remain visible and reachable with the keyboard.',
        showAdjacentDays: 'Shows days from neighbouring months.',
        selectAdjacentDays:
          'Allows selecting days from neighbouring months and navigates to that month. Implies <code>showAdjacentDays</code>.',
        events:
          'Events shown as up to three dots per day. Each accepts a date, CSS colour and accessible label.',
        disabled: 'Disables selection and navigation.',
        readonly: 'Prevents selection. Month and year navigation remain available.',
        label:
          'Accessible name of the calendar. Defaults to the dictionary; consumer <code>aria-label</code> takes precedence.',
        vModel:
          'ISO date or <code>null</code> for single selection, <code>{ start, end }</code> for a range, ISO date array for multiple selection.',
      },
      events: {
        select: 'A date was selected. Receives the current model, including an incomplete range.',
      },
      slots: {
        day: 'Day cell content. Receives <code>iso</code>, <code>day</code>, <code>inMonth</code>, <code>disabled</code>, <code>selected</code>, <code>today</code>, <code>inRange</code> and <code>events</code>.',
        footer: 'Actions or preset dates below the grid.',
      },
    },
  },
}
