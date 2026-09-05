<script setup lang="ts">
import { ref } from 'vue'
import { VCalendar, VIcon, type CalendarEvent } from 'vectis-ui'
import { schedule as scheduleIcon } from 'vectis-ui/icons'

/* An interface of your own extending the contract: the extra fields reach the slot typed,
   rather than as something to cast there. */
interface Booking extends CalendarEvent {
  room: string
  attendees: number
}

const DAY = '2026-06-10'

const events = ref<Booking[]>([
  {
    id: 'review',
    title: 'Design review',
    start: DAY,
    end: DAY,
    startTime: '10:00',
    endTime: '11:30',
    room: 'B2',
    attendees: 6,
  },
  {
    id: 'workshop',
    title: 'Workshop',
    start: DAY,
    end: DAY,
    startTime: '14:00',
    endTime: '16:00',
    room: 'A1',
    attendees: 12,
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
    label="Custom event content"
    class="calendar"
  >
    <template #event="{ event, timeText }">
      <span class="title">{{ event.title }}</span>
      <span class="line">
        <VIcon :name="scheduleIcon" :size="14" aria-hidden="true" />
        {{ timeText }}
      </span>
      <span class="line">Room {{ event.room }}, {{ event.attendees }} people</span>
    </template>
  </VCalendar>
</template>

<style scoped>
.calendar {
  block-size: 34rem;
}

.title {
  font-weight: var(--vectis-font-weight-semibold);
}

.line {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-1);
  font-size: var(--vectis-text-caption-size);
}
</style>
