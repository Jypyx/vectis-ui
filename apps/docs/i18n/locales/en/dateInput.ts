export default {
  title: 'Date input',
  lead: 'A text field that can be typed into, with a VDatePicker in a panel beside it. The mask follows the language: the field order, the separator and the placeholder are all derived from the locale.',

  examples: {
    labelAndHint: {
      title: 'Label, hint and icon',
      text: 'The field is a <code>VInput</code>, so <code>label</code> and <code>hint</code> behave exactly as they do everywhere else. <code>pickerIcon</code> changes the glyph that opens the calendar, at the end of the field. No icon is rendered at all when there is no panel to open, which is the default for a field that can be typed into. <code>iconStart</code> puts an icon at the start of the field, decorative until a <code>@click:icon-start</code> listener turns it into a button, which then needs <code>iconStartLabel</code>. At the other end, <code>loading</code> shows a spinner in place of the calendar icon while something is being fetched and changes nothing else: the field is still typed into and the panel still opens. <code>pickerIconLabel</code>, <code>clearLabel</code> and <code>loadingLabel</code> rename the button, the cross and the spinner when the dictionary wording is not the right one.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Three heights, 32, 40 and 48 pixels, each with its <code>compact</code> pair 4px shorter. The panel keeps its own measurements: a calendar is a surface rather than a control, so the grid does not shrink with the field it hangs from, and a date stays as easy to hit whichever height the form is built on.',
    },
    modes: {
      title: 'Modes',
      text: 'Two, and a third configuration between them. <code>input</code>, the default, masks the field so only digits are typed and the separators are placed as each part fills up; the calendar is then opt-in through <code>showPicker</code>, a panel on every focus being noise in a dense form. <code>picker</code> makes the calendar the only way in. Typing is reserved for a single date: a period or a list falls back to <code>picker</code>, there being no sensible way to type either.',
    },
    range: {
      title: 'Range',
      text: 'The value becomes a start and an end, and the calendar takes the first click as one and the second as the other, previewing the span under the pointer in between. The field writes the two out through <code>Intl</code>, which shares what the two dates have in common rather than repeating it.',
    },
    multiple: {
      title: 'Multiple dates',
      text: 'The value becomes a list, and a day already in it is taken back out by clicking it again. The array is never mutated in place, so a watcher on the model fires as it should. The field lists what has been chosen, which is worth a thought past a handful of dates: it is one line of text and not a set of chips.',
    },
    presets: {
      title: 'Presets',
      text: 'The <code>#footer</code> slot is a strip at the foot of the panel, for actions or for the dates a reader reaches for most. It receives <code>close</code>, which is what lets a button set the value and dismiss the panel in one gesture. The clock is read inside the handler and never at setup: the server cannot know what day it is where the reader stands, and a value taken there would not survive hydration.',
    },
    bounds: {
      title: 'Bounds and closed dates',
      text: '<code>min</code> and <code>max</code> bound both the choice and the navigation, so the arrows stop rather than wandering into months that hold nothing choosable. <code>disabledDates</code> closes individual days, as a list or as a function answering for one date at a time, which is what makes a rule such as "no weekends" one line instead of an enumeration. A closed day is struck through and stays reachable by keyboard, so a reader arrowing across the grid is never silently jumped over.',
    },
    events: {
      title: 'Event dots',
      text: 'Up to three dots under a day, to say something is happening there. The colour is any CSS colour, so a token keeps it in step with both themes, and a dot given none takes the accent. A <code>label</code> is what assistive technology reads, the dot itself carrying no meaning anyone can hear.',
    },
    customDay: {
      title: 'Custom day cells',
      text: 'The <code>#day</code> slot replaces the number inside a day, which is what a booking calendar showing a nightly price needs. It receives the ISO date and everything the cell knows about itself: whether the day belongs to the month on screen, whether it can be chosen, whether it is selected, today, or inside a period being drawn. The cell itself is still drawn by the component: its size, its shape, its selected background and its focus ring. Event dots are drawn outside the slot, so the two can be used together. Whatever the slot renders should be derived from the date rather than drawn at random, or the server and the browser produce two different calendars.',
    },
    clearable: {
      title: 'Clearable',
      text: 'The cross empties the value, and it appears to the left of the calendar icon rather than in its place, so the two never trade positions as the field fills and empties. It is opt-in on every field in the library, one default for one word.',
    },
    adjacentDays: {
      title: 'Adjacent days',
      text: 'A month rarely starts on the first column, and the corners of the grid are empty by default. <code>showAdjacentDays</code> fills them with the neighbouring months, greyed and inert, which is what keeps the weeks reading as weeks. <code>selectAdjacentDays</code> makes those days choosable as well, and picking one moves the calendar to its month.',
    },
    states: {
      title: 'States',
      text: 'An invalid field is for a rule the browser cannot check by itself, the mask already refusing anything that is not a date. A disabled one greys out through the colour tokens and can no longer open its panel, which is one guard rather than one per handler: the same cut-off point covers the click, the focus, the arrow key and the icon. <code>readonly</code> sits between the two: the value is shown but frozen, so nothing can be typed, no calendar is rendered and the clear cross goes with it, along with the attributes that announced a panel. The field keeps its normal contrast, takes the focus and can be copied from, which is what separates it from <code>disabled</code>. It answers a different question from <code>mode</code>, which says how a field that can be changed is filled in.',
    },
    localization: {
      title: 'Localization',
      text: 'The tag decides the order the field is typed in, the separator it places, the month and day names and the first day of the week, all of it derived rather than tabulated. <code>locale</code> takes precedence over the global one and falls back to it when it is left out. <code>displayFormat</code> is a set of <code>Intl</code> options for writing the date out, and it applies where nothing is typed: <code>picker</code> mode, and the period and list selections that fall back to it.',
    },
    placement: {
      title: 'Placement',
      text: 'Where the panel opens relative to the field. It is anchored in CSS, so this names a preference and not a position: a browser short of room below flips the calendar above on its own. Only the block axis is offered, a calendar opening beside a field being both wide and hard to follow.',
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
