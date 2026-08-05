import type { VectisMessages } from './types'

/**
 * French. **Opt-in**: this module is only reached if you import it, so it is
 * pruned from the bundle of projects that do not use it (`preserveModules` +
 * `sideEffects: ["**\/*.css"]`).
 *
 * Enabling it and adding a language the DS does not ship are the SAME gesture —
 * there are no two categories of dictionary:
 *
 *     import { fr, registerMessages, setLocale } from '@vectis/ui'
 *     registerMessages('fr', fr)
 *     setLocale('fr-FR')
 *
 * ⚠ Typographic apostrophes are meaningful here: some assertions target these
 * strings character for character.
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
  // `\u00A0` = a NON-BREAKING space before the sign, a French typographic
  // convention (English has none). Escaped rather than literal: ESLint rejects
  // the character (`no-irregular-whitespace`), and it would be invisible in review.
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
    // Le pluriel français part de 2, l’anglais de 0 : deux ternaires distincts,
    // pas une règle partagée.
    files: (count) => `${count} fichier${count > 1 ? 's' : ''}`,
    placeholder: 'Aucun fichier sélectionné',
  },
  fileUpload: {
    browse: 'Parcourir les fichiers',
    or: 'ou',
    remove: (name) => `Retirer ${name}`,
    list: 'Fichiers sélectionnés',
  },
}
