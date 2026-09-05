<script setup lang="ts">
import { ref } from 'vue'
import { VCalendar, type CalendarEvent } from 'vectis-ui'

const DAY = '2026-06-10'

/* The first six name no colour, so each takes the hue its id derives. The last two name
   one of their own, in two of the notations any CSS colour may be written in. */
const events = ref<CalendarEvent[]>([
  { id: 'hue-1', title: 'Standup', start: DAY, end: DAY, startTime: '08:00', endTime: '09:00' },
  {
    id: 'hue-2',
    title: 'Design review',
    start: DAY,
    end: DAY,
    startTime: '09:00',
    endTime: '10:00',
  },
  { id: 'hue-3', title: 'Workshop', start: DAY, end: DAY, startTime: '10:00', endTime: '11:00' },
  {
    id: 'hue-4',
    title: 'Retrospective',
    start: DAY,
    end: DAY,
    startTime: '11:00',
    endTime: '12:00',
  },
  { id: 'hue-5', title: 'Team lunch', start: DAY, end: DAY, startTime: '12:00', endTime: '13:00' },
  { id: 'hue-6', title: 'Interview', start: DAY, end: DAY, startTime: '13:00', endTime: '14:00' },
  {
    id: 'own-1',
    title: 'One to one',
    start: DAY,
    end: DAY,
    startTime: '14:00',
    endTime: '15:00',
    color: '#7c3aed',
  },
  {
    id: 'own-2',
    title: 'Release window',
    start: DAY,
    end: DAY,
    startTime: '16:00',
    endTime: '18:00',
    color: 'oklch(0.65 0.15 200)',
  },
])
</script>

<template>
  <VCalendar
    v-model:events="events"
    view="day"
    :views="['day', 'week']"
    :day-start="8"
    :day-end="20"
    :date="DAY"
    label="Event colours"
    class="calendar"
  />
</template>

<style scoped>
.calendar {
  block-size: 34rem;
}
</style>
