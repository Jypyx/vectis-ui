export default {
  title: 'Tabs',
  lead: 'A bar of tabs and the panels they show. The panels are an optional slot, so the same component serves as a plain bar or a segmented control when there is nothing to reveal.',

  examples: {
    variants: {
      title: 'Variants and tones',
      text: 'The variant packs two decisions into one word, the track the tabs sit on and the frame around the whole thing. <code>flat</code> draws a rule under the row and underlines the selected tab; <code>outlined</code> is that same bar with its panels inside a card, the rule becoming the boundary between the two; <code>inset</code> drops the row into a hollow track and makes it a segmented control, which is why it is never framed, being already a surface of its own. The tone colours the selected tab and nothing else: the rest stay neutral whatever it says, only one of them making a claim. Three tones, the three a button offers, since every tab is one.',
    },
    sizes: {
      title: 'Sizes',
      text: 'The scale shared by every control, 24 to 56 pixels, with <code>compact</code> taking 4px off. It is set once on the bar and each tab is a button of that size, so a tab and a button standing beside it line up rather than nearly lining up.',
    },
    tabContent: {
      title: 'What a tab holds',
      text: 'A label, an icon at either end, or the default slot for anything a string cannot hold, a count or a badge. A tab reduced to its icon still has to say what it is: with no label there is no accessible name left, so give it one. The icon at the end is the place for what the tab carries rather than what it is, a number of items or a state.',
    },
    panels: {
      title: 'Panels',
      text: 'A hidden panel is hidden and not destroyed, so what it holds keeps its state and a field inside it is still submitted with the form. <code>lazy</code> is the exception and only for the first showing: it holds the content back until the panel is opened once, then keeps it like the others, which is what an expensive panel wants. Leaving the slot out renders no panel area at all, and that is the other half of the component: the same bar is then a segmented control switching a view that lives elsewhere on the page. The slot has to be there or absent from the start, never appearing later, since whether panels exist is decided once and has to agree between the server and the browser.',
    },
    alignment: {
      title: 'Alignment',
      text: 'Where the tabs sit along the bar when they do not fill it. It is set on the bar rather than on the list of tabs, and that is not a detail: pushing an overflowing list around would put whatever ran past the start edge permanently out of reach.',
    },
    grow: {
      title: 'Filling the bar',
      text: 'The tabs share the whole bar between them in equal parts, whatever their labels are worth, which is what turns a short row into a segmented control spanning its container. A label too long for its share is truncated rather than allowed to widen it. Growing and scrolling are incompatible by construction: tabs told to fill the bar can never overflow it.',
    },
    orientation: {
      title: 'Orientation',
      text: 'Down the side instead of across. The panels then sit beside the tabs rather than under them, the arrow keys follow the axis, and the scroll buttons move to the ends of the column with their icons turned to match. One thing moves that is worth knowing: framed, the rule between the tabs and the panels changes edge, the frame already drawing the outer one and what is missing being the boundary between the two halves.',
    },
    scrolling: {
      title: 'Scrolling',
      text: 'Too many tabs for the room and the bar scrolls: by touch, by trackpad, and from the keyboard, where the arrow keys bring the tab they reach back into view. The scrollbar itself is hidden, the tabs running off the edge being the cue. One thing to know about the container: a grid or flex item does not shrink below its content unless it is told to, so without a minimum size of zero the list widens its parent instead of overflowing.',
    },
    scrollButtons: {
      title: 'Scroll buttons',
      text: 'A button at each end of the bar, each disabled once that end is reached, for a pointer with no wheel to scroll with. They are opt-in because on a bar that never overflows they would be two permanently disabled controls, and they exclude <code>grow</code> for the same reason.',
    },
    customArrows: {
      title: 'Custom arrows',
      text: 'The default icons follow the orientation, chevrons across and carets down, so there is nothing to set on either axis. Replace them when the surrounding design asks for another glyph. The labels are what a screen reader reads for the two buttons, and they fall back to the design system dictionary in the current language.',
    },
    activation: {
      title: 'Selecting on arrival',
      text: 'Manual by default: an arrow key moves the focus, and Enter or Space selects. Set it to automatic and moving to a tab selects it, which is what the ARIA authoring practices recommend when a panel appears instantly, the reader hearing each panel as they walk the row instead of confirming every one. Leave it manual when showing a panel costs a request, or every tab passed over on the way would fire one.',
    },
    disabled: {
      title: 'Disabled tabs',
      text: 'A disabled tab is a disabled button: it stops responding, greys out through the colour tokens rather than through an opacity, and the arrow keys step over it as though it were not in the row. Its panel is simply never shown. Take care not to leave the value pointing at it, since a bar whose selected tab cannot be activated has no tab stop at all and is unreachable from the keyboard.',
    },
  },

  api: {
    VTabs: {
      props: {
        variant:
          'How the bar is framed. <code>flat</code> draws nothing but a rule under the tabs, with the selected one underlined; <code>outlined</code> puts that same bar and its panels inside a card; <code>inset</code> turns the row into a segmented control sitting in a hollow track.',
        tone: 'The colour the selected tab takes. The others stay neutral whatever this says.',
        size: 'The height of the tabs, from the scale shared by every control.',
        compact: 'Takes 4px off the height of every tab.',
        orientation: 'Whether the tabs run across the page or down its side.',
        align: 'Where the tabs sit along the bar when they do not fill it.',
        grow: 'Makes the tabs share the whole bar between them, in equal parts.',
        scrollButtons:
          'Adds a button at each end of the bar to scroll it, each disabled once that end is reached. It only makes sense when the tabs can overflow, so it excludes <code>grow</code>.',
        prevIcon:
          'The icon of the button scrolling backwards. It follows the orientation by default.',
        nextIcon:
          'The icon of the button scrolling forwards. It follows the orientation by default.',
        prevLabel:
          'What the backward scroll button does, in words. It falls back to the dictionary.',
        nextLabel:
          'What the forward scroll button does, in words. It falls back to the dictionary.',
        activation:
          'Whether moving to a tab also selects it. Selecting on arrival is what the ARIA authoring practices recommend when a panel appears instantly; leave it manual when showing a panel costs a request, or every tab passed over would fire one.',
        label:
          'What screen readers announce for the row of tabs. It falls back to the design system dictionary.',
        vModel:
          'The value of the selected tab. There is deliberately no default: the component cannot know which of the tabs you wrote should open. It must name a tab that exists and is not disabled, otherwise no tab has a tab stop and the bar is unreachable from the keyboard.',
      },
      slots: {
        default: 'The tabs themselves.',
        panels:
          'The panels the tabs show. Leaving it out renders no panel area at all, which is how the same component serves as a plain bar or a segmented control.',
      },
    },
    VTab: {
      props: {
        value:
          'What this tab is called in code. The panel carrying the same value is the one it shows, and it is also what the value holds when this tab is selected.',
        label: 'The visible label. The default slot replaces it.',
        iconStart: 'An icon before the label.',
        iconEnd: 'An icon after the label, for a count or a state the tab carries.',
        disabled:
          'Makes the tab unusable: it no longer responds, the arrow keys skip over it, and it greys out through the colour tokens.',
      },
      slots: {
        default: 'The content of the tab, replacing the <code>label</code> prop.',
      },
    },
    VTabPanel: {
      props: {
        value: 'Which tab shows this panel: it must be the value of one of them.',
        lazy: 'Holds the content back until the panel is first shown, and keeps it from then on. It is for a panel expensive to build; the state it holds is still preserved afterwards.',
      },
      slots: {
        default: 'What the panel contains.',
      },
    },
  },
}
