<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput, type FileRejection } from 'vectis-ui'

const files = ref<File[]>([])
const refused = ref<FileRejection[]>([])

/* One event per file, so a batch drop is reported precisely rather than as a single
   "something went wrong". The wording is yours: the component never writes it. */
const reasons: Record<string, string> = {
  type: 'wrong kind of file',
  size: 'too big on its own',
  count: 'too many files',
  'total-size': 'too much altogether',
}

function onReject(rejection: FileRejection) {
  refused.value = [rejection, ...refused.value].slice(0, 4)
}
</script>

<template>
  <div class="column">
    <VFileInput
      v-model="files"
      accept="image/*,.pdf"
      :max-size="500_000"
      multiple
      display="chip"
      label="Receipts"
      hint="Images and PDFs, 500 kB each at most"
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
