<script setup lang="ts">
import { ref } from 'vue'
import { VCalendar, type CalendarEvent } from 'vectis-ui'

const events = ref<CalendarEvent[]>([
  {
    id: 'standup',
    title: 'Standup',
    start: '2026-06-08',
    end: '2026-06-08',
    startTime: '09:00',
    endTime: '09:15',
  },
  {
    id: 'quarterly',
    title: 'Quarterly plan',
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '08:00',
    endTime: '08:30',
  },
  {
    id: 'lunch',
    title: 'Team lunch',
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '12:30',
    endTime: '13:30',
  },
  {
    id: 'one-to-one',
    title: 'One to one',
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '15:00',
    endTime: '15:45',
  },
  {
    id: 'interview',
    title: 'Interview',
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '17:00',
    endTime: '18:00',
  },
  {
    id: 'workshop',
    title: 'Workshop',
    start: '2026-06-11',
    end: '2026-06-11',
    startTime: '09:30',
    endTime: '12:00',
  },
  {
    id: 'retro',
    title: 'Retrospective',
    start: '2026-06-19',
    end: '2026-06-19',
    startTime: '16:00',
    endTime: '17:00',
  },
  {
    id: 'release',
    title: 'Release window',
    start: '2026-06-16',
    end: '2026-06-18',
    startTime: '00:00',
    endTime: '23:59',
  },
])
</script>

<template>
  <VCalendar
    v-model:events="events"
    view="month"
    :views="['month', 'week', 'day']"
    date="2026-06-10"
    label="Month"
    class="calendar"
  />
</template>

<style scoped>
.calendar {
  block-size: 38rem;
}
</style>
