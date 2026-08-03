<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'

import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import VIconButton from '../VIconButton/VIconButton.vue'
import {
  addDays,
  addMonths,
  buildMonthGrid,
  clampISO,
  compareISO,
  daysInMonth,
  firstDayOfWeekFor,
  formatISO,
  isoOf,
  isSameISO,
  isValidISO,
  isWithin,
  monthName,
  monthNamesCompact,
  parseISO,
  weekdayNames,
} from '../../utils/date'

import { toggleValue } from '../../utils/array'
import { resolveMatcher } from '../../utils/matcher'
import { clamp } from '../../utils/number'
import { useLocale, useMessages } from '../../i18n/state'

/**
 * Calendrier inline (grille) réutilisable, inspiration Material. Contient TOUTE
 * la logique de dates, de vues (jours / mois / années) et du clavier ; le
 * VDatePicker se contente de l'habiller d'un champ + popover.
 *
 * Le natif ne fournit pas de grille de dates accessible (`<input type=date>`
 * n'est ni stylable ni composable) : le JS implémente donc le pattern ARIA
 * « grid » — roving tabindex, flèches/PageUp/PageDown, sélection simple/plage/
 * multiple — que HTML/CSS seuls ne couvrent pas. Tout se calcule en heure
 * locale via des chaînes ISO `YYYY-MM-DD` (cf. `utils/date`, SSR-safe).
 */
export type CalendarSelection = 'single' | 'range' | 'multiple'

/** Plage de dates (sélection `range`). Bornes optionnelles pendant la saisie. */
export interface DateRange {
  start: string | null
  end: string | null
}

/** Événement affiché sous une date sous forme de pastille colorée. */
export interface CalendarEvent {
  /** Date ISO `YYYY-MM-DD`. */
  date: string
  /** Couleur CSS de la pastille (défaut : accent). */
  color?: string
  /** Libellé accessible de l'événement. */
  label?: string
}

/** Liste d'ISO ou prédicat désignant les dates non sélectionnables. */
export type DateMatcher = string[] | ((iso: string) => boolean)

/** Valeur du v-model, selon `selection`. */
export type CalendarValue = string | null | DateRange | string[]

interface CalendarProps {
  /** Type de sélection. */
  selection?: CalendarSelection
  /**
   * Locale BCP 47 (noms de mois/jours, 1er jour de semaine). PRIORITAIRE sur la
   * locale globale du DS (`setLocale`), sur laquelle elle retombe à défaut —
   * d'où l'absence de défaut littéral ici : `undefined` doit rester
   * distinguable pour que la locale globale ait une chance de s'appliquer.
   */
  locale?: string
  /** Force le 1er jour de semaine (0 = dimanche … 6 = samedi). Défaut : locale. */
  firstDayOfWeek?: number
  /** Borne minimale ISO : navigation et sélection impossibles avant. */
  min?: string
  /** Borne maximale ISO : navigation et sélection impossibles après. */
  max?: string
  /** Dates non sélectionnables (barrées) : tableau d'ISO ou prédicat. */
  disabledDates?: DateMatcher
  /** Afficher les jours des mois adjacents (grisés) dans la grille. Désactivé
      par défaut : activer via `show-adjacent-days`. */
  showAdjacentDays?: boolean
  /** Rendre cliquables les jours des mois adjacents (navigue vers leur mois).
      Implique leur affichage. */
  selectAdjacentDays?: boolean
  /** Événements → pastilles colorées sous les dates (max 3 par date). */
  events?: CalendarEvent[]
}

const props = withDefaults(defineProps<CalendarProps>(), {
  selection: 'single',
  locale: undefined,
  firstDayOfWeek: undefined,
  min: undefined,
  max: undefined,
  disabledDates: undefined,
  showAdjacentDays: false,
  selectAdjacentDays: false,
  events: undefined,
})

const model = defineModel<CalendarValue>({ default: null })

const emit = defineEmits<{
  /** Émis à chaque sélection (valeur complète courante). Le VDatePicker s'en sert
      pour fermer en sélection simple. */
  select: [value: CalendarValue]
}>()

defineSlots<{
  /** Contenu personnalisé d'une cellule jour (ex. prix d'un billet). */
  day?(props: {
    iso: string
    day: number
    inMonth: boolean
    disabled: boolean
    selected: boolean
    today: boolean
    inRange: boolean
    events: CalendarEvent[]
  }): unknown
  /** Zone basse : boutons d'action (Fermer/Sauvegarder) ou presets. */
  footer?(): unknown
}>()

const gridLabelId = useId()

// ── Localisation ────────────────────────────────────────────────────────────
// Libellés de navigation : aucune prop dédiée, le dictionnaire est le seul
// point de surcharge (globale ou par langue) — cf. `src/i18n/`.
const m = useMessages()
const dsLocale = useLocale()
/* Prop prioritaire, sinon locale globale du DS (idiome `props.x ?? contexte`
   de VAvatar). Une seule dérivation : toutes les lectures passent par elle. */
const resolvedLocale = computed(() => props.locale ?? dsLocale.value)

const resolvedFirstDay = computed(
  () => props.firstDayOfWeek ?? firstDayOfWeekFor(resolvedLocale.value),
)
const weekdays = computed(() => weekdayNames(resolvedLocale.value, resolvedFirstDay.value, 'short'))
const weekdaysLong = computed(() =>
  weekdayNames(resolvedLocale.value, resolvedFirstDay.value, 'long'),
)
const monthLabels = computed(() => monthNamesCompact(resolvedLocale.value))

// ── Valeur normalisée par type de sélection ──────────────────────────────────────────────
const singleValue = computed(() =>
  props.selection === 'single' && typeof model.value === 'string' && isValidISO(model.value)
    ? model.value
    : null,
)
const rangeValue = computed<DateRange>(() => {
  if (
    props.selection === 'range' &&
    model.value &&
    typeof model.value === 'object' &&
    !Array.isArray(model.value)
  ) {
    return model.value as DateRange
  }
  return { start: null, end: null }
})
const multipleValues = computed<string[]>(() =>
  props.selection === 'multiple' && Array.isArray(model.value) ? model.value : [],
)

// ── État de vue : focusedISO est la source de vérité du mois affiché ─────────
function initialFocus(): string {
  if (singleValue.value) return singleValue.value
  if (rangeValue.value.start) return rangeValue.value.start
  if (multipleValues.value[0]) return multipleValues.value[0]
  // Repli : aujourd'hui (heure locale), clampé aux bornes.
  return clampISO(formatISO(new Date()), props.min, props.max)
}
const focusedISO = ref(initialFocus())
const view = ref<'days' | 'months' | 'years'>('days')

const viewYear = computed(
  () => parseISO(focusedISO.value)?.getFullYear() ?? new Date().getFullYear(),
)
const viewMonth0 = computed(() => parseISO(focusedISO.value)?.getMonth() ?? 0)
const monthLabel = computed(() => monthName(resolvedLocale.value, viewMonth0.value, 'long'))
const gridLabel = computed(() => `${monthLabel.value} ${viewYear.value}`)

// aujourd'hui : posé au montage (client) → pas de mismatch d'hydratation SSR
const today = ref<string | null>(null)
onMounted(() => {
  today.value = formatISO(new Date())
})

// ── Dates désactivées ───────────────────────────────────────────────────────
const isDisabledDate = computed(() => resolveMatcher(props.disabledDates))

// ── Événements indexés par date ─────────────────────────────────────────────
const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>()
  for (const ev of props.events ?? []) {
    const list = map.get(ev.date) ?? []
    list.push(ev)
    map.set(ev.date, list)
  }
  return map
})

// ── Plage effective (avec prévisualisation au survol/focus) ─────────────────
const hoverISO = ref<string | null>(null)
function orderRange(a: string, b: string): DateRange {
  return compareISO(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a }
}
const effectiveRange = computed<DateRange>(() => {
  if (props.selection !== 'range') return { start: null, end: null }
  const r = rangeValue.value
  if (r.start && r.end) return orderRange(r.start, r.end)
  // start posé, end en attente : prévisualise jusqu'au survol/focus courant
  const preview = hoverISO.value ?? focusedISO.value
  if (r.start && preview) return orderRange(r.start, preview)
  return { start: r.start, end: r.end }
})

function isSelected(iso: string): boolean {
  if (props.selection === 'single') return isSameISO(iso, singleValue.value)
  if (props.selection === 'multiple') return multipleValues.value.includes(iso)
  // range : extrémités effectives (prévisualisation comprise)
  return isSameISO(iso, effectiveRange.value.start) || isSameISO(iso, effectiveRange.value.end)
}
function isInRange(iso: string): boolean {
  const { start, end } = effectiveRange.value
  return !!start && !!end && compareISO(iso, start) >= 0 && compareISO(iso, end) <= 0
}

// ── Grille des jours ────────────────────────────────────────────────────────
type DayCell = {
  iso: string
  day: number
  kind: 'empty' | 'static' | 'button'
  inMonth: boolean
  disabled: boolean
  selected: boolean
  rangeStart: boolean
  rangeEnd: boolean
  inRange: boolean
  today: boolean
  events: CalendarEvent[]
}

const days = computed<DayCell[]>(() =>
  buildMonthGrid(viewYear.value, viewMonth0.value, resolvedFirstDay.value).map((cell) => {
    const inMonth = cell.adjacent === null
    // selectAdjacentDays implique l'affichage (un jour cliquable doit être visible)
    const show = inMonth || props.showAdjacentDays || props.selectAdjacentDays
    const selectable = inMonth || props.selectAdjacentDays
    const disabled = !isWithin(cell.iso, props.min, props.max) || isDisabledDate.value(cell.iso)
    const kind: DayCell['kind'] = !show ? 'empty' : selectable ? 'button' : 'static'
    return {
      iso: cell.iso,
      day: parseISO(cell.iso)?.getDate() ?? 0,
      kind,
      inMonth,
      disabled,
      selected: kind === 'button' && !disabled && isSelected(cell.iso),
      rangeStart: props.selection === 'range' && isSameISO(cell.iso, effectiveRange.value.start),
      rangeEnd: props.selection === 'range' && isSameISO(cell.iso, effectiveRange.value.end),
      inRange: props.selection === 'range' && isInRange(cell.iso),
      today: isSameISO(cell.iso, today.value),
      events: eventsByDate.value.get(cell.iso) ?? [],
    }
  }),
)
const weeks = computed(() => {
  const rows: DayCell[][] = []
  for (let i = 0; i < days.value.length; i += 7) rows.push(days.value.slice(i, i + 7))
  return rows
})

// ── Bornes de navigation ────────────────────────────────────────────────────
function monthHasSelectable(year: number, month0: number): boolean {
  const first = isoOf(year, month0, 1)
  const last = isoOf(year, month0, daysInMonth(year, month0))
  return (
    (!props.max || compareISO(first, props.max) <= 0) &&
    (!props.min || compareISO(last, props.min) >= 0)
  )
}
const canPrevMonth = computed(() => {
  const prev = addMonths(focusedISO.value, -1)
  const d = parseISO(prev)!
  return monthHasSelectable(d.getFullYear(), d.getMonth())
})
const canNextMonth = computed(() => {
  const next = addMonths(focusedISO.value, 1)
  const d = parseISO(next)!
  return monthHasSelectable(d.getFullYear(), d.getMonth())
})
const canPrevYear = computed(
  () => !props.min || compareISO(isoOf(viewYear.value - 1, 11, 31), props.min) >= 0,
)
const canNextYear = computed(
  () => !props.max || compareISO(isoOf(viewYear.value + 1, 0, 1), props.max) <= 0,
)

// ── Focus DOM d'une cellule (roving) ────────────────────────────────────────
const dayId = (iso: string) => `${gridLabelId}-d-${iso}`
function focusDay(iso: string) {
  nextTick(() => document.getElementById(dayId(iso))?.focus())
}

// ── Navigation ──────────────────────────────────────────────────────────────
function goTo(iso: string, moveFocus = false) {
  focusedISO.value = clampISO(iso, props.min, props.max)
  if (moveFocus && view.value === 'days') focusDay(focusedISO.value)
}
function stepMonth(delta: number) {
  goTo(addMonths(focusedISO.value, delta))
}
function stepYear(delta: number) {
  goTo(addMonths(focusedISO.value, delta * 12))
}

function toggleView(target: 'months' | 'years') {
  const next = view.value === target ? 'days' : target
  view.value = next
  if (next === 'months') {
    focusedMonth.value = viewMonth0.value
    nextTick(() => monthCellEl(viewMonth0.value)?.focus())
  } else if (next === 'years') {
    focusedYear.value = viewYear.value
    nextTick(() => {
      yearCellEl(viewYear.value)?.scrollIntoView({ block: 'center' })
      yearCellEl(viewYear.value)?.focus()
    })
  } else if (view.value === 'days') {
    focusDay(focusedISO.value)
  }
}

// ── Sélection ───────────────────────────────────────────────────────────────
function selectDay(cell: DayCell) {
  if (cell.kind !== 'button' || cell.disabled) return
  focusedISO.value = cell.iso
  if (props.selection === 'single') {
    model.value = cell.iso
  } else if (props.selection === 'multiple') {
    model.value = toggleValue(multipleValues.value, cell.iso).sort(compareISO)
  } else {
    // range : 1er clic = start ; 2e = end (réordonné) ; 3e = recommence
    const r = rangeValue.value
    if (!r.start || (r.start && r.end)) {
      model.value = { start: cell.iso, end: null }
    } else {
      model.value = orderRange(r.start, cell.iso)
    }
  }
  emit('select', model.value)
}

// ── Clavier (vue jours) ─────────────────────────────────────────────────────
function onDaysKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const cell = days.value.find((c) => c.iso === focusedISO.value)
    if (cell) selectDay(cell)
    return
  }
  const d = parseISO(focusedISO.value)!
  const offset = (d.getDay() - resolvedFirstDay.value + 7) % 7
  let next: string
  switch (event.key) {
    case 'ArrowRight':
      next = addDays(focusedISO.value, 1)
      break
    case 'ArrowLeft':
      next = addDays(focusedISO.value, -1)
      break
    case 'ArrowDown':
      next = addDays(focusedISO.value, 7)
      break
    case 'ArrowUp':
      next = addDays(focusedISO.value, -7)
      break
    case 'Home':
      next = addDays(focusedISO.value, -offset)
      break
    case 'End':
      next = addDays(focusedISO.value, 6 - offset)
      break
    case 'PageUp':
      next = addMonths(focusedISO.value, event.shiftKey ? -12 : -1)
      break
    case 'PageDown':
      next = addMonths(focusedISO.value, event.shiftKey ? 12 : 1)
      break
    default:
      return
  }
  event.preventDefault()
  goTo(next, true)
}

// ── Vue mois ────────────────────────────────────────────────────────────────
const focusedMonth = ref(viewMonth0.value)
const monthCellEl = (i: number) =>
  document.getElementById(`${gridLabelId}-m-${i}`) as HTMLElement | null
function monthSelectable(i: number) {
  return monthHasSelectable(viewYear.value, i)
}
function chooseMonth(i: number) {
  if (!monthSelectable(i)) return
  const day = Math.min(parseISO(focusedISO.value)!.getDate(), daysInMonth(viewYear.value, i))
  goTo(isoOf(viewYear.value, i, day))
  view.value = 'days'
  focusDay(focusedISO.value)
}
function onMonthsKeydown(event: KeyboardEvent) {
  const deltas: Record<string, number> = {
    ArrowRight: 1,
    ArrowLeft: -1,
    ArrowDown: 3,
    ArrowUp: -3,
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    chooseMonth(focusedMonth.value)
    return
  }
  const delta = deltas[event.key]
  if (delta === undefined) return
  event.preventDefault()
  focusedMonth.value = clamp(focusedMonth.value + delta, 0, 11)
  monthCellEl(focusedMonth.value)?.focus()
}

// ── Vue années ──────────────────────────────────────────────────────────────
const yearRange = computed(() => {
  const minY = props.min ? parseISO(props.min)!.getFullYear() : viewYear.value - 100
  const maxY = props.max ? parseISO(props.max)!.getFullYear() : viewYear.value + 100
  const list: number[] = []
  for (let y = minY; y <= maxY; y++) list.push(y)
  return list
})
const focusedYear = ref(viewYear.value)
const yearCellEl = (y: number) =>
  document.getElementById(`${gridLabelId}-y-${y}`) as HTMLElement | null
function chooseYear(y: number) {
  const month = viewMonth0.value
  const day = Math.min(parseISO(focusedISO.value)!.getDate(), daysInMonth(y, month))
  goTo(isoOf(y, month, day))
  view.value = 'days'
  focusDay(focusedISO.value)
}
function onYearsKeydown(event: KeyboardEvent) {
  const deltas: Record<string, number> = {
    ArrowRight: 1,
    ArrowLeft: -1,
    ArrowDown: 3,
    ArrowUp: -3,
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    chooseYear(focusedYear.value)
    return
  }
  const delta = deltas[event.key]
  if (delta === undefined) return
  event.preventDefault()
  const list = yearRange.value
  const idx = list.indexOf(focusedYear.value)
  const nextIdx = clamp(idx + delta, 0, list.length - 1)
  focusedYear.value = list[nextIdx] ?? focusedYear.value
  yearCellEl(focusedYear.value)?.focus()
}

// Suit la sélection externe : si la valeur primaire change de mois, on recadre.
watch(
  () => [singleValue.value, rangeValue.value.start, multipleValues.value[0]],
  () => {
    const primary = singleValue.value ?? rangeValue.value.start ?? multipleValues.value[0]
    if (primary && isValidISO(primary)) {
      const d = parseISO(primary)!
      if (d.getFullYear() !== viewYear.value || d.getMonth() !== viewMonth0.value) {
        focusedISO.value = primary
      }
    }
  },
)

/** Amène le focus dans la grille (utilisé par le VDatePicker à l'ouverture). */
function focus() {
  view.value = 'days'
  focusDay(focusedISO.value)
}
defineExpose({ focus })
</script>

<template>
  <div
    class="v-calendar"
    :data-view="view"
    :data-selection="selection"
    @pointerleave="hoverISO = null"
  >
    <!-- En-tête : sélecteurs mois & année avec chevrons ± -->
    <div class="v-calendar-header">
      <div class="v-calendar-nav">
        <VIconButton
          icon="chevron_left"
          :label="m.calendar.previousMonth"
          size="sm"
          :disabled="!canPrevMonth"
          @click="stepMonth(-1)"
        />
        <VButton
          variant="ghost"
          tone="neutral"
          size="sm"
          class="v-calendar-picker-toggle"
          :aria-expanded="view === 'months'"
          :aria-label="monthLabel"
          @click="toggleView('months')"
        >
          {{ monthLabels[viewMonth0] }}
          <VIcon
            :name="view === 'months' ? 'arrow_drop_up' : 'arrow_drop_down'"
            aria-hidden="true"
          />
        </VButton>
        <VIconButton
          icon="chevron_right"
          :label="m.calendar.nextMonth"
          size="sm"
          :disabled="!canNextMonth"
          @click="stepMonth(1)"
        />
      </div>

      <div class="v-calendar-nav">
        <VIconButton
          icon="chevron_left"
          :label="m.calendar.previousYear"
          size="sm"
          :disabled="!canPrevYear"
          @click="stepYear(-1)"
        />
        <VButton
          variant="ghost"
          tone="neutral"
          size="sm"
          class="v-calendar-picker-toggle"
          :aria-expanded="view === 'years'"
          @click="toggleView('years')"
        >
          {{ viewYear }}
          <VIcon
            :name="view === 'years' ? 'arrow_drop_up' : 'arrow_drop_down'"
            aria-hidden="true"
          />
        </VButton>
        <VIconButton
          icon="chevron_right"
          :label="m.calendar.nextYear"
          size="sm"
          :disabled="!canNextYear"
          @click="stepYear(1)"
        />
      </div>
    </div>

    <!-- Vue jours -->
    <div
      v-show="view === 'days'"
      class="v-calendar-grid"
      role="grid"
      :aria-label="gridLabel"
      :aria-multiselectable="selection === 'multiple' ? 'true' : undefined"
      @keydown="onDaysKeydown"
    >
      <div class="v-calendar-weekdays" role="row">
        <span
          v-for="(w, i) in weekdays"
          :key="w"
          class="v-calendar-weekday"
          role="columnheader"
          :aria-label="weekdaysLong[i]"
          >{{ w }}</span
        >
      </div>
      <div v-for="(week, wi) in weeks" :key="wi" class="v-calendar-week" role="row">
        <div
          v-for="cell in week"
          :key="cell.iso"
          class="v-calendar-cell"
          role="gridcell"
          :aria-selected="cell.kind === 'button' ? cell.selected : undefined"
          :data-in-range="cell.inRange ? '' : undefined"
          :data-range-start="cell.rangeStart ? '' : undefined"
          :data-range-end="cell.rangeEnd ? '' : undefined"
        >
          <button
            v-if="cell.kind === 'button'"
            :id="dayId(cell.iso)"
            type="button"
            class="v-calendar-day"
            :tabindex="cell.iso === focusedISO ? 0 : -1"
            :data-outside="!cell.inMonth ? '' : undefined"
            :data-selected="cell.selected ? '' : undefined"
            :data-today="cell.today ? '' : undefined"
            :aria-disabled="cell.disabled ? 'true' : undefined"
            :aria-current="cell.today ? 'date' : undefined"
            @click="selectDay(cell)"
            @pointerenter="hoverISO = cell.iso"
            @focus="hoverISO = cell.iso"
          >
            <slot
              name="day"
              :iso="cell.iso"
              :day="cell.day"
              :in-month="cell.inMonth"
              :disabled="cell.disabled"
              :selected="cell.selected"
              :today="cell.today"
              :in-range="cell.inRange"
              :events="cell.events"
            >
              <span class="v-calendar-day-num">{{ cell.day }}</span>
            </slot>
            <span v-if="cell.events.length" class="v-calendar-dots" aria-hidden="true">
              <span
                v-for="(ev, ei) in cell.events.slice(0, 3)"
                :key="ei"
                class="v-calendar-dot"
                :style="ev.color ? { '--calendar-dot-color': ev.color } : undefined"
              />
            </span>
          </button>
          <!-- jour adjacent non sélectionnable : même slot que les jours boutons,
               sinon un contenu personnalisé multi-lignes ne s'appliquerait qu'aux
               jours du mois et les numéros ne s'aligneraient plus d'une case à
               l'autre (le slot reçoit `inMonth` pour différencier le rendu) -->
          <span
            v-else-if="cell.kind === 'static'"
            class="v-calendar-day v-calendar-day--static"
            :data-disabled="cell.disabled ? '' : undefined"
          >
            <slot
              name="day"
              :iso="cell.iso"
              :day="cell.day"
              :in-month="cell.inMonth"
              :disabled="cell.disabled"
              :selected="cell.selected"
              :today="cell.today"
              :in-range="cell.inRange"
              :events="cell.events"
            >
              <span class="v-calendar-day-num">{{ cell.day }}</span>
            </slot>
          </span>
        </div>
      </div>
    </div>

    <!-- Vue mois -->
    <div
      v-if="view === 'months'"
      class="v-calendar-picker"
      role="grid"
      :aria-label="m.calendar.monthPicker"
      @keydown="onMonthsKeydown"
    >
      <button
        v-for="(name, i) in monthLabels"
        :id="`${gridLabelId}-m-${i}`"
        :key="name"
        type="button"
        class="v-calendar-picker-cell"
        role="gridcell"
        :tabindex="i === focusedMonth ? 0 : -1"
        :data-selected="i === viewMonth0 ? '' : undefined"
        :aria-selected="i === viewMonth0 ? 'true' : undefined"
        :disabled="!monthSelectable(i)"
        @click="chooseMonth(i)"
      >
        {{ name }}
      </button>
    </div>

    <!-- Vue années -->
    <div
      v-if="view === 'years'"
      class="v-calendar-picker v-calendar-picker--years"
      role="grid"
      :aria-label="m.calendar.yearPicker"
      @keydown="onYearsKeydown"
    >
      <button
        v-for="y in yearRange"
        :id="`${gridLabelId}-y-${y}`"
        :key="y"
        type="button"
        class="v-calendar-picker-cell"
        role="gridcell"
        :tabindex="y === focusedYear ? 0 : -1"
        :data-selected="y === viewYear ? '' : undefined"
        :aria-selected="y === viewYear ? 'true' : undefined"
        @click="chooseYear(y)"
      >
        {{ y }}
      </button>
    </div>

    <div v-if="$slots.footer" class="v-calendar-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-calendar {
    /* Taille du rond (jour) configurable par le consommateur ; la cellule (zone
       de survol / colonne) s'agrandit avec, sans jamais passer sous le token. */
    --calendar-day-size: var(--vectis-calendar-day-size, var(--vectis-control-height-md));
    --calendar-cell: max(
      var(--vectis-control-size-calendar-cell),
      calc(var(--calendar-day-size) + var(--vectis-space-1))
    );
    display: inline-flex;
    flex-direction: column;
    gap: var(--vectis-space-2);
    padding: var(--vectis-space-3);
    font-family: var(--vectis-text-family);
    color: var(--vectis-color-text);
  }

  /* Tous les blocs s'étirent sur la largeur du calendrier (stretch par défaut) :
     la grille jours occupe 100 % via des colonnes 1fr, largeur plancher = 7 cellules. */
  .v-calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--vectis-space-2);
  }

  .v-calendar-nav {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-1);
  }

  /* largeur minimale stable pour que les chevrons ne se décalent pas selon la
     longueur du libellé mois/année */
  .v-calendar-picker-toggle {
    min-inline-size: var(--vectis-control-size-calendar-nav-min);
    /* semibold : emphase du libellé mois/année (repère principal de la grille) */
    font-weight: var(--vectis-font-weight-semibold);
    text-transform: capitalize;
  }

  /* ── Grille jours ── */
  /* Largeur plancher = 7 cellules ; sinon la grille s'étire à la largeur du
     calendrier (imposée par l'en-tête) et les colonnes 1fr se répartissent. */
  .v-calendar-grid {
    min-inline-size: calc(7 * var(--calendar-cell));
  }

  .v-calendar-weekdays,
  .v-calendar-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  .v-calendar-weekday {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--vectis-control-height-sm);
    /* Micro-en-tête de colonne : rôle overline (la casse reste `capitalize`,
       convention des calendriers, pas les capitales de la variante VTypography) */
    font-size: var(--vectis-text-overline-size);
    font-weight: var(--vectis-text-overline-weight);
    letter-spacing: var(--vectis-text-overline-tracking);
    color: var(--vectis-color-text-muted);
    text-transform: capitalize;
  }

  .v-calendar-cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--calendar-cell);
  }

  /* Bande de plage : fond teinté à la HAUTEUR du rond (pas de la cellule), posé
     derrière le jour. Marge = demi-écart cellule↔rond, calculée en `%` pour
     suivre la largeur réelle de la colonne (1fr). Aux extrémités la bande
     s'arrête pile au bord du rond (inset du côté extérieur) et son coin s'arrondit
     au rayon du rond (pill plafonné à la moitié de la hauteur = rayon du cercle),
     sans dépasser. */
  .v-calendar-cell[data-in-range]::before {
    content: '';
    position: absolute;
    inset-block: calc((100% - var(--calendar-day-size)) / 2);
    inset-inline: 0;
    background: var(--vectis-color-accent-surface);
    z-index: 0;
  }
  .v-calendar-cell[data-range-start]::before {
    inset-inline-start: calc((100% - var(--calendar-day-size)) / 2);
    border-start-start-radius: var(--vectis-radius-pill);
    border-end-start-radius: var(--vectis-radius-pill);
  }
  .v-calendar-cell[data-range-end]::before {
    inset-inline-end: calc((100% - var(--calendar-day-size)) / 2);
    border-start-end-radius: var(--vectis-radius-pill);
    border-end-end-radius: var(--vectis-radius-pill);
  }
  .v-calendar-cell[data-range-start][data-range-end]::before {
    content: none;
  }

  .v-calendar-day {
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    inline-size: var(--calendar-day-size);
    block-size: var(--calendar-day-size);
    padding: 0;
    border: none;
    border-radius: var(--vectis-radius-pill);
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: var(--vectis-text-body-md-size);
    cursor: pointer;
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  /* hover réservé aux jours cliquables : ni désactivés, ni sélectionnés, ni les
     jours adjacents non sélectionnables (spans statiques) */
  .v-calendar-day:hover:not([aria-disabled='true']):not([data-selected]):not(
      .v-calendar-day--static
    ) {
    background: var(--vectis-color-surface-muted);
  }

  .v-calendar-day[data-outside] {
    color: var(--vectis-color-text-subtle);
  }

  /* semibold ci-dessous : emphases d'état (aujourd'hui, sélection), pas des
     rôles typographiques */
  .v-calendar-day[data-today]:not([data-selected]) {
    box-shadow: inset 0 0 0 1px var(--vectis-color-accent-border);
    color: var(--vectis-color-accent-text);
    font-weight: var(--vectis-font-weight-semibold);
  }

  .v-calendar-day[data-selected] {
    background: var(--vectis-color-accent);
    color: var(--vectis-color-text-on-accent);
    font-weight: var(--vectis-font-weight-semibold);
  }

  .v-calendar-day[aria-disabled='true'] {
    color: var(--vectis-color-text-subtle);
    text-decoration: line-through;
    cursor: not-allowed;
  }

  .v-calendar-day--static {
    color: var(--vectis-color-text-subtle);
    cursor: default;
  }

  /* jour adjacent hors [min,max] ou désactivé : barré comme une date désactivée */
  .v-calendar-day--static[data-disabled] {
    text-decoration: line-through;
    cursor: not-allowed;
  }

  .v-calendar-day:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-calendar-day-num {
    line-height: var(--vectis-text-control-leading);
  }

  .v-calendar-dots {
    position: absolute;
    inset-block-end: calc(var(--vectis-space-1) * 0.5);
    display: flex;
    gap: 2px;
  }
  .v-calendar-dot {
    inline-size: var(--vectis-control-size-calendar-dot);
    block-size: var(--vectis-control-size-calendar-dot);
    border-radius: var(--vectis-radius-pill);
    background: var(--calendar-dot-color, var(--vectis-color-accent));
  }
  .v-calendar-day[data-selected] .v-calendar-dot {
    background: var(--vectis-color-text-on-accent);
  }

  /* ── Vues mois / années ── */
  /* Pleine largeur (comme la grille jours) via stretch + colonnes 1fr. */
  .v-calendar-picker {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--vectis-space-1);
    min-inline-size: calc(7 * var(--calendar-cell));
  }
  .v-calendar-picker--years {
    max-block-size: calc(6 * var(--calendar-cell));
    overflow-y: auto;
  }

  .v-calendar-picker-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    block-size: var(--vectis-control-height-lg);
    border: none;
    border-radius: var(--vectis-radius-pill);
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: var(--vectis-text-body-md-size);
    text-transform: capitalize;
    cursor: pointer;
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }
  .v-calendar-picker-cell:hover:not(:disabled):not([data-selected]) {
    background: var(--vectis-color-surface-muted);
  }
  .v-calendar-picker-cell[data-selected] {
    background: var(--vectis-color-accent);
    color: var(--vectis-color-text-on-accent);
    /* semibold : emphase d'état, pas un rôle typo */
    font-weight: var(--vectis-font-weight-semibold);
  }
  .v-calendar-picker-cell:disabled {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }
  .v-calendar-picker-cell:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  /* ── Footer ── */
  .v-calendar-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--vectis-space-2);
    padding-block-start: var(--vectis-space-2);
    border-block-start: 1px solid var(--vectis-color-border);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-calendar-day,
    .v-calendar-picker-cell {
      transition: none;
    }
  }
}
</style>
