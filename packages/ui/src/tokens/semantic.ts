/**
 * Tokens sémantiques (thème light, valeurs par défaut).
 * SEULS tokens consommés par les composants. Ils référencent les primitifs
 * via des alias DTCG `{path.to.token}`.
 */
import { color, dimension, fontFamily, fontWeight, type TokenGroup } from './types'

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
  /**
   * Échelle typographique sémantique : un rôle = une recette complète
   * (taille, graisse, interlignage, éventuel espacement de lettres).
   * Consommée par le composant Typography et par le CSS des composants.
   */
  text: {
    family: fontFamily('{font.family.sans}', 'Police de tout le texte du design system'),
    'family-code': fontFamily(
      '{font.family.mono}',
      'Police des contenus code (variante code, InputOTP)',
    ),
    display: {
      size: dimension('{font.size.5xl}'),
      weight: fontWeight('{font.weight.bold}'),
      leading: dimension('{font.leading.none}'),
      tracking: dimension('{font.tracking.tight}'),
    },
    'heading-1': {
      size: dimension('{font.size.4xl}'),
      weight: fontWeight('{font.weight.bold}'),
      leading: dimension('{font.leading.tight}'),
      tracking: dimension('{font.tracking.tight}'),
    },
    'heading-2': {
      size: dimension('{font.size.2xl}'),
      weight: fontWeight('{font.weight.semibold}'),
      leading: dimension('{font.leading.tight}'),
      tracking: dimension('{font.tracking.tight}'),
    },
    'heading-3': {
      size: dimension('{font.size.lg}'),
      weight: fontWeight('{font.weight.semibold}'),
      leading: dimension('{font.leading.snug}'),
    },
    'heading-4': {
      size: dimension('{font.size.md}'),
      weight: fontWeight('{font.weight.semibold}'),
      leading: dimension('{font.leading.snug}'),
    },
    subtitle: {
      size: dimension('{font.size.sm}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.normal}'),
    },
    'body-lg': {
      size: dimension('{font.size.md}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.relaxed}'),
    },
    'body-md': {
      size: dimension('{font.size.sm}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.normal}'),
    },
    'body-sm': {
      size: dimension('{font.size.xs}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.normal}'),
    },
    label: {
      size: dimension('{font.size.sm}'),
      weight: fontWeight('{font.weight.medium}'),
      leading: dimension('{font.leading.snug}'),
    },
    caption: {
      size: dimension('{font.size.xs}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.snug}'),
    },
    overline: {
      size: dimension('{font.size.xs}'),
      weight: fontWeight('{font.weight.medium}'),
      leading: dimension('{font.leading.snug}'),
      tracking: dimension('{font.tracking.wide}'),
    },
    code: {
      size: dimension('{font.size.sm}'),
      weight: fontWeight('{font.weight.regular}'),
      leading: dimension('{font.leading.normal}'),
    },
    /* Rôle technique : étiquette de contrôle interactif (Button, Chip, Badge…).
     * Pas de `size` : elle vient de l'échelle de tailles (`--_control-font-size`). */
    control: {
      weight: fontWeight('{font.weight.medium}'),
      leading: dimension('{font.leading.none}'),
    },
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
    'height-xs': dimension('1.5rem'),
    'height-sm': dimension('2rem'),
    'height-md': dimension('2.5rem'),
    'height-lg': dimension('3rem'),
    'height-xl': dimension('3.5rem'),
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
    'size-combobox-list-max-block': dimension(
      '18rem',
      'Hauteur maximale du panneau de liste du Combobox (zone défilante)',
    ),
    'size-menu-min': dimension('11rem', 'Largeur minimale du panneau du Menu'),
    'size-menu-max': dimension('20rem', 'Largeur maximale du panneau du Menu'),
    'size-progress-linear-thickness': dimension(
      '0.25rem',
      'Épaisseur par défaut de la barre du ProgressLinear (4px)',
    ),
    'size-progress-linear-length': dimension(
      '10rem',
      'Longueur par défaut du ProgressLinear vertical (surchargeable par `height`)',
    ),
    'size-progress-circular-diameter': dimension('3rem', 'Diamètre par défaut du ProgressCircular'),
    'size-progress-circular-thickness': dimension(
      '0.25rem',
      'Épaisseur par défaut du trait du ProgressCircular (4px)',
    ),
    'size-toast-width': dimension('22rem', "Largeur par défaut d'un toast"),
    'size-badge-h': dimension('1.25rem', 'Hauteur du Badge (pilule)'),
    'size-badge-dot': dimension('0.625rem', 'Diamètre du Badge en mode point'),
    'size-avatar-ring': dimension('2px', 'Anneau de séparation des Avatars empilés (AvatarGroup)'),
    'size-calendar-cell': dimension(
      '2.5rem',
      'Côté (hauteur/largeur) d’une cellule jour du Calendar',
    ),
    'size-calendar-dot': dimension('0.25rem', 'Diamètre d’une pastille d’événement du Calendar'),
    'size-calendar-nav-min': dimension(
      '5.375rem',
      'Largeur minimale des boutons sélecteurs mois/année du Calendar (≈86px)',
    ),
    'size-tab-indicator': dimension(
      '2px',
      "Épaisseur de l'indicateur d'onglet actif (Tabs, flat/outlined)",
    ),
    'size-table-search': dimension('16rem', 'Largeur du champ de recherche du DataTable'),
    'size-timepicker-dial': dimension('16rem', 'Diamètre du cadran du TimePicker (spec M3)'),
    'size-timepicker-number': dimension(
      '3rem',
      "Cellule d'un chiffre du cadran du TimePicker et pastille de l'aiguille sur un repère",
    ),
    'size-timepicker-center': dimension('0.5rem', 'Point central du cadran du TimePicker'),
    'size-timepicker-hand': dimension('2px', "Épaisseur de l'aiguille du cadran du TimePicker"),
    'size-timepicker-hand-minor': dimension(
      '1rem',
      "Pastille de l'aiguille du cadran du TimePicker sur une minute hors repère 5 min",
    ),
    'size-timepicker-cell-w': dimension(
      '6rem',
      "Largeur d'un sélecteur heure/minute du panneau du TimePicker (la hauteur vient de l'échelle de contrôles)",
    ),
    'size-timepicker-list-max-block': dimension(
      '18rem',
      'Hauteur maximale du panneau de liste du TimePicker (zone défilante)',
    ),
  },
  icon: {
    'size-sm': dimension('1rem', 'Icônes 16px'),
    'size-md': dimension('1.25rem', 'Icônes 20px'),
    'size-lg': dimension('1.5rem', 'Icônes 24px'),
  },
} satisfies TokenGroup
