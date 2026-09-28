export interface DocsLocaleOption {
  /** The route prefix segment, and what `switchLocalePath` is given. */
  code: 'en' | 'fr'
  label: string
}

export const localeOptions: DocsLocaleOption[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
]
