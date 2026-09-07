export default {
  title: 'Time input',
  lead: 'A time field in one of three forms: typed with a mask, filled from a clock, or a list of times at a fixed interval. The value is always a 24-hour <code>HH:mm</code> string.',

  examples: {
    labelAndHint: {
      title: 'Label, hint and icon',
      text: 'The field is a <code>VInput</code>, so <code>label</code> and <code>hint</code> behave exactly as they do everywhere else. <code>pickerIcon</code> changes the glyph that opens the clock, at the end of the field. No icon is rendered at all when there is no panel to open, which is the default for a field that can be typed into, and the list form ignores the prop: its chevron is the combobox convention. <code>iconStart</code> puts an icon at the start of the field, decorative until a <code>@click:icon-start</code> listener turns it into a button, which then needs <code>iconStartLabel</code>. At the other end, <code>loading</code> shows a spinner in place of the clock icon while something is being fetched and changes nothing else: the field is still typed into and the panel still opens. <code>iconEndLabel</code>, <code>clearLabel</code> and <code>loadingLabel</code> rename the button, the cross and the spinner when the dictionary wording is not the right one.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Three heights, 32, 40 and 48 pixels, each with its <code>compact</code> pair 4px shorter. The clock keeps its own measurements: a face is a surface rather than a control, so the numerals do not shrink with the field they hang from, and a minute stays as easy to hit whichever height the form is built on.',
    },
    modes: {
      title: 'Modes',
      text: 'Three forms of the same field, and a fourth configuration inside the first. <code>input</code>, the default, masks the field so only digits are typed and the colon is placed as the hour fills up; the clock is then opt-in through <code>showPicker</code>, a panel on every focus being noise in a dense form. <code>picker</code> makes the clock the only way in, so it is forced on there. <code>list</code> drops the clock altogether for a searchable list of times, which is a combobox down to its chevron and its cross.',
    },
    steps: {
      title: 'Steps',
      text: 'One number for three things: <code>minuteStep</code> is what the face offers, what the arrow keys move by, and what the list is cut at. It leaves the mask alone, since typing is how a reader escapes a step that does not fit. It is worth setting on a list before anything else: the default of one minute is 1440 rows, where half hours are 48.',
    },
    restrictions: {
      title: 'What may be chosen',
      text: 'The same four props the picker takes, <code>min</code>, <code>max</code>, <code>allowedHours</code> and <code>allowedMinutes</code>, reach the three modes as three different answers, because a mode is a different way of asking. The typed field commits what was typed and turns invalid: it is carried by the control own validity, so the field goes red once the reader has interacted with it and a form refuses to leave with it, where swallowing the entry would give them nothing to correct. The list leaves out the rows that cannot be chosen, a list being read before it is chosen from, and keeps the row of the value in force even when the restrictions have moved past it. The picker disables what it rules out, and its own page covers how a bound cuts an hour in half rather than closing it.',
    },
    clearable: {
      title: 'Clearable',
      text: 'The cross empties the value, and it appears to the left of the clock icon rather than in its place, so the two never trade positions as the field fills and empties. It is opt-in on every field in the library, one default for one word. The list form takes its own cross from the combobox it is built on, wording included.',
    },
    states: {
      title: 'States',
      text: 'An invalid field is for a rule the browser cannot check by itself, the mask already refusing anything that is not a time. A disabled one greys out through the colour tokens and can no longer open its panel, which is one guard rather than one per handler: the same cut-off point covers the click, the focus, the arrow key and the icon. <code>readonly</code> sits between the two: the value is shown but frozen, so nothing can be typed, no clock is rendered, the AM/PM button goes since it writes the value, and the clear cross goes with them. It reaches the list form too, that one being a combobox. The field keeps its normal contrast, takes the focus and can be copied from, which is what separates it from <code>disabled</code>. It answers a different question from <code>mode</code>, which says how a field that can be changed is filled in.',
    },
    twelveHour: {
      title: 'Twelve-hour clock',
      text: 'The value never moves: it is a 24-hour string whatever is on screen, so nothing downstream has to know which clock the reader was shown. What changes is where the half of the day is chosen, and each form answers that differently. A typed field puts a button inside it, the mask having no room to say AM or PM. The clock carries its own pair beside the two large numerals. A list needs neither, every row spelling out its own.',
    },
    localization: {
      title: 'Localization',
      text: 'The tag decides the clock, the mask and how a time is written out, all of it derived rather than tabulated: en-US and en-GB share every word and differ only in the hours they count on. <code>locale</code> takes precedence over the global one and falls back to it when it is left out, and <code>format</code> sits above both for the field that has to be read one way whatever the language.',
    },
    placement: {
      title: 'Placement',
      text: 'Where the panel opens relative to the field. It is anchored in CSS, so this names a preference and not a position: a browser short of room below flips the panel above on its own. Only the block axis is offered, a clock opening beside a field being both wide and hard to follow.',
    },
  },

  api: {
    VTimeInput: {
      props: {
        format:
          "Whether times are shown on a 12- or a 24-hour clock. Left out, the reader's language decides, which is almost always what one wants.",
        mode: 'Which form the field takes: one that can be typed into, a <code>picker</code> one where the clock is the only way in, so the clock is forced on there, or a list of times at a fixed interval, where a clock would make no sense. It is a different question from <code>readonly</code>, which freezes the field by every route at once.',
        showPicker:
          'Offers the picker beside a field one can type into: an icon at the end of the field, and a panel it opens. It is left undefined rather than set to off, which is what distinguishes "not given" from an explicit refusal.',
        minuteStep:
          'The interval between two times that can be chosen. It applies to the picker, to the arrow keys and to the rows of the list.',
        min: 'The earliest time that can be chosen, inclusive, as a canonical 24-hour string. The picker disables what it rules out, the list leaves it out, and a time typed past it makes the field invalid.',
        max: 'The latest time that can be chosen, inclusive, written like min.',
        allowedHours:
          'Which hours can be chosen: the list of them, or a rule answering for one. The hour a rule is handed is always the 24-hour one, whichever clock is on display.',
        allowedMinutes:
          'Which minutes can be chosen: the list of them, or a rule answering for one.',
        locale:
          "A BCP 47 locale, which decides the clock and how a time is written out. It takes precedence over the design system's global locale and falls back to it.",
        label: 'The label above the field.',
        hint: 'A line of help under the field.',
        placeholder: 'What the field says while empty.',
        size: 'The height of the field: 32, 40 or 48 pixels.',
        compact: 'Takes 4px off the height.',
        disabled: 'Makes the field unusable, greyed out through the colour tokens.',
        readonly:
          'Shows the time without letting it be changed: nothing can be typed, there is no clock and no clear cross, and the attributes announcing a panel go with it. The field keeps the focus and can be copied from, which is what separates it from <code>disabled</code>.',
        invalid: 'Marks the field as invalid, for a rule of your own.',
        iconStart:
          'An icon inside the field, at the start. Decorative until a <code>@click:icon-start</code> listener turns it into a button.',
        iconStartLabel: 'What the start icon does, in words, once it is clickable.',
        iconEndLabel:
          'What the end icon does, in words. It names the button that opens the clock, and falls back to the design system dictionary.',
        loading:
          'Shows a spinner in place of the clock icon. It says that something is being loaded and changes nothing else: the field can still be typed into and the panel still opens.',
        loadingLabel:
          'What screen readers announce while the spinner turns. It falls back to the design system dictionary.',
        clearable: 'Offers a cross that empties the value, shown before the end icon.',
        clearLabel:
          'What that cross does, in words. It falls back to the design system dictionary.',
        pickerIcon:
          'The icon that opens the clock, at the end of the field. It has no effect on the list form, whose chevron follows the combobox convention. The clear cross appears to its left rather than in its place.',
        placement: 'Where the panel opens relative to the field.',
        vModel:
          "The time, always as a 24-hour string whatever clock is displayed, so you never have to know which one the reader's language uses.",
      },
      events: {
        clear: 'The clear cross emptied the field. The value has already been reset.',
        clickIconStart:
          'The start icon was clicked. Attaching this listener is what turns that icon into a real button, which then needs <code>iconStartLabel</code>.',
      },
      slots: {
        footer:
          'The strip at the foot of the clock, which replaces the Cancel and OK buttons rather than joining them. It receives both actions, and they are what make it usable: the clock writes a draft that only <code>confirm</code> commits, so a footer of your own without it would leave the value unchangeable through the panel. It is not rendered in list mode, which has no panel of its own.',
      },
    },
  },
}
