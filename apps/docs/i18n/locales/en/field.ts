export default {
  title: 'Field',
  lead: '<code>VField</code> places a label, a hint and an error message around any control. Its slot provides <code>fieldProps</code> to bind on the control.',
  examples: {
    native: {
      title: 'Native control',
      text: 'Native elements and third-party components take the same <code>fieldProps</code> as library controls.',
    },
    error: {
      title: 'Error',
      text: '<code>error</code> shows a message in place of the hint, so the field does not grow, and marks the control invalid. The message is announced when it appears. <code>required</code> adds an asterisk and passes <code>required</code> to the control.',
    },
    labelStart: {
      title: 'Label beside the control',
      text: '<code>labelPosition="start"</code> places the label in its own column. In a narrow field, the label moves back above the control.',
    },
    hiddenLabel: {
      title: 'Hidden label',
      text: '<code>hideLabel</code> hides the label visually. It still names the control for screen readers.',
    },
    group: {
      title: 'Group of elements',
      text: '<code>group</code> names a group of elements, such as a row of fields with a <code>group</code> role. The label becomes plain text and <code>fieldProps</code> provides <code>aria-labelledby</code> instead of the states a group cannot carry.',
    },
    meta: {
      title: 'Content beside the hint',
      text: 'The <code>meta</code> slot places content at the end of the hint line, such as a character counter. Bind the <code>id</code> it provides: it joins the control’s <code>aria-describedby</code>.',
    },
  },
  api: {
    VField: {
      props: {
        label: 'Label linked to the control through <code>for</code>.',
        hint: 'Help text below the control, linked through <code>aria-describedby</code>.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code>, is linked through <code>aria-describedby</code> and is announced when it appears.',
        required:
          'Adds an asterisk after the label and passes <code>required</code> to the control.',
        disabled:
          'Greys out the label and the hint and passes <code>disabled</code> to the control.',
        hideLabel: 'Hides the label visually while keeping it as the accessible name.',
        labelPosition: 'Places the label above the control or beside it.',
        group:
          'Names a group of elements through <code>aria-labelledby</code> instead of <code>for</code>.',
      },
      slots: {
        default:
          'The control. Bind <code>fieldProps</code>: id, descriptions, invalid state, <code>required</code>, <code>disabled</code> and the attributes set on the field other than <code>class</code> and <code>style</code>.',
        meta: 'Content at the end of the hint line, such as a character counter.',
      },
    },
  },
}
