/**
 * The measurement helpers shared by `check-css-split.ts` and `bench-size.ts`.
 *
 * They were module-local to the CSS check until a second script needed the same three
 * things — walking `dist`, naming a file relative to it, and weighing it gzipped. The
 * admission rule is the one `utils/` uses: two consumers and a genuinely common body.
 *
 * Everything here reads the ARTEFACT, never the source. A figure taken from `src` would
 * measure something no consumer downloads.
 */
import { gzipSync } from 'node:zlib'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

/** Every file under `dir` whose name ends in `ext`, depth first. */
export function walk(dir: string, ext: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, ext, out)
    else if (entry.name.endsWith(ext)) out.push(full)
  }
  return out
}

/**
 * A path named relative to `root`, with forward slashes.
 *
 * The separator is normalized because these names are printed, compared against a
 * committed baseline and matched against component names — on Windows the native
 * backslash would make every one of those three disagree with CI.
 */
export function posix(root: string, path: string): string {
  return relative(root, path).replace(/\\/g, '/')
}

/**
 * The gzipped size in bytes, at level 9.
 *
 * The level is not incidental: it is what `check-css-split.ts` has always reported, so
 * changing it would silently move every figure the README and the docs site quote.
 */
export function gzipBytes(source: string | Buffer): number {
  return gzipSync(Buffer.from(source), { level: 9 }).length
}

/** The same figure, written the way the reports print it. */
export function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(2)} kB`
}

/**
 * The static import specifiers of one emitted module.
 *
 * `preserveModules` means every import in `dist` is relative and static — there is no
 * dynamic `import()` and no bare specifier but `vue`, which is external. So a regex is
 * enough here and a parser would buy nothing.
 */
const IMPORT_RE = /(?:^|\n)\s*import\s+(?:[^'"]*?\s+from\s+)?['"](\.[^'"]+)['"]/g

/**
 * Every module a consumer downloads when they import `entry`, the entry included.
 *
 * This is what makes a per-component figure honest under `preserveModules`. A component's
 * own `VX.js` is a stub — 275 bytes of CSS import and a re-export — while its real code
 * sits in the `VX.vue_vue_type_script_setup_true_lang.js` sibling it imports. Weighing the
 * stub alone would report a quarter of a kilobyte for every component in the library.
 *
 * Returns absolute paths, split by kind, so CSS and JS can be reported separately.
 */
export function importClosure(entry: string): { js: string[]; css: string[] } {
  const js = new Set<string>()
  const css = new Set<string>()
  const queue = [resolve(entry)]

  while (queue.length > 0) {
    const file = queue.pop()!
    if (js.has(file)) continue
    js.add(file)

    let source: string
    try {
      source = readFileSync(file, 'utf8')
    } catch {
      // A specifier that does not resolve on disk is a broken artefact, which is
      // `check-css-split.ts`'s subject, not this one's. Skip it rather than throw.
      continue
    }

    for (const [, specifier] of source.matchAll(IMPORT_RE)) {
      const target = resolve(dirname(file), specifier!)
      if (target.endsWith('.css')) css.add(target)
      else queue.push(target)
    }
  }

  return { js: [...js], css: [...css] }
}

/**
 * The gzipped weight of a set of files measured TOGETHER, as a bundler would ship them.
 *
 * Concatenating before compressing is the point: gzip finds repetition across the whole
 * payload, so summing each file's own gzipped size would over-count a component by
 * roughly the redundancy its modules share.
 */
export function gzipTogether(files: readonly string[]): number {
  if (files.length === 0) return 0
  return gzipBytes(Buffer.concat([...files].sort().map((f) => readFileSync(f))))
}
