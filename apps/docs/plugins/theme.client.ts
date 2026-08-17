/**
 * Connects the theme state to the document, once, on the client.
 *
 * Everything here waits for `app:mounted` on purpose. The pre-paint script in
 * `nuxt.config.ts` has already put the right value on `<html data-theme>`, so the PAGE is
 * correct from the first frame; what cannot be done earlier is moving the Vue state, because
 * the header renders a different icon for each theme and the prerendered HTML says 'light'.
 * Seeding before hydration would therefore be a mismatch, and seeding after it costs one
 * frame of a light-mode icon on a dark-mode machine.
 */
import { THEME_STORAGE_KEY, type DocsTheme } from '~/composables/useDocsTheme'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const { theme, pinned } = useDocsTheme()
    const root = document.documentElement

    theme.value = root.dataset.theme === 'dark' ? 'dark' : 'light'
    try {
      pinned.value = localStorage.getItem(THEME_STORAGE_KEY) !== null
    } catch {
      pinned.value = false
    }

    // The one place the attribute is written after boot, so no caller has to remember to.
    watch(theme, (next: DocsTheme) => {
      root.dataset.theme = next
    })

    // The OS keeps the last word until the reader takes it: a visitor who never touched the
    // button sees their machine switch at dusk, one who did keeps their choice.
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    query.addEventListener('change', (event) => {
      if (!pinned.value) theme.value = event.matches ? 'dark' : 'light'
    })
  })
})
