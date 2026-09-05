export default {
  title: 'Calendar',
  lead: 'An agenda to read and rearrange: day, week, month and year views, with events that can be dragged and stretched. Opening one for editing stays with you.',

  examples: {
    month: {
      title: 'Month',
      text: 'The month view trades the hours for the shape of the month: each day is a square holding its events as chips, and a day with more than <code>monthEventLimit</code> of them counts the rest instead of growing. Choosing a day number opens that day on its own. An event running from one day to the next is drawn as a bar across the squares it covers.',
    },
    year: {
      title: 'Year',
      text: 'Twelve small months, for orientation rather than detail. The days here are deliberately not controls: three hundred and sixty-five tab stops would make the view unusable to anyone reaching it by keyboard. So the busy days are ringed and it is the month that can be chosen, which opens it, its name carrying how many of its days have something on them.',
    },
    customView: {
      title: 'Custom view',
      text: 'The presets are a day, four days and a week. <code>custom</code> is that same machinery with the length left to you: <code>customDays</code> says how many days it shows, and how far Previous and Next step. The second half is what separates it from <code>week</code>, which always lands on the boundaries of a calendar week. The five days below start on the day the calendar is anchored to and move five at a time, so a span can sit astride a weekend instead of stopping at it. The view menu names the entry after its own length.',
    },
    weekdays: {
      title: 'Which days are shown',
      text: '<code>weekdays</code> decides which days appear at all, as numbers from 0 for Sunday, so <code>[1, 2, 3, 4, 5]</code> is a week with no weekend in it. Its order counts as well: the first entry is the day a week starts on, which is why there is no separate setting for that. It reaches every view, which is what the menu below is there for: the weekend is missing from the month squares and from the small months of the year exactly as it is from the columns. <code>dayStart</code> and <code>dayEnd</code> crop the hours in the same spirit, and reach the time grids alone, the other two views showing no hours to crop.',
    },
    allDay: {
      title: 'All-day events',
      text: 'An event goes into the band above the grid when it cannot be drawn inside one column. <code>allDay</code> puts it there on a single day, and one whose <code>start</code> and <code>end</code> fall on different days is already there without it. Bars that overlap stack onto rows of their own, and the band scrolls once it has grown as far as it may.',
    },
    overlapping: {
      title: 'Overlapping events',
      text: 'Events happening at once share the width of their day. They are grouped into clusters first, so a crowded morning never narrows a lone afternoon meeting: the four below divide the morning between them while the lunch keeps the whole column.',
    },
    colours: {
      title: 'Colours',
      text: "An event with no <code>color</code> takes a hue derived from its id, so it keeps the same colour however the list is filtered or sorted. Only the hue is derived: the lightness and the chroma come from the theme, which is what holds a title's contrast steady wherever it lands on the wheel. An event naming a colour of its own uses it for its leading edge and a wash of its face, never underneath the title, which is what keeps an arbitrary value readable in both themes.",
    },
    eventSlot: {
      title: 'Custom event content',
      text: "The <code>#event</code> slot replaces what a card shows and receives everything the card knows: the event, the formatted <code>timeText</code>, the <code>layout</code> it is being drawn in (<code>block</code> in a time grid, <code>chip</code> in a month square) and whether it continues before or after the day it is on. Typing the events with an interface extending <code>CalendarEvent</code> is what brings the extra fields into the slot typed rather than as something to cast there. The card itself stays the component's: the button, the colour, the accessible name and the handle its end is dragged by.",
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
        hideCurrentTime:
          "Leaves out the line drawn across today's column at the time it is now, and the dot on its leading edge. Left in, it ticks once a minute while the calendar is on screen.",
        monthEventLimit:
          'How many events a day of the month view shows before it starts counting the rest.',
        readonly:
          'Stops events being moved and stretched, by dragging them and with the keyboard. They stay readable and clickable, and nothing else.',
        creatable:
          'Makes an event when an empty part of a day is taken up: a click makes one a step long, a drag makes one as long as it was drawn. The slot signal fires either way, so you can leave this off and still get it.',
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
