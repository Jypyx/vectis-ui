<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'
import { calendar_today as calendarToday, schedule, search } from 'vectis-ui/icons'

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
      hint="The calendar is the only way in"
      mode="picker"
      :picker-icon="schedule"
    />

    <!-- The start icon is rendered before whatever else fills that end of the field. -->
    <VDateInput
      v-model="start"
      label="Filter by date"
      hint="An icon at the start, a spinner at the end while something loads"
      :icon-start="search"
      loading
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
