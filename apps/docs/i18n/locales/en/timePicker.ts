export default {
  title: 'Time picker',
  lead: '<code>VTimePicker</code> is an inline clock for selecting hours and minutes. Its model uses 24-hour <code>HH:mm</code> values.',
  examples: {
    minuteStep: {
      title: 'Minute step',
      text: '<code>minuteStep</code> sets the pointer and keyboard step. Only reachable minutes appear on the face.',
    },
    restrictions: {
      title: 'What may be chosen',
      text: 'Use time bounds and allowed-hour or allowed-minute rules to restrict choices. An hour is unavailable when it has no allowed minute.',
    },
    hourFormat: {
      title: 'Hour format',
      text: '<code>12h</code> shows one hour ring with AM/PM controls; <code>24h</code> shows two rings. The model always uses 24 hours.',
    },
    localization: {
      title: 'Localization',
      text: 'The locale sets the hour cycle unless <code>format</code> overrides it.',
    },
  },
  api: {
    VTimePicker: {
      props: {
        format: '12- or 24-hour display. Defaults to the locale; the model always uses 24 hours.',
        locale:
          'BCP 47 locale for time display. Overrides the global locale; <code>format</code> takes precedence.',
        minuteStep: 'Minute step for the clock and arrow keys.',
        min: 'Earliest allowed time, inclusive, in <code>HH:mm</code> format.',
        max: 'Latest allowed time, inclusive, in <code>HH:mm</code> format.',
        allowedHours: 'Allowed hours: an array or predicate receiving a 24-hour value.',
        allowedMinutes: 'Allowed minutes: an array or predicate.',
        disabled: 'Disables interaction.',
        readonly:
          'Prevents value changes. The face remains focusable and the hour/minute display can still be switched.',
        label:
          'Accessible name of the clock. Defaults to the dictionary; consumer <code>aria-label</code> takes precedence.',
        vModel:
          'Time in 24-hour <code>HH:mm</code> format, or <code>null</code>. An empty clock shows midnight.',
      },
      events: {
        confirm:
          'Keyboard confirmation of the minute selection. Receives the current time; releasing the pointer does not emit it.',
      },
      slots: {
        footer: 'Actions below the clock.',
      },
    },
  },
}
