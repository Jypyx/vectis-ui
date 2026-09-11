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
  <!-- Raised into the <VToaster /> mounted once at the root of the application. -->
  <div class="demo">
    <!-- Six corners, each with a stack of its own, so notifications aimed at different
         ones never queue behind each other. Set on the VToaster the placement is the
         default for every notification; passed here it is this one's alone. -->
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
