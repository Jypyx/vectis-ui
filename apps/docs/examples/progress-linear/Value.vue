<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VProgressLinear, VTypography } from 'vectis-ui'

const value = ref(40)
const step = (delta: number) => (value.value += delta)
</script>

<template>
  <div class="column">
    <VProgressLinear :value="value" label="Upload" show-value />

    <div class="row">
      <VButton variant="outline" tone="neutral" size="sm" @click="step(-25)">-25</VButton>
      <VButton variant="outline" tone="neutral" size="sm" @click="step(25)">+25</VButton>
      <VTypography variant="body-sm" tone="muted">value = {{ value }}, max = 100</VTypography>
    </div>

    <VProgressLinear :value="7" :max="12" label="7 of 12 files, max = 12" show-value />
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
</style>
