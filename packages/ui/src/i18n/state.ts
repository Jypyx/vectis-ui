/**
 * Locale and dictionary of the DS. No user-facing text is hardcoded in an SFC:
 * everything goes through this module.
 *
 * Module-level state (as in `VIcon/resolver.ts` and `VToast/state.ts`) rather
 * than a Vue plugin or provide/inject: this is configuration, identical for
 * every request of a process, and it must stay settable from any `.ts` (a Nuxt
 * plugin, `main.ts`).
 *
 * ACCEPTED CONSEQUENCE: one locale per process. Multi-locale SSR PER REQUEST is
 * not covered — a site serving /en and /fr from the same Node process must pass
 * the text props (and `locale` on VCalendar / VDatePicker / VTimePicker)
 * explicitly. That limit can be lifted without touching the components: see
 * `useMessages` at the end of this file.
 */
import { shallowRef, type ShallowRef } from 'vue'

import { isDev } from '../utils/env'

import { en } from './en'
import type { VectisMessages, VectisMessagesInput } from './types'

/** Default BCP 47 tag. */
export const DEFAULT_LOCALE = 'en-US'
const DEFAULT_LANG = 'en'

/**
 * Dictionaries indexed by LANGUAGE SUBTAG (`'en'`, `'fr'`, `'de'`) rather than
 * by full tag: `'en-US'`, `'en-GB'` and `'en-AU'` share their words. What
 * varies between them — date field order, first day of week, hour cycle — is
 * derived from `Intl` using the COMPLETE tag, not translated here.
 *
 * A non-reactive Map: reactivity is carried by `currentMessages`, which every
 * mutation of the registry recomputes.
 */
const registry = new Map<string, VectisMessages>([[DEFAULT_LANG, en]])

const currentLocale = shallowRef<string>(DEFAULT_LOCALE)
const currentMessages = shallowRef<VectisMessages>(en)

/** `'en-GB'` → `'en'`. An invalid tag comes back as-is: it will match nothing. */
function langOf(locale: string): string {
  return locale.toLowerCase().split('-')[0] ?? locale
}

function resolve(locale: string): VectisMessages {
  return registry.get(langOf(locale)) ?? registry.get(DEFAULT_LANG) ?? en
}

/** Keys that would reach the prototype chain rather than a namespace. */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

/**
 * Merges a partial override onto a complete dictionary.
 *
 * TWO levels, and only two — the `VectisMessages` type guarantees that level 2
 * holds nothing but leaves (a string, or a function). No recursion, therefore
 * no risk of a FUNCTION value being walked as an object and coming back as
 * `{}`: it is copied by reference, exactly like a string.
 */
function mergeMessages(base: VectisMessages, patch: VectisMessagesInput): VectisMessages {
  const out: Record<string, object> = { ...base }
  for (const [namespace, section] of Object.entries(patch)) {
    // A dictionary built by `JSON.parse` can carry `__proto__` as an OWN key, and
    // `out[namespace] = …` would then set the merged object's prototype instead of a
    // namespace. Not a global pollution (`out` is a fresh spread), but it silently
    // yields a dictionary whose every lookup is wrong.
    if (FORBIDDEN_KEYS.has(namespace)) continue
    if (section) out[namespace] = { ...out[namespace], ...section }
  }
  return out as unknown as VectisMessages
}

/**
 * Sets the DS locale.
 *
 * Expects a **complete** BCP 47 tag (`'fr-FR'`, `'en-GB'`, `'de-DE'`) rather
 * than a bare language code — it serves two purposes:
 *
 * 1. picking the dictionary, through its language subtag (`'fr-CA'` → `'fr'`);
 * 2. feeding `Intl` in VCalendar / VDatePicker / VTimePicker, whose `locale`
 *    prop still takes PRECEDENCE. `Intl` accepts a bare tag (`'en'`) but
 *    applies the language's default conventions to it — `'en'` means 12 h and a
 *    week starting on Sunday, which is not `'en-GB'`.
 *
 * Call it at MODULE level — a Nuxt plugin, `main.ts` — never inside a
 * `setup()`. Under SSR the state lives in the process: correct for
 * configuration, wrong for per-request state. Beware of client-only too: a
 * locale set in a `plugins/*.client.ts` makes server and client diverge, hence
 * a hydration mismatch.
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
 * Registers — or completes — the dictionary of a LANGUAGE. The key is the
 * language subtag alone (`'fr'`, not `'fr-FR'`).
 *
 * This is the single extension point: enabling the shipped French
 * (`registerMessages('fr', fr)`) and adding a language the DS does not ship
 * (`registerMessages('de', { … })`) are the SAME gesture.
 *
 * The override is PARTIAL: whatever you do not write falls back to the
 * dictionary already registered for that language, otherwise to the `en` base —
 * never to an empty string (the same contract as the partial mappings of
 * `setIconResolver`). Successive calls on the same language ACCUMULATE:
 * `registerMessages('fr', fr)` then `registerMessages('fr', { common: { … } })`
 * adjusts one key without losing the rest of the French.
 *
 * `undefined` REMOVES the override (and restores the base for `'en'`).
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
 * The current dictionary. **Internal** — consumed by the SFCs, not exported
 * from `src/index.ts`.
 *
 * Returning the `ShallowRef` rather than the object is what makes already
 * mounted components RE-RENDER when `setLocale` is called later: reading
 * `.value` inside a `computed` (or the ref in a template, auto-unwrapped)
 * registers the dependency with the render effect.
 *
 * ⚠ Usage trap: `const t = useMessages().value.common.loading` in the body of a
 * `setup()` FREEZES the value. Always inside a `computed` or the template.
 *
 * The composable shape is deliberate: the day a per-subtree (or per-SSR-request)
 * locale becomes necessary, only the BODY of this function changes —
 * `inject(messagesKey, null) ?? currentMessages` — and none of the consumer SFCs
 * is touched. It also stays callable OUTSIDE a component (it only returns a
 * ref); a future `inject` would therefore need a `getCurrentInstance()` guard.
 */
export function useMessages(): ShallowRef<VectisMessages> {
  return currentMessages
}

/**
 * The current BCP 47 locale. Internal — serves as the default for the `locale`
 * prop of VCalendar / VDatePicker / VTimePicker, and as VDataTable's sort
 * locale.
 */
export function useLocale(): ShallowRef<string> {
  return currentLocale
}
