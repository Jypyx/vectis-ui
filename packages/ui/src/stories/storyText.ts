/**
 * Story text that follows the Storybook `locale` toolbar.
 *
 * Storybook-only: this folder is excluded from `tsconfig.build.json`, so nothing
 * here reaches `dist`.
 *
 * The returned value is a `computed` on the DS's reactive locale, and `setup`
 * must return **the ref, never `.value`** — that is what sidesteps the frozen
 * `setup()`: the vue3 renderer does not re-mount the tree when a toolbar global
 * changes, but the template unwraps the computed, so the render effect tracks
 * the locale and re-renders on `setLocale`.
 *
 *     const t = storyText({ en: { save: 'Save' }, fr: { save: 'Enregistrer' } })
 *
 *     render: () => ({
 *       components: { VButton },
 *       setup: () => ({ t }),
 *       template: `<VButton>{{ t.save }}</VButton>`,
 *     })
 *
 * Only prose belongs in the dictionary. Demo data (person names, `Alpha`/`Bravo`,
 * ISO dates) stays as-is.
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
