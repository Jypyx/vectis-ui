<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <VButton
      variant="outline"
      tone="neutral"
      @click="snackbar({ message: 'Gone in 1.5 seconds.', duration: 1500, action: () => {} })"
    >
      1.5 seconds
    </VButton>

    <VButton
      variant="outline"
      tone="neutral"
      @click="snackbar({ message: 'Gone in 8 seconds.', duration: 8000, action: () => {} })"
    >
      8 seconds
    </VButton>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-3);
}
</style>
