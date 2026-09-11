<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'
</script>

<template>
  <!-- Raised into the <VToaster /> mounted once at the root of the application. -->
  <div class="demo">
    <!-- Five seconds by default, and every notification may ask for its own. The
         countdown holds while the pointer rests anywhere on the stack, so something
         that disappears on a clock can be read to the end. -->
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
