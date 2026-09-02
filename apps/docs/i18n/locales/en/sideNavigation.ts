export default {
  title: 'Side navigation',
  lead: 'The navigation of a sidebar: a tree of links, shown in place rather than in a floating panel, whose branches open and close. It is written out level by level with its own subcomponents, never described as a list of data.',

  api: {
    VSideNavigation: {
      props: {
        label:
          'What screen readers announce for this navigation. A page often has several, a main one, a sidebar, a footer, and this is what tells them apart. It falls back to the design system dictionary.',
        size: 'The height of the rows, 32 or 40 pixels, inherited by every level.',
        compact:
          'Takes 4px off the height of every row. It is a density setting and not a collapsed icon-only rail, which this component does not offer.',
        exclusive:
          'Keeps a single section open at a time within each level, which the browser does on its own. It is off by default: a sidebar normally lets several sections stay open.',
        expandIcon: 'The chevron of a closed section.',
        collapseIcon:
          'The chevron of an open section. Leave it out and the closed one is rotated by 180°.',
      },
      slots: {
        default: 'The first level of the tree: items, groups and separators.',
      },
    },
    VSideNavigationItem: {
      props: {
        sublabel: 'A second line under the label, for a status or a short explanation.',
        icon: 'An icon before the label. The <code>#start</code> slot replaces it.',
        href: 'Where this row leads, which makes it a link. It is ignored on a row that has subitems: such a row opens and closes rather than navigating.',
        active:
          'Marks this row as the page currently being viewed. It is highlighted, and announced as the current page.',
        disabled:
          'Makes the row unusable: it greys out through the colour tokens and leaves the keyboard path.',
        defaultOpen:
          'Renders a branch already open. It sets the initial state only; the browser owns it from then on.',
        vModelOpen:
          'Whether the branch is open, when you want to drive or observe it. Left unbound, the browser keeps that state to itself and <code>defaultOpen</code> gives only the initial value.',
      },
      events: {
        select: 'The row was activated. A branch reports this as well as a link.',
      },
      slots: {
        default: 'The label of the row. It is required: a navigation row must say where it goes.',
        sublabel: 'A second line made of markup, replacing the <code>sublabel</code> prop.',
        start: 'Free content before the label, which takes the place of <code>icon</code>.',
        end: 'Free content at the end of the row, before the chevron: a counter, a badge. On a branch it must not be focusable, since the row is already a control.',
        items: 'The subitems, which turn this row into a branch. Nesting is not limited.',
      },
    },
    VSideNavigationGroup: {
      props: {
        label: 'The name of the section. The <code>#label</code> slot replaces it.',
      },
      slots: {
        default: 'The items belonging to this section.',
        label: 'A name made of markup, replacing the <code>label</code> prop.',
      },
    },
  },
}
