export default {
  title: 'Button group',
  lead: 'Joins buttons into one segmented control: merged borders, rounded corners at the ends only. The row is one object, so it is the group that decides how it is drawn, from whether the buttons are joined at all down to the variant, the tone, the size and the density every button inside picks up.',

  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: 'Both are named once on the group, and each row below is one tone: <code>accent</code>, then <code>neutral</code>, then <code>danger</code>, across the four variants VButton offers. The two do not travel the same way. The variant wins over whatever a button inside was given, a segment of another silhouette no longer reading as part of the row; the tone is only a fallback, which is what the next example builds on.',
    },
    toneOverride: {
      title: 'One segment, another tone',
      text: "The tone is the one appearance prop a button keeps against its group: it is meaning rather than shape, and a row of actions often holds exactly one that destroys something. Here the row is neutral and the last segment alone says <code>danger</code>. Everything else stays the group's, so the destructive action is still the same height, the same variant and the same density as its neighbours.",
    },
    orientation: {
      title: 'Orientation',
      text: 'A row by default, a column under <code>vertical</code>. The joining follows the axis: the merged borders and the seams move to the horizontal edges, and the rounded corners are kept at the top of the first segment and the bottom of the last. A column also stretches every segment across its width, so the buttons line up whatever their labels measure.',
    },
    detached: {
      title: 'Detached',
      text: '<code>detached</code> leaves the buttons apart instead of joining them: a gap between them, and each keeping its own corners and its own borders. Everything the group hands down still travels, which is the reason to reach for it rather than drop the group altogether. It suits a row of unrelated actions that share an appearance, where a segmented control would suggest they are one choice made three ways.',
    },
    seamless: {
      title: 'Seamless',
      text: 'A joined row draws a line at every joint, so the segments read as separate choices. <code>seamless</code> takes those lines out: no seam is drawn, and the borders on both sides of each shared edge are cleared, leaving a single frame with its outer edges intact. Both sides go, never one: the segments overlap by a pixel, so a border left on either of them would show through wherever the segment on top has no background of its own.',
    },
    elevated: {
      title: 'Elevated',
      text: 'The shadow belongs to the row rather than to each segment: three overlapping shadows would each fall on the neighbour they cover and draw a dark band down every joint. So the group casts one shadow and the buttons give theirs up, and the row rises as a whole when any part of it is hovered. Detached, in the third row, that reasoning goes with the overlap and each button casts its own again.',
    },
    sizes: {
      title: 'Sizes',
      text: 'The five heights of the scale every control shares, named once on the group: 24, 32, 40, 48 and 56 pixels. The size wins over whatever a button inside was given, a segment of another height no longer lining up with its neighbours.',
    },
    compact: {
      title: 'Compact',
      text: 'Each pair below is one step of the scale, the second of the two <code>compact</code>: 4px come off the height of every segment and nothing else moves. Like the size, it is the group that decides, so a dense toolbar is one prop rather than one per button.',
    },
    fullWidth: {
      title: 'Full width',
      text: 'The row is as wide as its labels unless it is told otherwise. <code>fullWidth</code> stretches it across its parent and gives every segment an equal share of that width, whatever the words in it measure, which is what a segmented control standing on a line of its own usually asks for. The shares are grid tracks rather than flex bases, so the three come out the same width whether a segment is a plain button or one wrapped in a tooltip or a badge. A segment never shrinks below its own label: a row of labels too long for the parent overflows rather than crushing text nothing could then truncate.',
    },
    icons: {
      title: 'With icons',
      text: 'Segments carry icons the way any button does, through <code>iconStart</code> and <code>iconEnd</code>. A VIconButton is a segment too, and the second row is the usual case for one: a toolbar of icon-only controls, which takes <code>role="toolbar"</code> through fallthrough since the default <code>group</code> role says less about it. Each of them still needs a <code>label</code>, the accessible name a glyph cannot supply.',
    },
    link: {
      title: 'Link',
      text: 'A segment given an <code>href</code> renders an <code>&lt;a&gt;</code>, and a row of them is a set of destinations rather than a set of actions: middle-click, open in a new tab and the browser status bar all come back. The row is drawn exactly as before, the joining being a matter of the boxes and not of what each of them turns out to be. A disabled link is made inert rather than merely greyed: the address is dropped, so it can be neither focused nor followed.',
    },
    states: {
      title: 'States',
      text: "The first row is switched off by the group, the second by its own buttons. <code>disabled</code> is the one prop that adds up rather than overruling: a row that says nothing leaves a button that disabled itself disabled, and a segment cannot opt back in once the row is off. <code>loading</code> stays the button's own, since only it knows what it is waiting for.",
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
