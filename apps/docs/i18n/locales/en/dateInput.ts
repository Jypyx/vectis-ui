export default {
  title: 'Date input',
  lead: 'A text field that can be typed into, with a VDatePicker in a panel beside it. The mask follows the language: the field order, the separator and the placeholder are all derived from the locale.',

  examples: {
    labelAndHint: {
      title: 'Label, hint and icon',
      text: '<code>label</code> and <code>hint</code> behave as on any field. <code>pickerIcon</code> changes the glyph that opens the calendar, <code>iconStart</code> puts an icon at the start of the field, and <code>loading</code> shows a spinner in place of the calendar icon. <code>pickerIconLabel</code>, <code>clearLabel</code>, <code>loadingLabel</code> and <code>iconStartLabel</code> rename what each of them announces.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the field height to 32, 40 or 48 pixels, and <code>compact</code> takes 4px off it. The panel keeps its own measurements.',
    },
    modes: {
      title: 'Modes',
      text: '<code>mode</code> chooses how the value is filled in: <code>input</code> masks the field so only digits are typed, the calendar then being opt-in through <code>showPicker</code>; <code>picker</code> makes the calendar the only way in. Typing is reserved for a single date.',
    },
    range: {
      title: 'Range',
      text: '<code>selection</code> set to <code>range</code> makes the value a start and an end, the calendar taking the first click as one and the second as the other.',
    },
    multiple: {
      title: 'Multiple dates',
      text: '<code>selection</code> set to <code>multiple</code> makes the value a list, a day already in it being taken back out by clicking it again.',
    },
    presets: {
      title: 'Presets',
      text: 'The <code>#footer</code> slot is a strip at the foot of the panel, for actions or for the dates a reader reaches for most. It receives <code>close</code>, so a button can set the value and dismiss the panel at once.',
    },
    bounds: {
      title: 'Bounds and closed dates',
      text: '<code>min</code> and <code>max</code> bound both the choice and the navigation. <code>disabledDates</code> closes individual days, as a list or as a function answering for one date at a time.',
    },
    events: {
      title: 'Event dots',
      text: '<code>events</code> draws up to three dots under a day. Each takes any CSS colour and a <code>label</code>, which is what assistive technology reads.',
    },
    customDay: {
      title: 'Custom day cells',
      text: 'The <code>#day</code> slot replaces the number inside a day and receives the ISO date along with what the cell knows about itself: whether it belongs to the month on screen, whether it can be chosen, whether it is selected, today, or inside a period being drawn.',
    },
    clearable: {
      title: 'Clearable',
      text: '<code>clearable</code> adds a cross that empties the value, to the left of the calendar icon rather than in its place.',
    },
    adjacentDays: {
      title: 'Adjacent days',
      text: '<code>showAdjacentDays</code> fills the corners of the grid with the neighbouring months, greyed and inert. <code>selectAdjacentDays</code> makes those days choosable as well, and picking one moves the calendar to its month.',
    },
    states: {
      title: 'States',
      text: '<code>invalid</code> marks the field as having an error. <code>disabled</code> greys it out and prevents the panel from opening. <code>readonly</code> shows the value frozen: nothing can be typed and no calendar is rendered, but the field keeps its contrast and takes the focus.',
    },
    localization: {
      title: 'Localization',
      text: '<code>locale</code> decides the typing order, the separator, the month and day names and the first day of the week, and takes precedence over the global locale. <code>displayFormat</code> is a set of <code>Intl</code> options for writing the date out, and applies wherever nothing is typed.',
    },
    placement: {
      title: 'Placement',
      text: '<code>placement</code> names the preferred opening direction of the panel, above or below the field.',
    },
  },

  api: {
    VDateInput: {
      props: {
        selection:
          'What is being chosen: one date, a period between two, or several separate dates.',
        locale:
          "A BCP 47 locale, which decides the month and day names, the first day of the week and the order the field is typed in. It takes precedence over the design system's global locale and falls back to it.",
        firstDayOfWeek: 'Forces the day the weeks start on, from 0 for Sunday to 6 for Saturday.',
        min: 'The earliest date that can be chosen, as an ISO string.',
        max: 'The latest date that can be chosen, as an ISO string.',
        disabledDates: 'Dates that cannot be chosen, as a list or as a function.',
        showAdjacentDays:
          'Fills the corners of the grid with the greyed days of the neighbouring months.',
        selectAdjacentDays: 'Lets those neighbouring days be clicked, which implies showing them.',
        events: 'Events to mark under the days they fall on.',
        mode: "Whether the field can be typed into, using the numeric form of the reader's language, or is filled from the calendar alone, which is <code>picker</code>. Typing is reserved for choosing a single date: a period or a list falls back to <code>picker</code>, there being no sensible way to type either. It is a different question from <code>readonly</code>, which freezes the field by every route at once.",
        showPicker:
          'Offers the date picker alongside a field that can be typed into: an icon at the end of the field, and a panel that opens on focus. It means nothing in <code>picker</code> mode, where the calendar is already the only way to choose.',
        label: 'The label above the field.',
        hint: 'A line of help under the field.',
        placeholder: 'What the field says while empty.',
        size: 'The height of the field: 32, 40 or 48 pixels.',
        compact: 'Takes 4px off the height.',
        disabled: 'Makes the field unusable, greyed out through the colour tokens.',
        readonly:
          'Shows the date without letting it be changed: nothing can be typed, there is no calendar and no clear cross, and the attributes announcing a panel go with it. The field keeps the focus and can be copied from, which is what separates it from <code>disabled</code>.',
        invalid: 'Marks the field as invalid, for a rule of your own.',
        iconStart:
          'An icon inside the field, at the start. Decorative until a <code>@click:icon-start</code> listener turns it into a button.',
        iconStartLabel: 'What the start icon does, in words, once it is clickable.',
        pickerIconLabel:
          'What the end icon does, in words. It names the button that opens the calendar, and falls back to the design system dictionary.',
        loading:
          'Shows a spinner in place of the calendar icon. It says that something is being loaded and changes nothing else: the field can still be typed into and the panel still opens.',
        loadingLabel:
          'What screen readers announce while the spinner turns. It falls back to the design system dictionary.',
        clearable: 'Offers a cross that empties the value, shown before the end icon.',
        clearLabel:
          'What that cross does, in words. It falls back to the design system dictionary.',
        pickerIcon:
          'The icon that opens the date picker, at the end of the field. The clear cross appears to its left rather than in its place, and no icon is rendered at all when there is no panel to open.',
        displayFormat:
          'How the date is written out in the field. It has no effect on a field being typed into, which necessarily shows the numeric form one types, so it concerns <code>picker</code> mode and the period and list selections.',
        placement: 'Where the panel opens relative to the field.',
        vModel:
          'The date or dates chosen, in the shape <code>selection</code> calls for. While the reader types, it is only written once what they have entered is a complete and acceptable date; an unfinished or refused entry leaves it untouched and is reverted when they leave the field.',
      },
      events: {
        clear: 'The clear cross emptied the field. The value has already been reset.',
        clickIconStart:
          'The start icon was clicked. Attaching this listener is what turns that icon into a real button, which then needs <code>iconStartLabel</code>.',
      },
      slots: {
        day: 'What a day cell shows, handed straight to the calendar.',
        footer:
          'The strip at the foot of the panel: actions, or preset dates such as today. It receives <code>close</code>, which is what lets one of those buttons dismiss the panel.',
        valueEnd:
          'Controls of your own inside the field, placed before the ones the field owns: the clear cross and the icon that opens the panel. Those two are the component own affordance, which is why there is no <code>end</code> slot here.',
        start:
          'Content at the start of the field, rendered after <code>iconStart</code> rather than in its place.',
      },
    },
  },
}
