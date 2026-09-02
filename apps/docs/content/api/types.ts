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
   * The `--vectis-*` tokens named after this family. They belong to the page rather than to a
   * component of it: a token is a family's measurement, and several components of one family
   * read the same one.
   */
  cssVars?: TokenEntry[]
}
