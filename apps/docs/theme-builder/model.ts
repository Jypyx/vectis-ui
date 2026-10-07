/**
 * What the builder lets one choose, and how the choice becomes token values. The reference
 * for every colour role is the library's own token tree: a preset swaps the hue a role points
 * at, and the custom mode re-centres the same ramp on a colour of one's own.
 */
import { tokens } from 'vectis-ui/tokens'

import { contrastRatio, deriveColor, formatOklch, parseColor, type Oklch } from './color'
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
  type RadiusRole,
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

export interface SchemeColors {
  /** The base colour, as `oklch()`. */
  base: string
  /** Roles set by hand, which win over the derived values. */
  overrides: Record<string, string>
}

export type CustomColors = Record<ColorGroup, Record<Scheme, SchemeColors>>

export interface ThemeConfig {
  version: 1
  colors: {
    mode: 'preset' | 'custom'
    accent: AccentHue
    neutral: NeutralHue
    /**
     * Seeded from the `accent` and `neutral` preset on entering the custom mode, whose ramps
     * the custom colours are then derived from.
     */
    custom: CustomColors
    /** Whether the custom colours were edited since they were seeded. */
    edited: boolean
  }
  fonts: { heading: string; body: string; code: string }
  icons: IconLibraryId
  baseSize: BaseSize
  radius: {
    mode: 'preset' | 'custom'
    preset: RadiusPresetId
    custom: Record<RadiusRole, number>
  }
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

/** Custom colours seeded from a preset: its solid tones and its neutral 500 as bases. */
export function seedCustom(accent: AccentHue, neutral: NeutralHue): CustomColors {
  const entry = (group: ColorGroup) =>
    Object.fromEntries(
      SCHEMES.map((scheme) => {
        const base =
          group === 'neutral'
            ? parseColor(ramps[neutral]['500'])!
            : presetColors(accent, neutral, scheme)[group]!
        return [scheme, { base: formatOklch(base), overrides: {} }]
      }),
    ) as Record<Scheme, SchemeColors>
  return Object.fromEntries(COLOR_GROUPS.map((group) => [group, entry(group)])) as CustomColors
}

/**
 * The colour a custom base stands for in the preset it was seeded from: the solid tone, or the
 * neutral 500 step. Deriving from that preset's own ramp means an untouched base reproduces it.
 */
function pivotOf(config: ThemeConfig, group: ColorGroup, scheme: Scheme): Oklch {
  const { accent, neutral } = config.colors
  return group === 'neutral'
    ? parseColor(ramps[neutral]['500'])!
    : presetColors(accent, neutral, scheme)[group]!
}

/** Every role of a group, derived from its base and then overridden. */
export function customGroupColors(
  config: ThemeConfig,
  group: ColorGroup,
  scheme: Scheme,
): Record<string, Oklch> {
  const { accent, neutral, custom } = config.colors
  const colors = custom[group][scheme]
  const references = presetColors(accent, neutral, scheme)
  const pivot = pivotOf(config, group, scheme)
  const base = parseColor(colors.base) ?? pivot
  return Object.fromEntries(
    GROUP_ROLES[group].map((role) => {
      const override = parseColor(colors.overrides[role])
      return [role, override ?? deriveColor(base, references[role]!, pivot)]
    }),
  )
}

/** The colour of every role for a configuration and a scheme. */
export function resolveColors(config: ThemeConfig, scheme: Scheme): Record<string, Oklch> {
  const { colors } = config
  if (colors.mode === 'preset') return presetColors(colors.accent, colors.neutral, scheme)
  return Object.assign(
    {},
    ...COLOR_GROUPS.map((group) => customGroupColors(config, group, scheme)),
  ) as Record<string, Oklch>
}

export interface ContrastIssue {
  scheme: Scheme
  group: ColorGroup
  /** The foreground and background roles, `on-accent` standing for white text. */
  foreground: string
  background: string
  ratio: number
  required: number
}

const PAIRS: { group: ColorGroup; foreground: string; background: string; required: number }[] = [
  ...(['accent', 'danger', 'success'] as const).flatMap((tone) => [
    { group: tone, foreground: 'text-on-accent', background: tone, required: 4.5 },
    { group: tone, foreground: `${tone}-text`, background: 'surface', required: 4.5 },
    { group: tone, foreground: `${tone}-text`, background: `${tone}-surface`, required: 4.5 },
  ]),
  { group: 'warning', foreground: 'text-on-warning', background: 'warning', required: 4.5 },
  { group: 'warning', foreground: 'warning-text', background: 'surface', required: 4.5 },
  { group: 'warning', foreground: 'warning-text', background: 'warning-surface', required: 4.5 },
  { group: 'accent', foreground: 'focus-ring', background: 'surface', required: 3 },
  { group: 'neutral', foreground: 'text', background: 'surface', required: 4.5 },
  { group: 'neutral', foreground: 'text-muted', background: 'surface', required: 4.5 },
  { group: 'neutral', foreground: 'text-muted', background: 'surface-muted', required: 4.5 },
  { group: 'neutral', foreground: 'text-on-inverse', background: 'surface-inverse', required: 4.5 },
]

/** The pairs below WCAG AA in each scheme. Text on accent is white in every theme. */
export function contrastIssues(config: ThemeConfig): ContrastIssue[] {
  return SCHEMES.flatMap((scheme) => {
    const colors: Record<string, Oklch> = {
      ...resolveColors(config, scheme),
      'text-on-accent': WHITE,
    }
    return PAIRS.flatMap((pair) => {
      const ratio = contrastRatio(colors[pair.foreground]!, colors[pair.background]!)
      return ratio < pair.required ? [{ ...pair, scheme, ratio }] : []
    })
  })
}

export const DEFAULT_CONFIG: ThemeConfig = {
  version: 1,
  colors: {
    mode: 'preset',
    accent: ACCENT_HUES[0],
    neutral: NEUTRAL_HUES[0],
    custom: seedCustom(ACCENT_HUES[0], NEUTRAL_HUES[0]),
    edited: false,
  },
  fonts: { heading: 'system', body: 'system', code: 'system' },
  icons: 'material-rounded',
  baseSize: 16,
  radius: { mode: 'preset', preset: 'medium', custom: { ...RADIUS_PRESETS.medium } },
}

/** Whether a stored value still has the shape this version reads; anything else is dropped. */
export function isThemeConfig(value: unknown): value is ThemeConfig {
  const config = value as ThemeConfig | null
  return (
    config?.version === 1 &&
    (ACCENT_HUES as readonly string[]).includes(config.colors?.accent) &&
    (NEUTRAL_HUES as readonly string[]).includes(config.colors?.neutral) &&
    COLOR_GROUPS.every((group) =>
      SCHEMES.every((s) => typeof config.colors.custom?.[group]?.[s]?.base === 'string'),
    ) &&
    (BASE_SIZES as readonly number[]).includes(config.baseSize) &&
    config.radius?.preset in RADIUS_PRESETS
  )
}

/** The radius of each role in pixels. */
export function resolveRadius(config: ThemeConfig): Record<RadiusRole, number> {
  return config.radius.mode === 'preset'
    ? RADIUS_PRESETS[config.radius.preset]
    : config.radius.custom
}
