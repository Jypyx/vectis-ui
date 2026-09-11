export default {
  title: 'Side navigation',
  lead: 'The navigation of a sidebar: a tree of links, shown in place rather than in a floating panel, whose branches open and close. It is written out level by level with its own subcomponents, never described as a list of data.',

  examples: {
    links: {
      title: 'Links and actions',
      text: 'A row either leads somewhere or does something, and <code>href</code> is what settles which. With it, the row renders as a real link: it can be middle-clicked, its address copied, and a crawler follows it. Without it the row is a button instead, reporting its activation through <code>select</code>, which is the shape for what switches a view rather than for what has an address of its own. <code>active</code> marks the one row the reader is currently on, and it is not decoration: the row is announced as the current page, so a screen reader says what the highlight shows. A row with subitems ignores <code>href</code> altogether, since such a row opens and closes rather than going anywhere.',
    },
    sublabels: {
      title: 'Sublabels',
      text: 'A second line under the label, for what the row does not already say: a count, a sync status, a size. The row grows to hold both lines and the icon stays centred on the pair rather than on the first of them. The <code>#sublabel</code> slot takes the same place when that second line needs markup.',
    },
    endContent: {
      title: 'Content at the end of a row',
      text: 'A counter, a badge, a small control, placed after the label and before the chevron. What may go there depends on the shape of the row, and the difference is worth knowing. On a leaf, the link covers the whole row through an overlay and the end slot stays a sibling of it, so a real control belongs there and clicking it does not follow the link. On a branch, the row is a native disclosure summary, which has to contain the entire line: anything put there is inside the control the row already is. A counter or a badge, then, never a button. A control nested inside a control fails WCAG 4.1.2, and a summary also serves as its own accessible name, which some screen readers flatten into a single string.',
    },
    groups: {
      title: 'Groups and separators',
      text: 'VSideNavigationGroup names a block of rows, VSideNavigationSeparator draws a rule between two of them, and the two are not the same claim. The group names the sublist under it, so a screen reader reads the section and its items as one thing; the separator is purely visual and is announced as nothing. A section heading is not a row: nothing happens when it is clicked and the arrow keys never stop on it. It takes the height of a row all the same, which is what keeps the rhythm of the list where it interrupts it. A group is not a level of the hierarchy either, so the items inside it are indented as if it were not there.',
    },
    depth: {
      title: 'Nesting',
      text: 'A row given an <code>#items</code> slot becomes a branch, and a branch may hold branches of its own as deep as the tree goes. Each level is indented by exactly the room a start icon takes, so a subitem label falls on the same vertical as the label of the branch holding it, at either size. The indent is computed in CSS from the nesting itself, which is why nothing has to be declared level by level.',
    },
    chevrons: {
      title: 'Section chevrons',
      text: 'The glyph at the end of a branch row, which says whether the section is open. <code>expandIcon</code> gives the closed one, and on its own it is turned by 180° when the section opens: the right shape for a glyph that reads both ways up, a triangle or a downward chevron. Naming <code>collapseIcon</code> as well swaps one drawing for the other instead, which is what a file tree wants, a chevron pointing along the reading direction when the branch is closed and down when it is open. Both are set on the navigation as a whole, and every level follows.',
    },
    exclusive: {
      title: 'One section at a time',
      text: 'Opening one section closes the one beside it. The browser does this by itself, through a name the sections of a level share, so there is no state to keep and nothing to reset. The exclusivity is local to each level: two sections nested under different parents know nothing of each other, and opening a subsection leaves the sections beside its parent untouched. It is off by default, a sidebar normally letting several sections stay open at once.',
    },
    openState: {
      title: 'Knowing whether a section is open',
      text: '<code>defaultOpen</code> decides the state a branch starts in and then hands it over: the browser owns it from that point and nothing is watching. <code>v-model:open</code> is the other arrangement, where every fold is reported back to the model and writing to the model opens or closes the branch. Bind it when that state is yours to know, to open the section holding the current page after a route change, or to remember what was open between visits. Leaving it unbound is the lighter of the two and the right default.',
    },
    disabled: {
      title: 'Disabled rows',
      text: 'A row that cannot be used. It greys out through the colour tokens rather than through an opacity, so it keeps its contrast against the sidebar, and it leaves the keyboard path: the arrow keys step over it as though it were not there. On a leaf, the link stops leading anywhere. On a branch it goes further, the section no longer unfolding at all, so what it holds is out of reach for as long as the row is disabled.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Two row heights, 32 and 40 pixels, each with its <code>compact</code> pair 4px shorter. The size is set once on the navigation as a whole and every level reads it from there, however deep: a sublist never restates it, so a nested branch cannot drift out of step with its parent. Section headings take the height of a row at every density, which is what keeps the vertical rhythm. <code>compact</code> is a density setting and not a rail folded down to its icons, which this component does not offer.',
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
