export default {
  title: 'Date input',
  lead: 'A text field that can be typed into, with a VDatePicker in a panel beside it. The mask follows the language: the field order, the separator and the placeholder are all derived from the locale.',

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
        mode: "Whether the field can be typed into, using the numeric form of the reader's language, or is read-only with the calendar as the only way in. Typing is reserved for choosing a single date: a period or a list falls back to read-only, there being no sensible way to type either.",
        showPicker:
          'Offers the date picker alongside a field that can be typed into: an icon at the end of the field, and a panel that opens on focus. It means nothing in read-only mode, where the picker is already the only way to choose.',
        label: 'The label above the field.',
        hint: 'A line of help under the field.',
        placeholder: 'What the field says while empty.',
        size: 'The height of the field: 32, 40 or 48 pixels.',
        compact: 'Takes 4px off the height.',
        disabled: 'Makes the field unusable, greyed out through the colour tokens.',
        invalid: 'Marks the field as invalid, for a rule of your own.',
        clearable: 'Offers a cross that empties the value, shown before the end icon.',
        pickerIcon:
          'The icon that opens the date picker, at the end of the field. The clear cross appears to its left rather than in its place, and no icon is rendered at all when there is no panel to open.',
        displayFormat:
          'How the date is written out in the field. It has no effect on a field being typed into, which necessarily shows the numeric form one types, so it concerns the read-only mode and the period and list selections.',
        placement: 'Where the panel opens relative to the field.',
        vModel:
          'The date or dates chosen, in the shape <code>selection</code> calls for. While the reader types, it is only written once what they have entered is a complete and acceptable date; an unfinished or refused entry leaves it untouched and is reverted when they leave the field.',
      },
      slots: {
        day: 'What a day cell shows, handed straight to the calendar.',
        footer:
          'The strip at the foot of the panel: actions, or preset dates such as today. It receives <code>close</code>, which is what lets one of those buttons dismiss the panel.',
      },
    },
  },
}
