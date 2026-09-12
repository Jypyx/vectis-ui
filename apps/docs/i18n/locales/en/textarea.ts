export default {
  title: 'Textarea',
  lead: 'A multi-line text field, with the same chrome as VInput: label above, hint below, icons inside, a counter and a clear button. It can grow as the text is typed.',

  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: '<code>label</code> is a real <code>&lt;label&gt;</code> tied to the field, so clicking the words puts the cursor in the box. <code>hint</code> goes under the field and is tied to it through <code>aria-describedby</code>.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the padding, the type scale and the icons, never the height, which comes from <code>rows</code>. <code>compact</code> takes 4px off the padding at any of the three.',
    },
    icons: {
      title: 'Icons',
      text: '<code>iconStart</code> and <code>iconEnd</code> place a decorative icon at either end, on the first line rather than in the middle of the box. The <code>#end</code> slot replaces the end icon, where <code>#start</code> is rendered after the start icon rather than in its place.',
    },
    clickableIcons: {
      title: 'Clickable icons',
      text: 'A <code>@click:icon-start</code> or <code>@click:icon-end</code> listener turns that icon into a real button, which then needs its label. Each button is its own tab stop and stays outside the textarea.',
    },
    clearable: {
      title: 'Clearable',
      text: '<code>clearable</code> adds a cross that empties the field, shown while there is something to clear and the field can be edited. Pressing it hands the focus straight back to the textarea, and <code>clear</code> fires after the fact.',
    },
    counters: {
      title: 'Counters',
      text: '<code>counter</code> goes under the field, beside the hint. Against <code>maxlength</code> the browser refuses everything past the limit, where <code>softLimit</code> lets the reader type on: the counter goes red and the field reports itself invalid through the native validity.',
    },
    autoGrow: {
      title: 'Auto grow',
      text: '<code>rows</code> gives the field its starting height, and by default its height full stop. <code>autoGrow</code> lets the box get taller as the text is typed, in pure CSS.',
    },
    states: {
      title: 'States',
      text: '<code>invalid</code> is for a rule the browser cannot check by itself. <code>disabled</code> greys the field out through the colour tokens. <code>readonly</code> can still be focused and copied from, and hides the clear cross. <code>loading</code> puts a spinner where the end icon goes, the field staying usable.',
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
        clearVisible:
          'Decides whether the cross is shown, instead of letting the field work it out from its own content, a read-only field included. It is the same escape hatch VInput offers, for components built on top of this one that hold what there is to clear somewhere other than the text.',
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
        start:
          'Content at the start of the field, rendered after <code>iconStart</code> rather than in its place.',
        end: 'Content at the end of the field, which replaces <code>iconEnd</code>. It is hidden while the field is loading, the spinner taking that place.',
        valueEnd:
          'Controls of your own inside the field, placed before the ones the field owns: the clear cross and the icon that opens the panel. Those two are the component own affordance, which is why there is no <code>end</code> slot here.',
      },
    },
  },
}
