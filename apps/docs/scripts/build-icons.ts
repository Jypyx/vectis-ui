/**
 * Generate site-owned icons on demand from the pinned Material Symbols Rounded source. Builds
 * use the committed registry without network access. Source: google/material-design-icons,
 * Apache-2.0, © Google.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Pinned revision of the source repository; kept in step with the library's script. */
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
  'bolt',
  'public',
  'palette',
  'layers',
  'dns',
  'interests',
  'keyboard',
  'record_voice_over',
  'contrast_square',
  'add',
  'remove',
  // The theme builder's preview, beyond the library's own icons.
  'home',
  'settings',
  'person',
  'group',
  'folder',
  'mail',
  'edit',
  'delete',
  'download',
  'logout',
  'bar_chart',
  'dashboard',
  'favorite',
] as const

/** Google's export grid; the library's registry shares it, hence no per-icon viewBox. */
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
    if (fill && response.status === 404) return undefined
    throw new Error(`${source} : HTTP ${response.status}`)
  }
  return pathOf(await response.text(), source)
}

const entries = await Promise.all(
  ICONS.map(async (name) => {
    const [outline, filled] = await Promise.all([fetchPath(name, false), fetchPath(name, true)])
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
