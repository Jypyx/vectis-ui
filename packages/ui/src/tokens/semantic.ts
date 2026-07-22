/**
 * Tokens sémantiques (thème light, valeurs par défaut).
 * SEULS tokens consommés par les composants. Ils référencent les primitifs
 * via des alias DTCG `{path.to.token}`.
 */
import { color, dimension, type TokenGroup } from './types'

export const semantic = {
  color: {
    surface: color('{color.white}', 'Fond de page par défaut'),
    'surface-muted': color('{color.neutral.100}', 'Fond atténué (zones secondaires)'),
    'surface-raised': color('{color.white}', 'Surfaces surélevées : cartes'),
    'surface-overlay': color('{color.white}', 'Surfaces flottantes : dialogs, popovers, menus'),
    'surface-sunken': color('{color.neutral.50}', 'Surfaces en creux : wells, zones de code'),
    'surface-inverse': color('{color.neutral.900}', 'Surfaces à contraste inversé : tooltips'),

    'text-on-inverse': color('{color.white}', 'Texte posé sur une surface inversée'),

    text: color('{color.neutral.900}'),
    'text-muted': color('{color.neutral.600}'),
    'text-subtle': color('{color.neutral.400}', 'Placeholders, texte désactivé'),
    'text-on-accent': color('{color.white}', 'Texte posé sur un fond accent/danger/success'),
    'text-on-warning': color(
      '{color.neutral.950}',
      'Texte posé sur un fond warning solid (amber trop clair pour du blanc)',
    ),

    border: color('{color.neutral.200}'),
    'border-strong': color('{color.neutral.300}', 'Bordures des contrôles de formulaire'),

    accent: color('{color.indigo.600}'),
    'accent-hover': color('{color.indigo.700}'),
    'accent-active': color('{color.indigo.800}'),
    'accent-surface': color('{color.indigo.50}', 'Fond teinté accent (badges, sélections)'),
    'accent-border': color('{color.indigo.200}'),
    'accent-text': color('{color.indigo.700}', 'Texte accent sur fond neutre ou teinté'),

    danger: color('{color.red.600}'),
    'danger-hover': color('{color.red.700}'),
    'danger-active': color('{color.red.800}'),
    'danger-surface': color('{color.red.50}'),
    'danger-border': color('{color.red.200}'),
    'danger-text': color('{color.red.700}'),

    success: color('{color.green.600}'),
    'success-hover': color('{color.green.700}'),
    'success-active': color('{color.green.800}'),
    'success-surface': color('{color.green.50}'),
    'success-border': color('{color.green.200}'),
    'success-text': color('{color.green.800}'),

    warning: color('{color.amber.600}'),
    'warning-hover': color('{color.amber.700}'),
    'warning-active': color('{color.amber.800}'),
    'warning-surface': color('{color.amber.50}'),
    'warning-border': color('{color.amber.200}'),
    'warning-text': color('{color.amber.900}'),

    backdrop: color('oklch(0% 0 0 / 0.45)', 'Voile derrière les dialogs modaux'),
  },
  radius: {
    interactive: dimension('{radius.md}', 'Boutons, inputs, contrôles'),
    surface: dimension('{radius.lg}', 'Cartes, alertes'),
    overlay: dimension('{radius.xl}', 'Dialogs, popovers, menus'),
    pill: dimension('{radius.full}'),
  },
  focus: {
    'ring-color': color('{color.indigo.500}'),
    'ring-width': dimension('2px'),
    'ring-offset': dimension('2px'),
  },
  control: {
    'height-sm': dimension('2rem'),
    'height-md': dimension('2.5rem'),
    'height-lg': dimension('3rem'),
    'border-width': dimension('2px', 'Bordure des contrôles cochables (Checkbox, Radio)'),
    'size-check': dimension('1.25rem', 'Boîte des contrôles cochables (Checkbox, Radio)'),
    'size-check-mark': dimension('0.875rem', 'Coche SVG du Checkbox'),
    'size-check-dot': dimension('0.5rem', 'Point intérieur du Radio'),
    'size-switch-w': dimension('2.5rem', 'Largeur du track du Switch'),
    'size-switch-h': dimension('1.25rem', 'Hauteur du track du Switch'),
    'action-size-xs': dimension(
      '1rem',
      'Boutons internes les plus compacts (retrait des tags du Combobox)',
    ),
    'action-size-sm': dimension(
      '1.25rem',
      'Boutons internes des champs de saisie sm (effacer, icône cliquable)',
    ),
    'action-size-md': dimension(
      '1.5rem',
      'Boutons internes des champs de saisie md (effacer, icône cliquable)',
    ),
    'action-size-lg': dimension(
      '1.75rem',
      'Boutons internes des champs de saisie lg (effacer, icône cliquable)',
    ),
    'size-slider-track': dimension('0.375rem', 'Épaisseur de la piste du Slider'),
    'size-slider-thumb': dimension('1.25rem', 'Diamètre du curseur du Slider'),
    'size-slider-length': dimension('10rem', 'Longueur par défaut du Slider vertical'),
    'size-slider-field': dimension('5rem', 'Largeur des champs numériques du Slider'),
    'size-combobox-input-min': dimension(
      '4rem',
      'Largeur minimale de la zone de saisie du Combobox',
    ),
    'size-listbox-max-block': dimension('18rem', 'Hauteur maximale du panneau listbox du Combobox'),
    'size-progress-linear-sm': dimension('0.25rem', 'Hauteur du ProgressLinear sm'),
    'size-progress-linear-md': dimension('0.5rem', 'Hauteur du ProgressLinear md'),
    'size-progress-linear-lg': dimension('0.75rem', 'Hauteur du ProgressLinear lg'),
    'size-progress-circular-sm': dimension('1.5rem', 'Diamètre du ProgressCircular sm'),
    'size-progress-circular-md': dimension('3rem', 'Diamètre du ProgressCircular md'),
    'size-progress-circular-lg': dimension('5rem', 'Diamètre du ProgressCircular lg'),
    'size-toast-width': dimension('22rem', "Largeur par défaut d'un toast"),
  },
  icon: {
    'size-sm': dimension('1rem', 'Icônes 16px — contrôles sm'),
    'size-md': dimension('1.25rem', 'Icônes 20px — contrôles md'),
    'size-lg': dimension('1.5rem', 'Icônes 24px — contrôles lg'),
  },
} satisfies TokenGroup
