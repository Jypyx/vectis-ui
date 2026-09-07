<script setup lang="ts">
import { ref } from 'vue'
import { VFilePicker, type FileRejection } from 'vectis-ui'

const files = ref<File[]>([])
const refused = ref('')

/* The reason says which rule was met, and the two here are not the same failure: one
   batch too heavy, or one file too many. */
function onReject({ file, reason }: FileRejection) {
  refused.value =
    reason === 'count'
      ? `${file.name} was turned away: three files at most.`
      : `${file.name} was turned away: 1 MB for the whole selection.`
}
</script>

<template>
  <div class="column">
    <VFilePicker
      v-model="files"
      multiple
      :max-total-size="1_000_000"
      :max-files="3"
      preview="bottom"
      title="1 MB in all, three files at most"
      subtitle="What is already in the list counts towards the total"
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
