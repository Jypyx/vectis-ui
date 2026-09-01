export default {
  title: 'Font Family',
  lead: "Vectis UI does not bundle any external web fonts. Its typographical configuration relies exclusively on three family tokens, each associated by default with a platform system font stack. The interface thus benefits from a native, fast, and consistent rendering across all environments, without requiring any preliminary typographical setup.",

  threeHeading: "The 3 Default Fonts",
  families: [
    "<code>--vectis-font-family-sans</code>: System font stack for the user interface (system-ui, -apple-system, Segoe UI, Roboto, etc.). Serves as the default typographical family for all components.",
    "<code>--vectis-font-family-display</code>: Family reserved for titles. Its value defaults to var(<code>--vectis-font-family-sans</code>). This indirection avoids variable duplication: a single override is enough to dissociate headings from the rest of the interface.",
    "<code>--vectis-font-family-mono</code>: Native monospace stack (ui-monospace, Cascadia Code, Source Code Pro, Menlo, Consolas, etc.). Ensures support for code and tabular data by leveraging local platform resources.",
  ],
  roles:
    "A second abstraction layer introduces three semantic tokens (or roles) directly consumed by the interface: <code>--vectis-text-family</code>, <code>--vectis-text-family-heading</code>, and <code>--vectis-text-family-code</code>. By binding component CSS to these roles rather than typographical primitives, Vectis UI enables scoping overrides to a specific DOM subtree without affecting the global configuration of the document.",

  wiringHeading: "Integrating a Web Font",
  wiringBody:
    "Integrating a custom font takes place in two steps, both independent of the design system: loading the typographical resource, and then associating its name with the corresponding family token. Since tokens are simple CSS variables (custom properties), a declaration at the <code>:root</code> selector level propagates the modification across the entire interface, while a declaration targeted at a specific container restricts the new font to its DOM subtree.",
  wiringSelfHosted:
    "Local hosting of font files (declared via <code>@font-face</code> and served from your own origin) is the recommended approach for offline builds, applications guaranteeing zero third-party requests, or direct control over HTTP caching. Only the resource loading method differs: connection to Vectis UI's design tokens remains strictly identical.",

  splitHeading: 'Typographical Role Mapping',
  splitBody:
    "Assigning a display font is done through a single CSS re-declaration. However, this modification remains targeted: only five typographical roles consume the display family, while the rest of the interface retains the main text font. The nomenclature below details the affected elements to guide you in choosing a suitable typography.<br>This behavior requires no wiring: the <code>VTypography</code> component determines its role via the <code>variant</code> property, while composite components (dialog titles or accordion headers) automatically apply their respective semantic role.",
  splitList: [
    "Display family (<code>--vectis-text-family-heading</code>): Consumed exclusively by the 5 heading variants: <code>display</code> (48px), <code>heading-1</code> (36px), <code>heading-2</code> (24px), <code>heading-3</code> (18px), and <code>heading-4</code> (16px).",
    "Body text family (<code>--vectis-text-family</code>): Applied by default to all other variants (<code>subtitle</code>, the 4 levels of body text, <code>label</code>, <code>caption</code>, <code>overline</code>) as well as the internal typography of all control components (<code>v-control</code>).",
    'Code family (<code>--vectis-text-family-code</code>): Strictly restricted to the <code>code</code> role.',
  ],

  iconHeading: "Icon Font Management (Optional Dependency)",
  iconBefore:
    "The --vectis-font-family-icon token defaults to referencing the Material Symbols Rounded font. True to the principle of zero network dependencies, the library does not perform any automatic loading of this file. This resource is solely required for rendering icons via ligatures outside of the native registry. To free the application from this dependency, refer to the section ",
  iconAfter: ' to implement a custom resolver.',
}