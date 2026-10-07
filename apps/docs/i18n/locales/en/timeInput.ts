export default {
  title: 'Time input',
  lead: '<code>VTimeInput</code> offers typed time entry, a clock picker or a searchable list. The model always uses 24-hour <code>HH:mm</code> values.',
  examples: {
    labelAndHint: {
      title: 'Label, hint and icon',
      text: 'Name the field with <code>label</code> and add help text with <code>hint</code>.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the field size; <code>compact</code> reduces its height.',
    },
    modes: {
      title: 'Modes',
      text: '<code>input</code> allows typing, with an optional clock through <code>showPicker</code>. <code>picker</code> uses the clock alone. <code>list</code> offers searchable time options.',
    },
    steps: {
      title: 'Steps',
      text: '<code>minuteStep</code> sets the clock step and list interval. It does not restrict typed minutes. Choose a larger step to shorten the list.',
    },
    restrictions: {
      title: 'What may be chosen',
      text: '<code>min</code>, <code>max</code>, <code>allowedHours</code> and <code>allowedMinutes</code> restrict clock and list choices. A typed time outside these limits updates the model but fails native field validation.',
    },
    clearable: {
      title: 'Clearable',
      text: '<code>clearable</code> adds a button to reset the time.',
    },
    states: {
      title: 'States',
      text: '<code>readonly</code> prevents all value changes while preserving focus. <code>loading</code> shows a spinner without disabling interaction.',
    },
    twelveHour: {
      title: 'Twelve-hour clock',
      text: '<code>format="12h"</code> displays AM/PM controls. The model remains a 24-hour time.',
    },
    localization: {
      title: 'Localization',
      text: '<code>locale</code> sets time display conventions. An explicit <code>format</code> overrides its hour cycle.',
    },
    placement: {
      title: 'Placement',
      text: '<code>placement</code> sets the preferred panel position.',
    },
  },
  api: {
    VTimeInput: {
      props: {
        required: 'Adds an asterisk after the label and passes <code>required</code> to the field.',
        hideLabel: 'Hides the label visually while keeping it as the accessible name.',
        labelPosition: 'Places the label above the field or beside it.',
        format: '12- or 24-hour display. Defaults to the locale; the model always uses 24 hours.',
        mode: 'Typed input, clock-only picker or searchable time list.',
        showPicker:
          'Adds a clock to input mode. Picker mode always includes it; list mode ignores it.',
        minuteStep: 'Clock step and list interval in minutes. Does not restrict typed values.',
        min: 'Earliest allowed time, inclusive, in <code>HH:mm</code> format.',
        max: 'Latest allowed time, inclusive, in <code>HH:mm</code> format.',
        allowedHours: 'Allowed hours: an array or predicate receiving a 24-hour value.',
        allowedMinutes: 'Allowed minutes: an array or predicate.',
        locale:
          'BCP 47 locale for time display. Overrides the global locale; <code>format</code> takes precedence.',
        label:
          'Visible label. Without a visible name, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code>, is linked through <code>aria-describedby</code> and is announced when it appears.',
        hint: 'Help text linked through <code>aria-describedby</code>.',
        placeholder: 'Placeholder shown when the field is empty.',
        size: 'Component size.',
        compact: 'Reduces the control height without changing text or icons.',
        disabled: 'Disables interaction.',
        readonly: 'Prevents typing, panel selection, AM/PM changes and clearing. Preserves focus.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        iconStart:
          'Start icon. A <code>@click:icon-start</code> listener makes it a button; provide <code>iconStartLabel</code>.',
        iconStartLabel: 'Accessible name of the start icon button.',
        pickerLabel: 'Accessible name of the clock button. Defaults to the library dictionary.',
        loading: 'Replaces the clock icon with a spinner without disabling the field.',
        loadingText:
          'Loading text and accessible spinner name. Defaults to the library dictionary.',
        clearable: 'Adds a button to reset the value.',
        clearLabel: 'Accessible name of the clear button. Defaults to the library dictionary.',
        pickerIcon: 'Clock button icon. Has no effect in list mode.',
        placement: 'Preferred panel position relative to the field.',
        vModel: 'Time in 24-hour <code>HH:mm</code> format, or <code>null</code>.',
      },
      events: {
        clear: 'The time was cleared; the model is already reset.',
        clickIconStart: 'The start icon button was clicked.',
      },
      slots: {
        footer:
          'Replaces the clock’s Cancel and OK buttons. Call <code>confirm</code> to commit the draft, or <code>cancel</code> / <code>close</code> to discard it. Not rendered in list mode.',
        valueEnd: 'Content before the clear and picker buttons.',
        start: 'Content after <code>iconStart</code>.',
      },
    },
  },
}
