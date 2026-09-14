<script setup lang="ts">
import { VIcon, VTypography } from 'vectis-ui'
import { arrow_right_alt as arrowRight, chevron_left as chevronLeft, search } from 'vectis-ui/icons'
</script>

<template>
  <div class="stack">
    <div v-for="dir in ['ltr', 'rtl']" :key="dir" :dir="dir" class="row">
      <VTypography variant="caption" tone="muted">{{ dir }}</VTypography>
      <VIcon :name="chevronLeft" :size="28" mirrored />
      <VIcon :name="arrowRight" :size="28" mirrored />
      <!-- A magnifier means the same thing in both directions, so it takes no flip. -->
      <VIcon :name="search" :size="28" />
    </div>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-4);
}
.row {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-4);
}
</style>
