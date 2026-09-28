<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'

const LONG =
  'The export finished with 3 warnings. Rows 12, 48 and 91 were skipped because their reference column was empty.'
</script>

<template>
  <div class="demo">
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'warning', title: 'Export finished', message: LONG })"
    >
      Default width
    </VButton>

    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'warning', title: 'Export finished', message: LONG, width: '32rem' })"
    >
      32rem
    </VButton>

    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'accent', message: 'Saved.', width: '14rem' })"
    >
      14rem
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
