/**
 * Verifies the per-component CSS split in `dist/` — run as `postbuild`, so it sits
 * inside `pnpm build` and inside the project checkpoint.
 *
 * What it protects: every failure mode here is SILENT. A component sheet emitted
 * without its `import` produces an unstyled component, not an error; a missing layer
 * statement produces a wrong cascade only in the consumer's bundle, never in
 * Storybook (which runs off the source pipeline and never looks at `dist`); a
 * component rule leaking into `styles.css` puts back the flat stylesheet the split
 * removed, and only a size measurement would ever notice.
 *
 * Check 4 also REPLACES the manual `git grep` that used to guard the layer names: a
 * stray one now ships in an isolated file with no neighbours to make it obvious.
 *
 * `--report` prints the gzip cost of the core plus any number of components — the
 * command behind the figures quoted in the README.
 */
import { gzipSync } from 'node:zlib'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(pkgRoot, 'dist')

const LAYER_ORDER = '@layer vectis.reset, vectis.tokens, vectis.components, vectis.utilities;'

/** The only classes `styles.css` may carry once the components ship their own sheet. */
const CORE_CLASSES: ReadonlySet<string> = new Set([
  '.v-banner',
  '.v-control',
  '.v-floating',
  '.v-overlay',
  '.v-panel',
  '.v-tone',
  '.v-visually-hidden',
])

function walk(dir: string, ext: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, ext, out)
    else if (entry.name.endsWith(ext)) out.push(full)
  }
  return out
}

const posix = (p: string) => relative(dist, p).replace(/\\/g, '/')
const errors: string[] = []
const fail = (message: string) => errors.push(message)

if (!existsSync(dist)) throw new Error('dist/ is missing — run `pnpm build` first.')

// 1. every SFC carrying a <style> has its sheet in dist, imported by its own module.
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

  // 2. the layer order travels with every component sheet (see shipComponentCss).
  if (name !== 'styles.css' && !source.startsWith(LAYER_ORDER))
    fail(`${name} does not open with the layer order statement.`)

  // 4. no layer name outside the `vectis.*` namespace, in any sheet.
  for (const [, names] of source.matchAll(/@layer\s+([^{;]+)[{;]/g))
    for (const layer of (names ?? '').split(','))
      if (!/^vectis(\.|$)/.test(layer.trim()))
        fail(`${name} declares the layer \`${layer.trim()}\`, outside the vectis namespace.`)
}

// 3. styles.css is the core: shared chrome only, no component rule.
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
  return `${(gzipSync(Buffer.from(source), { level: 9 }).length / 1024).toFixed(2)} kB`
}

// `pnpm --filter @vectis/ui exec tsx scripts/check-css-split.ts --report VButton VInput`
if (process.argv.includes('--report')) {
  const wanted = process.argv.slice(process.argv.indexOf('--report') + 1)
  const picked = sheets.filter((s) => wanted.some((w) => posix(s).endsWith(`/${w}.css`)))
  const missing = wanted.filter((w) => !picked.some((s) => posix(s).endsWith(`/${w}.css`)))
  if (missing.length) console.warn(`Unknown component(s): ${missing.join(', ')}`)
  const bundle = Buffer.concat([Buffer.from(core), ...picked.map((s) => readFileSync(s))])
  console.log(`core + ${picked.length} component(s): ${gzip(bundle)} gzip`)
}
