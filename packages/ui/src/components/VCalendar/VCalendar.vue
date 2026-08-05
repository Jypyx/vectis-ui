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
 * A reusable inline calendar (a grid), Material-inspired. It holds ALL the date, view
 * (days / months / years) and keyboard logic; VDatePicker merely dresses it in a field
 * + a popover.
 *
 * The platform provides no accessible date grid (`<input type=date>` is neither
 * stylable nor composable): the JS therefore implements the ARIA "grid" pattern —
 * roving tabindex, arrows/PageUp/PageDown, single/range/multiple selection — which
 * HTML/CSS alone do not cover. Everything is computed in local time through ISO
 * `YYYY-MM-DD` strings (see `utils/date`, SSR-safe).
 */
export type CalendarSelection = 'single' | 'range' | 'multiple'

/** A date range (the `range` selection). The bounds are optional while typing. */
export interface DateRange {
  start: string | null
  end: string | null
}

/** An event displayed under a date as a coloured dot. */
export interface CalendarEvent {
  /** ISO `YYYY-MM-DD` date. */
  date: string
  /** CSS colour of the dot (default: accent). */
  color?: string
  /** Accessible label of the event. */
  label?: string
}

/** A list of ISO strings or a predicate designating the non-selectable dates. */
export type DateMatcher = string[] | ((iso: string) => boolean)

/** Value of the v-model, depending on `selection`. */
export type CalendarValue = string | null | DateRange | string[]

interface CalendarProps {
  /** Kind of selection. */
  selection?: CalendarSelection
  /**
   * A BCP 47 locale (month/day names, the first day of the week). It TAKES PRECEDENCE
   * over the DS's global locale (`setLocale`), which it falls back to — hence the
   * absence of a literal default here: `undefined` must stay distinguishable for the
   * global locale to have a chance to apply.
   */
  locale?: string
  /** Forces the first day of the week (0 = Sunday … 6 = Saturday). Default: the locale's. */
  firstDayOfWeek?: number
  /** Minimum ISO bound: neither navigation nor selection is possible before it. */
  min?: string
  /** Maximum ISO bound: neither navigation nor selection is possible after it. */
  max?: string
  /** Non-selectable dates (struck through): an array of ISO strings or a predicate. */
  disabledDates?: DateMatcher
  /** Displays the days of the adjacent months (greyed) in the grid. Off by default:
      enable it through `show-adjacent-days`. */
  showAdjacentDays?: boolean
  /** Makes the days of the adjacent months clickable (navigating to their month).
      It implies displaying them. */
  selectAdjacentDays?: boolean
  /** Events → coloured dots under the dates (at most 3 per date). */
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
  /** Emitted on every selection (the current full value). VDatePicker uses it to close
      in single selection. */
  select: [value: CalendarValue]
}>()

defineSlots<{
  /** Custom content of a day cell (a ticket price, for instance). */
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
  /** The bottom zone: action buttons (Close/Save) or presets. */
  footer?(): unknown
}>()

const gridLabelId = useId()

// Localization. Navigation labels: no dedicated prop, the dictionary is the only
// override point (globally or per language) — see `src/i18n/`.
const m = useMessages()
const vectisLocale = useLocale()
/* The prop takes precedence, otherwise the DS's global locale (the `props.x ?? context`
   idiom). A single derivation: every read goes through it. */
const resolvedLocale = computed(() => props.locale ?? vectisLocale.value)

const resolvedFirstDay = computed(
  () => props.firstDayOfWeek ?? firstDayOfWeekFor(resolvedLocale.value),
)
const weekdays = computed(() => weekdayNames(resolvedLocale.value, resolvedFirstDay.value, 'short'))
const weekdaysLong = computed(() =>
  weekdayNames(resolvedLocale.value, resolvedFirstDay.value, 'long'),
)
const monthLabels = computed(() => monthNamesCompact(resolvedLocale.value))

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

// View state: focusedISO is the source of truth for the displayed month.
function initialFocus(): string {
  if (singleValue.value) return singleValue.value
  if (rangeValue.value.start) return rangeValue.value.start
  if (multipleValues.value[0]) return multipleValues.value[0]
  // Fallback: today (in local time), clamped to the bounds.
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

// today: set on mount (client-side) → no SSR hydration mismatch
const today = ref<string | null>(null)
onMounted(() => {
  today.value = formatISO(new Date())
})

const isDisabledDate = computed(() => resolveMatcher(props.disabledDates))

const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>()
  for (const ev of props.events ?? []) {
    const list = map.get(ev.date) ?? []
    list.push(ev)
    map.set(ev.date, list)
  }
  return map
})

const hoverISO = ref<string | null>(null)
function orderRange(a: string, b: string): DateRange {
  return compareISO(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a }
}
const effectiveRange = computed<DateRange>(() => {
  if (props.selection !== 'range') return { start: null, end: null }
  const r = rangeValue.value
  if (r.start && r.end) return orderRange(r.start, r.end)
  // start set, end pending: preview up to the current hover/focus
  const preview = hoverISO.value ?? focusedISO.value
  if (r.start && preview) return orderRange(r.start, preview)
  return { start: r.start, end: r.end }
})

function isSelected(iso: string): boolean {
  if (props.selection === 'single') return isSameISO(iso, singleValue.value)
  if (props.selection === 'multiple') return multipleValues.value.includes(iso)
  // range: the effective ends (the preview included)
  return isSameISO(iso, effectiveRange.value.start) || isSameISO(iso, effectiveRange.value.end)
}
function isInRange(iso: string): boolean {
  const { start, end } = effectiveRange.value
  return !!start && !!end && compareISO(iso, start) >= 0 && compareISO(iso, end) <= 0
}

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
    // selectAdjacentDays implies displaying them (a clickable day has to be visible)
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

// DOM focus of a cell (roving).
const dayId = (iso: string) => `${gridLabelId}-d-${iso}`
function focusDay(iso: string) {
  nextTick(() => document.getElementById(dayId(iso))?.focus())
}

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

function selectDay(cell: DayCell) {
  if (cell.kind !== 'button' || cell.disabled) return
  focusedISO.value = cell.iso
  if (props.selection === 'single') {
    model.value = cell.iso
  } else if (props.selection === 'multiple') {
    model.value = toggleValue(multipleValues.value, cell.iso).sort(compareISO)
  } else {
    // range: 1st click = start; 2nd = end (reordered); 3rd starts over
    const r = rangeValue.value
    if (!r.start || (r.start && r.end)) {
      model.value = { start: cell.iso, end: null }
    } else {
      model.value = orderRange(r.start, cell.iso)
    }
  }
  emit('select', model.value)
}

// Keyboard (the days view).
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

// Months view.
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

/*
 * Both pickers are a `role="grid"`, which owns rows and NOT cells: a gridcell straight
 * under the grid fails aria-required-children AND aria-required-parent at once. The
 * chunk is 3 wide to match `grid-template-columns` (the row itself is `display: contents`,
 * so the CSS grid is untouched). Keyboard navigation is unaffected: it moves by index
 * (±1 / ±3) and refocuses through the cell ids, never by walking the DOM.
 */
const PICKER_COLUMNS = 3
const chunk = <T,>(list: T[]) =>
  Array.from({ length: Math.ceil(list.length / PICKER_COLUMNS) }, (_, r) =>
    list.slice(r * PICKER_COLUMNS, r * PICKER_COLUMNS + PICKER_COLUMNS),
  )

const monthRows = computed(() => chunk(monthLabels.value.map((name, i) => ({ name, i }))))

// Years view.
const yearRange = computed(() => {
  const minY = props.min ? parseISO(props.min)!.getFullYear() : viewYear.value - 100
  const maxY = props.max ? parseISO(props.max)!.getFullYear() : viewYear.value + 100
  const list: number[] = []
  for (let y = minY; y <= maxY; y++) list.push(y)
  return list
})
const yearRows = computed(() => chunk(yearRange.value))
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

// Follows the external selection: if the primary value changes month, the view moves.
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

/** Brings the focus into the grid (used by VDatePicker on opening). */
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
    <!-- Header: month & year selectors with ± chevrons -->
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

    <!-- Days view -->
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
          <!-- A non-selectable adjacent day: the same slot as the button days,
               otherwise multi-line custom content would only apply to the days of the
               month and the numbers would no longer line up from one cell to the next
               (the slot receives `inMonth` to differentiate the rendering) -->
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

    <!-- Months view -->
    <div
      v-if="view === 'months'"
      class="v-calendar-picker"
      role="grid"
      :aria-label="m.calendar.monthPicker"
      @keydown="onMonthsKeydown"
    >
      <div v-for="(row, r) in monthRows" :key="r" class="v-calendar-picker-row" role="row">
        <button
          v-for="{ name, i } in row"
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
    </div>

    <!-- Years view -->
    <div
      v-if="view === 'years'"
      class="v-calendar-picker v-calendar-picker--years"
      role="grid"
      :aria-label="m.calendar.yearPicker"
      @keydown="onYearsKeydown"
    >
      <div v-for="(row, r) in yearRows" :key="r" class="v-calendar-picker-row" role="row">
        <button
          v-for="y in row"
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
    </div>

    <div v-if="$slots.footer" class="v-calendar-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-calendar {
    /* The dot (day) size is configurable by the consumer; the cell (the hover area /
       the column) grows with it, never dropping below the token. */
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

  /* Every block stretches to the calendar's width (stretch by default): the days grid
     takes 100% through 1fr columns, with a floor width of 7 cells. */
  .v-calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--vectis-space-2);
  }

  .v-calendar-nav {
    display: flex;
    align-items: center;
  }

  /* A stable minimum width so the chevrons do not shift with the length of the
     month/year label */
  .v-calendar-picker-toggle {
    min-inline-size: var(--vectis-control-size-calendar-nav-min);
    /* semibold: emphasis on the month/year label (the grid's main landmark) */
    font-weight: var(--vectis-font-weight-semibold);
    text-transform: capitalize;
  }

  /* Days grid. Floor width = 7 cells; otherwise the grid stretches to the calendar's
     width (set by the header) and the 1fr columns share it out. */
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
    /* Column micro-header: the overline role (the case stays `capitalize`, the calendar
       convention, not the VTypography variant's capitals) */
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

  /* The range band: a tinted background at the HEIGHT of the dot (not the cell's), laid
     behind the day. The margin = half the cell↔dot gap, computed in `%` so it follows the
     column's real width (1fr). At the ends the band stops exactly at the dot's edge (an
     inset on the outer side) and its corner rounds to the dot's radius (a pill capped at
     half the height = the circle's radius), without overshooting. */
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

  /* Hover is reserved for clickable days: neither disabled, nor selected, nor the
     non-selectable adjacent days (static spans) */
  .v-calendar-day:hover:not([aria-disabled='true']):not([data-selected]):not(
      .v-calendar-day--static
    ) {
    background: var(--vectis-color-surface-muted);
  }

  .v-calendar-day[data-outside] {
    color: var(--vectis-color-text-subtle);
  }

  /* The semibold below: state emphasis (today, the selection), not type roles */
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

  /* An adjacent day outside [min,max] or disabled: struck through like a disabled date */
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

  /* Months / years views. Full width (like the days grid) through stretch + 1fr columns. */
  .v-calendar-picker {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--vectis-space-1);
    min-inline-size: calc(7 * var(--calendar-cell));
  }
  /* The ARIA rows the grid requires, made transparent to the layout: the cells stay
     direct grid items of `.v-calendar-picker`. */
  .v-calendar-picker-row {
    display: contents;
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
    /* semibold: state emphasis, not a type role */
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
