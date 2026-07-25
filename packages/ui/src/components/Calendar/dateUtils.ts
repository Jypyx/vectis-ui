/**
 * Utilitaires de dates PURS pour Calendar/DatePicker.
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

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Motif ISO strict `YYYY-MM-DD`. */
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

/** `Date` (heure locale) → ISO `YYYY-MM-DD`. */
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

/** Nombre de jours du mois (mois 0-indexé). */
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

/** Noms des 7 jours ordonnés à partir de `firstDayOfWeek`. */
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

/** Noms des 12 mois (0-indexé). */
export function monthNames(locale: string, month: 'long' | 'short' = 'long'): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { month, timeZone: 'UTC' })
  return Array.from({ length: 12 }, (_, i) => fmt.format(Date.UTC(2021, i, 1)))
}

/** Nom d'un mois isolé (0-indexé). */
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
