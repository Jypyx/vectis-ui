<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput } from 'vectis-ui'

const one = ref<File[]>([])
const several = ref<File[]>([])
</script>

<template>
  <div class="column">
    <VFileInput
      v-model="one"
      label="One file, the default"
      hint="Drop two and the second is turned away"
    />

    <VFileInput
      v-model="several"
      multiple
      display="chip"
      counter
      label="Several files"
      hint="The model is a File array either way, so nothing downstream has to branch"
    />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
