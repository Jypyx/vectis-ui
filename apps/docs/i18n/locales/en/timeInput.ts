export default {
  title: 'Time input',
  lead: 'A time field in one of three forms: typed with a mask, filled from a clock, or a list of times at a fixed interval. The value is always a 24-hour <code>HH:mm</code> string.',

  examples: {
    labelAndHint: {
      title: 'Label, hint and icon',
      text: '<code>label</code> and <code>hint</code> behave as on any field. <code>pickerIcon</code> changes the glyph that opens the clock, <code>iconStart</code> puts an icon at the start of the field, and <code>loading</code> shows a spinner in place of the clock icon. <code>pickerIconLabel</code>, <code>clearLabel</code>, <code>loadingLabel</code> and <code>iconStartLabel</code> rename what each of them announces.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the field height to 32, 40 or 48 pixels, and <code>compact</code> takes 4px off it. The clock keeps its own measurements.',
    },
    modes: {
      title: 'Modes',
      text: '<code>mode</code> chooses the form of the field: <code>input</code> masks it so only digits are typed, the clock then being opt-in through <code>showPicker</code>; <code>picker</code> makes the clock the only way in, so it is forced on there; <code>list</code> drops the clock for a searchable list of times.',
    },
    steps: {
      title: 'Steps',
      text: '<code>minuteStep</code> is what the face offers, what the arrow keys move by and what the list is cut at. It leaves the mask alone, and is worth setting on a list before anything else: the default of one minute is 1440 rows.',
    },
    restrictions: {
      title: 'What may be chosen',
      text: "<code>min</code>, <code>max</code>, <code>allowedHours</code> and <code>allowedMinutes</code> restrict what may be chosen. The list and the clock leave out what cannot be chosen; the typed field commits the entry and turns invalid through the control's own validity instead.",
    },
    clearable: {
      title: 'Clearable',
      text: '<code>clearable</code> adds a cross that empties the value, to the left of the clock icon rather than in its place. The list form takes its own cross from the combobox it is built on, wording included.',
    },
    states: {
      title: 'States',
      text: '<code>invalid</code> is for a rule the browser cannot check by itself. <code>disabled</code> greys the field out and prevents the panel from opening. <code>readonly</code> shows the value frozen: nothing can be typed, no clock is rendered and the AM/PM button goes with it, while the field keeps its contrast and takes the focus.',
    },
    twelveHour: {
      title: 'Twelve-hour clock',
      text: "The value is a 24-hour string whatever is on screen. Where the half of the day is chosen depends on the form: a button inside a typed field, the clock's own pair beside its numerals, and nothing in a list, every row spelling out its own.",
    },
    localization: {
      title: 'Localization',
      text: '<code>locale</code> decides the clock, the mask and how a time is written out, and takes precedence over the global locale. <code>format</code> sits above both, for a field that has to be read one way whatever the language.',
    },
    placement: {
      title: 'Placement',
      text: '<code>placement</code> names the preferred opening direction of the panel, above or below the field.',
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
        min: 'The earliest time that can be chosen, inclusive, as a canonical 24-hour string. The picker and the list both leave out what it rules out, and a time typed past it makes the field invalid.',
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
        pickerIconLabel:
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
        valueEnd:
          'Controls of your own inside the field, placed before the ones the field owns: the clear cross and the icon that opens the panel. Those two are the component own affordance, which is why there is no <code>end</code> slot here.',
        start:
          'Content at the start of the field, rendered after <code>iconStart</code> rather than in its place.',
      },
    },
  },
}
