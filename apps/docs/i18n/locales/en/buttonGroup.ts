export default {
  title: 'Button group',
  lead: 'Joins buttons into one segmented control: merged borders, rounded corners at the ends only. The row is one object, so it is the group that decides how it is drawn, from whether the buttons are joined at all down to the variant, the tone, the size and the density every button inside picks up.',

  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: '<code>variant</code> and <code>tone</code> are named once on the group. The variant wins over whatever a button inside was given; the tone is only a fallback.',
    },
    toneOverride: {
      title: 'One segment, another tone',
      text: 'A segment keeps its own <code>tone</code> against the group, which is how a neutral row holds a single destructive action.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>vertical</code> stacks the segments in a column instead of a row, the joining following the axis.',
    },
    detached: {
      title: 'Detached',
      text: '<code>detached</code> leaves the buttons apart, each keeping its own corners and borders, while the group still hands its appearance props down.',
    },
    seamless: {
      title: 'Seamless',
      text: '<code>seamless</code> removes the lines drawn at each joint, leaving a single frame with its outer edges intact.',
    },
    elevated: {
      title: 'Elevated',
      text: '<code>elevated</code> gives the shadow to the row rather than to each segment. Detached, each button casts its own again.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the height of every segment: 24, 32, 40, 48 or 56 pixels. It wins over whatever a button inside was given.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> takes 4px off the height of every segment.',
    },
    fullWidth: {
      title: 'Full width',
      text: '<code>fullWidth</code> stretches the row across its parent and gives every segment an equal share of that width.',
    },
    icons: {
      title: 'With icons',
      text: 'Segments carry <code>iconStart</code> and <code>iconEnd</code> the way any button does. A VIconButton is a segment too, and still needs its <code>label</code>.',
    },
    link: {
      title: 'Link',
      text: 'A segment given an <code>href</code> renders an <code>&lt;a&gt;</code>. A disabled link has its address dropped, which leaves it neither focusable nor followable.',
    },
    states: {
      title: 'States',
      text: "<code>disabled</code> on the group adds up with each button's own: a segment cannot opt back in once the row is off. <code>loading</code> stays the button's own.",
    },
  },

  api: {
    VButtonGroup: {
      props: {
        orientation:
          'The direction the buttons are joined in: a row by default, or a column under <code>vertical</code>.',
        detached:
          'Leaves the buttons as separate ones, with a gap between them and each keeping its own corners, instead of joining them into a segmented control. Everything the group hands down still travels, and an elevated row then lets each button cast its own shadow.',
        seamless:
          'Takes the lines out from between the joined buttons: no seam is drawn, and the borders on both sides of every shared edge are cleared, so the row reads as one frame rather than as segments. The outer edges stay. It has no effect under <code>detached</code>, where there is no shared edge to take a line off.',
        fullWidth:
          'Stretches the row across the whole inline size of its parent, every segment taking an equal share of that width whatever its label measures. A segment never shrinks below its own label, so a row of labels too long for the parent overflows rather than being crushed. Under <code>vertical</code> it is the width alone, a column already stretching every segment across it.',
        variant:
          "How much visual weight every segment carries, on VButton's own values: <code>solid</code>, <code>outline</code>, <code>ghost</code> or <code>soft</code>. It wins over the variant a button inside was given, a segment of another silhouette no longer reading as part of the row. Left out, each button keeps its own.",
        tone: 'The colour the segments take, among <code>accent</code>, <code>neutral</code> and <code>danger</code>. This one is a fallback rather than an order: a button that names a tone of its own keeps it, which is what lets a single destructive action stand out in the row.',
        size: 'The height of the segments, from the size scale shared by every control: <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> or <code>xl</code>. It wins over the size a button inside was given. Left out, each button keeps its own.',
        compact:
          'Takes 4px off the height of every segment. It wins over the value a button inside was given. Left out, each button keeps its own.',
        elevated:
          "Raises the row off the page with the shadow scale, on the terms of VButton's own prop. The shadow is the row's and not each segment's, which is what keeps the joints clear: three overlapping shadows would draw a dark band down each of them. It wins over the value a button inside was given. Left out, each button keeps its own.",
        disabled:
          'Makes every segment unusable. This one adds up rather than overruling: a button that disables itself stays disabled in a row that says nothing, and a segment cannot opt back in once the row is switched off.',
      },
      slots: {
        default: 'The VButtons and VIconButtons to join together.',
      },
    },
  },
}
