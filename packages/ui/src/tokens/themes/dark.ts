/**
 * The dark theme.
 *
 * It restates the tokens that describe a ROLE — the page's background, the colour of
 * ordinary text, the accent — and never the palette those roles draw from. The palette is
 * the same in both themes; what changes is which step of it each role points at.
 *
 * Every entry here must correspond to a role that already exists, and the build checks
 * it. A theme is allowed to reassign a role, never to invent one: a token existing in
 * only one theme would leave a component unstyled in the other.
 */
import { color, type TokenGroup } from '../types'

export const dark = {
  color: {
    surface: color('{color.gray.950}'),
    'surface-muted': color('{color.gray.800}'),
    'surface-raised': color('{color.gray.900}'),
    'surface-overlay': color('{color.gray.900}'),
    'surface-sunken': color('oklch(11% 0.006 260)'),
    'surface-inverse': color('{color.gray.800}'),
    'surface-skeleton': color('{color.gray.800}'),

    'text-on-inverse': color('{color.gray.50}'),

    text: color('{color.gray.50}'),
    'text-muted': color('{color.gray.300}'),
    'text-subtle': color('{color.gray.400}'),
    'text-on-accent': color('{color.white}'),

    border: color('{color.gray.800}'),
    'border-strong': color('{color.gray.700}'),

    accent: color('{color.indigo.500}'),
    'accent-hover': color('{color.indigo.400}'),
    'accent-active': color('{color.indigo.300}'),
    'accent-surface': color('{color.indigo.950}'),
    'accent-border': color('{color.indigo.900}'),
    'accent-text': color('{color.indigo.300}'),

    /*
     * Danger and success keep exactly the steps the light theme gives them, brightness
     * included. A filled button in either colour carries white text, and white only
     * reaches the required contrast from red 600 and green 700 onwards — so there is no
     * lighter step for the dark theme to move to. They therefore go DARKER on hover here,
     * the opposite direction from the accent and the warning.
     *
     * These entries are deliberately identical to the light ones. Deleting them as
     * redundant would let a later change to the roles quietly drag the dark theme back
     * into the range where the text cannot be read.
     */
    danger: color('{color.red.600}'),
    'danger-hover': color('{color.red.700}'),
    'danger-active': color('{color.red.800}'),
    'danger-surface': color('{color.red.950}'),
    'danger-border': color('{color.red.900}'),
    'danger-text': color('{color.red.300}'),

    success: color('{color.green.700}'),
    'success-hover': color('{color.green.800}'),
    'success-active': color('{color.green.900}'),
    'success-surface': color('{color.green.950}'),
    'success-border': color('{color.green.900}'),
    'success-text': color('{color.green.300}'),

    warning: color('{color.amber.500}'),
    'warning-hover': color('{color.amber.400}'),
    'warning-active': color('{color.amber.300}'),
    'warning-surface': color('{color.amber.950}'),
    'warning-border': color('{color.amber.900}'),
    'warning-text': color('{color.amber.300}'),

    backdrop: color('oklch(0% 0 0 / 0.6)'),
  },
  focus: {
    'ring-color': color('{color.indigo.400}'),
  },
} satisfies TokenGroup
