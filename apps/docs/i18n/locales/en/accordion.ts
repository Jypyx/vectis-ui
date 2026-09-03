export default {
  title: 'Accordion',
  lead: 'Sections that fold. It is built on <code>&lt;details&gt;</code> and <code>&lt;summary&gt;</code>, so the open state, the keyboard behaviour and in-page search all come from the browser.',

  examples: {
    variants: {
      title: 'Variants',
      text: 'Two decorations, chosen on the group. <code>flat</code>, the default, draws nothing at all and lets the accordion sit on the surface behind it; <code>outlined</code> gives it a raised background, a border and rounded corners, so the group reads as a card.',
    },
    exclusive: {
      title: 'One section at a time',
      text: 'A group keeps a single section open: opening one closes the last, which the browser does on its own once every item shares the same <code>&lt;details&gt;</code> name. The second group sets <code>exclusive</code> to <code>false</code>, and the reader may then keep as many sections open as they like.',
    },
    subtitles: {
      title: 'Subtitles and icons',
      text: '<code>iconStart</code> places an icon before the title, and <code>subtitle</code> adds a second line under it for a status or a short explanation. Both have a slot counterpart, <code>#start</code> and <code>#subtitle</code>, for when the heading needs markup rather than plain text.',
    },
    compact: {
      title: 'Compact',
      text: 'Reduced density: every padding loses 4px while the text and the icons keep their size. It is what a settings panel or a sidebar wants, where the sections are short and there are many of them.',
    },
    icons: {
      title: 'Expand and collapse icons',
      text: "The chevron is replaced by <code>expandIcon</code>. Give a <code>collapseIcon</code> as well and the two are swapped when a section opens, instead of the first being rotated by 180°. Every icon prop takes the same values: one of the library's own icons, an explicit render, or a name the icon set wired into your application answers to, which is how the plus and the minus below are given.",
    },
    disabled: {
      title: 'Disabled sections',
      text: 'A disabled section can no longer be opened, the keyboard steps over it, and it greys out through the colour tokens. A <code>&lt;summary&gt;</code> has no native <code>disabled</code> attribute, so the component marks it <code>aria-disabled</code> and cancels the click itself.',
    },
  },

  api: {
    VAccordion: {
      props: {
        exclusive:
          'Keeps a single section open at a time, so opening one closes the last. The browser does this on its own once every item shares a <code>&lt;details&gt;</code> name. Set it to <code>false</code> to let the reader keep several open.',
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
        iconStart: 'An icon before the title. The <code>#start</code> slot replaces it.',
        defaultOpen:
          'Renders the section already open. It sets the first render only: the browser owns the state afterwards, so changing this later will not close a section the reader has opened.',
        disabled:
          'Makes the section inert. It can no longer be opened, the keyboard steps over it, and it greys out through the colour tokens.',
      },
      slots: {
        default: 'The content revealed when the section is open.',
        title: 'A title made of markup, which replaces the <code>title</code> prop.',
        subtitle: 'A subtitle made of markup, which replaces the <code>subtitle</code> prop.',
        start: 'Free content before the title, which takes the place of <code>iconStart</code>.',
      },
    },
  },
}
