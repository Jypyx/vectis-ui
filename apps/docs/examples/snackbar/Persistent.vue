<script setup lang="ts">
import { ref } from 'vue'
import { VButton, dismissSnackbar, snackbar } from 'vectis-ui'

const id = ref<number | null>(null)

function raise() {
  // A stale ID cannot dismiss a replacement message.
  id.value = snackbar({ message: 'Stays until you take it away.', duration: 0 })
}
</script>

<template>
  <div class="demo">
    <VButton variant="outline" tone="neutral" @click="raise">Raise</VButton>

    <VButton variant="outline" tone="neutral" @click="dismissSnackbar(id ?? undefined)">
      Dismiss
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
