/**
 * Validate component CSS imports, per-sheet layer ordering and the separation of component
 * rules from core CSS in the built package.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { formatKb, gzipBytes, posix as posixFrom, walk } from './lib/measure'

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(pkgRoot, 'dist')

const LAYER_ORDER = '@layer vectis.reset, vectis.tokens, vectis.components, vectis.utilities;'

/** The only classes `styles.css` may carry once the components ship their own sheet. */
const CORE_CLASSES: ReadonlySet<string> = new Set([
  '.v-banner',
  '.v-banner-control',
  '.v-banner-text',
  '.v-choice',
  '.v-choice-error',
  '.v-choice-hint',
  '.v-choice-label',
  '.v-choice-row',
  '.v-control',
  '.v-disclosure',
  '.v-disclosure-chevron',
  '.v-disclosure-chevron-open',
  '.v-field-action',
  '.v-field-counter',
  '.v-field-error',
  '.v-field-meta',
  '.v-floating',
  '.v-hidden-input',
  '.v-overlay',
  '.v-panel',
  '.v-tone',
  '.v-variant',
  '.v-visually-hidden',
])

const posix = (p: string) => posixFrom(dist, p)
const errors: string[] = []
const fail = (message: string) => errors.push(message)

if (!existsSync(dist)) throw new Error('dist/ is missing — run `pnpm build` first.')

const sfcs = walk(resolve(pkgRoot, 'src/components'), '.vue').filter((f) =>
  /<style[^>]*>/.test(readFileSync(f, 'utf8')),
)
for (const sfc of sfcs) {
  const stem = relative(resolve(pkgRoot, 'src'), sfc)
    .replace(/\\/g, '/')
    .replace(/\.vue$/, '')
  const css = join(dist, `${stem}.css`)
  const js = join(dist, `${stem}.js`)
  if (!existsSync(css)) {
    fail(`${stem}.css is missing — its <style> was not emitted as its own asset.`)
    continue
  }
  const expected = `import './${stem.slice(stem.lastIndexOf('/') + 1)}.css';`
  if (!existsSync(js)) fail(`${stem}.js is missing, but ${stem}.css was emitted.`)
  else if (!readFileSync(js, 'utf8').startsWith(expected))
    fail(`${stem}.js does not open with \`${expected}\` — the sheet would ship unreferenced.`)
}

const sheets = walk(dist, '.css')

for (const sheet of sheets) {
  const name = posix(sheet)
  const source = readFileSync(sheet, 'utf8')

  if (name !== 'styles.css' && !source.startsWith(LAYER_ORDER))
    fail(`${name} does not open with the layer order statement.`)

  for (const [, names] of source.matchAll(/@layer\s+([^{;]+)[{;]/g))
    for (const layer of (names ?? '').split(','))
      if (!/^vectis(\.|$)/.test(layer.trim()))
        fail(`${name} declares the layer \`${layer.trim()}\`, outside the vectis namespace.`)
}

const core = readFileSync(join(dist, 'styles.css'), 'utf8')
for (const cls of new Set([...core.matchAll(/\.v-[a-z0-9-]+/g)].map((m) => m[0])))
  if (!CORE_CLASSES.has(cls)) fail(`styles.css carries \`${cls}\`, which belongs to a component.`)

// 5. the barrel never pulls the core in: it stays an explicit, <link>-able consumer import.
if (/^import\s+['"]\.\/styles\.css['"]/m.test(readFileSync(join(dist, 'index.js'), 'utf8')))
  fail('index.js imports styles.css — the core must stay a separate artefact.')

if (errors.length) {
  console.error(`CSS split check failed (${errors.length}):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log(`CSS split OK — ${sfcs.length} component sheets, core ${gzip(core)} gzip.`)

function gzip(source: string | Buffer): string {
  return formatKb(gzipBytes(source))
}

if (process.argv.includes('--report')) {
  const wanted = process.argv.slice(process.argv.indexOf('--report') + 1)
  const picked = sheets.filter((s) => wanted.some((w) => posix(s).endsWith(`/${w}.css`)))
  const missing = wanted.filter((w) => !picked.some((s) => posix(s).endsWith(`/${w}.css`)))
  if (missing.length) console.warn(`Unknown component(s): ${missing.join(', ')}`)
  const bundle = Buffer.concat([Buffer.from(core), ...picked.map((s) => readFileSync(s))])
  console.log(`core + ${picked.length} component(s): ${gzip(bundle)} gzip`)
}
