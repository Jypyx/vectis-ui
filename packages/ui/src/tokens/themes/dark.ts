/**
 * Dark theme: overrides ONLY semantic tokens (the primitives are invariant). The
 * build checks that every key exists in `semantic`.
 */
import { color, type TokenGroup } from '../types'

export const dark = {
  color: {
    surface: color('{color.neutral.950}'),
    'surface-muted': color('{color.neutral.800}'),
    'surface-raised': color('{color.neutral.900}'),
    'surface-overlay': color('{color.neutral.900}'),
    'surface-sunken': color('oklch(11% 0.006 260)'),
    'surface-inverse': color('{color.neutral.800}'),
    'surface-skeleton': color('{color.neutral.800}'),

    'text-on-inverse': color('{color.neutral.50}'),

    text: color('{color.neutral.50}'),
    'text-muted': color('{color.neutral.300}'),
    'text-subtle': color('{color.neutral.400}'),
    'text-on-accent': color('{color.white}'),

    border: color('{color.neutral.800}'),
    'border-strong': color('{color.neutral.700}'),

    accent: color('{color.indigo.500}'),
    'accent-hover': color('{color.indigo.400}'),
    'accent-active': color('{color.indigo.300}'),
    'accent-surface': color('{color.indigo.950}'),
    'accent-border': color('{color.indigo.900}'),
    'accent-text': color('{color.indigo.300}'),

    /*
     * Danger and success keep their light-theme steps, brightness included: the solid
     * variants carry white text, and red only reaches 4.5:1 from red-600 on, green from
     * green-700 on — there is no lighter step for dark to use. So they go DARKER on
     * hover here, unlike accent and warning. These entries are deliberately equal to
     * the light ones; dropping them would let a future edit of `semantic.ts` drag dark
     * back into the inaccessible range unnoticed.
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
