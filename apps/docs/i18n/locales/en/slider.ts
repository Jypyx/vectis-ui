export default {
  title: 'Slider',
  lead: 'A value picked by sliding, one thumb or two. It is built on real range inputs, so the keyboard, the form and assistive technology all come from the browser.',

  examples: {
    range: {
      title: 'Range',
      text: '<code>range</code> offers two thumbs to pick a span, which makes the value a pair. The thumbs are stopped from crossing, and each is announced as the start or the end of the range.',
    },
    minMax: {
      title: 'Min and max',
      text: '<code>min</code> and <code>max</code> bound the value, 0 and 100 unless said otherwise, negatives included. Everything else is measured against them.',
    },
    steps: {
      title: 'Steps',
      text: '<code>step</code> is the gap between two values the thumb can stop on, and what an arrow key moves by. <code>ticks</code> marks those stops on the track, and past fifty steps no tick is drawn.',
    },
    textLabels: {
      title: 'Text labels',
      text: '<code>labels</code> names the stops under the track, one entry per step, and is what a screen reader announces in place of the raw number. Giving labels turns the ticks on by itself.',
    },
    iconLabels: {
      title: 'Icon labels',
      text: 'A label may carry an icon instead of a word, the label still being what is announced and what the value is read as. Both forms mix in the same list.',
    },
    tooltip: {
      title: 'Showing the value while sliding',
      text: '<code>tooltip</code> shows a bubble above the thumb while it is dragged or holds keyboard focus, one per thumb. It is decorative and hidden from assistive technology.',
    },
    inputs: {
      title: 'Typing the value exactly',
      text: '<code>inputs</code> adds a number field beside the track, one per end in range mode. What is typed is committed when the field is left or on Enter, clamped and snapped to the step; an unreadable entry puts the previous value back.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation</code> set to <code>vertical</code> stands the slider up, the lowest value at the bottom. Its length comes from a token rather than from its container.',
    },
    disabled: {
      title: 'Disabled',
      text: '<code>disabled</code> greys the track, the thumb and the ticks through the colour tokens, takes the thumbs out of the tab order and disables the number fields with them.',
    },
    form: {
      title: 'In a form',
      text: '<code>name</code>, <code>id</code> and the aria-* are redirected onto the real range input underneath. Naming goes through the <code>label</code> prop, which sets an aria-label, so pick either it or a visible label of your own. A range has no single value to submit: only the end thumb carries the name.',
    },
  },

  api: {
    VSlider: {
      props: {
        min: 'The lowest value the thumb can reach.',
        max: 'The highest value the thumb can reach.',
        step: 'The gap between two values the thumb can stop on. It is also what the arrow keys move by, and what a value typed into the companion field is snapped to.',
        range: 'Offers two thumbs to pick a range, which makes the value a pair.',
        disabled: 'Makes the slider unusable.',
        label:
          'What screen readers announce for the slider. In range mode the two thumbs are announced as the start and the end of it.',
        orientation: 'Turns the slider upright, with the lowest value at the bottom.',
        inputs:
          'Adds a number field beside the slider for setting the value exactly, one field or one per end in range mode. Sliding is quick but imprecise; this is the way out.',
        ticks:
          'Marks each step on the track. Providing labels implies it. Past fifty steps the marks would be an unreadable comb and are not drawn at all.',
        labels:
          'A label for every step, in order: a piece of text, or an icon with the words that name it for screen readers. They also become what a screen reader announces in place of the raw number.',
        tooltip: 'Shows the value in a bubble above the thumb while it is being moved or focused.',
        vModel:
          'The value, and its shape is what puts the slider in range mode: a single number gives one thumb, a pair of them gives two. The pair is always ordered, the thumbs being stopped from crossing.',
      },
    },
  },
}
