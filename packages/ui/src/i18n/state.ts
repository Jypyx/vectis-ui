/**
 * Reactive process-wide locale configuration, callable outside components. Per-request
 * multilingual SSR requires explicit component text props.
 */
import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue'

import { isDev } from '../utils/env'

import { en } from './en'
import type { Messages, MessagesInput } from './types'

/** The language tag assumed until one is chosen. */
export const DEFAULT_LOCALE = 'en-US'
const DEFAULT_LANG = 'en'

/** The dictionaries, filed under the LANGUAGE subtag alone; `en`, `fr`, `de`. */
const registry = new Map<string, Messages>([[DEFAULT_LANG, en]])

const currentLocale = shallowRef<string>(DEFAULT_LOCALE)
const currentMessages = shallowRef<Messages>(en)

/**
 * The language part of a tag: British English is filed under English. A tag that makes no
 * sense comes back untouched, and will simply match no dictionary.
 */
function langOf(locale: string): string {
  return locale.toLowerCase().split('-')[0] ?? locale
}

/**
 * The dictionary a tag resolves to, falling back to the default language. The last `?? en`
 * never fires: `registry` is seeded with `DEFAULT_LANG` and the only path that could remove it;
 * `registerMessages` passing `undefined`; puts `en` straight back instead of deleting.
 */
function resolve(locale: string): Messages {
  return registry.get(langOf(locale)) ?? registry.get(DEFAULT_LANG) ?? en
}

/** Names that would reach into an object's own machinery instead of naming a section. */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

/** Lays a partial override over a complete dictionary. */
function mergeMessages(base: Messages, patch: MessagesInput): Messages {
  const out: Record<string, object> = { ...base }
  for (const [namespace, section] of Object.entries(patch)) {
    // A dictionary parsed from a file can carry one of these as a namespace, and assigning to
    // it would replace the copy's own machinery instead of adding a section. Nothing outside is
    // affected, the object being fresh; but every lookup in it is then wrong, and nothing says
    // so.
    if (FORBIDDEN_KEYS.has(namespace)) continue
    if (!section) continue
    /* Ignore nullish dictionary leaves so partial overrides cannot erase fallback labels. */
    const words = Object.entries(section).filter(([key, value]) => {
      const empty = value === undefined || value === null || value === ''
      if (empty && isDev) {
        console.warn(`[vectis] registerMessages: “${namespace}.${key}” is empty and was ignored.`)
      }
      return !empty
    })
    out[namespace] = { ...out[namespace], ...Object.fromEntries(words) }
  }
  return out as unknown as Messages
}

/**
 * Whether `Intl` takes a tag: a malformed one ("fr_FR") throws a RangeError in every formatter,
 * so it is ignored rather than passed on.
 */
function isValidTag(tag: string): boolean {
  try {
    Intl.getCanonicalLocales(tag)
    return true
  } catch {
    if (isDev) console.warn(`[vectis] Locale “${tag}” ignored: not a language tag ('fr-FR').`)
    return false
  }
}

/**
 * Chooses the locale the library speaks. Those components also take their own `locale`, which
 * wins. A malformed tag is ignored and the locale in force stays.
 */
export function setLocale(locale: string): void {
  if (!isValidTag(locale)) return
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
 * Adds or adjusts the words of a LANGUAGE, filed under the subtag alone: `fr`, not `fr-FR`.
 * What is left out falls back to whatever was registered before, then to the English always
 * carried, never to an empty string.
 */
export function registerMessages(lang: string, messages: MessagesInput | undefined): void {
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
 * Reading `.value.x` once in a `setup()` body FREEZES that word. Read it where the read
 * repeats: inside a `computed`, or in the template.
 */
export function useMessages(): ShallowRef<Messages> {
  return currentMessages
}

/**
 * The locale tag in force. Internal: what the calendar and the pickers fall back on with no
 * `locale` of their own, and what VDataTable passes to `localeCompare` when it sorts.
 */
export function useLocale(): ShallowRef<string> {
  return currentLocale
}

/**
 * The locale a component with a `locale` prop of its own actually uses: the prop when it is
 * given, the locale in force otherwise. The prop has no literal default in any of the
 * components that read it, and that is what this relies on: `undefined` is the "not given" that
 * lets the global locale have its chance.
 */
export function useResolvedLocale(locale: () => string | undefined): ComputedRef<string> {
  // An empty or malformed tag is no tag: handed to `Intl` as it stands, it throws a RangeError.
  return computed(() => {
    const tag = locale()
    return tag && isValidTag(tag) ? tag : currentLocale.value
  })
}
