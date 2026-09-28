/**
 * Names, types and defaults are extracted from the library source and never written here by
 * hand. The DESCRIPTIONS are not: they are prose, they are translated, and they live in the
 * message catalogue beside the rest of the page's words.
 */

/** One row of an API table. */
export interface ApiEntry {
  /**
   * The name as a template writes it: `variant`, `v-model:open`, `load-more`. It is what the
   * table shows, and it is deliberately not what the description is keyed by.
   */
  name: string
  /**
   * The catalogue key the description lives under, when `name` cannot serve as one: vue-i18n
   * resolves a keypath by splitting it, and a name is free to carry punctuation that would be
   * read as structure.
   */
  key?: string
  /** The type, printed as it is written in the source. */
  type: string
  /**
   * The values the type admits, when it is a closed set of them:
   * `'solid' | 'outline' | 'ghost'`.
   */
  values?: string
  /** What the prop is worth when it is not given. Absent means it has no default. */
  default?: string
}

/**
 * The catalogue key a row's description lives under.
 *
 * Shared by the component that renders the table and the script that checks it, so the two can
 * never look a description up under different names.
 */
export function keyOf(entry: ApiEntry): string {
  return entry.key ?? entry.name
}

/** The anchor a type's definition is linked to, `IconSource` → `type-iconsource`. */
export function anchorOf(name: string): string {
  return `type-${name.toLowerCase()}`
}

/** One named type a page's tables mention and cannot answer in a cell. */
export interface TypeEntry {
  /** The type's name, `IconSource`. The anchor a table links to derives from it. */
  name: string
  /** The declaration, printed over as many lines as the source writes it. */
  definition: string
}

/** One `--vectis-*` token a component's page lists, with the value it ships with. */
export interface TokenEntry {
  /** The custom property, `--vectis-control-size-switch-w`. */
  name: string
  /** Its default value, as `tokens.json` carries it. */
  value: string
}

/** The API of ONE component. */
export interface ComponentApi {
  /** The name a template writes, `VTabPanel`. It is also the table's caption on a family page. */
  name: string
  props?: ApiEntry[]
  events?: ApiEntry[]
  slots?: ApiEntry[]
}

/** Everything a component page's API section shows. */
export interface PageApi {
  /** The components of the family, the one the page is named after first. */
  components: ComponentApi[]
  /** The named types those tables mention. */
  types?: TypeEntry[]
  /**
   * The `--vectis-*` tokens named after this family. They belong to the page rather than to a
   * component of it: a token is a family's measurement, and several components of one family
   * read the same one.
   */
  cssVars?: TokenEntry[]
}
