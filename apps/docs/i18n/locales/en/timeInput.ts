export default {
  title: 'Time input',
  lead: 'A time field in one of three forms: typed with a mask, read-only with a clock, or a list of times at a fixed interval. The value is always a 24-hour <code>HH:mm</code> string.',

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
