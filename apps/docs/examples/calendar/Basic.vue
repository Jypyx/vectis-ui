<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VCalendar, type CalendarEvent } from 'vectis-ui'

/*
 * This page is prerendered, so the clock cannot be read while the markup is being built:
 * the build date would be written into the HTML and the browser would disagree with it.
 * The schedule below therefore starts on a fixed week and moves onto the current one once
 * the page is in the browser, which is what the theme does here for the same reason.
 */
const REFERENCE_MONDAY = '2026-01-05'

const anchor = ref(REFERENCE_MONDAY)
const events = ref<CalendarEvent[]>(scheduleFor(REFERENCE_MONDAY))

onMounted(() => {
  anchor.value = mondayOf(new Date())
  events.value = scheduleFor(anchor.value)
})

/** A date as the local ISO day the calendar reads, never through UTC. */
function isoOf(date: Date): string {
  const two = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`
}

/** The Monday of the week a date falls in. */
function mondayOf(date: Date): string {
  const monday = new Date(date)
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return isoOf(monday)
}

/** The same three appointments, on whichever week starts on the Monday given. */
function scheduleFor(monday: string): CalendarEvent[] {
  const day = (offset: number) => {
    // The time keeps the parse local: a bare `YYYY-MM-DD` is read as UTC.
    const date = new Date(`${monday}T00:00:00`)
    date.setDate(date.getDate() + offset)
    return isoOf(date)
  }

  return [
    {
      id: 'standup',
      title: 'Standup',
      start: day(0),
      end: day(0),
      startTime: '09:00',
      endTime: '09:15',
    },
    {
      id: 'review',
      title: 'Design review',
      start: day(1),
      end: day(1),
      startTime: '14:00',
      endTime: '15:30',
      description: 'With Anna and Ravi',
    },
    {
      id: 'lunch',
      title: 'Team lunch',
      start: day(3),
      end: day(3),
      startTime: '12:30',
      endTime: '13:30',
    },
  ]
}
</script>

<template>
  <VCalendar v-model:date="anchor" v-model:events="events" label="Team schedule" class="calendar" />
</template>

<style scoped>
/* A calendar has no height of its own, and collapses without one. */
.calendar {
  block-size: 34rem;
}
</style>
