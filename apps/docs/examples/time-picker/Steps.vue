<script setup lang="ts">
import { ref } from 'vue'
import { VTimePicker, VTypography } from 'vectis-ui'

const anyMinute = ref<string | null>('09:37')
const quarters = ref<string | null>('09:45')
</script>

<template>
  <div class="row">
    <div class="group">
      <VTypography variant="overline" tone="muted">Every minute, the default</VTypography>
      <VTimePicker v-model="anyMinute" />
    </div>

    <div class="group">
      <VTypography variant="overline" tone="muted">Quarter hours</VTypography>
      <VTimePicker v-model="quarters" :minute-step="15" />
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
