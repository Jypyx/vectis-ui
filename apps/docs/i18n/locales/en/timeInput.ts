export default {
  title: 'Time input',
  lead: 'A time field in one of three forms: typed with a mask, read-only with a clock, or a list of times at a fixed interval. The value is always a 24-hour <code>HH:mm</code> string.',

  examples: {
    labelAndHint: {
      title: 'Label, hint and icon',
      text: 'The field is a <code>VInput</code>, so <code>label</code> and <code>hint</code> behave exactly as they do everywhere else. <code>pickerIcon</code> changes the glyph that opens the clock, at the end of the field. No icon is rendered at all when there is no panel to open, which is the default for a field that can be typed into, and the list form ignores the prop: its chevron is the combobox convention.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Three heights, 32, 40 and 48 pixels, each with its <code>compact</code> pair 4px shorter. The clock keeps its own measurements: a face is a surface rather than a control, so the numerals do not shrink with the field they hang from, and a minute stays as easy to hit whichever height the form is built on.',
    },
    modes: {
      title: 'Modes',
      text: 'Three forms of the same field, and a fourth configuration inside the first. <code>input</code>, the default, masks the field so only digits are typed and the colon is placed as the hour fills up; the clock is then opt-in through <code>showPicker</code>, a panel on every focus being noise in a dense form. <code>readonly</code> makes the clock the only way in, so it is forced on there. <code>list</code> drops the clock altogether for a searchable list of times, which is a combobox down to its chevron and its cross.',
    },
    steps: {
      title: 'Steps',
      text: 'One number for three things: <code>minuteStep</code> is what the face offers, what the arrow keys move by, and what the list is cut at. It leaves the mask alone, since typing is how a reader escapes a step that does not fit. It is worth setting on a list before anything else: the default of one minute is 1440 rows, where half hours are 48.',
    },
    clearable: {
      title: 'Clearable',
      text: 'The cross empties the value, and it appears to the left of the clock icon rather than in its place, so the two never trade positions as the field fills and empties. It is opt-in on every field in the library, one default for one word. The list form takes its own cross from the combobox it is built on, wording included.',
    },
    states: {
      title: 'States',
      text: 'An invalid field is for a rule the browser cannot check by itself, the mask already refusing anything that is not a time. A disabled one greys out through the colour tokens and can no longer open its panel, which is one guard rather than one per handler: the same cut-off point covers the click, the focus, the arrow key and the icon.',
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
        mode: 'Which form the field takes: one that can be typed into, a read-only one where the picker is the only way in, so the picker is forced on there, or a list of times at a fixed interval, where a picker would make no sense.',
        showPicker:
          'Offers the picker beside a field one can type into: an icon at the end of the field, and a panel it opens. It is left undefined rather than set to off, which is what distinguishes "not given" from an explicit refusal.',
        minuteStep:
          'The interval between two times that can be chosen. It applies to the picker, to the arrow keys and to the rows of the list.',
        locale:
          "A BCP 47 locale, which decides the clock and how a time is written out. It takes precedence over the design system's global locale and falls back to it.",
        label: 'The label above the field.',
        hint: 'A line of help under the field.',
        placeholder: 'What the field says while empty.',
        size: 'The height of the field: 32, 40 or 48 pixels.',
        compact: 'Takes 4px off the height.',
        disabled: 'Makes the field unusable, greyed out through the colour tokens.',
        invalid: 'Marks the field as invalid, for a rule of your own.',
        clearable: 'Offers a cross that empties the value, shown before the end icon.',
        pickerIcon:
          'The icon that opens the clock, at the end of the field. It has no effect on the list form, whose chevron follows the combobox convention. The clear cross appears to its left rather than in its place.',
        placement: 'Where the panel opens relative to the field.',
        vModel:
          "The time, always as a 24-hour string whatever clock is displayed, so you never have to know which one the reader's language uses.",
      },
    },
  },
}
