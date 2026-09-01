/**
 * French, opt-in by import: the package ships one module per file, so a project that never
 * imports this one never carries it.
 *
 * Enabling it and adding a language the library does not ship are the SAME gesture — there
 * are deliberately not two kinds of dictionary, one blessed and one hand-added:
 *
 *     import { fr, registerMessages, setLocale } from 'vectis-ui'
 *     registerMessages('fr', fr)
 *     setLocale('fr-FR')
 *
 * TRAP — the curly apostrophes below are part of the text. Some tests assert these strings
 * letter for letter, and a straight apostrophe is a different character.
 */

import type { VectisMessages } from './types'

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
  snackbar: { label: 'Confirmation', action: 'Annuler' },
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
  datePicker: {
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    previousYear: 'Année précédente',
    nextYear: 'Année suivante',
    monthPicker: 'Choix du mois',
    yearPicker: "Choix de l'année",
  },
  dateInput: {
    clear: 'Effacer la date',
    open: 'Ouvrir le calendrier',
    label: 'Choisir une date',
  },
  timePicker: {
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
  },
  timeInput: {
    clear: "Effacer l'heure",
    openList: 'Ouvrir la liste des heures',
    openPicker: 'Ouvrir le sélecteur d’heure',
    listLabel: 'Heures disponibles',
    pickerLabel: 'Choisir une heure',
    maskPlaceholder: 'hh:mm',
  },
  fileInput: {
    attach: 'Choisir des fichiers',
    clear: 'Effacer les fichiers',
    remove: (name) => `Retirer ${name}`,
    // The French plural starts at two, the English one at zero — "0 fichier" against
    // "0 files". Each language therefore makes the choice on its own, and there is no
    // shared rule for either to inherit.
    files: (count) => `${count} fichier${count > 1 ? 's' : ''}`,
    placeholder: 'Aucun fichier sélectionné',
  },
  filePicker: {
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
  calendar: {
    label: 'Calendrier',
    roleDescription: 'calendrier',
    today: "Aujourd'hui",
    view: 'Affichage',
    viewDay: 'Jour',
    view4Days: '4 jours',
    viewWeek: 'Semaine',
    viewMonth: 'Mois',
    viewYear: 'Année',
    viewCustom: (days) => `${days} jours`,
    previousDay: 'Jour précédent',
    nextDay: 'Jour suivant',
    previousWeek: 'Semaine précédente',
    nextWeek: 'Semaine suivante',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    previousYear: 'Année précédente',
    nextYear: 'Année suivante',
    previousPeriod: 'Période précédente',
    nextPeriod: 'Période suivante',
    allDay: 'Journée',
    moreEvents: (count) => `+${count} autre${count > 1 ? 's' : ''}`,
    openDay: (day) => `Ouvrir le ${day}`,
    newEvent: (index) => `Évènement n°${index}`,
    eventRoleDescription: 'évènement',
    eventHint:
      'Appuyez sur Entrée pour saisir cet évènement, puis sur les flèches pour le déplacer et sur Maj avec les flèches pour changer son heure de fin.',
    grabbed:
      'Évènement saisi. Utilisez les flèches pour le déplacer, Entrée pour le poser, Échap pour annuler.',
    dropped: 'Évènement posé.',
    reverted: "Déplacement annulé. L'évènement est revenu à sa place.",
    movedTo: (title, when) => `${title} déplacé au ${when}.`,
  },
}
