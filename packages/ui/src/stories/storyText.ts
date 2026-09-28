/**
 * Return the locale-dependent computed ref from setup, not its value. Storybook reruns
 * decorators on locale changes without remounting component setup.
 */
import { computed, type ComputedRef } from 'vue'

import { useLocale } from '../i18n/state'

export function storyText<T extends Record<string, unknown>>(dict: {
  en: T
  fr: T
}): ComputedRef<T> {
  const locale = useLocale()
  return computed(() => (locale.value.toLowerCase().startsWith('fr') ? dict.fr : dict.en))
}
