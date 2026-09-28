<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'
</script>

<template>
  <div class="demo">
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'accent', message: 'Gone in 2 seconds.', duration: 2000 })"
    >
      2 seconds
    </VButton>

    <VButton
      variant="outline"
      tone="neutral"
      @click="
        toast({
          tone: 'warning',
          title: 'Take your time',
          message: 'Gone in 10 seconds, unless the pointer rests on it.',
          duration: 10000,
        })
      "
    >
      10 seconds
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
