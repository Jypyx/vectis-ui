export default {
  title: 'Empty state',
  lead: '<code>VEmptyState</code> says that there is nothing to show yet, and offers what to do about it.',
  examples: {
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> scales the badge, the spacing and the title: <code>sm</code> for a panel or a list, <code>lg</code> for a whole page.',
    },
    content: {
      title: 'Content and heading level',
      text: 'The default slot replaces <code>description</code> with text that holds links. <code>headingLevel</code> renders the title as a heading without changing how it looks.',
    },
    components: {
      title: 'In tables and comboboxes',
      text: '<code>VDataTable</code> and <code>VCombobox</code> show a small empty state titled with their <code>emptyText</code>. Their <code>empty</code> slot replaces it, for instance with an empty state that has actions.',
    },
  },
  api: {
    VEmptyState: {
      props: {
        title: 'What is empty, in a few words.',
        description: 'Why, or what to do next. Replaced by the default slot.',
        icon: 'Icon drawn in a round badge. Replaced by the <code>media</code> slot.',
        size: 'Scale of the block.',
        headingLevel:
          'Renders the title as <code>h1</code> to <code>h6</code>. Without it, the title is a paragraph.',
      },
      slots: {
        default: 'Description with formatting or links.',
        media: 'Illustration replacing the icon badge.',
        actions: 'Buttons or links that leave the empty state.',
      },
    },
  },
}
