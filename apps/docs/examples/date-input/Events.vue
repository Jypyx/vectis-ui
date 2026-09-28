<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput, type DatePickerEvent } from 'vectis-ui'

const date = ref<string | null>('2026-06-10')

const events: DatePickerEvent[] = [
  { date: '2026-06-10', label: 'Kick-off' },
  { date: '2026-06-18', color: 'var(--vectis-color-danger)', label: 'Deadline' },
  { date: '2026-06-18', color: 'var(--vectis-color-warning)', label: 'Review' },
  { date: '2026-06-24', color: 'var(--vectis-color-success)', label: 'Release' },
]
</script>

<template>
  <div class="column">
    <VDateInput
      v-model="date"
      :events="events"
      mode="picker"
      label="Sprint date"
      hint="Open the calendar: June has four marked days"
    />
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
</style>
