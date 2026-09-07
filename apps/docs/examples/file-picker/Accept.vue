<script setup lang="ts">
import { ref } from 'vue'
import { VFilePicker, type FileRejection } from 'vectis-ui'

const files = ref<File[]>([])
const refused = ref('')

function onReject({ file }: FileRejection) {
  refused.value = `${file.name} was turned away: images and PDF only.`
}
</script>

<template>
  <div class="column">
    <VFilePicker
      v-model="files"
      multiple
      accept="image/*,.pdf"
      preview="bottom"
      title="Images and PDF"
      subtitle="Browse and the dialog offers nothing else; drop and the rule is applied again"
      @reject="onReject"
    />
    <p v-if="refused" class="value">{{ refused }}</p>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
.value {
  margin: 0;
  font-size: var(--vectis-text-body-sm-size);
  color: var(--vectis-color-danger-text);
}
</style>
