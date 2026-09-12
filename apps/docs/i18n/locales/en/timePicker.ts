export default {
  title: 'Time picker',
  lead: 'An inline clock face, the hour and minute counterpart of VDatePicker. Its value is always a 24-hour <code>HH:mm</code> string, whichever clock is displayed.',

  examples: {
    minuteStep: {
      title: 'Minute step',
      text: '<code>minuteStep</code> is the interval the hand snaps to and the arrow keys move by, on the minutes alone. The face prints only the minutes the step reaches.',
    },
    restrictions: {
      title: 'What may be chosen',
      text: '<code>min</code> and <code>max</code> are two inclusive bounds written as canonical <code>HH:mm</code> strings, and <code>allowedHours</code> and <code>allowedMinutes</code> each take the list of values they allow or a rule answering for one. What they rule out is left off the face, and an hour is closed only when nothing at all is left in it.',
    },
    hourFormat: {
      title: 'Hour format',
      text: "<code>format</code> picks between a 12-hour face, one ring of numerals with the AM and PM pair beside them, and a 24-hour face, two rings and no pair. Left out, the reader's language decides. The value is the same either way.",
    },
    localization: {
      title: 'Localization',
      text: '<code>locale</code> decides the clock here: a language counting in twelve hours gets the single ring, one counting in twenty-four the double ring. It takes precedence over the global locale and falls back to it. The wording comes from the dictionary.',
    },
  },

  api: {
    VTimePicker: {
      props: {
        format:
          "Whether the face shows a 12- or a 24-hour clock. Left out, the reader's language decides, which is almost always what one wants.",
        locale:
          "A BCP 47 locale, which decides the clock. It takes precedence over the design system's global locale and falls back to it, which is why it has no literal default.",
        minuteStep:
          'The interval the minutes snap to, both when dragging and with the arrow keys. The face prints only the minutes it can reach, so a step of a quarter of an hour marks four.',
        min: 'The earliest time that can be chosen, inclusive, as a canonical 24-hour string. The face leaves off what falls outside it, the way it leaves off the minutes the step cannot reach.',
        max: 'The latest time that can be chosen, inclusive, written like min.',
        allowedHours:
          'Which hours can be chosen: the list of them, or a rule answering for one. The hour a rule is handed is always the 24-hour one, whichever clock is on display. The hours it leaves out are not printed.',
        allowedMinutes:
          'Which minutes can be chosen: the list of them, or a rule answering for one. The minutes it leaves out are not printed.',
        disabled:
          'Makes the whole clock unusable: the hand cannot be moved, the half-day cannot be changed, and everything greys out through the colour tokens.',
        readonly:
          'Shows the time without letting it be changed. The face keeps its focus and the two numerals still switch between the hour and the minutes, so the value can be read in full.',
        label:
          'The accessible name of the whole clock, its two numerals and its face together. It falls back to the dictionary, and a consumer <code>aria-label</code> wins over it. The face keeps its own name, which says whether the hand is on the hour or the minutes.',
        vModel:
          'The time, always as a 24-hour string whatever clock is displayed, so you never have to know which one the language uses. With no value the clock shows midnight rather than the current time: reading the clock while rendering would make a page drawn on a server disagree with the same page in the browser.',
      },
      events: {
        confirm:
          'The minutes were settled from the keyboard. Releasing a pointer is how one stops adjusting the hand, not how one confirms, so it does not fire.',
      },
      slots: {
        footer: 'A strip at the foot of the clock, the place for actions such as Cancel and OK.',
      },
    },
  },
}
