/**
 * Development flag for the guards (a11y warnings, inconsistent props).
 * `import.meta.env` is Vite-specific: accessed optionally because `env` is not
 * typed in `tsconfig.build.json` (`types: []`) and may be absent in a non-Vite
 * consumer — the guard then simply goes inert.
 */
export const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true
