<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'
</script>

<template>
  <div class="demo">
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
