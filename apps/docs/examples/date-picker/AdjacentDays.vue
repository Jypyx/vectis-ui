<script setup lang="ts">
import { ref } from 'vue'
import { VDatePicker, VTypography } from 'vectis-ui'

const hidden = ref('2026-06-10')
const shown = ref('2026-06-10')
const selectable = ref('2026-06-10')
</script>

<template>
  <div class="row">
    <div class="group">
      <VTypography variant="overline" tone="muted">hidden, the default</VTypography>
      <VDatePicker v-model="hidden" />
    </div>

    <div class="group">
      <VTypography variant="overline" tone="muted">shown</VTypography>
      <VDatePicker v-model="shown" show-adjacent-days />
    </div>

    <div class="group">
      <VTypography variant="overline" tone="muted">shown and choosable</VTypography>
      <VDatePicker v-model="selectable" select-adjacent-days />
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--vectis-space-6);
}
.group {
  display: grid;
  gap: var(--vectis-space-2);
}
</style>
