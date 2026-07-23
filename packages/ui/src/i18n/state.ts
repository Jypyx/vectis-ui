/**
 * The language the design system speaks, and the words it says. No text a reader will
 * ever see is written inside a component: all of it comes from here.
 *
 * The choice of language is held once for the whole application rather than being handed
 * down through the component tree, because it is CONFIGURATION — the same for everyone
 * looking at the site — and because it must remain settable from an ordinary file, a
 * start-up script or a plugin, without a component being involved.
 *
 * ACCEPTED CONSEQUENCE — one language at a time per running server. A site serving an
 * English page and a French one from the same server cannot let those two pages disagree
 * here; it passes the words to the components explicitly instead, along with the language
 * for the calendar and the two pickers. Lifting that limit would change only the body of
 * the last function in this file, and no component at all.
 */
import { shallowRef, type ShallowRef } from 'vue'

import { isDev } from '../utils/env'

import { en } from './en'
import type { VectisMessages, VectisMessagesInput } from './types'

/** The language tag assumed until one is chosen. */
export const DEFAULT_LOCALE = 'en-US'
const DEFAULT_LANG = 'en'

/**
 * The dictionaries, filed under the LANGUAGE alone — "en", "fr", "de" — and not under the
 * country as well. British, American and Australian English share every word. What does
 * separate them, the order of the parts of a date, the day a week starts on, whether the
 * hours run to twelve or twenty-four, is worked out by the browser from the complete tag
 * and is never a matter of translation.
 *
 * The collection itself is deliberately inert: what components watch is the current
 * dictionary below, which is recalculated whenever the collection changes.
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

function resolve(locale: string): VectisMessages {
  return registry.get(langOf(locale)) ?? registry.get(DEFAULT_LANG) ?? en
}

/** Names that would reach into an object's own machinery instead of naming a section. */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

/**
 * Lays a handful of replacement words over a complete dictionary.
 *
 * It descends exactly TWO levels and no further, which the shape of a dictionary
 * guarantees is enough: below a section there are only finished values, a piece of text or
 * a function that builds one. Nothing is walked recursively, so a FUNCTION can never be
 * mistaken for an object and taken apart — which would leave an empty one behind, and a
 * message that renders as nothing.
 */
function mergeMessages(base: VectisMessages, patch: VectisMessagesInput): VectisMessages {
  const out: Record<string, object> = { ...base }
  for (const [namespace, section] of Object.entries(patch)) {
    // A dictionary that came out of a parsed file can carry one of those names as a
    // section of its own, and assigning to it would replace the merged dictionary's
    // machinery rather than adding a section. Nothing outside is affected — the object
    // being built is a fresh copy — but the result is a dictionary in which every single
    // lookup is wrong, and nothing says so.
    if (FORBIDDEN_KEYS.has(namespace)) continue
    if (section) out[namespace] = { ...out[namespace], ...section }
  }
  return out as unknown as VectisMessages
}

/**
 * Chooses the language the design system speaks.
 *
 * Give it a COMPLETE tag — "fr-FR", "en-GB", "de-DE" — rather than a bare language, since
 * it is put to two uses. It picks the dictionary, for which only the language matters;
 * and it is what the calendar and the two pickers hand to the browser, for which the
 * country matters a great deal. A bare "en" is accepted there but means the conventions
 * of no country in particular: hours running to twelve and weeks starting on Sunday,
 * which is not British English. Those three components also take a language of their own,
 * and it wins over this one.
 *
 * Call it from an ordinary module — a plugin, the file that starts the application — and
 * never from inside a component. On a server this choice lives for as long as the process
 * does, which is right for configuration and wrong for anything belonging to one visitor.
 * Setting it only in the browser is its own trap: the page the server built would then be
 * in another language than the one the browser expects, and the two would visibly fail to
 * line up.
 */
export function setLocale(locale: string): void {
  const lang = langOf(locale)
  if (isDev && !registry.has(lang)) {
    console.warn(
      `[vectis] No dictionary registered for “${lang}”: the text stays in ` +
        `“${DEFAULT_LANG}”. French is shipped — import { fr } from '@vectis/ui' then ` +
        `registerMessages('fr', fr). For another language: registerMessages('${lang}', { … }).`,
    )
  }
  currentLocale.value = locale
  currentMessages.value = resolve(locale)
}

/**
 * Adds the words of a LANGUAGE, or adjusts the ones already there. What it is filed under
 * is the language alone — "fr", not "fr-FR".
 *
 * This is the one way in, and deliberately so: turning on the French the library ships
 * with and adding a language it does not ship at all are the very SAME gesture.
 *
 * What is given may be a few words rather than a whole dictionary. Anything left out
 * falls back to whatever was registered for that language before, and failing that to the
 * English the library always carries — never to an empty string. Successive calls for one
 * language ADD UP, so registering the French and then correcting a single word keeps the
 * rest of the French.
 *
 * Passing nothing at all removes what was added, and puts English back as it came.
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
 * The dictionary in force. Internal to the library — the components read it, and it is
 * not part of the public surface.
 *
 * What is handed back is the holder rather than the words inside it, and that is what
 * makes components ALREADY on screen redraw themselves when the language is changed
 * later: reading through the holder is what ties the component to it.
 *
 * TRAP — reading a word out of it once, at the top of a component, FREEZES that word. It
 * must be read where the reading is repeated: inside something derived, or in the
 * template.
 *
 * The shape of a composable is deliberate. The day a language per part of the page, or
 * per visitor on a server, becomes necessary, only the BODY of this function changes and
 * no component is touched. It also stays callable outside any component, since all it
 * does is hand back a holder; a version that looked up the tree would have to check for
 * that case.
 */
export function useMessages(): ShallowRef<VectisMessages> {
  return currentMessages
}

/**
 * The language tag in force. Internal to the library: it is what the calendar and the two
 * pickers fall back on when they are given no language of their own, and what the table
 * sorts its rows by.
 */
export function useLocale(): ShallowRef<string> {
  return currentLocale
}
