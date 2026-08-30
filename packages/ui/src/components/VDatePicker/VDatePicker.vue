<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'

import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import { arrow_drop_down as arrowDropDownIcon } from '../VIcon/icons/arrow_drop_down'
import { arrow_drop_up as arrowDropUpIcon } from '../VIcon/icons/arrow_drop_up'
import { chevron_left as chevronLeftIcon } from '../VIcon/icons/chevron_left'
import { chevron_right as chevronRightIcon } from '../VIcon/icons/chevron_right'
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

import { PICKER_COLUMNS, dayStep, gridDelta } from './keyboard'

import { toggleValue } from '../../utils/array'
import { resolveMatcher } from '../../utils/matcher'
import { clamp } from '../../utils/number'
import { useLocale, useMessages } from '../../i18n/state'

// @a11y @keyboard @core
/**
 * A calendar shown directly in the page, as a grid of days, with a month view and a
 * year view behind it. It holds ALL the date, view and keyboard logic of the design
 * system; VDateInput does no more than dress it in a text field and a popover.
 *
 * The platform offers no accessible date grid to build on — `<input type="date">`
 * can be neither styled nor composed — so the JavaScript here implements the ARIA
 * "grid" pattern by hand: a single cell in the tab order at a time, arrow and
 * page keys to move between dates, and selection of one date, a range or a list.
 * None of that can be expressed in HTML and CSS alone.
 *
 * Every date is handled in local time as an ISO `YYYY-MM-DD` string (see
 * `utils/date`), which is what keeps the server and the browser in agreement.
 */
export type DatePickerSelection = 'single' | 'range' | 'multiple'

/**
 * A period between two dates, the value of a `range` selection. Either bound may be
 * null: between the first and the second click, a range has a start and no end yet.
 */
export interface DateRange {
  /** The first day of the period, as an ISO `YYYY-MM-DD` string. */
  start: string | null
  /** The last day of the period, as an ISO `YYYY-MM-DD` string. */
  end: string | null
}

/** Something happening on a given day, shown as a coloured dot under its number. */
export interface DatePickerEvent {
  /** The day it falls on, as an ISO `YYYY-MM-DD` string. */
  date: string
  /** The colour of the dot, as any CSS colour. It is the accent colour by default. */
  color?: string
  /** A description of the event for assistive technology. */
  label?: string
}

/**
 * Which dates cannot be selected, given either as a list of ISO strings or as a
 * function answering that question for a date.
 */
export type DateMatcher = string[] | ((iso: string) => boolean)

/** The shape of the v-model, which follows whichever `selection` is in use. */
export type DatePickerValue = string | null | DateRange | string[]

interface DatePickerProps {
  /**
   * What the reader is picking: a single date, a period between two dates, or any
   * number of separate dates. It determines the shape of the v-model.
   */
  selection?: DatePickerSelection
  /**
   * A BCP 47 locale, which decides the month and day names and the first day of the
   * week. It TAKES PRECEDENCE over the design system's global locale (`setLocale`)
   * and falls back to it — which is why it has no literal default here: `undefined`
   * has to stay recognizable for the global locale to have its chance.
   */
  locale?: string
  /**
   * Forces the day the weeks start on (0 for Sunday through 6 for Saturday). Left
   * out, the locale decides.
   */
  firstDayOfWeek?: number
  /**
   * The earliest selectable date, as an ISO string. Neither navigation nor selection
   * goes back beyond it.
   */
  min?: string
  /**
   * The latest selectable date, as an ISO string. Neither navigation nor selection
   * goes past it.
   */
  max?: string
  /**
   * Dates that cannot be chosen, given as a list of ISO strings or as a function.
   * They stay visible, struck through, and can still be reached with the keyboard.
   */
  disabledDates?: DateMatcher
  /**
   * Also fills the empty corners of the grid with the greyed days of the neighbouring
   * months. It is off by default.
   */
  showAdjacentDays?: boolean
  /**
   * Lets those neighbouring days be clicked, which moves the calendar to their month.
   * A clickable day has to be visible, so this implies showing them.
   */
  selectAdjacentDays?: boolean
  /** The events to mark, as up to three coloured dots under the day they fall on. */
  events?: DatePickerEvent[]
}

const props = withDefaults(defineProps<DatePickerProps>(), {
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

const model = defineModel<DatePickerValue>({ default: null })

const emit = defineEmits<{
  /**
   * Emitted every time a date is chosen, carrying the complete value as it now
   * stands. VDateInput listens to it to close its panel on a single selection.
   */
  select: [value: DatePickerValue]
}>()

defineSlots<{
  /**
   * Replaces the content of a day cell — to show a price or an availability under the
   * number, for instance. It receives everything known about that day, including
   * whether it belongs to the displayed month.
   */
  day?(props: {
    iso: string
    day: number
    inMonth: boolean
    disabled: boolean
    selected: boolean
    today: boolean
    inRange: boolean
    events: DatePickerEvent[]
  }): unknown
  /** The strip under the grid, for actions such as Close or Save, or for preset dates. */
  footer?(): unknown
}>()

const gridLabelId = useId()

// The navigation labels have no prop of their own: the dictionary is the single
// place to change them, globally or per language — see `src/i18n/`.
const m = useMessages()
const vectisLocale = useLocale()
/*
 * The prop 'locale' wins, and the design system's global locale is what it falls back to.
 * Every read below goes through this one derivation, so the two sources can never be consulted
 * in a different order somewhere else.
 */
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

// `focusedISO` is the single source of truth for the view: the month on display is
// derived from it, never stored separately, so the two cannot drift apart.
function initialFocus(): string {
  if (singleValue.value) return singleValue.value
  if (rangeValue.value.start) return rangeValue.value.start
  if (multipleValues.value[0]) return multipleValues.value[0]
  // With nothing selected, the calendar opens on today, brought back inside the
  // allowed bounds.
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

// @ssr
// Today's date is only read once the component is mounted, hence on the client: the
// server has no way to know it, and rendering it during setup would make the two
// markups differ and break hydration.
const today = ref<string | null>(null)
onMounted(() => {
  today.value = formatISO(new Date())
})

const isDisabledDate = computed(() => resolveMatcher(props.disabledDates))

const eventsByDate = computed(() => {
  const map = new Map<string, DatePickerEvent[]>()
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
  // A start is set but the end is still pending: the range is previewed up to
  // whichever day the pointer or the focus is currently on.
  const preview = hoverISO.value ?? focusedISO.value
  if (r.start && preview) return orderRange(r.start, preview)
  return { start: r.start, end: r.end }
})

function isSelected(iso: string): boolean {
  if (props.selection === 'single') return isSameISO(iso, singleValue.value)
  if (props.selection === 'multiple') return multipleValues.value.includes(iso)
  // In range selection, the two ends of the period count as selected — including the
  // provisional end shown during the preview.
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
  events: DatePickerEvent[]
}

const days = computed<DayCell[]>(() =>
  buildMonthGrid(viewYear.value, viewMonth0.value, resolvedFirstDay.value).map((cell) => {
    const inMonth = cell.adjacent === null
    // Making the neighbouring days clickable implies showing them: a day nobody can
    // see cannot be clicked.
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

// @a11y
// Moves the real DOM focus onto a day cell. The grid keeps exactly one cell in the
// tab order, so navigating means focusing another one.
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

// @a11y @core — changing view has to carry the focus onto the cell the new view
// opens on. Without that move the focus would stay on a button the view has just
// removed from the document, and the keyboard would have nowhere to go.
function toggleView(target: 'months' | 'years') {
  const next = view.value === target ? 'days' : target
  view.value = next
  if (next === 'months') {
    focusedMonth.value = viewMonth0.value
    nextTick(() => monthCellEl(viewMonth0.value)?.focus())
  } else if (next === 'years') {
    focusedYear.value = viewYear.value
    nextTick(() => {
      const cell = yearCellEl(viewYear.value)
      // Called optionally because jsdom does not implement scrollIntoView (the same
      // guard as VTimeInput's list). Centring the year is a nicety; the focus call
      // below is not, so it must not be taken down with it.
      cell?.scrollIntoView?.({ block: 'center' })
      cell?.focus()
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
    // Range selection reads three clicks: the first sets the start, the second the
    // end (reordered if it comes before the start), and the third starts a new
    // period.
    const r = rangeValue.value
    if (!r.start || (r.start && r.end)) {
      model.value = { start: cell.iso, end: null }
    } else {
      model.value = orderRange(r.start, cell.iso)
    }
  }
  emit('select', model.value)
}

// @keyboard @a11y
// The keyboard of the days view. The table turning a key into a step is pure and
// lives in `./keyboard`; what stays here is the date that step is applied to, and
// the focus move that follows.
function onDaysKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const cell = days.value.find((c) => c.iso === focusedISO.value)
    if (cell) selectDay(cell)
    return
  }
  const d = parseISO(focusedISO.value)!
  // How far the focused day sits from the start of its week, which is exactly what
  // Home and End have to step back and forward by.
  const offset = (d.getDay() - resolvedFirstDay.value + 7) % 7
  const step = dayStep(event.key, event.shiftKey, offset)
  if (!step) return
  event.preventDefault()
  goTo(
    'days' in step
      ? addDays(focusedISO.value, step.days)
      : addMonths(focusedISO.value, step.months),
    true,
  )
}

// The months view, opened from the month button in the header.
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
// @keyboard @a11y
function onMonthsKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    chooseMonth(focusedMonth.value)
    return
  }
  const delta = gridDelta(event.key)
  if (delta === undefined) return
  event.preventDefault()
  focusedMonth.value = clamp(focusedMonth.value + delta, 0, 11)
  monthCellEl(focusedMonth.value)?.focus()
}

// @a11y
/*
 * Both pickers are a `role="grid"`, and a grid owns ROWS, not cells: a gridcell
 * placed straight under the grid fails aria-required-children and
 * aria-required-parent at the same time. The cells are therefore cut into rows of
 * PICKER_COLUMNS, matching the `grid-template-columns` of the stylesheet — the row
 * element itself is `display: contents`, so the CSS grid never sees it.
 *
 * Keyboard navigation is unaffected by this extra level: it moves by index and
 * refocuses cells through their ids, never by walking the DOM.
 */
const chunk = <T,>(list: T[]) =>
  Array.from({ length: Math.ceil(list.length / PICKER_COLUMNS) }, (_, r) =>
    list.slice(r * PICKER_COLUMNS, r * PICKER_COLUMNS + PICKER_COLUMNS),
  )

const monthRows = computed(() => chunk(monthLabels.value.map((name, i) => ({ name, i }))))

// The years view, opened from the year button in the header.
const yearRange = computed(() => {
  /*
   * `min` and `max` come straight from the consumer, and this is the ONLY place
   * where they are turned into a Date instead of being compared as ISO text —
   * `compareISO`, `isWithin` and `clampISO` all tolerate a malformed bound. A value
   * that is not a valid ISO date therefore has to fall back to the open range here:
   * asserting the parse would throw and take the whole render down the moment the
   * years view is opened.
   */
  const minY = parseISO(props.min)?.getFullYear() ?? viewYear.value - 100
  const maxY = parseISO(props.max)?.getFullYear() ?? viewYear.value + 100
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
// @keyboard @a11y
function onYearsKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    chooseYear(focusedYear.value)
    return
  }
  const delta = gridDelta(event.key)
  if (delta === undefined) return
  event.preventDefault()
  const list = yearRange.value
  const idx = list.indexOf(focusedYear.value)
  const nextIdx = clamp(idx + delta, 0, list.length - 1)
  focusedYear.value = list[nextIdx] ?? focusedYear.value
  yearCellEl(focusedYear.value)?.focus()
}

// Follows a selection changed from the outside: when the leading value lands in
// another month, the calendar moves to it rather than leaving the reader in front of
// a grid where nothing is selected.
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

// @a11y
/**
 * Brings the focus into the grid, on the day the calendar is currently showing. This
 * is what VDateInput calls when it opens its panel.
 */
function focus() {
  view.value = 'days'
  focusDay(focusedISO.value)
}
defineExpose({ focus })
</script>

<template>
  <div
    class="v-date-picker"
    :data-view="view"
    :data-selection="selection"
    @pointerleave="hoverISO = null"
  >
    <!-- The header: the month and the year, each between two chevrons that step it,
         and each opening its own picker view when clicked -->
    <div class="v-date-picker-header">
      <div class="v-date-picker-nav">
        <VIconButton
          :icon="chevronLeftIcon"
          :label="m.datePicker.previousMonth"
          size="sm"
          :disabled="!canPrevMonth"
          @click="stepMonth(-1)"
        />
        <VButton
          variant="ghost"
          tone="neutral"
          size="sm"
          class="v-date-picker-view-toggle"
          :aria-expanded="view === 'months'"
          :aria-label="monthLabel"
          @click="toggleView('months')"
        >
          {{ monthLabels[viewMonth0] }}
          <VIcon
            :name="view === 'months' ? arrowDropUpIcon : arrowDropDownIcon"
            aria-hidden="true"
          />
        </VButton>
        <VIconButton
          :icon="chevronRightIcon"
          :label="m.datePicker.nextMonth"
          size="sm"
          :disabled="!canNextMonth"
          @click="stepMonth(1)"
        />
      </div>

      <div class="v-date-picker-nav">
        <VIconButton
          :icon="chevronLeftIcon"
          :label="m.datePicker.previousYear"
          size="sm"
          :disabled="!canPrevYear"
          @click="stepYear(-1)"
        />
        <VButton
          variant="ghost"
          tone="neutral"
          size="sm"
          class="v-date-picker-view-toggle"
          :aria-expanded="view === 'years'"
          @click="toggleView('years')"
        >
          {{ viewYear }}
          <VIcon
            :name="view === 'years' ? arrowDropUpIcon : arrowDropDownIcon"
            aria-hidden="true"
          />
        </VButton>
        <VIconButton
          :icon="chevronRightIcon"
          :label="m.datePicker.nextYear"
          size="sm"
          :disabled="!canNextYear"
          @click="stepYear(1)"
        />
      </div>
    </div>

    <!-- Days view -->
    <div
      v-show="view === 'days'"
      class="v-date-picker-grid"
      role="grid"
      :aria-label="gridLabel"
      :aria-multiselectable="selection === 'multiple' ? 'true' : undefined"
      @keydown="onDaysKeydown"
    >
      <div class="v-date-picker-weekdays" role="row">
        <span
          v-for="(w, i) in weekdays"
          :key="w"
          class="v-date-picker-weekday"
          role="columnheader"
          :aria-label="weekdaysLong[i]"
          >{{ w }}</span
        >
      </div>
      <div v-for="(week, wi) in weeks" :key="wi" class="v-date-picker-week" role="row">
        <div
          v-for="cell in week"
          :key="cell.iso"
          class="v-date-picker-cell"
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
            class="v-date-picker-day"
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
              <span class="v-date-picker-day-num">{{ cell.day }}</span>
            </slot>
            <span v-if="cell.events.length" class="v-date-picker-dots" aria-hidden="true">
              <span
                v-for="(ev, ei) in cell.events.slice(0, 3)"
                :key="ei"
                class="v-date-picker-dot"
                :style="ev.color ? { '--date-picker-dot-color': ev.color } : undefined"
              />
            </span>
          </button>
          <!-- A day of a neighbouring month that cannot be selected. It renders the
               very same slot as the clickable days: were it left with the bare
               number, custom content taking several lines would apply to this month's
               days only, and the numbers would stop lining up from one cell to the
               next. The slot receives `inMonth`, which is how it can still tell the
               two apart. -->
          <span
            v-else-if="cell.kind === 'static'"
            class="v-date-picker-day v-date-picker-day--static"
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
              <span class="v-date-picker-day-num">{{ cell.day }}</span>
            </slot>
          </span>
        </div>
      </div>
    </div>

    <!-- Months view -->
    <div
      v-if="view === 'months'"
      class="v-date-picker-view"
      role="grid"
      :aria-label="m.datePicker.monthPicker"
      @keydown="onMonthsKeydown"
    >
      <div v-for="(row, r) in monthRows" :key="r" class="v-date-picker-view-row" role="row">
        <button
          v-for="{ name, i } in row"
          :id="`${gridLabelId}-m-${i}`"
          :key="name"
          type="button"
          class="v-date-picker-view-cell"
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
      class="v-date-picker-view v-date-picker-view--years"
      role="grid"
      :aria-label="m.datePicker.yearPicker"
      @keydown="onYearsKeydown"
    >
      <div v-for="(row, r) in yearRows" :key="r" class="v-date-picker-view-row" role="row">
        <button
          v-for="y in row"
          :id="`${gridLabelId}-y-${y}`"
          :key="y"
          type="button"
          class="v-date-picker-view-cell"
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

    <div v-if="$slots.footer" class="v-date-picker-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style>
@layer vectis.components {
  .v-date-picker {
    /* The consumer sets the size of the day disc; the cell around it — the hover area
       and the width of the column — grows to follow, and never falls below the size
       the token sets. */
    --date-picker-day-size: var(--vectis-date-picker-day-size, var(--vectis-control-height-md));
    --date-picker-cell: max(
      var(--vectis-control-size-date-picker-cell),
      calc(var(--date-picker-day-size) + var(--vectis-space-1))
    );
    display: inline-flex;
    flex-direction: column;
    gap: var(--vectis-space-2);
    padding: var(--vectis-space-3);
    font-family: var(--vectis-text-family);
    color: var(--vectis-color-text);
  }

  /* The calendar is a flex column, so every block stretches to its full width by
     default. The days grid then fills that width through its 1fr columns, and never
     goes below the seven cells its own floor guarantees. */
  .v-date-picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--vectis-space-2);
  }

  .v-date-picker-nav {
    display: flex;
    align-items: center;
  }

  /* A minimum width holds this button steady, so the chevrons on either side do not
     shift as the month or year label changes length. */
  .v-date-picker-view-toggle {
    min-inline-size: var(--vectis-control-size-date-picker-nav-min);
    /* The semibold is state emphasis on the grid's main landmark, not a type role. */
    font-weight: var(--vectis-font-weight-semibold);
    text-transform: capitalize;
  }

  /* The days grid can never be narrower than seven cells. Above that floor it takes
     whatever width the calendar has — set by the header — and the 1fr columns share
     it out equally. */
  .v-date-picker-grid {
    min-inline-size: calc(7 * var(--date-picker-cell));
  }

  .v-date-picker-weekdays,
  .v-date-picker-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  .v-date-picker-weekday {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--vectis-control-height-sm);
    /* A column micro-header, which takes the overline type role. The casing stays
       `capitalize`, the calendar convention, rather than the full capitals the
       VTypography overline variant would apply. */
    font-size: var(--vectis-text-overline-size);
    font-weight: var(--vectis-text-overline-weight);
    letter-spacing: var(--vectis-text-overline-tracking);
    color: var(--vectis-color-text-muted);
    text-transform: capitalize;
  }

  .v-date-picker-cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--date-picker-cell);
  }

  /* The band joining the days of a selected range: a tinted background laid behind
     the day, at the HEIGHT of the disc rather than of the whole cell. Its vertical
     inset is half the gap between cell and disc, expressed in `%` so it follows the
     real width of a 1fr column whatever the calendar measures.

     At either end the band stops exactly at the edge of the disc — hence the inset on
     the outer side — and that corner is rounded with the pill radius, which a box
     this height caps at half its height, i.e. precisely the disc's own radius, so it
     cannot overshoot. */
  .v-date-picker-cell[data-in-range]::before {
    content: '';
    position: absolute;
    inset-block: calc((100% - var(--date-picker-day-size)) / 2);
    inset-inline: 0;
    background: var(--vectis-color-accent-surface);
    z-index: 0;
  }
  .v-date-picker-cell[data-range-start]::before {
    inset-inline-start: calc((100% - var(--date-picker-day-size)) / 2);
    border-start-start-radius: var(--vectis-radius-pill);
    border-end-start-radius: var(--vectis-radius-pill);
  }
  .v-date-picker-cell[data-range-end]::before {
    inset-inline-end: calc((100% - var(--date-picker-day-size)) / 2);
    border-start-end-radius: var(--vectis-radius-pill);
    border-end-end-radius: var(--vectis-radius-pill);
  }
  .v-date-picker-cell[data-range-start][data-range-end]::before {
    content: none;
  }

  .v-date-picker-day {
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    inline-size: var(--date-picker-day-size);
    block-size: var(--date-picker-day-size);
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

  /* Hover belongs to the days one can actually click: not the disabled ones, not the
     already selected ones, and not the neighbouring days rendered as plain spans. */
  .v-date-picker-day:hover:not([aria-disabled='true']):not([data-selected]):not(
      .v-date-picker-day--static
    ) {
    background: var(--vectis-color-surface-muted);
  }

  .v-date-picker-day[data-outside] {
    color: var(--vectis-color-text-subtle);
  }

  /* The semibold in the two rules below marks a state — today, and the selection —
     and is not a typographic role, which is why it reads a font token directly. */
  .v-date-picker-day[data-today]:not([data-selected]) {
    box-shadow: inset 0 0 0 1px var(--vectis-color-accent-border);
    color: var(--vectis-color-accent-text);
    font-weight: var(--vectis-font-weight-semibold);
  }

  .v-date-picker-day[data-selected] {
    background: var(--vectis-color-accent);
    color: var(--vectis-color-text-on-accent);
    font-weight: var(--vectis-font-weight-semibold);
  }

  .v-date-picker-day[aria-disabled='true'] {
    color: var(--vectis-color-text-subtle);
    text-decoration: line-through;
    cursor: not-allowed;
  }

  .v-date-picker-day--static {
    color: var(--vectis-color-text-subtle);
    cursor: default;
  }

  /* A neighbouring day that falls outside the bounds, or is disabled, is struck
     through like any other unavailable date. */
  .v-date-picker-day--static[data-disabled] {
    text-decoration: line-through;
    cursor: not-allowed;
  }

  .v-date-picker-day:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  .v-date-picker-day-num {
    line-height: var(--vectis-text-control-leading);
  }

  .v-date-picker-dots {
    position: absolute;
    inset-block-end: calc(var(--vectis-space-1) * 0.5);
    display: flex;
    gap: 2px;
  }
  .v-date-picker-dot {
    inline-size: var(--vectis-control-size-date-picker-dot);
    block-size: var(--vectis-control-size-date-picker-dot);
    border-radius: var(--vectis-radius-pill);
    background: var(--date-picker-dot-color, var(--vectis-color-accent));
  }
  .v-date-picker-day[data-selected] .v-date-picker-dot {
    background: var(--vectis-color-text-on-accent);
  }

  /* The months and years views. They fill the calendar's width exactly like the days
     grid does: stretched by the flex column, then shared out by 1fr columns. */
  .v-date-picker-view {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--vectis-space-1);
    min-inline-size: calc(7 * var(--date-picker-cell));
  }
  /* The rows ARIA requires inside a grid, made invisible to the layout: with
     `display: contents` the cells remain direct grid items of `.v-date-picker-view`,
     so the columns line up as if the rows were not there. */
  .v-date-picker-view-row {
    display: contents;
  }

  .v-date-picker-view--years {
    max-block-size: calc(6 * var(--date-picker-cell));
    overflow-y: auto;
  }

  .v-date-picker-view-cell {
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
  .v-date-picker-view-cell:hover:not(:disabled):not([data-selected]) {
    background: var(--vectis-color-surface-muted);
  }
  .v-date-picker-view-cell[data-selected] {
    background: var(--vectis-color-accent);
    color: var(--vectis-color-text-on-accent);
    /* Again state emphasis, not a type role. */
    font-weight: var(--vectis-font-weight-semibold);
  }
  .v-date-picker-view-cell:disabled {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }
  .v-date-picker-view-cell:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  .v-date-picker-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--vectis-space-2);
    padding-block-start: var(--vectis-space-2);
    border-block-start: 1px solid var(--vectis-color-border);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-date-picker-day,
    .v-date-picker-view-cell {
      transition: none;
    }
  }
}
</style>
