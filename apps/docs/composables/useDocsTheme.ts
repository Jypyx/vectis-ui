/**
 * The site's colour scheme.
 *
 * The design system's tokens carry `[data-theme='light']` and `[data-theme='dark']` and NO
 * `prefers-color-scheme` query at all, so "follow the system" is something this site has to
 * resolve itself. `data-theme` on `<html>` is the single signal: it moves the semantic roles
 * and drives `color-scheme`, so scrollbars and native controls follow with it.
 *
 * The attribute is written before first paint by the inline script in `nuxt.config.ts`, and
 * `plugins/theme.client.ts` is what syncs this state to it after hydration. Everything here
 * is deliberately pure so that both the header button and the burger menu can drive it
 * without either of them owning the wiring.
 */
export type DocsTheme = 'light' | 'dark'

/** Shared with the pre-paint inline script in nuxt.config.ts — change both or neither. */
export const THEME_STORAGE_KEY = 'vectis-docs-theme'

export function useDocsTheme() {
  // Seeded to 'light' rather than to the visitor's real scheme, because the server cannot
  // know it: a prerendered page has one HTML for everybody. The plugin corrects it once
  // hydration is over, which costs a dark-scheme visitor one frame of the wrong icon —
  // the same trade-off the library itself accepts for VHotkeys' platform detection.
  const theme = useState<DocsTheme>('docs-theme', () => 'light')

  /** True once the reader has chosen: the OS is then no longer allowed to change it. */
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
