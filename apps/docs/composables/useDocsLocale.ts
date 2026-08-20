/**
 * The language of the site, which is the language of everything on it.
 *
 * One choice drives two things at once: the documentation's own prose, served as prerendered
 * HTML under `/` or `/fr/`, and the words the design system's components render inside the
 * demos — a field's "Clear", a dialog's "Close", a calendar's month names. They used to be
 * separate, and separating them was a lie the header told: the menu said "Interface language"
 * while translating nothing but the demos.
 *
 * The URL is the source of truth, not `localStorage`. That is what makes a language shareable:
 * a French reader sending a link sends the French page, and a returning reader is wherever
 * they left off rather than wherever a cookie says. `plugins/vectis.ts` is what carries the
 * route's locale down into the library.
 *
 * The library's own split still holds and is worth remembering when reading a demo: the WORDS
 * come from a dictionary, the FORMATS from `Intl` on the tag. That is why the tags below are
 * full ones — `en-GB` and `fr-FR`, not `en` and `fr`.
 */
export interface DocsLocaleOption {
  /** The route prefix segment, and what `switchLocalePath` is given. */
  code: 'en' | 'fr'
  /** The language's own name for itself. Never translated — an endonym has no translation. */
  label: string
  /** The BCP 47 tag handed to the library, shown so the formats/words split stays visible. */
  sublabel: string
}

export const localeOptions: DocsLocaleOption[] = [
  { code: 'en', label: 'English', sublabel: 'en-GB' },
  { code: 'fr', label: 'Français', sublabel: 'fr-FR' },
]
