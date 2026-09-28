export default {
  title: 'Iconography',
  lead: 'Vectis UI includes SVG icons from Google’s Material Symbols Rounded collection (weight 400, GRAD 0, optical size 24, Apache 2.0 licence). You can also use your own SVGs, images, Vue components or icon fonts.',
  weight:
    'Built-in icons are separate modules. Your bundle includes the icons imported by your application and its components; importing <code>VButton</code> alone does not include the whole icon set.',
  gridCaption: 'The check_circle and notifications icons are shown in outline and filled forms.',

  importHeading: 'Import an icon',
  importBody:
    'Import icons from <code>vectis-ui/icons</code>. Pass the imported value to <code>VIcon.name</code> or an icon prop such as <code>VButton.iconStart</code>.',
  importWhy:
    'A string such as <code>"close"</code> does not load a built-in SVG. It goes through your resolver, then falls back to an icon-font ligature. Import the icon value to include its SVG path.',

  ownHeading: 'Use your own icons',
  ownBody:
    'Register a resolver with <code>setIconResolver</code> to map icon names to your own graphics. The resolver takes priority over built-in paths. Use one of the helpers below or write a custom function.',
  ownWhere:
    'Configure the resolver at application startup, in <code>main.ts</code> or a universal Nuxt plugin. Use the same configuration for SSR and hydration so the server and browser render matching icons.',
  ownPartial:
    'Return <code>undefined</code> for names you do not handle. <code>VIcon</code> then uses the imported icon’s path, if present, or an icon-font ligature.',
  ownQuote: 'An unresolved name appears as clipped text if no matching icon font is loaded.',

  classHeading: 'CSS classes',
  classBody:
    'Load your icon library’s CSS, then use <code>classIconResolver</code>. Its <code>className</code> function receives the mapped name and the <code>filled</code> state, and returns the classes to apply.',
  classPartial:
    '<code>strict</code> defaults to <code>true</code>: built-in names without an alias return <code>undefined</code>, preserving their SVG fallback when available. Other names are passed to <code>className</code>, even without an alias.',

  ligatureHeading: 'Ligature fonts',
  ligatureBody:
    'Load a ligature font and set <code>--vectis-font-family-icon</code>. <code>ligatureIconResolver</code> renders each name as text for that font, with optional aliases.',
  ligaturePartial:
    'This resolver handles every name and bypasses built-in SVG paths. Names without an alias pass through unchanged, so the font must support them.',

  componentHeading: 'Vue components',
  componentBody:
    'Use <code>componentIconResolver</code> to map names to imported Vue components. Each icon component must have a single <code>&lt;svg&gt;</code> root for sizing. The optional <code>props</code> function supplies component props.',
  componentPartial:
    'Names absent from <code>components</code> return <code>undefined</code>, allowing the imported SVG or ligature fallback.',

  handHeading: 'Custom resolver',
  handBody:
    'A resolver receives the icon name and a context containing <code>filled</code>. Return an <code>IconRender</code> object or <code>undefined</code>. This example resolves the documentation site’s icons:',

  sizingHeading: 'Size',
  sizingBody: 'An icon uses the size set by its container, or <code>1em</code> if none is set.',
  sizingOverrides: [
    'Set <code>size</code> in pixels on <code>VIcon</code> to override the inherited size.',
    'Set <code>--vectis-icon-size</code> on a container to size the icons inside it.',
  ],
  sizingReason:
    'Controls such as buttons set <code>--vectis-icon-size</code> according to their own size.',
  sizingCaption: 'The same icon at 16, 24 and 40 pixels.',

  orderHeading: 'Source priority',
  orderBody: '<code>VIcon</code> uses the first available source in this order:',
  orderRules: [
    '<code>render</code>: an <code>IconRender</code> object describing a path, component, image, text or CSS class.',
    '<code>src</code>: a non-empty image URL.',
    '<code>name</code>: resolved by your resolver, then by the imported icon’s SVG path if present, then as a font ligature.',
    'Default slot: used when no source is provided.',
  ],
  noHeuristic:
    'Strings in icon props such as <code>iconStart</code> are names, including identifiers such as <code>mdi:close</code>. Use an object for other sources: <code>{ src }</code>, <code>{ component }</code>, <code>{ path }</code>, <code>{ text }</code> or <code>{ class }</code>. Pass these objects to <code>VIcon.render</code> when using <code>VIcon</code> directly.',

  listHeading: 'Built-in icons',
  listBody:
    'Import these icons from <code>vectis-ui/icons</code>, or use their names in your resolver’s alias table to replace them.',
  listFilled:
    '<code>filled</code> selects the filled path when one exists. Otherwise, the icon keeps its outline path.',
}
