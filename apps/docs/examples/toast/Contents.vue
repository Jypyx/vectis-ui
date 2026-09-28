<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'success', message: 'Changes saved.' })"
    >
      Message only
    </VButton>

    <VButton
      variant="outline"
      tone="neutral"
      @click="
        toast({
          tone: 'danger',
          title: 'Upload failed',
          message: 'invoice-2481.pdf is larger than the 10 MB limit.',
        })
      "
    >
      Title and message
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
