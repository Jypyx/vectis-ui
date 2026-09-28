/**
 * Gate built gzip sizes against the committed baseline. Shared CSS increases the core
 * downloaded by every consumer, so compare core and total-size deltas.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { formatKb, gzipBytes, gzipTogether, importClosure, posix, walk } from './lib/measure'

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(pkgRoot, 'dist')
const baselinePath = resolve(pkgRoot, 'bench/size-baseline.json')

interface Baseline {
  /** How much a figure may grow before the run is red, as a fraction. */
  tolerance: number
  /** A growth this small is never reported, whatever the percentage says. */
  minBytes: number
  entries: Record<string, number>
}

/** The default floor for a baseline written before `minBytes` existed. */
const DEFAULT_MIN_BYTES = 128

const update = process.argv.includes('--update')
const asJson = process.argv.includes('--json')

if (!existsSync(dist)) throw new Error('dist/ is missing — run `pnpm build` first.')

const measured: Record<string, number> = {}

// Measure both core styles.css and the concatenation of all component sheets.
const coreCss = join(dist, 'styles.css')
const sheets = walk(dist, '.css')
measured['core.css'] = gzipBytes(readFileSync(coreCss))
measured['all.css'] = gzipTogether(sheets)

// Importing the barrel pulls every component in, so this is the ceiling: what a consumer
// pays who tree-shakes nothing.
measured['library.js'] = gzipTogether(importClosure(join(dist, 'index.js')).js)

// One row per component sheet. A sheet's sibling module is the component's entry point, which a
// consumer actually imports.
for (const sheet of sheets) {
  const name = posix(dist, sheet)
  if (name === 'styles.css') continue

  const stem = name.slice(0, -'.css'.length)
  const component = stem.slice(stem.lastIndexOf('/') + 1)
  measured[`${component}.css`] = gzipBytes(readFileSync(sheet))

  const entry = join(dist, `${stem}.js`)
  if (existsSync(entry)) measured[`${component}.js`] = gzipTogether(importClosure(entry).js)
}

if (asJson) {
  console.log(JSON.stringify(measured, null, 2))
  process.exit(0)
}

if (update || !existsSync(baselinePath)) {
  const previous = existsSync(baselinePath) ? loadBaseline() : undefined
  const next: Baseline = {
    tolerance: previous?.tolerance ?? 0.02,
    minBytes: previous?.minBytes ?? DEFAULT_MIN_BYTES,
    entries: measured,
  }
  mkdirSync(dirname(baselinePath), { recursive: true })
  writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  console.log(
    `size baseline written — ${Object.keys(measured).length} entries, ` +
      `core ${formatKb(measured['core.css']!)} gzip.`,
  )
  process.exit(0)
}

const baseline = loadBaseline()
const regressions: string[] = []
const added: string[] = []
const removed = Object.keys(baseline.entries).filter((key) => !(key in measured))

for (const [key, bytes] of Object.entries(measured)) {
  const before = baseline.entries[key]
  if (before === undefined) {
    added.push(`${key} (${formatKb(bytes)})`)
    continue
  }
  // Both ceilings have to be cleared: the relative one catches a drift on a big entry, the
  // absolute floor keeps a shared import entering a small closure from shouting about it.
  const minBytes = baseline.minBytes ?? DEFAULT_MIN_BYTES
  const limit = Math.max(Math.ceil(before * (1 + baseline.tolerance)), before + minBytes)
  if (bytes > limit) {
    const growth = (((bytes - before) / before) * 100).toFixed(1)
    regressions.push(
      `${key}: ${formatKb(before)} → ${formatKb(bytes)} (+${growth} %, ceiling ${formatKb(limit)})`,
    )
  }
}

// A headline line on every run, so the figures are in the build log whether or not anything
// moved; that is what makes them quotable without running the script by hand.
console.log(
  `size OK — core ${formatKb(measured['core.css']!)}, ` +
    `all sheets ${formatKb(measured['all.css']!)}, ` +
    `whole library JS ${formatKb(measured['library.js']!)} (gzip).`,
)

if (added.length > 0) console.log(`  new, unmeasured: ${added.join(', ')}`)
if (removed.length > 0) console.log(`  gone since the baseline: ${removed.join(', ')}`)

if (regressions.length > 0) {
  console.error(
    `\nsize regression (${regressions.length}), past ${baseline.tolerance * 100} % ` +
      `and ${baseline.minBytes ?? DEFAULT_MIN_BYTES} bytes:`,
  )
  for (const line of regressions) console.error(`  - ${line}`)
  console.error(
    '\nIf the growth is intended, re-baseline deliberately:\n' +
      '  pnpm --filter vectis-ui exec tsx scripts/bench-size.ts --update',
  )
  process.exit(1)
}

function loadBaseline(): Baseline {
  return JSON.parse(readFileSync(baselinePath, 'utf8')) as Baseline
}
