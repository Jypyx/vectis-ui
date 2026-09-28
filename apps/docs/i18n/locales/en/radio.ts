export default {
  title: 'Radio',
  lead: '<code>VRadio</code> selects one value from a set of options. Share the same <code>name</code> and <code>v-model</code> across the group for native selection and arrow navigation.',
  examples: {
    labelPosition: {
      title: 'Label position',
      text: '<code>labelPosition="start"</code> places the label before the radio button.',
    },
    spread: {
      title: 'Full width',
      text: '<code>spread</code> fills the available width and places the label and radio button at opposite ends.',
    },
    disabled: {
      title: 'Disabled',
      text: '<code>disabled</code> prevents selection and removes the option from keyboard navigation and form submission.',
    },
    hint: {
      title: 'Hint',
      text: 'Use <code>label</code> or the default slot for the name. <code>hint</code> adds help text linked through <code>aria-describedby</code>.',
    },
    readonly: {
      title: 'Read-only',
      text: 'Set <code>readonly</code> on every option to keep the selection unchanged while arrows move focus. Use a named wrapper with <code>role="radiogroup"</code> and <code>aria-readonly="true"</code> to announce the state. A read-only group with <code>required</code> and no selection still fails native form validation.',
    },
  },
  api: {
    VRadio: {
      props: {
        label:
          'Visible label, replaced by the default slot. Without either, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
        hint: 'Help text below the label, linked through <code>aria-describedby</code>.',
        readonly:
          'Prevents selection changes while preserving focus and native form behavior. Set on every option. Announce read-only state on the group wrapper.',
        value:
          'String or number assigned to <code>v-model</code> when selected. Use a distinct value for each option.',
        labelPosition:
          'Label before the radio button with <code>start</code>, or after it with <code>end</code>.',
        spread: 'Fills the available width and separates the label and radio button.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        disabled:
          'Disables this option and excludes it from keyboard navigation and form submission.',
        vModel:
          'Selected value, shared by the group. An option is selected when the model matches its <code>value</code>. Defaults to an empty string.',
      },
      slots: {
        default: 'Clickable label content, replacing <code>label</code>.',
      },
    },
  },
}
