export default {
  title: 'Input',
  lead: 'A complete text field: label above, hint below, icons inside, a character counter, a clear button and a loading state, all around a real <code>&lt;input&gt;</code>.',

  api: {
    VInput: {
      props: {
        size: 'The height of the field: 32, 40 or 48 pixels.',
        compact:
          'Takes 4px off the height, leaving the padding, the text and the icons as they are.',
        type: 'The native type of the input, which is also what tells a phone which keyboard to offer: a numeric pad for <code>number</code>, an @ key for <code>email</code>.',
        invalid:
          'Marks the field as invalid whatever the browser thinks. This is the route for a rule only the server can check; anything the browser can validate on its own already colours the field without it.',
        disabled: 'Makes the field unusable, greyed out through the colour tokens.',
        readonly:
          'Shows the value without allowing it to be changed. The field can still be focused and copied from, and it hides the clear button unless <code>clearVisible</code> answers that question explicitly.',
        label: 'The label above the field, tied to it so that clicking it focuses the field.',
        hint: 'A line of help under the field. It is tied to the input for assistive technology, so it is read out along with the label.',
        iconStart:
          'An icon inside the field, at the start. It is decorative until a <code>@click:icon-start</code> listener is attached, at which point it becomes a real button and needs <code>iconStartLabel</code>.',
        iconEnd:
          'The same at the end of the field. The <code>#end</code> slot replaces it, and the loading spinner takes its place while it turns.',
        iconStartLabel: 'What the start icon does, in words, once it is clickable.',
        iconEndLabel: 'What the end icon does, in words, once it is clickable.',
        loading: 'Shows a spinner at the end of the field, in place of the end icon or slot.',
        loadingLabel:
          'What screen readers announce while the spinner turns. It falls back to the design system dictionary.',
        clearable:
          'Offers a cross that empties the field. It appears when there is something to clear and the field can be edited.',
        clearVisible:
          'Decides whether the cross is shown, instead of letting the field work it out from its own content. It exists for the components built on this one, where what there is to clear is not the text: VCombobox holds its selection as chips beside the field, and a read-only date or time picker changes its value through a panel rather than by typing.',
        clearLabel:
          'What the clear button does, in words. It falls back to the design system dictionary.',
        maxlength:
          "The maximum number of characters. By default this is the browser's own limit, which simply refuses anything beyond it.",
        softLimit:
          'Turns that limit into a soft one: the reader may type past it, and the field goes into error instead of silently refusing the keystrokes. It is reported through the native validity, so a form cannot be submitted over the limit.',
        counter:
          'Shows how much has been typed, at the end of the field: 12/80 against a limit, or just 12 without one.',
        vModel:
          'The value, typed as text or a number rather than text alone. On an <code>&lt;input type="number"&gt;</code> Vue converts the value to a number by itself, so a string-only model would hand a number back to a consumer who passed a string in.',
      },
      events: {
        clear: 'The clear button was pressed. The value has already been emptied.',
        clickIconStart:
          'The start icon was pressed. Attaching this listener is what turns it into a button.',
        clickIconEnd:
          'The end icon was pressed. Attaching this listener is what turns it into a button.',
      },
      slots: {
        start: 'Content at the start of the field, which replaces <code>iconStart</code>.',
        end: 'Content at the end of the field, which replaces <code>iconEnd</code>. It is hidden while the field is loading, the spinner taking that place.',
      },
    },
  },
}
