export default {
  title: 'Slider',
  lead: 'A value picked by sliding, one thumb or two. It is built on real range inputs, so the keyboard, the form and assistive technology all come from the browser.',

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
