<script setup lang="ts">
import { VButton, toast, type ToastPlacement } from 'vectis-ui'

const placements: ToastPlacement[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]
</script>

<template>
  <div class="demo">
    <VButton
      v-for="placement in placements"
      :key="placement"
      variant="outline"
      tone="neutral"
      @click="toast({ placement, message: `Raised at ${placement}.` })"
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
