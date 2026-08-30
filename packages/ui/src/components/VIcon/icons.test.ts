import { describe, expect, it } from 'vitest'

import { builtinIconNames, builtinIcons, ICON_VIEW_BOX, type VectisIconName } from './icons'

/**
 * Locks on the GENERATED file (`pnpm icons`): what is tested here is that the
 * generation ran correctly — not the icons' geometry, which belongs to visual
 * diffing (the `Library` story + Chromatic).
 */

/** The icons the library renders itself. Any entry removed from here must also be
    removed from `scripts/build-icons.ts` — and the other way round. */
const EXPECTED = [
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
] as const satisfies readonly VectisIconName[]

describe('built-in icon registry', () => {
  it('contains exactly the icons the DS renders by default', () => {
    expect(Object.keys(builtinIcons).sort()).toEqual([...EXPECTED].sort())
  })

  it('exposes the Material Symbols grid', () => {
    expect(ICON_VIEW_BOX).toBe('0 -960 960 960')
  })

  it.each(Object.entries(builtinIcons))('%s : paths exploitables', (_nom, icon) => {
    expect(icon.paths.length).toBeGreaterThanOrEqual(1)
    expect(icon.paths.length).toBeLessThanOrEqual(2)
    for (const d of icon.paths) {
      expect(d.length).toBeGreaterThan(0)
      // Every SVG path starts with a moveto.
      expect(d[0]!.toLowerCase()).toBe('m')
    }
  })

  it.each(Object.entries(builtinIcons))('%s : porte son propre nom', (nom, icon) => {
    // The name travelling with the drawing is what reaches the consumer's resolver —
    // a component imports the binding and never restates the name. A generator slip
    // here would route the resolver to the wrong icon with nothing to show for it.
    expect(icon.name).toBe(nom)
  })

  it('expose le jeu de noms seul, aligné sur le registre', () => {
    // `classIconResolver` asks the SET rather than the icons, so that a consumer who
    // wired in their own library ships no Material path at all. The two are generated
    // side by side, and nothing else would notice them drifting apart.
    expect([...builtinIconNames].sort()).toEqual(Object.keys(builtinIcons).sort())
  })

  it('emits a filled path only when it changes the geometry', () => {
    // Without that de-duplication the registry would double for nothing: most
    // icons (chevrons, arrows, close, check…) have identical FILL 0 and FILL 1.
    // The registry is typed in literals (`as const`): without this widening, TS
    // considers the comparison impossible and refuses to compile the test.
    const registre: Record<string, { readonly paths: readonly string[] }> = builtinIcons
    const doublons = Object.entries(registre).filter(
      ([, { paths }]) => paths.length === 2 && paths[0] === paths[1],
    )
    expect(doublons).toEqual([])

    // And the de-duplication did not flatten everything: the filled icons exist.
    const avecVariante = Object.values(builtinIcons).filter((icon) => icon.paths.length === 2)
    expect(avecVariante.length).toBeGreaterThan(0)
  })
})
