<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VDateInput } from 'vectis-ui'

const date = ref<string | null>(null)

/* The clock is read in the handler and never at setup: on the server there is no telling
   what day it is where the reader stands, and a value picked there would not survive
   hydration. */
function inDays(offset: number, close: () => void) {
  const day = new Date()
  day.setDate(day.getDate() + offset)
  const month = String(day.getMonth() + 1).padStart(2, '0')
  date.value = `${day.getFullYear()}-${month}-${String(day.getDate()).padStart(2, '0')}`
  close()
}
</script>

<template>
  <div class="column">
    <VDateInput v-model="date" mode="picker" label="Due date" clearable>
      <template #footer="{ close }">
        <VButton variant="ghost" tone="neutral" size="sm" @click="inDays(0, close)">Today</VButton>
        <VButton variant="ghost" tone="neutral" size="sm" @click="inDays(1, close)">
          Tomorrow
        </VButton>
        <VButton variant="ghost" tone="neutral" size="sm" @click="inDays(7, close)">
          In a week
        </VButton>
      </template>
    </VDateInput>
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
</style>
