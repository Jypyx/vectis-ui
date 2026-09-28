export default {
  title: 'Calendar',
  lead: '<code>VCalendar</code> displays events in day, week, month or year views. Move and resize events with the pointer or keyboard; provide your own creation and editing forms.',
  examples: {
    month: {
      title: 'Month',
      text: '<code>monthEventLimit</code> caps the event cards shown per day. A count indicates the remaining events.',
    },
    year: {
      title: 'Year',
      text: 'The year view shows twelve months. Selecting a month opens its detailed view.',
    },
    customView: {
      title: 'Custom view',
      text: '<code>customDays</code> sets the number of days in the custom view and the navigation step.',
    },
    weekdays: {
      title: 'Which days are shown',
      text: '<code>weekdays</code> controls which weekdays appear and their order. Its first entry overrides <code>firstDayOfWeek</code>. Use <code>dayStart</code> and <code>dayEnd</code> to limit the visible hours.',
    },
    allDay: {
      title: 'All-day events',
      text: 'Events marked <code>allDay</code> or lasting at least 24 hours appear in the all-day band. Shorter events crossing midnight appear on both days; an end at midnight belongs to the previous day.',
    },
    overlapping: {
      title: 'Overlapping events',
      text: 'Overlapping events share the available column width.',
    },
    colours: {
      title: 'Colours',
      text: 'Set an event’s <code>color</code> to a CSS colour. Otherwise, its colour is derived from its identifier.',
    },
    eventSlot: {
      title: 'Custom event content',
      text: 'The <code>event</code> slot replaces the card content. Use its event, time and layout data to adapt the display.',
    },
    editing: {
      title: 'Creating and editing events',
      text: 'Use <code>event-activate</code> and <code>cell-activate</code> to open your editor. With <code>creatable</code>, drawing an empty time range emits <code>event-create</code> without adding an event. Save changes to <code>v-model:events</code>; dragging and resizing update this model directly.',
    },
  },
  api: {
    VCalendar: {
      props: {
        views: 'Views offered in the menu, in display order.',
        customDays: 'Number of days in the custom view and its navigation step.',
        weekdays:
          'Visible weekdays in order, with 0 for Sunday. The first entry overrides <code>firstDayOfWeek</code>.',
        firstDayOfWeek:
          'First weekday when <code>weekdays</code> is omitted. Defaults to the locale; 0 is Sunday.',
        locale: 'Locale for dates and times. Defaults to the global locale.',
        format: '12- or 24-hour display. Defaults to the locale.',
        dayStart: 'First visible hour, from 0.',
        dayEnd: 'End of the visible hours, up to 24.',
        slotDuration: 'Step in minutes for moving, resizing and creating events.',
        scrollTime: 'Initial scroll position, as a time string.',
        hideCurrentTime: 'Hides the current-time indicator.',
        monthEventLimit: 'Maximum event cards per day in the month view.',
        readonly:
          'Prevents moving and resizing events. Navigation and event activation remain available; <code>creatable</code> controls creation.',
        disabled: 'Disables navigation, creation, editing and activation.',
        creatable:
          'Allows drawing an empty time range to emit <code>event-create</code>. Does not insert an event.',
        edgeStepDelay:
          'Delay in milliseconds before a dragged event at an edge changes the visible period. Set to 0 to disable.',
        noEdgeScroll: 'Disables vertical scrolling when dragging near the grid edges.',
        label: 'Accessible name of the calendar.',
        vModelView: 'Displayed view. Defaults to <code>week</code>.',
        vModelDate: 'Anchor date in <code>YYYY-MM-DD</code> format. Defaults to today.',
        vModelEvents:
          'Event array. Moving or resizing emits a new array without mutating the supplied one.',
      },
      events: {
        eventActivate: 'An event was activated. Receives the event.',
        cellActivate:
          'An empty cell was activated. Receives its date and time; month cells use <code>dayStart</code>.',
        eventMove: 'An event moved. Receives the updated event and its previous start and end.',
        eventResize:
          'An event was resized. Receives the updated event and its previous start and end.',
        eventCreate:
          'An empty time range was drawn. Receives its start and end; add the event yourself.',
      },
      slots: {
        actions: 'Toolbar controls between the date range and view menu.',
        event: 'Replaces event card content. Receives the event and its display state.',
        dayHeader:
          'Replaces a day column heading. Receives <code>iso</code>, <code>weekday</code>, <code>dayText</code> and <code>today</code>.',
        allDayLabel: 'Label beside the all-day event band.',
      },
    },
  },
}
