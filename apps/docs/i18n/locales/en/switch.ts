export default {
  title: 'Switch',
  lead: 'Use <code>VSwitch</code> for an on/off setting applied immediately. It exposes <code>role="switch"</code> to assistive technology.',
  examples: {
    labelPosition: {
      title: 'Label position',
      text: '<code>labelPosition="start"</code> places the label before the switch.',
    },
    spread: {
      title: 'Full width',
      text: '<code>spread</code> fills the available width and places the label and switch at opposite ends.',
    },
    disabled: {
      title: 'Disabled',
      text: '<code>disabled</code> prevents changes and removes the switch from Tab navigation and form submission.',
    },
    hint: {
      title: 'Hint',
      text: 'Use <code>label</code> or the default slot for the name. <code>hint</code> adds help text linked through <code>aria-describedby</code>.',
    },
    readonly: {
      title: 'Read-only',
      text: '<code>readonly</code> prevents changes by click or Space while preserving focus and native form behavior. It sets <code>aria-readonly</code>.',
    },
  },
  api: {
    VSwitch: {
      props: {
        label:
          'Visible label, replaced by the default slot. Without either, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code>, is linked through <code>aria-describedby</code> and is announced when it appears.',
        hint: 'Help text below the label, linked through <code>aria-describedby</code>.',
        readonly:
          'Prevents changes while keeping the switch focusable. Sets <code>aria-readonly</code>; native form submission and validation still apply.',
        labelPosition:
          'Label before the switch with <code>start</code>, or after it with <code>end</code>.',
        spread: 'Fills the available width and separates the label and switch.',
        disabled: 'Disables the switch and excludes it from focus and form submission.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        vModel:
          'On/off state, a boolean defaulting to <code>false</code>. Use native <code>name</code> and <code>value</code> attributes for form submission.',
      },
      slots: {
        default: 'Clickable label content, replacing <code>label</code>.',
      },
    },
  },
}
