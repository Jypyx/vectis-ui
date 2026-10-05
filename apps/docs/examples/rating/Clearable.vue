<script setup lang="ts">
import { ref } from 'vue'
import { VRating, VTypography } from 'vectis-ui'

const rating = ref<number | null>(4)
</script>

<template>
  <div class="demo">
    <VRating v-model="rating" label="Delivery" clearable />
    <VTypography variant="body-sm" tone="muted">Value: {{ rating ?? 'null' }}</VTypography>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-3);
}
</style>
