export default {
  title: 'Time picker',
  lead: 'An inline clock face, the hour and minute counterpart of VDatePicker. Its value is always a 24-hour <code>HH:mm</code> string, whichever clock is displayed.',

  examples: {
    minuteStep: {
      title: 'Minute step',
      text: 'The face is a slider and not a list, so it has to be told what it may land on. <code>minuteStep</code> is that interval: the hand snaps to it as it is dragged, and the arrow keys move by it. It applies to the minutes alone. The markers on the face do not change with it, they are the five-minute marks either way; what the step decides is which values between them the hand may come to rest on.',
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
        minuteStep: 'The interval the minutes snap to, both when dragging and with the arrow keys.',
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
