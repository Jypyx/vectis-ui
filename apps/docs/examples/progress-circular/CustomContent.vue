<script setup lang="ts">
import { VIcon, VProgressCircular, VTypography } from 'vectis-ui'
import { check } from 'vectis-ui/icons'
</script>

<template>
  <div class="row">
    <div class="cell">
      <VProgressCircular :value="65" :size="96" show-value aria-label="Upload" />
      <VTypography variant="caption" tone="muted">showValue</VTypography>
    </div>

    <!-- The slot replaces the percentage and receives the value, the max and the
         percentage worked out from them. It sits in the hole of the ring, on the page
         background, so it takes the page's own text colour. -->
    <div class="cell">
      <VProgressCircular :value="7" :max="12" :size="96" aria-label="Files uploaded">
        <template #default="{ value, max }">
          <span class="count">{{ value }}/{{ max }}</span>
        </template>
      </VProgressCircular>
      <VTypography variant="caption" tone="muted">A count</VTypography>
    </div>

    <div class="cell">
      <VProgressCircular :value="100" :size="96" tone="success" aria-label="Upload finished">
        <VIcon :name="check" :size="32" />
      </VProgressCircular>
      <VTypography variant="caption" tone="muted">An icon</VTypography>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-6);
}
.cell {
  display: grid;
  justify-items: center;
  gap: var(--vectis-space-2);
}
.count {
  font-variant-numeric: tabular-nums;
}
</style>
