import MiniSearch, { type Options, type SearchOptions } from 'minisearch'
import localSearchIndex from '@localSearchIndex'
import { shallowRef, type ShallowRef } from 'vue'

/** One indexed section: a heading, its ancestor headings, and the text beneath it. */
export interface SearchHit {
  /** Already a href — the plugin builds it with `base` and `cleanUrls` applied. */
  id: string
  title: string
  titles: string[]
  /** Present because `config.ts` widens the plugin's `storeFields`; see `excerpt()`. */
  text?: string
}

/*
 * These MUST mirror `localSearchPlugin`'s own constructor options, which are
 * `fields: ['title','titles','text']` and `storeFields: ['title','titles']` widened by
 * ours in `config.ts` (vitepress@1.6.4, dist/node/chunk-D3CUZ4fa.js). `loadJSON` rebuilds
 * a live index from a serialised one, and a mismatch here does not throw — it silently
 * rehydrates an index whose term dictionary no longer matches the query pipeline, i.e.
 * plausible-looking but wrong rankings.
 */
const INDEX_OPTIONS: Options<SearchHit> = {
  fields: ['title', 'titles', 'text'],
  storeFields: ['title', 'titles', 'text'],
}

/** Query-time weighting. Ours to choose: the plugin only builds the index. */
const SEARCH_OPTIONS: SearchOptions = {
  fuzzy: 0.2,
  prefix: true,
  boost: { title: 4, text: 2, titles: 1 },
}

const index: ShallowRef<MiniSearch<SearchHit> | null> = shallowRef(null)
let pending: Promise<MiniSearch<SearchHit> | null> | null = null

/**
 * Loads the index for a locale, once. The dynamic import is what keeps it off the initial
 * page load — the field asks for it on first focus, not on mount.
 *
 * Concurrent callers share `pending` rather than each starting a fetch: `@search` fires
 * on the very first keystroke and again on opening, so two calls racing is the normal
 * case, not an edge one.
 */
export function ensureIndex(localeIndex: string): Promise<MiniSearch<SearchHit> | null> {
  if (index.value) return Promise.resolve(index.value)
  pending ??= load(localeIndex)
  return pending
}

async function load(localeIndex: string): Promise<MiniSearch<SearchHit> | null> {
  const entry = localSearchIndex[localeIndex] ?? localSearchIndex.root
  if (!entry) return null
  const serialised = (await entry()).default
  index.value = MiniSearch.loadJSON<SearchHit>(serialised, INDEX_OPTIONS)
  return index.value
}

export function search(instance: MiniSearch<SearchHit>, query: string, limit: number): SearchHit[] {
  return instance.search(query, SEARCH_OPTIONS).slice(0, limit) as unknown as SearchHit[]
}

/**
 * A short lead-in from the matched section. Returns `undefined` rather than throwing when
 * the text was not stored, so a `storeFields` merge that some future vitepress stops
 * honouring costs the excerpt and nothing else.
 */
export function excerpt(hit: SearchHit | undefined, max = 120): string | undefined {
  const text = hit?.text?.replace(/\s+/g, ' ').trim()
  if (!text) return undefined
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}
