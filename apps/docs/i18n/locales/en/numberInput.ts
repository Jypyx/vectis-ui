export default {
  title: 'Number input',
  lead: '<code>VNumberInput</code> is a field for a number, with step buttons, the keyboard of a spinbutton and formatting in the locale.',
  examples: {
    controls: {
      title: 'Controls',
      text: '<code>controls</code> places the step buttons on either side, stacks them at the end, or removes them. They stay out of the Tab order: the arrow keys step from the field.',
    },
    formatting: {
      title: 'Formatting',
      text: "<code>formatOptions</code> takes the options of <code>Intl.NumberFormat</code>. The value is formatted outside editing and shown bare while it is typed. With <code>style: 'percent'</code>, 0.15 is shown and typed as 15.",
    },
    step: {
      title: 'Step',
      text: '<code>step</code> sets how far the arrow keys and the buttons move the value, on a grid starting at <code>min</code>. Fractional steps do not drift.',
    },
  },
  api: {
    VNumberInput: {
      props: {
        min: 'Smallest value. A lower typed value is raised to it when committed.',
        max: 'Largest value. A higher typed value is lowered to it when committed.',
        step: 'Distance moved by the arrow keys and the buttons. Page Up and Page Down move ten steps.',
        formatOptions:
          '<code>Intl.NumberFormat</code> options for the displayed value: currency, unit, percent or decimals.',
        locale: 'Locale used to format and read the number. Defaults to the library locale.',
        controls: 'Position of the step buttons.',
        incrementLabel: 'Accessible name of the plus button. Defaults to the library dictionary.',
        decrementLabel: 'Accessible name of the minus button. Defaults to the library dictionary.',
        size: 'Field size. Overridden when <code>VInputGroup</code> sets <code>size</code>.',
        compact:
          'Reduces the height without changing padding or text. Overridden when <code>VInputGroup</code> sets <code>compact</code>.',
        label:
          'Visible label linked to the input. When omitted, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
        hint: 'Help text below the field, linked through <code>aria-describedby</code>.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code> and is announced when it appears.',
        invalid: 'Sets <code>aria-invalid</code> and the error style.',
        disabled: 'Disables the field and its buttons.',
        readonly: 'Prevents typing and stepping while allowing focus and copying.',
        clearable: 'Adds a clear button that sets the value to <code>null</code>.',
        clearLabel: 'Accessible name of the clear button. Defaults to the library dictionary.',
        loading: 'Shows a spinner at the end of the field.',
        loadingText: 'Accessible spinner text. Defaults to the library dictionary.',
        vModel:
          'Field value, a number, or <code>null</code> when empty. Typed text is committed on blur and on Enter.',
      },
      events: {
        clear: 'Emitted after the clear button sets the value to <code>null</code>.',
      },
    },
  },
}
