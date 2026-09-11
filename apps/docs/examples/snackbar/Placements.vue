<script setup lang="ts">
import { VButton, snackbar, type SnackbarPlacement } from 'vectis-ui'

const placements: SnackbarPlacement[] = ['bottom-left', 'bottom-center', 'bottom-right']
</script>

<template>
  <!-- Raised into the <VSnackbar /> mounted once at the root of the application. -->
  <div class="demo">
    <!-- Along the bottom edge and nowhere else: a confirmation belongs where it is out
         of the content's way and close to what the reader was doing. Set on the
         VSnackbar it is the default for every bar; passed here it is this bar's own. -->
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
