<script setup lang="ts">
import { ref } from 'vue'
import { VCalendar, type CalendarEvent } from 'vectis-ui'

const events = ref<CalendarEvent[]>([
  {
    id: 'holiday',
    title: 'Bank holiday',
    start: '2026-06-08',
    end: '2026-06-08',
    startTime: '00:00',
    endTime: '23:59',
    allDay: true,
  },
  {
    id: 'workshop',
    title: 'Workshop',
    start: '2026-06-09',
    end: '2026-06-11',
    startTime: '00:00',
    endTime: '23:59',
  },
  {
    id: 'release',
    title: 'Release window',
    start: '2026-06-10',
    end: '2026-06-12',
    startTime: '00:00',
    endTime: '23:59',
  },
  {
    id: 'review',
    title: 'Design review',
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '10:00',
    endTime: '11:30',
  },
  {
    id: 'retro',
    title: 'Retrospective',
    start: '2026-06-11',
    end: '2026-06-11',
    startTime: '16:00',
    endTime: '17:00',
  },
])
</script>

<template>
  <VCalendar
    v-model:events="events"
    :day-start="8"
    :day-end="18"
    date="2026-06-10"
    label="All-day events"
    class="calendar"
  />
</template>

<style scoped>
.calendar {
  block-size: 34rem;
}
</style>
