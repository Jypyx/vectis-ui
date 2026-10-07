export default {
  title: 'Slider',
  lead: '<code>VSlider</code> selects a number or a range with one or two thumbs. Optional number fields allow precise entry.',
  examples: {
    range: {
      title: 'Range',
      text: '<code>range</code> uses an ordered pair. Moving one thumb past the other pushes both to the new value.',
    },
    minMax: {
      title: 'Min and max',
      text: '<code>min</code> and <code>max</code> set the bounds, including negative values.',
    },
    steps: {
      title: 'Steps',
      text: '<code>step</code> sets the increment. <code>ticks</code> marks stops when there are at most 50 steps.',
    },
    textLabels: {
      title: 'Text labels',
      text: '<code>labels</code> names each step and supplies its accessible value text. It also enables ticks.',
    },
    iconLabels: {
      title: 'Icon labels',
      text: 'Labels can mix strings and objects containing an icon and accessible text.',
    },
    tooltip: {
      title: 'Value tooltip',
      text: '<code>tooltip</code> displays the value during dragging or keyboard focus.',
    },
    inputs: {
      title: 'Number fields',
      text: '<code>inputs</code> adds <code>VNumberInput</code> fields. Blur or Enter commits the value, bounded and snapped to the step. Invalid entries restore the previous value.',
    },
    inputsPlacement: {
      title: 'Field placement',
      text: '<code>ends</code> places fields beside the track; <code>top</code> and <code>bottom</code> place them above or below. On vertical sliders, these become the start and end sides.',
    },
    format: {
      title: 'Number format',
      text: '<code>formatOptions</code> takes <code>Intl.NumberFormat</code> options and <code>locale</code> a language tag. Both apply to the tooltip, the number fields and the value thumbs announce. <code>min</code>, <code>max</code> and <code>step</code> stay in model units: with <code>style: "percent"</code>, 0.25 shows as 25%.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation="vertical"</code> places the lowest value at the bottom.',
    },
    disabled: {
      title: 'Disabled',
      text: '<code>disabled</code> disables thumbs and number fields.',
    },
    form: {
      title: 'In a form',
      text: '<code>label</code> is shown above the slider and names its thumbs; <code>hideLabel</code> hides it visually. Consumer ARIA names take precedence. Native attributes reach the end thumb; in range mode, only that value is submitted.',
    },
    sizes: {
      title: 'Field sizes',
      text: '<code>size</code> adjusts number fields. A size set by <code>VInputGroup</code> takes precedence.',
    },
    readonly: {
      title: 'Read-only',
      text: '<code>readonly</code> prevents pointer and keyboard changes while preserving focus.',
    },
    invalid: {
      title: 'Invalid',
      text: '<code>invalid</code> marks thumbs and number fields with <code>aria-invalid</code> and the error style.',
    },
  },
  api: {
    VSlider: {
      props: {
        readonly:
          'Prevents pointer and keyboard changes. Thumbs remain focusable; number fields become read-only.',
        invalid:
          'Sets <code>aria-invalid</code> and the error style. Does not block form submission by itself.',
        size: 'Number-field size, overridden when <code>VInputGroup</code> sets a size.',
        min: 'Minimum value.',
        max: 'Maximum value.',
        step: 'Value increment for thumbs, keyboard input and number fields.',
        range: 'Enables two thumbs and an ordered pair for <code>v-model</code>.',
        disabled: 'Disables interaction.',
        label:
          'Label above the slider, which also names the thumbs. Range thumbs receive distinct start and end names.',
        hideLabel: 'Hides the label visually while keeping it as the thumbs name.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code>, is linked through <code>aria-describedby</code> and is announced when it appears.',
        hint: 'Help text linked through <code>aria-describedby</code>.',
        orientation: 'Track direction. Vertical sliders place the minimum at the bottom.',
        inputs:
          'Number-field placement: <code>ends</code>, <code>top</code>, <code>bottom</code>, or <code>false</code> to hide them. Range mode adds two fields.',
        ticks: 'Shows step markers, also enabled by <code>labels</code>. Hidden beyond 50 steps.',
        labels:
          'Ordered step labels, as strings or icon-and-label objects. Also supplies accessible value text.',
        tooltip:
          'Displays the value while a thumb is dragged or focused. Hidden from assistive technology.',
        formatOptions:
          '<code>Intl.NumberFormat</code> options for the tooltip, the number fields and the value thumbs announce.',
        locale: 'Language of the written value. Defaults to the library locale.',
        vModel:
          'Number or ordered pair with <code>range</code>. Crossing thumbs pushes the other endpoint to keep the pair ordered.',
      },
      events: {
        input: 'Emits the whole value while a thumb moves.',
        change: 'Emits the committed value after thumb interaction or number-field validation.',
      },
    },
  },
}
