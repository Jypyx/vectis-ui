<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'

const invalid = ref<string | null>('09:15')
</script>

<template>
  <div class="column">
    <VTimeInput
      v-model="invalid"
      invalid
      show-picker
      label="Invalid"
      hint="For a rule the browser cannot check by itself"
    />

    <VTimeInput
      model-value="09:15"
      disabled
      show-picker
      label="Disabled, with a value"
      hint="Greyed through the colour tokens, and the panel can no longer be opened"
    />

    <VTimeInput model-value="09:15" disabled mode="picker" label="Disabled, picker only" />

    <!-- Frozen rather than out of reach: it still takes the focus and can be copied from. -->
    <VTimeInput
      model-value="09:15"
      readonly
      show-picker
      clearable
      label="Read-only"
      hint="No typing, no clock, no clear cross"
    />

    <VTimeInput
      model-value="09:30"
      disabled
      mode="list"
      :minute-step="30"
      label="Disabled, as a list"
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
