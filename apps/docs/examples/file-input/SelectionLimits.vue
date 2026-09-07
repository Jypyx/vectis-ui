<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput, type FileInputRejection } from 'vectis-ui'

const files = ref<File[]>([])
const refused = ref<FileInputRejection[]>([])

const reasons: Record<string, string> = {
  type: 'wrong kind of file',
  size: 'too big on its own',
  count: 'that would be a fourth file',
  'total-size': 'that would take the batch over 1 MB',
}

function onReject(rejection: FileInputRejection) {
  refused.value = [rejection, ...refused.value].slice(0, 4)
}
</script>

<template>
  <div class="column">
    <VFileInput
      v-model="files"
      :max-files="3"
      :max-total-size="1_000_000"
      multiple
      display="chip"
      counter
      clearable
      label="Invoices"
      hint="Three files at most, 1 MB altogether"
      @reject="onReject"
    />

    <output v-if="refused.length" class="refused" aria-label="Files turned away">
      <span v-for="item in refused" :key="item.file.name + item.reason">
        {{ item.file.name }}: {{ reasons[item.reason] }}
      </span>
    </output>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-3);
  max-inline-size: 26rem;
}
.refused {
  display: grid;
  gap: var(--vectis-space-1);
  font-size: var(--vectis-text-body-sm-size);
  color: var(--vectis-color-danger-text);
}
</style>
