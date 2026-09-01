export default {
  title: 'Iconography',
  lead: "Vectis UI neither uses nor bundles any icon font. Components rely exclusively on inline SVG paths, sourced directly from the Material Symbols Rounded collection (weight 400, GRAD 0, optical size 24px, under Apache 2.0 license © Google).",
  weight:
    "Vectis UI integrates 34 icons distributed across distinct modules to ensure perfect tree-shaking: only the icons actually imported or rendered in your application are included in the final bundle. A component like <code>VButton</code> thus embeds no icons by default.<br>Each icon supports the <code>outline</code> variant and, optionally, the <code>filled</code> version. To optimize code footprint, the <code>filled</code> path is only declared if the <code>FILL</code> property modifies the icon's geometry (which applies to 15 of the 34 icons).",
  gridCaption: "Positions 3 and 4, as well as 6 and 7, illustrate the same symbol successively rendered in its 'outline' and 'filled' variants",

  importHeading: 'Importing an Icon',
  importBody:
    "Icons provided by the library are exported as JavaScript values from <code>vectis-ui/icons</code>. They are passed directly to dedicated icon props: the exact same icon reference can thus be used interchangeably on the <code>VIcon</code> component, a button, an input field, or a menu item.",
  importWhy:
    "Passing a simple string to a prop is equivalent to providing an icon name: the value is then forwarded to your icon resolver or injected as a ligature for an icon font.<br>Both mechanisms (string or imported object) serve different constraints, and this distinction is what guarantees tree-shaking. An SVG path is only included in the final bundle because a module explicitly imported it, not based on a dynamically evaluated string at runtime.",

  ownHeading: "Using Your Own Icon Library",
  ownBody:
    "Using Vectis UI's native icons is entirely optional. By configuring an icon resolver (a function responsible for associating a name with a component or an SVG path), it takes precedence over default icons. All your components thus adopt your own icon set, ensuring perfect visual consistency.<br>The library includes three helpers (factories) adapted to various market formats. You can also define your own custom resolver via a simple callback function.",
  ownWhere:
    "Configure the resolver at the global application scale (in <code>main.ts</code> or via a Nuxt plugin), never within a component's <code>setup()</code> nor in a client-only manner. Registering the resolver after the hydration phase or solely on the browser side causes an hydration mismatch, as client-generated icons will no longer match the initial HTML sent by the server.",
  ownPartial:
    "Regardless of the resolver family, returning <code>undefined</code> indicates the absence of a match for a given name, rather than an instruction to omit rendering. The component then triggers its fallback mechanism: it uses the component's native SVG path, and lastly falls back to the icon font ligature. This makes partial mapping perfectly valid and recommended: you can intercept only the icon names managed by your custom set and delegate the rest to default values.",
  ownQuote:
    "When an icon name cannot be resolved and no icon font is available, the component displays the raw character string, truncated to the dimensions of the icon container. Although the global layout is preserved, the presence of literal text where a visual symbol should be indicates a resolution failure.",

  classHeading: 'A Class-Driven Font',
  classBody:
    "For CSS class-based icon libraries (such as Font Awesome, Phosphor, or Bootstrap Icons), display relies on injecting a glyph via a pseudo-element. The <code>className</code> function generates the required CSS class from the mapped identifier and variant (<code>filled</code> or <code>outline</code>). The design system applies this class to an internal <code>&lt;span&gt;</code> element, which normalizes the sizing and alignment of all icons using a single CSS rule.",
  classPartial:
    "The <code>strict</code> option, enabled by default, secures the use of partial mapping. Without it, a native identifier provided by a component but absent from your dictionary would generate a nonexistent CSS class for the icon font, resulting in a display glitch (empty rectangle). By refraining from resolving unlisted identifiers, strict mode allows the native SVG path to take over. Your custom identifiers remain handled normally as long as they appear in your resolution table.",

  ligatureHeading: 'A Ligature-Based Font',
  ligatureBody:
    "For ligature-based fonts (such as Material Symbols or an IcoMoon font configured for this purpose), the textual icon identifier corresponds directly to the rendered glyph. This resolver accepts all transmitted names: matching occurs directly at the icon font's ligature table level. This mechanism allows substituting your own font for Vectis UI's native SVG paths across the entire design system.",
  ligaturePartial:
    "Since this resolver intercepts all requests, the alias table serves as the sole correspondence layer: a name present in the table is substituted, while an absent name is transmitted unchanged to the icon font. This mechanism bypasses fallback to native SVG paths: any name not managed by the font will result in a missing glyph. Reserve this resolver for projects whose icon font covers all application needs.",

  componentHeading: 'A Component Set',
  componentBody:
    "For libraries distributing their icons as Vue components (such as Lucide or Untitled UI), rendering relies directly on the imported components. An architectural constraint must be respected: each icon component must possess a single <code>&lt;svg&gt;</code> root node, which is essential for sizing and CSS targeting by the design system. The optional <code>props</code> function allows injecting specific properties during rendering (such as <code>stroke-width</code> or a variant).",
  componentPartial:
    "This resolver is strict by design: when an identifier is absent from the correspondence table, no component can be returned. Resolution then falls back to the standard fallback string (native SVG path, then ligature). Mapping only a restricted set of custom icons and delegating the rest to the design system's default values is a common and fully supported use case.",

  handHeading: 'Hand-Written',
  handBody:
    "The three integrated factories do not necessarily cover all use cases. Since a resolver is merely a function associating an icon name with an element to render (component, SVG path, or class), writing your own resolver constitutes a first-class extension model rather than a last-resort solution.<br>As an example, here is the resolver configured for this documentation site via a universal Nuxt plugin. It handles site UI-specific icons and returns undefined for all other identifiers, triggering the fallback to Vectis UI's native SVG paths.",

  sizingHeading: 'Sizing',
  sizingBody:
    "By default, an icon adopts a dimension of <code>1em</code>, automatically inheriting the surrounding text size (font-size). Two mechanisms allow overriding this behavior: ",
  sizingOverrides: [
    "Local override: The <code>size</code> prop (in pixels), applied directly to the icon, takes precedence over any other styling rule.", 
    "Contextual override: The <code>--vectis-icon-size</code> CSS variable, defined on an ancestor element, propagates to all descendant icons that do not specify their own <code>size</code> prop."
  ],
  sizingReason: "It is this second CSS cascade approach that allows control components (via <code>v-control</code>) to automatically adjust child icon sizes according to the parent component's size variant.",
  sizingCaption: 'The same icon at 16, 24, and 40 pixels.',

  orderHeading: 'Resolution Order',
  orderBody:
    "The <code>VIcon</code> component evaluates its display source according to an immutable order of priority. This precedence order forms the component's interface contract:",
  orderRules: [
    "Prop <code>render</code> (explicit render function)", 
    "Prop <code>src</code> (imported icon value or object)", 
    "Prop <code>name</code> (sequentially resolved identifier: custom resolver -> embedded native SVG path -> icon font ligature)", 
    "Default slot (injected SVG or HTML content)"
  ],
  noHeuristic:
    "A character string is systematically treated as an icon name. To declare an image, a component, or a specific style, the value must be passed explicitly as an object (<code>{ src }</code>, <code>{ component }</code>, <code>{ path }</code>, <code>{ text }</code>, or <code>{ class }</code>). The complete absence of heuristics ensures that a namespaced identifier such as mdi:close (Iconify format) reaches your resolver intact without risk of being misinterpretated as a URL or network path.",

  listHeading: 'Existing Icons',
  listBody:
    "Vectis UI embeds a set of 34 native icons. Their identifiers constitute the reference vocabulary for establishing your alias tables. You can directly import the necessary icons from the <code>vectis-ui/icons</code> sub-module for explicit rendering, or map their identifiers within your resolver to substitute default iconography with your own visual system.",
  listFilled:
    "When two glyph variants coexist, the <code>filled</code> property switches display from the outline style to the solid style. For icons consisting of a single path, the outline represents the entire motif: the <code>filled</code> property then has no effect on visual rendering.",
}