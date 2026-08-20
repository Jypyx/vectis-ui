export default {
  title: 'Side navigation',
  lead: 'The navigation of a sidebar: a tree of links, shown in place rather than in a floating panel, whose branches open and close. It is written out level by level with its own subcomponents, never described as a list of data.',
  self: "The rail on the left of this page is this component, driven by this site's own page list.",

  treeHeading: 'A tree of links',
  treeBody:
    'A group label is plain text: it cannot be focused or clicked, because a heading that looks clickable and is not is worse than no heading. <code>compact</code> is a DENSITY setting, not a collapsed icon-only rail — this component does not offer one.',

  branchesHeading: 'Branches',
  branchesBody:
    'Giving an item an <code>#items</code> slot turns it into a branch, and nesting is not limited. A branch folds; it does not go anywhere. The folding is a real <code>&lt;details&gt;</code>, so the state, the keyboard and the animation come from the browser, and <code>exclusive</code> makes it one-open-at-a-time PER LEVEL.',

  routerHeading: 'With a router',
  routerBody:
    '<code>active</code> is MANUAL: the component has no router awareness, and adding some would tie it to one. Compare the route yourself and pass the answer in. It does light up a COLLAPSED ancestor by itself, in CSS, from the <code>[aria-current]</code> it finds inside.',

  invariantsHeading: 'Invariants',
  invariants: [
    'The label is the DEFAULT SLOT and is required — there is no <code>label</code> prop, so a row can hold a badge or an abbreviation alongside its words.',
    "An entry never carries both <code>#items</code> and <code>href</code>. Given both it silently becomes a <code>&lt;button&gt;</code>, on which a router's click interception bails.",
    "The <code>#end</code> slot of a BRANCH must not be focusable: a branch row is a <code>&lt;summary&gt;</code>, and a control inside a control is WCAG 4.1.2 and axe's <code>nested-interactive</code>. On a leaf it is free — the link is stretched over the row by a pseudo-element, so the end slot stays its sibling rather than its child.",
    'Depth is counted entirely in CSS, through two ALTERNATING custom-property names. TRAP — the obvious one-name form is a cycle as far as CSS is concerned, and the whole tree renders flat with nothing in the console to say why.',
  ],

  apiHeading: 'API',
  apiNavLabel:
    '<code>string</code> — what screen readers announce for the <code>&lt;nav&gt;</code>',
  apiNavLabelDefault: 'dictionary',
  apiExclusive: '<code>boolean</code> — one branch open per level',
  apiIcons: '<code>IconSource</code> — give both and they swap instead of rotating',
  apiActive: '<code>boolean</code> — <code>aria-current</code>',
  apiHref: '<code>string</code> — ignored on a branch',
  apiOpen: '<code>boolean | null</code> — <code>null</code> leaves the state to the browser',
  apiSlots:
    'Slots: <code>#default</code> (the label, required), <code>#items</code> (the branch), <code>#sublabel</code>, <code>#start</code>, <code>#end</code>. A leaf emits <code>select</code> on click and on keyboard activation; there is deliberately no <code>click</code> emit, so your own <code>@click</code> still reaches the link.',
  apiQuote:
    "The markup is real <code>&lt;ul&gt;</code> and <code>&lt;li&gt;</code>, unlike VMenu's. That is not a style difference: the ARIA menu pattern forbids lists, while for navigation the counting and the nesting ARE the information.",
}
