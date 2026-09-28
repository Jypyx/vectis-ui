<script setup lang="ts">
import { ref } from 'vue'
import { VDatePicker, type DatePickerEvent } from 'vectis-ui'

const date = ref('2026-06-10')

const events: DatePickerEvent[] = [
  { date: '2026-06-10', label: 'Kick-off' },
  { date: '2026-06-18', color: 'var(--vectis-color-danger)', label: 'Deadline' },
  { date: '2026-06-18', color: 'var(--vectis-color-warning)', label: 'Review' },
  { date: '2026-06-24', color: 'var(--vectis-color-success)', label: 'Release' },
]
</script>

<template>
  <VDatePicker v-model="date" :events="events" />
</template>
