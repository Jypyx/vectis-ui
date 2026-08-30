/**
 * Generates `src/components/VIcon/icons.ts`: the SVG paths of the icons the DS
 * renders ITSELF by default, exact replicas of Material Symbols Rounded
 * (wght 400 · GRAD 0 · opsz 24). This registry is what makes the design system
 * usable with no icon font at all.
 *
 * Run with `pnpm icons` — on demand, NOT in prebuild: the list below only moves
 * when a component gains a new default, and the build must not depend on the
 * network (the generated file is committed).
 *
 * Source: the google/material-design-icons repository, at a pinned revision
 * (REVISION). Apache-2.0 licence © Google.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderIconsModules } from './lib/icons-module'

/** Pinned revision of the source repository (2026-07-24). */
const REVISION = '528cb964c01fb2b09bc3b9208f82b6d8f8c1c1e2'

/**
 * The icons the library renders by default — and only those: anything the
 * consumer passes in is THEIR icon source's business. Add a name here when a
 * component starts rendering a new icon by default.
 */
const ICONS = [
  'arrow_downward',
  'arrow_downward_alt',
  'arrow_drop_down',
  'arrow_drop_up',
  'arrow_left_alt',
  'arrow_right_alt',
  'arrow_upward',
  'arrow_upward_alt',
  'attach_file',
  'audio_file',
  'calendar_today',
  'check',
  'check_circle',
  'chevron_left',
  'chevron_right',
  'close',
  'cloud_upload',
  'code',
  'description',
  'error',
  'expand_less',
  'expand_more',
  'folder_zip',
  'image',
  'info',
  'more_horiz',
  'notifications',
  'picture_as_pdf',
  'schedule',
  'search',
  'swap_vert',
  'table_chart',
  'video_file',
  'warning',
] as const

/** Google's export grid — the registry shares it, it is not repeated per icon. */
const VIEW_BOX = '0 -960 960 960'

const url = (name: string, fill: boolean) =>
  `https://raw.githubusercontent.com/google/material-design-icons/${REVISION}` +
  `/symbols/web/${name}/materialsymbolsrounded/${name}${fill ? '_fill1' : ''}_24px.svg`

/**
 * Extracts the file's single `d`. Fails loudly rather than producing a wrong
 * rendering: a concatenated multi-path SVG would be invalid, and a different
 * viewBox would draw the icon outside the frame.
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
    // The filled path is emitted ONLY if it changes the geometry: most icons
    // (chevrons, arrows, close, check…) have identical FILL 0 and FILL 1.
    return [
      name,
      filled !== undefined && filled !== outline ? [outline!, filled] : [outline!],
    ] as const
  }),
)

const filledCount = entries.filter(([, paths]) => paths.length === 2).length

const files = renderIconsModules(REVISION, VIEW_BOX, entries)

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(pkgRoot, 'src/components/VIcon/icons')

// Wiped rather than written over: an icon dropped from ICONS would otherwise leave its
// module behind, still importable and still shipped, with nothing to point it out.
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })
for (const [name, source] of Object.entries(files))
  writeFileSync(resolve(outDir, name), source, 'utf8')

console.log(
  `icons: ${entries.length} icons (${filledCount} of them with a FILL variant) → ` +
    `src/components/VIcon/icons/ (${Object.keys(files).length} modules)`,
)
