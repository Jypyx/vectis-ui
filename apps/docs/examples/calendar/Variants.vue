<script setup lang="ts">
import { ref } from 'vue'
import { VCalendar, type CalendarEvent, type CalendarVariant } from 'vectis-ui'

const variants: CalendarVariant[] = ['outline', 'elevated', 'filled', 'flat']

const events = ref<CalendarEvent[]>([
  {
    id: 'standup',
    title: 'Standup',
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '09:30',
    endTime: '09:45',
  },
  {
    id: 'review',
    title: 'Design review',
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '11:00',
    endTime: '12:00',
  },
])
</script>

<template>
  <div class="grid">
    <VCalendar
      v-for="variant in variants"
      :key="variant"
      v-model:events="events"
      :variant="variant"
      view="day"
      :views="['day']"
      date="2026-06-10"
      :day-start="9"
      :day-end="13"
      :label="`Schedule, ${variant}`"
      class="calendar"
    />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: var(--vectis-space-6);
}

.calendar {
  block-size: 22rem;
}
</style>
