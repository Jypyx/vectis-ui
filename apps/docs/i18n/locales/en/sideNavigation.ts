export default {
  title: 'Side navigation',
  lead: '<code>VSideNavigation</code> displays a tree of links and collapsible branches in a sidebar. Compose it with items, groups and separators.',
  examples: {
    links: {
      title: 'Links and actions',
      text: 'Items with <code>href</code> are links; others are buttons. <code>current</code> marks the current page. Branches ignore <code>href</code>.',
    },
    sublabels: {
      title: 'Sublabels',
      text: 'Add a second line with <code>sublabel</code> or its slot.',
    },
    endContent: {
      title: 'Content at the end of a row',
      text: 'Use <code>end</code> for a badge or count before the chevron. Keep branch content non-interactive.',
    },
    groups: {
      title: 'Groups and separators',
      text: '<code>VSideNavigationGroup</code> labels a set of items without adding a nesting level. Separate sets with <code>VSideNavigationSeparator</code>.',
    },
    depth: {
      title: 'Nesting',
      text: 'The <code>children</code> slot turns an item into a branch. Branches can contain further branches.',
    },
    chevrons: {
      title: 'Section chevrons',
      text: 'Set <code>expandIcon</code> on the navigation. It rotates on opening unless <code>collapseIcon</code> replaces it.',
    },
    exclusive: {
      title: 'One section at a time',
      text: '<code>exclusive</code> keeps one branch open per level. Several may remain open by default.',
    },
    openState: {
      title: 'Knowing whether a section is open',
      text: '<code>defaultOpen</code> sets the initial state. Use <code>v-model:open</code> to observe or control later changes.',
    },
    disabled: {
      title: 'Disabled rows',
      text: 'Disabled items leave the keyboard path; disabled branches cannot be toggled.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Set <code>size</code> and <code>compact</code> once on the navigation for all levels.',
    },
  },
  api: {
    VSideNavigation: {
      props: {
        label: 'Accessible navigation name. Defaults to the dictionary.',
        size: 'Row size inherited by all levels.',
        compact: 'Reduces row height.',
        exclusive: 'Keeps one branch open per level.',
        expandIcon: 'Closed-branch icon.',
        collapseIcon: 'Open-branch icon. Without it, the expand icon rotates.',
      },
      slots: {
        default: 'Items, groups and separators at the first level.',
      },
    },
    VSideNavigationItem: {
      props: {
        label: 'Visible row label, replaced by the default slot.',
        sublabel: 'Second line below the label.',
        icon: 'Icon before the label. Replaced by its slot.',
        href: 'Link destination. Ignored when the item has children.',
        current: 'Highlights and announces the current page.',
        disabled: 'Disables interaction.',
        defaultOpen: 'Initial branch state. Later changes do not control it.',
        vModelOpen: 'Branch open state to observe or control.',
      },
      events: {
        select: 'The item was activated, including links and branches.',
      },
      slots: {
        default: 'Row label. Provide a label through this slot or the prop.',
        sublabel: 'Content replacing the second line.',
        icon: 'Content replacing the icon.',
        end: 'Content before the chevron. Must be non-interactive on branches.',
        children: 'Nested items turning this row into a branch.',
      },
    },
    VSideNavigationGroup: {
      props: {
        label: 'Section name. Provide this prop or its slot.',
      },
      slots: {
        default: 'Section items.',
        label: 'Content replacing the section name.',
      },
    },
  },
}
