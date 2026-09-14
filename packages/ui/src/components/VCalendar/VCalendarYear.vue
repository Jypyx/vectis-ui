<script setup lang="ts" generic="E extends CalendarEvent">
// @a11y @core
/**
 * The year view: twelve small months, each marking the days that have something on them.
 * Internal to VCalendar, whose documentation covers it.
 *
 * WHY THE DAYS ARE NOT BUTTONS, unlike every other view. A year is 365 days, and making each
 * focusable would put that many stops in the tab order for a view meant to be glanced at.
 * Twelve roving grids would fix the count but leave the arrows unable to cross from one
 * month to the next, which is exactly the movement a year view invites.
 *
 * So it is a SUMMARY and says so: the days are text with the busy ones ringed, and what can
 * be reached and acted on is the MONTH, whose name carries how many of its days are busy.
 * Choosing a day is what the month and day views are for, and the heading is the way through.
 */
import { computed } from 'vue'

import { addDays, addMonths, compareISO, formatDateDisplay, parseISO } from '../../utils/date'

import { monthWeeks, type MonthCell } from './layout'
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
}

const props = defineProps<CalendarYearProps<E>>()

const emit = defineEmits<{
  /** A month was chosen, and is where the calendar should go next. */
  'month-activate': [iso: string]
}>()

/**
 * The days of the year on show that have something on them, worked out once for all twelve.
 *
 * Walked day by day rather than tested against every square: a year holds far more squares
 * than a schedule holds days, so filling a set from the events and asking it one question per
 * square is the cheaper way round. Each walk is CLAMPED to the year on show, the only days a
 * mini-month marks — so an event from another year costs one comparison, and a range running
 * across several years walks only the part of it this year holds.
 */
const busyDays = computed(() => {
  const days = new Set<string>()
  const first = props.months[0]
  const lastMonth = props.months.at(-1)
  if (!first || !lastMonth) return days
  const last = addDays(addMonths(lastMonth, 1), -1)

  for (const event of props.events) {
    if (!parseISO(event.start) || !parseISO(event.end)) continue
    const from = compareISO(event.start, first) > 0 ? event.start : first
    const to = compareISO(event.end, last) < 0 ? event.end : last
    for (let iso = from; compareISO(iso, to) <= 0; iso = addDays(iso, 1)) days.add(iso)
  }
  return days
})

/*
 * The twelve grids, built ONCE per change of anchor or weekdays, and their day numbers once per
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

/**
 * What the template draws, each month with its name, its squares and how many of them are busy.
 *
 * The template reaches a month's count twice, in the `v-if` and in the text beside it, and each
 * square asks whether it is busy: reading them here means the busy set is walked once per
 * render rather than once per square, and the count is never computed twice.
 */
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
</script>

<template>
  <div class="v-calendar-year" role="group" :aria-label="label">
    <section v-for="entry in yearMonths" :key="entry.month" class="v-calendar-year-month">
      <button
        type="button"
        class="v-calendar-button v-calendar-year-title"
        @click="emit('month-activate', entry.month)"
      >
        {{ entry.name }}
        <!-- The count is part of the button's own text, so a month that has something on it
             says so in its accessible name — which is what makes the days below safe to hide
             from the accessibility tree. -->
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
    grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
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
   * TRAP — both states are written DISJOINT from today rather than below it. Today is very
   * often also busy, and its paint is `.v-calendar-today`, in VCalendar's sheet: at equal
   * specificity the winner between two sheets is whichever the consumer's bundler emitted last,
   * and losing that draw paints today as an ordinary busy day — the one square a reader looks
   * for first, quietly indistinguishable.
   */
  .v-calendar-year-day[data-adjacent]:not(.v-calendar-today) {
    color: var(--vectis-color-text-subtle);
  }

  /* A busy day is RINGED rather than dotted: at this size a dot would be about one pixel,
     and it would be drawn as a background, which Windows forced-colors flattens away —
     where a border keeps a colour of its own. The tint is a second, redundant signal for
     anyone the ring alone is too fine for — and the ring alone is what today keeps, being
     painted over the tint. */
  .v-calendar-year-day[data-busy] {
    border: 1px solid var(--vectis-color-accent-border);
  }

  .v-calendar-year-day[data-busy]:not(.v-calendar-today) {
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }
}
</style>
