import { describe, expect, it } from 'vitest'

import { builtinIcons, ICON_VIEW_BOX, type VectisIconName } from './icons'

/**
 * Verrous sur le fichier GÉNÉRÉ (`pnpm icons`) : ce qui est testé ici, c'est que
 * la génération a bien tourné — pas la géométrie des icônes, qui relève du diff
 * visuel (story `Bibliotheque` + Chromatic).
 */

/** Les icônes que la librairie rend elle-même. Toute entrée retirée d'ici doit
    l'être aussi de `scripts/build-icons.ts` — et inversement. */
const ATTENDUES = [
  'arrow_downward',
  'arrow_drop_down',
  'arrow_drop_up',
  'arrow_upward',
  'calendar_today',
  'check',
  'check_circle',
  'chevron_left',
  'chevron_right',
  'close',
  'error',
  'expand_less',
  'expand_more',
  'info',
  'more_horiz',
  'notifications',
  'schedule',
  'search',
  'swap_vert',
  'warning',
] as const satisfies readonly VectisIconName[]

describe('registre d’icônes intégré', () => {
  it('contient exactement les icônes rendues par défaut par le DS', () => {
    expect(Object.keys(builtinIcons).sort()).toEqual([...ATTENDUES].sort())
  })

  it('expose la grille Material Symbols', () => {
    expect(ICON_VIEW_BOX).toBe('0 -960 960 960')
  })

  it.each(Object.entries(builtinIcons))('%s : paths exploitables', (_nom, paths) => {
    expect(paths.length).toBeGreaterThanOrEqual(1)
    expect(paths.length).toBeLessThanOrEqual(2)
    for (const d of paths) {
      expect(d.length).toBeGreaterThan(0)
      // Tout path SVG commence par un moveto.
      expect(d[0]!.toLowerCase()).toBe('m')
    }
  })

  it('n’émet un path plein que s’il change la géométrie', () => {
    // Sans ce dédoublonnage le registre doublerait pour rien : une majorité des
    // icônes (chevrons, flèches, close, check…) ont FILL 0 et FILL 1 identiques.
    // Le registre est typé en littéraux (`as const`) : sans cet élargissement,
    // TS considère la comparaison impossible et refuse de compiler le test.
    const registre: Record<string, readonly string[]> = builtinIcons
    const doublons = Object.entries(registre).filter(
      ([, paths]) => paths.length === 2 && paths[0] === paths[1],
    )
    expect(doublons).toEqual([])

    // Et le dédoublonnage n'a pas tout écrasé : les icônes pleines existent.
    const avecVariante = Object.values(builtinIcons).filter((paths) => paths.length === 2)
    expect(avecVariante.length).toBeGreaterThan(0)
  })
})
