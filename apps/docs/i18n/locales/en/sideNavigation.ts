export default {
  title: 'Side navigation',
  lead: 'The navigation of a sidebar: a tree of links, shown in place rather than in a floating panel, whose branches open and close. It is written out level by level with its own subcomponents, never described as a list of data.',

  examples: {
    links: {
      title: 'Links and actions',
      text: '<code>href</code> renders a row as a real link; without it the row is a button reporting its activation through <code>select</code>. <code>active</code> marks the row the reader is on and announces it as the current page. A row with subitems ignores <code>href</code>.',
    },
    sublabels: {
      title: 'Sublabels',
      text: '<code>sublabel</code> adds a second line under the label, for a count, a sync status or a size. The <code>#sublabel</code> slot takes the same place when that line needs markup.',
    },
    endContent: {
      title: 'Content at the end of a row',
      text: 'The <code>#end</code> slot places a counter, a badge or a small control after the label and before the chevron. On a branch row it lands inside the native disclosure summary, so keep it to content that is not interactive.',
    },
    groups: {
      title: 'Groups and separators',
      text: 'VSideNavigationGroup names a block of rows and VSideNavigationSeparator draws a rule between two of them. A heading is not a row: nothing happens when it is clicked and the arrow keys never stop on it. A group is not a level of the hierarchy either, so the items inside it are not indented.',
    },
    depth: {
      title: 'Nesting',
      text: 'A row given an <code>#items</code> slot becomes a branch, and a branch may hold branches of its own as deep as the tree goes. Each level is indented by exactly the room a start icon takes.',
    },
    chevrons: {
      title: 'Section chevrons',
      text: '<code>expandIcon</code> is the glyph on a closed branch, turned by 180° when the section opens. Naming <code>collapseIcon</code> as well swaps one drawing for the other instead. Both are set on the navigation as a whole.',
    },
    exclusive: {
      title: 'One section at a time',
      text: '<code>exclusive</code> keeps a single section open at a time within each level. It is off by default.',
    },
    openState: {
      title: 'Knowing whether a section is open',
      text: '<code>defaultOpen</code> decides the state a branch starts in and then hands it over to the browser. <code>v-model:open</code> reports every fold back instead, and opens or closes the branch when written to.',
    },
    disabled: {
      title: 'Disabled rows',
      text: '<code>disabled</code> greys a row out through the colour tokens and takes it off the keyboard path. On a branch, the section no longer unfolds at all.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the row height to 32 or 40 pixels, and <code>compact</code> takes 4px off it. It is set once on the navigation and every level reads it from there.',
    },
  },

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
        label: 'What the row says, and where it goes. The default slot replaces it.',
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
        label:
          'The name of the section, replaced by the <code>#label</code> slot. One of the two is needed: it is what names the sublist under it.',
      },
      slots: {
        default: 'The items belonging to this section.',
        label: 'A name made of markup, replacing the <code>label</code> prop.',
      },
    },
  },
}
