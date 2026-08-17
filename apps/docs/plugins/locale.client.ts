/**
 * Restores a stored language choice, after hydration.
 *
 * Same reason as the theme plugin, and a sharper one: `setLocale` moves module-level state
 * in the library, so calling it before hydration would make the client render words the
 * prerendered HTML does not contain. The artefact is English; a returning French reader gets
 * their dictionary back one tick after the page is interactive.
 */
import { LOCALE_STORAGE_KEY, type DocsLocaleId } from '~/composables/useDocsLocale'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const { localeOptions, setDocsLocale } = useDocsLocale()

    let stored: string | null = null
    try {
      stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    } catch {
      return
    }

    // English is what the page already says, so restoring it would be a no-op that only
    // risks a needless re-render.
    if (!stored || stored === 'en') return
    if (localeOptions.some((option) => option.id === stored)) {
      setDocsLocale(stored as DocsLocaleId)
    }
  })
})
