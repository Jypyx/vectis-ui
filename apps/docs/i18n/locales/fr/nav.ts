/**
 * Les mots de la table des matières.
 *
 * Les noms de composants sont traduits parce que le rail est une table des matières : ce que le
 * lecteur y cherche, c'est la chose, pas l'identifiant. L'identifiant, lui, ne bouge jamais —
 * chaque page écrit `VButton` dans sa prose comme dans son code.
 */
import type { NavMessages } from '../en/nav'

const nav: NavMessages = {
  group: {
    intro: 'Introduction',
    components: 'Composants',
    utils: 'Utilitaires',
  },

  installation: 'Installation',
  theming: 'Thématisation',
  iconography: 'Iconographie',
  'font-family': 'Famille de police',
  i18n: 'Localisation (i18n)',
  accessibility: 'Accessibilité',

  accordion: 'Accordéon',
  avatar: 'Avatar',
  'avatar-group': "Groupe d'avatars",
  badge: 'Badge',
  breadcrumb: "Fil d'Ariane",
  button: 'Bouton',
  'button-group': 'Groupe de boutons',
  calendar: 'Calendrier',
  carousel: 'Carrousel',
  checkbox: 'Case à cocher',
  chip: 'Puce',
  combobox: 'Liste déroulante',
  'data-table': 'Tableau de données',
  'date-picker': 'Sélecteur de date',
  dialog: 'Boîte de dialogue',
  'file-picker': 'Sélecteur de fichiers',
  'file-upload': 'Dépôt de fichiers',
  hotkeys: 'Raccourcis clavier',
  icon: 'Icône',
  'icon-button': 'Bouton icône',
  input: 'Champ de saisie',
  'input-otp': 'Code à usage unique',
  menu: 'Menu',
  pagination: 'Pagination',
  popover: 'Popover',
  'progress-circular': 'Progression circulaire',
  'progress-linear': 'Progression linéaire',
  radio: 'Bouton radio',
  separator: 'Séparateur',
  'side-navigation': 'Navigation latérale',
  'skeleton-loader': 'Squelette de chargement',
  slider: 'Curseur',
  spinner: 'Indicateur de chargement',
  switch: 'Interrupteur',
  tabs: 'Onglets',
  textarea: 'Zone de texte',
  'time-picker': "Sélecteur d'heure",
  toast: 'Notification',
  toggle: 'Groupe à bascule',
  tooltip: 'Infobulle',
  typography: 'Typographie',

  'js-helpers': 'Fonctions JavaScript',
  'css-classes': 'Classes CSS utilitaires',
}

export default nav
