<script setup lang="ts">
import { ref } from 'vue'
import { VTimePicker, VTypography } from 'vectis-ui'

/* Two faces, one value: half past seven in the evening is 19:30 on either of them. */
const twelve = ref<string | null>('19:30')
const twentyFour = ref<string | null>('19:30')
</script>

<template>
  <div class="row">
    <div class="group">
      <VTypography variant="overline" tone="muted">format 12h</VTypography>
      <VTimePicker v-model="twelve" format="12h" />
    </div>

    <div class="group">
      <VTypography variant="overline" tone="muted">format 24h</VTypography>
      <VTimePicker v-model="twentyFour" format="24h" />
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
