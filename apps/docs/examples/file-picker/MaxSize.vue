<script setup lang="ts">
import { ref } from 'vue'
import { VFilePicker, type FilePickerRejection } from 'vectis-ui'

const files = ref<File[]>([])
const refused = ref('')

function onReject({ file }: FilePickerRejection) {
  refused.value = `${file.name} was turned away: 500 kB at most per file.`
}
</script>

<template>
  <div class="column">
    <VFilePicker
      v-model="files"
      multiple
      :max-size="500_000"
      preview="bottom"
      title="Up to 500 kB per file"
      subtitle="Each file is weighed on its own, so a small one still gets through"
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
