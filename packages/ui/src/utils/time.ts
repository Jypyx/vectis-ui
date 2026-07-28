/**
 * Utilitaires d'heures PURS (TimePicker, TimePickerDial).
 *
 * Contrat : l'API publique manipule des chaînes `HH:mm` en **24 h canonique**
 * (le v-model du TimePicker, quel que soit l'affichage 12 h / 24 h). Les objets
 * `Date` ne servent qu'à `Intl` sur des instants de RÉFÉRENCE en
 * `timeZone: 'UTC'`, pour que le rendu ne dépende jamais du fuseau machine
 * (SSR-safe, modèle `utils/date`).
 *
 * La géométrie du cadran (conversion pointeur → secteur/anneau) vit ici en
 * fonctions pures : jsdom ne mesure rien (`getBoundingClientRect` à zéro),
 * c'est donc la seule façon de la couvrir en vitest.
 */
import { clamp } from './number'
import { pad2 } from './text'

export type HourFormat = '12h' | '24h'
export type Meridiem = 'AM' | 'PM'

export interface TimeParts {
  /** Heure 24 h canonique (0–23). */
  hour: number
  minute: number
}

/** Motif strict `HH:mm` (00–23 / 00–59). */
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

/** Vrai si `value` est une chaîne `HH:mm` valide. */
export function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_RE.test(value)
}

/** `HH:mm` → composantes 24 h (ou `null` si mal formé). */
export function parseTime(value: string | null | undefined): TimeParts | null {
  if (!isValidTime(value)) return null
  const [h, m] = value.split(':')
  return { hour: Number(h), minute: Number(m) }
}

/** Composantes 24 h → `HH:mm`. */
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

// ─── Géométrie du cadran ────────────────────────────────────────────────────

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
