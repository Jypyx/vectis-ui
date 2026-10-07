export default {
  title: 'Date input',
  lead: '<code>VDateInput</code> combines a localized date field with <code>VDatePicker</code>. It supports a single date, a range or several dates.',
  examples: {
    labelAndHint: {
      title: 'Label, hint and icon',
      text: 'Use <code>label</code> for the field name and <code>hint</code> for help text.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> controls the field size; <code>compact</code> reduces its height.',
    },
    modes: {
      title: 'Modes',
      text: '<code>input</code> accepts a localized numeric date. <code>showPicker</code> adds a calendar to it. <code>picker</code> uses the calendar alone; range and multiple selections always use this mode.',
    },
    range: {
      title: 'Range',
      text: '<code>selection="range"</code> uses a <code>{ start, end }</code> model. Each bound is an ISO date or <code>null</code>.',
    },
    multiple: {
      title: 'Multiple dates',
      text: '<code>selection="multiple"</code> uses an array of ISO dates. Select a date again to remove it.',
    },
    presets: {
      title: 'Presets',
      text: 'Add preset dates through <code>footer</code>. Its <code>close</code> callback dismisses the panel.',
    },
    bounds: {
      title: 'Bounds and closed dates',
      text: '<code>min</code> and <code>max</code> limit selection and navigation. Exclude individual dates with <code>disabledDates</code>.',
    },
    events: {
      title: 'Event dots',
      text: '<code>events</code> adds up to three dots per day. Event labels are included in the day’s accessible name.',
    },
    customDay: {
      title: 'Custom day cells',
      text: 'Use <code>day</code> to customize cell content from its date and selection state.',
    },
    clearable: {
      title: 'Clearable',
      text: '<code>clearable</code> adds a button to reset the selection.',
    },
    adjacentDays: {
      title: 'Adjacent days',
      text: '<code>showAdjacentDays</code> displays neighbouring days. <code>selectAdjacentDays</code> also makes them selectable and opens their month.',
    },
    states: {
      title: 'States',
      text: '<code>readonly</code> prevents typing, calendar selection and clearing while preserving focus. <code>loading</code> shows a spinner without disabling the field.',
    },
    localization: {
      title: 'Localization',
      text: '<code>locale</code> sets date names and numeric order. <code>displayFormat</code> customizes picker-mode display; it does not change the typing mask.',
    },
    placement: {
      title: 'Placement',
      text: '<code>placement</code> sets the preferred calendar position.',
    },
  },
  api: {
    VDateInput: {
      props: {
        required: 'Adds an asterisk after the label and passes <code>required</code> to the field.',
        hideLabel: 'Hides the label visually while keeping it as the accessible name.',
        labelPosition: 'Places the label above the field or beside it.',
        selection: 'Selection mode: one date, a range or several dates.',
        locale: 'BCP 47 locale for date display and week start. Overrides the global locale.',
        firstDayOfWeek: 'First weekday, from 0 (Sunday) to 6 (Saturday). Defaults to the locale.',
        min: 'Earliest selectable date, in <code>YYYY-MM-DD</code> format. Also limits navigation.',
        max: 'Latest selectable date, in <code>YYYY-MM-DD</code> format. Also limits navigation.',
        disabledDates:
          'Unavailable dates: an array of ISO strings or a predicate. Days remain visible and reachable with the keyboard.',
        showAdjacentDays: 'Shows days from neighbouring months.',
        selectAdjacentDays:
          'Allows selecting days from neighbouring months and navigates to that month. Implies <code>showAdjacentDays</code>.',
        events:
          'Events shown as up to three dots per day. Each accepts a date, CSS colour and accessible label.',
        mode: '<code>input</code> for typed dates, <code>picker</code> for calendar selection. Range and multiple selections force picker mode.',
        showPicker: 'Adds a calendar to input mode. Picker mode always includes it.',
        label:
          'Visible label. Without a visible name, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code>, is linked through <code>aria-describedby</code> and is announced when it appears.',
        hint: 'Help text linked through <code>aria-describedby</code>.',
        placeholder: 'Placeholder shown when the field is empty.',
        size: 'Component size.',
        compact: 'Reduces the control height without changing text or icons.',
        disabled: 'Disables interaction.',
        readonly: 'Prevents typing, calendar selection and clearing. The field remains focusable.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        iconStart:
          'Start icon. A <code>@click:icon-start</code> listener makes it a button; provide <code>iconStartLabel</code>.',
        iconStartLabel: 'Accessible name of the start icon button.',
        pickerLabel: 'Accessible name of the calendar button. Defaults to the library dictionary.',
        loading: 'Replaces the calendar icon with a spinner. Does not disable typing or the panel.',
        loadingText:
          'Loading text and accessible spinner name. Defaults to the library dictionary.',
        clearable: 'Adds a button to reset the selection.',
        clearLabel: 'Accessible name of the clear button. Defaults to the library dictionary.',
        pickerIcon: 'Calendar button icon, shown when a panel is available.',
        displayFormat:
          'Date display options in picker mode. Does not change the numeric typing mask.',
        placement: 'Preferred panel position relative to the field.',
        vModel:
          'ISO date or <code>null</code>, <code>{ start, end }</code> range, or ISO date array. Typed input updates the model only when complete and allowed; other entries revert on blur.',
      },
      events: {
        clear: 'The selection was cleared; the model is already reset.',
        clickIconStart: 'The start icon button was clicked.',
      },
      slots: {
        day: 'Calendar cell content. Receives the <code>VDatePicker</code> day slot data.',
        footer: 'Panel footer. Receives <code>close</code> to dismiss it.',
        valueEnd: 'Content before the clear and calendar buttons.',
        start: 'Content after <code>iconStart</code>.',
      },
    },
  },
}
