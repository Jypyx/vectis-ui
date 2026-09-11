<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VProgressLinear, VTypography } from 'vectis-ui'

const value = ref(40)
const step = (delta: number) => (value.value += delta)
</script>

<template>
  <div class="column">
    <VProgressLinear :value="value" thickness="10" aria-label="Upload" show-value />

    <div class="row">
      <VButton variant="outline" tone="neutral" size="sm" @click="step(-25)">-25</VButton>
      <VButton variant="outline" tone="neutral" size="sm" @click="step(25)">+25</VButton>
      <!-- Anything outside the range is brought back into it, so a value of 130 or -10
           needs no clamping of your own. -->
      <VTypography variant="body-sm" tone="muted">value = {{ value }}, max = 100</VTypography>
    </div>

    <!-- `max` says what counts as finished. The other end is always zero. -->
    <div class="labelled">
      <VTypography variant="caption" tone="muted">7 of 12 files, max = 12</VTypography>
      <VProgressLinear :value="7" :max="12" thickness="10" aria-label="Files" show-value />
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 28rem;
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-3);
}
.labelled {
  display: grid;
  gap: var(--vectis-space-2);
}
</style>
