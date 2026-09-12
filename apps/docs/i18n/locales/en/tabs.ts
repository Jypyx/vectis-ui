export default {
  title: 'Tabs',
  lead: 'A bar of tabs and the panels they show. The panels are an optional slot, so the same component serves as a plain bar or a segmented control when there is nothing to reveal.',

  examples: {
    variants: {
      title: 'Variants and tones',
      text: '<code>variant</code> sets the track and the frame at once: <code>flat</code> draws a rule under the row and underlines the selected tab, <code>outlined</code> puts that same bar and its panels inside a card, <code>inset</code> drops the row into a hollow track. <code>tone</code> colours the selected tab and nothing else, with the three values a button offers.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> takes the scale every control shares, 24 to 56 pixels, and <code>compact</code> takes 4px off it. It is set once on the bar.',
    },
    tabContent: {
      title: 'What a tab holds',
      text: 'A tab takes a label, an icon at either end through <code>iconStart</code> and <code>iconEnd</code>, or the default slot for what a string cannot hold. A tab reduced to its icon still needs a <code>label</code>, which is then its accessible name.',
    },
    panels: {
      title: 'Panels',
      text: 'A hidden panel is hidden and not destroyed, so what it holds keeps its state and a field inside it is still submitted. <code>lazy</code> holds the content back until the panel is opened once. Leaving the <code>#panels</code> slot out renders no panel area at all, and it has to be there or absent from the start.',
    },
    alignment: {
      title: 'Alignment',
      text: '<code>align</code> says where the tabs sit along the bar when they do not fill it. It is set on the bar rather than on the list of tabs.',
    },
    grow: {
      title: 'Filling the bar',
      text: '<code>grow</code> shares the whole bar between the tabs in equal parts, a label too long for its share being truncated. It is incompatible with scrolling by construction.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation</code> set to <code>vertical</code> runs the tabs down the side, the panels sitting beside them and the arrow keys following the axis.',
    },
    scrolling: {
      title: 'Scrolling',
      text: 'Too many tabs for the room and the bar scrolls, by touch, by trackpad and from the keyboard. The container needs a minimum size of zero, or the list widens its parent instead of overflowing.',
    },
    scrollButtons: {
      title: 'Scroll buttons',
      text: '<code>scrollButtons</code> adds a button at each end of the bar, each disabled once that end is reached. It is opt-in, and excludes <code>grow</code>.',
    },
    customArrows: {
      title: 'Custom arrows',
      text: '<code>prevIcon</code> and <code>nextIcon</code> replace the arrows, whose defaults follow the orientation. <code>prevLabel</code> and <code>nextLabel</code> are what a screen reader reads for the two buttons, and fall back to the dictionary.',
    },
    activation: {
      title: 'Selecting on arrival',
      text: '<code>activation</code> is manual by default: an arrow key moves the focus, and Enter or Space selects. Automatic selects the tab the focus reaches, which suits a panel that appears instantly.',
    },
    disabled: {
      title: 'Disabled tabs',
      text: 'A <code>disabled</code> tab stops responding, greys out through the colour tokens and is stepped over by the arrow keys. Do not leave the value pointing at it, or the bar has no tab stop at all.',
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
