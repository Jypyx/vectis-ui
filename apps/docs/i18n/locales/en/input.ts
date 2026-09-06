export default {
  title: 'Input',
  lead: 'A complete text field: label above, hint below, icons inside, a character counter, a clear button and a loading state, all around a real <code>&lt;input&gt;</code>.',

  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: 'The label is tied to the field, so clicking it puts the cursor in the input. The hint sits under the field and is tied to it too, through <code>aria-describedby</code>, which is what makes a screen reader read it out after the label instead of leaving it as loose text somewhere nearby. Both are plain props; an <code>id</code> of your own wins over the one the component generates for itself.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Three heights, 32, 40 and 48 pixels, medium by default. <code>compact</code> takes 4 pixels off any of them and leaves the padding, the text and the icons exactly where they were, which is how a dense form gets dense without shrinking what is written in it. The extra small and extra large steps of the scale are deliberately not offered here: 24 pixels is too short for text a reader edits, and 56 is outside the shape of a form.',
    },
    icons: {
      title: 'Icons',
      text: 'An icon inside the field, at either end. Both are decorative: no label, no focus, nothing announced, which is the right shape for a magnifier that says what the field is for or a tick that reports a state. Attaching a click listener is what turns one into a button, and that is the section below. The <code>#start</code> and <code>#end</code> slots take the same places when an icon is not what belongs there.',
    },
    clearable: {
      title: 'Clearable',
      text: 'A cross that empties the field. It shows itself only when there is something to clear and the field can be edited, and pressing it hands the focus straight back to the input: the cross vanishes in the same instant, and the focus would otherwise fall to the page. It is drawn before the end icon, so a field can be clearable and still carry a control of its own. For the fields whose value is not their text, a combobox holding chips or a picker filled from a panel, <code>clearVisible</code> answers the question instead.',
    },
    states: {
      title: 'States',
      text: 'A disabled field greys out through the colour tokens and leaves the tab order. A read-only one stays focusable and copyable, and hides its clear cross unless it is told otherwise. <code>invalid</code> is for a rule the browser cannot check by itself, a name already taken for instance: anything native validation can see already colours the field without it, once the reader has left it. <code>loading</code> puts a spinner where the end icon goes and announces itself.',
    },
    clickableIcons: {
      title: 'Clickable icons',
      text: 'An icon becomes a real button the moment a <code>@click:icon-start</code> or <code>@click:icon-end</code> listener is attached to it. Nothing else about it changes, same prop and same place in the field. What it does need from that point on is a label, since a button holding an icon has no text to be named by, and the component says so in development when one is missing.',
    },
    counters: {
      title: 'Counters',
      text: "The counter sits at the end of the field: 12/20 against a limit, or just 12 without one. <code>maxlength</code> on its own is the browser's hard limit, which simply refuses the keystroke past it. <code>softLimit</code> turns it into a line the reader is allowed to cross: the text is never cut, the counter turns red, and the field goes into error through the native validity, so the form refuses to submit rather than quietly truncating what was written.",
    },
    pattern: {
      title: 'Pattern',
      text: "There is no <code>pattern</code> prop. It is the native attribute, and it reaches the input through fallthrough along with <code>inputmode</code>, <code>title</code>, <code>name</code> and everything else a form needs, so the checking is the browser's and costs nothing here. The field turns red through <code>:user-invalid</code>, which waits until the reader has left it: a postcode is not wrong while it is still being typed.",
    },
  },

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
        valueEnd:
          "Controls of your own inside the field, placed before the field's own: the clear cross and the end icon. It is where something that acts on the value belongs, so that the reading order and the tab order agree.",
        end: 'Content at the end of the field, which replaces <code>iconEnd</code>. It is hidden while the field is loading, the spinner taking that place.',
      },
    },
  },
}
