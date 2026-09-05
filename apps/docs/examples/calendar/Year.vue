<script setup lang="ts">
import { ref } from 'vue'
import { VCalendar, type CalendarEvent } from 'vectis-ui'

/* A year is read for its shape rather than its detail, so the events below are spread over
   it: a few single days, and the two stretches that make a run of days busy at once. */
const events = ref<CalendarEvent[]>([
  {
    id: 'kickoff',
    title: 'Kickoff',
    start: '2026-01-13',
    end: '2026-01-13',
    startTime: '10:00',
    endTime: '11:00',
  },
  {
    id: 'audit',
    title: 'Accessibility audit',
    start: '2026-03-02',
    end: '2026-03-06',
    startTime: '00:00',
    endTime: '23:59',
  },
  {
    id: 'review',
    title: 'Design review',
    start: '2026-04-21',
    end: '2026-04-21',
    startTime: '14:00',
    endTime: '15:30',
  },
  {
    id: 'quarterly',
    title: 'Quarterly plan',
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '08:00',
    endTime: '09:00',
  },
  {
    id: 'summer',
    title: 'Summer break',
    start: '2026-08-03',
    end: '2026-08-14',
    startTime: '00:00',
    endTime: '23:59',
  },
  {
    id: 'conference',
    title: 'Conference',
    start: '2026-09-22',
    end: '2026-09-24',
    startTime: '00:00',
    endTime: '23:59',
  },
  {
    id: 'retro',
    title: 'Retrospective',
    start: '2026-11-05',
    end: '2026-11-05',
    startTime: '16:00',
    endTime: '17:00',
  },
])
</script>

<template>
  <VCalendar
    v-model:events="events"
    view="year"
    :views="['year', 'month', 'week']"
    date="2026-06-10"
    label="Year"
    class="calendar"
  />
</template>

<style scoped>
.calendar {
  block-size: 38rem;
}
</style>
