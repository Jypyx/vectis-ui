<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VDatePicker } from 'vectis-ui'

const date = ref('2026-06-10')

/* Read today's local date in the click handler to avoid a prerendered value. */
function inDays(offset: number) {
  const day = new Date()
  day.setDate(day.getDate() + offset)
  const month = String(day.getMonth() + 1).padStart(2, '0')
  date.value = `${day.getFullYear()}-${month}-${String(day.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <VDatePicker v-model="date">
    <template #footer>
      <VButton variant="ghost" tone="neutral" size="sm" @click="inDays(0)">Today</VButton>
      <VButton variant="ghost" tone="neutral" size="sm" @click="inDays(1)">Tomorrow</VButton>
      <VButton variant="ghost" tone="neutral" size="sm" @click="inDays(7)">In a week</VButton>
    </template>
  </VDatePicker>
</template>
