<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

const booking = ref<string | null>('2026-06-15')
const appointment = ref<string | null>('2026-06-16')

/* A list or a predicate: this one closes every weekend without naming a single date. */
function isWeekend(iso: string) {
  const day = new Date(`${iso}T00:00:00`).getDay()
  return day === 0 || day === 6
}
</script>

<template>
  <div class="column">
    <VDateInput
      v-model="booking"
      min="2026-06-05"
      max="2026-06-24"
      label="Booking"
      hint="Between 5 and 24 June 2026: the arrows stop at the bounds"
      show-picker
    />

    <VDateInput
      v-model="appointment"
      :disabled-dates="isWeekend"
      label="Appointment"
      hint="Weekends are struck through: still reachable, never choosable"
      show-picker
    />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
