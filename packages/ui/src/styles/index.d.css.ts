/**
 * Makes `import './styles/index.css'` resolvable to TypeScript under
 * `allowArbitraryExtensions`, WITHOUT a `declare module '*.css'` wildcard: a
 * wildcard matches any path, which would defeat `noUncheckedSideEffectImports`
 * — the flag whose only job here is to catch a typo in that one import.
 */
declare const css: string
export default css
