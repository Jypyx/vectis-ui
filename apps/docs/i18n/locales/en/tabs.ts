export default {
  title: 'Tabs',
  lead: 'A bar of tabs and the panels they show. The panels are an optional slot, so the same component serves as a plain bar or a segmented control when there is nothing to reveal.',

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
        icon: 'An icon before the label.',
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
