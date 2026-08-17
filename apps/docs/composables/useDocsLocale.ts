/**
 * The language the DESIGN SYSTEM speaks on this site.
 *
 * It changes what the components say — a field's "Clear", a dialog's "Close", a calendar's
 * month names — and not the documentation's own prose, which is written in English. That is
 * the honest reading of the library's own split: the WORDS come from a dictionary, the
 * FORMATS derive from `Intl` from the locale tag. Picking German with no German dictionary
 * registered therefore already gives German months, first day of week and hour cycle, with
 * the labels left in English. A coherent degraded state, and the point of the menu.
 *
 * The library accepts one locale per process, so the choice is applied after hydration
 * rather than at prerender: the artefact is English for everyone, and a stored preference
 * settles one tick later. What that costs is a handful of `aria-label`s, which is why it is
 * an acceptable price here and would not be on an application.
 */
import { setLocale } from '@vectis/ui'

export type DocsLocaleId = 'en' | 'fr' | 'de' | 'ja'

export interface DocsLocaleOption {
  id: DocsLocaleId
  /** What `setLocale` is given: a full BCP 47 tag, since the formats derive from it. */
  tag: string
  label: string
  /** The tag, plus a warning where the library ships no dictionary for that language. */
  sublabel: string
}

export const LOCALE_STORAGE_KEY = 'vectis-docs-locale'

/** Only `en` and `fr` have dictionaries; the other two are here to show the split working. */
export const localeOptions: DocsLocaleOption[] = [
  { id: 'en', tag: 'en-GB', label: 'English', sublabel: 'en-GB' },
  { id: 'fr', tag: 'fr-FR', label: 'Français', sublabel: 'fr-FR' },
  { id: 'de', tag: 'de-DE', label: 'Deutsch', sublabel: 'de-DE · dictionary missing' },
  { id: 'ja', tag: 'ja-JP', label: '日本語', sublabel: 'ja-JP · dictionary missing' },
]

export function useDocsLocale() {
  const locale = useState<DocsLocaleId>('docs-locale', () => 'en')

  function setDocsLocale(next: DocsLocaleId) {
    const option = localeOptions.find((entry) => entry.id === next)
    if (!option) return
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      // Persistence is a convenience; losing it must not lose the switch itself.
    }
    locale.value = next
    setLocale(option.tag)
  }

  return { locale, localeOptions, setDocsLocale }
}
