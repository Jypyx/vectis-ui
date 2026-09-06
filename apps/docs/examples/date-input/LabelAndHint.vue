<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'
import { calendar_today as calendarToday, schedule } from 'vectis-ui/icons'

const start = ref<string | null>('2026-06-10')
const deadline = ref<string | null>(null)
</script>

<template>
  <div class="column">
    <VDateInput
      v-model="start"
      label="Start date"
      hint="Type it or pick it from the calendar"
      show-picker
      :picker-icon="calendarToday"
    />

    <VDateInput
      v-model="deadline"
      label="Deadline"
      hint="Read-only: the calendar is the only way in"
      mode="readonly"
      :picker-icon="schedule"
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
