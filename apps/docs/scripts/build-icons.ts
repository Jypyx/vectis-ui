/**
 * Generates `icons/icons.ts`: the icons the DOCUMENTATION SITE draws and the library does
 * not ship.
 *
 * The library's built-in registry holds the 34 icons its own components render by default.
 * Anything else is the consumer's business — and with no Material Symbols font loaded, an
 * unknown name falls through to the ligature and renders as its own NAME in plain text. The
 * six icons below are the site's chrome, so the site supplies them, through
 * `setIconResolver` (see plugins/vectis.ts).
 *
 * Run with `pnpm --filter vectis-docs icons` — on demand, NOT in a build hook: the list
 * only moves when the site's chrome does, and the build must not depend on the network. The
 * generated file is committed.
 *
 * Same source, same pinned revision and same grid as `packages/ui/scripts/build-icons.ts`,
 * so the two sets are drawn identically: the google/material-design-icons repository,
 * Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24). Apache-2.0 licence © Google.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Pinned revision of the source repository — kept in step with the library's script. */
const REVISION = '528cb964c01fb2b09bc3b9208f82b6d8f8c1c1e2'

/**
 * The site's own icons, and only those: every other name the pages use is already in the
 * library's registry, which the resolver hands back to by answering `undefined`.
 */
const ICONS = [
  'content_copy',
  'dark_mode',
  'light_mode',
  'menu',
  'open_in_new',
  'translate',
  // The home page's six feature cards, one icon each.
  'bolt',
  'public',
  'palette',
  'layers',
  'dns',
  'interests',
  // The home page's accessibility accordion.
  'keyboard',
  'record_voice_over',
  'contrast_square',
  // The pair the Accordion page's icon example swaps, one for the other.
  'add',
  'remove',
] as const

/** Google's export grid — the library's registry shares it, hence no per-icon viewBox. */
const VIEW_BOX = '0 -960 960 960'

const url = (name: string, fill: boolean) =>
  `https://raw.githubusercontent.com/google/material-design-icons/${REVISION}` +
  `/symbols/web/${name}/materialsymbolsrounded/${name}${fill ? '_fill1' : ''}_24px.svg`

/**
 * Extracts the file's single `d`. Fails loudly rather than producing a wrong rendering: a
 * concatenated multi-path SVG would be invalid, and a different viewBox would draw the icon
 * outside the frame.
 */
function pathOf(svg: string, source: string): string {
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1]
  if (viewBox !== VIEW_BOX) {
    throw new Error(`${source}: unexpected viewBox (${viewBox ?? 'missing'}), expected ${VIEW_BOX}`)
  }

  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]!)
  if (paths.length !== 1) {
    throw new Error(
      `${source}: ${paths.length} <path> instead of one — the registry assumes a single path`,
    )
  }
  return paths[0]!
}

async function fetchPath(name: string, fill: boolean): Promise<string | undefined> {
  const source = url(name, fill)
  const response = await fetch(source)
  if (!response.ok) {
    // The FILL 1 variant may be missing for a purely linear icon.
    if (fill && response.status === 404) return undefined
    throw new Error(`${source} : HTTP ${response.status}`)
  }
  return pathOf(await response.text(), source)
}

const entries = await Promise.all(
  ICONS.map(async (name) => {
    const [outline, filled] = await Promise.all([fetchPath(name, false), fetchPath(name, true)])
    // The filled path is emitted ONLY if it changes the geometry.
    return [
      name,
      filled !== undefined && filled !== outline ? [outline!, filled] : [outline!],
    ] as const
  }),
)

const filledCount = entries.filter(([, paths]) => paths.length === 2).length

const ts = `/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate: pnpm --filter vectis-docs icons  ·  Source: scripts/build-icons.ts
 *
 * Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24)
 * google/material-design-icons @ ${REVISION}
 * Apache-2.0 licence © Google.
 */

/**
 * The documentation site's own icons, in the form \`[outline, filled?]\` — the second path
 * exists only where the FILL axis really changes the geometry.
 */
export const docsIcons = {
${entries.map(([name, paths]) => `  ${name}: [${paths.map((d) => `'${d}'`).join(', ')}],`).join('\n')}
} as const satisfies Record<string, readonly [string] | readonly [string, string]>

/** The names this registry answers for. */
export type DocsIconName = keyof typeof docsIcons
`

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
writeFileSync(resolve(appRoot, 'icons/icons.ts'), ts, 'utf8')

console.log(
  `icons: ${entries.length} icons (${filledCount} of them with a FILL variant) → icons/icons.ts`,
)
