export default {
  title: 'Calendar',
  lead: 'An agenda to read and rearrange: day, week, month and year views, with events that can be dragged and stretched. Opening one for editing stays with you.',

  examples: {
    month: {
      title: 'Month',
      text: 'The month view draws each day as a square holding its events as chips. <code>monthEventLimit</code> caps how many are shown before the rest are counted.',
    },
    year: {
      title: 'Year',
      text: 'The year view shows twelve small months for orientation. The busy days are ringed and choosing a month opens it.',
    },
    customView: {
      title: 'Custom view',
      text: 'The <code>custom</code> view leaves the length to you: <code>customDays</code> says how many days it shows, and how far Previous and Next step.',
    },
    weekdays: {
      title: 'Which days are shown',
      text: '<code>weekdays</code> decides which days appear at all, as numbers from 0 for Sunday, its first entry being the day a week starts on. Without it, <code>firstDayOfWeek</code> sets that first day over the locale. <code>dayStart</code> and <code>dayEnd</code> crop the hours shown in the time grids.',
    },
    allDay: {
      title: 'All-day events',
      text: '<code>allDay</code> puts an event in the band above the grid, where an event lasting 24 hours or more already goes. One running past midnight for less than that stays in the grid, as a card in each of its two days. One ending at midnight exactly belongs to its first day alone.',
    },
    overlapping: {
      title: 'Overlapping events',
      text: 'Events happening at once share the width of their day, grouped into clusters so a crowded morning does not narrow a lone afternoon meeting.',
    },
    colours: {
      title: 'Colours',
      text: 'An event with no <code>color</code> takes a hue derived from its id. One naming a colour of its own uses it for its leading edge and a wash of its face.',
    },
    eventSlot: {
      title: 'Custom event content',
      text: 'The <code>#event</code> slot replaces what a card shows and receives the event, its formatted <code>timeText</code>, the <code>layout</code> it is drawn in, whether it continues before or after the day, and whether it is being dragged or held by the keyboard.',
    },
    editing: {
      title: 'Creating and editing events',
      text: 'The calendar reports what the reader did and leaves the list to you, so creating and editing come down to three events and one dialog. Drawing out a slot with <code>creatable</code> fires <code>event-create</code> with both ends, clicking an empty cell fires <code>cell-activate</code> with a start only, and a button in the <code>#actions</code> slot opens a blank form. Clicking a card fires <code>event-activate</code>, which opens the same form filled in. Saving writes a new array to <code>v-model:events</code>, the same model dragging and resizing already write to.',
    },
  },

  api: {
    VCalendar: {
      props: {
        views:
          'Which views the menu offers, in the order it lists them. Narrowing it is how a calendar that only ever shows weeks stops offering anything else.',
        customDays:
          'How many days the custom view shows, and how far Previous and Next step in it.',
        weekdays:
          'Which weekdays are on show, as numbers from 0 for Sunday. The order matters as well: the first entry is the day a week starts on, and it wins over <code>firstDayOfWeek</code>. Left out, the seven days starting on <code>firstDayOfWeek</code>.',
        firstDayOfWeek:
          'The day a week starts on, from 0 for Sunday, when <code>weekdays</code> is not given. Left out, the locale decides.',
        locale:
          'The language the days, months and times are written in. It falls back to the global one.',
        format: 'Whether times are shown on a 12- or a 24-hour clock. It follows the locale.',
        dayStart: 'The hour the grid starts at, from 0.',
        dayEnd: 'The hour it ends at, up to 24.',
        slotDuration:
          'The step everything snaps to, in minutes: how far a nudge moves an event, and the unit a slot is drawn out in.',
        scrollTime:
          'Where the grid is scrolled to when it first appears, so the working day is in view.',
        hideCurrentTime:
          "Leaves out the line drawn across today's column at the time it is now, and the dot on its leading edge. Left in, it ticks once a minute while the calendar is on screen.",
        monthEventLimit:
          'How many events a day of the month view shows before it starts counting the rest.',
        readonly:
          'Stops events being moved and stretched, by dragging them and with the keyboard. They stay readable and clickable, and nothing else.',
        disabled:
          'Freezes the whole calendar: nothing can be moved, created or opened, and no other period can be reached. The cards leave the tab order while the grid keeps its own, so the agenda can still be read. That is what separates it from <code>readonly</code>, which stops the editing alone.',
        creatable:
          'Lets an empty stretch of a time grid be drawn out with the pointer, up or down from the slot pressed. On release its times are reported through <code>event-create</code> and nothing is added to <code>events</code>: putting the event on the calendar is yours to do. A click, or Enter on a focused cell, reports <code>cell-activate</code> with or without this.',
        edgeStepDelay:
          'How long a dragged event has to rest against the side of the calendar before the view turns to the previous or next period, in milliseconds. Zero turns that off. The wait is the point of it: paging the instant the pointer touched the edge would make the last day of a week impossible to aim at.',
        noEdgeScroll: 'Stops dragging near the top or bottom of a time grid from scrolling it.',
        label: 'What the calendar is called, for anyone who cannot see it.',
        vModelView: 'Which span the calendar is showing. It opens on the week.',
        vModelDate: 'The day the view is anchored on, as an ISO string. It opens on today.',
        vModelEvents:
          'What is on the calendar. It is a model rather than a plain prop because dragging and resizing write back to it: the calendar rearranges what it is given and hands the new list back, never mutating the one it received.',
      },
      events: {
        eventActivate: 'A card was clicked or activated, the cue to open an editor of your own.',
        cellActivate:
          'An empty part of the grid was activated, at this day and this time. A day of the month view has no hour of its own, and reports the one the time grids start at.',
        eventMove:
          'An event was dragged or nudged somewhere else. It carries the event as it now stands and where it came from, so undoing it needs no copy of your own.',
        eventResize: "An event's end was dragged or nudged, in the same two parts.",
        eventCreate:
          'An empty stretch of a day was drawn out, and these are its times. Nothing has been added to the list: this is the cue to make the event, in your own model or through your own form.',
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
