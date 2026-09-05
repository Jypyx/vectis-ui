<script setup lang="ts">
import { ref } from 'vue'
import { VCalendar, type CalendarEvent } from 'vectis-ui'

const DAY = '2026-06-10'

/* Four events crowd the morning and one stands alone after it, which is what shows the
   clustering: the lunch keeps the full width the morning has to share. */
const events = ref<CalendarEvent[]>([
  {
    id: 'standup',
    title: 'Standup',
    start: DAY,
    end: DAY,
    startTime: '09:00',
    endTime: '10:00',
  },
  {
    id: 'review',
    title: 'Design review',
    start: DAY,
    end: DAY,
    startTime: '09:30',
    endTime: '11:00',
  },
  {
    id: 'interview',
    title: 'Interview',
    start: DAY,
    end: DAY,
    startTime: '10:00',
    endTime: '10:30',
  },
  {
    id: 'workshop',
    title: 'Workshop',
    start: DAY,
    end: DAY,
    startTime: '09:00',
    endTime: '09:30',
  },
  {
    id: 'lunch',
    title: 'Team lunch',
    start: DAY,
    end: DAY,
    startTime: '12:30',
    endTime: '13:30',
  },
])
</script>

<template>
  <VCalendar
    v-model:events="events"
    view="day"
    :views="['day', 'week']"
    :day-start="8"
    :day-end="18"
    :date="DAY"
    label="Overlapping events"
    class="calendar"
  />
</template>

<style scoped>
.calendar {
  block-size: 34rem;
}
</style>
