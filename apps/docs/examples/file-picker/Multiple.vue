<script setup lang="ts">
import { ref } from 'vue'
import { VFilePicker, type FileRejection } from 'vectis-ui'

const one = ref<File[]>([])
const several = ref<File[]>([])

/* The component turns a file away and says so; showing why is the consumer's job, here
   and for every other limit. */
const refused = ref('')

function onReject({ file }: FileRejection) {
  refused.value = `${file.name} was turned away: this zone takes one file.`
}
</script>

<template>
  <div class="column">
    <VFilePicker
      v-model="one"
      preview="bottom"
      title="One file"
      subtitle="Drop two and the second is refused"
      @reject="onReject"
    />
    <p v-if="refused" class="value">{{ refused }}</p>

    <VFilePicker
      v-model="several"
      multiple
      preview="bottom"
      title="As many as you like"
      subtitle="multiple, with nothing else to bound it"
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
.value {
  margin: 0;
  font-size: var(--vectis-text-body-sm-size);
  color: var(--vectis-color-danger-text);
}
</style>
