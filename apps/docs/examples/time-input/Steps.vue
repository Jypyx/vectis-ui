<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'

const appointment = ref<string | null>('14:15')
const slot = ref<string | null>('09:30')
const typed = ref<string | null>('08:00')
</script>

<template>
  <div class="column">
    <VTimeInput
      v-model="appointment"
      mode="picker"
      :minute-step="15"
      label="Quarter hours, on the clock"
      hint="The face offers four minutes an hour, and the arrow keys move by the same step"
    />

    <VTimeInput
      v-model="slot"
      mode="list"
      :minute-step="30"
      label="Half hours, as a list"
      hint="The step is what the rows are cut at: 48 of them here rather than 1440"
    />

    <VTimeInput
      v-model="typed"
      show-picker
      :minute-step="5"
      label="Five minutes, typed"
      hint="The mask still takes any time; the step drives the clock and the arrow keys"
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
