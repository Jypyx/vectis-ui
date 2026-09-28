/** Measure built output: source size does not represent what consumers download. */
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

/** A path named relative to `root`, with forward slashes. */
export function posix(root: string, path: string): string {
  return relative(root, path).replace(/\\/g, '/')
}

/**
 * The gzipped size in bytes, at level 9.
 *
 * The level is not incidental: it is what `check-css-split.ts` has always reported, so
 * changing it would silently move every figure the docs site quotes.
 */
export function gzipBytes(source: string | Buffer): number {
  return gzipSync(Buffer.from(source), { level: 9 }).length
}

/** The same figure, written the way the reports print it. */
export function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(2)} kB`
}

/** The static import specifiers of one emitted module. */
const IMPORT_RE = /(?:^|\n)\s*import\s+(?:[^'"]*?\s+from\s+)?['"](\.[^'"]+)['"]/g

/** Every module a consumer downloads when they import `entry`, the entry included. */
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
 * Concatenating before compressing is the point: gzip finds repetition across the whole
 * payload, so summing each file's own gzipped size would over-count a component by roughly the
 * redundancy its modules share.
 */
export function gzipTogether(files: readonly string[]): number {
  if (files.length === 0) return 0
  return gzipBytes(Buffer.concat([...files].sort().map((f) => readFileSync(f))))
}
