export default {
  title: 'Input group',
  lead: '<code>VInputGroup</code> joins fields based on <code>VInput</code> and buttons in one row, with shared borders and labels.',
  examples: {
    multipleInputs: {
      title: 'Multiple fields',
      text: 'Fields share the available width equally. Buttons keep their natural width.',
    },
    naming: {
      title: 'Accessible names',
      text: 'Use the group’s <code>label</code> and <code>hint</code> for shared text. Give each field an <code>aria-label</code> to name it without adding a visible label.',
    },
    widths: {
      title: 'Widths',
      text: 'Set <code>flex</code> on a segment’s class to change its width.',
    },
    withButton: {
      title: 'With a button',
      text: 'Use <code>solid</code> or <code>soft</code>, or <code>outline</code> with <code>tone="neutral"</code>. Avoid <code>ghost</code>, which has no visible frame.',
    },
    sizes: {
      title: 'Size and density',
      text: 'Set <code>size</code> and <code>compact</code> on the group to override individual settings.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> disables all segments. Individually disabled segments stay disabled; set errors on the affected field.',
    },
    pickers: {
      title: 'With pickers',
      text: 'Each picker panel opens beneath its own field. Group sizing does not affect controls inside the panels.',
    },
  },
  api: {
    VInputGroup: {
      props: {
        required:
          'Adds an asterisk after the label. Mark the segments <code>required</code> themselves.',
        hideLabel: 'Hides the label visually while keeping it as the accessible name.',
        labelPosition: 'Places the label above the field or beside it.',
        label:
          'Shared visible label and accessible group name. Consumer <code>aria-label</code> or <code>aria-labelledby</code> takes precedence. Name each field separately.',
        error:
          'Error message shown in place of the hint, linked to the group through <code>aria-describedby</code> and announced when it appears. Mark the faulty segments with <code>invalid</code>.',
        hint: 'Shared help text below the row, linked to the group through <code>aria-describedby</code>.',
        size: 'Size of all segments. Overrides individual sizes; when omitted, each segment keeps its own.',
        compact:
          'Reduces segment height. Overrides individual values, including when set to <code>false</code>; when omitted, each segment keeps its own.',
        disabled:
          'Disables all segments. Setting it to <code>false</code> does not enable individually disabled controls.',
      },
      slots: {
        default:
          'Fields based on <code>VInput</code>, plus <code>VButton</code> or <code>VIconButton</code> components.',
      },
    },
  },
}
