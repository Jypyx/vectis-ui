<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

const typed = ref<string | null>('2026-06-10')
const withPicker = ref<string | null>('2026-06-10')
const readOnly = ref<string | null>('2026-06-10')
</script>

<template>
  <div class="column">
    <VDateInput
      v-model="typed"
      label="Typed, the default"
      hint="No icon, no panel: the field is the whole control"
    />

    <VDateInput
      v-model="withPicker"
      show-picker
      label="Typed, with the calendar"
      hint="showPicker adds the icon and opens the panel on focus"
    />

    <VDateInput
      v-model="readOnly"
      mode="readonly"
      label="Read-only"
      hint="Nothing can be typed, so the calendar is the only way in"
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
