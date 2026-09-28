<script setup lang="ts">
import { VButton, snackbar, type SnackbarPlacement } from 'vectis-ui'

const placements: SnackbarPlacement[] = ['bottom-left', 'bottom-center', 'bottom-right']
</script>

<template>
  <div class="demo">
    <VButton
      v-for="placement in placements"
      :key="placement"
      variant="outline"
      tone="neutral"
      @click="snackbar({ placement, message: `Raised at ${placement}.`, action: () => {} })"
    >
      {{ placement }}
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
