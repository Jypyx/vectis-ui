/** Dark mode repoints existing semantic roles while retaining the shared primitive palette. */
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
     * Retain explicit red/green steps for white-text contrast. Their dark-theme hover steps
     * grow darker, unlike accent and warning.
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

    /* Swap event surface and text lightness in dark mode; each card still supplies its own hue. */
    'event-surface': color('oklch(0.3 0.05 265)'),
    'event-border': color('oklch(0.42 0.08 265)'),
    'event-text': color('oklch(0.9 0.06 265)'),
  },
  focus: {
    'ring-color': color('{color.indigo.400}'),
  },
} satisfies TokenGroup
