/**
 * Drapeau de développement des garde-fous (avertissements a11y, props
 * incohérentes). `import.meta.env` est spécifique à Vite : accès optionnel car
 * `env` n'est pas typé dans `tsconfig.build.json` (`types: []`) et peut être
 * absent chez un consommateur non-Vite — le garde-fou devient alors inerte.
 */
export const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true
