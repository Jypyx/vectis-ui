/**
 * The theme builder's configuration, shared by its panel components and kept in the reader's
 * browser between visits.
 */
import { DEFAULT_CONFIG, isThemeConfig, type ThemeConfig } from '~/theme-builder/model'

const STORAGE_KEY = 'vectis-docs-theme-builder'

/** A deep copy that also unwraps reactive proxies, which `structuredClone` rejects. */
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export function useThemeBuilder() {
  const config = useState<ThemeConfig>('theme-builder', () => copy(DEFAULT_CONFIG))

  /** Restores the stored configuration; call once mounted. A stale shape is ignored. */
  function restore() {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
      if (isThemeConfig(stored)) config.value = stored
    } catch {
      // Blocked or corrupt storage leaves the defaults in place.
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
    } catch {
      // Without storage the theme simply lasts as long as the page.
    }
  }

  // Key order matches: every config is built from these defaults.
  const isDefault = computed(() => JSON.stringify(config.value) === JSON.stringify(DEFAULT_CONFIG))

  function reset() {
    config.value = copy(DEFAULT_CONFIG)
  }

  return { config, isDefault, restore, persist, reset }
}
