export default {
  title: 'Font family',
  lead: 'The library ships NO webfont. Three family tokens are all it declares, and each one falls back to a platform stack — so a design system that is never given a typeface still renders correctly everywhere.',

  threeHeading: 'The three families',
  families: [
    '<code>--vectis-font-family-sans</code> — the platform UI stack (<code>system-ui</code>, <code>-apple-system</code>, Segoe UI, Roboto…). Everything is written in it unless something says otherwise.',
    '<code>--vectis-font-family-display</code> — the title face. Its default value is <code>var(--vectis-font-family-sans)</code>, deliberately: an indirection rather than a duplicated stack, so giving the headings a face of their own is ONE override instead of two.',
    "<code>--vectis-font-family-mono</code> — <code>ui-monospace</code>, Cascadia Code, Source Code Pro, Menlo, Consolas. There is no monospace webfont to load, and the stack's fallbacks handle absence.",
  ],
  roles:
    'On top of them sit the three roles a component actually names: <code>--vectis-text-family</code>, <code>--vectis-text-family-heading</code> and <code>--vectis-text-family-code</code>. Component CSS reads the ROLE, never the primitive — which is what makes the override below apply to a subtree rather than to the whole document.',

  wiringHeading: 'Wiring a webfont',
  wiringBody:
    "This site is the worked example. Its titles are Josefin Sans and its text is Geist, and neither comes from the library: both are loaded and pointed at from an unlayered stylesheet of the site's own, which is the whole of it.",
  demoText:
    'Geist carries every role from subtitle downwards, at 14px for application chrome and 16px for long-form prose.',
  wiringCdn:
    'Loading by <code>@import</code> from a CDN is the shortest version, not the best one: an offline or privacy-tight build wants the woff2 files served from its own origin and local <code>@font-face</code> rules instead. Nothing above changes — only where the bytes come from.',

  splitHeading: 'Where the split falls',
  splitBody:
    'Five roles take the heading family, and they are exactly the five that are titles: <code>display</code> (48px) and <code>heading-1</code> (36px) through <code>heading-4</code> (16px). <code>subtitle</code> and everything below stay in the text face.',
  splitList: [
    '<strong>Heading family:</strong> display, heading-1, heading-2, heading-3, heading-4.',
    '<strong>Text family:</strong> subtitle, body-lg, body-md, body-sm, label, caption, overline.',
    '<strong>Code family:</strong> code, and nothing else.',
  ],
  splitWhy:
    'A geometric display face with a low x-height — Josefin Sans is one — reads well at 48px and goes fuzzy at 16px. That is a property of the FACE, not of the roles, which is why the library does not pick a side: it gives you the split and lets you decide how far down it should reach.',

  overrideHeading: 'Overriding a family',
  overrideBody:
    'If <code>heading-3</code> (18px) or <code>heading-4</code> (16px) read weak in your title face, override the heading family on that subtree rather than editing the roles: the roles are what keep two pieces of text in the same role from drifting apart.',
  overrideWeights:
    'Prefer 500–600 weight over 400 for a title face, and keep the <code>-0.015em</code> tracking the top roles already carry — it is on <code>display</code>, <code>heading-1</code> and <code>heading-2</code> only, and nowhere else.',

  iconHeading: 'The one optional font',
  /*
   * Split around the link rather than carried whole: the destination is a Vue component, so the
   * sentence needs a hole in it. Two keys, and the link's own text is the Iconography page's
   * title, which the navigation catalogue already translates.
   */
  iconBefore:
    '<code>--vectis-font-family-icon</code> names Material Symbols Rounded, and the library never loads it. It is needed only to address glyphs by ligature outside the built-in registry — see',
  iconAfter: ', where the alternative is a resolver of your own.',
}
