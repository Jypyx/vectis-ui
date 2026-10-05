import { describe, expect, it } from 'vitest'

import { builtinIconNames, builtinIcons, ICON_VIEW_BOX, type IconName } from './icons'

/**
 * Locks on the GENERATED file (`pnpm icons`): what is tested here is that the generation ran
 * correctly; not the icons' geometry, which belongs to visual diffing (the `Library` story +
 * Chromatic).
 */

/**
 * The icons the library renders itself. Any entry removed from here must also be removed from
 * `scripts/build-icons.ts`; and the other way round.
 */
const EXPECTED = [
  'add',
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
  'first_page',
  'folder_zip',
  'image',
  'inbox',
  'info',
  'last_page',
  'more_horiz',
  'notifications',
  'picture_as_pdf',
  'remove',
  'schedule',
  'search',
  'search_off',
  'swap_vert',
  'table_chart',
  'video_file',
  'warning',
] as const satisfies readonly IconName[]

describe('built-in icon registry', () => {
  it('contains exactly the icons the DS renders by default', () => {
    expect(Object.keys(builtinIcons).sort()).toEqual([...EXPECTED].sort())
  })

  it('exposes the Material Symbols grid', () => {
    expect(ICON_VIEW_BOX).toBe('0 -960 960 960')
  })

  it.each(Object.entries(builtinIcons))('%s: usable paths', (_name, icon) => {
    expect(icon.paths.length).toBeGreaterThanOrEqual(1)
    expect(icon.paths.length).toBeLessThanOrEqual(2)
    for (const d of icon.paths) {
      expect(d.length).toBeGreaterThan(0)
      expect(d[0]!.toLowerCase()).toBe('m')
    }
  })

  it.each(Object.entries(builtinIcons))('%s: carries its own name', (name, icon) => {
    // The name travelling with the drawing is what reaches the consumer's resolver; a component
    // imports the binding and never restates the name. A generator slip here would route the
    // resolver to the wrong icon with nothing to show for it.
    expect(icon.name).toBe(name)
  })

  it('exposes the name set alone, aligned with the registry', () => {
    expect([...builtinIconNames].sort()).toEqual(Object.keys(builtinIcons).sort())
  })

  it('emits a filled path only when it changes the geometry', () => {
    // Without that de-duplication the registry would double for nothing: most
    // icons (chevrons, arrows, close, check…) have identical FILL 0 and FILL 1.
    // The registry is typed in literals (`as const`): without this widening, TS
    // considers the comparison impossible and refuses to compile the test.
    const registry: Record<string, { readonly paths: readonly string[] }> = builtinIcons
    const duplicates = Object.entries(registry).filter(
      ([, { paths }]) => paths.length === 2 && paths[0] === paths[1],
    )
    expect(duplicates).toEqual([])

    const withFilled = Object.values(builtinIcons).filter((icon) => icon.paths.length === 2)
    expect(withFilled.length).toBeGreaterThan(0)
  })
})
