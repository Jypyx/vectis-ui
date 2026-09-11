<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VProgressCircular, VTypography } from 'vectis-ui'

const value = ref(40)
const step = (delta: number) => (value.value += delta)
</script>

<template>
  <div class="column">
    <div class="row">
      <VProgressCircular :value="value" :size="96" show-value aria-label="Upload" />

      <!-- `max` says what counts as finished. The other end is always zero. -->
      <VProgressCircular :value="7" :max="12" :size="96" show-value aria-label="Files" />
    </div>

    <div class="row">
      <VButton variant="outline" tone="neutral" size="sm" @click="step(-25)">-25</VButton>
      <VButton variant="outline" tone="neutral" size="sm" @click="step(25)">+25</VButton>
      <!-- Anything outside the range is brought back into it, so a value of 130 or -10
           needs no clamping of your own. -->
      <VTypography variant="body-sm" tone="muted">value = {{ value }}, max = 100</VTypography>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-6);
}
</style>
