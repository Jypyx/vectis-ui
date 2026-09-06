export default {
  title: 'Textarea',
  lead: 'A multi-line text field, with the same chrome as VInput: label above, hint below, icons inside, a counter and a clear button. It can grow as the text is typed.',

  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: 'The label is a real <code>&lt;label&gt;</code> tied to the field, so clicking the words puts the cursor in the box. The hint goes under the field and is tied to it as well, through <code>aria-describedby</code>, which is what has it read out after the label rather than left on the page as loose text. Both are props and not slots: what they hold is a sentence, and the field needs it as a string to point at.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Three sizes, the same three every text field in the library offers. A size sets the padding, the type scale and the icons, never the height: that one comes from <code>rows</code>. <code>compact</code> takes 4px off the padding at any of the three, for a dense form, and leaves the number of lines and the type where they were.',
    },
    icons: {
      title: 'Icons',
      text: 'An icon at either end of the field, or at both. They are decorative here, so the field keeps the name its label gives it. They sit on the first line rather than in the middle of the box, which is what keeps them level with the start of the text in a field several lines tall. The <code>#start</code> and <code>#end</code> slots take their place when what belongs there is not an icon.',
    },
    clickableIcons: {
      title: 'Clickable icons',
      text: 'An icon becomes a real button as soon as a <code>@click:icon-start</code> or <code>@click:icon-end</code> listener is attached, and it then needs a label, which is the only thing naming that button. Forget it and the field says so in development. Each button is its own tab stop, before or after the text according to the side it sits on, and it stays outside the textarea, so typing is never interrupted by it.',
    },
    clearable: {
      title: 'Clearable',
      text: 'The cross shows when there is something to clear and the field can be edited, so it is absent while the field is empty, disabled or read only. Pressing it empties the value and hands focus straight back to the textarea: the cross goes with the text, and without that a keyboard user would be left standing on nothing. The <code>clear</code> event fires after the fact, the field already empty.',
    },
    counters: {
      title: 'Counters',
      text: 'The counter goes under the field, beside the hint, where several lines of text would run into it inside the box. Against <code>maxlength</code> it reads 12/80 and the browser refuses everything past the limit. <code>softLimit</code> turns that refusal into an error: the reader may type on, the counter goes red, and the field reports itself invalid through the native validity, so the form cannot be submitted over the limit. With no limit at all, the counter only counts.',
    },
    autoGrow: {
      title: 'Auto grow',
      text: '<code>rows</code> gives the field its starting height, and by default that is its height full stop: past it the text scrolls. <code>autoGrow</code> lets the box get taller as the text is typed. It is pure CSS, through <code>field-sizing</code>, so nothing is measured and no JavaScript runs; a browser without it keeps the fixed height and its scrollbar, which is a smaller field rather than a broken one.',
    },
    states: {
      title: 'States',
      text: 'Invalid, disabled, read only, loading. <code>invalid</code> is for a rule the browser cannot check by itself, a name already taken or anything only the server knows; native validity is handled without it. A disabled field greys out through the colour tokens rather than an opacity, so its text keeps its contrast. A read only one can still be focused and copied from, which is the whole difference, and it hides the clear cross. Loading puts a spinner where the end icon goes, and the field stays usable while it turns.',
    },
  },

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
