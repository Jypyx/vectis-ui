export default {
  title: 'Input',
  lead: '<code>VInput</code> is a single-line field with optional label, help text, icons and actions.',
  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: '<code>label</code> names the field. <code>hint</code> adds help text linked through <code>aria-describedby</code>.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> adjusts the height, padding, text and icons. <code>compact</code> reduces the height only.',
    },
    icons: {
      title: 'Icons',
      text: 'Add decorative icons with <code>iconStart</code> and <code>iconEnd</code>, or custom content with <code>#start</code> and <code>#end</code>.',
    },
    clearable: {
      title: 'Clear button',
      text: '<code>clearable</code> adds a button that empties the field and restores focus. Use <code>clearVisible</code> to control its visibility.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> blocks interaction. <code>readonly</code> allows focus and copying. <code>invalid</code> marks an error, and <code>error</code> also shows its message in place of the hint. <code>loading</code> shows a spinner while leaving the field editable.',
    },
    clickableIcons: {
      title: 'Clickable icons',
      text: 'Attach <code>@click:icon-start</code> or <code>@click:icon-end</code> to make an icon a button. Provide its accessible name with <code>iconStartLabel</code> or <code>iconEndLabel</code>.',
    },
    counters: {
      title: 'Character counter',
      text: '<code>counter</code> displays the character count. With <code>maxlength</code>, <code>softLimit</code> allows typing past the limit and reports a native validation error.',
    },
    pattern: {
      title: 'Native validation',
      text: 'Native attributes such as <code>pattern</code>, <code>inputmode</code> and <code>name</code> are forwarded to the input. <code>class</code> and <code>style</code> apply to the wrapper.',
    },
  },
  api: {
    VInput: {
      props: {
        required: 'Adds an asterisk after the label and passes <code>required</code> to the field.',
        hideLabel: 'Hides the label visually while keeping it as the accessible name.',
        labelPosition: 'Places the label above the field or beside it.',
        size: 'Field size. Overridden when <code>VInputGroup</code> sets <code>size</code>.',
        compact:
          'Reduces the height without changing padding, text or icons. Overridden when <code>VInputGroup</code> sets <code>compact</code>.',
        type: 'Native input type.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        disabled: 'Disables the field, removing it from Tab navigation and form submission.',
        readonly:
          'Prevents editing while allowing focus and copying. Hides the clear button unless <code>clearVisible</code> overrides it.',
        noTyping:
          'Prevents typing through native <code>readonly</code> without the read-only style. Keeps clearing available, for fields edited through a picker.',
        label:
          'Visible label linked to the input. When omitted, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code>, is linked through <code>aria-describedby</code> and is announced when it appears.',
        hint: 'Help text below the field, linked through <code>aria-describedby</code>.',
        iconStart:
          'Start icon. Becomes a button with <code>@click:icon-start</code>; then requires <code>iconStartLabel</code>.',
        iconEnd:
          'End icon. Becomes a button with <code>@click:icon-end</code>; then requires <code>iconEndLabel</code>. Replaced by <code>#end</code> or the loading spinner.',
        iconStartLabel: 'Accessible name of the start icon button.',
        iconEndLabel: 'Accessible name of the end icon button.',
        loading:
          'Replaces the end icon or <code>#end</code> content with a spinner. Does not disable the field.',
        loadingText: 'Accessible spinner text. Defaults to the library dictionary.',
        clearable:
          'Adds a clear button when the field is non-empty and editable, unless <code>clearVisible</code> overrides visibility. Hidden when disabled.',
        clearVisible:
          'Overrides the content and read-only checks for clear-button visibility. Requires <code>clearable</code> and an enabled field.',
        clearLabel: 'Accessible name of the clear button. Defaults to the library dictionary.',
        maxlength:
          'Native character limit. Not applied as a native attribute with <code>softLimit</code>.',
        softLimit:
          'Allows exceeding <code>maxlength</code> and sets a native validation error until the value is within the limit.',
        counter:
          'Character count inside the field: <code>12/80</code> with a limit, or <code>12</code> without one.',
        vModel:
          'Field value, a string or number. With <code>type="number"</code>, Vue converts numeric input to a number. An empty field uses an empty string.',
      },
      events: {
        clear: 'Emitted after the clear button resets the value to an empty string.',
        clickIconStart:
          'Emitted when the start icon button is activated. Receives a <code>MouseEvent</code>.',
        clickIconEnd:
          'Emitted when the end icon button is activated. Receives a <code>MouseEvent</code>.',
      },
      slots: {
        meta: 'Content at the end of the hint line, such as a counter. Bind its <code>id</code>, which joins the field description.',
        start: 'Content after <code>iconStart</code>. Does not replace the icon.',
        valueEnd: 'Content after the value and counter, before the clear button and end icon.',
        end: 'Content replacing <code>iconEnd</code>. Hidden while loading.',
        control:
          'Control replacing the input, for composed fields. Bind the received <code>controlProps</code> on it: id, field class, ARIA links and forwarded attributes.',
      },
    },
  },
}
