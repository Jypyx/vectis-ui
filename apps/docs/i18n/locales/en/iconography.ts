export default {
  title: 'Iconography',
  lead: 'No icon font is required, and none is bundled. The icons the library renders itself are embedded SVG paths, exact replicas of Material Symbols Rounded (weight 400, GRAD 0, optical size 24, Apache-2.0 © Google).',
  weight:
    'The library draws 34 of them, each one a module of its own, so you pay for the icons your components actually render and for nothing else. A lone VButton ships none at all. Each carries <code>[outline, filled?]</code>: the second path exists only where the FILL axis really changes the geometry, which is the case for 15 of the 34.',
  gridCaption: 'Third and fourth, sixth and seventh: the same name, outline then filled.',

  importHeading: 'Importing an icon',
  importBody:
    'The icons the library draws itself are values, imported from <code>vectis-ui/icons</code> and passed wherever a name would go. Every icon prop in the design system accepts one, so the same value works on <code>VIcon</code>, on a button, on a field or on a menu item.',
  importWhy:
    'A plain string is a NAME instead: it is offered to your resolver, and then to an icon font as a ligature. The two forms are not interchangeable, and the difference is what makes the set tree-shakable. A drawing reaches your bundle because a module imported it, never because a string might ask for it once the page is running.',

  ownHeading: 'Using your own icons library',
  ownBody:
    'Nothing obliges you to use the icons the library draws. Install a <strong>resolver</strong>, one function turning a name into something to draw, and it is consulted before those drawings, so every icon in every component comes from your own set rather than leaving two styles side by side. Three factories ship, one per family an icon library can belong to, and a resolver written by hand is always an option: it is only a function.',
  ownWhere:
    'Install it at module level, from a Nuxt plugin or from <code>main.ts</code>, never inside a <code>setup()</code>, and never client-only: a resolver installed after hydration makes the browser draw different icons from the ones the server sent.',
  ownPartial:
    'Whichever family you are on, a resolver answering <code>undefined</code> means “I do not know this name”, not “draw nothing”: the icon then falls back to the drawing it carries, and after that to the ligature font. That is what makes a <strong>partial mapping</strong> legal, and it is the normal way to use these. Map the names your set has, leave the rest alone.',
  ownQuote:
    'A name nothing resolves, with no icon font loaded, renders as the name itself in plain text, clipped to the icon’s box. The layout survives either way, but a word where an icon belongs is the symptom to recognise.',

  classHeading: 'A class-based font',
  classBody:
    'Font Awesome, Phosphor, Bootstrap Icons and their kind: a class names the icon and a pseudo-element draws it. <code>className</code> builds that class from the mapped name and the filled state, and the design system renders it on a <code>&lt;span&gt;</code> of its own so the element can be normalised in one rule.',
  classPartial:
    '<code>strict</code>, which is on by default, is the partial mapping made safe: a name the design system ships but your table does not translate would otherwise become a class your font never defines, and the icon would render as an empty square. Refusing to answer instead lets the built-in drawing take over. Names of your own always pass, since they are already written in your vocabulary.',

  ligatureHeading: 'A ligature font',
  ligatureBody:
    'Material Symbols in any of its variants, or an IcoMoon build made that way: the name IS the glyph. This resolver answers for every name, since the font itself decides what it recognises, which also makes it the way to have the design system’s own icons drawn by your font rather than by the SVGs shipped with it.',
  ligaturePartial:
    'Because it answers to everything, the aliases are the whole of the mapping: a name in the table is translated, a name left out is passed to the font as it stands. There is no fallback to the built-in drawings here, since anything the font does not recognise is a missing glyph. Use it when your font covers the ground.',

  componentHeading: 'A component set',
  componentBody:
    'Lucide, Untitled UI and their kind, shipped as Vue components. One contract to honour: each component must have a single <code>&lt;svg&gt;</code> as its root, because that is the element the stylesheet sizes. The optional <code>props</code> function is handed to every component, which is where a stroke width or a variant goes.',
  componentPartial:
    'It is strict by construction: a name absent from the table has no component to return, so it falls back to the built-in drawing and then to the ligature. Mapping the eight icons you have drawn and letting the library answer for the rest is a perfectly ordinary configuration.',

  sizingHeading: 'Sizing',
  sizingBody:
    'An icon is <code>1em</code> by default, so it follows the text around it with nothing to set. Two things override that. The <code>size</code> prop, in pixels, applies to one icon and wins over everything else; <code>--vectis-icon-size</code>, set on any ancestor, applies to every icon below it that does not name its own. That second form is how each control size gives the icons inside it theirs, through <code>v-control</code>.',
  sizingCaption: 'The same icon at 16, 24 and 40 pixels.',

  orderHeading: 'Resolution order',
  orderBody:
    'VIcon resolves its source in this order, and the order is the contract: an explicit <code>render</code> › <code>src</code> › <code>name</code> (your resolver first, then the drawing the icon brought along, then the ligature font) › the slot.',
  noHeuristic:
    'A string is ALWAYS a name; an image or a component is declared explicitly as an object (<code>{ src }</code>, <code>{ component }</code>, <code>{ path }</code>, <code>{ text }</code>, <code>{ class }</code>). There is no heuristic, and that is what lets Iconify-style names such as <code>mdi:close</code> reach your resolver intact instead of being mistaken for an address.',

  listHeading: 'Existing icons',
  listBody:
    'The 34 icons the library draws, each with the name it answers to, which is the vocabulary an alias table is written against. Import the one you need from <code>vectis-ui/icons</code> to render it yourself, or map its name in your resolver to have your own set draw it.',
  listFilled:
    'Where two glyphs are shown, filling really changes the drawing and the icon honours <code>filled</code>. Where one is shown, the outline is the whole icon and the prop has nothing to change.',
}
