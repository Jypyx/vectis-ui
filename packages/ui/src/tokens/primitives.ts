/**
 * The raw material: the colour palettes and the numeric scales the whole design system is
 * built out of.
 *
 * Nothing here is used by a component directly. A component asks for "the accent colour"
 * or "the page background", and it is those ROLES, defined alongside this file, that point
 * at a step of a palette. Keeping the two apart is what makes a theme possible at all: a
 * dark theme moves the roles, and never the palette.
 *
 * The colours are written in OKLCH, a way of describing a colour by how bright it LOOKS
 * rather than by how much of each primary it mixes. Two consequences matter here: a step
 * of a palette is as light as the same step of any other, and mixing two of these colours
 * passes through the shades one would expect rather than through grey.
 *
 * The palettes themselves come from Tailwind CSS 4, so that anyone already used to them
 * recognizes the steps; what this file calls neutral is what Tailwind calls gray.
 */
import {
  color,
  cubicBezier,
  dimension,
  duration,
  fontFamily,
  fontWeight,
  shadow,
  type TokenGroup,
} from './types'

const palette = (values: Record<string, string>): TokenGroup =>
  Object.fromEntries(Object.entries(values).map(([step, value]) => [step, color(value)]))

export const primitives = {
  color: {
    white: color('oklch(100% 0 0)'),
    black: color('oklch(0% 0 0)'),
    neutral: palette({
      '50': 'oklch(98.5% 0.002 247.839)',
      '100': 'oklch(96.7% 0.003 264.542)',
      '200': 'oklch(92.8% 0.006 264.531)',
      '300': 'oklch(87.2% 0.01 258.338)',
      '400': 'oklch(70.7% 0.022 261.325)',
      '500': 'oklch(55.1% 0.027 264.364)',
      '600': 'oklch(44.6% 0.03 256.802)',
      '700': 'oklch(37.3% 0.034 259.733)',
      '800': 'oklch(27.8% 0.033 256.848)',
      '900': 'oklch(21% 0.034 264.665)',
      '950': 'oklch(13% 0.028 261.692)',
    }),
    indigo: palette({
      '50': 'oklch(96.2% 0.018 272.314)',
      '100': 'oklch(93% 0.034 272.788)',
      '200': 'oklch(87% 0.065 274.039)',
      '300': 'oklch(78.5% 0.115 274.713)',
      '400': 'oklch(67.3% 0.182 276.935)',
      '500': 'oklch(58.5% 0.233 277.117)',
      '600': 'oklch(51.1% 0.262 276.966)',
      '700': 'oklch(45.7% 0.24 277.023)',
      '800': 'oklch(39.8% 0.195 277.366)',
      '900': 'oklch(35.9% 0.144 278.697)',
      '950': 'oklch(25.7% 0.09 281.288)',
    }),
    red: palette({
      '50': 'oklch(97.1% 0.013 17.38)',
      '100': 'oklch(93.6% 0.032 17.717)',
      '200': 'oklch(88.5% 0.062 18.334)',
      '300': 'oklch(80.8% 0.114 19.571)',
      '400': 'oklch(70.4% 0.191 22.216)',
      '500': 'oklch(63.7% 0.237 25.331)',
      '600': 'oklch(57.7% 0.245 27.325)',
      '700': 'oklch(50.5% 0.213 27.518)',
      '800': 'oklch(44.4% 0.177 26.899)',
      '900': 'oklch(39.6% 0.141 25.723)',
      '950': 'oklch(25.8% 0.092 26.042)',
    }),
    green: palette({
      '50': 'oklch(98.2% 0.018 155.826)',
      '100': 'oklch(96.2% 0.044 156.743)',
      '200': 'oklch(92.5% 0.084 155.995)',
      '300': 'oklch(87.1% 0.15 154.449)',
      '400': 'oklch(79.2% 0.209 151.711)',
      '500': 'oklch(72.3% 0.219 149.579)',
      '600': 'oklch(62.7% 0.194 149.214)',
      '700': 'oklch(52.7% 0.154 150.069)',
      '800': 'oklch(44.8% 0.119 151.328)',
      '900': 'oklch(39.3% 0.095 152.535)',
      '950': 'oklch(26.6% 0.065 152.934)',
    }),
    amber: palette({
      '50': 'oklch(98.7% 0.022 95.277)',
      '100': 'oklch(96.2% 0.059 95.617)',
      '200': 'oklch(92.4% 0.12 95.746)',
      '300': 'oklch(87.9% 0.169 91.605)',
      '400': 'oklch(82.8% 0.189 84.429)',
      '500': 'oklch(76.9% 0.188 70.08)',
      '600': 'oklch(66.6% 0.179 58.318)',
      '700': 'oklch(55.5% 0.163 48.998)',
      '800': 'oklch(47.3% 0.137 46.201)',
      '900': 'oklch(41.4% 0.112 45.904)',
      '950': 'oklch(27.9% 0.077 45.635)',
    }),
  },
  space: {
    '1': dimension('0.25rem'),
    '2': dimension('0.5rem'),
    '3': dimension('0.75rem'),
    '4': dimension('1rem'),
    '5': dimension('1.25rem'),
    '6': dimension('1.5rem'),
    '7': dimension('2rem'),
    '8': dimension('2.5rem'),
    '9': dimension('3rem'),
    '10': dimension('4rem'),
    '11': dimension('5rem'),
    '12': dimension('6rem'),
  },
  font: {
    family: {
      sans: fontFamily(
        "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      ),
      mono: fontFamily(
        "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace",
      ),
      // The icon font, which the library never bundles: an application that wants icons
      // drawn from a font loads it itself, as the README explains. Overriding this one
      // token is what switches the whole system to another cut of Material Symbols.
      icon: fontFamily("'Material Symbols Rounded'"),
    },
    weight: {
      regular: fontWeight('400'),
      medium: fontWeight('500'),
      semibold: fontWeight('600'),
      bold: fontWeight('700'),
    },
    size: {
      xs: dimension('0.75rem'),
      sm: dimension('0.875rem'),
      md: dimension('1rem'),
      lg: dimension('1.125rem'),
      xl: dimension('1.25rem'),
      '2xl': dimension('1.5rem'),
      '3xl': dimension('1.875rem'),
      '4xl': dimension('2.25rem'),
      '5xl': dimension('3rem'),
    },
    leading: {
      none: dimension('1'),
      tight: dimension('1.25'),
      snug: dimension('1.4'),
      normal: dimension('1.5'),
      relaxed: dimension('1.65'),
    },
    tracking: {
      tight: dimension('-0.015em', 'Tightening for large sizes (display, the top headings)'),
      wide: dimension('0.05em', 'Letter spacing for all-caps micro labels (overline)'),
    },
  },
  radius: {
    xs: dimension('0.125rem'),
    sm: dimension('0.25rem'),
    md: dimension('0.375rem'),
    lg: dimension('0.5rem'),
    xl: dimension('0.75rem'),
    '2xl': dimension('1rem'),
    full: dimension('9999px'),
  },
  shadow: {
    '1': shadow('0 1px 2px 0 oklch(0% 0 0 / 0.05)'),
    '2': shadow('0 1px 3px 0 oklch(0% 0 0 / 0.1), 0 1px 2px -1px oklch(0% 0 0 / 0.1)'),
    '3': shadow('0 4px 6px -1px oklch(0% 0 0 / 0.1), 0 2px 4px -2px oklch(0% 0 0 / 0.1)'),
    '4': shadow('0 10px 15px -3px oklch(0% 0 0 / 0.1), 0 4px 6px -4px oklch(0% 0 0 / 0.1)'),
    '5': shadow('0 20px 25px -5px oklch(0% 0 0 / 0.1), 0 8px 10px -6px oklch(0% 0 0 / 0.1)'),
  },
  duration: {
    fast: duration('120ms'),
    base: duration('180ms'),
    slow: duration('300ms'),
  },
  ease: {
    default: cubicBezier('cubic-bezier(0.2, 0, 0, 1)'),
    in: cubicBezier('cubic-bezier(0.5, 0, 1, 1)'),
    out: cubicBezier('cubic-bezier(0, 0, 0.2, 1)'),
    'in-out': cubicBezier(
      'cubic-bezier(0.4, 0, 0.2, 1)',
      'Symmetric: both the start and the end are eased. Looping animations that cross the track (an indeterminate VProgressLinear).',
    ),
  },
} satisfies TokenGroup
