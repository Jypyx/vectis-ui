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
    id: 'review',
    title: 'Design review',
    start: '2026-06-09',
    end: '2026-06-09',
    startTime: '10:00',
    endTime: '11:30',
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
])
</script>

<template>
  <!-- Monday to Friday, eight in the morning to seven in the evening. Every view is on the
       menu, since the weekend is missing from all five and not only from the columns. -->
  <VCalendar
    v-model:events="events"
    :weekdays="[1, 2, 3, 4, 5]"
    :day-start="8"
    :day-end="19"
    :custom-days="3"
    :views="['day', 'custom', 'week', 'month', 'year']"
    date="2026-06-10"
    label="Working week"
    class="calendar"
  />
</template>

<style scoped>
.calendar {
  block-size: 34rem;
}
</style>
