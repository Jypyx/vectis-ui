<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <VButton
      variant="outline"
      tone="neutral"
      @click="snackbar({ message: 'Conversation archived.', action: () => {} })"
    >
      Archive
    </VButton>

    <VButton
      variant="outline"
      tone="danger"
      @click="
        snackbar({
          tone: 'danger',
          message: 'Could not save your changes.',
          actionText: 'Retry',
          action: () => {},
        })
      "
    >
      Failing action
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
