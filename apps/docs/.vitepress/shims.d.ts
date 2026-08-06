/*
 * Ambient declarations for the non-TypeScript modules this package imports.
 *
 * `packages/ui` gets these from `vite/client`. This package deliberately does not pull
 * that in — vite is not a direct dependency here (vitepress bundles its own), and adding
 * it would install a second major — so the two declarations it actually needs are
 * written out.
 */

/**
 * Side-effect stylesheet imports. `tsconfig.base.json` enables
 * `noUncheckedSideEffectImports`, which rejects an unresolvable side-effect import
 * outright; this is what makes `import '@vectis/ui/styles.css'` legal.
 */
declare module '*.css' {}

/**
 * The search index, served as a virtual module by vitepress's `localSearchPlugin` — in
 * dev and in build alike, but ONLY when `themeConfig.search.provider` is `'local'`
 * (the plugin returns an inert stub otherwise; see `config.ts`).
 *
 * Keyed by locale index, `'root'` for the default locale. Each value resolves to a
 * serialised MiniSearch index over the fields `['title', 'titles', 'text']`, whose
 * document ids already carry `base` and already honour `cleanUrls` — so a hit's id is a
 * href, not something to feed back through `withBase()`.
 */
declare module '@localSearchIndex' {
  const index: Record<string, (() => Promise<{ default: string }>) | undefined>
  export default index
}
