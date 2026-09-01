/**
 * The locale the library speaks and the words it says. No user-facing text is written in a
 * component; all of it comes from here.
 *
 * Module-level state rather than provide/inject, because this is CONFIGURATION: the same
 * for every visitor, and settable from any `.ts` — a plugin, an entry file — with no
 * component involved.
 *
 * ACCEPTED LIMIT — one locale per process. A single Node process serving /en and /fr cannot
 * let the two disagree here; it passes the text props explicitly instead. Lifting the limit
 * would change only the body of `useMessages` below, and no component at all.
 */
import { shallowRef, type ShallowRef } from 'vue'

import { isDev } from '../utils/env'

import { en } from './en'
import type { VectisMessages, VectisMessagesInput } from './types'

/** The language tag assumed until one is chosen. */
export const DEFAULT_LOCALE = 'en-US'
const DEFAULT_LANG = 'en'

/**
 * The dictionaries, filed under the LANGUAGE subtag alone — `en`, `fr`, `de`. `en-GB` and
 * `en-US` share every word; what separates them (field order, first day of week, hour cycle)
 * comes from `Intl` on the full tag and is never a matter of translation.
 *
 * The Map is deliberately inert: what components track is `currentMessages` below, which is
 * recomputed whenever it changes.
 */
const registry = new Map<string, VectisMessages>([[DEFAULT_LANG, en]])

const currentLocale = shallowRef<string>(DEFAULT_LOCALE)
const currentMessages = shallowRef<VectisMessages>(en)

/**
 * The language part of a tag: British English is filed under English. A tag that makes no
 * sense comes back untouched, and will simply match no dictionary.
 */
function langOf(locale: string): string {
  return locale.toLowerCase().split('-')[0] ?? locale
}

/**
 * The dictionary a tag resolves to, falling back to the default language.
 *
 * The last `?? en` never fires: `registry` is seeded with `DEFAULT_LANG` and the only path
 * that could remove it — `registerMessages` passing `undefined` — puts `en` straight back
 * instead of deleting. It stays because `Map.get` is typed `T | undefined`, so the compiler
 * demands an exhaustive expression; the alternative is a non-null assertion, which would
 * hide the reasoning rather than record it. Do not read it as a live third case.
 */
function resolve(locale: string): VectisMessages {
  return registry.get(langOf(locale)) ?? registry.get(DEFAULT_LANG) ?? en
}

/** Names that would reach into an object's own machinery instead of naming a section. */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

/**
 * Lays a partial override over a complete dictionary.
 *
 * Depth EXACTLY 2, which the dictionary's shape guarantees is enough: below a namespace
 * there are only leaves, a string or a function returning one. Nothing recurses, so a
 * FUNCTION can never be mistaken for an object and taken apart — which would leave `{}`
 * behind and a message that renders as nothing.
 */
function mergeMessages(base: VectisMessages, patch: VectisMessagesInput): VectisMessages {
  const out: Record<string, object> = { ...base }
  for (const [namespace, section] of Object.entries(patch)) {
    // A dictionary parsed from a file can carry one of these as a namespace, and assigning
    // to it would replace the copy's own machinery instead of adding a section. Nothing
    // outside is affected, the object being fresh — but every lookup in it is then wrong,
    // and nothing says so.
    if (FORBIDDEN_KEYS.has(namespace)) continue
    if (section) out[namespace] = { ...out[namespace], ...section }
  }
  return out as unknown as VectisMessages
}

/**
 * Chooses the locale the library speaks.
 *
 * Pass a COMPLETE tag — `fr-FR`, `en-GB`, `de-DE` — never a bare language, because it is put
 * to two uses: it picks the dictionary, where only the subtag matters, and it is what the
 * calendar and the pickers hand to `Intl`, where the region matters a great deal. A bare
 * `en` resolves to no region in particular — a 12-hour clock and weeks starting on Sunday,
 * which is not British English. Those components also take their own `locale`, which wins.
 *
 * Call it from a module — a Nuxt plugin, `main.ts` — never inside a `setup()`. On a server
 * the choice lives as long as the process, which is right for configuration and wrong for
 * anything belonging to one visitor; setting it client-only makes the server and the client
 * render different languages, and hydration then visibly fails to line up.
 */
export function setLocale(locale: string): void {
  const lang = langOf(locale)
  if (isDev && !registry.has(lang)) {
    console.warn(
      `[vectis] No dictionary registered for “${lang}”: the text stays in ` +
        `“${DEFAULT_LANG}”. French is shipped — import { fr } from 'vectis-ui' then ` +
        `registerMessages('fr', fr). For another language: registerMessages('${lang}', { … }).`,
    )
  }
  currentLocale.value = locale
  currentMessages.value = resolve(locale)
}

/**
 * Adds or adjusts the words of a LANGUAGE, filed under the subtag alone — `fr`, not `fr-FR`.
 *
 * The one way in, deliberately: enabling the French the library ships and adding a language
 * it does not ship are the SAME gesture.
 *
 * A partial dictionary is fine. What is left out falls back to whatever was registered
 * before, then to the English always carried — never to an empty string. Successive calls
 * for one language ADD UP, so registering `fr` then correcting one word keeps the rest.
 * Passing `undefined` removes the override and puts English back as it came.
 */
export function registerMessages(lang: string, messages: VectisMessagesInput | undefined): void {
  const key = langOf(lang)
  if (isDev && key !== lang.toLowerCase()) {
    console.warn(
      `[vectis] registerMessages('${lang}', …): the expected key is a language subtag ` +
        `alone — registered under “${key}”, which covers all its regional variants.`,
    )
  }
  if (messages === undefined) {
    if (key === DEFAULT_LANG) registry.set(DEFAULT_LANG, en)
    else registry.delete(key)
  } else {
    registry.set(key, mergeMessages(registry.get(key) ?? en, messages))
  }
  currentMessages.value = resolve(currentLocale.value)
}

/**
 * The dictionary in force. Internal — components read it, it is not public API.
 *
 * It hands back the `shallowRef` rather than its contents, which is what makes components
 * ALREADY mounted re-render when `setLocale` is called later.
 *
 * TRAP — reading `.value.x` once in a `setup()` body FREEZES that word. Read it where the
 * read repeats: inside a `computed`, or in the template.
 *
 * The composable shape is deliberate. The day a locale per subtree or per request is needed,
 * only this BODY becomes `inject(messagesKey, null) ?? currentMessages` and no component is
 * touched. It also stays callable outside a component, since all it does is return a ref;
 * a version that looked up the tree would need a `getCurrentInstance()` guard.
 */
export function useMessages(): ShallowRef<VectisMessages> {
  return currentMessages
}

/**
 * The locale tag in force. Internal: what the calendar and the pickers fall back on with no
 * `locale` of their own, and what VDataTable passes to `localeCompare` when it sorts.
 */
export function useLocale(): ShallowRef<string> {
  return currentLocale
}
