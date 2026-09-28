/**
 * Share theme controls through the html data-theme attribute, which also drives native
 * colour-scheme styling.
 */
export type DocsTheme = 'light' | 'dark'

/** Keep this storage key aligned with the pre-paint script in nuxt.config.ts. */
export const THEME_STORAGE_KEY = 'vectis-docs-theme'

export function useDocsTheme() {
  // Seed light mode for deterministic hydration; resolve the visitor's theme after mount.
  const theme = useState<DocsTheme>('docs-theme', () => 'light')

  const pinned = useState<boolean>('docs-theme-pinned', () => false)

  function setTheme(next: DocsTheme) {
    pinned.value = true
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // A blocked storage (private mode, a strict policy) costs the choice its persistence
      // and nothing else. Failing the click over it would be worse.
    }
    theme.value = next
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    theme,
    pinned,
    isLight: computed(() => theme.value === 'light'),
    isDark: computed(() => theme.value === 'dark'),
    setTheme,
    toggleTheme,
  }
}
