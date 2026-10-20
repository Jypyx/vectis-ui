<script setup lang="ts">
import { VProgressLinear, type ProgressLinearValuePosition } from 'vectis-ui'

const POSITIONS: ProgressLinearValuePosition[] = ['header', 'start', 'center', 'end']
</script>

<template>
  <div class="column">
    <!-- Inside the bar the slot renders twice; keep it non-interactive and free of side effects. -->
    <VProgressLinear
      v-for="position in POSITIONS"
      :key="position"
      :value="55"
      :size="position === 'header' ? 'sm' : 'xl'"
      show-value
      :value-position="position"
      :label="`valuePosition ${position}`"
    />

    <VProgressLinear :value="7" :max="12" label="A slot of your own">
      <template #default="{ value, max }">{{ value }} of {{ max }} files</template>
    </VProgressLinear>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 28rem;
}
</style>
