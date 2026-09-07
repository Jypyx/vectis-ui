<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

const invalid = ref<string | null>('2026-06-10')
</script>

<template>
  <div class="column">
    <VDateInput
      v-model="invalid"
      invalid
      show-picker
      label="Invalid"
      hint="For a rule the browser cannot check by itself"
    />

    <VDateInput
      model-value="2026-06-10"
      disabled
      show-picker
      label="Disabled, with a value"
      hint="Greyed through the colour tokens, and the panel can no longer be opened"
    />

    <VDateInput model-value="2026-06-10" disabled mode="picker" label="Disabled, picker only" />

    <!-- Frozen rather than out of reach: it still takes the focus and can be copied from. -->
    <VDateInput
      model-value="2026-06-10"
      readonly
      show-picker
      clearable
      label="Read-only"
      hint="No typing, no calendar, no clear cross"
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
