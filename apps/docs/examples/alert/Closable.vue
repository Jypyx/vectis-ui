<script setup lang="ts">
import { ref } from 'vue'
import { VAlert, VButton } from 'vectis-ui'

const open = ref(true)
</script>

<template>
  <div class="demo">
    <VAlert v-model:open="open" class="alert" closable title="Scheduled maintenance">
      The service will be unavailable on Sunday from 2:00 to 4:00.
    </VAlert>
    <VButton v-if="!open" variant="outline" tone="neutral" @click="open = true">
      Show the alert again
    </VButton>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--vectis-space-3);
}

.alert {
  align-self: stretch;
}
</style>
