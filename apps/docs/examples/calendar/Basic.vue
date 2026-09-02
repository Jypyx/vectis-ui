<script setup lang="ts">
import { ref } from 'vue'
import { VCalendar, type CalendarEvent } from 'vectis-ui'

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
    start: '2026-06-11',
    end: '2026-06-11',
    startTime: '14:00',
    endTime: '15:30',
  },
])
</script>

<template>
  <VCalendar v-model:events="events" date="2026-06-10" label="Team schedule" class="calendar" />
</template>

<style scoped>
/* A calendar has no height of its own, and collapses without one. */
.calendar {
  block-size: 34rem;
}
</style>
