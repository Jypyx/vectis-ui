/**
 * The shape of a component page's API section: what `scripts/build-api.ts` writes and what
 * `components/DocsApi.vue` renders.
 *
 * Names, types and defaults are extracted from the library source and never written here by
 * hand. The DESCRIPTIONS are not: they are prose, they are translated, and they live in the
 * message catalogue beside the rest of the page's words. `scripts/check-api.ts` is what keeps
 * the two halves in step, failing the build when an entry has no description or a description
 * has no entry.
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
   * read as structure. `v-model:open` is keyed `vModelOpen`, `load-more` is keyed `loadMore`,
   * and a name that is already a plain identifier is keyed by itself and carries nothing here.
   * Read it through `keyOf`, never directly.
   */
  key?: string
  /** The type, printed as it is written in the source. */
  type: string
  /**
   * The values the type admits, when it is a closed set of them: `'solid' | 'outline' | 'ghost'`.
   * Printed under the type's name, which the reader still needs in order to import it. Absent
   * whenever the type is a shape rather than a set, in which case `types` below carries it.
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

/**
 * The anchor a type's definition is linked to, `IconSource` → `type-iconsource`.
 *
 * Shared by the cell that links to it and the block that carries the id, so the two can never
 * name it differently. Lowercased rather than kebab-cased: a type name is a single word in the
 * URL, and `type-` is what keeps it out of the way of a page's own heading ids.
 */
export function anchorOf(name: string): string {
  return `type-${name.toLowerCase()}`
}

/**
 * One named type a page's tables mention and cannot answer in a cell.
 *
 * A set of values is expanded in the cell itself (`ApiEntry.values`); a shape is named there and
 * printed here, as the library declares it, comments stripped. The set is closed over the
 * definitions, so a type reaching for another brings it along.
 */
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
  /**
   * The components of the family, the one the page is named after first. A page with more than
   * one puts each component's name in its table's caption; a page with a single component has
   * nothing to disambiguate and shows none.
   */
  components: ComponentApi[]
  /**
   * The named types those tables mention. They belong to the page rather than to a component of
   * it: several components of one family take the same type, and a reader looking one up is
   * looking it up for the page.
   */
  types?: TypeEntry[]
  /**
   * The `--vectis-*` tokens named after this family. They belong to the page rather than to a
   * component of it: a token is a family's measurement, and several components of one family
   * read the same one.
   */
  cssVars?: TokenEntry[]
}
