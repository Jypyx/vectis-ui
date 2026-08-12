import type { VectisMessages } from './types'

/**
 * French. Nothing reaches this file unless it is asked for, so a project that does not
 * use it never carries it: the library is packaged one module at a time, and a module
 * nobody imports is left out.
 *
 * Turning it on and adding a language the library does not ship at all are the SAME
 * gesture. There are deliberately not two kinds of dictionary, one blessed and one added
 * by hand:
 *
 *     import { fr, registerMessages, setLocale } from '@vectis/ui'
 *     registerMessages('fr', fr)
 *     setLocale('fr-FR')
 *
 * The curly apostrophes below are deliberate and are part of the text: some tests check
 * these words letter for letter, and a straight apostrophe is a different letter.
 */
export const fr: VectisMessages = {
  common: {
    loading: 'Chargement…',
    clear: 'Effacer',
    close: 'Fermer',
    dismiss: 'Retirer',
    cancel: 'Annuler',
    confirm: 'OK',
  },
  pagination: {
    label: 'Pagination',
    previous: 'Page précédente',
    next: 'Page suivante',
    page: (page) => `Page ${page}`,
    hiddenPages: 'Pages masquées',
  },
  tabs: {
    label: 'Onglets',
    previous: 'Onglets précédents',
    next: 'Onglets suivants',
  },
  breadcrumb: {
    label: "Fil d'Ariane",
    ellipsis: 'Afficher les pages intermédiaires',
  },
  sideNavigation: { label: 'Navigation' },
  combobox: {
    empty: 'Aucun résultat',
    clear: 'Effacer la sélection',
    remove: (label) => `Retirer ${label}`,
  },
  dataTable: {
    empty: 'Aucune donnée',
    loading: 'Chargement des données…',
    searchLabel: 'Rechercher dans le tableau',
    searchPlaceholder: 'Rechercher…',
    perPage: 'Lignes par page',
    perPageValue: (label, value) => `${label} : ${value}`,
    selectAll: 'Tout sélectionner',
    selectRow: (index) => `Sélectionner la ligne ${index}`,
    selection: (count) =>
      `${count} élément${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`,
    range: ({ start, end, total }) => `${start}–${end} sur ${total}`,
    pagination: 'Pagination du tableau',
  },
  toaster: { label: 'Notifications' },
  inputOTP: {
    label: 'Code de vérification',
    slot: (index, total) => `Caractère ${index} sur ${total}`,
  },
  slider: {
    value: 'Valeur',
    start: 'Début',
    end: 'Fin',
    rangeStart: (label) => `${label} (début)`,
    rangeEnd: (label) => `${label} (fin)`,
  },
  field: {
    limitExceeded: (max) => `Dépasse la limite de ${max} caractères`,
  },
  // The space before the sign is a NON-BREAKING one, as French typography requires and
  // English does not. It is written as an escape rather than typed in: the linter refuses
  // the character itself, and it would be indistinguishable from an ordinary space in a
  // review.
  progress: { percent: (percent) => `${percent}\u00A0%`, label: 'Progression' },
  hotkeys: {
    command: 'Commande',
    ctrl: 'Ctrl',
    alt: 'Alt',
    shift: 'Maj',
    windows: 'Win',
    super: 'Super',
    enter: 'Entrée',
    escape: 'Échap',
    space: 'Espace',
    backspace: 'Retour arrière',
    delete: 'Suppr',
    tab: 'Tab',
    up: 'Flèche haut',
    down: 'Flèche bas',
    left: 'Flèche gauche',
    right: 'Flèche droite',
    label: (keys) => `Raccourci clavier : ${keys}`,
  },
  calendar: {
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    previousYear: 'Année précédente',
    nextYear: 'Année suivante',
    monthPicker: 'Choix du mois',
    yearPicker: "Choix de l'année",
  },
  datePicker: {
    clear: 'Effacer la date',
    open: 'Ouvrir le calendrier',
    label: 'Choisir une date',
  },
  timePicker: {
    clear: "Effacer l'heure",
    openList: 'Ouvrir la liste des heures',
    openDial: 'Ouvrir le sélecteur d’heure',
    listLabel: 'Heures disponibles',
    dialLabel: 'Choisir une heure',
    meridiem: 'AM ou PM',
    am: 'AM',
    pm: 'PM',
    selectHour: 'Sélectionner l’heure',
    selectMinute: 'Sélectionner les minutes',
    hourStep: 'Sélection de l’heure',
    minuteStep: 'Sélection des minutes',
    hour: 'Heure',
    minutes: 'Minutes',
    hoursValue: (hour) => `${hour} heures`,
    minutesValue: (minute) => `${minute} minutes`,
    maskPlaceholder: 'hh:mm',
  },
  filePicker: {
    attach: 'Choisir des fichiers',
    clear: 'Effacer les fichiers',
    remove: (name) => `Retirer ${name}`,
    // The French plural starts at two, the English one at zero — "0 fichier" against
    // "0 files". Each language therefore makes the choice on its own, and there is no
    // shared rule for either to inherit.
    files: (count) => `${count} fichier${count > 1 ? 's' : ''}`,
    placeholder: 'Aucun fichier sélectionné',
  },
  fileUpload: {
    browse: 'Parcourir les fichiers',
    or: 'ou',
    remove: (name) => `Retirer ${name}`,
    list: 'Fichiers sélectionnés',
  },
  carousel: {
    label: 'Carrousel',
    roleDescription: 'carrousel',
    slideRoleDescription: 'diapositive',
    slides: 'Diapositives',
    slide: (index, total) => `${index} sur ${total}`,
    previous: 'Diapositive précédente',
    next: 'Diapositive suivante',
    indicators: 'Choisir la diapositive à afficher',
  },
}
