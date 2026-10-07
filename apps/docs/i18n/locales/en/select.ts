export default {
  title: 'Select',
  lead: '<code>VSelect</code> chooses one or more values from a list, like a native <code>&lt;select&gt;</code>, with the look of <code>VCombobox</code>. There is nothing to type: letters typed on the field highlight the matching option.',
  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: 'Use <code>label</code> to name the field and <code>hint</code> for help text. Clicking the label opens the list.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> adjusts the field and option rows. <code>compact</code> reduces the field height.',
    },
    states: {
      title: 'States',
      text: 'Use <code>disabled</code>, <code>readonly</code> and <code>invalid</code> for field states, <code>loading</code> while options are fetched, and <code>clearable</code> to clear the selection. A read-only field stays focusable but its list never opens.',
    },
    groups: {
      title: 'Groups and separators',
      text: '<code>options</code> accepts options, named groups and separators. The keyboard steps over groups and separators.',
    },
    multiple: {
      title: 'Multiple selection',
      text: '<code>multiple</code> uses an array for the selection and displays removable chips. The list stays open while options are toggled. <code>max</code> limits visible values while the field is unfocused.',
    },
    textDisplay: {
      title: 'Values as text',
      text: '<code>display="text"</code> joins selected labels on one line, cut short with an ellipsis.',
    },
    customOption: {
      title: 'Custom options',
      text: 'Use <code>#option</code> to customize option content.',
    },
    form: {
      title: 'Forms',
      text: 'A hidden native <code>&lt;select&gt;</code> receives <code>name</code>, <code>form</code>, <code>required</code> and <code>autocomplete</code>. The browser validates it on submission, autofill updates <code>v-model</code>, and a form reset restores the initial value.',
    },
  },
  api: {
    VSelect: {
      props: {
        options: 'Options, named groups or separators. Each option has a value and label.',
        multiple:
          'Allows multiple selection. Use an array for <code>v-model</code>. The list stays open while options are toggled.',
        display:
          'Multiple-selection display: removable chips or comma-separated text. Single selection always uses text.',
        max: 'Visible selection count while unfocused. Focus shows all values. Omitted or zero shows all values. Applies only with <code>multiple</code>.',
        overflowText:
          'Formats the count of values hidden by <code>max</code>. Receives the hidden count.',
        label:
          'Visible label. Without a visible name, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code>, is linked through <code>aria-describedby</code> and is announced when it appears.',
        hint: 'Help text linked through <code>aria-describedby</code>.',
        size: 'Field and option size. The field inherits a size set by <code>VInputGroup</code>.',
        compact: 'Reduces the control height without changing text or icons.',
        placeholder: 'Text shown while nothing is chosen.',
        disabled: 'Disables interaction. The value is not submitted.',
        readonly:
          'Prevents selection changes. Keeps focus and submission; hides clear actions and prevents opening the list.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        iconStart:
          'Leading icon before selected values. A <code>@click:icon-start</code> listener makes it a button requiring <code>iconStartLabel</code>.',
        iconStartLabel: 'Accessible name of the start icon button.',
        expandIcon: 'Decorative chevron, turned while the list is open.',
        loading: 'Replaces the chevron with a spinner. The list still opens.',
        loadingText: 'Text announced by the spinner. Defaults to the library dictionary.',
        clearable: 'Adds an action to clear the selection.',
        clearLabel: 'Accessible name of the clear button. Defaults to the library dictionary.',
        placement: 'Preferred panel position relative to the field.',
        vModel:
          'Selected string or number, or an array with <code>multiple</code>. Defaults to an empty string.',
      },
      events: {
        clear: 'Emitted after clearing the selection.',
        clickIconStart: 'Emitted when the start icon button is activated.',
      },
      slots: {
        option: 'Option content. Receives the option, index, active state and selected state.',
        chip: 'Selected chip. Receives value, label, optional option, <code>remove</code>, size and compact state. Connect the remove action.',
        overflow:
          'Hidden selection count. Receives <code>count</code>, chip size and compact state.',
        valueEnd: 'Content before the clear action and expand icon.',
        start: 'Content after <code>iconStart</code> and the chips, without replacing them.',
      },
    },
  },
}
