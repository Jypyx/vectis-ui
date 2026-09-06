<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

const withCross = ref<string | null>('2026-06-10')
const withoutCross = ref<string | null>('2026-06-10')
</script>

<template>
  <div class="column">
    <VDateInput
      v-model="withCross"
      clearable
      show-picker
      label="Clearable"
      hint="The cross sits to the left of the calendar icon, never in its place"
    />

    <VDateInput
      v-model="withoutCross"
      show-picker
      label="Not clearable, the default"
      hint="Emptying the field is then the reader's own business"
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
