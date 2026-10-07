/**
 * The theme builder's configuration, shared by its panel components and kept in the reader's
 * browser between visits.
 */
import { RADIUS_PRESETS } from '~/theme-builder/options'
import { DEFAULT_CONFIG, isThemeConfig, seedCustom, type ThemeConfig } from '~/theme-builder/model'

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

  function reset() {
    config.value = copy(DEFAULT_CONFIG)
  }

  /** Entering the custom mode seeds it from the current preset, unless it was edited. */
  function setColorMode(mode: ThemeConfig['colors']['mode']) {
    const { colors } = config.value
    if (mode === 'custom' && !colors.edited)
      colors.custom = seedCustom(colors.accent, colors.neutral)
    colors.mode = mode
  }

  /** Entering the custom radius starts from the preset in use. */
  function setRadiusMode(mode: ThemeConfig['radius']['mode']) {
    const { radius } = config.value
    if (mode === 'custom' && radius.mode === 'preset')
      radius.custom = { ...RADIUS_PRESETS[radius.preset] }
    radius.mode = mode
  }

  return { config, restore, persist, reset, setColorMode, setRadiusMode }
}
