<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'
</script>

<template>
  <!-- Raised into the <VSnackbar /> mounted once at the root of the application. -->
  <div class="demo">
    <!-- There is at most one bar. Raising a second replaces the first on the spot and
         restarts the countdown from the top, which is what separates a confirmation
         from a notification: two states can be true at once, but only the last action
         a reader took is worth offering to undo. -->
    <VButton
      variant="outline"
      tone="neutral"
      @click="snackbar({ message: 'Message deleted.', duration: 0, action: () => {} })"
    >
      Delete
    </VButton>

    <VButton
      variant="outline"
      tone="neutral"
      @click="snackbar({ message: 'Conversation archived.', duration: 0, action: () => {} })"
    >
      Archive
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
