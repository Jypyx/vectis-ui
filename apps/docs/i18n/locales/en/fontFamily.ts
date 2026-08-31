export default {
  title: 'Font family',
  lead: 'The library ships NO webfont. Three family tokens are all it declares, and each one falls back to a platform stack, so a design system that is never given a typeface still renders correctly everywhere.',

  threeHeading: 'The three families',
  families: [
    '<code>--vectis-font-family-sans</code>: the platform UI stack (<code>system-ui</code>, <code>-apple-system</code>, Segoe UI, Roboto…). Everything is written in it unless something says otherwise.',
    '<code>--vectis-font-family-display</code>: the title face. Its default value is <code>var(--vectis-font-family-sans)</code>, deliberately. An indirection rather than a duplicated stack means that giving the headings a face of their own is ONE override instead of two.',
    "<code>--vectis-font-family-mono</code>: <code>ui-monospace</code>, Cascadia Code, Source Code Pro, Menlo, Consolas. There is no monospace webfont to load, and the stack's fallbacks handle absence.",
  ],
  roles:
    'On top of them sit the three roles a component actually names: <code>--vectis-text-family</code>, <code>--vectis-text-family-heading</code> and <code>--vectis-text-family-code</code>. Component CSS reads the ROLE and never the primitive, which is what lets the override below apply to a subtree rather than to the whole document.',

  wiringHeading: 'Wiring a webfont',
  wiringBody:
    'Two steps, and neither of them belongs to the library: load the face, then point a family token at it. The token is an ordinary custom property, so an unlayered declaration on <code>:root</code> reaches every component at once, and a declaration on one element reaches that subtree alone.',
  wiringSelfHosted:
    'The same thing with the files on your own origin. It is the version to prefer for an offline build, for a site that sends no request to a third party, or simply to control the caching. Only the loading changes: the tokens below it are the ones above, unmodified.',

  splitHeading: 'Which text uses which family',
  splitBody:
    'Giving the library a title face is one declaration, but it does not repaint everything: five type roles read the heading family and the rest of the interface stays in the text one. The list below is what to check before choosing a face, because it says which text will actually be set in it. Nothing has to be wired up for that to hold: a VTypography names its role through <code>variant</code>, and the components that render text of their own, a dialog title or an accordion summary among them, pick their role themselves.',
  splitList: [
    '<strong>Heading family</strong> (<code>--vectis-text-family-heading</code>): <code>display</code> 48px, <code>heading-1</code> 36px, <code>heading-2</code> 24px, <code>heading-3</code> 18px, <code>heading-4</code> 16px.',
    '<strong>Text family</strong> (<code>--vectis-text-family</code>): everything else. <code>subtitle</code>, the four body sizes, <code>label</code>, <code>caption</code>, <code>overline</code>, and the text inside every control.',
    '<strong>Code family</strong> (<code>--vectis-text-family-code</code>): the <code>code</code> role, and nothing besides.',
  ],
  splitWhy:
    'Two things follow from that list. A title face is asked to work down to 16px here, since <code>heading-4</code> is in the group, so a face that only holds above 24px is the wrong choice for this scale. And the boundary can be moved. Redefining <code>--vectis-text-family-heading</code> on an element hands that subtree back to the text face, headings included, and a single role moves on its own by overriding the family it reads, since an unlayered rule wins over the component rule it replaces.',

  iconHeading: 'The one optional font',
  /*
   * Split around the link rather than carried whole: the destination is a Vue component, so the
   * sentence needs a hole in it. Two keys, and the link's own text is the Iconography page's
   * title, which the navigation catalogue already translates.
   */
  iconBefore:
    '<code>--vectis-font-family-icon</code> names Material Symbols Rounded, and the library never loads it. It is needed only to address glyphs by ligature outside the built-in registry. See',
  iconAfter: ', where the alternative is a resolver of your own.',
}
