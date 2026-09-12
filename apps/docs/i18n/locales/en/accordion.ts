export default {
  title: 'Accordion',
  lead: 'Sections that fold. It is built on <code>&lt;details&gt;</code> and <code>&lt;summary&gt;</code>, so the open state, the keyboard behaviour and in-page search all come from the browser.',

  examples: {
    variants: {
      title: 'Variants',
      text: '<code>variant</code> sets the group decoration: <code>flat</code> (default) draws nothing, <code>outlined</code> adds a raised background, a border and rounded corners.',
    },
    exclusive: {
      title: 'One section at a time',
      text: 'A group keeps a single section open by default. <code>multiple</code> allows several sections to stay open at the same time.',
    },
    subtitles: {
      title: 'Subtitles and icons',
      text: '<code>icon</code> places an icon before the title and <code>subtitle</code> adds a second line under it. The <code>#start</code> and <code>#subtitle</code> slots take markup instead of plain text.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> reduces every padding by 4px, leaving the text and the icons at their size.',
    },
    icons: {
      title: 'Expand and collapse icons',
      text: '<code>expandIcon</code> replaces the chevron. Adding <code>collapseIcon</code> swaps the two icons when a section opens, instead of rotating the first one.',
    },
    disabled: {
      title: 'Disabled sections',
      text: '<code>disabled</code> prevents a section from being opened and greys it out. The keyboard steps over it.',
    },
  },

  api: {
    VAccordion: {
      props: {
        multiple:
          'Lets the reader keep several sections open at once. Left out, only one stays open and opening one closes the last, which the browser does on its own once every item shares a <code>&lt;details&gt;</code> name.',
        variant:
          'How the group is decorated. <code>flat</code> draws nothing and lets the accordion sit on the surface behind it; <code>outlined</code> gives it a raised background, a border and rounded corners, so it reads as a card.',
        expandIcon:
          'The icon shown on a closed section. It is a chevron, which rotates by 180° when the section opens.',
        collapseIcon:
          'The icon shown on an open section. Leave it out and the expand icon is rotated instead; give one and the two are swapped.',
        compact:
          'Reduced density: every padding loses 4px, while the text and the icons keep their size.',
      },
      slots: {
        default: 'The <code>VAccordionItem</code>s that make up the group.',
      },
    },
    VAccordionItem: {
      props: {
        title:
          'The heading of the section, the line that stays visible when it is closed. Use the <code>#title</code> slot when the heading needs markup rather than plain text.',
        subtitle:
          'A second line under the title, for a short explanation or a status. The <code>#subtitle</code> slot replaces it when markup is needed.',
        icon: 'An icon before the title. The <code>#start</code> slot replaces it.',
        defaultOpen:
          'Renders the section already open. It sets the first render only: the browser owns the state afterwards, so changing this later will not close a section the reader has opened.',
        disabled:
          'Makes the section inert. It can no longer be opened, the keyboard steps over it, and it greys out through the colour tokens.',
      },
      slots: {
        default: 'The content revealed when the section is open.',
        title: 'A title made of markup, which replaces the <code>title</code> prop.',
        subtitle: 'A subtitle made of markup, which replaces the <code>subtitle</code> prop.',
        start: 'Free content before the title, which takes the place of <code>icon</code>.',
      },
    },
  },
}
