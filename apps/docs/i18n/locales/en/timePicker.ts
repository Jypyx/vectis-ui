export default {
  title: 'Time picker',
  lead: 'An inline clock face, the hour and minute counterpart of VDatePicker. Its value is always a 24-hour <code>HH:mm</code> string, whichever clock is displayed.',

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
