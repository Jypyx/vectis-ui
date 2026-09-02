export default {
  title: 'Textarea',
  lead: 'A multi-line text field, with the same chrome as VInput: label above, hint below, icons inside, a counter and a clear button. It can grow as the text is typed.',

  api: {
    VTextarea: {
      props: {
        size: 'The size of the field, which sets its padding, its type scale and its icons.',
        compact:
          'Takes 4px off the field by tightening its padding, leaving the number of lines, the type and the icons alone.',
        rows: 'How many lines of text the field shows, the native <code>rows</code> attribute, which is what gives the field its height. Anything under 1 is raised to 1, and at 1 the field is exactly as tall as a VInput of the same size.',
        autoGrow:
          'Lets the field grow as the text is typed, instead of scrolling inside the height <code>rows</code> gives it, which stays its starting height. It is pure CSS: where the browser does not support it, the field behaves like an ordinary textarea.',
        invalid:
          'Marks the field as invalid whatever the browser thinks, the route for a rule only the server can check.',
        disabled: 'Makes the field unusable, greyed out through the colour tokens.',
        readonly:
          'Shows the text without allowing it to be changed. The field can still be focused and copied from, and the clear button is hidden.',
        label: 'The label above the field, tied to it so that clicking it focuses the field.',
        hint: 'A line of help under the field, tied to the textarea for assistive technology so that it is read out along with the label.',
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
        clearLabel:
          'What the clear button does, in words. It falls back to the design system dictionary.',
        maxlength:
          "The maximum number of characters. By default this is the browser's own limit, which simply refuses anything beyond it.",
        softLimit:
          'Turns that limit into a soft one: the reader may type past it, and the field goes into error instead of silently refusing the keystrokes. It is reported through the native validity, so a form cannot be submitted over the limit.',
        counter:
          'Shows how much has been typed, under the field: 12/80 against a limit, or just 12 without one.',
        vModel: 'The text in the field, empty to begin with.',
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
