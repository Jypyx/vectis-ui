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
/* `justify-items: start` keeps each row as wide as its own label: the clickable area is
   the whole <label>, so a stretched row would be clickable well past its text. */
.stack {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
</style>
