/*
 * Typed here rather than through `@types/node`: the library's build compiles with no ambient
 * types, and a `declare global` would leak into the consumer's compilation. Declared in a
 * module, it shadows nothing outside this file.
 */
declare const process: { env: { NODE_ENV?: string } }

// @devwarn
/**
 * Whether the library is running in a development build. Every integrator-facing warning
 * is gated on it, so none reaches a finished application.
 *
 * TRAP: it is read from `process.env.NODE_ENV`, which the CONSUMER's bundler replaces, and
 * never from `import.meta.env`: Vite folds `import.meta.env.*` to constants when it builds
 * a library, so such a flag would be `false` in the published package and the minifier
 * would delete every guarded warning with it. `process.env.*` is left alone by a library build,
 * exactly so the application can decide. It is the contract Vue's own `esm-bundler` build
 * relies on, so any bundler that can serve Vue already defines it; the library cannot run
 * without a bundler anyway, each component importing its own stylesheet.
 * `scripts/check-dev-warnings.ts` guards it on the artefact.
 *
 * A production build then strips the warnings only where the bundler carries a constant
 * across modules: Rolldown and Rollup (Vite, Nuxt) do, esbuild alone does not, and there
 * the strings ship inert, costing bytes but never a message.
 */
export const isDev = process.env.NODE_ENV !== 'production'
