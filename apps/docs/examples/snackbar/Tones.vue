<script setup lang="ts">
import { VButton, snackbar } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <!--
      Two tones and deliberately no more: a confirmation says either "done" or "that did not
      work". Success, warning and the accent are states, which a notification reports.
    -->
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
