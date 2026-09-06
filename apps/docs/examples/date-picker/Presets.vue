<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VDatePicker } from 'vectis-ui'

const date = ref('2026-06-10')

/* The clock is read in the handler and never at setup: the server cannot know what day it
   is where the reader stands, and a value taken there would not survive hydration. */
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
