export default {
  title: 'Time picker',
  lead: 'An inline clock face, the hour and minute counterpart of VDatePicker. Its value is always a 24-hour <code>HH:mm</code> string, whichever clock is displayed.',

  examples: {
    minuteStep: {
      title: 'Minute step',
      text: 'The face is a slider and not a list, so it has to be told what it may land on. <code>minuteStep</code> is that interval: the hand snaps to it as it is dragged, and the arrow keys move by it. It applies to the minutes alone. The face prints only the minutes the step reaches, so a quarter of an hour marks four and nothing between them: a numeral one can point at and not land on is one the hand contradicts by settling beside it. A step too fine for twelve numerals keeps the five-minute marks a clock is read on, minus any it cannot reach.',
    },
    restrictions: {
      title: 'What may be chosen',
      text: 'Four props restrict the value, and they compose into a single answer: <code>min</code> and <code>max</code>, two inclusive bounds written as canonical <code>HH:mm</code> strings, and <code>allowedHours</code> and <code>allowedMinutes</code>, each taking the list of the values it allows or a rule answering for one. What they rule out is left off the face, which is the rule <code>minuteStep</code> already follows: the clock prints what can be chosen and nothing else. An hour is closed only when nothing at all is left in it, so a bound at 09:30 keeps nine o clock and takes its first thirty minutes from the minutes instead. Choosing that hour then pulls the minutes to the nearest one it does allow, and the arrow keys step over what they may not land on rather than stopping at it. The pointer catches nothing it was not aimed at: a sector left without a numeral holds no value, so a click there writes nothing and does not move the step on either.',
    },
    hourFormat: {
      title: 'Hour format',
      text: 'A 12-hour face carries one ring of numerals and the AM and PM pair beside them. A 24-hour face carries two rings, the inner one holding 00 and 13 to 23, and no pair to choose from. <code>format</code> picks between the two, and left out the reader language decides, which is almost always what one wants. The value is the same either way: half past seven in the evening is the string 19:30 on both faces, so nothing downstream has to know which one produced it.',
    },
    localization: {
      title: 'Localization',
      text: 'The <code>locale</code> prop decides one thing here, the clock. A tag whose language counts in twelve hours gets the single ring and the AM and PM pair, one that counts in twenty-four gets the double ring. en-US and en-GB are the sharp pair, sharing every word and differing in nothing else. The prop takes precedence over the global locale and falls back to it, so leaving it out is what makes a clock follow the language the page is set to. The wording is a separate question: it comes from the dictionary, and a language the dictionary does not ship keeps the English words on a face the tag has already got right.',
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
