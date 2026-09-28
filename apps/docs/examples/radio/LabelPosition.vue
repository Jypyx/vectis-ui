<script setup lang="ts">
import { ref } from 'vue'
import { VRadio } from 'vectis-ui'

const side = ref('end')
</script>

<template>
  <div class="stack">
    <VRadio v-model="side" name="label-side" value="end">Label after the dot, the default</VRadio>
    <VRadio v-model="side" name="label-side" value="start" label-position="start">
      Label before the dot
    </VRadio>
  </div>
</template>

<style scoped>
/* Keep the clickable label from stretching across the grid. */
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
</style>
