/**
 * Utilitaires d'heures PURS (TimePicker, TimePickerDial).
 *
 * Contrat : l'API publique manipule des chaînes `HH:mm` en **24 h canonique**
 * (le v-model du TimePicker, quel que soit l'affichage 12 h / 24 h). Les objets
 * `Date` ne servent qu'à `Intl` sur des instants de RÉFÉRENCE en
 * `timeZone: 'UTC'`, pour que le rendu ne dépende jamais du fuseau machine
 * (SSR-safe).
 *
 * La géométrie du cadran (conversion pointeur → secteur/anneau) vit ici en
 * fonctions pures : jsdom ne mesure rien (`getBoundingClientRect` à zéro),
 * c'est donc la seule façon de la couvrir en vitest.
 */
import { clamp } from './number'
import { digitsOf, pad2 } from './text'

export type HourFormat = '12h' | '24h'
export type Meridiem = 'AM' | 'PM'

export interface TimeParts {
  /** Heure 24 h canonique (0–23). */
  hour: number
  minute: number
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_RE.test(value)
}

export function parseTime(value: string | null | undefined): TimeParts | null {
  if (!isValidTime(value)) return null
  const [h, m] = value.split(':')
  return { hour: Number(h), minute: Number(m) }
}

export function formatTime(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`
}

/** 24 h → cadran 12 h : 0 → {12, AM}, 12 → {12, PM}, 23 → {11, PM}. */
export function to12h(hour24: number): { hour: number; meridiem: Meridiem } {
  const meridiem: Meridiem = hour24 >= 12 ? 'PM' : 'AM'
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12
  return { hour, meridiem }
}

/** Cadran 12 h + méridien → 24 h : (12, AM) → 0, (12, PM) → 12. */
export function to24h(hour12: number, meridiem: Meridiem): number {
  const base = hour12 % 12 // 12 → 0
  return meridiem === 'PM' ? base + 12 : base
}

/**
 * Cycle horaire de la locale : `h11`/`h12` → 12 h (AM/PM), `h23`/`h24` → 24 h.
 * Repli 24 h si la locale est invalide.
 */
export function hourCycleFor(locale: string): HourFormat {
  try {
    const { hourCycle } = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
    return hourCycle === 'h11' || hourCycle === 'h12' ? '12h' : '24h'
  } catch {
    return '24h'
  }
}

/**
 * Affichage localisé du champ (« 19:05 », « 7:05 PM »). Le `hourCycle` est
 * forcé (h23/h12) pour suivre le `format` résolu du composant, pas la
 * préférence brute de la locale.
 */
export function formatDisplay(time: string, locale: string, format: HourFormat): string {
  const parts = parseTime(time)
  if (!parts) return ''
  const fmt = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: format === '12h' ? 'h12' : 'h23',
    timeZone: 'UTC',
  })
  return fmt.format(Date.UTC(2021, 0, 1, parts.hour, parts.minute))
}

/** Borne un entier à `[min, max]` (arrondi d'abord : les saisies sont libres). */
export function clampInt(n: number, min: number, max: number): number {
  return clamp(Math.round(n), min, max)
}

/**
 * Arrondit au multiple de `step` le plus proche, modulo 60 normalisé
 * (58, pas 5 → 0 ; −1, pas 1 → 59 — le wrap clavier passe par des négatifs).
 */
export function snapMinute(minute: number, step: number): number {
  const snapped = step <= 1 ? Math.round(minute) : Math.round(minute / step) * step
  return ((snapped % 60) + 60) % 60
}

/**
 * (dx, dy) relatifs au centre du cadran (repère écran : y vers le BAS) →
 * index de secteur `0..segments-1`. Secteur 0 à midi, sens horaire, arrondi
 * au secteur le plus proche. `atan2(dx, -dy)` mesure l'angle depuis le haut.
 */
export function angleToIndex(dx: number, dy: number, segments: number): number {
  const angle = Math.atan2(dx, -dy) // [-π, π], 0 = midi, positif = horaire
  const turn = (angle / (2 * Math.PI) + 1) % 1 // [0, 1)
  return Math.round(turn * segments) % segments
}

/** Distance au centre normalisée par le rayon (0 = centre, 1 = bord). */
export function distanceFraction(dx: number, dy: number, radius: number): number {
  return radius > 0 ? Math.hypot(dx, dy) / radius : 0
}

/**
 * Fraction de rayon sous laquelle un pointeur vise l'anneau INTÉRIEUR (24 h) :
 * mi-chemin entre les centres des deux anneaux de chiffres. Dérivé des tokens
 * `--ds-control-size-timepicker-dial` (16rem → R = 128px) et `-number`
 * (3rem → 48px) : ((128 − 24) + (128 − 72)) / 2 / 128 = 0.625 — à garder en
 * phase avec les `--_r` du CSS de TimePickerDial.vue.
 */
export const DIAL_INNER_THRESHOLD = 0.625

/**
 * Cadran 24 h (layout M3/Android) : anneau extérieur `12, 1 … 11`, anneau
 * intérieur `00, 13 … 23` (index 0 = position de midi).
 */
export function dialIndexToHour24(index: number, ring: 'outer' | 'inner'): number {
  if (ring === 'outer') return index === 0 ? 12 : index
  return index === 0 ? 0 : index + 12
}

/** Inverse (position de l'aiguille) : 0 → {0, inner}, 12 → {0, outer}, 15 → {3, inner}. */
export function hour24ToDial(hour: number): { index: number; ring: 'outer' | 'inner' } {
  if (hour === 0) return { index: 0, ring: 'inner' }
  if (hour === 12) return { index: 0, ring: 'outer' }
  if (hour > 12) return { index: hour - 12, ring: 'inner' }
  return { index: hour, ring: 'outer' }
}

/* ── Liste d'heures (TimePicker `mode="list"`) ──────────────────────────── */

export interface TimeOption {
  /** Valeur canonique `'HH:mm'` 24 h — celle du v-model. */
  value: string
  /** Libellé localisé (« 07:30 », « 7:30 AM »). */
  label: string
}

/** `'HH:mm'` → minutes depuis minuit, `null` si invalide (index d'une liste). */
export function minutesOf(time: string | null | undefined): number | null {
  const parts = parseTime(time)
  return parts ? parts.hour * 60 + parts.minute : null
}

/**
 * Les heures d'une journée par pas de `step` minutes, de `00:00` à la dernière
 * avant minuit. PURE : `formatDisplay` passe par un instant de référence UTC.
 * Aucune borne min/max — le TimePicker n'en a pas, ne pas en inventer ici.
 * `step` invalide (≤ 0, non entier, > 60) → repli 60 : la liste doit rester
 * finie même si le garde-fou de développement du composant a été ignoré.
 */
export function timeList(step: number, locale: string, format: HourFormat): TimeOption[] {
  const safe = Number.isInteger(step) && step >= 1 && step <= 60 ? step : 60
  const out: TimeOption[] = []
  for (let m = 0; m < 24 * 60; m += safe) {
    const value = formatTime(Math.floor(m / 60), m % 60)
    out.push({ value, label: formatDisplay(value, locale, format) })
  }
  return out
}

/* ── Masque de saisie `HH:MM` (TimePicker `mode="input"`) ───────────────── */

/**
 * Le séparateur du masque est UNIVERSEL, contrairement à celui du DatePicker :
 * une heure se lit « HH:MM » dans toutes les locales — `Intl` n'y fait varier
 * que le cycle horaire, jamais le deux-points.
 */
export const TIME_SEPARATOR = ':'

/** Gabarit du placeholder du champ de saisie. */
export const TIME_MASK_PLACEHOLDER = 'hh:mm'

/**
 * Suite de chiffres → texte masqué. Le `:` est posé DÈS que l'heure est
 * complète (« 09 » → « 09: »), comme le séparateur du masque de date.
 */
export function formatTimeMask(digits: string): string {
  const all = digitsOf(digits).slice(0, 4)
  return all.length >= 2 ? `${all.slice(0, 2)}${TIME_SEPARATOR}${all.slice(2)}` : all
}

/**
 * Position de caret « juste après le n-ième chiffre » dans « HH:MM ». Forme
 * CLOSE — le séparateur est toujours en 3e position, d'où l'absence d'un
 * équivalent du `caretAfterDigits` du masque de date, qui doit balayer le texte
 * parce que l'ordre et les longueurs de ses champs varient avec la locale.
 * `skipSeparator` = insertion : le curseur entre dans les minutes ; à la
 * suppression on reste devant le `:`, sinon la touche ne progresse jamais.
 */
export function timeCaret(n: number, skipSeparator = false): number {
  if (n < 2) return n
  if (n === 2) return skipSeparator ? 3 : 2
  return Math.min(n + 1, 5)
}

/**
 * `'HH:mm'` 24 h → texte masqué DU FORMAT AFFICHÉ. En 12 h l'heure est ramenée
 * à 1–12 : le méridien est porté par le Toggle à côté du champ, jamais par le
 * masque.
 */
export function timeToMask(time: string | null | undefined, format: HourFormat): string {
  const parts = parseTime(time)
  if (!parts) return ''
  const hour = format === '12h' ? to12h(parts.hour).hour : parts.hour
  return formatTimeMask(pad2(hour) + pad2(parts.minute))
}

/**
 * Texte masqué → `'HH:mm'` 24 h canonique, ou `null` si la saisie est
 * incomplète, surnuméraire ou impossible. En 12 h, `meridiem` vient du Toggle :
 * c'est le SEUL endroit où le texte tapé et le méridien se rejoignent.
 */
export function parseTimeMask(
  text: string,
  format: HourFormat,
  meridiem: Meridiem = 'AM',
): string | null {
  const digits = digitsOf(text)
  if (digits.length !== 4) return null
  const hour = Number(digits.slice(0, 2))
  const minute = Number(digits.slice(2))
  if (minute > 59) return null
  if (format === '12h')
    return hour >= 1 && hour <= 12 ? formatTime(to24h(hour, meridiem), minute) : null
  return hour <= 23 ? formatTime(hour, minute) : null
}
