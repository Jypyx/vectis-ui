<script setup lang="ts">
import { ref } from 'vue'
import { VCalendar, type CalendarEvent } from 'vectis-ui'

/* The span below runs from Wednesday to Sunday, which is what shows what the custom view
   is for: a week would have stopped at the Sunday boundary and started again on Monday. */
const events = ref<CalendarEvent[]>([
  {
    id: 'standup',
    title: 'Standup',
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '09:00',
    endTime: '09:15',
  },
  {
    id: 'review',
    title: 'Design review',
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '14:00',
    endTime: '15:30',
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
    start: '2026-06-12',
    end: '2026-06-12',
    startTime: '16:00',
    endTime: '17:00',
  },
  {
    id: 'conference',
    title: 'Conference',
    start: '2026-06-13',
    end: '2026-06-13',
    startTime: '10:00',
    endTime: '16:00',
  },
  {
    id: 'handover',
    title: 'Handover',
    start: '2026-06-14',
    end: '2026-06-14',
    startTime: '11:00',
    endTime: '12:00',
  },
])
</script>

<template>
  <VCalendar
    v-model:events="events"
    view="custom"
    :custom-days="5"
    :views="['day', 'custom', 'week']"
    :day-start="8"
    :day-end="18"
    date="2026-06-10"
    label="Custom span"
    class="calendar"
  />
</template>

<style scoped>
.calendar {
  block-size: 34rem;
}
</style>
