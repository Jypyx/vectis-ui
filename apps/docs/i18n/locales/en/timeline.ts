export default {
  title: 'Timeline',
  lead: '<code>VTimeline</code> lists dated events in order. Each <code>VTimelineItem</code> has a marker on the line, a date, a title and content of its own.',
  examples: {
    split: {
      title: 'Dates in a column',
      text: '<code>layout="split"</code> puts the dates in a column across the line, as wide as the longest date up to a third of the width. Below 30rem, the timeline falls back to <code>stacked</code>.',
    },
    alternate: {
      title: 'Alternating sides',
      text: '<code>layout="alternate"</code> sends every other event across the line, its date facing it, and falls back to <code>stacked</code> below 36rem. A year or a month is written at that precision. Both side-by-side layouts take their width from their parent: in a flex row, give the timeline a basis of its own.',
    },
    horizontal: {
      title: 'Horizontal',
      text: '<code>orientation="horizontal"</code> lays the events across, their markers, dates and titles in line. When they no longer fit, the list scrolls and is a tab stop so that a keyboard can scroll it.',
    },
    markers: {
      title: 'Markers',
      text: '<code>tone</code> paints the marker and <code>icon</code> draws it in a round badge. The <code>marker</code> slot replaces it, with an avatar for instance. Markers are hidden from screen readers: say in the title what the tone means.',
    },
    dates: {
      title: 'Dates',
      text: '<code>timeText</code> shows a relative date while the <code>&lt;time&gt;</code> keeps the exact one. <code>locale</code> and <code>formatOptions</code> change how days and moments are written. On a page rendered on a server, set <code>timeZone</code> in <code>formatOptions</code> for dates that carry an offset.',
    },
  },
  api: {
    VTimeline: {
      props: {
        orientation: 'Whether the events run down the page or across it.',
        layout:
          'Where a vertical timeline puts the dates: above the titles, in a column across the line, or across from content on alternating sides.',
        size: 'Density of the spacing, markers and content text.',
        headingLevel:
          'Renders the titles as <code>h1</code> to <code>h6</code>. Without it, they are paragraphs.',
        locale: 'Locale the dates are written in. Defaults to the design system locale.',
        formatOptions:
          '<code>Intl.DateTimeFormat</code> options for days and moments. Years and months keep their format.',
      },
      slots: {
        default: '<code>VTimelineItem</code> children.',
      },
    },
    VTimelineItem: {
      props: {
        datetime:
          'ISO year, month, day or moment, written out in the locale inside a <code>&lt;time&gt;</code>.',
        timeText: 'Visible text replacing the written-out date.',
        title: 'What happened. Replaced by the <code>title</code> slot.',
        tone: 'Colour of the marker.',
        icon: 'Icon drawn in a round badge in place of the dot.',
      },
      slots: {
        default: 'Details of the event.',
        title: 'Title with markup.',
        marker: 'Replaces the dot or the badge. It is decoration.',
      },
    },
  },
}
