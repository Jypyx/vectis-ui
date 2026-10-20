<script setup lang="ts">
import { VMeter, type MeterValuePosition } from 'vectis-ui'

const POSITIONS: MeterValuePosition[] = ['start', 'center', 'end']
</script>

<template>
  <div class="meters">
    <VMeter
      v-for="position in POSITIONS"
      :key="position"
      :label="`valuePosition ${position}`"
      :value="35"
      size="xl"
      show-value
      :value-position="position"
    />
  </div>
</template>

<style scoped>
.meters {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 20rem;
}
</style>
