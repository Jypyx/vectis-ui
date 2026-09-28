export default {
  title: 'Checkbox',
  lead: 'Use <code>VCheckbox</code> for independent choices or confirmation, such as accepting terms.',
  examples: {
    labelPosition: {
      title: 'Label position',
      text: '<code>labelPosition="start"</code> places the label before the checkbox.',
    },
    spread: {
      title: 'Full width',
      text: '<code>spread</code> fills the available width and places the label and checkbox at opposite ends.',
    },
    indeterminate: {
      title: 'Indeterminate',
      text: '<code>indeterminate</code> indicates a partial selection, such as some items in a list being checked. It does not change the boolean <code>v-model</code>.',
    },
    disabled: {
      title: 'Disabled',
      text: '<code>disabled</code> prevents changes and removes the checkbox from Tab navigation and form submission.',
    },
    hint: {
      title: 'Hint',
      text: 'Use <code>label</code> or the default slot for the name. <code>hint</code> adds help text linked through <code>aria-describedby</code>.',
    },
    readonly: {
      title: 'Read-only',
      text: '<code>readonly</code> prevents changes by click or Space while preserving focus and native form behavior. A read-only, unchecked field with <code>required</code> still fails native form validation.',
    },
  },
  api: {
    VCheckbox: {
      props: {
        label:
          'Visible label, replaced by the default slot. Without either, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
        hint: 'Help text below the label, linked through <code>aria-describedby</code>.',
        readonly:
          'Prevents changes while keeping the checkbox focusable. Sets <code>aria-readonly</code>; native form submission and validation still apply.',
        indeterminate:
          'Displays a partial-selection state. Independent of <code>v-model</code>, which remains a boolean.',
        labelPosition:
          'Label before the checkbox with <code>start</code>, or after it with <code>end</code>.',
        spread: 'Fills the available width and separates the label and checkbox.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        disabled: 'Disables the checkbox and excludes it from focus and form submission.',
        vModel:
          'Checked state, a boolean defaulting to <code>false</code>. Use native <code>name</code> and <code>value</code> attributes for form submission.',
      },
      slots: {
        default: 'Clickable label content, replacing <code>label</code>.',
      },
    },
  },
}
