<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'
</script>

<template>
  <!-- Raised into the <VSnackbar /> mounted once at the root of the application. -->
  <div class="demo">
    <!-- Four seconds by default, shorter than a notification's: the reader already
         knows what the bar says, having just done it. The countdown holds while the
         pointer rests on the bar and while the keyboard is inside it, so an action
         being reached for is never taken away mid-reach. -->
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
