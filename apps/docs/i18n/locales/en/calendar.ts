export default {
  title: 'Calendar',
  lead: 'An agenda to read and rearrange: day, week, month and year views, with events that can be dragged and stretched. Opening one for editing stays with you.',

  api: {
    VCalendar: {
      props: {
        views:
          'Which views the menu offers, in the order it lists them. Narrowing it is how a calendar that only ever shows weeks stops offering anything else.',
        customDays:
          'How many days the custom view shows, and how far Previous and Next step in it.',
        weekdays:
          'Which weekdays are on show, as numbers from 0 for Sunday. The order matters as well: the first entry is the day a week starts on, which is why there is no separate first-day setting. Left out, the seven days in the order the locale puts them.',
        locale:
          'The language the days, months and times are written in. It falls back to the global one.',
        hourFormat: 'Whether times are shown on a 12- or a 24-hour clock. It follows the locale.',
        dayStart: 'The hour the grid starts at, from 0.',
        dayEnd: 'The hour it ends at, up to 24.',
        slotDuration:
          'The step everything snaps to, in minutes: how far a nudge moves an event, and how long a newly created one is.',
        scrollTime:
          'Where the grid is scrolled to when it first appears, so the working day is in view.',
        showCurrentTime:
          "Draws a line across today's column at the time it is now, with a dot on its leading edge. It ticks once a minute while the calendar is on screen.",
        monthEventLimit:
          'How many events a day of the month view shows before it starts counting the rest.',
        editable:
          'Lets events be moved and stretched, by dragging them and with the keyboard. Turning it off leaves them readable and clickable, and nothing else.',
        creatable:
          'Makes an event when an empty part of a day is taken up: a click makes one a step long, a drag makes one as long as it was drawn. The slot signal still fires either way, so you can turn this off and keep it.',
        edgeStepDelay:
          'How long a dragged event has to rest against the side of the calendar before the view turns to the previous or next period, in milliseconds. Zero turns that off. The wait is the point of it: paging the instant the pointer touched the edge would make the last day of a week impossible to aim at.',
        autoScroll: 'Whether dragging near the top or bottom of a time grid scrolls it.',
        label: 'What the calendar is called, for anyone who cannot see it.',
        vModelView: 'Which span the calendar is showing. It opens on the week.',
        vModelDate: 'The day the view is anchored on, as an ISO string. It opens on today.',
        vModelEvents:
          'What is on the calendar. It is a model rather than a plain prop because dragging and resizing write back to it: the calendar rearranges what it is given and hands the new list back, never mutating the one it received.',
      },
      events: {
        eventActivate: 'A card was clicked or activated, the cue to open an editor of your own.',
        slotActivate: 'An empty part of the grid was activated, at this day and this time.',
        eventMove:
          'An event was dragged or nudged somewhere else. It carries the event as it now stands and where it came from, so undoing it needs no copy of your own.',
        eventResize: "An event's end was dragged or nudged, in the same two parts.",
        eventCreate:
          'An event was made by taking up an empty part of a day. It has already been added to the list; this is the cue to give it a real name, or to save it.',
      },
      slots: {
        actions: 'Extra controls in the toolbar, between the range and the view menu.',
        event: "The content of one event's card, replacing the title and times.",
        dayHeader: 'The head of one day column, replacing the weekday and the number.',
        allDayLabel: 'The label beside the band of all-day events.',
      },
    },
  },
}
