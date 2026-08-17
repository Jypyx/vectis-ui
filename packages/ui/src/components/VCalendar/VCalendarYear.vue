<script setup lang="ts" generic="E extends CalendarEvent">
// @a11y @core
/**
 * The year view: twelve small months, each marking the days that have something on them.
 *
 * It is internal to VCalendar and has no story of its own — its documentation lives with
 * the component that renders it.
 *
 * WHY THE DAYS HERE ARE NOT BUTTONS, unlike every other view. A year is three hundred and
 * sixty-five days, and making each one focusable would put that many stops in the tab
 * order for a view whose whole purpose is to be glanced at. Twelve roving grids would fix
 * the count but leave the arrows unable to cross from one month to the next, which is
 * exactly the movement a year view invites.
 *
 * So this view is a SUMMARY and says so: the days are text, with the busy ones ringed, and
 * the thing you can reach and act on is the month, whose name carries how many of its days
 * carry something. Choosing a day is what the month and day views are for, and the heading
 * is the way through to them.
 */
import { computed } from 'vue'

import { addDays, formatDisplay as formatDate, parseISO } from '../../utils/date'

import { coversDay, monthWeeks, type MonthCell } from './layout'
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

const monthName = (iso: string) => formatDate(iso, props.locale, { month: 'long' })

/** The days of the year that have something on them, worked out once for all twelve. */
const busyDays = computed(() => {
  const days = new Set<string>()
  for (const event of props.events) {
    const start = parseISO(event.start)
    const end = parseISO(event.end)
    if (!start || !end) continue
    /*
     * Walked day by day rather than tested against every square: a year holds far more
     * squares than a schedule holds days, so filling a set from the events and asking it
     * one question per square is the cheaper way round. The walk is bounded to a year so a
     * malformed range cannot spin.
     */
    let iso = event.start
    for (let guard = 0; guard < 366 && coversDay(event, iso); guard++) {
      days.add(iso)
      iso = addDays(iso, 1)
    }
  }
  return days
})

const weeksOf = (iso: string) => monthWeeks(iso, props.weekdays)

const dayNumber = (iso: string) => formatDate(iso, props.locale, { day: 'numeric' })

/** How many of a month's own days carry something, which is what its name announces. */
function busyCount(month: string): number {
  return weeksOf(month)
    .flat()
    .filter((cell) => cell.adjacent === null && busyDays.value.has(cell.iso)).length
}

const isBusy = (cell: MonthCell) => cell.adjacent === null && busyDays.value.has(cell.iso)
</script>

<template>
  <div class="v-calendar-year" role="group" :aria-label="label">
    <section v-for="month in months" :key="month" class="v-calendar-year-month">
      <button type="button" class="v-calendar-year-title" @click="emit('month-activate', month)">
        {{ monthName(month) }}
        <!-- The count is part of the button's own text, so a month that has something on it
             says so in its accessible name — which is what makes the days below safe to hide
             from the accessibility tree. -->
        <span v-if="busyCount(month) > 0" class="v-calendar-year-count">
          {{ busyCount(month) }}
        </span>
      </button>

      <div class="v-calendar-year-grid" aria-hidden="true">
        <template v-for="(week, row) in weeksOf(month)" :key="row">
          <span
            v-for="cell in week"
            :key="cell.iso"
            class="v-calendar-year-day"
            :data-adjacent="cell.adjacent ?? undefined"
            :data-today="cell.iso === today ? '' : undefined"
            :data-busy="isBusy(cell) ? '' : undefined"
          >
            {{ dayNumber(cell.iso) }}
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
    overflow: auto;
    block-size: 100%;
    min-block-size: 0;
    padding: var(--vectis-space-3);
    font-family: var(--vectis-text-family);
    color: var(--vectis-color-text);
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
    border: none;
    border-radius: var(--vectis-radius-interactive);
    background: none;
    color: var(--vectis-color-text);
    font-family: inherit;
    font-size: var(--vectis-text-heading-4-size);
    font-weight: var(--vectis-text-heading-4-weight);
    text-align: start;
    text-transform: capitalize;
    cursor: pointer;
    transition: background-color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-calendar-year-title:hover {
    background: var(--vectis-color-surface-muted);
  }

  .v-calendar-year-title:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
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

  .v-calendar-year-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
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

  .v-calendar-year-day[data-adjacent] {
    color: var(--vectis-color-text-subtle);
  }

  /* A busy day is RINGED rather than dotted: at this size a dot would be about one pixel,
     and it would be drawn as a background, which Windows forced-colors flattens away —
     where a border keeps a colour of its own. The tint is a second, redundant signal for
     anyone the ring alone is too fine for. */
  .v-calendar-year-day[data-busy] {
    border: 1px solid var(--vectis-color-accent-border);
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }

  .v-calendar-year-day[data-today] {
    background: var(--vectis-color-accent);
    color: var(--vectis-color-text-on-accent);
    font-weight: var(--vectis-font-weight-semibold);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-calendar-year-title {
      transition: none;
    }
  }
}
</style>
