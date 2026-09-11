<script setup lang="ts">
import { VInputOTP, VTypography } from 'vectis-ui'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="column">
    <div v-for="size in sizes" :key="size" class="row">
      <VInputOTP :length="4" :size="size" :label="`Code, ${size}`" />
      <VTypography variant="caption" tone="muted">{{ size }}</VTypography>
    </div>

    <!-- Compact takes 4px off the boxes and leaves the text where it was. -->
    <div v-for="size in sizes" :key="`${size}-compact`" class="row">
      <VInputOTP :length="4" :size="size" compact :label="`Code, ${size} compact`" />
      <VTypography variant="caption" tone="muted">{{ size }} compact</VTypography>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-4);
}
.row {
  display: flex;
  align-items: center;
  gap: var(--vectis-space-4);
}
</style>
