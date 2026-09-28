export default {
  title: 'Textarea',
  lead: '<code>VTextarea</code> is a multiline field with optional label, help text, icons and actions. Use <code>autoGrow</code> to fit its height to the content.',
  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: '<code>label</code> names the field. <code>hint</code> adds help text linked through <code>aria-describedby</code>.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> adjusts padding, text and icons. <code>rows</code> sets the line count; <code>compact</code> reduces vertical padding.',
    },
    icons: {
      title: 'Icons',
      text: '<code>iconStart</code> and <code>iconEnd</code> align with the first line. Use <code>#start</code> and <code>#end</code> for custom content.',
    },
    clickableIcons: {
      title: 'Clickable icons',
      text: 'Attach <code>@click:icon-start</code> or <code>@click:icon-end</code> to make an icon a button. Provide its accessible name with <code>iconStartLabel</code> or <code>iconEndLabel</code>.',
    },
    clearable: {
      title: 'Clear button',
      text: '<code>clearable</code> adds a button that empties the field, emits <code>clear</code> and restores focus.',
    },
    counters: {
      title: 'Character counter',
      text: '<code>counter</code> displays the character count below the field. With <code>maxlength</code>, <code>softLimit</code> allows typing past the limit and reports a native validation error.',
    },
    autoGrow: {
      title: 'Automatic height',
      text: '<code>autoGrow</code> adjusts the height to the content, with <code>rows</code> as the minimum. Without it, the field scrolls and can be resized vertically.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> blocks interaction. <code>readonly</code> allows focus and copying. <code>invalid</code> marks an error. <code>loading</code> shows a spinner while leaving the field editable.',
    },
  },
  api: {
    VTextarea: {
      props: {
        size: 'Adjusts padding, text and icons. Use <code>rows</code> to set the line count.',
        compact: 'Reduces vertical padding without changing the line count, text or icons.',
        rows: 'Visible line count, rounded to an integer of at least 1. With <code>autoGrow</code>, sets the minimum height.',
        autoGrow:
          'Fits the height to the content using CSS <code>field-sizing</code>. Disables manual resizing. Without browser support, the field keeps its fixed height and scrolls.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        disabled: 'Disables the field, removing it from Tab navigation and form submission.',
        readonly:
          'Prevents editing while allowing focus and copying. Hides the clear button unless <code>clearVisible</code> overrides it.',
        label:
          'Visible label linked to the textarea. When omitted, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
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
          'Character count below the field: <code>12/80</code> with a limit, or <code>12</code> without one.',
        vModel: 'Field text. Defaults to an empty string.',
      },
      events: {
        clear: 'Emitted after the clear button resets the value to an empty string.',
        clickIconStart:
          'Emitted when the start icon button is activated. Receives a <code>MouseEvent</code>.',
        clickIconEnd:
          'Emitted when the end icon button is activated. Receives a <code>MouseEvent</code>.',
      },
      slots: {
        start: 'Content after <code>iconStart</code>. Does not replace the icon.',
        end: 'Content replacing <code>iconEnd</code>. Hidden while loading.',
        valueEnd: 'Content after the textarea, before the clear button and end icon.',
      },
    },
  },
}
