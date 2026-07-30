/**
 * Dictionnaire du DS. Profondeur EXACTEMENT 2 : `namespace.clé`, où la valeur
 * est une feuille — chaîne, ou fonction typée pour un message paramétré.
 *
 * Aucun moteur de pluriel, aucun ICU, aucun interpolateur : une entrée
 * paramétrée EST une fonction TypeScript. Le typage de ses arguments est le
 * contrat (une traduction qui oublie un paramètre ne compile pas), et une règle
 * de pluriel s'écrit avec un ternaire — cf. `dataTable.selection`.
 *
 * La profondeur 2 n'est pas décorative : elle est ce qui rend la fusion des
 * surcharges partielles non récursive (`state.ts`), donc incapable par
 * construction de descendre dans une valeur FONCTION comme si c'était un objet.
 *
 * Ce qui n'est PAS ici, délibérément :
 * - ce qu'`Intl` dérive déjà de la balise de locale (noms de mois et de jours,
 *   ordre des champs de date, séparateur de date, cycle horaire) ;
 * - ce qui n'est fait que de chiffres et de ponctuation universelle (`99+` de
 *   Badge, `+N` d'AvatarGroup, le compteur `N/M`, le `:` de l'heure) ;
 * - les messages DÉVELOPPEUR (`[Composant] …`), qui ne sont pas traduits.
 */
export interface DsMessages {
  /** Mots partagés par plusieurs composants — un seul endroit à traduire. */
  common: {
    /** Spinner, `loadingLabel` d'Input/Textarea, `loadingText` de Combobox. */
    loading: string
    /** `clearLabel` d'Input et Textarea. */
    clear: string
    /** `closeLabel` de Dialog et Toaster. */
    close: string
    /** `dismissLabel` de Chip. */
    dismiss: string
    /** Pied du cadran TimePicker. */
    cancel: string
    /** Pied du cadran TimePicker. */
    confirm: string
  }
  pagination: {
    label: string
    previous: string
    next: string
    page: (page: number) => string
    /** Ellipse de pages masquées — élément décoratif (`aria-hidden`). */
    hiddenPages: string
  }
  tabs: { label: string; previous: string; next: string }
  breadcrumb: { label: string; ellipsis: string }
  sideNavigation: {
    /**
     * Nom accessible du `<nav>`. Seule chaîne du composant : les libellés
     * viennent des slots, et l'état déplié/replié est porté par `<details>`.
     */
    label: string
  }
  combobox: {
    empty: string
    clear: string
    remove: (label: string) => string
  }
  dataTable: {
    empty: string
    loading: string
    searchLabel: string
    searchPlaceholder: string
    perPage: string
    /** Bouton du menu « lignes par page » : libellé + valeur courante. */
    perPageValue: (label: string, value: number) => string
    selectAll: string
    /** `index` est l'index HUMAIN (1-based) : l'appelant passe `index + 1`. */
    selectRow: (index: number) => string
    selection: (count: number) => string
    range: (range: { start: number; end: number; total: number }) => string
  }
  toaster: { label: string }
  inputOTP: {
    label: string
    /** `index` est l'index HUMAIN (1-based) : l'appelant passe `slotIndex + 1`. */
    slot: (index: number, total: number) => string
  }
  slider: {
    value: string
    start: string
    end: string
    rangeStart: (label: string) => string
    rangeEnd: (label: string) => string
  }
  /** Partagé par Input et Textarea via `composables/useTextLimit`. */
  field: { limitExceeded: (max: number) => string }
  progress: {
    /** `50 %` en français (espace INSÉCABLE avant le signe), `50%` en anglais. */
    percent: (percent: number) => string
  }
  calendar: {
    previousMonth: string
    nextMonth: string
    previousYear: string
    nextYear: string
    monthPicker: string
    yearPicker: string
  }
  datePicker: { clear: string; open: string; label: string }
  timePicker: {
    clear: string
    openList: string
    openDial: string
    listLabel: string
    dialLabel: string
    meridiem: string
    am: string
    pm: string
    selectHour: string
    selectMinute: string
    /** Live region : étape en cours de sélection. */
    hourStep: string
    minuteStep: string
    /** Nom accessible du cadran selon l'étape. */
    hour: string
    minutes: string
    /** `aria-valuetext` du cadran. */
    hoursValue: (hour: number) => string
    minutesValue: (minute: number) => string
    /**
     * Gabarit du champ masqué (`hh:mm`). Traduisible parce que `h` et `m` sont
     * les initiales de MOTS — contrairement au `:`, universel, qui reste dans
     * `utils/time.ts`.
     */
    maskPlaceholder: string
  }
}

/**
 * Surcharge PARTIELLE : namespaces et clés facultatifs. Ce que vous n'écrivez
 * pas retombe sur le dictionnaire de base — jamais sur une chaîne vide (même
 * contrat que les mappings partiels de `setIconResolver`).
 *
 * `Partial<DsMessages[K]>` ne descend PAS dans les valeurs : une fonction reste
 * une fonction entière. Un `DeepPartial<T>` récursif, lui, transformerait
 * `(n: number) => string` en `{}`.
 */
export type DsMessagesInput = { [K in keyof DsMessages]?: Partial<DsMessages[K]> }
