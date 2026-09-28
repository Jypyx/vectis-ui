<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'
import { cloud_upload as cloudUpload } from 'vectis-ui/icons'
</script>

<template>
  <div class="demo">
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'warning', message: 'Your session expires in 5 minutes.' })"
    >
      From the tone
    </VButton>

    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'success', icon: cloudUpload, message: 'Backup finished.' })"
    >
      A custom icon
    </VButton>

    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'accent', icon: false, message: 'Three new comments.' })"
    >
      No icon
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
