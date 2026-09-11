export default {
  title: 'Slider',
  lead: 'A value picked by sliding, one thumb or two. It is built on real range inputs, so the keyboard, the form and assistive technology all come from the browser.',

  examples: {
    range: {
      title: 'Range',
      text: 'Two thumbs instead of one, for a span rather than a value. The shape of the model is what settles the mode: a single number gives one thumb, a pair gives two, so nothing has to be kept in step by hand. The thumbs are stopped from crossing, which keeps the pair ordered whatever the reader does, and each is announced as the start or the end of the range rather than as two sliders answering to the same name.',
    },
    minMax: {
      title: 'Min and max',
      text: 'The bounds of the value, 0 and 100 unless said otherwise, and both may be anything, negatives included. They are the first thing to set, since everything else is measured against them: the step divides the span between them, the ticks mark that division, and a label list has to have one entry per stop.',
    },
    steps: {
      title: 'Steps',
      text: 'The gap between two values the thumb can stop on, and also what an arrow key moves by. <code>ticks</code> marks each of those stops on the track, and a fractional step is fine, the value being rounded back onto the step rather than accumulating what floating point leaves behind. One case is worth knowing: when the span does not divide evenly by the step, the last stop falls short of the maximum, and the ticks say so rather than drawing a mark where the thumb cannot go. Past fifty steps no tick is drawn at all, a comb that dense being unreadable.',
    },
    textLabels: {
      title: 'Text labels',
      text: 'One label per step, in order. They name the stops under the track, and they become what a screen reader announces in place of the raw number, which is what the slider needs as soon as its values are not quantities: a size reads as "M" and not as "2". Giving labels turns the ticks on by itself, a label with no mark to sit under having nothing to point at.',
    },
    iconLabels: {
      title: 'Icon labels',
      text: 'A step may be named by an icon instead of a word, and then the word comes with it: the icon is what is seen, the label what is announced and what the value is read as. Both forms mix in the same list, so a scale can be drawn where it speaks for itself and spelled out where it does not.',
    },
    tooltip: {
      title: 'Showing the value while sliding',
      text: 'A bubble above the thumb, while it is being dragged or while it holds keyboard focus. It is what a track carrying no numbers needs, and each thumb of a range carries its own. It is decorative and hidden from assistive technology, the value already being part of what the slider announces, so nothing is said twice.',
    },
    inputs: {
      title: 'Typing the value exactly',
      text: 'Sliding is quick and imprecise, and this is the way out: a number field beside the track, one per end in range mode. What is typed is committed when the field is left or on Enter, never as it is typed, since reading it keystroke by keystroke would clamp the 1 of 15 before the 5 was ever pressed. An entry out of bounds is brought back inside and snapped to the step; an unreadable one, an empty field included, silently puts the previous value back.',
    },
    orientation: {
      title: 'Orientation',
      text: 'Upright, with the lowest value at the bottom. Everything else is unchanged: the ticks, the labels, the bubbles and the number fields all follow the axis, and the keyboard is still the browser\u2019s. A vertical slider has no container to take its length from, so it reads a token instead, which is what to override to make it longer or shorter.',
    },
    disabled: {
      title: 'Disabled',
      text: 'The only state the slider has. It greys the track, the thumb and the ticks through the colour tokens rather than through an opacity, takes the thumbs out of the tab order, and disables the number fields along with them: there is no half-usable slider whose value can still be typed.',
    },
    form: {
      title: 'In a form',
      text: 'The root of the component is a layout box holding the labels, the track and the optional fields, so <code>name</code>, <code>id</code> and the aria-* are redirected onto the real range input underneath: left on the wrapper, a name would submit nothing and a label would point at a div. Naming the slider goes through the <code>label</code> prop, which sets an aria-label and would therefore win over a visible label of your own, so pick one of the two. A range is the case with no good answer: two thumbs have no single value to submit, only the end one carries the name, and the component says so in development. Bind the model to two inputs of your own instead.',
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
