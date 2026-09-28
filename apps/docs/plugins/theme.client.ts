/**
 * The pre-paint script sets page colours. Update Vue theme state after hydration to avoid
 * mismatching the prerendered icon.
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
