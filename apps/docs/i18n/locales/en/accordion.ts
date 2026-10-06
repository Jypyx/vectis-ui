export default {
  title: 'Accordion',
  lead: '<code>VAccordion</code> groups collapsible sections built with native <code>&lt;details&gt;</code> elements.',
  examples: {
    variants: {
      title: 'Variants',
      text: '<code>flat</code> leaves the group unframed. <code>outline</code> adds a border, <code>elevated</code> a raised surface with a shadow and <code>filled</code> a muted surface.',
    },
    exclusive: {
      title: 'One section at a time',
      text: 'One section stays open by default. Enable <code>multiple</code> to keep several open.',
    },
    subtitles: {
      title: 'Subtitles and icons',
      text: 'Add <code>icon</code> and <code>subtitle</code>, or use their slots for custom content.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> reduces padding without changing text or icons.',
    },
    icons: {
      title: 'Expand and collapse icons',
      text: 'Without <code>collapseIcon</code>, the expand icon rotates when open. With it, the icons switch.',
    },
    disabled: {
      title: 'Disabled sections',
      text: 'Disabled sections cannot be toggled and are skipped by keyboard navigation.',
    },
  },
  api: {
    VAccordion: {
      props: {
        multiple: 'Allows several sections to remain open.',
        variant: 'Unframed group, or framed by a border, a shadow or a muted fill.',
        expandIcon:
          'Closed-section icon. Rotates when open unless <code>collapseIcon</code> is set.',
        collapseIcon: 'Open-section icon replacing the rotated expand icon.',
        compact: 'Reduces item padding.',
      },
      slots: {
        default: '<code>VAccordionItem</code> children.',
      },
    },
    VAccordionItem: {
      props: {
        title: 'Section heading. Replaced by the <code>title</code> slot.',
        subtitle: 'Second line below the title. Replaced by its slot.',
        icon: 'Icon before the title. Replaced by its slot.',
        defaultOpen: 'Initial open state. Later changes do not control the section.',
        vModelOpen: 'Open state to observe or control.',
        disabled: 'Disables interaction.',
      },
      slots: {
        default: 'Expanded content.',
        title: 'Content replacing the title.',
        subtitle: 'Content replacing the subtitle.',
        icon: 'Content replacing the icon.',
      },
    },
  },
}
