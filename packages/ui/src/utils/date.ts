/**
 * Utilitaires de dates PURS (Calendar, DatePicker).
 *
 * Contrat : l'API publique manipule des chaînes ISO `YYYY-MM-DD` et tout se
 * calcule en **heure locale** — on ne passe JAMAIS par `new Date('YYYY-MM-DD')`
 * (interprété en UTC → dérive d'un jour selon le fuseau) ni par `toISOString()`
 * (renvoie de l'UTC). Les objets `Date` restent internes, construits via
 * `new Date(y, m, d)` (minuit local) et reformatés par concaténation manuelle.
 *
 * Les noms de mois/jours passent par `Intl` (dispo côté serveur → SSR-safe) sur
 * des dates de RÉFÉRENCE en `timeZone: 'UTC'`, pour que le libellé ne dépende
 * pas du fuseau de la machine.
 */

import { digitsOf, pad2 } from './text'

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

/** Vrai si `iso` est une chaîne `YYYY-MM-DD` valide (mois/jour cohérents). */
export function isValidISO(iso: unknown): iso is string {
  if (typeof iso !== 'string' || !ISO_RE.test(iso)) return false
  const d = parseISO(iso)
  return d !== null && formatISO(d) === iso
}

/** ISO `YYYY-MM-DD` → `Date` à minuit local (ou `null` si mal formé). */
export function parseISO(iso: string | null | undefined): Date | null {
  if (typeof iso !== 'string' || !ISO_RE.test(iso)) return null
  const parts = iso.split('-')
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Construit un ISO depuis des composantes locales (mois 0-indexé). */
export function isoOf(year: number, month0: number, day: number): string {
  return formatISO(new Date(year, month0, day))
}

/** Ajoute `n` jours à un ISO (report de mois/année géré par `Date`). */
export function addDays(iso: string, n: number): string {
  const d = parseISO(iso)
  if (!d) return iso
  d.setDate(d.getDate() + n)
  return formatISO(d)
}

/**
 * Ajoute `n` mois en conservant le jour, clampé au dernier jour du mois cible
 * (31 janv. + 1 mois → 28/29 févr., pas un débordement en mars).
 */
export function addMonths(iso: string, n: number): string {
  const d = parseISO(iso)
  if (!d) return iso
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  d.setDate(Math.min(day, daysInMonth(d.getFullYear(), d.getMonth())))
  return formatISO(d)
}

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate()
}

/**
 * Comparaison chronologique de deux ISO. Comme le format `YYYY-MM-DD` est
 * lexicographiquement ordonné, une comparaison de chaînes suffit.
 */
export function compareISO(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export const isSameISO = (a: string | null, b: string | null) => !!a && a === b

/** Restreint `iso` à l'intervalle `[min, max]` (bornes optionnelles). */
export function clampISO(iso: string, min?: string, max?: string): string {
  if (min && compareISO(iso, min) < 0) return min
  if (max && compareISO(iso, max) > 0) return max
  return iso
}

/** Vrai si `iso` est dans `[min, max]` (bornes optionnelles). */
export function isWithin(iso: string, min?: string, max?: string): boolean {
  if (min && compareISO(iso, min) < 0) return false
  if (max && compareISO(iso, max) > 0) return false
  return true
}

export interface MonthCell {
  iso: string
  /** Position hors du mois affiché (jour d'un mois adjacent), sinon `null`. */
  adjacent: 'prev' | 'next' | null
}

/**
 * Matrice de 42 cellules (6 lignes × 7 colonnes) couvrant le mois `month0` de
 * `year`, complétée par les jours des mois adjacents. Hauteur de grille stable
 * quel que soit le mois. `firstDayOfWeek` : 0 = dimanche … 6 = samedi.
 */
export function buildMonthGrid(year: number, month0: number, firstDayOfWeek: number): MonthCell[] {
  const first = new Date(year, month0, 1)
  // Décalage du 1er du mois par rapport au 1er jour de semaine (0..6).
  const offset = (first.getDay() - firstDayOfWeek + 7) % 7
  const cells: MonthCell[] = []
  const start = new Date(year, month0, 1 - offset)
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const adjacent =
      d.getMonth() === month0 && d.getFullYear() === year
        ? null
        : compareISO(formatISO(d), formatISO(first)) < 0
          ? 'prev'
          : 'next'
    cells.push({ iso: formatISO(d), adjacent })
  }
  return cells
}

/**
 * Premier jour de semaine de la locale (0 = dimanche … 6 = samedi). Dérivé de
 * `Intl.Locale.weekInfo` (1 = lundi … 7 = dimanche) ; repli lundi si l'API est
 * absente (Node/SSR selon la version) — surchargeable par prop côté composant.
 */
export function firstDayOfWeekFor(locale: string): number {
  try {
    // `weekInfo` : getter (Chrome/Safari) ou méthode `getWeekInfo()` selon impl.
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: { firstDay: number }
      getWeekInfo?: () => { firstDay: number }
    }
    const info = loc.getWeekInfo?.() ?? loc.weekInfo
    if (info?.firstDay) return info.firstDay % 7 // 7 (dimanche) → 0
  } catch {
    /* locale invalide → repli */
  }
  return 1 // lundi
}

// Dates de référence en UTC : le dimanche 2021-08-01 pour les jours de semaine,
// n'importe quelle année pour les mois. `timeZone: 'UTC'` fige le rendu.
const REF_SUNDAY = Date.UTC(2021, 7, 1) // 1er août 2021 = dimanche
const MS_DAY = 86_400_000

export function weekdayNames(
  locale: string,
  firstDayOfWeek: number,
  weekday: 'narrow' | 'short' | 'long' = 'short',
): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday, timeZone: 'UTC' })
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(REF_SUNDAY + ((firstDayOfWeek + i) % 7) * MS_DAY),
  )
}

export function monthNames(locale: string, month: 'long' | 'short' = 'long'): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { month, timeZone: 'UTC' })
  return Array.from({ length: 12 }, (_, i) => fmt.format(Date.UTC(2021, i, 1)))
}

/**
 * Noms de mois compacts pour le sélecteur : nom entier s'il tient en 4
 * caractères (« Mai », « Juin », « Août »), sinon 3 premiers + point
 * (« janvier » → « jan. »). `[...n]` compte les graphèmes (accents inclus).
 */
export function monthNamesCompact(locale: string): string[] {
  return monthNames(locale, 'long').map((n) => {
    const chars = [...n]
    return chars.length <= 4 ? n : chars.slice(0, 3).join('') + '.'
  })
}

export function monthName(
  locale: string,
  month0: number,
  month: 'long' | 'short' = 'long',
): string {
  return new Intl.DateTimeFormat(locale, { month, timeZone: 'UTC' }).format(
    Date.UTC(2021, month0, 1),
  )
}

/** Affichage localisé d'une date isolée pour le champ du DatePicker. */
export function formatDisplay(
  iso: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const d = parseISO(iso)
  return d ? new Intl.DateTimeFormat(locale, options).format(d) : ''
}

/** Affichage localisé d'une plage (`formatRange` → « 19–26 juin 2026 »). */
export function formatDisplayRange(
  start: string,
  end: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const a = parseISO(start)
  const b = parseISO(end)
  if (!a || !b) return ''
  const fmt = new Intl.DateTimeFormat(locale, options)
  return compareISO(start, end) === 0 ? fmt.format(a) : fmt.formatRange(a, b)
}

/* ── Masque de saisie numérique (DatePicker `entry="input"`) ────────────────
 *
 * Le champ de saisie n'affiche JAMAIS le `displayFormat` du DatePicker (« 10
 * juin 2026 » ne se tape pas) mais un masque purement numérique : l'ordre des
 * champs et le séparateur sont DÉRIVÉS de la locale, jamais codés en dur.
 */

export type DateMaskField = 'day' | 'month' | 'year'

export interface DateMask {
  /** Ordre d'affichage (fr `day,month,year` · en-US `month,day,year` · ja `year,month,day`). */
  order: readonly DateMaskField[]
  /** Séparateur unique, nettoyé de ses marques bidi et de ses espaces. */
  separator: string
  /** Longueurs alignées sur `order` : année 4, jour et mois 2. */
  lengths: readonly number[]
  /** Nombre total de chiffres du masque (8). */
  size: number
}

const MASK_FALLBACK: DateMask = {
  order: ['day', 'month', 'year'],
  separator: '/',
  lengths: [2, 2, 4],
  size: 8,
}

/** 22 novembre 2021 : jour ≠ mois ≠ année → l'ordre des champs est déductible. */
const REF_MASK_DATE = Date.UTC(2021, 10, 22)

/** Marques directionnelles insérées par certaines locales (ar-EG : U+200F avant « / »). */
const BIDI_MARKS = /[‎‏؜]/g

/**
 * Masque de saisie de la locale. `calendar` et `numberingSystem` sont FORCÉS :
 * sans eux `fa-IR` renvoie une année persane (1400) et `ar-EG` des chiffres
 * arabes-indiens — deux valeurs qu'un champ numérique ne saurait ni afficher ni
 * relire. Repli jour/mois/année « / » si la locale est invalide (`RangeError`).
 */
export function dateMaskFor(locale: string): DateMask {
  try {
    const parts = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
      calendar: 'gregory',
      numberingSystem: 'latn',
    }).formatToParts(REF_MASK_DATE)

    const order = parts
      .map((p) => p.type)
      .filter((t): t is DateMaskField => t === 'day' || t === 'month' || t === 'year')

    // Premier littéral situé APRÈS le premier champ : hu-HU/ko-KR suffixent le
    // format d'un point (« 2021. 11. 22. ») qu'il ne faut pas prendre pour lui.
    const firstField = parts.findIndex((p) => p.type !== 'literal')
    const separator = parts
      .slice(firstField)
      .find((p) => p.type === 'literal')
      ?.value.replace(BIDI_MARKS, '')
      .trim()

    if (order.length === 3 && separator) {
      const lengths = order.map((f) => (f === 'year' ? 4 : 2))
      return { order, separator, lengths, size: 8 }
    }
  } catch {
    /* locale invalide → repli */
  }
  return MASK_FALLBACK
}

/**
 * Suite de chiffres → texte masqué. Le séparateur est posé DÈS QUE le champ qui
 * le précède est complet (« 22 » → « 22/ ») : il montre l'avancement de la
 * frappe sans que l'utilisateur ait à le taper. Corollaire côté composant : un
 * Retour arrière sur ce séparateur doit effacer le CHIFFRE qui le précède,
 * sinon le masque le réécrit aussitôt et la touche paraît morte.
 */
export function formatDateMask(digits: string, mask: DateMask): string {
  const all = digitsOf(digits).slice(0, mask.size)
  let out = ''
  let i = 0
  for (let f = 0; f < mask.lengths.length; f++) {
    const len = mask.lengths[f] as number
    const chunk = all.slice(i, i + len)
    if (!chunk) break
    out += chunk
    i += len
    if (chunk.length < len) break // champ en cours de frappe
    if (f < mask.lengths.length - 1) out += mask.separator
  }
  return out
}

/** ISO `YYYY-MM-DD` → texte masqué de la locale (« 10/06/2026 »). */
export function isoToMask(iso: string, mask: DateMask): string {
  if (!isValidISO(iso)) return ''
  const [year, month, day] = iso.split('-') as [string, string, string]
  const by: Record<DateMaskField, string> = { year, month, day }
  return formatDateMask(mask.order.map((f) => by[f]).join(''), mask)
}

export interface ParseMaskOptions {
  /**
   * Siècle d'expansion d'une année à 2 chiffres (« 10/06/26 » → 2026 avec 2000),
   * tolérée seulement si l'année est le DERNIER champ du masque. Absent = saisie
   * refusée tant que l'année n'a pas ses 4 chiffres : c'est le mode utilisé
   * pendant la frappe, pour ne pas commiter « 26 » comme année.
   */
  yearPivot?: number
}

/**
 * Texte masqué → ISO, ou `null` si la saisie est incomplète, surnuméraire ou
 * impossible (31/02 : `isValidISO` fait l'aller-retour `parseISO`/`formatISO`).
 * Les bornes `min`/`max` et les dates désactivées restent l'affaire du
 * composant : ce helper ne connaît pas les props.
 */
export function parseDateMask(
  text: string,
  mask: DateMask,
  options: ParseMaskOptions = {},
): string | null {
  const digits = digitsOf(text)
  const by: Partial<Record<DateMaskField, string>> = {}
  let i = 0
  for (let k = 0; k < mask.order.length; k++) {
    const field = mask.order[k] as DateMaskField
    const len = mask.lengths[k] as number
    const chunk = digits.slice(i, i + len)
    if (chunk.length === len) i += len
    else if (
      field === 'year' &&
      options.yearPivot !== undefined &&
      k === mask.order.length - 1 &&
      chunk.length === 2
    )
      i += 2
    else return null
    by[field] = chunk
  }
  if (i !== digits.length) return null // chiffres en trop
  const year =
    (by.year as string).length === 2
      ? String((options.yearPivot as number) + Number(by.year))
      : (by.year as string)
  const iso = `${year}-${by.month}-${by.day}`
  return isValidISO(iso) ? iso : null
}

/**
 * Position de caret équivalente à « juste après le n-ième chiffre » — le seul
 * repère stable d'un reformatage, les positions absolues sautant dès qu'un
 * séparateur apparaît ou disparaît. Si `separator` est fourni et suit cette
 * position, on le franchit : à la frappe le curseur doit se poser dans le champ
 * SUIVANT, pas devant le séparateur qui vient d'apparaître. À la suppression on
 * ne le passe pas (`separator` omis).
 */
export function caretAfterDigits(text: string, n: number, separator?: string): number {
  let pos = 0
  if (n > 0) {
    pos = text.length
    let seen = 0
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i)
      if (code >= 48 && code <= 57 && ++seen === n) {
        pos = i + 1
        break
      }
    }
  }
  if (separator && text.startsWith(separator, pos)) pos += separator.length
  return pos
}

const PLACEHOLDER_FALLBACK: Record<DateMaskField, string> = { day: 'd', month: 'm', year: 'y' }

/** Scripts idéographiques : « 日 » répété ne forme pas un gabarit lisible. */
const IDEOGRAPHIC = /[\p{sc=Han}\p{sc=Hangul}\p{sc=Hiragana}\p{sc=Katakana}]/u

/**
 * Gabarit du champ (fr « jj/mm/aaaa », en « dd/mm/yyyy », de « tt.mm.jjjj »,
 * ru « дд/мм/гггг »). La lettre vient du nom localisé du champ
 * (`Intl.DisplayNames`), ce qui retombe sur les conventions attestées de tous
 * les scripts alphabétiques ; repli latin si l'API manque (ICU réduit) ou si le
 * script est idéographique.
 */
export function maskPlaceholder(locale: string, mask: DateMask): string {
  const letters = { ...PLACEHOLDER_FALLBACK }
  try {
    const names = new Intl.DisplayNames(locale, { type: 'dateTimeField' })
    for (const field of ['day', 'month', 'year'] as const) {
      const first = [...(names.of(field) ?? '')][0]
      if (first && /\p{L}/u.test(first) && !IDEOGRAPHIC.test(first))
        letters[field] = first.toLocaleLowerCase(locale)
    }
  } catch {
    /* Intl.DisplayNames indisponible → repli */
  }
  return mask.order.map((f, k) => letters[f].repeat(mask.lengths[k] as number)).join(mask.separator)
}
