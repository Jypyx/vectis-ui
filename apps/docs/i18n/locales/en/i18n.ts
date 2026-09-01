export default {
  title: 'Localization (i18n)',
  lead: 'No user-facing strings are hardcoded within the components: all character strings are resolved dynamically via a translation dictionary. The library is configured in English (<code>en</code>) by default and natively provides the French locale (<code>fr</code>). Additional languages can be added directly at the consuming application level.',
  split:
    'Localization relies on a strict decoupling between vocabulary and formatting. Text labels come from translation dictionaries, while data formatting (dates, numbers, first day of the week, and 12/24h cycles) relies directly on the native <code>Intl</code> API using the language tag. Thus, declaring a locale without an associated dictionary immediately applies the appropriate regional conventions for data while keeping interface labels in English. This behavior constitutes a perfectly managed graceful degradation strategy.',

  frenchHeading: 'Changing Language',
  frenchBody:
    'Activating a locale relies on two distinct steps: registering the translation dictionary, and choosing the active locale. Although provided by the library, the French dictionary (<code>fr</code>) is optional: omitting it from your imports is enough to exclude it from the final bundle (tree-shaking). Beyond bundle size optimization (under 1 kB gzipped), this model unifies integration: activating the built-in French locale or adding a custom language is done via a rigorously identical mechanism, with no status distinction between native and third-party dictionaries.',
  frenchWhere:
    "Dictionary registration and initial locale selection take place at the module level (in <code>main.ts</code> or a Nuxt plugin), outside of component <code>setup()</code> hooks. Subsequently, setLocale can be invoked dynamically from any point in the application. Since the translation table relies on Vue's reactive state, updating it triggers an immediate re-render of all mounted components, without requiring navigation or page reloads.",
  processBody:
    'Because the i18n state is maintained at the module level, the locale is global for a given execution process. This architectural choice implies an explicit constraint: a single Node.js process maintains only one active locale at a time. Dynamic and concurrent server-side rendering (SSR) per request is therefore not natively supported; in this scenario, labels must be explicitly passed via component props.<br>On the other hand, this limitation has no impact on static pre-rendering (SSG), as routes are generated sequentially: the locale is set just before compiling each page, ensuring compliant generation of the interface in the targeted language.',

  addHeading: 'Adding a Language',
  addBody:
    'A custom dictionary is a simple JavaScript object. Declaring partial dictionaries is fully valid: any missing key automatically falls back to the English dictionary instead of displaying a raw technical key. Register the object under its language sub-tag, then set the active locale.',
  addTyping:
    'By typing the object with <code>VectisMessagesInput</code>, the editor provides full autocompletion for namespaces, keys, and parameterized message arguments. Text entries are formulated as typed TypeScript functions, without dependency on an ICU engine or complex pluralization: plural management is handled via simple ternary expressions within the functions. Dictionary merging is non-recursive by design, with the tree structure strictly limited to two levels to preserve the integrity of message functions.',
  precedenceBody:
    "Text resolution relies on the language <strong>sub-tag</strong> (e.g., <code>en-GB</code> and <code>en-US</code> share the <code>en</code> dictionary and differ only in their <code>Intl</code> formats). At the top of the hierarchy, explicit props remain paramount: the resolution chain for a component's accessible name follows this precedence order: <code>aria-labelledby</code> -> <code>aria-label</code> -> <code>label</code> prop -> active dictionary -> fallback English dictionary. The interface guarantees the absence of empty strings, raw keys on screen, or silent failures in development mode.",

  demoHeading: 'Languages and Formats',
  demoBody:
    'The translation dictionary and formatting locale constitute two strictly independent settings. While <code>registerMessages</code> and <code>setLocale</code> determine the lexical layer (translated strings), the locale code (along with the <code>locale</code> prop available on relevant components) drives regional conventions derived from the <code>Intl</code> API (date ordering and separators, first day of the week, 12/24h format). This isolation allows freely combining a linguistic dictionary with a distinct regional code: an application can, for example, display its labels in French while applying English Canadian formats (<code>en-CA</code>), or keep an English interface formatted for Germany (<code>de-DE</code>).',
  demoLanguage: 'Language',
  demoFormats: 'Formats',

  keysHeading: 'Translation Key Nomenclature and Reference',
  keysBody:
    'The complete Vectis UI dictionary spans 134 keys distributed across 22 namespaces, presented below with their French values for reference. Since registration supports partial injection, you only need to declare the namespaces and keys you explicitly wish to translate.',
  keysFunctions:
    'Among these keys, 23 are parameterized TypeScript functions. Their signature exposes the expected arguments and their placement within the generated string. In the absence of an ICU engine or dedicated plural parser, grammatical forms (including pluralization) rely directly on native conditional logic (JS/TS ternary expressions), offering the flexibility needed for complex languages.',
  keysColumnKey: 'Key',
  keysColumnDefault: 'English Value',
}
