export default {
  title: 'Iconography',
  lead: 'No icon font is required, and none is bundled. The icons the library renders itself are embedded SVG paths — exact replicas of Material Symbols Rounded (weight 400, GRAD 0, optical size 24, Apache-2.0 © Google).',
  weight:
    'The library draws 34 of them, each one a module of its own, so you pay for the icons your components actually render and for nothing else — a lone VButton ships none at all. Each carries <code>[outline, filled?]</code>: the second path exists only where the FILL axis really changes the geometry, which is the case for 15 of the 34.',
  gridCaption: 'Third and fourth, sixth and seventh: the same name, outline then filled.',

  importHeading: 'Importing an icon',
  importBody:
    'The icons the library draws by itself are values, imported from <code>vectis-ui/icons</code> and passed where a name would go. Every icon prop in the design system accepts one.',
  importWhy:
    "A bare string stays a NAME and is handed to your resolver, then to the icon font — it no longer reaches the library's own drawings. That is deliberate: an icon reaches your bundle because a module imported it, never because a string might one day ask for it. It is also why the components you never import cost you none of theirs.",

  orderHeading: 'The resolution order',
  orderBody:
    'VIcon resolves its source in this order, and the order is the contract: an explicit <code>render</code> → <code>src</code> → <code>name</code> (your resolver first, then the drawing the icon brought along, then the ligature font) → the slot.',
  noHeuristic:
    'A string is ALWAYS a name; an image or a component is declared explicitly as an object (<code>{ src }</code>, <code>{ component }</code>, <code>{ path }</code>, <code>{ text }</code>, <code>{ class }</code>). There is no heuristic, and that is what lets Iconify-style names such as <code>mdi:close</code> reach your resolver intact instead of being mistaken for an address.',

  wiringHeading: 'Wiring your own library',
  wiringBody:
    "The resolver is consulted BEFORE the icon's own drawing, or the design system's own icons would stay Material for a consumer who wired in their own library — an imported icon carries its NAME as well as its paths, which is exactly what keeps it reaching you. Three factories ship for the three families of icon source: <code>ligatureIconResolver</code> for a font whose ligature is the glyph, <code>classIconResolver</code> for one driven by a class and a pseudo-element, and <code>componentIconResolver</code> for a set shipped as components.",
  wiringWhere:
    'Set it at module level — a Nuxt plugin, <code>main.ts</code> — never inside a <code>setup()</code>, and never client-only: a resolver installed after hydration makes the browser draw different icons from the ones the server sent.',

  partialHeading: 'Partial mappings',
  partialBody:
    'A resolver answering <code>undefined</code> means "I do not know this name", not "draw nothing": VIcon then falls back to the drawing the icon carries, and after that to the ligature. That distinction is what makes it worth mapping six names and leaving the rest alone — which is precisely what this site does, since its chrome needs six icons the library has no reason to ship.',
  partialQuote:
    "An unloaded ligature renders its own NAME in plain text, clipped to the icon's box. The layout survives either way — but seeing a word where an icon belongs is the symptom of a name nothing resolved.",

  sizingHeading: 'Sizing and semantics',
  sizingBody:
    'Icons are 1em by default and follow the surrounding text. A parent sets the context through <code>--vectis-icon-size</code> and <code>--vectis-icon-opsz</code> — which is exactly what <code>v-control</code> does for each control size — and a numeric <code>size</code> prop wins over it. Note that the optical-size axis only reaches a LIGATURE: the registry’s paths are drawn at one optical size and cannot follow it.',
  semantics:
    'Icons are decorative by default and carry <code>aria-hidden</code>. Giving one a <code>label</code> makes it informative instead — which is right when the icon is the only thing saying what a control does, and wrong when the text beside it already says so.',
  forcedColors:
    'They are rendered as <code>&lt;svg&gt;&lt;path&gt;</code> and never as a masked background, for one reason: under Windows forced-colors a masked background disappears entirely, while <code>fill: currentcolor</code> survives.',
}
