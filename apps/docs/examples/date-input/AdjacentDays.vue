<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

const hidden = ref<string | null>('2026-06-10')
const shown = ref<string | null>('2026-06-10')
const selectable = ref<string | null>('2026-06-10')
</script>

<template>
  <div class="column">
    <VDateInput
      v-model="hidden"
      mode="readonly"
      label="Hidden, the default"
      hint="The grid starts and ends on the month itself"
    />

    <VDateInput
      v-model="shown"
      show-adjacent-days
      mode="readonly"
      label="Shown"
      hint="The corners are filled with the neighbouring months, greyed and inert"
    />

    <VDateInput
      v-model="selectable"
      select-adjacent-days
      mode="readonly"
      label="Shown and choosable"
      hint="Choosing one moves the calendar to its month"
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
