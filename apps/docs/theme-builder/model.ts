/**
 * What the builder lets one choose, and how the choice becomes token values. The reference
 * for every colour role is the library's own token tree: a preset swaps the hue a role points
 * at.
 */
import { tokens } from 'vectis-ui/tokens'

import { contrastRatio, deriveColor, parseColor, type Oklch } from './color'
import {
  ACCENT_HUES,
  NEUTRAL_HUES,
  ramps,
  type AccentHue,
  type NeutralHue,
  type Ramp,
} from './palettes'
import {
  BASE_SIZES,
  RADIUS_PRESETS,
  type BaseSize,
  type IconLibraryId,
  type RadiusPresetId,
} from './options'

import type { DesignToken, TokenGroup } from 'vectis-ui/tokens'

export type Scheme = 'light' | 'dark'
export const SCHEMES: Scheme[] = ['light', 'dark']

export type Tone = 'accent' | 'danger' | 'success' | 'warning'
export type ColorGroup = Tone | 'neutral'
export const COLOR_GROUPS: ColorGroup[] = ['accent', 'neutral', 'danger', 'success', 'warning']

/** The roles each group paints. `focus-ring` stands for `--vectis-focus-ring-color`. */
export const GROUP_ROLES: Record<ColorGroup, string[]> = {
  accent: [
    'accent',
    'accent-hover',
    'accent-active',
    'accent-surface',
    'accent-border',
    'accent-text',
    'focus-ring',
  ],
  danger: [
    'danger',
    'danger-hover',
    'danger-active',
    'danger-surface',
    'danger-border',
    'danger-text',
  ],
  success: [
    'success',
    'success-hover',
    'success-active',
    'success-surface',
    'success-border',
    'success-text',
  ],
  warning: [
    'warning',
    'warning-hover',
    'warning-active',
    'warning-surface',
    'warning-border',
    'warning-text',
  ],
  neutral: [
    'surface',
    'surface-muted',
    'surface-raised',
    'surface-overlay',
    'surface-sunken',
    'surface-inverse',
    'surface-skeleton',
    'text',
    'text-muted',
    'text-subtle',
    'text-on-inverse',
    'text-on-warning',
    'border',
    'border-strong',
  ],
}

export const cssNameOf = (role: string) =>
  role === 'focus-ring' ? '--vectis-focus-ring-color' : `--vectis-color-${role}`

/** What a role points at in the library: a step of a ramp, white, or a literal colour. */
type Reference = { hue: string; step: keyof Ramp } | { literal: Oklch }

const STEP_RE = /^\{color\.([a-z]+)\.(\d+)\}$/

function tokenAt(group: TokenGroup | undefined, key: string): DesignToken | undefined {
  return group?.[key] as DesignToken | undefined
}

function referenceOf(scheme: Scheme, role: string): Reference {
  const [lightGroup, darkGroup, key] =
    role === 'focus-ring'
      ? [tokens.semantic.focus, tokens.themes.dark.focus, 'ring-color']
      : [tokens.semantic.color, tokens.themes.dark.color, role]
  const token =
    (scheme === 'dark' ? tokenAt(darkGroup as TokenGroup, key) : undefined) ??
    tokenAt(lightGroup as TokenGroup, key)!
  const value = token.$value
  const step = STEP_RE.exec(value)
  if (step) return { hue: step[1]!, step: step[2] as keyof Ramp }
  if (value === '{color.white}') return { literal: { l: 1, c: 0, h: 0 } }
  return { literal: parseColor(value)! }
}

function colorOf(reference: Reference, hue?: string): Oklch {
  if ('literal' in reference) return reference.literal
  const ramp = ramps[(hue ?? reference.hue) as keyof typeof ramps]
  return parseColor(ramp[reference.step])!
}

/** The library's default colour of every role, per scheme. */
export const DEFAULT_COLORS: Record<Scheme, Record<string, Oklch>> = Object.fromEntries(
  SCHEMES.map((scheme) => [
    scheme,
    Object.fromEntries(
      COLOR_GROUPS.flatMap((group) => GROUP_ROLES[group]).map((role) => [
        role,
        colorOf(referenceOf(scheme, role)),
      ]),
    ),
  ]),
) as Record<Scheme, Record<string, Oklch>>

const WHITE: Oklch = { l: 1, c: 0, h: 0 }
const STEPS = Object.keys(ramps.indigo) as (keyof Ramp)[]

/** The first step at or after `from` whose colour reaches `ratio` against `against`. */
function stepReaching(ramp: Ramp, from: keyof Ramp, against: Oklch, ratio: number): number {
  let index = STEPS.indexOf(from)
  while (
    index < STEPS.length - 1 &&
    contrastRatio(against, parseColor(ramp[STEPS[index]!])!) < ratio
  )
    index++
  return index
}

/**
 * An accent preset keeps the library's steps, moved darker as a block when white text on the
 * solid colour would fall under 4.5:1: sky or emerald at 600 are too light for it. The focus
 * ring moves on its own until it reaches 3:1 against the page.
 */
function accentPreset(hue: AccentHue, scheme: Scheme): Record<string, Oklch> {
  const ramp = ramps[hue]
  const solid = referenceOf(scheme, 'accent') as { hue: string; step: keyof Ramp }
  const shift = stepReaching(ramp, solid.step, WHITE, 4.5) - STEPS.indexOf(solid.step)
  const surface = DEFAULT_COLORS[scheme].surface!

  return Object.fromEntries(
    GROUP_ROLES.accent.map((role) => {
      const reference = referenceOf(scheme, role)
      if ('literal' in reference) return [role, reference.literal]
      const index =
        role === 'focus-ring'
          ? stepReaching(ramp, reference.step, surface, 3)
          : STEPS.indexOf(reference.step) +
            (['accent', 'accent-hover', 'accent-active'].includes(role) ? shift : 0)
      return [role, parseColor(ramp[STEPS[Math.min(index, STEPS.length - 1)]!])!]
    }),
  )
}

/** A neutral preset swaps gray for another ramp; the dark sunken literal is re-tinted. */
function neutralPreset(hue: NeutralHue, scheme: Scheme): Record<string, Oklch> {
  const from = parseColor(ramps.gray['950'])!
  const to = parseColor(ramps[hue]['950'])!
  return Object.fromEntries(
    GROUP_ROLES.neutral.map((role) => {
      const reference = referenceOf(scheme, role)
      if (!('literal' in reference)) return [role, colorOf(reference, hue)]
      return [
        role,
        reference.literal.c === 0 ? reference.literal : deriveColor(to, reference.literal, from),
      ]
    }),
  )
}

export interface ThemeConfig {
  version: 2
  colors: { accent: AccentHue; neutral: NeutralHue }
  fonts: { heading: string; body: string; code: string }
  icons: IconLibraryId
  baseSize: BaseSize
  radius: RadiusPresetId
}

/** The colours a preset gives each group, per scheme. */
export function presetColors(
  accent: AccentHue,
  neutral: NeutralHue,
  scheme: Scheme,
): Record<string, Oklch> {
  return {
    ...DEFAULT_COLORS[scheme],
    ...accentPreset(accent, scheme),
    ...neutralPreset(neutral, scheme),
  }
}

/** The colour of every role for a configuration and a scheme. */
export const resolveColors = (config: ThemeConfig, scheme: Scheme): Record<string, Oklch> =>
  presetColors(config.colors.accent, config.colors.neutral, scheme)

export const DEFAULT_CONFIG: ThemeConfig = {
  version: 2,
  colors: { accent: ACCENT_HUES[0], neutral: NEUTRAL_HUES[0] },
  fonts: { heading: 'system', body: 'system', code: 'system' },
  icons: 'material-rounded',
  baseSize: 16,
  radius: 'medium',
}

/** Whether a stored value still has the shape this version reads; anything else is dropped. */
export function isThemeConfig(value: unknown): value is ThemeConfig {
  const config = value as ThemeConfig | null
  return (
    config?.version === 2 &&
    (ACCENT_HUES as readonly string[]).includes(config.colors?.accent) &&
    (NEUTRAL_HUES as readonly string[]).includes(config.colors?.neutral) &&
    (BASE_SIZES as readonly number[]).includes(config.baseSize) &&
    Object.hasOwn(RADIUS_PRESETS, config.radius)
  )
}
