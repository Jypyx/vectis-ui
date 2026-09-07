<script setup lang="ts">
import { ref } from 'vue'
import { VFilePicker } from 'vectis-ui'

const plain = ref<File[]>([])
const described = ref<File[]>([])
</script>

<template>
  <div class="column">
    <VFilePicker v-model="plain" title="Drop your files here" />

    <VFilePicker
      v-model="described"
      multiple
      accept="image/*,.pdf"
      :max-size="5_000_000"
      title="Drop your files here"
      subtitle="Images or PDF, up to 5 MB each"
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
