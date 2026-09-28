<script setup lang="ts" generic="E extends CalendarEvent">
// @a11y @core
/**
 * Use one roving date across the year so arrows cross month boundaries without adding hundreds
 * of Tab stops.
 */
import { computed, ref } from 'vue'

import { addDays, addMonths, compareISO, formatDateDisplay, parseISO } from '../../utils/date'

import { lastDayOf, monthWeeks, type MonthCell } from './layout'
import type { CalendarEvent } from './types'

export interface CalendarYearProps<T> {
  /** The first day of each month of the year on show. */
  months: string[]
  events: T[]
  locale: string
  /** Which weekdays are on show, so a mini-month drops the same columns as the others. */
  weekdays: number[]
  today: string | null
  label: string
  /** Turns the twelve month headings into disabled buttons, out of the tab order. */
  disabled?: boolean
}

const props = defineProps<CalendarYearProps<E>>()

const emit = defineEmits<{
  /** A month was chosen, and is where the calendar should go next. */
  'month-activate': [iso: string]
}>()

/** The days of the year on show that have something on them, worked out once for all twelve. */
const busyDays = computed(() => {
  const days = new Set<string>()
  const first = props.months[0]
  const lastMonth = props.months.at(-1)
  if (!first || !lastMonth) return days
  const last = addDays(addMonths(lastMonth, 1), -1)

  for (const event of props.events) {
    if (!parseISO(event.start) || !parseISO(event.end)) continue
    const from = compareISO(event.start, first) > 0 ? event.start : first
    const end = lastDayOf(event)
    const to = compareISO(end, last) < 0 ? end : last
    for (let iso = from; compareISO(iso, to) <= 0; iso = addDays(iso, 1)) days.add(iso)
  }
  return days
})

/*
 * The twelve grids, built once per change of anchor or weekdays, and their day numbers once per
 * locale: the adjacent days repeat across neighbouring months, and none of it depends on the
 * events. The busy marks are laid over both in `yearMonths` below.
 */
const grids = computed(() => props.months.map((month) => monthWeeks(month, props.weekdays)))

const dayNumbers = computed(() => {
  const map = new Map<string, string>()
  for (const weeks of grids.value) {
    for (const week of weeks) {
      for (const cell of week) {
        if (!map.has(cell.iso))
          map.set(cell.iso, formatDateDisplay(cell.iso, props.locale, { day: 'numeric' }))
      }
    }
  }
  return map
})

/** One square of a mini-month, with everything the template writes on it already settled. */
interface YearDay {
  iso: string
  adjacent: MonthCell['adjacent']
  number: string
  /** Only a day of the month itself is marked: a neighbour's day belongs to its own month. */
  busy: boolean
}

/** What the template draws, each month with its name, its squares and how many of them are busy. */
const yearMonths = computed(() => {
  const busy = busyDays.value
  const numbers = dayNumbers.value
  return props.months.map((month, index) => {
    let busyCount = 0
    const weeks: YearDay[][] = (grids.value[index] ?? []).map((week) =>
      week.map((cell) => {
        const isBusy = cell.adjacent === null && busy.has(cell.iso)
        if (isBusy) busyCount++
        return {
          iso: cell.iso,
          adjacent: cell.adjacent,
          number: numbers.get(cell.iso) ?? '',
          busy: isBusy,
        }
      }),
    )
    return {
      month,
      name: formatDateDisplay(month, props.locale, { month: 'long' }),
      weeks,
      busyCount,
    }
  })
})

const rootEl = ref<HTMLElement | null>(null)

defineExpose({
  /** Brings the focus onto the first month, the view's first control. */
  focus: (options?: FocusOptions) =>
    rootEl.value?.querySelector<HTMLButtonElement>('.v-calendar-year-title')?.focus(options),
  /** Nothing to scroll to in a year view. */
  scrollToMinutes: () => {},
})
</script>

<template>
  <div ref="rootEl" class="v-calendar-year" role="group" :aria-label="label">
    <section v-for="entry in yearMonths" :key="entry.month" class="v-calendar-year-month">
      <button
        type="button"
        class="v-calendar-button v-calendar-year-title"
        :disabled="disabled"
        @click="emit('month-activate', entry.month)"
      >
        {{ entry.name }}
        <!--
          The count is part of the button's own text, so a month that has something on it says
          so in its accessible name; which makes the days below safe to hide from the
          accessibility tree.
        -->
        <span v-if="entry.busyCount > 0" class="v-calendar-year-count">
          {{ entry.busyCount }}
        </span>
      </button>

      <div
        class="v-calendar-year-grid"
        aria-hidden="true"
        :style="{ '--calendar-columns': String(weekdays.length) }"
      >
        <template v-for="(week, row) in entry.weeks" :key="row">
          <span
            v-for="day in week"
            :key="day.iso"
            class="v-calendar-year-day"
            :class="{ 'v-calendar-today': day.iso === today }"
            :data-adjacent="day.adjacent ?? undefined"
            :data-busy="day.busy ? '' : undefined"
          >
            {{ day.number }}
          </span>
        </template>
      </div>
    </section>
  </div>
</template>

<style>
@layer vectis.components {
  .v-calendar-year {
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(var(--vectis-control-size-calendar-year-month), 1fr)
    );
    gap: var(--vectis-space-4);
    padding: var(--vectis-space-3);
  }

  .v-calendar-year-month {
    display: flex;
    flex-direction: column;
    gap: var(--vectis-space-2);
  }

  .v-calendar-year-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--vectis-space-2);
    padding: var(--vectis-space-1) var(--vectis-space-2);
    border-radius: var(--vectis-radius-interactive);
    color: var(--vectis-color-text);
    font-size: var(--vectis-text-heading-4-size);
    font-weight: var(--vectis-text-heading-4-weight);
    text-align: start;
    text-transform: capitalize;
  }

  .v-calendar-year-title:hover {
    background: var(--vectis-color-surface-muted);
  }

  .v-calendar-year-count {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    min-inline-size: var(--vectis-control-size-calendar-year-cell);
    padding-inline: var(--vectis-space-1);
    border-radius: var(--vectis-radius-pill);
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-font-weight-medium);
  }

  /* As many columns as weekdays on show, set inline by the template exactly as the month
     view does. Written as a literal 7, a calendar showing the working week alone wrapped
     every five-day row of `monthWeeks` onto the next line. */
  .v-calendar-year-grid {
    display: grid;
    grid-template-columns: repeat(var(--calendar-columns), 1fr);
    gap: 1px;
  }

  .v-calendar-year-day {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    min-inline-size: var(--vectis-control-size-calendar-year-cell);
    border-radius: var(--vectis-radius-pill);
    font-size: var(--vectis-text-caption-size);
  }

  /*
   * Both states are written DISJOINT from today rather than below it. Today is very often also
   * busy, and its paint is `.v-calendar-today`, in VCalendar's sheet: at equal specificity the
   * winner between two sheets is whichever the consumer's bundler emitted last, and losing that
   * draw paints today as an ordinary busy day; the one square a reader looks for first, quietly
   * indistinguishable.
   */
  .v-calendar-year-day[data-adjacent]:not(.v-calendar-today) {
    color: var(--vectis-color-text-subtle);
  }

  /*
   * A busy day is RINGED rather than dotted: at this size a dot would be about one pixel, and
   * it would be drawn as a background, which Windows forced-colors flattens away; where a
   * border keeps a colour of its own. The tint is a second, redundant signal for anyone the
   * ring alone is too fine for; and the ring alone is what today keeps, being painted over the
   * tint.
   */
  .v-calendar-year-day[data-busy] {
    border: 1px solid var(--vectis-color-accent-border);
  }

  .v-calendar-year-day[data-busy]:not(.v-calendar-today) {
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }
}
</style>
