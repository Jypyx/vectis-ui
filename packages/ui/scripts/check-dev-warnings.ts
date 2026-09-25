/**
 * Verifies that the integrator-facing warnings SURVIVE the library build. Run as `postbuild`.
 *
 * What it protects: `utils/env.isDev` gates every `@devwarn`, and it is decided by the
 * CONSUMER's bundler, never by ours. A flag that Vite can read at library build time is
 * folded to a constant there, and the minifier then deletes every guarded block, so the
 * package ships with no warning at all. Nothing fails when that happens: Storybook and the
 * unit tests run off the source, where the flag is still live, and a consumer simply never
 * hears about the misuse the warning was written for.
 *
 * Two checks, both on the ARTEFACT:
 * 1. `dist/utils/env.js` exists and reads `process.env.NODE_ENV` at run time;
 * 2. every source module that writes a warning still has one in `dist`: at least as many
 *    emitted modules carry `console.warn` as source modules do (an SFC may emit more than
 *    one module, never fewer).
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { walk } from './lib/measure'

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(pkgRoot, 'dist')
const src = resolve(pkgRoot, 'src')

const errors: string[] = []
const WARN = 'console.warn('

const env = join(dist, 'utils', 'env.js')
if (!existsSync(env))
  errors.push('dist/utils/env.js was not emitted: `isDev` was folded to a constant at build time.')
else if (!readFileSync(env, 'utf8').includes('process.env.NODE_ENV'))
  errors.push('dist/utils/env.js does not read `process.env.NODE_ENV` at run time.')

const isSource = (path: string) => !/\.(test|stories|bench)\.ts$/.test(path)
const sources = [...walk(src, '.ts'), ...walk(src, '.vue')]
  .filter(isSource)
  .filter((path) => readFileSync(path, 'utf8').includes(WARN)).length
const emitted = walk(dist, '.js').filter((path) => readFileSync(path, 'utf8').includes(WARN)).length

if (emitted < sources)
  errors.push(
    `${sources} source modules write a warning, but only ${emitted} emitted modules still do.`,
  )

if (errors.length) {
  console.error(`Dev warning check failed (${errors.length}):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log(`Dev warnings OK — ${emitted} emitted modules warn (${sources} source modules).`)
